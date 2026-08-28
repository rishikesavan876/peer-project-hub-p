import { Link } from 'react-router-dom';

function Avatar({ user, size = 'w-6 h-6' }) {
  if (user?.photoURL) {
    return <img src={user.photoURL} alt={user.displayName} className={`${size} rounded-full object-cover`} />;
  }
  const initial = (user?.displayName || 'A').charAt(0).toUpperCase();
  return (
    <span className={`${size} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold`}>
      {initial}
    </span>
  );
}

export default function ProjectCard({ project }) {
  const owner = project.owner || {};
  const rating = Math.round((project.averageRating || 0) * 10) / 10;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {project.title}
          </h3>
          {rating > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
              ★ {rating || ''}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{project.description}</p>

        {project.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 5 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">+{project.tags.length - 5}</span>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar user={owner} />
            <span className="truncate text-slate-500">{owner.displayName || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-slate-500">
            <span className="inline-flex items-center gap-1" title="Likes">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {project.likeCount || project.likes?.length || 0}
            </span>
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { Avatar };
