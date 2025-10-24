import React from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  // Main statistics - replace with real API data
  const stats = [
    {
      name: 'Total Classes',
      value: '24',
      change: '+2 from last week',
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/classes',
    },
    {
      name: 'Active Staff',
      value: '12',
      change: '+1 this month',
      icon: UserGroupIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      link: '/staff',
    },
    {
      name: 'Total Enrollments',
      value: '487',
      change: '+15% from last month',
      icon: CalendarIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/enrollments',
    },
    {
      name: 'Active Users',
      value: '1,284',
      change: '+8% from last month',
      icon: UsersIcon,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/users',
    },
  ];

  const quickActions = [
    { label: 'Create Class', link: '/classes/create', icon: '📝' },
    { label: 'View Classes', link: '/classes', icon: '📚' },
    { label: 'Manage Staff', link: '/staff', icon: '👥' },
    { label: 'Enrollments', link: '/enrollments', icon: '📊' },
  ];

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <Link to={stat.link} className="block group">
        <div className={`${stat.bgColor} rounded-xl border border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-lg transition-all duration-300 p-6 cursor-pointer transform group-hover:scale-105 group-hover:-translate-y-1`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {stat.value}
              </p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const QuickActionButton = ({ action }) => (
    <Link
      to={action.link}
      className="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
    >
      <span className="mr-2">{action.icon}</span>
      {action.label}
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Welcome to GymXFit Admin Panel
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionButton key={action.label} action={action} />
          ))}
        </div>
      </div>

      {/* Coming Soon Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Activity Log
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Recent activity tracking coming soon
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🗓️ Upcoming Classes
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            View in the Classes management section
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;