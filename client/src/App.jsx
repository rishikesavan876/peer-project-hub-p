import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import Favorites from './pages/Favorites';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Analytics from './pages/Analytics';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
          <Navbar />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/dashboard" element={<RoleRoute allowedRole="user"><UserDashboard /></RoleRoute>} />
              <Route path="/owner-dashboard" element={<RoleRoute allowedRole="owner"><OwnerDashboard /></RoleRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                }
              />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route
                path="/projects/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/users/:uid" element={<UserProfile />} />
              <Route path="/analytics" element={<RoleRoute allowedRole="owner"><Analytics /></RoleRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-sm text-slate-500">
            Peer Project Hub &middot; Built with MERN + Firebase
          </footer>
        </div>
      </>
    </AuthProvider>
  );
}

export default App;
