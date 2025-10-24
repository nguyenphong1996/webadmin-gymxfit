import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '../api/enrollmentsApi';

// Custom hook to fetch enrollments with React Query
export const useFetchEnrollments = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    classId,
    userId,
    status,
    search,
  } = params;

  return useQuery({
    queryKey: ['enrollments', { page, limit, classId, userId, status, search }],
    queryFn: () => enrollmentsApi.getEnrollments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: true,
  });
};

// Hook to fetch single enrollment by ID
export const useFetchEnrollment = (enrollmentId) => {
  return useQuery({
    queryKey: ['enrollment', enrollmentId],
    queryFn: () => enrollmentsApi.getEnrollmentById(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to create a new enrollment
export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.createEnrollment,
    onSuccess: (data) => {
      // Invalidate and refetch enrollments list
      queryClient.invalidateQueries(['enrollments']);

      return data;
    },
    onError: (error) => {
      console.error('Error creating enrollment:', error);
    },
  });
};

// Hook to update an enrollment
export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, enrollmentData }) =>
      enrollmentsApi.updateEnrollment(enrollmentId, enrollmentData),
    onSuccess: (data, variables) => {
      // Update cache for the specific enrollment
      queryClient.setQueryData(['enrollment', variables.enrollmentId], data);

      // Invalidate enrollments list
      queryClient.invalidateQueries(['enrollments']);

      return data;
    },
    onError: (error) => {
      console.error('Error updating enrollment:', error);
    },
  });
};

// Hook to approve enrollment
export const useApproveEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.approveEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error approving enrollment:', error);
    },
  });
};

// Hook to reject enrollment
export const useRejectEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.rejectEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error rejecting enrollment:', error);
    },
  });
};

// Hook to complete enrollment
export const useCompleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.completeEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error completing enrollment:', error);
    },
  });
};

// Hook to cancel enrollment
export const useCancelEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.cancelEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error canceling enrollment:', error);
    },
  });
};

// Hook to delete enrollment
export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollmentsApi.deleteEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments']);
    },
    onError: (error) => {
      console.error('Error deleting enrollment:', error);
    },
  });
};
