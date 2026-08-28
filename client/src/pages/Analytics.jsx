import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/analytics')
      .then((res) => {
        if (!cancelled) setStats(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="h-3 bg-slate-100 rounded w-24"></div>
              <div className="mt-3 h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        {error}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Community Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Projects" value={stats.totalProjects} accent="text-indigo-600" />
        <StatCard label="Total Users" value={stats.totalUsers} accent="text-emerald-600" />
        <StatCard label="Total Likes" value={stats.totalLikes} accent="text-red-500" />
        <StatCard label="Total Comments" value={stats.totalComments} accent="text-amber-500" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Most Liked Project
          </h2>
          {stats.mostLikedProject ? (
            <div className="mt-3">
              <Link
                to={`/projects/${stats.mostLikedProject._id}`}
                className="text-lg font-semibold text-indigo-600 hover:underline"
              >
                {stats.mostLikedProject.title}
              </Link>
              <p className="mt-1 text-sm text-slate-500">
                by {stats.mostLikedProject.ownerName} &middot; {stats.mostLikedProject.likeCount}{' '}
                like{stats.mostLikedProject.likeCount !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No projects yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Top Tags
          </h2>
          {stats.topTags.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {stats.topTags.map((t) => (
                <li key={t.tag} className="flex items-center justify-between text-sm">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                    {t.tag}
                  </span>
                  <span className="text-slate-500">
                    {t.count} project{t.count !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No tags yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
