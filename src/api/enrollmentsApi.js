import apiClient from './apiClient';

/**
 * Enrollments API endpoints
 * These endpoints mirror the backend routes for customer actions.
 * Admin-specific enrollment reads are handled through classesApi.
 */

export const enrollmentsApi = {
  /**
   * Customer: get enrollments with pagination/filter
   * GET /api/customer/enrollments
   */
  getEnrollments: async (params = {}) => {
    const { page = 1, limit = 10, classId, userId, status, search } = params;

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
   * Customer: get enrollment detail by id
   * GET /api/customer/enrollments/{enrollmentId}
   */
  getEnrollmentById: async (enrollmentId) => {
    const response = await apiClient.get(`/api/customer/enrollments/${enrollmentId}`);
    return response.data;
  },

  /**
   * Customer: enroll to a class
   * POST /api/customer/classes/{classId}/enroll
   */
  createEnrollment: async ({ classId, enrollmentData }) => {
    if (!classId) {
      throw new Error('classId is required to create an enrollment.');
    }

    const response = await apiClient.post(
      `/api/customer/classes/${classId}/enroll`,
      enrollmentData
    );
    return response.data;
  },

  /**
   * Customer: update enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}
   */
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
  },

  /**
   * Customer: cancel enrollment
   * PATCH /api/customer/enrollments/{enrollmentId}/cancel
   */
  cancelEnrollment: async (enrollmentId, payload = {}) => {
    const response = await apiClient.patch(`/api/customer/enrollments/${enrollmentId}/cancel`, payload);
    return response.data;
  },

  /**
   * Customer: check-in class via QR
   * POST /api/customer/classes/{classId}/check-in
   */
  checkInToClass: async ({ classId, payload }) => {
    if (!classId) {
      throw new Error('classId is required to check in to a class.');
    }

    const response = await apiClient.post(`/api/customer/classes/${classId}/check-in`, payload);
    return response.data;
  },

  /**
   * Customer: check-out class via QR
   * POST /api/customer/classes/{classId}/check-out
   */
  checkOutFromClass: async ({ classId, payload }) => {
    if (!classId) {
      throw new Error('classId is required to check out from a class.');
    }

    const response = await apiClient.post(`/api/customer/classes/${classId}/check-out`, payload);
    return response.data;
  },

  /**
   * Customer: search available classes for enrollment
   * GET /api/customer/classes/search
   */
  searchAvailableClasses: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/customer/classes/search?${queryString}` : '/api/customer/classes/search';
    const response = await apiClient.get(endpoint);
    return response.data;
  },
};
