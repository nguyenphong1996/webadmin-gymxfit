import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '../api/classesApi';

// Custom hook to fetch classes with React Query
export const useFetchClasses = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    staffId,
    search,
  } = params;

  return useQuery({
    queryKey: ['classes', { page, limit, status, category, staffId, search }],
    queryFn: () => classesApi.getClasses(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: true,
  });
};

// Hook to fetch single class by ID
export const useFetchClass = (classId) => {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => classesApi.getClassById(classId),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to create a new class
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesApi.createClass,
    onSuccess: (data) => {
      // Invalidate and refetch classes list
      queryClient.invalidateQueries(['classes']);

      return data;
    },
    onError: (error) => {
      console.error('Error creating class:', error);
      // Handle error (could show toast notification)
    },
  });
};

// Hook to update a class
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, classData }) => classesApi.updateClass(classId, classData),
    onSuccess: (data, variables) => {
      // Update cache for the specific class
      queryClient.setQueryData(['class', variables.classId], data);

      // Invalidate classes list
      queryClient.invalidateQueries(['classes']);

      return data;
    },
    onError: (error) => {
      console.error('Error updating class:', error);
    },
  });
};

// Hook to delete a class
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesApi.deleteClass,
    onSuccess: () => {
      // Invalidate and refetch classes list
      queryClient.invalidateQueries(['classes']);
    },
    onError: (error) => {
      console.error('Error deleting class:', error);
    },
  });
};

// Hook to open class
export const useOpenClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classesApi.openClass,
    onSuccess: (data, variables) => {
      // Update cache for the specific class
      queryClient.setQueryData(['class', variables.classId], data);
      queryClient.invalidateQueries(['classes']);
    },
    onError: (error) => {
      console.error('Error opening class:', error);
    },
  });
};

// Hook to close class
export const useCloseClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, reason }) => classesApi.closeClass(classId, reason),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['class', variables.classId], data);
      queryClient.invalidateQueries(['classes']);
    },
    onError: (error) => {
      console.error('Error closing class:', error);
    },
  });
};