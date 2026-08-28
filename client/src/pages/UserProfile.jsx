import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import { Avatar } from '../components/ProjectCard';

export default function UserProfile() {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/users/${uid}`)
      .then((res) => {
        if (cancelled) return;
        setUser(res.data.data.user);
        setProjects(res.data.data.projects);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'User not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-40"></div>
            <div className="h-3 bg-slate-100 rounded w-56"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center py-16 bg-white rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">{error || 'User not found'}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Avatar user={user} size="w-16 h-16" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {user.displayName}
            </h1>
            {user.bio ? (
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-400 italic">This developer has no bio yet.</p>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Joined {new Date(user.createdAt).toLocaleDateString()} &middot;{' '}
              {projects.length} project{projects.length !== 1 ? 's' : ''} shared
            </p>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Posted Projects</h2>
      {projects.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400 bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center">
          No projects shared yet.
        </p>
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
