import { apiRequest } from './api';
import { API_ENDPOINTS, PAGINATION } from '../utils/constants';

// Admin Service
export const adminService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.DASHBOARD);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.USERS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUsersPaginated: async (page = PAGINATION.DEFAULT_PAGE, size = PAGINATION.DEFAULT_SIZE) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.USERS_PAGINATED, {
        page,
        size,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  toggleUserStatus: async (userId) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  toggleUserRole: async (userId) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.ADMIN.TOGGLE_USER_ROLE(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiRequest.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // URL Management
  getAllUrls: async (page = PAGINATION.DEFAULT_PAGE, size = PAGINATION.DEFAULT_SIZE) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.URLS, {
        page,
        size,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  toggleUrlStatus: async (urlId) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.ADMIN.TOGGLE_URL_STATUS(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteUrl: async (urlId) => {
    try {
      const response = await apiRequest.delete(API_ENDPOINTS.ADMIN.DELETE_URL(urlId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // System Management
  getSystemStats: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.SYSTEM_STATS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  cleanupExpiredUrls: async () => {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.ADMIN.CLEANUP_EXPIRED);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAnalytics: async (days = 30) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.ANALYTICS, { days });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getActivityLog: async (page = PAGINATION.DEFAULT_PAGE, size = 50) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.ACTIVITY_LOG, {
        page,
        size,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.ADMIN.HEALTH);
      return response;
    } catch (error) {
      throw error;
    }
  },
};