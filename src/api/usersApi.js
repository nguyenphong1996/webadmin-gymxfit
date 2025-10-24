import apiClient from './apiClient';

/**
 * Users API endpoints
 * Maps to backend: /api/admin/users/*
 */

export const usersApi = {
  /**
   * Fetch all users with pagination and filters
   * GET /api/admin/users
   */
  getUsers: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await apiClient.get(`/api/admin/users?${queryParams}`);
    return response.data;
  },

  /**
   * Get user details by ID
   * GET /api/admin/users/{userId}
   */
  getUserById: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user details
   * PUT /api/user/profile
   */
  updateUserProfile: async (userData) => {
    const response = await apiClient.put('/api/user/profile', userData);
    return response.data;
  },

  /**
   * Deactivate user
   * PATCH /api/admin/users/{userId}/deactivate
   */
  deactivateUser: async (userId) => {
    const response = await apiClient.patch(`/api/admin/users/${userId}/deactivate`);
    return response.data;
  },

  /**
   * Activate user
   * PATCH /api/admin/users/{userId}/activate
   */
  activateUser: async (userId) => {
    const response = await apiClient.patch(`/api/admin/users/${userId}/activate`);
    return response.data;
  },
};
