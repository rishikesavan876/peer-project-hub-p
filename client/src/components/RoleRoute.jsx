import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function RoleRoute({ allowedRole, children }) {
  const { currentUser, role, loading, roleError } = useAuth();
  const location = useLocation();

  if (loading || (currentUser && !role && !roleError)) {
    return <div className="p-8 text-center text-slate-500">Checking account role...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleError && !role) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <h1 className="font-semibold">Unable to load your role</h1>
        <p className="mt-2 text-sm">{roleError}</p>
        <p className="mt-3 text-sm">Check Firestore: users → your Firebase UID → role.</p>
      </div>
    );
  }

  const actualRole = role || 'user';
  if (actualRole !== allowedRole) {
    return <Navigate to={actualRole === 'owner' ? '/owner-dashboard' : '/dashboard'} replace />;
  }

  return children;
}
