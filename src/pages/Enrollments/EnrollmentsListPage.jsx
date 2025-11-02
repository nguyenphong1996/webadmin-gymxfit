import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchClassEnrollments } from '../../hooks/useFetchEnrollments';
import { useFetchClasses } from '../../hooks/useFetchClasses';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const STATUS_LABELS = {
  active: { label: 'Active', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  completed: { label: 'Completed', style: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  cancelled: { label: 'Cancelled', style: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const EnrollmentsListPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const {
    data: classesResponse,
    isLoading: classesLoading,
    error: classesError,
  } = useFetchClasses({ page: 1, limit: 50 });

  const classOptions = useMemo(() => classesResponse?.data || [], [classesResponse]);

  useEffect(() => {
    if (!classesLoading && !selectedClassId) {
      const options = classesResponse?.data || [];
      if (options.length > 0) {
        setSelectedClassId(options[0]._id);
      }
    }
  }, [classesLoading, classesResponse, selectedClassId]);

  const {
    data: enrollmentsResponse,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useFetchClassEnrollments({
    classId: selectedClassId,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const enrollments = useMemo(() => {
    if (!enrollmentsResponse?.data?.enrollments) {
      return [];
    }
    return enrollmentsResponse.data.enrollments;
  }, [enrollmentsResponse]);

  const classMeta = enrollmentsResponse?.data;
  const pagination = enrollmentsResponse?.pagination || {};
  const enrollmentsMessage = enrollmentsResponse?.message;
  const enrollmentsStatus = enrollmentsResponse?.status;

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm) return enrollments;
    const term = searchTerm.toLowerCase();
    return enrollments.filter(({ user }) => {
      const nameMatch = user?.name?.toLowerCase().includes(term);
      const emailMatch = user?.email?.toLowerCase().includes(term);
      const phoneMatch = user?.phone?.toLowerCase().includes(term);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [enrollments, searchTerm]);

  const statusSummary = useMemo(() => {
    return enrollments.reduce(
      (acc, enrollment) => {
        const key = enrollment.status || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );
  }, [enrollments]);

  const getStatusBadge = (status) => {
    const config = STATUS_LABELS[status] || STATUS_LABELS.active;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.style}`}>
        {config.label}
      </span>
    );
  };

  if (classesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (classesError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
        <p className="text-sm text-red-700 dark:text-red-200">Failed to load classes. Please try again later.</p>
      </div>
    );
  }

  if (classOptions.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-900/20">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">No classes available</h2>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
          Create a class first to manage enrollments.
        </p>
        <Link
          to="/classes/create"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700"
        >
          Create Class
        </Link>
      </div>
    );
  }

  if (!selectedClassId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track and manage enrollments for each class.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchEnrollments()}
            disabled={enrollmentsLoading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className={`h-4 w-4 ${enrollmentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to={selectedClassId ? `/classes/${selectedClassId}` : '/classes'}
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            View Class
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {classOptions.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search enrollments</label>
          <input
            type="text"
            placeholder="Search by member name, email, or phone"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {classMeta && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {classMeta.className}
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Showing enrollments for the selected class.
          </p>
        </div>
      )}

      {enrollmentsLoading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
        </div>
      ) : enrollmentsError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-200">Failed to load enrollments for this class.</p>
        </div>
      ) : enrollmentsStatus === 404 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          {enrollmentsMessage || 'Class not found or has been removed.'}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {filteredEnrollments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-600 dark:text-gray-400">
              No enrollments match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Enrolled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.enrollmentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {enrollment.user?.name || 'Unknown member'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">ID: {enrollment.user?.userId || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span>{enrollment.user?.email || 'N/A'}</span>
                          <span>{enrollment.user?.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDateTime(enrollment.enrolledAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDateTime(enrollment.cancelledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              disabled={page === pagination.pages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total (this page)</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{filteredEnrollments.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{statusSummary.active || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{statusSummary.cancelled || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsListPage;
