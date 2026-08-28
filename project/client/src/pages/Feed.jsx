import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import SearchFilterBar from '../components/SearchFilterBar';
import { useAuth } from '../context/authContext';

export default function Feed() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/projects', {
        params: {
          page,
          limit: 9,
          ...(search && { q: search }),
          ...(tag && { tag }),
        },
      });
      setProjects(res.data.data);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, tag]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, search || tag ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchProjects, search, tag]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTagChange = (value) => {
    setTag(value);
    setPage(1);
  };

  const handleClear = () => {
    setSearch('');
    setTag('');
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Feed</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} project{total !== 1 ? 's' : ''} shared by the community
          </p>
        </div>
        {currentUser && (
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Share Project
          </Link>
        )}
      </div>

      <SearchFilterBar
        search={search}
        tag={tag}
        onSearchChange={handleSearchChange}
        onTagChange={handleTagChange}
        onClear={handleClear}
      />

      {error && (
        <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="mt-3 space-y-2">
                <div className="h-3 bg-slate-100 rounded"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                <div className="h-3 bg-slate-100 rounded w-4/6"></div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
                <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-10 text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <h2 className="text-lg font-semibold text-slate-700">No projects found</h2>
          <p className="mt-1 text-sm text-slate-500">
            {search || tag ? 'Try adjusting your search or filters' : 'Be the first to share a project'}
          </p>
          {!currentUser && !search && !tag && (
            <Link
              to="/signup"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
            >
              Sign up to post
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pages}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
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
