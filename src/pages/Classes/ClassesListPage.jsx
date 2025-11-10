import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchClasses } from '../../hooks/useFetchClasses';
import TableWithActions from '../../components/common/TableWithActions';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const ClassesListPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    category: '',
    search: '',
  });

  const {
    data: classesData,
    isLoading,
    error,
    refetch,
  } = useFetchClasses(filters);

  // Table columns definition
  const columns = [
    {
      key: 'name',
      label: 'Class Name',
      render: (value, row) => (
        <div>
          <Link
            to={`/classes/${row._id}`}
            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            {value}
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.subcategory}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {value}
        </span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {row.currentEnrollment || 0} / {value}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${((row.currentEnrollment || 0) / value) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'startTime',
      label: 'Schedule',
      render: (value, row) => {
        const startDate = new Date(value);
        const endDate = new Date(row.endTime);
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white">
              {startDate.toLocaleDateString()}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      key: 'staffId',
      label: 'Instructor',
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {value?.name || 'Unassigned'}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {value?.phone || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'Draft' },
          scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Scheduled' },
          waiting_pt: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', label: 'Waiting PT' },
          on_going_waiting_customers: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', label: 'PT Ready' },
          on_going: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'In Session' },
          waiting_checkout: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', label: 'Waiting Checkout' },
          completed: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Completed' },
          expired: { color: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200', label: 'Expired' },
          overdue: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Overdue' },
          cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Cancelled' },
          full: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', label: 'Full Capacity' },
        };

        const fallbackLabel = value
          ? value
              .split('_')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ')
          : 'Unknown';

        const config = statusConfig[value] || {
          color: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
          label: fallbackLabel,
        };

        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
  ];

  // Action handlers
  const handleView = (classItem) => {
    // Navigate to detail page
    window.location.href = `/classes/${classItem._id}`;
  };

  const handleEdit = (classItem) => {
    window.location.href = `/classes/${classItem._id}/edit`;
  };

  // Filter renderer
  const renderFilters = (setShowFilters) => {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="waiting_pt">Waiting PT</option>
            <option value="on_going_waiting_customers">PT Ready</option>
            <option value="on_going">In Session</option>
            <option value="waiting_checkout">Waiting Checkout</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="workout">Workout</option>
            <option value="cardio">Cardio</option>
            <option value="stretching">Stretching</option>
            <option value="nutrition">Nutrition</option>
            <option value="yoga">Yoga</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Apply Filters
          </button>
        </div>
      </>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900 dark:border-red-800">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="text-lg font-medium">Error loading classes</h3>
          <p className="mt-2 text-sm">{error.message || 'Failed to load classes. Please try again.'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Classes Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your gym classes and schedules
          </p>
        </div>

        <div className="flex space-x-3">
          <Link
            to="/classes/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Class</span>
          </Link>
        </div>
      </div>

      {/* Classes Table */}
      <TableWithActions
        data={classesData?.data || []}
        columns={columns}
        pagination={classesData?.pagination}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        onSearch={(search) => setFilters(prev => ({ ...prev, search, page: 1 }))}
        onFilter={renderFilters}
        loading={isLoading}
      emptyMessage="No classes found. Create your first class to get started!"
      onEdit={handleEdit}
      onView={handleView}
      showActions={true}
    />
    </div>
  );
};

export default ClassesListPage;
