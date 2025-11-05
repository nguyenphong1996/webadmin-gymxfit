import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '../api/classesApi';
import { enrollmentsApi } from '../api/enrollmentsApi';

/**
 * Fetch enrollments of a specific class (admin endpoint).
 * Admin can only view enrollments via /api/admin/classes/{classId}/enrollments.
 */
export const useFetchClassEnrollments = ({ classId, page = 1, limit = 10, status } = {}) => {
  return useQuery({
    queryKey: ['class-enrollments', { classId, page, limit, status }],
    queryFn: async () => {
      try {
        return await classesApi.getClassEnrollments(classId, { page, limit, status });
      } catch (error) {
        const statusCode = error?.response?.status;
        if (statusCode === 404) {
          return {
            success: false,
            message: error?.response?.data?.message || 'Class not found',
            data: null,
            pagination: null,
            status: statusCode,
          };
        }
        throw error;
      }
    },
    enabled: Boolean(classId),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const statusCode = error?.response?.status;
      if (statusCode === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Customer-side helper: search classes available for enrollment.
 * Not used directly in admin UI today but kept for completeness.
 */
export const useSearchAvailableClasses = (params = {}, options = {}) => {
  const { enabled = true, staleTime = 1000 * 60 * 5 } = options;

  return useQuery({
    queryKey: ['customer-class-search', params],
    queryFn: () => enrollmentsApi.searchAvailableClasses(params),
    enabled,
    staleTime,
  });
};

/**
 * Customer-side helpers for QR check-in/out.
 * These can power QR features within the admin preview/testing tools.
 */
export const useClassCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.checkInToClass,
    onSuccess: () => {
      queryClient.invalidateQueries(['class-enrollments']);
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error checking in enrollment:', error);
    },
  });
};

export const useClassCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.checkOutFromClass,
    onSuccess: () => {
      queryClient.invalidateQueries(['class-enrollments']);
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error checking out enrollment:', error);
    },
  });
};
