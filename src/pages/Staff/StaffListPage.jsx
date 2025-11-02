import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchStaff } from '../../hooks/useFetchStaff';
import { PlusIcon, PencilSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import apiClient from '../../api/apiClient';
import { staffApi } from '../../api/staffApi';
import { CATEGORY_OPTIONS } from '../../constants/categories';

const getSkillLabel = (skill) => CATEGORY_OPTIONS[skill]?.label || skill;

const StaffListPage = () => {
  const { data: staffResponse, isLoading, error, refetch } = useFetchStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproval, setFilterApproval] = useState('all'); // all, pending, approved
  const [approvingId, setApprovingId] = useState(null);
  const [approveError, setApproveError] = useState(null);
  const [activeToggleId, setActiveToggleId] = useState(null);
  const [activeToggleError, setActiveToggleError] = useState(null);

  const staffList = staffResponse?.data || [];

  // Filter staff based on search term and approval status
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApproval = 
      filterApproval === 'all' ||
      (filterApproval === 'pending' && !staff.skillsApprovedByAdmin) ||
      (filterApproval === 'approved' && staff.skillsApprovedByAdmin);

    return matchesSearch && matchesApproval;
  });

  const getSkillsBadges = (skills) => {
    return skills.map((skill) => (
      <span
        key={skill}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      >
        {getSkillLabel(skill)}
      </span>
    ));
  };

  const getStatusBadge = (staff) => {
    if (!staff.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          Inactive
        </span>
      );
    }
    if (!staff.skillsApprovedByAdmin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Pending Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Approved
      </span>
    );
  };

  const handleQuickApprove = async (staffId, staffName) => {
    if (!window.confirm(`Approve skills for ${staffName}?`)) {
      return;
    }

    try {
      setApprovingId(staffId);
      setApproveError(null);
      
      await apiClient.patch(`/api/admin/staff/${staffId}/skills/approve`);
      
      // Refresh data
      refetch();
      alert('Skills approved successfully!');
    } catch (err) {
      console.error('Failed to approve skills:', err);
      const errorMsg = err.response?.data?.message || 'Failed to approve skills';
      setApproveError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setApprovingId(null);
    }
  };

  const handleToggleActive = async (staff) => {
    const action = staff.isActive ? 'deactivate' : 'activate';
    const confirmationMessage = staff.isActive
      ? `Deactivate ${staff.name}'s account?`
      : `Activate ${staff.name}'s account?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setActiveToggleId(staff._id);
      setActiveToggleError(null);

      if (staff.isActive) {
        await staffApi.deactivateStaff(staff._id);
      } else {
        await staffApi.activateStaff(staff._id);
      }

      refetch();
    } catch (error) {
      console.error(`Failed to ${action} staff:`, error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Failed to ${action} staff account`;
      setActiveToggleError(message);
      alert(`Error: ${message}`);
    } finally {
      setActiveToggleId(null);
    }
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
        <p className="text-sm text-red-800 dark:text-red-200">Failed to load staff list</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage gym instructors and PT staff
          </p>
        </div>
        <Link
          to="/staff/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Add Staff
        </Link>
      </div>

      {/* Search Bar and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Skills Approval Filter */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Skills:</span>
          <button
            onClick={() => setFilterApproval('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterApproval === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({staffList.length})
          </button>
          <button
            onClick={() => setFilterApproval('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterApproval === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pending Approval ({staffList.filter(s => !s.skillsApprovedByAdmin).length})
          </button>
          <button
            onClick={() => setFilterApproval('approved')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterApproval === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Approved ({staffList.filter(s => s.skillsApprovedByAdmin).length})
          </button>
        </div>
      </div>

      {(approveError || activeToggleError) && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {approveError || activeToggleError}
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {staffList.length === 0 ? 'No staff members yet' : 'No staff members match your search'}
            </p>
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
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Skills
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
                {filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{staff.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {staff.phone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.skills && staff.skills.length > 0 ? (
                          getSkillsBadges(staff.skills)
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No skills</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(staff)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {!staff.skillsApprovedByAdmin && staff.isActive && (
                          <button
                            onClick={() => handleQuickApprove(staff._id, staff.name)}
                            disabled={approvingId === staff._id}
                            className="inline-flex items-center gap-1 rounded-full border border-green-200 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                            title="Approve Skills"
                          >
                            {approvingId === staff._id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent dark:border-green-300" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Approve
                              </>
                            )}
                          </button>
                        )}
                        <Link
                          to={`/staff/${staff._id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-200 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleActive(staff)}
                          disabled={activeToggleId === staff._id}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium disabled:opacity-50 ${
                            staff.isActive
                              ? 'border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20'
                              : 'border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {activeToggleId === staff._id ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              {staff.isActive ? 'Deactivating...' : 'Activating...'}
                            </>
                          ) : (
                            <>{staff.isActive ? 'Deactivate' : 'Activate'}</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{staffList.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {staffList.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved Skills</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {staffList.filter(s => s.skillsApprovedByAdmin).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffListPage;
