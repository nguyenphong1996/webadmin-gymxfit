import apiClient from './apiClient';

/**
 * Videos API endpoints
 * Maps to backend: /api/videos/*
 */

export const videosApi = {
  /**
   * Fetch all videos with pagination
   * GET /api/videos
   */
  getVideos: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      category,
      subcategory,
      search,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(search && { search }),
    });

    const response = await apiClient.get(`/api/videos?${queryParams}`);
    return response.data;
  },

  /**
   * Get video details by ID
   * GET /api/videos/:id
   */
  getVideoById: async (videoId) => {
    const response = await apiClient.get(`/api/videos/${videoId}`);
    return response.data;
  },

  /**
   * Upload a new video
   * POST /api/videos/upload
   */
  uploadVideo: async (formData) => {
    const response = await apiClient.post('/api/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a video
   * DELETE /api/videos/:id
   */
  deleteVideo: async (videoId) => {
    const response = await apiClient.delete(`/api/videos/${videoId}`);
    return response.data;
  },

  /**
   * Get subcategories by category
   * GET /api/videos/subcategories/:category
   */
  getSubcategories: async (category) => {
    const response = await apiClient.get(`/api/videos/subcategories/${category}`);
    return response.data;
  },
};
