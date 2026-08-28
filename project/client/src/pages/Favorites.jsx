import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';

export default function Favorites() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/favorites/my', { params: { page, limit: 9 } });
      setProjects(res.data.data);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Your Favorites</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Projects you saved for later</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="mt-3 h-3 bg-slate-100 rounded"></div>
              <div className="mt-2 h-3 bg-slate-100 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <h2 className="text-lg font-semibold text-slate-700">No favorites yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap the star button on a project to save it here
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pages}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
