import { apiRequest } from './api';
import { API_ENDPOINTS, PAGINATION } from '../utils/constants';

// URL Management Service
export const urlService = {
  // Create a new short URL
  createUrl: async (urlData) => {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.URL.CREATE, urlData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's URLs (all at once)
  getUserUrls: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.URL.MY_URLS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's URLs with pagination
  getUserUrlsPaginated: async (page = PAGINATION.DEFAULT_PAGE, size = PAGINATION.DEFAULT_SIZE) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.URL.MY_URLS_PAGINATED, {
        page,
        size,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get URL by ID
  getUrlById: async (urlId) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.URL.GET_BY_ID(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete URL
  deleteUrl: async (urlId) => {
    try {
      const response = await apiRequest.delete(API_ENDPOINTS.URL.DELETE(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Toggle URL status (active/inactive)
  toggleUrlStatus: async (urlId) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.URL.TOGGLE_STATUS(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get URL analytics
  getUrlAnalytics: async (urlId) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.URL.ANALYTICS(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Redirect to original URL (public endpoint)
  redirectUrl: (shortCode) => {
    window.open(`${API_ENDPOINTS.URL.REDIRECT(shortCode)}`, '_blank');
  },
};