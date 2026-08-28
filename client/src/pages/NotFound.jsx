import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto mt-10 text-center py-20">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you are looking for does not exist or was moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
      >
        Back to Feed
      </Link>
    </div>
  );
}
