import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../utils/api';
import { Avatar } from './ProjectCard';

export default function CommentSection({ projectId }) {
  const { currentUser, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/projects/${projectId}/comments`)
      .then((res) => {
        if (!cancelled) setComments(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load comments');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/projects/${projectId}/comments`, { text });
      setComments([res.data.data, ...comments]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/projects/${projectId}/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Comments ({comments.length})
      </h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your feedback about this project... (all users can comment)"
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{text.length}/1000</span>
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Login
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const isOwn = profile && comment.author?._id === profile._id;
            return (
              <li key={comment._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar user={comment.author} size="w-8 h-8" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {comment.author?.displayName || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="shrink-0 text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
