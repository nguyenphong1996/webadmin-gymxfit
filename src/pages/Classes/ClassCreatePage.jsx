import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCreateClass } from '../../hooks/useFetchClasses';
import { useFetchStaffByCategory } from '../../hooks/useFetchStaff';
import { classesApi } from '../../api/classesApi';
import { CATEGORY_OPTIONS, getSubcategories } from '../../constants/categories';
import { CLASS_TIME_SLOTS, buildSlotDateTime, getSlotById } from '../../constants/classTimeSlots';

dayjs.locale('vi');

const MIN_CLASS_DURATION_MINUTES = 15;
const getDateFieldSx = (hasError) => (theme) => {
  const isDark = theme.palette.mode === 'dark';
  const baseBg = isDark ? 'rgb(55 65 81)' : 'rgb(255 255 255)';
  const baseText = isDark ? 'rgb(248 250 252)' : 'rgb(17 24 39)';
  const baseBorder = hasError
    ? 'rgb(248 113 113)'
    : isDark
      ? 'rgb(75 85 99)'
      : 'rgb(209 213 219)';

  return {
    mt: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: '0.375rem',
      backgroundColor: baseBg,
      color: baseText,
      paddingRight: '0.5rem',
      '& fieldset': {
        borderColor: baseBorder,
        borderWidth: '1px',
      },
      '& legend': {
        display: 'none',
      },
      '&:hover fieldset': {
        borderColor: hasError ? 'rgb(248 113 113)' : 'rgb(59 130 246)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgb(59 130 246)',
        borderWidth: '2px',
      },
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      color: baseText,
    },
    '& .MuiSvgIcon-root': {
      color: isDark ? 'rgb(248 250 252)' : 'rgb(55 65 81)',
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      lineHeight: '1rem',
      color: hasError ? 'rgb(248 113 113)' : isDark ? 'rgb(209 213 219)' : 'rgb(107 114 128)',
    },
  };
};

const buildDefaultSlotAvailability = () => {
  const map = {};
  CLASS_TIME_SLOTS.forEach((slot) => {
    map[slot.id] = {
      status: 'idle',
      isBlocked: false,
      message: '',
      data: null,
    };
  });
  return map;
};

const buildIsoWithOffset = (date, time) => {
  if (!date || !time) {
    return '';
  }
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');
  return `${date}T${normalizedTime}.000${sign}${hours}:${minutes}`;
};

const ClassCreatePage = () => {
  const navigate = useNavigate();
  const createClassMutation = useCreateClass();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    capacity: '',
    date: '',
    timeSlotId: '',
    startTime: '',
    endTime: '',
    staffId: '',
    location: '',
    isCustomTime: false,
    customStartTime: '',
    customEndTime: '',
  });
  const [errors, setErrors] = useState({});
  const [slotAvailability, setSlotAvailability] = useState(() => buildDefaultSlotAvailability());
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [allowBusySlotSelection, setAllowBusySlotSelection] = useState(false);

  const { data: staffData, isLoading: isStaffLoading } = useFetchStaffByCategory(formData.category);
  const staffList = useMemo(() => staffData?.data || [], [staffData]);

  const subcategories = useMemo(() => getSubcategories(formData.category), [formData.category]);
  const selectedInstructor = useMemo(
    () => staffList.find((staff) => staff._id === formData.staffId),
    [staffList, formData.staffId]
  );
  const selectedSlotInfo = formData.timeSlotId ? slotAvailability[formData.timeSlotId] : null;
  const canEvaluateAvailability = Boolean(formData.staffId && formData.date);
  const selectedSlotIsBlocked = Boolean(selectedSlotInfo?.isBlocked && canEvaluateAvailability);
  const hasBusySlots =
    canEvaluateAvailability && Object.values(slotAvailability).some((slot) => slot.isBlocked);
  const shouldDisableSlotSelect = !formData.date;
  const minDate = useMemo(() => dayjs().startOf('day'), []);
  const datePickerValue = formData.date ? dayjs(formData.date, 'YYYY-MM-DD') : null;

  const resetSlotState = () => {
    setSlotAvailability(buildDefaultSlotAvailability());
    setAvailabilityError(null);
    setAllowBusySlotSelection(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'category') {
        return {
          ...prev,
          category: value,
          subcategory: '',
          staffId: '',
        };
      }

      if (name === 'isCustomTime') {
        return {
          ...prev,
          isCustomTime: value === 'custom',
          timeSlotId: '',
          customStartTime: '',
          customEndTime: '',
          startTime: '',
          endTime: '',
        };
      }

      if ((name === 'customStartTime' || name === 'customEndTime') && prev.isCustomTime) {
        const nextValues = {
          ...prev,
          [name]: value,
        };
        if (nextValues.customStartTime && nextValues.customEndTime && nextValues.date) {
          nextValues.startTime = buildSlotDateTime(nextValues.date, nextValues.customStartTime);
          nextValues.endTime = buildSlotDateTime(nextValues.date, nextValues.customEndTime);
        } else {
          nextValues.startTime = '';
          nextValues.endTime = '';
        }
        return nextValues;
      }

      if (name === 'date' || name === 'timeSlotId') {
        const nextValues = {
          ...prev,
          [name]: value,
        };
        const slotIdToUse = name === 'timeSlotId' ? value : nextValues.timeSlotId;
        const dateToUse = name === 'date' ? value : nextValues.date;
        const resolvedSlot = getSlotById(slotIdToUse);
        if (resolvedSlot && dateToUse) {
          nextValues.startTime = buildSlotDateTime(dateToUse, resolvedSlot.start);
          nextValues.endTime = buildSlotDateTime(dateToUse, resolvedSlot.end);
        } else if (!prev.isCustomTime) {
          nextValues.startTime = '';
          nextValues.endTime = '';
        }
        return nextValues;
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    if (['category', 'staffId', 'date'].includes(name)) {
      resetSlotState();
    }

    setErrors((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (next[name]) {
        next[name] = '';
      }
      if ((name === 'date' || name === 'timeSlotId') && next.timeSlotId) {
        next.timeSlotId = '';
      }
      if ((name === 'date' || name === 'timeSlotId') && (next.startTime || next.endTime)) {
        next.startTime = '';
        next.endTime = '';
      }
      if ((name === 'customStartTime' || name === 'customEndTime') && (next.customStartTime || next.customEndTime)) {
        next.customStartTime = '';
        next.customEndTime = '';
      }
      if (next.submit) {
        next.submit = '';
      }
      return next;
    });
  };

  const handleDateChange = (value) => {
    const formattedValue =
      value && value.isValid() ? value.startOf('day').format('YYYY-MM-DD') : '';
    handleInputChange({ target: { name: 'date', value: formattedValue } });
  };

  useEffect(() => {
    if (formData.isCustomTime || !canEvaluateAvailability) {
      setIsCheckingSlots(false);
      return;
    }

    let isCancelled = false;

    const fetchAvailability = async () => {
      setIsCheckingSlots(true);
      setAvailabilityError(null);
      try {
        const results = await Promise.all(
          CLASS_TIME_SLOTS.map(async (slot) => {
            const startIso = buildIsoWithOffset(formData.date, slot.start);
            const endIso = buildIsoWithOffset(formData.date, slot.end);
            if (!startIso || !endIso) {
              return [
                slot.id,
                { status: 'idle', isBlocked: false, message: '', data: null },
              ];
            }
            
            try {
              const response = await classesApi.checkTrainerSlotAvailability({
                staffId: formData.staffId,
                date: formData.date,
                startTime: startIso,
                endTime: endIso,
              });
              const slotData = response?.data ?? response;
              const hasClassConflict = Boolean(slotData?.hasClassConflict);
              const hasBookingConflict = Boolean(slotData?.hasBookingConflict);
              const isAvailable =
                slotData?.isAvailable !== false && !hasClassConflict && !hasBookingConflict;
              const reasonParts = [];
              if (hasClassConflict) reasonParts.push('class khác');
              if (hasBookingConflict) reasonParts.push('booking riêng');
              const message =
                slotData?.message ||
                (isAvailable
                  ? ''
                  : `PT đã bận ca này${reasonParts.length ? ` (${reasonParts.join(' & ')})` : ''}`);
              return [
                slot.id,
                {
                  status: 'done',
                  isBlocked: !isAvailable,
                  message,
                  data: slotData,
                },
              ];
            } catch (error) {
              // If API fails, default to available (don't block user)
              return [
                slot.id,
                { status: 'done', isBlocked: false, message: '', data: null },
              ];
            }
          })
        );

        if (isCancelled) {
          return;
        }

        const nextState = buildDefaultSlotAvailability();
        results.forEach(([slotId, info]) => {
          nextState[slotId] = info;
        });
        setSlotAvailability(nextState);
      } catch (error) {
        // Silently fail and default all slots to available
        console.warn('PT availability check failed, defaulting to available:', error.message);
        if (isCancelled) {
          return;
        }
        setSlotAvailability(buildDefaultSlotAvailability());
      } finally {
        if (!isCancelled) {
          setIsCheckingSlots(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isCancelled = true;
    };
  }, [canEvaluateAvailability, formData.date, formData.staffId, formData.isCustomTime]);

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

    if (!formData.date) {
      newErrors.date = 'Class date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(`${formData.date}T00:00:00`);
      if (selectedDate < today) {
        newErrors.date = 'Selected date cannot be in the past';
      }
    }

    if (formData.isCustomTime) {
      if (!formData.customStartTime) {
        newErrors.customStartTime = 'Start time is required';
      }

      if (!formData.customEndTime) {
        newErrors.customEndTime = 'End time is required';
      }

      if (formData.customStartTime && formData.customEndTime && formData.startTime && formData.endTime) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        if (end <= start) {
          newErrors.customEndTime = 'End time must be after start time';
        } else {
          const durationMinutes = (end - start) / (1000 * 60);
          if (durationMinutes < MIN_CLASS_DURATION_MINUTES) {
            newErrors.customEndTime = `Class duration must be at least ${MIN_CLASS_DURATION_MINUTES} minutes`;
          }
        }
        if (start <= new Date()) {
          newErrors.customStartTime = 'Start time must be in the future';
        }
      }
    } else {
      if (!formData.timeSlotId) {
        newErrors.timeSlotId = 'Khung giờ cố định là bắt buộc';
      }

      const blockingSlot = formData.timeSlotId ? slotAvailability[formData.timeSlotId] : null;
      if (blockingSlot?.isBlocked && !allowBusySlotSelection) {
        newErrors.timeSlotId = 'PT đã bận ca này (class khác hoặc booking riêng)';
      }

      if (formData.startTime && new Date(formData.startTime) <= new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && !formData.isCustomTime) {
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

    const formattedData = {
      name: formData.name.trim(),
      category: formData.category,
      subcategory: formData.subcategory,
      capacity: parseInt(formData.capacity, 10),
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      staffId: formData.staffId,
      location: formData.location.trim(),
    };

    try {
      await createClassMutation.mutateAsync(formattedData);
      navigate('/classes');
    } catch (error) {
      console.error('Failed to create class:', error);
      const errorMessage =
        error.response?.data?.data?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create class. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          to="/classes"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Class</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Các lớp phải tuân theo ca cố định 2 giờ để đồng bộ với lịch booking riêng của PT.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-100">
            <p className="font-semibold">Nguyên tắc xếp ca</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Ca chuẩn: 08-10 · 10-12 · 12-14 · 14-16 · 16-18 · 18-20 (không nghỉ trưa).</li>
              <li>Khi chọn ca và PT, hệ thống tự khóa ca đó khỏi booking riêng của khách hàng.</li>
              <li>Nếu PT đã có lớp hoặc lịch coaching trùng ca, mục chọn ca sẽ báo “PT bận”.</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="space-y-6 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Strength Builder"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategory {formData.category && '*'}
                  </label>
                  {formData.category ? (
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.subcategory ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Select category first"
                    />
                  )}
                  {errors.subcategory && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.subcategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.capacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Max participants"
                  />
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.capacity}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày diễn ra *
                  </label>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                    <DatePicker
                      value={datePickerValue}
                      onChange={handleDateChange}
                      format="DD/MM/YYYY"
                      minDate={minDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          placeholder: 'dd/mm/yyyy',
                          error: Boolean(errors.date),
                          helperText: errors.date || undefined,
                          sx: getDateFieldSx(Boolean(errors.date)),
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Thời gian diễn ra *
                    </label>
                    {!formData.isCustomTime && canEvaluateAvailability && isCheckingSlots && (
                      <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></span>
                        Đang kiểm tra
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isCustomTime"
                        value="fixed"
                        checked={!formData.isCustomTime}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Ca cố định</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isCustomTime"
                        value="custom"
                        checked={formData.isCustomTime}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Giờ tự do</span>
                    </label>
                  </div>

                  {!formData.isCustomTime ? (
                    <>
                      <select
                        name="timeSlotId"
                        value={formData.timeSlotId}
                        onChange={handleInputChange}
                        disabled={shouldDisableSlotSelect}
                        className={`mt-3 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.timeSlotId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">{shouldDisableSlotSelect ? 'Chọn ngày trước' : 'Chọn ca'}</option>
                        {CLASS_TIME_SLOTS.map((slot) => {
                          const slotState = slotAvailability[slot.id];
                          const slotBlocked =
                            canEvaluateAvailability && slotState?.isBlocked && !allowBusySlotSelection;
                          return (
                            <option key={slot.id} value={slot.id} disabled={slotBlocked}>
                              {slot.label}
                              {slotState?.isBlocked && canEvaluateAvailability ? ' · PT bận' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {errors.timeSlotId && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.timeSlotId}</p>
                      )}
                      {!shouldDisableSlotSelect && !canEvaluateAvailability && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Chọn PT để kiểm tra lịch bận trước khi khoá ca.
                        </p>
                      )}
                      {availabilityError && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{availabilityError}</p>
                      )}
                      {hasBusySlots && (
                        <label className="mt-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                          <input
                            type="checkbox"
                            className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 dark:border-amber-500"
                            checked={allowBusySlotSelection}
                            onChange={(event) => setAllowBusySlotSelection(event.target.checked)}
                          />
                          Cho phép chọn ca PT đang bận (sẽ hiển thị cảnh báo trước khi tạo)
                        </label>
                      )}
                      {selectedSlotIsBlocked && (
                        <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">
                              {selectedSlotInfo?.message ||
                                'PT đã bận ca này (class khác hoặc booking riêng).'}
                            </p>
                            <p className="text-xs">
                              {allowBusySlotSelection
                                ? 'Bạn đã chọn tiếp tục tạo lớp dù PT đang bận.'
                                : 'Chọn ca khác hoặc bật tuỳ chọn trên để chấp nhận tạo lớp ở ca này.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Giờ bắt đầu *
                          </label>
                          <input
                            type="time"
                            name="customStartTime"
                            value={formData.customStartTime}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.customStartTime ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.customStartTime && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.customStartTime}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Giờ kết thúc *
                          </label>
                          <input
                            type="time"
                            name="customEndTime"
                            value={formData.customEndTime}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              errors.customEndTime ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.customEndTime && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.customEndTime}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Thời gian class sẽ được tạo dựa trên ngày bạn chọn kết hợp với giờ bắt đầu và kết thúc
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instructor *{' '}
                    {formData.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({staffList.length} active PT)
                      </span>
                    )}
                  </label>
                  {formData.category ? (
                    <select
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleInputChange}
                      disabled={isStaffLoading}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.staffId ? 'border-red-300' : 'border-gray-300'
                      } ${isStaffLoading ? 'opacity-50' : ''}`}
                    >
                      <option value="">
                        {isStaffLoading ? 'Loading PT list...' : 'Select instructor'}
                      </option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} {staff.phone ? `(${staff.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option>Select category first</option>
                    </select>
                  )}
                  {errors.staffId && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.staffId}</p>
                  )}
                  {formData.category && !isStaffLoading && staffList.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">
                      Không có PT active với kỹ năng này. Kích hoạt hoặc phê duyệt kỹ năng cho PT trước.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Studio A"
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-200">{errors.submit}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:justify-end">
            <Link
              to="/classes"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createClassMutation.isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createClassMutation.isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Creating...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Create Class
                </>
              )}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default ClassCreatePage;
