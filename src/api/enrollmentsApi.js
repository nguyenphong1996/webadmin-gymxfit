import apiClient from './apiClient';

/**
 * Enrollments API endpoints
 * Maps to backend: /api/admin/enrollments/*
 */

export const enrollmentsApi = {
  /**
   * Fetch all enrollments with pagination and filters
   * GET /api/admin/enrollments
   */
  getEnrollments: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      classId,
      userId,
      status,
      search,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(classId && { classId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(search && { search }),
    });

    const response = await apiClient.get(`/api/admin/enrollments?${queryParams}`);
    return response.data;
  },

  /**
   * Get enrollment details by ID
   * GET /api/admin/enrollments/{enrollmentId}
   */
  getEnrollmentById: async (enrollmentId) => {
    const response = await apiClient.get(`/api/admin/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * Create a new enrollment
   * POST /api/admin/enrollments/create
   */
  createEnrollment: async (enrollmentData) => {
    const response = await apiClient.post('/api/admin/enrollments/create', enrollmentData);
    return response.data;
  },

  /**
   * Update enrollment details
   * PATCH /api/admin/enrollments/{enrollmentId}
   */
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    const response = await apiClient.patch(`/api/admin/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
  },

  /**
   * Approve enrollment
   * PATCH /api/admin/enrollments/{enrollmentId}/approve
   */
  approveEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/admin/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  /**
   * Reject enrollment
   * PATCH /api/admin/enrollments/{enrollmentId}/reject
   */
  rejectEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/admin/enrollments/${enrollmentId}/reject`);
    return response.data;
  },

  /**
   * Complete enrollment
   * PATCH /api/admin/enrollments/{enrollmentId}/complete
   */
  completeEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/admin/enrollments/${enrollmentId}/complete`);
    return response.data;
  },

  /**
   * Cancel enrollment
   * PATCH /api/admin/enrollments/{enrollmentId}/cancel
   */
  cancelEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/admin/enrollments/${enrollmentId}/cancel`);
    return response.data;
  },

  /**
   * Delete enrollment
   * DELETE /api/admin/enrollments/{enrollmentId}
   */
  deleteEnrollment: async (enrollmentId) => {
    const response = await apiClient.delete(`/api/admin/enrollments/${enrollmentId}`);
    return response.data;
  },
};
