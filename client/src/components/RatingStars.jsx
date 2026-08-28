import { useState } from 'react';
import { useAuth } from '../context/authContext';
import api from '../utils/api';

export function Stars({ value = 0, size = 'w-5 h-5', className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= Math.round(value) ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function RatingStars({ projectId, averageRating = 0, ratingCount = 0, yourRating = null, onRated }) {
  const { currentUser } = useAuth();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(yourRating);
  const [avg, setAvg] = useState(averageRating);
  const [count, setCount] = useState(ratingCount);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (value) => {
    if (!currentUser) {
      setError('Login to rate this project');
      return;
    }
    setError('');
    setSubmitting(true);
    setSelected(value);
    try {
      const res = await api.put(`/projects/${projectId}/rating`, { value });
      setAvg(res.data.data.averageRating);
      setCount(res.data.data.ratingCount);
      onRated?.(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Stars value={avg} />
          <span className="text-sm font-medium text-slate-700">
            {avg > 0 ? avg.toFixed(1) : 'No ratings'}
          </span>
          <span className="text-xs text-slate-400">({count})</span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-1 pl-3 border-l border-slate-200" onMouseLeave={() => setHovered(0)}>
            <span className="text-xs text-slate-500 mr-1">Your rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={submitting}
                onMouseEnter={() => setHovered(star)}
                onClick={() => handleRate(star)}
                className="disabled:opacity-50"
                aria-label={`Rate ${star} star`}
              >
                <svg
                  className={`w-6 h-6 transition-colors ${
                    star <= (hovered || selected || 0) ? 'text-amber-400' : 'text-slate-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
