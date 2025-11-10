import apiClient from './apiClient';

/**
 * Classes API endpoints
 * Maps to backend: /api/admin/classes/*
 */

export const classesApi = {
  /**
   * Fetch all classes with pagination and filters
   * GET /api/admin/classes
   */
  getClasses: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      staffId,
      search,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(category && { category }),
      ...(staffId && { staffId }),
      ...(search && { search }),
    });

    const response = await apiClient.get(`/api/admin/classes?${queryParams}`);
    return response.data;
  },

  /**
   * Get class details by ID
   * GET /api/admin/classes/{classId}
   */
  getClassById: async (classId) => {
    const response = await apiClient.get(`/api/admin/classes/${classId}`);
    return response.data;
  },

  /**
   * Create a new class
   * POST /api/admin/classes/create
   */
  createClass: async (classData) => {
    const response = await apiClient.post('/api/admin/classes/create', classData);
    return response.data;
  },

  /**
   * Update class details
   * PATCH /api/admin/classes/{classId}
   */
  updateClass: async (classId, classData) => {
    const response = await apiClient.patch(`/api/admin/classes/${classId}`, classData);
    return response.data;
  },

  /**
   * Open class for enrollment
   * PATCH /api/admin/classes/{classId}/open
   */
  openClass: async (classId) => {
    const response = await apiClient.patch(`/api/admin/classes/${classId}/open`);
    return response.data;
  },

  /**
   * Close class
   * PATCH /api/admin/classes/{classId}/close
   */
  closeClass: async (classId, reason = 'completed') => {
    const response = await apiClient.patch(`/api/admin/classes/${classId}/close`, { reason });
    return response.data;
  },

  /**
   * Delete class
   * DELETE /api/admin/classes/{classId}
   */
  deleteClass: async (classId) => {
    const response = await apiClient.delete(`/api/admin/classes/${classId}`);
    return response.data;
  },

  /**
   * Get class QR code for check-in
   * GET /api/admin/classes/{classId}/qrcode
   */
  getClassQRCode: async (classId) => {
    const response = await apiClient.get(`/api/admin/classes/${classId}/qrcode`);
    return response.data;
  },

  /**
   * Generate class QR code for check-in/out
   * POST /api/admin/classes/{classId}/qrcode
   */
  generateClassQRCode: async (classId) => {
    const response = await apiClient.post(`/api/admin/classes/${classId}/qrcode`);
    return response.data;
  },

  /**
   * Get class enrollments
   * GET /api/customer/classes/{classId}/enrollments
   * Note: Backend route is under /api/customer but requires admin middleware
   */
  getClassEnrollments: async (classId, params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await apiClient.get(`/api/customer/classes/${classId}/enrollments?${queryParams}`);
    return response.data;
  },
};
