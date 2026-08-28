import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { currentUser, profile, role, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              P
            </span>
            <span className="text-lg font-bold text-slate-900">PeerProjectHub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Feed
            </NavLink>
            {currentUser && !loading && role && (
              <>
                <NavLink to={role === 'owner' ? '/owner-dashboard' : '/dashboard'} className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/favorites" className={navLinkClass}>
                  Favorites
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  My Profile
                </NavLink>
              </>
            )}
            {currentUser && !loading && role === 'owner' && (
              <NavLink to="/analytics" className={navLinkClass}>
                Analytics
              </NavLink>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-200">
                <span className="text-sm text-slate-600 hidden lg:inline">
                  Hi, {profile?.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1 bg-white">
          <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
            Feed
          </NavLink>
          {currentUser && !loading && role && (
            <>
              <NavLink to={role === 'owner' ? '/owner-dashboard' : '/dashboard'} className={navLinkClass} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/favorites" className={navLinkClass} onClick={() => setOpen(false)}>
                Favorites
              </NavLink>
              <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>
                My Profile
              </NavLink>
            </>
          )}
          {currentUser && !loading && role === 'owner' && (
            <NavLink to="/analytics" className={navLinkClass} onClick={() => setOpen(false)}>
              Analytics
            </NavLink>
          )}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-slate-900 text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass} onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass} onClick={() => setOpen(false)}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
