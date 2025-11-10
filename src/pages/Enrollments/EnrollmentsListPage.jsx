import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchClassEnrollments } from '../../hooks/useFetchEnrollments';
import { useFetchClasses, useFetchClass } from '../../hooks/useFetchClasses';
import { 
  ArrowPathIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const STATUS_LABELS = {
  active: { label: 'Active', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  completed: { label: 'Completed', style: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  cancelled: { label: 'Cancelled', style: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
};

const CLASS_STATUS_LABELS = {
  scheduled: { label: 'Scheduled', style: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  open: { label: 'Open', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  on_going: { label: 'Ongoing', style: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  on_going_waiting_customers: { label: 'Waiting Customers', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  waiting_pt: { label: 'Waiting PT', style: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  completed: { label: 'Completed', style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  cancelled: { label: 'Cancelled', style: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
};

const normalizeDate = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const dateFromSeconds = new Date(value.seconds * 1000);
    return Number.isNaN(dateFromSeconds.getTime()) ? null : dateFromSeconds;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const pickValidDateValue = (candidates = []) => {
  for (const candidate of candidates) {
    const normalized = normalizeDate(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return null;
};

const formatDateTime = (value) => {
  const date = normalizeDate(value);
  if (!date) return 'N/A';
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (value) => {
  const date = normalizeDate(value);
  if (!date) return 'N/A';
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EnrollmentsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const {
    data: classesResponse,
    isLoading: classesLoading,
    error: classesError,
  } = useFetchClasses({ page: 1, limit: 50, status: '' }); // Empty status to get all classes including expired

  const classOptions = useMemo(() => {
    const data = classesResponse?.data || [];
    console.log('[DEBUG] Classes API response:', classesResponse);
    console.log('[DEBUG] First class:', data[0]);
    return data;
  }, [classesResponse]);

  useEffect(() => {
    if (!classesLoading && !selectedClassId) {
      const options = classesResponse?.data || [];
      if (options.length > 0) {
        const firstClassId = options[0]._id || options[0].classId;
        console.log('[DEBUG] Setting first class ID:', firstClassId);
        setSelectedClassId(firstClassId);
      }
    }
  }, [classesLoading, classesResponse, selectedClassId]);

  const {
    data: enrollmentsResponse,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useFetchClassEnrollments({
    classId: selectedClassId,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const {
    data: selectedClassResponse,
  } = useFetchClass(selectedClassId);
  const selectedClassDetails = selectedClassResponse?.data || null;

  const rawData = enrollmentsResponse?.data;
  const enrollments = useMemo(() => {
    if (Array.isArray(rawData)) {
      return rawData;
    }
    if (!rawData?.enrollments) {
      return [];
    }
    console.log('[DEBUG] First enrollment:', rawData.enrollments[0]);
    return rawData.enrollments;
  }, [rawData]);

  const classMeta = useMemo(() => {
    if (Array.isArray(rawData)) {
      return {
        classId: selectedClassId,
        className: selectedClassDetails?.name || '',
        capacity: selectedClassDetails?.capacity,
      };
    }
    return rawData;
  }, [rawData, selectedClassDetails, selectedClassId]);
  
  const staffInfo = classMeta?.staff || {};
  const stats = classMeta?.stats || {};
  
  const pagination = enrollmentsResponse?.pagination || {};
  const enrollmentsMessage = enrollmentsResponse?.message;
  const enrollmentsStatus = enrollmentsResponse?.status;

  const rosterIndex = useMemo(() => {
    const map = new Map();
    if (!selectedClassDetails) {
      return map;
    }

    const candidateLists = selectedClassDetails
      ? [
          selectedClassDetails.enrollments,
          selectedClassDetails.customers,
          selectedClassDetails.members,
          selectedClassDetails.participants,
          selectedClassDetails.registeredMembers,
          selectedClassDetails.attendees,
        ]
      : [];

    const registerItem = (identifier, item) => {
      if (identifier === null || identifier === undefined) {
        return;
      }
      map.set(identifier, item);
      const normalized =
        typeof identifier === 'string'
          ? identifier
          : typeof identifier === 'number'
            ? identifier.toString()
            : typeof identifier?.toString === 'function'
              ? identifier.toString()
              : null;
      if (normalized) {
        map.set(normalized, item);
      }
    };

    candidateLists.forEach((list) => {
      if (!Array.isArray(list)) {
        return;
      }
      list.forEach((item) => {
        const identifiers = [
          item?.enrollmentId,
          item?._id,
          item?.id,
          item?.userId,
          item?.customerId,
          item?.customerId?._id,
          item?.customerId?.id,
        ];
        identifiers.forEach((identifier) => registerItem(identifier, item));
      });
    });

    return map;
  }, [selectedClassDetails]);

  const getRosterMatch = useCallback(
    (enrollment) => {
      if (!enrollment || rosterIndex.size === 0) {
        return null;
      }
      const candidateValues = [
        enrollment.enrollmentId,
        enrollment._id,
        enrollment.id,
        enrollment.userId,
        enrollment.customerId,
        enrollment.user?.userId,
        enrollment.user?._id,
        enrollment.customer?.userId,
        enrollment.customer?._id,
        enrollment.customerId?._id,
        enrollment.customerId?.id,
      ];

      for (const value of candidateValues) {
        if (!value) continue;
        if (rosterIndex.has(value)) {
          return rosterIndex.get(value);
        }
        const normalized =
          typeof value === 'string'
            ? value
            : typeof value === 'number'
              ? value.toString()
              : typeof value?.toString === 'function'
                ? value.toString()
                : null;
        if (normalized && rosterIndex.has(normalized)) {
          return rosterIndex.get(normalized);
        }
      }
      return null;
    },
    [rosterIndex]
  );

  const resolveParticipant = useCallback(
    (enrollment) => {
      if (!enrollment) {
        return {
          name: 'Unknown member',
          email: 'N/A',
          phone: 'N/A',
          id: 'N/A',
          searchTokens: [],
        };
      }

      const rosterMatch = getRosterMatch(enrollment);
      const candidateSources = [
        enrollment.user,
        enrollment.customer,
        enrollment.customerId,
        enrollment.member,
        enrollment.profile,
        enrollment.customerProfile,
        enrollment.customerInfo,
        enrollment.userInfo,
        enrollment.attendee,
        rosterMatch,
      ];

      const selectedSource = candidateSources.find(
        (candidate) =>
          candidate &&
          (candidate.name ||
            candidate.fullName ||
            candidate.displayName ||
            candidate.email ||
            candidate.phone)
      );

      const source = selectedSource || {};

      const rawName =
        source.name ||
        source.fullName ||
        source.displayName ||
        enrollment.userName ||
        enrollment.customerName ||
        enrollment.fullName ||
        '';

      const rawEmail =
        source.email ||
        source.contactEmail ||
        source.userEmail ||
        source.contact?.email ||
        enrollment.userEmail ||
        enrollment.customerEmail ||
        '';

      const rawPhone =
        source.phone ||
        source.mobile ||
        source.contactPhone ||
        source.contact?.phone ||
        enrollment.userPhone ||
        enrollment.customerPhone ||
        '';

      const identifier =
        source.userId ||
        source._id ||
        source.id ||
        source.customerId ||
        enrollment.userId ||
        enrollment.customerId ||
        enrollment.enrollmentId ||
        enrollment._id ||
        'N/A';

      const safeName = rawName || 'Unknown member';

      const identifierToken =
        typeof identifier === 'string'
          ? identifier
          : typeof identifier === 'number'
            ? identifier.toString()
            : identifier && typeof identifier.toString === 'function'
              ? identifier.toString()
              : null;

      const searchTokens = [safeName, rawEmail, rawPhone];
      if (identifierToken) {
        searchTokens.push(identifierToken);
      }

      return {
        name: safeName,
        email: rawEmail || 'N/A',
        phone: rawPhone || 'N/A',
        id: identifier || 'N/A',
        searchTokens: searchTokens.filter(Boolean),
      };
    },
    [getRosterMatch]
  );

  const resolveAttendance = useCallback(
    (enrollment) => {
      if (!enrollment) {
        return { checkInTime: null, checkOutTime: null };
      }
      const rosterMatch = getRosterMatch(enrollment);
      const attendanceSources = [
        enrollment.attendance,
        enrollment.attendanceRecord,
        enrollment.latestAttendance,
        enrollment.classAttendance,
        enrollment.customerAttendance,
        rosterMatch?.attendance,
        rosterMatch?.attendanceRecord,
        rosterMatch?.latestAttendance,
      ].filter(Boolean);

      const checkInCandidates = [
        enrollment.checkinAt,
        enrollment.checkInAt,
        enrollment.checkedInAt,
        enrollment.checkin_at,
        enrollment.check_in_at,
        enrollment.checkInTime,
        enrollment.check_in_time,
      ];

      const checkOutCandidates = [
        enrollment.checkoutAt,
        enrollment.checkOutAt,
        enrollment.checkedOutAt,
        enrollment.checkout_at,
        enrollment.check_out_at,
        enrollment.checkOutTime,
        enrollment.check_out_time,
      ];

      attendanceSources.forEach((source) => {
        checkInCandidates.push(
          source.checkinAt,
          source.checkInAt,
          source.checkedInAt,
          source.checkInTime,
          source.check_in_time,
          source.check_in_at
        );
        checkOutCandidates.push(
          source.checkoutAt,
          source.checkOutAt,
          source.checkedOutAt,
          source.checkOutTime,
          source.check_out_time,
          source.check_out_at
        );
      });

      return {
        checkInTime: pickValidDateValue(checkInCandidates),
        checkOutTime: pickValidDateValue(checkOutCandidates),
      };
    },
    [getRosterMatch]
  );

  const filteredEnrollments = useMemo(() => {
    if (!searchTerm) return enrollments;
    const term = searchTerm.toLowerCase();
    return enrollments.filter((enrollment) => {
      const participant = resolveParticipant(enrollment);
      return participant.searchTokens.some((token) =>
        token.toLowerCase().includes(term)
      );
    });
  }, [enrollments, searchTerm, resolveParticipant]);

  // Create full roster with empty slots based on capacity
  const fullRoster = useMemo(() => {
    const capacity = stats.capacity || classMeta?.capacity || 0;
    if (capacity === 0) {
      return filteredEnrollments;
    }

    const roster = [];
    const enrolledMap = new Map();
    
    // Map existing enrollments
    filteredEnrollments.forEach((enrollment) => {
      enrolledMap.set(enrollment.enrollmentId || enrollment._id, enrollment);
    });

    // Fill roster with enrolled members first
    filteredEnrollments.forEach((enrollment) => {
      roster.push(enrollment);
    });

    // Fill remaining slots with empty placeholders
    const remainingSlots = capacity - roster.length;
    for (let i = 0; i < remainingSlots; i++) {
      roster.push({
        _id: `empty-slot-${i}`,
        isEmpty: true,
        slotNumber: roster.length + 1,
      });
    }

    return roster;
  }, [filteredEnrollments, stats.capacity, classMeta]);

  const attendanceSummary = useMemo(() => {
    return enrollments.reduce(
      (acc, enrollment) => {
        const attendance = resolveAttendance(enrollment);
        if (attendance.checkInTime) {
          acc.checkedIn += 1;
        }
        if (attendance.checkOutTime) {
          acc.checkedOut += 1;
        }
        return acc;
      },
      { checkedIn: 0, checkedOut: 0 }
    );
  }, [enrollments, resolveAttendance]);

  const getStatusBadge = (status) => {
    const config = STATUS_LABELS[status] || STATUS_LABELS.active;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.style}`}>
        {config.label}
      </span>
    );
  };

  const getClassStatusBadge = (status) => {
    const config = CLASS_STATUS_LABELS[status] || CLASS_STATUS_LABELS.scheduled;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.style}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (enrollment) => {
    if (!enrollment) return;
    const enrollmentId = enrollment.enrollmentId || enrollment._id;
    if (!enrollmentId) {
      console.warn('Missing enrollment identifier', enrollment);
      return;
    }

    navigate(`/enrollments/${enrollmentId}`, {
      state: {
        enrollment,
        classInfo: {
          classId: classMeta?.classId || selectedClassId,
          className: classMeta?.className || '',
        },
      },
    });
  };

  const rawRegisteredCount =
    selectedClassDetails?.currentEnrollment ??
    enrollmentsResponse?.pagination?.total ??
    enrollments.length;
  const registeredCount =
    typeof rawRegisteredCount === 'number'
      ? rawRegisteredCount
      : Number(rawRegisteredCount);
  const normalizedRegisteredCount = Number.isFinite(registeredCount)
    ? registeredCount
    : enrollments.length;

  const rawCapacity = selectedClassDetails?.capacity ?? classMeta?.capacity ?? null;
  const capacityNumber =
    typeof rawCapacity === 'number' ? rawCapacity : Number(rawCapacity);
  const classCapacity = Number.isFinite(capacityNumber) ? capacityNumber : null;

  const availableSlots =
    typeof classCapacity === 'number'
      ? Math.max(classCapacity - normalizedRegisteredCount, 0)
      : null;

  const resolvedClassName =
    classMeta?.className ||
    selectedClassDetails?.name ||
    classOptions.find((classItem) => classItem._id === selectedClassId)?.name ||
    '';

  if (classesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (classesError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
        <p className="text-sm text-red-700 dark:text-red-200">Failed to load classes. Please try again later.</p>
      </div>
    );
  }

  if (classOptions.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-900/20">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">No classes available</h2>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
          Create a class first to manage enrollments.
        </p>
        <Link
          to="/classes/create"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700"
        >
          Create Class
        </Link>
      </div>
    );
  }

  if (!selectedClassId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track and manage enrollments for each class.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchEnrollments()}
            disabled={enrollmentsLoading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className={`h-4 w-4 ${enrollmentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to={selectedClassId ? `/classes/${selectedClassId}` : '/classes'}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            View Class
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {classOptions.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search enrollments</label>
          <input
            type="text"
            placeholder="Search by member name, email, or phone"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {classMeta && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {resolvedClassName || classMeta.className || 'Selected class'}
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  {classMeta.classStatus && getClassStatusBadge(classMeta.classStatus)}
                  {classMeta.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{classMeta.location}</span>
                    </div>
                  )}
                </div>
              </div>
              {(classMeta.startTime || classMeta.endTime) && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatTime(classMeta.startTime)} - {formatTime(classMeta.endTime)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.capacity || classMeta.capacity || classCapacity || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Registered</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {stats.registered || classMeta.currentEnrollment || normalizedRegisteredCount || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Checked In</p>
              <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {stats.checkedIn || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Checked Out</p>
              <p className="mt-1 text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {stats.checkedOut || 0}
              </p>
            </div>
          </div>

          {/* PT Information */}
          {staffInfo && staffInfo.name && (
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Personal Trainer</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{staffInfo.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{staffInfo.email}</span>
                    {staffInfo.phone && <span>• {staffInfo.phone}</span>}
                  </div>
                </div>
                <div className="text-right">
                  {staffInfo.checkInAt ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 dark:text-green-400">Checked In</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(staffInfo.checkInAt)}</p>
                      {staffInfo.checkInMethod && (
                        <p className="text-xs text-gray-500">via {staffInfo.checkInMethod}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircleIcon className="h-4 w-4" />
                      <span>Not checked in</span>
                    </div>
                  )}
                  {staffInfo.checkOutAt && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-600 dark:text-purple-400">Checked Out</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(staffInfo.checkOutAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {enrollmentsLoading ? (
        <div className="flex h-72 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
        </div>
      ) : enrollmentsError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-200">Failed to load enrollments for this class.</p>
        </div>
      ) : enrollmentsStatus === 404 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          {enrollmentsMessage || 'Class not found or has been removed.'}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {fullRoster.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-600 dark:text-gray-400">
              No capacity set for this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Enrolled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {fullRoster.map((enrollment, index) => {
                    // Handle empty slots
                    if (enrollment.isEmpty) {
                      return (
                        <tr key={enrollment._id} className="bg-gray-50 dark:bg-gray-800/50">
                          <td className="px-6 py-4 text-sm">
                            <p className="font-medium text-gray-400 dark:text-gray-600">
                              Unknown member
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-600">Slot {enrollment.slotNumber}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-600">
                            <div className="flex flex-col gap-1">
                              <span>N/A</span>
                              <span className="text-xs">N/A</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-600">—</td>
                          <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-600">—</td>
                          <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-600">—</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                              Empty
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                          </td>
                        </tr>
                      );
                    }

                    // Handle enrolled members
                    // API returns flat structure: enrollment.name, enrollment.phone, enrollment.email, enrollment.userId
                    const participant = {
                      name: enrollment.name || enrollment.user?.name || 'Unknown member',
                      email: enrollment.email || enrollment.user?.email || 'N/A',
                      phone: enrollment.phone || enrollment.user?.phone || 'N/A',
                      id: enrollment.userId || enrollment.user?.userId || enrollment._id || 'N/A',
                    };
                    
                    const attendance = resolveAttendance(enrollment);
                    const checkinField = enrollment.checkInAt || enrollment.checkinAt || attendance.checkInTime;
                    const checkoutField = enrollment.checkOutAt || enrollment.checkoutAt || attendance.checkOutTime;
                    const checkinMethod = enrollment.checkInMethod || enrollment.checkinMethod;
                    const checkoutMethod = enrollment.checkOutMethod || enrollment.checkoutMethod;

                    return (
                      <tr key={enrollment.enrollmentId || enrollment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {participant.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {participant.id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col gap-1">
                            <span>{participant.email}</span>
                            <span className="text-xs">{participant.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDateTime(enrollment.enrolledAt || enrollment.createdAt || enrollment.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {checkinField ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="font-medium">{formatTime(checkinField)}</span>
                              </div>
                              {checkinMethod && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">via {checkinMethod}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {checkoutField ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="font-medium">{formatTime(checkoutField)}</span>
                              </div>
                              {checkoutMethod && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">via {checkoutMethod}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(enrollment.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(enrollment)}
                            className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              disabled={page === pagination.pages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Registered</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {normalizedRegisteredCount}
            {classCapacity ? ` / ${classCapacity}` : ''}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Checked-in</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">{attendanceSummary.checkedIn}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Checked-out</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{attendanceSummary.checkedOut}</p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsListPage;
