import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetchClass } from '../../hooks/useFetchClasses';
import {
  ArrowLeftIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

const ClassDetailPage = () => {
  const { id } = useParams();
  const { data: classData, isLoading, error } = useFetchClass(id);

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

  const classItem = classData.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link
          to="/classes"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {classItem.name}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Class Details and Management
          </p>
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {classItem.category}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {classItem.subcategory || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Capacity</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {classItem.currentEnrollment || 0} / {classItem.capacity}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    classItem.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                    classItem.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    classItem.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    classItem.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                  </span>
                </dd>
              </div>
            </dl>

            {classItem.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {classItem.description}
                </dd>
              </div>
            )}

            {classItem.location && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Location
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {classItem.location}
                </dd>
              </div>
            )}
          </div>

          {/* Schedule Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Schedule Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(classItem.startTime).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(classItem.startTime).toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(classItem.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(classItem.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((new Date(classItem.endTime) - new Date(classItem.startTime)) / (1000 * 60))} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Instructor
            </h2>
            {classItem.staffId ? (
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                  {classItem.staffId.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {classItem.staffId.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {classItem.staffId.phone}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {classItem.staffId.email}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                No instructor assigned
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <Link
                to={`/classes/${classItem._id}/edit`}
                className="w-full flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Edit Class
              </Link>

              {classItem.status === 'draft' && (
                <button className="w-full flex justify-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-600 dark:hover:bg-green-800">
                  Open for Enrollment
                </button>
              )}

              {(classItem.status === 'scheduled' || classItem.status === 'ongoing') && (
                <button className="w-full flex justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:border-red-600 dark:hover:bg-red-800">
                  Close Class
                </button>
              )}

              {classItem.qrCode && (
                <div className="text-center">
                  <QrCodeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    QR Code Available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;