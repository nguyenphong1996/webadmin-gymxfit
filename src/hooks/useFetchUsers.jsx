import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';

/**
 * Fetch all users with pagination and filters
 */
export const useFetchUsers = (params = {}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch single user by ID
 */
export const useFetchUser = (userId) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
