import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunIcon, MoonIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { userType, logout } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    if (!userType) return 'Civic Connect';
    if (location.pathname.includes('profile')) return 'My Profile';

    switch(userType) {
        case 'citizen': return 'Citizen Dashboard';
        case 'worker': return 'Worker Dashboard';
        case 'sanitation-officer': return 'Sanitation Officer Dashboard';
        case 'city-engineer': return 'City Engineer Dashboard';
        case 'deputy-commissioner': return 'Deputy Commissioner Dashboard';
        case 'municipal-commissioner': return 'Municipal Commissioner Dashboard';
        default: return 'Civic Connect';
    }
  };

  // Basic dark mode toggle for demonstration, doesn't persist
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const getProfileLink = () => {
    if (!userType) return '/';
    return `/${userType}/profile`;
  }

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-sky-500">
              Civic Connect
            </Link>
            <span className="ml-4 text-slate-500 dark:text-slate-400 font-semibold hidden md:block">
              | {getTitle()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              <SunIcon className="h-6 w-6 hidden dark:block" />
              <MoonIcon className="h-6 w-6 block dark:hidden" />
            </button>
            {userType && (
              <>
                <Link
                  to={getProfileLink()}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  aria-label="My Profile"
                >
                  <UserCircleIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-sky-500 dark:text-slate-300 dark:hover:text-sky-400"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;