import React, { useState } from 'react';
import { useFetchEnrollments, useApproveEnrollment, useRejectEnrollment, useCancelEnrollment } from '../../hooks/useFetchEnrollments';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const EnrollmentsListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: enrollmentsResponse, isLoading, error, refetch } = useFetchEnrollments({
    page,
    limit: 10,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const approveEnrollment = useApproveEnrollment();
  const rejectEnrollment = useRejectEnrollment();
  const cancelEnrollment = useCancelEnrollment();

  const enrollments = enrollmentsResponse?.data || [];
  const pagination = enrollmentsResponse?.pagination || {};

  const handleApprove = async (enrollmentId) => {
    if (confirm('Approve this enrollment?')) {
      await approveEnrollment.mutateAsync(enrollmentId);
    }
  };

  const handleReject = async (enrollmentId) => {
    if (confirm('Reject this enrollment?')) {
      await rejectEnrollment.mutateAsync(enrollmentId);
    }
  };

  const handleCancel = async (enrollmentId) => {
    if (confirm('Cancel this enrollment?')) {
      await cancelEnrollment.mutateAsync(enrollmentId);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
        <p className="text-sm text-red-800 dark:text-red-200">Failed to load enrollments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage student enrollments in classes
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <input
            type="text"
            placeholder="Search by student name, email, or class..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {enrollments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No enrollments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Enrollment Date
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
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {enrollment.userId?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {enrollment.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {enrollment.classId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {enrollment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(enrollment._id)}
                            disabled={approveEnrollment.isLoading}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(enrollment._id)}
                            disabled={rejectEnrollment.isLoading}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {enrollment.status === 'approved' && (
                        <button
                          onClick={() => handleCancel(enrollment._id)}
                          disabled={cancelEnrollment.isLoading}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <ClockIcon className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                      {['rejected', 'cancelled', 'completed'].includes(enrollment.status) && (
                        <span className="text-gray-500 dark:text-gray-400">No actions</span>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {enrollments.filter(e => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {enrollments.filter(e => e.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {enrollments.filter(e => e.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsListPage;
