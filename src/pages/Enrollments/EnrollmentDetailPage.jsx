import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchEnrollment, useUpdateEnrollment, useApproveEnrollment, useRejectEnrollment, useCompleteEnrollment, useCancelEnrollment } from '../../hooks/useFetchEnrollments';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

const EnrollmentDetailPage = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');

  const { data: enrollment, isLoading, error, refetch } = useFetchEnrollment(enrollmentId);
  const updateEnrollment = useUpdateEnrollment();
  const approveEnrollment = useApproveEnrollment();
  const rejectEnrollment = useRejectEnrollment();
  const completeEnrollment = useCompleteEnrollment();
  const cancelEnrollment = useCancelEnrollment();

  React.useEffect(() => {
    if (enrollment?.data?.notes) {
      setNotes(enrollment.data.notes);
    }
  }, [enrollment]);

  const handleApprove = async () => {
    if (confirm('Approve this enrollment?')) {
      await approveEnrollment.mutateAsync(enrollmentId);
      refetch();
    }
  };

  const handleReject = async () => {
    if (confirm('Reject this enrollment?')) {
      await rejectEnrollment.mutateAsync(enrollmentId);
      refetch();
    }
  };

  const handleComplete = async () => {
    if (confirm('Mark this enrollment as completed?')) {
      await completeEnrollment.mutateAsync(enrollmentId);
      refetch();
    }
  };

  const handleCancel = async () => {
    if (confirm('Cancel this enrollment?')) {
      await cancelEnrollment.mutateAsync(enrollmentId);
      refetch();
    }
  };

  const handleSaveNotes = async () => {
    await updateEnrollment.mutateAsync({
      enrollmentId,
      data: { notes },
    });
    refetch();
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
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.pending}`}>
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

  if (error || !enrollment?.data) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">Failed to load enrollment details</p>
        <button
          onClick={() => navigate('/enrollments')}
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Enrollments
        </button>
      </div>
    );
  }

  const data = enrollment.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/enrollments')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Details</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Enrollment ID: {enrollmentId}</p>
          </div>
        </div>
        {getStatusBadge(data.status)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.userId?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.userId?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.userId?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.userId?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Class Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Class Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Class Name</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.classId?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.classId?.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Staff</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.classId?.staffId?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Class Date</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {data.classId?.startTime ? new Date(data.classId.startTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Timeline */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrollment Timeline</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enrollment Date</p>
                <p className="mt-1 text-gray-900 dark:text-white font-medium">
                  {data.enrollmentDate ? new Date(data.enrollmentDate).toLocaleString() : 'N/A'}
                </p>
              </div>
              {data.approvalDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approval Date</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {new Date(data.approvalDate).toLocaleString()}
                  </p>
                </div>
              )}
              {data.completionDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {new Date(data.completionDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this enrollment..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updateEnrollment.isLoading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateEnrollment.isLoading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              {data.status === 'pending' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={approveEnrollment.isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectEnrollment.isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Reject
                  </button>
                </>
              )}

              {data.status === 'approved' && (
                <>
                  <button
                    onClick={handleComplete}
                    disabled={completeEnrollment.isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Mark Completed
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelEnrollment.isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Cancel
                  </button>
                </>
              )}

              {['rejected', 'cancelled', 'completed'].includes(data.status) && (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  <p className="text-sm">No actions available for {data.status} enrollments</p>
                </div>
              )}
            </div>

            {/* Status Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
              <div className="mt-2">
                {getStatusBadge(data.status)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailPage;
