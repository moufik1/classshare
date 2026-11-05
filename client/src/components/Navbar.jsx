import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ClassShare
              </span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1">
                Espace Partagé
              </span>
            </div>
          </Link>

          {/* User info & Actions */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Lien vers la page de profil */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-slate-100 transition min-h-[44px] border border-transparent hover:border-slate-200"
                title="Mon profil"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-200 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-slate-700">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-red-50 transition min-h-[44px] min-w-[44px]"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
