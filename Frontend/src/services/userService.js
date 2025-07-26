import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';

// User Management Service
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.USER.PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.USER.PROFILE, profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user dashboard data
  getDashboard: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.USER.DASHBOARD);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user analytics
  getAnalytics: async (days = 30) => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.USER.ANALYTICS, { days });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.USER.STATS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiRequest.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};