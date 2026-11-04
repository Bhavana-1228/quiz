import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Flame, 
  Sparkles, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Languages', path: '/languages', icon: BookOpen },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isQuizActive = location.pathname.startsWith('/quiz/') && location.pathname !== '/quiz/setup';

  return (
    <>
      {/* Top Navigation Bar (Desktop & Tablet) */}
      <header className="sticky top-0 z-40 w-full bg-[#10182B] border-b border-[#1E2C48] text-white shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7657F6] to-[#39C6D8] flex items-center justify-center shadow-lg shadow-[#7657F6]/30 group-hover:scale-105 transition-transform">
              <span className="font-mono font-bold text-white text-lg tracking-tighter">CQ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-white font-mono flex items-center gap-1.5">
                CODEQUEST
                <span className="inline-block w-2 h-2 rounded-full bg-[#39C6D8] animate-pulse"></span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#18243E] text-[#39C6D8] shadow-inner font-semibold border border-[#233354]'
                        : 'text-gray-300 hover:text-white hover:bg-[#141E34]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User & Actions Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Streak & XP Badges */}
                <div className="hidden sm:flex items-center gap-2.5">
                  <div 
                    title={`${user.streak} day streak! Keep practicing daily.`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
                  >
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{user.streak} d</span>
                  </div>
                  <div 
                    title={`${user.xp} XP total earned`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7657F6]/15 border border-[#7657F6]/30 text-[#A28BFA] text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#39C6D8]" />
                    <span>{user.xp} XP</span>
                  </div>
                </div>

                {/* Quick Start Quiz Button */}
                {!isQuizActive && (
                  <Link
                    to="/quiz/setup"
                    className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7657F6] to-[#603FEF] hover:shadow-lg hover:shadow-[#7657F6]/30 hover:scale-[1.02] transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Quiz</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#18243E] border border-transparent hover:border-[#233354] transition-all"
                  >
                    <img
                      src={user.avatar}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#7657F6]/50"
                    />
                    <span className="hidden sm:inline-block text-sm font-medium text-gray-200">
                      {user.display_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141E34] border border-[#233354] shadow-2xl p-2 z-50 text-gray-200 animate-fadeIn">
                      <div className="px-3 py-2.5 border-b border-[#233354]">
                        <p className="text-sm font-bold text-white">{user.display_name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center justify-between text-xs bg-[#0E1526] p-2 rounded-lg">
                          <span className="text-gray-400">Level {Math.floor(user.xp / 100) + 1}</span>
                          <span className="text-[#39C6D8] font-semibold">{user.xp % 100}/100 XP to next</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#1C2A48] text-gray-300 hover:text-white"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Settings & Preferences</span>
                        </Link>

                        <Link
                          to="/admin/review"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#1C2A48] text-gray-300 hover:text-white"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#39C6D8]" />
                          <span>AI Question Bank Admin</span>
                        </Link>

                        <button
                          onClick={() => setTheme(isDark ? 'light' : 'dark')}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#1C2A48] text-gray-300 hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                            <span>Appearance</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0E1526] text-gray-400">
                            {theme}
                          </span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-[#233354]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#7657F6] hover:bg-[#6543F4] transition-colors shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Page 10 Responsive Specs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#10182B] border-t border-[#1E2C48] px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? 'text-[#39C6D8]' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

