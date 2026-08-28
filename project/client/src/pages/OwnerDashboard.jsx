import { Link } from 'react-router-dom';
import Analytics from './Analytics';

export default function OwnerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Owner Dashboard</h1>
        <p className="mt-2 text-slate-500">Manage and monitor Peer Project Hub.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Link to="/" className="bg-white border rounded-xl p-6 hover:shadow-md"><h2 className="font-semibold">Project Feed</h2><p className="text-sm text-slate-500 mt-1">Review all projects.</p></Link>
        <Link to="/projects/new" className="bg-white border rounded-xl p-6 hover:shadow-md"><h2 className="font-semibold">Create Project</h2><p className="text-sm text-slate-500 mt-1">Add a project as owner.</p></Link>
        <Link to="/profile" className="bg-white border rounded-xl p-6 hover:shadow-md"><h2 className="font-semibold">My Profile</h2><p className="text-sm text-slate-500 mt-1">Manage owner profile.</p></Link>
      </div>
      <Analytics />
    </div>
  );
}
