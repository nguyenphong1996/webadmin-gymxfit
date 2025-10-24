import apiClient from './apiClient';

/**
 * Enrollments API endpoints
 * Maps to backend: /api/customer/enrollments/*
 */

export const enrollmentsApi = {
  /**
   * Fetch all enrollments with pagination and filters
   * GET /api/customer/enrollments
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

    const response = await apiClient.get(`/api/customer/enrollments?${queryParams}`);
    return response.data;
  },

  /**
   * Get enrollment details by ID
   * GET /api/customer/enrollments/{enrollmentId}
   */
  getEnrollmentById: async (enrollmentId) => {
    const response = await apiClient.get(`/api/customer/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * Create a new enrollment
   * POST /api/customer/classes/{classId}/enroll
   */
  createEnrollment: async (enrollmentData) => {
    const response = await apiClient.post('/api/customer/classes/enroll', enrollmentData);
    return response.data;
  },

  /**
   * Update enrollment details
   * PATCH /api/customer/enrollments/{enrollmentId}
   */
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
  },

  /**
   * Approve enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}/approve
   */
  approveEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  /**
   * Reject enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}/reject
   */
  rejectEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}/reject`);
    return response.data;
  },

  /**
   * Complete enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}/complete
   */
  completeEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}/complete`);
    return response.data;
  },

  /**
   * Cancel enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}/cancel
   */
  cancelEnrollment: async (enrollmentId) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}/cancel`);
    return response.data;
  },

  /**
   * Delete enrollment
   * DELETE /api/customer/enrollments/{enrollmentId}
   */
  deleteEnrollment: async (enrollmentId) => {
    const response = await apiClient.delete(`/api/customer/enrollments/${enrollmentId}`);
    return response.data;
  },
};
