import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateClass } from '../../hooks/useFetchClasses';
import { useFetchStaffByCategory } from '../../hooks/useFetchStaff';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CATEGORY_OPTIONS, getSubcategories } from '../../constants/categories';

const MIN_CLASS_DURATION_MINUTES = 15;

const ClassCreatePage = () => {
  const navigate = useNavigate();
  const createClassMutation = useCreateClass();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    capacity: '',
    startTime: '',
    endTime: '',
    staffId: '',
    location: '',
  });

  const [errors, setErrors] = useState({});

  const { data: staffData, isLoading: isStaffLoading } = useFetchStaffByCategory(formData.category);
  const staffList = staffData?.data || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData(prev => ({ ...prev, [name]: value, subcategory: '', staffId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const startDate = new Date(formData.startTime);
      if (startDate <= new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      } else {
        const durationMinutes = (end - start) / (1000 * 60);
        if (durationMinutes < MIN_CLASS_DURATION_MINUTES) {
          newErrors.endTime = `Class duration must be at least ${MIN_CLASS_DURATION_MINUTES} minutes`;
        }
      }
    }

    if (!formData.staffId) {
      newErrors.staffId = 'Instructor is required';
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
      // Format data according to API schema
      const formattedData = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        capacity: parseInt(formData.capacity, 10),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        staffId: formData.staffId, // This should be a valid MongoDB ObjectId from the dropdown
        description: formData.description.trim(),
        location: formData.location.trim(),
      };

      console.log('Formatted data being sent:', formattedData);

      await createClassMutation.mutateAsync(formattedData);
      navigate('/classes');
    } catch (error) {
      console.error('Failed to create class:', error);
      const errorMessage = error.response?.data?.data?.[0]?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create class. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  const subcategories = getSubcategories(formData.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/classes" className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Class</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Add a new class to your gym schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="e.g., Morning Yoga"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Select a category</option>
                    {Object.entries(CATEGORY_OPTIONS).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory {formData.category && '*'}</label>
                  {formData.category ? (
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.subcategory ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select a subcategory</option>
                      {subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
                    </select>
                  ) : (
                    <input type="text" id="subcategory" name="subcategory" disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed" placeholder="Select category first" />
                  )}
                  {errors.subcategory && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.subcategory}</p>}
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity *</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.capacity ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Max participants"
                  />
                  {errors.capacity && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.capacity}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time *</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.startTime ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.startTime && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>}
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time *</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.endTime ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.endTime && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>}
                </div>

                <div>
                  <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructor * {formData.category && `(${staffList.length} available)`}</label>
                  {formData.category ? (
                    <select
                      id="staffId"
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleInputChange}
                      disabled={isStaffLoading}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.staffId ? 'border-red-300' : 'border-gray-300'} ${isStaffLoading ? 'opacity-50' : ''}`}
                    >
                      <option value="">{isStaffLoading ? 'Loading staff...' : 'Select instructor'}</option>
                      {staffList.map((staff) => (<option key={staff._id} value={staff._id}>{staff.name} ({staff.phone})</option>))}
                    </select>
                  ) : (
                    <select id="staffId" name="staffId" disabled className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed">
                      <option>Select category first</option>
                    </select>
                  )}
                  {errors.staffId && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.staffId}</p>}
                  {formData.category && staffList.length === 0 && !isStaffLoading && <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">No instructors available</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Room 102"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Add class details..."
              />
            </div>

            {errors.submit && <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"><p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p></div>}
          </div>

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:px-6 flex justify-end gap-3">
            <Link to="/classes" className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createClassMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {createClassMutation.isLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Creating...</>) : (<><CheckIcon className="h-4 w-4" />Create Class</>)}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClassCreatePage;
