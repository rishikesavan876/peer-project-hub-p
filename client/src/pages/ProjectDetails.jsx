import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/authContext';
import { Avatar } from '../components/ProjectCard';
import RatingStars from '../components/RatingStars';
import CommentSection from '../components/CommentSection';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
      setLikeCount(res.data.data.likes?.length || 0);
      if (profile && res.data.data.likes?.some((u) => u === profile._id)) {
        setLiked(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, profile]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setLiked(false);
    fetchProject();
  }, [fetchProject]);

  const checkFavorite = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.get('/projects/favorites/my', { params: { limit: 50 } });
      setFavorited(res.data.data.some((p) => p._id === id));
    } catch {
      setFavorited(false);
    }
  }, [currentUser, id]);

  useEffect(() => {
    if (currentUser) checkFavorite();
  }, [checkFavorite, currentUser]);

  const requireAuth = () => {
    if (!currentUser) {
      setActionError('Please login first');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    setActionError('');
    try {
      const res = await api.post(`/projects/${id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleFavorite = async () => {
    if (!requireAuth()) return;
    setActionError('');
    try {
      const res = await api.post(`/projects/${id}/favorite`);
      setFavorited(res.data.favorited);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This also removes all its comments.')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/', { replace: true });
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-2/3"></div>
        <div className="mt-4 h-4 bg-slate-100 rounded w-1/3"></div>
        <div className="mt-8 space-y-3">
          <div className="h-4 bg-slate-100 rounded"></div>
          <div className="h-4 bg-slate-100 rounded"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center py-16 bg-white rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">{error || 'Project not found'}</h1>
        <Link to="/" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const ownerUid = project.owner?.firebaseUid;
  const isOwner = profile && project.owner?._id === profile._id;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <article className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.title}</h1>
            <p className="mt-2 text-xs text-slate-400">
              Posted on {new Date(project.createdAt).toLocaleDateString()}
              {project.createdAt !== project.updatedAt && ' (edited)'}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/projects/${id}/edit`}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <Link
          to={`/users/${ownerUid}`}
          className="mt-4 inline-flex items-center gap-2 group"
        >
          <Avatar user={project.owner} size="w-9 h-9" />
          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
            {project.owner?.displayName}
          </span>
        </Link>

        {project.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${tag}`}
                onClick={(e) => e.preventDefault()}
                className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 prose prose-slate max-w-none">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {project.description}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub Repo
          </a>
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Live Demo
            </a>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleLike}
              disabled={!currentUser}
              title={currentUser ? 'Like this project (all users)' : 'Login to like'}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                liked
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              } disabled:opacity-50`}
            >
              <svg
                className="w-5 h-5"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </button>

            <button
              onClick={handleFavorite}
              disabled={!currentUser}
              title={currentUser ? 'Save to favorites (all users)' : 'Login to favorite'}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                favorited
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              } disabled:opacity-50`}
            >
              <svg
                className="w-5 h-5"
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.673z" />
              </svg>
              {favorited ? 'Saved' : 'Favorite'}
            </button>
          </div>

          {actionError && <p className="text-sm text-red-500">{actionError}</p>}

          <RatingStars
            projectId={id}
            averageRating={project.averageRating}
            ratingCount={project.ratings?.length || 0}
          />
        </div>
      </article>

      <CommentSection projectId={id} />
    </div>
  );
}
