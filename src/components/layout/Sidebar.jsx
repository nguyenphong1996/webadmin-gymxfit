import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Classes', href: '/classes', icon: AcademicCapIcon },
  { name: 'Enrollments', href: '/enrollments', icon: CalendarIcon },
  { name: 'Staff', href: '/staff', icon: UserGroupIcon },
  { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
        lg:translate-x-0 lg:pointer-events-auto lg:static lg:inset-auto lg:flex-shrink-0
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
        h-screen flex flex-col overflow-y-auto lg:min-h-screen
      `}>
        {/* Logo Header */}
        <div className={`flex items-center justify-between h-20 px-4 border-b border-gray-200 dark:border-gray-800`}>
          {!isCollapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              GymXFit
            </h1>
          )}
          {isCollapsed && (
            <h1 className="text-2xl font-bold text-blue-600">G</h1>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-2 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`
                  group flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${active
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Button & Theme Toggle */}
        <div className="mt-auto px-4 pb-4 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg font-medium text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            {darkMode ? '☀️' : '🌙'} {!isCollapsed && (darkMode ? 'Light' : 'Dark')}
          </button>

          {/* Collapse Button (Desktop only) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center px-3 py-2.5 rounded-lg font-medium text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
