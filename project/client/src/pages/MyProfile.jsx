import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/authContext';import ProjectCard from '../components/ProjectCard';
import { Avatar } from '../components/ProjectCard';

export default function MyProfile() {
  const { profile, updateProfileState } = useAuth();
  const [projects, setProjects] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setProjectsLoading(true);
    api
      .get('/projects', { params: { ownerUid: profile.firebaseUid, limit: 50 } })
      .then((res) => {
        if (!cancelled) setProjects(res.data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const res = await api.put('/auth/me', { displayName: displayName.trim(), bio });
      updateProfileState(res.data.data);
      setSavedMsg('Profile updated');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar user={{ ...profile, photoURL: profile.photoURL }} size="w-16 h-16" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.displayName}</h1>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
              Bio <span className="text-slate-400 text-xs">({bio.length}/500)</span>
            </label>
            <textarea
              id="bio"
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself and your tech stack..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {savedMsg && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {savedMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        My Projects ({projects.length})
      </h2>
      {projectsLoading ? (
        <p className="mt-4 text-sm text-slate-400">Loading your projects...</p>
      ) : projects.length === 0 ? (
        <div className="mt-4 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">You have not shared any projects yet.</p>
          <Link
            to="/projects/new"
            className="inline-block mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
          >
            Share your first project
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
