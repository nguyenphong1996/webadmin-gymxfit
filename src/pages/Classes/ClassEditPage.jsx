import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetchClass, useUpdateClass } from '../../hooks/useFetchClasses';
import { useFetchStaffByCategory } from '../../hooks/useFetchStaff';
import { CATEGORY_OPTIONS, getSubcategories } from '../../constants/categories';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ClassEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateClassMutation = useUpdateClass();
  const isUpdating = updateClassMutation.isPending;

  const { data: classData, isLoading, error } = useFetchClass(id);
  const [formData, setFormData] = React.useState({});
  const [initialFormData, setInitialFormData] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  const subcategoryOptions = React.useMemo(() => {
    const options = getSubcategories(formData.category || '');
    return Array.isArray(options) ? [...options] : [];
  }, [formData.category]);

  const subcategoryChoices = React.useMemo(() => {
    if (!formData.category) {
      return [];
    }
    if (formData.subcategory && formData.subcategory.trim() && !subcategoryOptions.includes(formData.subcategory)) {
      return [...subcategoryOptions, formData.subcategory];
    }
    return subcategoryOptions;
  }, [formData.category, formData.subcategory, subcategoryOptions]);

  const resolvedStaffFromClass = React.useMemo(() => {
    const staff = classData?.data?.staffId;
    if (!staff) return null;
    if (typeof staff === 'string') {
      return { _id: staff, name: '', phone: '' };
    }
    const staffId = staff._id || staff.id || staff?.toString?.();
    if (!staffId) return null;
    return {
      _id: staffId.toString(),
      name: staff.name || '',
      phone: staff.phone || '',
    };
  }, [classData?.data?.staffId]);

  // Initialize form data when class data loads
  React.useEffect(() => {
    if (classData?.data) {
      const classItem = classData.data;
      const staffField = classItem.staffId;
      const resolvedStaffId =
        typeof staffField === 'object' && staffField !== null
          ? (staffField._id || staffField.id || staffField?.toString?.() || '').toString()
          : (staffField || '').toString();

      const normalizedInitial = {
        name: classItem.name || '',
        category: classItem.category || '',
        subcategory: classItem.subcategory || '',
        description: classItem.description || '',
        capacity: classItem.capacity !== undefined && classItem.capacity !== null ? String(classItem.capacity) : '',
        startTime: classItem.startTime ? new Date(classItem.startTime).toISOString().slice(0, 16) : '',
        endTime: classItem.endTime ? new Date(classItem.endTime).toISOString().slice(0, 16) : '',
        location: classItem.location || '',
        staffId: resolvedStaffId || '',
      };

      setFormData(normalizedInitial);
      setInitialFormData(normalizedInitial);
    }
  }, [classData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subcategory: '',
        staffId: '',
      }));
      if (errors.subcategory) {
        setErrors((prev) => ({ ...prev, subcategory: '' }));
      }
      if (errors.staffId) {
        setErrors((prev) => ({ ...prev, staffId: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user types
    setErrors((prev) => {
      if (!prev) return prev;

      const next = { ...prev };
      if (next[name]) {
        next[name] = '';
      }
      if (next.submit) {
        next.submit = '';
      }
      return next;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (subcategoryOptions.length > 0 && formData.category && !formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }

    if (!formData.staffId) {
      newErrors.staffId = 'Instructor is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialFormData) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const normalizeForCompare = (data = {}) => ({
        name: data.name?.trim() || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        description: data.description?.trim() || '',
        capacity:
          data.capacity !== undefined && data.capacity !== null && data.capacity !== ''
            ? String(data.capacity)
            : '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        location: data.location?.trim() || '',
        staffId: data.staffId || '',
      });

      const normalizedCurrent = normalizeForCompare(formData);
      const normalizedInitial = normalizeForCompare(initialFormData);

      const payload = {};

      if (normalizedCurrent.name !== normalizedInitial.name) {
        payload.name = normalizedCurrent.name;
      }

      if (normalizedCurrent.category !== normalizedInitial.category) {
        payload.category = normalizedCurrent.category;
      }

      if (normalizedCurrent.subcategory !== normalizedInitial.subcategory) {
        payload.subcategory = normalizedCurrent.subcategory || undefined;
      }

      if (normalizedCurrent.description !== normalizedInitial.description) {
        payload.description = normalizedCurrent.description || undefined;
      }

      if (normalizedCurrent.capacity !== normalizedInitial.capacity) {
        payload.capacity = normalizedCurrent.capacity ? Number(normalizedCurrent.capacity) : undefined;
      }

      const startChanged = normalizedCurrent.startTime !== normalizedInitial.startTime;
      const endChanged = normalizedCurrent.endTime !== normalizedInitial.endTime;
      if (startChanged || endChanged) {
        if (normalizedCurrent.startTime) {
          payload.startTime = new Date(normalizedCurrent.startTime).toISOString();
        }
        if (normalizedCurrent.endTime) {
          payload.endTime = new Date(normalizedCurrent.endTime).toISOString();
        }
      }

      if (normalizedCurrent.location !== normalizedInitial.location) {
        payload.location = normalizedCurrent.location || undefined;
      }

      if (normalizedCurrent.staffId !== normalizedInitial.staffId) {
        payload.staffId = normalizedCurrent.staffId || undefined;
      }

      if (Object.keys(payload).length === 0) {
        setErrors({ submit: 'No changes detected.' });
        return;
      }

      await updateClassMutation.mutateAsync({ classId: id, classData: payload });
      navigate(`/classes/${id}`);
    } catch (error) {
      console.error('Failed to update class:', error);
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update class. Please try again.';
      setErrors({ submit: message });
    }
  };

  const { data: staffData, isLoading: isStaffLoading } = useFetchStaffByCategory(formData.category);
  const staffList = React.useMemo(() => {
    const normalized = (staffData?.data || [])
      .map((staff) => {
        const staffId =
          staff._id?.toString?.() || staff._id || staff.id || staff?.toString?.() || '';
        return {
          ...staff,
          _id: staffId,
        };
      })
      .filter((staff) => Boolean(staff._id));

    const fallbackStaff =
      resolvedStaffFromClass && resolvedStaffFromClass._id
        ? {
            ...resolvedStaffFromClass,
            name: resolvedStaffFromClass.name || 'Current Instructor',
          }
        : null;

    if (
      formData.staffId &&
      !normalized.some((staff) => staff._id === formData.staffId) &&
      fallbackStaff
    ) {
      return [...normalized, fallbackStaff];
    }

    return normalized;
  }, [staffData?.data, formData.staffId, resolvedStaffFromClass]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900 dark:border-red-800">
        <div className="text-red-800 dark:text-red-200">
          <h3 className="text-lg font-medium">Error loading class</h3>
          <p className="mt-2 text-sm">{error.message || 'Failed to load class details.'}</p>
        </div>
      </div>
    );
  }

  if (!classData?.data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Class not found</h3>
        <Link
          to="/classes"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link
          to={`/classes/${id}`}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Class
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Update class information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Class Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Morning Yoga Session"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {Object.entries(CATEGORY_OPTIONS).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                  )}
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategory {subcategoryChoices.length > 0 && formData.category ? '*' : ''}
                  </label>
                  {formData.category && subcategoryChoices.length > 0 ? (
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.subcategory ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a subcategory</option>
                      {subcategoryChoices.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory || ''}
                      onChange={handleInputChange}
                      disabled={!formData.category}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:dark:bg-gray-700 disabled:dark:text-gray-400"
                      placeholder="Select category first"
                    />
                  )}
                  {errors.subcategory && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.subcategory}</p>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity || ''}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.capacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Maximum number of participants"
                  />
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime || ''}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.endTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>
                  )}
                </div>

                {/* Instructor */}
                <div>
                  <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instructor *
                  </label>
                  {formData.category ? (
                    <select
                      id="staffId"
                      name="staffId"
                      value={formData.staffId || ''}
                      onChange={handleInputChange}
                      disabled={isStaffLoading}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.staffId ? 'border-red-300' : 'border-gray-300'
                      } ${isStaffLoading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <option value="">
                        {isStaffLoading ? 'Loading instructors...' : 'Select instructor'}
                      </option>
                      {staffList.map((staff) => {
                        const isFallback = resolvedStaffFromClass && staff._id === resolvedStaffFromClass._id;
                        const staffLabel =
                          staff.name?.trim() ||
                          (isFallback ? 'Current Instructor' : 'Unnamed Instructor');
                        return (
                          <option key={staff._id} value={staff._id}>
                            {staffLabel}
                            {staff.phone ? ` (${staff.phone})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <select
                      id="staffId"
                      name="staffId"
                      disabled
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md bg-gray-100 text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    >
                      <option>Select category first</option>
                    </select>
                  )}
                  {errors.staffId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.staffId}</p>
                  )}
                  {formData.category && !isStaffLoading && staffList.length === 0 && (
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                      No instructors available for this category. Update staff skills or activate a PT to proceed.
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Room 101, Main Hall"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe the class, what participants should expect, requirements, etc."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:px-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to={`/classes/${id}`}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:w-auto"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 sm:w-auto"
          >
            {isUpdating ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></span>
                Updating...
              </span>
            ) : (
              'Update Class'
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
        </div>
      )}
    </div>
  );
};

export default ClassEditPage;
