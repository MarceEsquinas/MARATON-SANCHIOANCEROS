import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo className="h-10 w-auto" />
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 mr-6">
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                <UserIcon size={16} className="text-slate-500" />
                <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                  {user.email.split('@')[0]}
                </span>
              </div>
              
              <button 
                onClick={() => signOut()}
                className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Quijote Run. Planifica tu aventura.
        </div>
      </footer>
    </div>
  );
};
