import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useFetchClass,
  useClassQRCode,
  useGenerateClassQRCode,
  useOpenClass,
  useCloseClass,
} from '../../hooks/useFetchClasses';
import {
  ArrowLeftIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  QrCodeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const ClassDetailPage = () => {
  const { id } = useParams();
  const {
    data: classData,
    isLoading,
    error,
    refetch: refetchClass,
  } = useFetchClass(id);
  const {
    data: qrCodeData,
    isFetching: isQRCodeLoading,
    refetch: refetchQRCode,
  } = useClassQRCode(id, { enabled: !!id });
  const generateQRCodeMutation = useGenerateClassQRCode();
  const openClassMutation = useOpenClass();
  const closeClassMutation = useCloseClass();
  const [qrFeedback, setQrFeedback] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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
  React.useEffect(() => {
    setActionFeedback(null);
    setShowCloseConfirm(false);
  }, [classItem.status]);

  const classIdFromData = classItem?._id || classItem?.id;
  const resolvedClassId = classIdFromData || id;
  const qrCodeInfo = qrCodeData?.data?.qrCode || classItem.qrCode;
  const qrCodeMessage = qrCodeData?.message;
  const qrCodeStatus = qrCodeData?.status;
  const isQRCodeAvailable = Boolean(qrCodeInfo?.url);
  const canGenerateQRCode = ['scheduled', 'ongoing', 'full'].includes(classItem.status);
  const isGeneratingQRCode = generateQRCodeMutation.isPending;
  const isOpeningClass = openClassMutation.isPending;
  const isClosingClass = closeClassMutation.isPending;

  const handleGenerateQRCode = async () => {
    const targetClassId = resolvedClassId;
    if (!targetClassId) {
      return;
    }

    setQrFeedback(null);
    try {
      await generateQRCodeMutation.mutateAsync(targetClassId);
      await Promise.all([
        refetchClass(),
        refetchQRCode(),
      ]);
      setQrFeedback({
        type: 'success',
        message: 'QR code generated successfully.',
      });
    } catch (mutationError) {
      const apiMessage = mutationError?.response?.data?.message;
      setQrFeedback({
        type: 'error',
        message: apiMessage || 'Failed to generate QR code. Please try again.',
      });
    }
  };

  const handleOpenEnrollment = async () => {
    if (!resolvedClassId || isOpeningClass) {
      return;
    }

    setActionFeedback(null);
    try {
      await openClassMutation.mutateAsync(resolvedClassId);
      await refetchClass();
      setActionFeedback({
        type: 'success',
        message: 'Class opened for enrollment.',
      });
    } catch (mutationError) {
      const message = mutationError?.response?.data?.message || 'Unable to open class for enrollment.';
      setActionFeedback({
        type: 'error',
        message,
      });
    }
  };

  const handleCloseClass = async () => {
    if (!resolvedClassId || isClosingClass) {
      return;
    }

    setActionFeedback(null);
    try {
      await closeClassMutation.mutateAsync({ classId: resolvedClassId, reason: 'cancelled' });
      await refetchClass();
      setActionFeedback({
        type: 'success',
        message: 'Class marked as cancelled.',
      });
    } catch (mutationError) {
      const message = mutationError?.response?.data?.message || 'Unable to close class.';
      setActionFeedback({
        type: 'error',
        message,
      });
    } finally {
      setShowCloseConfirm(false);
    }
  };

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
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-inner">
                  {classItem.staffId.avatar?.url || classItem.staffId.avatarUrl ? (
                    <img
                      src={classItem.staffId.avatar?.url || classItem.staffId.avatarUrl}
                      alt={classItem.staffId.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {(classItem.staffId.name || '').charAt(0).toUpperCase()}
                    </span>
                  )}
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
                to={`/classes/${resolvedClassId}/edit`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-100 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-200 dark:hover:bg-primary-500/20"
              >
                <PencilSquareIcon className="h-4 w-4" />
                <span>Edit Class</span>
              </Link>

              {classItem.status === 'draft' && (
                <button
                  type="button"
                  onClick={handleOpenEnrollment}
                  disabled={isOpeningClass}
                  className={`w-full flex justify-center px-4 py-2 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                    isOpeningClass
                      ? 'border border-green-200 bg-green-100 text-green-500 cursor-not-allowed'
                      : 'border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:border-green-600 dark:hover:bg-green-800'
                  }`}
                >
                  {isOpeningClass ? 'Opening...' : 'Open for Enrollment'}
                </button>
              )}

              {(classItem.status === 'scheduled' || classItem.status === 'ongoing' || classItem.status === 'full') && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowCloseConfirm(true)}
                    disabled={isClosingClass}
                    className={`w-full flex justify-center px-4 py-2 rounded-md text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      isClosingClass
                        ? 'border border-red-200 bg-red-100 text-red-500 cursor-not-allowed'
                        : 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-600 dark:hover:bg-red-800'
                    }`}
                  >
                    {isClosingClass ? 'Closing...' : 'Close Class'}
                  </button>
                  {showCloseConfirm && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
                      <p className="font-semibold">Confirm close class?</p>
                      <p className="mt-1">
                        This will cancel the class and prevent further enrollments.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCloseConfirm(false)}
                          disabled={isClosingClass}
                          className="inline-flex flex-1 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-600 dark:text-red-200 dark:hover:bg-red-800/40"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseClass}
                          disabled={isClosingClass}
                          className="inline-flex flex-1 items-center justify-center rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                          {isClosingClass ? 'Closing...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isQRCodeAvailable && (
                <div className="text-center">
                  <QrCodeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    QR Code Available
                  </p>
                </div>
              )}
            </div>

            {actionFeedback && (
              <div
                className={`mt-4 rounded-md border p-3 text-xs font-medium ${
                  actionFeedback.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200'
                }`}
              >
                {actionFeedback.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              Class Check-in QR Code
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Share this code so customers and personal trainers can check in/out for this class.
            </p>
            {!canGenerateQRCode && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                QR code generation is available only when the class status is Scheduled, Ongoing, or Full.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateQRCode}
            disabled={!canGenerateQRCode || isGeneratingQRCode}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              !canGenerateQRCode || isGeneratingQRCode
                ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600'
            }`}
          >
            {isGeneratingQRCode ? 'Generating...' : isQRCodeAvailable ? 'Regenerate QR Code' : 'Generate QR Code'}
          </button>
        </div>

        {qrFeedback && (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              qrFeedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200'
            }`}
          >
            {qrFeedback.message}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
          {isQRCodeLoading ? (
            <div className="flex h-56 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : isQRCodeAvailable ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <img
                    src={qrCodeInfo.url}
                    alt={`QR code for ${classItem.name}`}
                    className="h-48 w-48 object-contain"
                  />
                </div>
                <a
                  href={qrCodeInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Open QR code in new tab
                </a>
              </div>
              <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <dl className="space-y-3">
                  <div className="flex flex-col">
                    <dt className="font-medium text-gray-900 dark:text-white">Class name</dt>
                    <dd>{classItem.name}</dd>
                  </div>
                  {qrCodeInfo.generatedAt && (
                    <div className="flex flex-col">
                      <dt className="font-medium text-gray-900 dark:text-white">Generated at</dt>
                      <dd>{new Date(qrCodeInfo.generatedAt).toLocaleString()}</dd>
                    </div>
                  )}
                  {qrCodeInfo.value && (
                    <div className="flex flex-col">
                      <dt className="font-medium text-gray-900 dark:text-white">Payload</dt>
                      <dd className="mt-1 rounded-md bg-white p-3 font-mono text-xs text-gray-600 shadow-inner dark:bg-gray-800 dark:text-gray-200">
                        <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed">
{qrCodeInfo.value}
                        </pre>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </>
          ) : (
            <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
              {qrCodeMessage || (qrCodeStatus === 404
                ? 'This class was not found.'
                : 'QR code has not been generated for this class yet.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
