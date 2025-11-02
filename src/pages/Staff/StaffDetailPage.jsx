import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import apiClient from '../../api/apiClient';
import { staffApi } from '../../api/staffApi';
import { CATEGORY_OPTIONS } from '../../constants/categories';

const SKILL_OPTIONS = Object.entries(CATEGORY_OPTIONS).map(([value, { label }]) => ({
  value,
  label,
}));

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) {
    return '';
  }

  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(2)} MB`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes >= 1) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${bytes} B`;
};

const getSkillLabel = (skill) => CATEGORY_OPTIONS[skill]?.label || skill;
const formatSkillsList = (skills = []) =>
  skills.length > 0 ? skills.map(getSkillLabel).join(', ') : 'None';

const StaffDetailPage = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: [],
    gender: '',
   dob: '',
   height: '',
   weight: '',
 });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarObjectUrlRef = useRef('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await apiClient.get(`/api/admin/staff/${staffId}`);
        const staffData = response.data?.staff || response.data?.data;
        setStaff(staffData);
        setFormData({
          name: staffData.name || '',
          email: staffData.email || '',
          phone: staffData.phone || '',
          skills: staffData.skills || [],
          gender: staffData.gender || '',
          dob: staffData.dob ? staffData.dob.split('T')[0] : '',
          height: staffData.height || '',
          weight: staffData.weight || '',
        });
        const remoteAvatar = staffData.avatar?.url || '';
        if (avatarObjectUrlRef.current) {
          URL.revokeObjectURL(avatarObjectUrlRef.current);
          avatarObjectUrlRef.current = '';
        }
        setAvatarFile(null);
        setAvatarPreview(remoteAvatar);
        setAvatarError('');
        setAvatarSuccess('');
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
        setError('Failed to load staff details');
        setIsLoading(false);
      }
    };

    if (staffId) {
      fetchStaff();
    }
  }, [staffId]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    setAvatarError('');
    setAvatarSuccess('');

    if (!file) {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = '';
      }
      setAvatarFile(null);
      setAvatarPreview(staff?.avatar?.url || '');
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Avatar phải là file JPG, PNG, GIF hoặc WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError('Avatar vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');
      event.target.value = '';
      return;
    }

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = '';
    }

    const previewUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = previewUrl;

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const handleAvatarResetSelection = () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = '';
    }
    setAvatarFile(null);
    setAvatarPreview(staff?.avatar?.url || '');
    setAvatarError('');
    setAvatarSuccess('');
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAvatarError('Vui lòng chọn ảnh hợp lệ trước khi upload.');
      return;
    }

    setAvatarError('');
    setAvatarSuccess('');
    setIsUploadingAvatar(true);

    try {
      const response = await staffApi.updateStaffAvatar(staffId, avatarFile);
      const newAvatarUrl = response?.staff?.avatar || '';

      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = '';
      }

      setAvatarFile(null);
      setAvatarPreview(newAvatarUrl || staff?.avatar?.url || '');
      setStaff((prev) =>
        prev
          ? {
              ...prev,
              avatar: {
                ...(prev.avatar || {}),
                url: newAvatarUrl || prev.avatar?.url || '',
              },
            }
          : prev
      );
      setAvatarSuccess(response?.message || 'Cập nhật avatar thành công.');
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update avatar. Vui lòng thử lại.';
      setAvatarError(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Check if skills were changed
      const skillsChanged = JSON.stringify(formData.skills) !== JSON.stringify(staff.skills);
      
      const payload = {
        ...formData,
        ...(skillsChanged && { skillsApprovedByAdmin: false }), // Mark as pending if skills changed
      };

      await apiClient.patch(`/api/admin/staff/${staffId}`, payload);
      
      // Refresh staff data to show updated status
      const response = await apiClient.get(`/api/admin/staff/${staffId}`);
      const staffData = response.data?.staff || response.data?.data;
      setStaff(staffData);
      setFormData({
        name: staffData.name || '',
        email: staffData.email || '',
        phone: staffData.phone || '',
        skills: staffData.skills || [],
        gender: staffData.gender || '',
        dob: staffData.dob ? staffData.dob.split('T')[0] : '',
        height: staffData.height || '',
        weight: staffData.weight || '',
      });
    } catch (err) {
      console.error('Failed to update staff:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const approveSkills = async () => {
    if (!window.confirm('Are you sure you want to approve these skills?')) {
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.patch(`/api/admin/staff/${staffId}/skills/approve`);
      
      // Refresh staff data
      const response = await apiClient.get(`/api/admin/staff/${staffId}`);
      const staffData = response.data?.staff || response.data?.data;
      setStaff(staffData);
      setFormData(prev => ({
        ...prev,
        skills: staffData.skills || [],
      }));
      
      alert('Skills approved successfully!');
    } catch (err) {
      console.error('Failed to approve skills:', err);
      const errorMsg = err.response?.data?.message || 'Failed to approve skills';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const activateStaff = async () => {
    try {
      await staffApi.activateStaff(staffId);
      setStaff(prev => ({ ...prev, isActive: true }));
    } catch (err) {
      console.error('Failed to activate staff:', err);
    }
  };

  const deactivateStaff = async () => {
    try {
      await staffApi.deactivateStaff(staffId);
      setStaff(prev => ({ ...prev, isActive: false }));
    } catch (err) {
      console.error('Failed to deactivate staff:', err);
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
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/staff" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{staff?.name}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{staff?.email}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              staff?.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {staff?.isActive ? 'Active' : 'Inactive'}
            </span>
            {staff?.isActive ? (
              <button
                onClick={deactivateStaff}
                className="text-sm text-red-600 hover:text-red-900 dark:text-red-400"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={activateStaff}
                className="text-sm text-green-600 hover:text-green-900 dark:text-green-400"
              >
                Activate
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Skills Approval</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              staff?.skillsApprovedByAdmin
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {staff?.skillsApprovedByAdmin ? 'Approved' : 'Pending'}
            </span>
            {!staff?.skillsApprovedByAdmin && (
              <button
                onClick={approveSkills}
                disabled={isSaving}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Approving...' : 'Approve'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Hire Date</p>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {staff?.hireDate ? new Date(staff.hireDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Avatar Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Avatar</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG, GIF, WEBP · Tối đa 5MB
          </span>
        </div>

        {avatarError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {avatarError}
          </div>
        )}
        {avatarSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
            {avatarSuccess}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="h-32 w-32 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${staff?.name || 'Staff'} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ảnh đại diện giúp PT được nhận diện nhanh hơn.
            </p>
          </div>

          <div className="flex-1 space-y-3">
            <label
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border border-dashed ${
                isUploadingAvatar
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700 cursor-pointer dark:border-blue-700 dark:text-blue-300'
              }`}
            >
              <span>{isUploadingAvatar ? 'Đang xử lý...' : 'Chọn ảnh từ máy'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarFileChange}
                disabled={isUploadingAvatar}
                ref={avatarInputRef}
                className="hidden"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={!avatarFile || isUploadingAvatar}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploadingAvatar ? 'Đang upload...' : 'Upload Avatar'}
              </button>
              <button
                type="button"
                onClick={handleAvatarResetSelection}
                disabled={isUploadingAvatar || (!avatarFile && !staff?.avatar?.url)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Huỷ chọn
              </button>
            </div>

            {avatarFile && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Đã chọn: {avatarFile.name} · {formatFileSize(avatarFile.size)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
              {!staff?.skillsApprovedByAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Pending Approval
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SKILL_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(value)}
                    onChange={() => handleSkillToggle(value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {/* Show difference if skills changed and pending approval */}
            {!staff?.skillsApprovedByAdmin && JSON.stringify(formData.skills) !== JSON.stringify(staff?.skills) && (
              <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">Skills Changed</p>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p><strong>Current Skills:</strong> {formatSkillsList(staff?.skills)}</p>
                  <p><strong>Pending Skills:</strong> {formatSkillsList(formData.skills)}</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Admin Actions - Skills Approval */}
        {!staff?.skillsApprovedByAdmin && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-4">
              ⚠️ Pending Skills Approval
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
              This PT has made changes to their skills. Please review and approve them below.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={approveSkills}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckIcon className="h-5 w-5" />
                {isSaving ? 'Approving...' : 'Approve Skills'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/staff')}
                className="flex-1 px-4 py-2.5 border border-yellow-300 text-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors font-medium"
              >
                Review Later
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <Link
            to="/staff"
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffDetailPage;
