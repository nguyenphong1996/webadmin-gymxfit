import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useFetchUser } from '../../hooks/useFetchUsers';

const formatDateTime = (value) => {
  if (!value) return 'Không có';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const getStatusBadge = (status, isActive) => {
  const normalized = (status ?? (isActive ? 'active' : 'inactive')).toLowerCase();
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/60 dark:text-gray-200',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200',
  };
  const labels = {
    active: 'Đang hoạt động',
    inactive: 'Ngưng hoạt động',
    suspended: 'Bị khoá',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[normalized] || styles.active}`}
    >
      {labels[normalized] || 'Không xác định'}
    </span>
  );
};

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <span className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
        <Icon className="h-4 w-4" />
      </span>
    )}
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{value || 'Không có'}</p>
    </div>
  </div>
);

const UserDetailPage = () => {
  const { userId } = useParams();
  const { data, isLoading, error } = useFetchUser(userId);

  const user =
    data?.user ||
    data?.data ||
    data ||
    null;

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-gray-600 dark:text-gray-300">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p>Đang tải hồ sơ người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
        Không thể tải hồ sơ người dùng. Vui lòng kiểm tra lại.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Link
            to="/users"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Quay lại danh sách"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Không tìm thấy người dùng</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hồ sơ có thể đã bị xoá hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Vui lòng quay lại trang <Link to="/users" className="text-blue-600 hover:underline dark:text-blue-400">danh sách người dùng</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/users"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Quay lại danh sách"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.name || 'Người dùng'}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              ID: <span className="font-mono text-xs">{user.id || user._id || 'không xác định'}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {getStatusBadge(user.status, user.isActive)}
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                Vai trò: {user.role || 'customer'}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  user.isVerified
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300'
                }`}
              >
                {user.isVerified ? 'Đã xác thực OTP' : 'Chưa xác thực'}
              </span>
            </div>
          </div>
        </div>
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-500/30"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin liên hệ</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Họ tên" value={user.name} icon={UserCircleIcon} />
              <InfoItem label="Email" value={user.email} icon={EnvelopeIcon} />
              <InfoItem label="Số điện thoại" value={user.phone} icon={PhoneIcon} />
              <InfoItem label="Giới tính" value={user.gender} />
              <InfoItem label="Ngày sinh" value={user.dob ? formatDateTime(user.dob) : 'Không có'} />
            </div>
          </section>

          {Array.isArray(user.skills) && user.skills.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kỹ năng chuyên môn</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {user.hireDate && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Ngày tuyển dụng PT: <span className="font-medium text-gray-700 dark:text-gray-200">{formatDateTime(user.hireDate)}</span>
                </p>
              )}
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tài khoản</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex justify-between">
                <span>Ngày tạo</span>
                <span className="font-medium">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật cuối</span>
                <span className="font-medium">{formatDateTime(user.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái kích hoạt</span>
                <span className="font-medium">{user.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã xác thực OTP</span>
                <span className="font-medium">{user.isVerified ? 'Có' : 'Chưa'}</span>
              </div>
            </div>
            <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              Admin chỉ có quyền xem thông tin. Mọi thay đổi hồ sơ hoặc yêu cầu xoá tài khoản phải do người dùng thực hiện trong ứng dụng khách.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉ số cơ thể</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex justify-between">
                <span>Chiều cao</span>
                <span className="font-medium">{user.height ? `${user.height} cm` : 'Không có'}</span>
              </div>
              <div className="flex justify-between">
                <span>Cân nặng</span>
                <span className="font-medium">{user.weight ? `${user.weight} kg` : 'Không có'}</span>
              </div>
              <div className="flex justify-between">
                <span>Giới tính</span>
                <span className="font-medium">{user.gender || 'Không có'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
