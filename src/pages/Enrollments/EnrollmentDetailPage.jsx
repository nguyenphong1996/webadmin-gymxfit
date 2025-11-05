import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useFetchClass } from '../../hooks/useFetchClasses';

const STATUS_STYLES = {
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200',
};

const formatDateTime = (value, { withTime = true } = {}) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const EnrollmentDetailPage = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const enrollment = state?.enrollment || null;
  const classInfo = state?.classInfo || null;

  const {
    data: classResponse,
    isLoading: classLoading,
    error: classError,
  } = useFetchClass(classInfo?.classId);
  const classDetails = classResponse?.data || null;

  if (!enrollment) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 p-6 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        <p className="font-medium">Không tìm thấy dữ liệu enrollment.</p>
        <p className="mt-2">
          Vui lòng quay lại danh sách enrollments và mở lại trang này từ bảng dữ liệu.
        </p>
        <button
          onClick={() => navigate('/enrollments')}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[enrollment.status] || STATUS_STYLES.active;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Details</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Enrollment ID: {enrollmentId}</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${statusStyle}`}>
          {enrollment.status?.charAt(0).toUpperCase() + enrollment.status?.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Member Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {enrollment.user?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {enrollment.user?.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {enrollment.user?.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {enrollment.user?.userId || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enrollment Timeline</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Enrolled at</span>
                <span>{formatDateTime(enrollment.enrolledAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-400">Cancelled at</span>
                <span>{formatDateTime(enrollment.cancelledAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Class Overview</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {classInfo?.className || '—'}
            </p>
            <button
              type="button"
              onClick={() => classInfo?.classId && navigate(`/classes/${classInfo.classId}`)}
              disabled={!classInfo?.classId}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              View class page
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Class Details</h2>
            {classLoading && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Đang tải chi tiết lớp...</p>
            )}
            {classError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                Không thể tải chi tiết lớp. Vui lòng thử lại.
              </p>
            )}
            {classDetails && (
              <dl className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd>{classDetails.category || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Schedule</dt>
                  <dd>
                    {formatDateTime(classDetails.startTime)} — {formatDateTime(classDetails.endTime)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Location</dt>
                  <dd>{classDetails.location || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Trainer</dt>
                  <dd>{classDetails.staffId?.name || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Capacity</dt>
                  <dd>
                    {classDetails.currentEnrollment || 0} / {classDetails.capacity || '—'}
                  </dd>
                </div>
              </dl>
            )}
            {!classLoading && !classError && !classDetails && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Không tìm thấy thông tin chi tiết của lớp.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailPage;
