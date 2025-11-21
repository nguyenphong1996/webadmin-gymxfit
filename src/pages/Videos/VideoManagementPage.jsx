import React, { useMemo, useState } from 'react';
import {
  PlayCircleIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Hls from 'hls.js';
import { CATEGORY_OPTIONS, getSubcategories } from '../../constants/categories';
import {
  useFetchVideo,
  useFetchVideoSubcategories,
  useFetchVideos,
  useUploadVideo,
  useDeleteVideo,
} from '../../hooks/useVideos';

const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const segments = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(remainingSeconds).padStart(2, '0'),
  ].filter(Boolean);

  return segments.join(':');
};

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

const categoryOptions = Object.entries(CATEGORY_OPTIONS).map(([value, { label }]) => ({
  value,
  label,
}));

const FeedbackBanner = ({ message, type = 'success', onDismiss }) => {
  if (!message) return null;

  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';

  return (
    <div className={`border rounded-lg px-4 py-3 flex justify-between items-start ${styles}`}>
      <div className="flex items-start gap-3 text-sm font-medium">
        {type === 'success' ? '✅' : '⚠️'}
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-sm text-current hover:opacity-70 transition-opacity"
      >
        Đóng
      </button>
    </div>
  );
};

const VideoCard = ({ video, onPreview, onDelete }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
    <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <PhotoIcon className="h-16 w-16 text-gray-300" />
      )}
      <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold bg-black/70 text-white rounded-md">
        {formatDuration(video.duration)}
      </span>
    </div>
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {video.title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            {CATEGORY_OPTIONS[video.category]?.label || video.category}
          </span>
          {video.subcategory && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
              {video.subcategory}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          <FireIcon className="h-4 w-4" />
          {video.estimated_calories} kcal
        </span>
        <span className="inline-flex items-center gap-1">
          <EyeIcon className="h-4 w-4" />
          {video.views ?? 0} lượt xem
        </span>
      </div>
      <div className="flex gap-3 mt-auto pt-2">
        <button
          onClick={() => onPreview(video.id)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <PlayCircleIcon className="h-5 w-5" />
          Xem
        </button>
        <button
          onClick={() => onDelete(video)}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
          Xoá
        </button>
      </div>
    </div>
  </div>
);

const VideoPreviewModal = ({ videoId, onClose }) => {
  const videoRef = React.useRef(null);
  const hlsRef = React.useRef(null);
  const { data, isLoading, error } = useFetchVideo(videoId, {
    enabled: !!videoId,
  });

  React.useEffect(() => {
    const streamingUrl = data?.video?.streaming_url;
    const videoElement = videoRef.current;

    if (!videoElement || !streamingUrl) {
      return undefined;
    }

    if (videoElement.canPlayType('application/vnd.apple.mpegURL')) {
      videoElement.src = streamingUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamingUrl);
      hls.attachMedia(videoElement);
      hlsRef.current = hls;
    } else {
      videoElement.src = streamingUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoElement) {
        videoElement.removeAttribute('src');
      }
    };
  }, [data?.video?.streaming_url]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {data?.video?.title || 'Đang tải video...'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              controls
              className="w-full aspect-video"
              poster={data?.video?.thumbnail}
            />
          </div>

          <div className="px-6 py-4 space-y-3">
            {isLoading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu video...</p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-300">
                Không thể tải video. Vui lòng thử lại.
              </p>
            )}
            {data?.video && (
              <>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {formatDuration(data.video.duration)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FireIcon className="h-4 w-4" />
                    {data.video.estimated_calories} kcal
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    {data.video.views ?? 0} lượt xem
                  </span>
                </div>
                <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Thể loại:{' '}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {CATEGORY_OPTIONS[data.video.category]?.label || data.video.category}
                    </strong>
                  </span>
                  {data.video.subcategory && (
                    <span>
                      • Nhánh:{' '}
                      <strong className="text-gray-900 dark:text-gray-100">
                        {data.video.subcategory}
                      </strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  URL Stream: {data.video.streaming_url}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const initialForm = useMemo(
    () => ({
      title: '',
      estimatedCalories: '',
      category: 'workout',
      subcategory: '',
      file: null,
    }),
    []
  );

  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState('');
  const uploadMutation = useUploadVideo();
  const { reset: resetUploadMutation } = uploadMutation;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPhase, setUploadPhase] = useState('idle');

  const { data: subData } = useFetchVideoSubcategories(form.category, {
    enabled: isOpen && !!form.category,
  });

  const fallbackSubs = getSubcategories(form.category);
  const subcategories = subData?.subcategories || fallbackSubs;

  React.useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...initialForm,
        category: prev.category || 'workout',
      }));
      setLocalError('');
      resetUploadMutation();
      setUploadProgress(0);
      setIsSubmitting(false);
      setUploadPhase('idle');
    }
  }, [isOpen, initialForm, resetUploadMutation]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (subcategories.length === 0) {
      setForm((prev) => ({ ...prev, subcategory: '' }));
      return;
    }
    if (!subcategories.includes(form.subcategory)) {
      setForm((prev) => ({ ...prev, subcategory: subcategories[0] }));
    }
  }, [form.category, form.subcategory, subcategories, isOpen]);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (localError) {
      setLocalError('');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setForm((prev) => ({ ...prev, file: null }));
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setLocalError('Video vượt quá 100MB. Vui lòng chọn file nhỏ hơn.');
      setForm((prev) => ({ ...prev, file: null }));
      return;
    }

    setForm((prev) => ({ ...prev, file }));
    if (localError) {
      setLocalError('');
    }
  };

  const handleEstimatedCaloriesChange = (event) => {
    const rawValue = event.target.value;
    const sanitizedValue = rawValue.replace(/\D/g, '');

    setForm((prev) => ({
      ...prev,
      estimatedCalories: sanitizedValue,
    }));

    if (localError) {
      setLocalError('');
    }
  };

  const handleUploadProgress = (event) => {
    if (!event.total) {
      setUploadProgress((prev) => (prev >= 90 ? prev : Math.min(prev + 10, 90)));
      setUploadPhase((prev) => (prev === 'processing' ? prev : 'uploading'));
      return;
    }

    const percent = Math.round((event.loaded / event.total) * 100);
    setUploadProgress(Math.min(100, Math.max(percent, 1)));
    setUploadPhase(percent >= 100 ? 'processing' : 'uploading');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || uploadMutation.isLoading) {
      return;
    }

    if (!form.title.trim()) {
      setLocalError('Vui lòng nhập tiêu đề video.');
      return;
    }

    const parsedCalories = Number(form.estimatedCalories);
    if (!form.estimatedCalories || Number.isNaN(parsedCalories) || parsedCalories <= 0) {
      setLocalError('Calories ước tính phải là số lớn hơn 0.');
      return;
    }

    if (!form.subcategory) {
      setLocalError('Vui lòng chọn subcategory phù hợp.');
      return;
    }

    if (!form.file) {
      setLocalError('Vui lòng chọn file video để upload.');
      return;
    }

    if (form.file.size > MAX_VIDEO_SIZE_BYTES) {
      setLocalError('Video vượt quá 100MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('estimated_calories', String(parsedCalories));
    payload.append('category', form.category);
    payload.append('subcategory', form.subcategory);
    payload.append('video', form.file);

    try {
      setIsSubmitting(true);
      setUploadProgress(0);
      setUploadPhase('uploading');
      const result = await uploadMutation.mutateAsync({
        formData: payload,
        onUploadProgress: handleUploadProgress,
      });
      setUploadProgress(100);
      setUploadPhase('processing');
      const uploadedBytesRaw = result?.video?.bytes ?? result?.bytes;
      const uploadedBytes = Number(uploadedBytesRaw);
      const hasUploadedBytes = Number.isFinite(uploadedBytes) && uploadedBytes > 0;
      const sizeText = hasUploadedBytes ? formatFileSize(uploadedBytes) : '';
      if (hasUploadedBytes) {
        console.info(`[Video Upload] ${form.title.trim()} (${sizeText})`);
      }
      onSuccess?.(
        sizeText ? `Upload video thành công (${sizeText}).` : 'Upload video thành công.'
      );
      onClose();
    } catch (error) {
      setUploadPhase('idle');
      const message =
        error?.response?.status === 413 ||
        error?.response?.data?.error === 'VIDEO_SIZE_EXCEEDED' ||
        error?.response?.data?.message?.includes('Maximum allowed size')
          ? 'Video vượt quá 100MB. Vui lòng chọn file nhỏ hơn.'
          : error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Không thể upload video. Vui lòng thử lại.';
      setLocalError(message);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
      setUploadPhase((prev) => (prev === 'processing' ? 'idle' : prev));
    }
  };

  const isUploading = uploadMutation.isLoading;
  const showProgress = isUploading || uploadProgress > 0 || uploadPhase === 'processing';
  const progressValue = showProgress
    ? uploadPhase === 'processing'
      ? 100
      : Math.min(100, Math.max(uploadProgress > 0 ? uploadProgress : 5, 0))
    : 0;
  const progressLabel =
    uploadPhase === 'processing'
      ? 'Đang xử lý lại...'
      : uploadProgress > 0
        ? `${uploadProgress}%`
        : 'Đang khởi tạo...';
  const progressSubtext =
    uploadPhase === 'processing'
      ? 'Hệ thống sẽ tự retry nếu cần. Vui lòng giữ cửa sổ này mở cho tới khi hoàn tất.'
      : 'Vui lòng giữ cửa sổ này mở cho tới khi hoàn tất.';

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-full overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload video mới
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hỗ trợ định dạng MP4, MOV, WEBM. Video sẽ được chuyển sang HLS để stream.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {localError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
                {localError}
              </div>
            )}

            {showProgress && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                    <ArrowUpTrayIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-900 dark:text-blue-100">
                      <span>Đang tải video lên</span>
                      <span>{progressLabel}</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/40">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-200 ease-out dark:bg-blue-400"
                        style={{ width: `${progressValue}%` }}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(100, Math.max(progressValue, 0))}
                      />
                    </div>
                    <p className="mt-2 text-xs text-blue-800/80 dark:text-blue-200/70">
                      {progressSubtext}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Full Body HIIT 20 phút"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calories ước tính *
                </label>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  step="1"
                  value={form.estimatedCalories}
                  onChange={handleEstimatedCaloriesChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 320"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(event) => handleChange('category', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subcategory *
                </label>
                <select
                  value={form.subcategory}
                  onChange={(event) => handleChange('subcategory', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subcategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  {subcategories.length === 0 && (
                    <option value="" disabled>
                      Không có subcategory tương ứng
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                File video *
              </label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 px-6 py-10 cursor-pointer hover:border-blue-500 transition-colors">
                <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Click để chọn hoặc kéo thả file
                </span>
                <span className="text-xs text-gray-400 mt-2">
                  Chấp nhận: MP4, MOV, WEBM. Dung lượng tối đa 100MB.
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {form.file && (
                  <span className="mt-3 text-sm text-blue-600 dark:text-blue-300">
                    Đã chọn: {form.file.name} · {formatFileSize(form.file.size)}
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isLoading || isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {(uploadMutation.isLoading || isSubmitting) && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VideoManagementPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    category: '',
    subcategory: '',
    search: '',
  });
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { data, isLoading, error, isFetching } = useFetchVideos(filters);
  const deleteMutation = useDeleteVideo();

  const { data: filterSubs } = useFetchVideoSubcategories(filters.category, {
    enabled: !!filters.category,
  });

  const list = data?.videos ?? [];
  const totalPages = data?.pages ?? 1;
  const total = data?.total ?? 0;

  const subcategoryOptions = filters.category
    ? filterSubs?.subcategories || getSubcategories(filters.category)
    : [];

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = formData.get('search')?.toString() ?? '';
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handleDelete = async (video) => {
    if (!window.confirm(`Bạn có chắc muốn xoá video "${video.title}"?`)) {
      return;
    }

    try {
      const result = await deleteMutation.mutateAsync(video.id);
      const successMessage = result?.alreadyRemoved
        ? 'Video đã được xoá trước đó.'
        : 'Đã xoá video thành công.';
      setFeedback({ type: 'success', message: successMessage });
    } catch (mutationError) {
      const message =
        mutationError?.response?.data?.message ||
        mutationError?.message ||
        'Không thể xoá video. Vui lòng thử lại.';
      setFeedback({ type: 'error', message });
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        [name]: value,
        page: 1,
      };
      if (name === 'category') {
        next.subcategory = '';
      }
      return next;
    });
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => {
      const nextPage = prev.page + direction;
      if (nextPage < 1 || nextPage > totalPages) {
        return prev;
      }
      return { ...prev, page: nextPage };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý video</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Upload, xem và quản lý thư viện video workout streaming HLS.
          </p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload video
        </button>
      </div>

      {feedback && (
        <FeedbackBanner
          message={feedback.message}
          type={feedback.type}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
      >
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
            Tìm kiếm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute inset-y-0 left-3 my-auto" />
            <input
              type="text"
              name="search"
              defaultValue={filters.search}
              placeholder="Nhập tên video..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(event) => handleFilterChange('category', event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả</option>
            {categoryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
            Subcategory
          </label>
          <select
            value={filters.subcategory}
            onChange={(event) => handleFilterChange('subcategory', event.target.value)}
            disabled={!filters.category}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Tất cả</option>
            {subcategoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex flex-wrap gap-3 justify-between items-center pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() =>
              setFilters({
                page: 1,
                limit: filters.limit,
                category: '',
                subcategory: '',
                search: '',
              })
            }
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          Không thể tải danh sách video. Vui lòng thử lại.
        </div>
      )}

      {(isLoading || isFetching) && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: filters.limit }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && list.length === 0 && (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl">
            🎬
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chưa có video nào
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Hãy upload video đầu tiên của bạn để bắt đầu xây dựng thư viện workout streaming cho
            học viên.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload video
          </button>
        </div>
      )}

      {list.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {list.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPreview={setPreviewVideoId}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(filters.page - 1) * filters.limit + 1} –
              {Math.min(filters.page * filters.limit, total)} trên tổng {total} video
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {filters.page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={filters.page === totalPages}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp
              </button>
            </div>
          </div>
        </>
      )}

      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(message) => setFeedback({ type: 'success', message })}
      />

      {previewVideoId && (
        <VideoPreviewModal
          videoId={previewVideoId}
          onClose={() => setPreviewVideoId(null)}
        />
      )}
    </div>
  );
};

export default VideoManagementPage;
