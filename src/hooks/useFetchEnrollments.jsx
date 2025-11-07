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
        // Primary: admin endpoint
        const adminResp = await classesApi.getClassEnrollments(classId, { page, limit, status });
        // Debug: print raw admin response to help identify field names for user/checkin
        try {
          console.debug('[DEBUG] admin getClassEnrollments response:', adminResp);
        } catch (e) {
          // ignore
        }
        return adminResp;
      } catch (error) {
        const statusCode = error?.response?.status;
        // If admin endpoint not available / returns 404, try customer enrollments endpoint as a fallback
        if (statusCode === 404) {
          try {
            // enrollmentsApi.getEnrollments expects query params; we pass classId to filter
            const fallback = await enrollmentsApi.getEnrollments({ page, limit, status, classId });
            // Debug: print raw fallback response to help identify field names for user/checkin
            try {
              console.debug('[DEBUG] fallback enrollments response:', fallback);
            } catch (e) {
              // ignore
            }
            // Normalize fallback shape similar to admin response
            return {
              success: true,
              message: fallback.message || null,
              data: {
                classId,
                className: fallback.data?.className || '',
                enrollments: fallback.data || [],
              },
              pagination: fallback.pagination || null,
              status: 200,
            };
          } catch (fallbackError) {
            // If fallback fails, return a friendly 404-like object for UI
            const fallbackStatus = fallbackError?.response?.status;
            return {
              success: false,
              message: fallbackError?.response?.data?.message || error?.response?.data?.message || 'Class not found',
              data: null,
              pagination: null,
              status: fallbackStatus || statusCode,
            };
          }
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
