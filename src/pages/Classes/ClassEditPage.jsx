import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetchClass, useUpdateClass } from '../../hooks/useFetchClasses';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ClassEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateClassMutation = useUpdateClass();
  const isUpdating = updateClassMutation.isPending;

  const { data: classData, isLoading, error } = useFetchClass(id);
  const [formData, setFormData] = React.useState({});
  const [errors, setErrors] = React.useState({});

  // Initialize form data when class data loads
  React.useEffect(() => {
    if (classData?.data) {
      const classItem = classData.data;
      setFormData({
        name: classItem.name || '',
        category: classItem.category || '',
        subcategory: classItem.subcategory || '',
        description: classItem.description || '',
        capacity: classItem.capacity || '',
        startTime: classItem.startTime ? new Date(classItem.startTime).toISOString().slice(0, 16) : '',
        endTime: classItem.endTime ? new Date(classItem.endTime).toISOString().slice(0, 16) : '',
        location: classItem.location || '',
      });
    }
  }, [classData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateClassMutation.mutateAsync({ classId: id, classData: formData });
      navigate(`/classes/${id}`);
    } catch (error) {
      console.error('Failed to update class:', error);
      setErrors({ submit: error.message || 'Failed to update class. Please try again.' });
    }
  };

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
                    <option value="workout">Workout</option>
                    <option value="cardio">Cardio</option>
                    <option value="stretching">Stretching</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="yoga">Yoga</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                  )}
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Beginner, Advanced"
                  />
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
