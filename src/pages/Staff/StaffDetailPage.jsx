import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiClient from '../../api/apiClient';

const SKILL_OPTIONS = ['yoga', 'cardio', 'stretching', 'nutrition', 'workout', 'pilates', 'boxing', 'dance'];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch(`/api/admin/staff/${staffId}`, formData);
      navigate('/staff');
    } catch (err) {
      console.error('Failed to update staff:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const approveSkills = async () => {
    try {
      await apiClient.patch(`/api/admin/staff/${staffId}/skills/approve`);
      setStaff(prev => ({ ...prev, skillsApprovedByAdmin: true }));
    } catch (err) {
      console.error('Failed to approve skills:', err);
    }
  };

  const activateStaff = async () => {
    try {
      await apiClient.patch(`/api/admin/staff/${staffId}/activate`);
      setStaff(prev => ({ ...prev, isActive: true }));
    } catch (err) {
      console.error('Failed to activate staff:', err);
    }
  };

  const deactivateStaff = async () => {
    try {
      await apiClient.patch(`/api/admin/staff/${staffId}/deactivate`);
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
          <div className="mt-2 flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              staff?.skillsApprovedByAdmin
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {staff?.skillsApprovedByAdmin ? 'Approved' : 'Pending'}
            </span>
            {!staff?.skillsApprovedByAdmin && (
              <button
                onClick={approveSkills}
                className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400"
              >
                Approve
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Skills</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SKILL_OPTIONS.map((skill) => (
                <label key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

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
