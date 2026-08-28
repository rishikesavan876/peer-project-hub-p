import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function UserDashboard() {
  const { currentUser, profile } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>
      <p className="mt-2 text-slate-500">Welcome, {profile?.displayName || currentUser?.email}.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Link to="/projects/new" className="bg-white border rounded-xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">Create Project</h2><p className="text-sm text-slate-500 mt-1">Share a new project.</p>
        </Link>
        <Link to="/favorites" className="bg-white border rounded-xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">Favorites</h2><p className="text-sm text-slate-500 mt-1">View saved projects.</p>
        </Link>
        <Link to="/profile" className="bg-white border rounded-xl p-6 hover:shadow-md">
          <h2 className="font-semibold text-lg">My Profile</h2><p className="text-sm text-slate-500 mt-1">Update your profile.</p>
        </Link>
      </div>
    </div>
  );
}
