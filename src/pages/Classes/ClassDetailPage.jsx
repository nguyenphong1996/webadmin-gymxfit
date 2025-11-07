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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CLASS_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  },
  scheduled: {
    label: 'Scheduled',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  waiting_pt: {
    label: 'Waiting PT',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  on_going_waiting_customers: {
    label: 'PT Checked In',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  },
  on_going: {
    label: 'In Session',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  waiting_checkout: {
    label: 'Waiting Checkout',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  expired: {
    label: 'Expired',
    badgeClass: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  },
  overdue: {
    label: 'Overdue',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  full: {
    label: 'Full Capacity',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
};

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
  const [isDownloadingQRCode, setIsDownloadingQRCode] = useState(false);
  const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('cancelled');

  const classItem = classData?.data;
  const classIdFromData = classItem?._id || classItem?.id;
  const resolvedClassId = classIdFromData || id;
  const classStatusConfig =
    (classItem?.status && CLASS_STATUS_CONFIG[classItem.status]) || CLASS_STATUS_CONFIG.draft;

  React.useEffect(() => {
    setActionFeedback(null);
    setShowCloseConfirm(false);
    if (!classItem?.status) {
      setCloseReason('cancelled');
      return;
    }
    const defaultCloseReason =
      classItem.status === 'waiting_checkout' || classItem.status === 'overdue' ? 'completed' : 'cancelled';
    setCloseReason(defaultCloseReason);
  }, [classItem?.status]);

  React.useEffect(() => {
    if (!isQrPreviewOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsQrPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQrPreviewOpen]);

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

  const qrCodeInfo = qrCodeData?.data?.qrCode || classItem.qrCode;
  const qrCodeMessage = qrCodeData?.message;
  const qrCodeStatus = qrCodeData?.status;
  const isQRCodeAvailable = Boolean(qrCodeInfo?.url);
  const qrEligibleStatuses = ['draft', 'scheduled'];
  const canGenerateQRCode = qrEligibleStatuses.includes(classItem.status);
  const isGeneratingQRCode = generateQRCodeMutation.isPending;
  const isOpeningClass = openClassMutation.isPending;
  const isClosingClass = closeClassMutation.isPending;
  const now = new Date();
  const startTime = classItem?.startTime ? new Date(classItem.startTime) : null;
  const endTime = classItem?.endTime ? new Date(classItem.endTime) : null;
  const classHasStarted = Boolean(startTime) && !Number.isNaN(startTime) && now >= startTime;
  const classHasEnded = Boolean(endTime) && !Number.isNaN(endTime) && now >= endTime;
  const isClosedStatus = ['completed', 'cancelled', 'expired'].includes(classItem.status);
  const isOverdueStatus = classItem.status === 'overdue';
  const isWaitingCheckoutStatus = classItem.status === 'waiting_checkout';
  const isWaitingPtStatus = classItem.status === 'waiting_pt';
  const isPtWaitingCustomersStatus = classItem.status === 'on_going_waiting_customers';
  const isInSessionStatus = classItem.status === 'on_going';
  const canManuallyCloseStatus = [
    'scheduled',
    'waiting_pt',
    'on_going_waiting_customers',
    'on_going',
    'waiting_checkout',
    'overdue',
  ].includes(classItem.status);
  const formattedClassEndTime = classItem?.endTime
    ? new Date(classItem.endTime).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;
  const DEFAULT_CHECKOUT_GRACE_MINUTES = 15;
  const checkoutGraceMinutesCandidates = [
    classItem?.checkoutGraceMinutes,
    classItem?.checkoutGracePeriodMinutes,
    classItem?.attendanceSettings?.checkoutGraceMinutes,
    classItem?.attendanceSettings?.checkoutGracePeriodMinutes,
  ];
  const explicitCheckoutGraceMinutes = checkoutGraceMinutesCandidates.find(
    (value) => typeof value === 'number' && Number.isFinite(value)
  );
  const checkoutGraceMinutes = explicitCheckoutGraceMinutes ?? DEFAULT_CHECKOUT_GRACE_MINUTES;

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

  const handleDownloadQRCodeImage = async () => {
    if (!qrCodeInfo?.url || isDownloadingQRCode) {
      return;
    }

    try {
      setIsDownloadingQRCode(true);
      const response = await fetch(qrCodeInfo.url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to fetch QR code image');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `class-${classItem._id || classItem.id || 'qr'}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error('Failed to download QR code image:', downloadError);
      setQrFeedback({
        type: 'error',
        message: 'Không thể tải QR code. Vui lòng thử lại.',
      });
    } finally {
      setIsDownloadingQRCode(false);
    }
  };

  const handleOpenQrPreview = () => {
    if (!qrCodeInfo?.url) {
      return;
    }
    setIsQrPreviewOpen(true);
  };

  const handleCloseQrPreview = () => {
    setIsQrPreviewOpen(false);
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
      const reason = closeReason === 'completed' ? 'completed' : 'cancelled';
      await closeClassMutation.mutateAsync({ classId: resolvedClassId, reason });
      await refetchClass();
      setActionFeedback({
        type: 'success',
        message: reason === 'completed' ? 'Class marked as completed.' : 'Class marked as cancelled.',
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
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classStatusConfig.badgeClass}`}
                  >
                    {classStatusConfig.label}
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
            {/* PT Check-in card (for class-level PT status) */}
            <div className="mt-4">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">PT Check-in</h3>
                <div className="mt-2 flex items-center justify-between">
                  {/* Determine PT checked-in based on class status or explicit timestamp */}
                  {(() => {
                    const ptCheckedInStatuses = ['on_going_waiting_customers', 'on_going', 'waiting_pt', 'on_going_waiting_customers'];
                    const ptChecked = ptCheckedInStatuses.includes(classItem?.status) || Boolean(classItem?.ptCheckInAt || classItem?.staffCheckInAt || classItem?.ptCheckedInAt);
                    const ptCheckTime = classItem?.ptCheckInAt || classItem?.staffCheckInAt || classItem?.ptCheckedInAt || null;

                    return (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">PT</p>
                          <p className="mt-1 text-gray-900 dark:text-white font-medium">{classItem?.staffId?.name || classItem?.staff?.name || 'Unassigned'}</p>
                        </div>
                        <div className="text-right">
                          {ptChecked ? (
                            <div className="inline-flex items-center gap-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                Checked in
                              </span>
                              {ptCheckTime && <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(ptCheckTime).toLocaleString()}</div>}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                Not checked in
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

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

              {classItem.status === 'scheduled' && classHasStarted && !classHasEnded && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-700 shadow-sm dark:border-blue-500/40 dark:bg-blue-900/20 dark:text-blue-100">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Class window is open.</p>
                      <p>Remind the trainer to scan the class QR code so the session advances to PT readiness.</p>
                      <p>If customers arrive first, the class will move to Waiting PT automatically.</p>
                    </div>
                  </div>
                </div>
              )}

              {classItem.status === 'scheduled' && classHasEnded && !isClosedStatus && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-700 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Class end time has passed.</p>
                      <p>Status is still Scheduled, meaning no attendance was recorded. Confirm with the trainer if this session should be cancelled or marked no-show.</p>
                    </div>
                  </div>
                </div>
              )}

              {isWaitingPtStatus && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-700 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Customer is waiting for PT.</p>
                      <p>At least one member has checked in but the assigned trainer has not. Reach out to the trainer to confirm arrival.</p>
                    </div>
                  </div>
                </div>
              )}

              {isPtWaitingCustomersStatus && (
                <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-left text-sm text-teal-700 shadow-sm dark:border-teal-500/40 dark:bg-teal-900/20 dark:text-teal-100">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="h-5 w-5 flex-shrink-0 text-teal-500 dark:text-teal-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-teal-900 dark:text-teal-100">Trainer is ready.</p>
                      <p>No members have scanned in yet. Ping the roster to confirm attendance if the session has already started.</p>
                    </div>
                  </div>
                </div>
              )}

              {isInSessionStatus && classHasEnded && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-700 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-500 dark:text-amber-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Class is past the scheduled end.</p>
                      <p>{`Check-outs remain available for ${checkoutGraceMinutes} minute${checkoutGraceMinutes === 1 ? '' : 's'} after the scheduled end.`}</p>
                      <p>Encourage the trainer to check everyone out so the system can move to Waiting Checkout.</p>
                    </div>
                  </div>
                </div>
              )}

              {isWaitingCheckoutStatus && (
                <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4 text-left text-sm text-indigo-700 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-900/20 dark:text-indigo-100">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-indigo-500 dark:text-indigo-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-indigo-900 dark:text-indigo-100">Awaiting final check-outs.</p>
                      <p>{`Checkout window remains open for ${checkoutGraceMinutes} minute${checkoutGraceMinutes === 1 ? '' : 's'} post-session.`}</p>
                      <p>Once everyone checks out, the system will auto-complete; otherwise close the class manually after verifying attendance.</p>
                    </div>
                  </div>
                </div>
              )}

              {isOverdueStatus && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700 shadow-sm dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-100">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-red-900 dark:text-red-100">Checkout window exceeded.</p>
                      <p>At least one attendee has not checked out after the grace period. Confirm headcount and close the class when ready.</p>
                    </div>
                  </div>
                </div>
              )}

              {classItem.status === 'expired' && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700 shadow-sm dark:border-slate-600/40 dark:bg-slate-900/30 dark:text-slate-100">
                  <div className="flex items-start gap-3">
                    <XMarkIcon className="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-300" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Session expired with no-show.</p>
                      <p>No qualifying check-ins were recorded before the end time. Confirm whether to keep this as expired or cancel and reschedule.</p>
                    </div>
                  </div>
                </div>
              )}

              {classItem.status === 'completed' && (
                <div className="rounded-md border border-purple-200 bg-purple-50 p-4 text-left text-sm text-purple-700 shadow-sm dark:border-purple-600/60 dark:bg-purple-900/40 dark:text-purple-100">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-purple-500 dark:text-purple-300" />
                    <div className="space-y-2">
                      <p className="font-semibold text-purple-900 dark:text-purple-100">
                        {formattedClassEndTime
                          ? `Class ended at ${formattedClassEndTime}. Status is now Completed.`
                          : 'Class status is now Completed.'}
                      </p>
                      <p>Check-ins are blocked. Attendance records remain accessible for reporting.</p>
                      <p>
                        {`Check-outs remain available for ${checkoutGraceMinutes} minute${checkoutGraceMinutes === 1 ? '' : 's'} after the scheduled end. Once that grace window expires, users will see "Checkout window closed".`}
                      </p>
                      <p>Please review the attendance report if you need to confirm who checked out.</p>
                    </div>
                  </div>
                </div>
              )}

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

              {canManuallyCloseStatus && (
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
                        {closeReason === 'completed'
                          ? 'This finalizes attendance and marks the session as completed.'
                          : 'This marks the session as cancelled immediately and prevents any further check-ins or enrollments.'}
                      </p>
                      <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-300">
                        Close as
                      </label>
                      <select
                        value={closeReason}
                        onChange={(event) =>
                          setCloseReason(event.target.value === 'completed' ? 'completed' : 'cancelled')
                        }
                        className="mt-1 w-full rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 dark:border-red-600 dark:bg-red-900/60 dark:text-red-100"
                      >
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {closeReason === 'completed' ? (
                        <p className="mt-2 text-[11px] text-red-600 dark:text-red-200/80">
                          Ensure trainer and members have checked out before completing.
                        </p>
                      ) : (
                        <p className="mt-2 text-[11px] text-red-600 dark:text-red-200/80">
                          Use cancellation when the session is abandoned or needs to be rescheduled.
                        </p>
                      )}
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
                          className="inline-flex flex-1 items-center justify-center rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-600"
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
                QR code regeneration is available only before any attendance is recorded (Draft or Scheduled).
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
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600'
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
                <button
                  type="button"
                  onClick={handleOpenQrPreview}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-gray-700 dark:bg-gray-900"
                >
                  <img
                    src={qrCodeInfo.url}
                    alt={`QR code for ${classItem.name}`}
                    className="h-48 w-48 object-contain"
                  />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadQRCodeImage}
                    disabled={isDownloadingQRCode}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {isDownloadingQRCode ? 'Downloading...' : 'Download'}
                  </button>
                </div>
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

      {isQrPreviewOpen && qrCodeInfo?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={handleCloseQrPreview}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseQrPreview}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Close QR code preview"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
              <img
                src={qrCodeInfo.url}
                alt={`Enlarged QR code for ${classItem.name}`}
                className="mx-auto max-h-[70vh] w-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
