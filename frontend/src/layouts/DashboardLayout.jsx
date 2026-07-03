import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LayoutDashboard, Library, Bot, HelpCircle, LayoutList, Calendar, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/documents', label: 'Library', icon: Library },
  { path: '/tutor', label: 'AI Tutor', icon: Bot },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/flashcards', label: 'Flashcards', icon: LayoutList },
  { path: '/study-plans', label: 'Study Plans', icon: Calendar },
  { path: '/coding-coach', label: 'Coding Coach', icon: Code },
];

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-text-primary font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Navy */}
      <aside className={`w-64 bg-sidebar text-white flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-50 md:relative md:z-20 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-20 flex items-center border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-accent bg-clip-text text-transparent">
            EduGen AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setMobileSidebarOpen(false)}
                className={`relative px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar - White */}
        <header className="h-20 bg-surface border-b border-border px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden text-text-secondary hover:text-primary"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 border-l border-border pl-6 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors focus:outline-none"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-10 w-10 rounded-full border border-primary/20 shadow-sm" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shadow-sm uppercase">
                    {user?.name?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-text-primary leading-tight truncate w-32">{user?.name || 'Student'}</p>
                  <p className="text-xs text-text-secondary capitalize">{user?.role || 'User'}</p>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border shadow-lg rounded-xl overflow-hidden z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-3 text-sm text-text-primary hover:bg-slate-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-3 text-sm text-danger hover:bg-red-50 transition-colors border-t border-border"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children || (
             <div className="glass-panel p-8">
               <h3 className="text-xl font-semibold mb-4">Welcome back, Student!</h3>
               <p className="text-text-secondary">Your AI learning journey continues here.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
