import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi } from '../../api/staffApi';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { CATEGORY_OPTIONS } from '../../constants/categories';

const SKILL_OPTIONS = Object.entries(CATEGORY_OPTIONS).map(([value, { label }]) => ({
  value,
  label,
}));
const GENDER_OPTIONS = ['male', 'female', 'other'];
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

const StaffCreatePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    height: '',
    weight: '',
    skills: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [createdStaffId, setCreatedStaffId] = useState(null);

  const isFormLocked = Boolean(createdStaffId);
  const submitLabel = isFormLocked
    ? isLoading
      ? 'Uploading avatar...'
      : error
        ? 'Retry Avatar Upload'
        : 'Upload Avatar'
    : isLoading
      ? 'Creating...'
      : 'Create Staff';

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleInputChange = (e) => {
    if (isFormLocked) {
      return;
    }
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillToggle = (skill) => {
    if (isFormLocked) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview('');
      }
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError('Avatar phải là file JPG, PNG, GIF hoặc WEBP.');
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview('');
      }
      setAvatarFile(null);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Avatar vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview('');
      }
      setAvatarFile(null);
      return;
    }

    setError('');
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!avatarFile) {
      setError('Avatar là bắt buộc. Vui lòng chọn file JPG, PNG, GIF hoặc WEBP (tối đa 5MB).');
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
      setError('Avatar phải là file JPG, PNG, GIF hoặc WEBP.');
      return;
    }

    if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Avatar vượt quá 5MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    if (!createdStaffId) {
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone is required');
        return;
      }
      if (formData.skills.length === 0) {
        setError('Please select at least one skill');
        return;
      }
    }

    try {
      setIsLoading(true);

      let staffId = createdStaffId;

      if (!staffId) {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          gender: formData.gender,
          dob: formData.dob || undefined,
          height: formData.height ? parseInt(formData.height, 10) : undefined,
          weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
          skills: formData.skills,
        };

        Object.keys(payload).forEach((key) => {
          if (payload[key] === undefined || payload[key] === '') {
            delete payload[key];
          }
        });

        const response = await staffApi.createStaff(payload);

        if (!response?.success) {
          const message = response?.message || 'Failed to create staff';
          setError(message);
          return;
        }

        staffId = response?.staff?.id || response?.staff?._id;
        if (!staffId) {
          throw new Error('Missing staff id from API response');
        }

        setCreatedStaffId(staffId);
      }

      const avatarResponse = await staffApi.updateStaffAvatar(staffId, avatarFile);

      if (!avatarResponse?.success) {
        const message = avatarResponse?.message || 'Failed to upload avatar';
        setError(message);
        return;
      }

      navigate('/staff');
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error === 'file_missing'
          ? 'Vui lòng chọn lại avatar và thử lại.'
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to create staff';
      setError(errorMessage);
      console.error('Create staff error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/staff')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Staff</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Add a new personal trainer or staff member</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
      )}

      {createdStaffId && (
        <div className="rounded-md bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
          Tài khoản PT đã được tạo thành công. Vui lòng upload avatar để hoàn tất.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0912345678"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {GENDER_OPTIONS.map(gender => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="180"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                disabled={isLoading || isFormLocked}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="75"
              />
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avatar *</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Chấp nhận: JPG, PNG, GIF, WEBP · Tối đa 5MB.
          </p>
          <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer transition-colors ${
            isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500'
          } ${avatarPreview ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/40 dark:border-gray-700'}`}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-32 w-32 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <>
                <PhotoIcon className="h-12 w-12 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nhấn để chọn hoặc kéo thả ảnh
                </span>
              </>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {avatarFile ? `Đã chọn: ${avatarFile.name} · ${formatFileSize(avatarFile.size)}` : 'Ảnh đại diện giúp PT được nhận diện nhanh hơn.'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Skills *</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SKILL_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(value)}
                  onChange={() => handleSkillToggle(value)}
                  disabled={isLoading || isFormLocked}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffCreatePage;
