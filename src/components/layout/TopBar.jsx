import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.phone || 'User';
  const displayRole = user?.role || 'admin';
  const avatarUrl = user?.avatar?.url || user?.avatarUrl || (typeof user?.avatar === 'string' ? user.avatar : null);
  const avatarFallback = (displayName || 'A').charAt(0).toUpperCase();

  return (
    <header className="w-full sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Left side - Title */}
          <div className="flex-1 flex items-center pl-4 lg:pl-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-6">
            {/* User info */}
            <div className="flex items-center space-x-3 border-r border-gray-200 dark:border-gray-700 pr-6">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {displayRole}
                </div>
              </div>

              {/* Avatar */}
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  avatarFallback
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
