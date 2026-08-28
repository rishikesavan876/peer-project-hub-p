import { useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import api from '../utils/api';
import { AuthContext } from './authContext';

const VALID_ROLES = new Set(['user', 'owner']);

export async function getUserRole(firebaseUser) {
  if (!firebaseUser) return null;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // New accounts are always normal users. Firestore rules also enforce this.
    await setDoc(
      userRef,
      {
        role: 'user',
        email: firebaseUser.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return 'user';
  }

  const storedRole = snapshot.data()?.role;
  return VALID_ROLES.has(storedRole) ? storedRole : 'user';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState('');

  const syncBackendProfile = useCallback(async (fbUser) => {
    try {
      const res = await api.post('/auth/sync');
      setProfile(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error('Backend profile sync failed:', error);
      // Firebase/Firestore authentication remains usable even if the API is temporarily down.
      setProfile(null);
      return null;
    }
  }, []);

  const signup = useCallback(async (displayName, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    // Create the Firestore role immediately so the first authenticated render is deterministic.
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        role: 'user',
        email: cred.user.email || email,
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userRole = await getUserRole(cred.user);
    setCurrentUser(cred.user);
    setRole(userRole);
    setRoleError('');
    await syncBackendProfile(cred.user);
    return { firebaseUser: cred.user, role: userRole };
  }, [syncBackendProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('pph_token');
    setCurrentUser(null);
    setProfile(null);
    setRole(null);
    setRoleError('');
  }, []);

  useEffect(() => {
    let roleUnsubscribe = null;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (roleUnsubscribe) {
        roleUnsubscribe();
        roleUnsubscribe = null;
      }

      setLoading(true);
      setCurrentUser(user);
      setRoleError('');

      if (!user) {
        setProfile(null);
        setRole(null);
        localStorage.removeItem('pph_token');
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        // First read guarantees navigation has the correct role immediately.
        const initialRole = await getUserRole(user);
        if (cancelled) return;
        setRole(initialRole);
        setRoleError('');
        setLoading(false);

        // Keep the role in sync if an owner/admin changes it in Firestore.
        const userRef = doc(db, 'users', user.uid);
        roleUnsubscribe = onSnapshot(
          userRef,
          async (snapshot) => {
            if (!snapshot.exists()) {
              setRole('user');
              setRoleError('');
              return;
            }
            const nextRole = snapshot.data()?.role;
            if (VALID_ROLES.has(nextRole)) {
              setRole(nextRole);
              setRoleError('');
            } else {
              setRole('user');
              setRoleError('Invalid role in Firestore. Using user role.');
            }
          },
          (error) => {
            console.error('Firestore role listener failed:', error);
            setRoleError(error?.code === 'permission-denied'
              ? 'Firestore permission denied. Check users/{UID} rules.'
              : 'Unable to listen for your account role.');
          }
        );

        // Backend sync is useful for MongoDB profile data but must not block dashboard routing.
        await syncBackendProfile(user);
      } catch (error) {
        console.error('Authentication setup failed:', error);
        setRole(null);
        setRoleError(
          error?.code === 'permission-denied'
            ? 'Firestore permission denied. Check users/{UID} and Firestore rules.'
            : error?.message || 'Unable to load your account role.'
        );
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (roleUnsubscribe) roleUnsubscribe();
      unsubscribeAuth();
    };
  }, [syncBackendProfile]);

  const value = {
    currentUser,
    profile,
    role,
    loading,
    roleError,
    signup,
    login,
    logout,
    refreshProfile: syncBackendProfile,
    updateProfileState: setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
