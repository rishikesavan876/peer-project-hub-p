import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Checking login...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
