import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchUsers, useDeactivateUser, useActivateUser } from '../../hooks/useFetchUsers';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const UsersListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: usersResponse, isLoading, error, refetch } = useFetchUsers({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  });

  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination || {};

  const handleDeactivate = async (userId, userName) => {
    if (confirm(`Are you sure you want to deactivate ${userName}?`)) {
      try {
        await deactivateUser.mutateAsync(userId);
        refetch();
      } catch (err) {
        alert('Failed to deactivate user');
      }
    }
  };

  const handleActivate = async (userId, userName) => {
    if (confirm(`Are you sure you want to activate ${userName}?`)) {
      try {
        await activateUser.mutateAsync(userId);
        refetch();
      } catch (err) {
        alert('Failed to activate user');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const displayStatus = status || 'active';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[displayStatus] || statusStyles.active}`}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage gym members and user accounts
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/users/${user._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </Link>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivate(user._id, user.name)}
                          disabled={deactivateUser.isLoading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1 disabled:opacity-50"
                          title="Deactivate User"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user._id, user.name)}
                          disabled={activateUser.isLoading}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 inline-flex items-center gap-1 disabled:opacity-50"
                          title="Activate User"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-600">
            {users.filter(u => !u.isActive).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
