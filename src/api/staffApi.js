import apiClient from './apiClient';

/**
 * Staff API endpoints
 * Maps to backend: /api/admin/staff/*
 */

export const staffApi = {
  /**
   * Fetch all staff with pagination and filters
   * GET /api/admin/staff
   */
  getStaff: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      active,
      skillsApproved,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(active !== undefined && { active: active.toString() }),
      ...(skillsApproved !== undefined && { skillsApproved: skillsApproved.toString() }),
    });

    const response = await apiClient.get(`/api/admin/staff?${queryParams}`);
    return response.data;
  },

  /**
   * Get staff details by ID
   * GET /api/admin/staff/{staffId}
   */
  getStaffById: async (staffId) => {
    const response = await apiClient.get(`/api/admin/staff/${staffId}`);
    return response.data;
  },

  /**
   * Create a new staff member
   * POST /api/admin/staff/create
   */
  createStaff: async (staffData) => {
    const response = await apiClient.post('/api/admin/staff/create', staffData);
    return response.data;
  },

  /**
   * Upload or update staff avatar
   * PUT /api/admin/staff/{staffId}/avatar
   */
  updateStaffAvatar: async (staffId, avatarFile) => {
    if (!staffId) {
      throw new Error('staffId is required to update avatar.');
    }
    if (!avatarFile) {
      throw new Error('avatarFile is required to update avatar.');
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await apiClient.put(`/api/admin/staff/${staffId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update staff details
   * PATCH /api/admin/staff/{staffId}
   */
  updateStaff: async (staffId, staffData) => {
    const response = await apiClient.patch(`/api/admin/staff/${staffId}`, staffData);
    return response.data;
  },

  /**
   * Activate staff member
   * PATCH /api/admin/staff/{staffId}/activate
   */
  activateStaff: async (staffId) => {
    const response = await apiClient.patch(`/api/admin/staff/${staffId}/activate`);
    return response.data;
  },

  /**
   * Deactivate staff member
   * PATCH /api/admin/staff/{staffId}/deactivate
   */
  deactivateStaff: async (staffId) => {
    const response = await apiClient.patch(`/api/admin/staff/${staffId}/deactivate`);
    return response.data;
  },

  /**
   * Approve staff skills
   * PATCH /api/admin/staff/{staffId}/skills/approve
   */
  approveStaffSkills: async (staffId) => {
    const response = await apiClient.patch(`/api/admin/staff/${staffId}/skills/approve`);
    return response.data;
  },
};
