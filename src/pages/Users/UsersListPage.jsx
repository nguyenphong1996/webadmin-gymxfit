import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchUsers } from '../../hooks/useFetchUsers';
import { EyeIcon } from '@heroicons/react/24/outline';

const UsersListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      role: 'customer',
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter) {
      params.isActive = statusFilter === 'active' ? 'true' : 'false';
    }

    if (verifiedFilter) {
      params.isVerified = verifiedFilter;
    }

    return params;
  }, [page, searchTerm, statusFilter, verifiedFilter]);

  const {
    data: usersResponse,
    isPending,
    isFetching,
    error,
  } = useFetchUsers(queryParams);

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination || { page: 1, pages: 1, total: 0, limit: 10 };

  const resolveActiveStatus = (user) => {
    if (typeof user?.isActive === 'boolean') {
      return user.isActive;
    }
    if (typeof user?.status === 'string') {
      return user.status.toLowerCase() === 'active';
    }
    return false;
  };

  const getStatusBadge = (status) => {
    const normalized = (status || 'active').toLowerCase();
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    const statusLabels = {
      active: 'Đang hoạt động',
      inactive: 'Ngưng hoạt động',
      suspended: 'Bị khoá',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[normalized] || statusStyles.active
        }`}
      >
        {statusLabels[normalized] || 'Không xác định'}
      </span>
    );
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">Đang tải danh sách người dùng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">Không thể tải danh sách người dùng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFetching && !isPending && (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-200">
          Đang cập nhật danh sách...
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Xem danh sách hội viên và hồ sơ chi tiết. Admin không thể chỉnh sửa thông tin người dùng.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 lg:col-span-2">
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Trạng thái kích hoạt
            </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Trạng thái xác thực
            </label>
            <select
              value={verifiedFilter}
              onChange={(event) => {
                setVerifiedFilter(event.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tất cả</option>
              <option value="true">Đã xác thực</option>
              <option value="false">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Chưa có người dùng nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Đã xác thực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id || user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || 'Không có'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.email || 'Không có'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.phone || 'Không có'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Không có'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(
                        user.status ?? (resolveActiveStatus(user) ? 'active' : 'inactive')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-200">
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          Chưa xác thực
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/users/${user.id || user._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Xem hồ sơ
                      </Link>
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
            Trang {page} / {pagination.pages}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng (toàn hệ thống)</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{pagination.total ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động (trong trang hiện tại)</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {users.filter((u) => resolveActiveStatus(u)).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ngưng hoạt động (trong trang hiện tại)</p>
          <p className="mt-2 text-3xl font-bold text-gray-600">
            {users.filter((u) => !resolveActiveStatus(u)).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
