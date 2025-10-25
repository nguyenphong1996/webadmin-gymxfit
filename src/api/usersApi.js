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
      role,
      isActive,
      isVerified,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(isActive !== undefined && isActive !== null && { isActive }),
      ...(isVerified !== undefined && isVerified !== null && { isVerified }),
    });

    try {
      const response = await apiClient.get(`/api/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('Users API trả về 404 - sử dụng dữ liệu giả để hiển thị danh sách rỗng.');
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        };
      }
      throw error;
    }
  },

  /**
   * Get user details by ID
   * GET /api/admin/users/{userId}
   */
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`User ${userId} không tồn tại hoặc backend chưa hỗ trợ.`);
        return null;
      }
      throw error;
    }
  },

};
