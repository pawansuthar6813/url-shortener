import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { tokenUtils, userUtils } from '../utils/helpers';

// Authentication Service
export const authService = {
  // User Registration
  register: async (userData) => {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
      
      if (response.success && response.data) {
        // Store tokens and user data
        tokenUtils.setToken(response.data.token);
        tokenUtils.setRefreshToken(response.data.refreshToken);
        userUtils.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User Login
  login: async (credentials) => {
    try {
      const response = await apiRequest.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success && response.data) {
        // Store tokens and user data
        tokenUtils.setToken(response.data.token);
        tokenUtils.setRefreshToken(response.data.refreshToken);
        userUtils.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User Logout
  logout: async () => {
    try {
      // Call backend logout endpoint
      await apiRequest.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage regardless of backend response
      tokenUtils.removeToken();
      tokenUtils.removeRefreshToken();
      userUtils.removeUser();
      
      return { success: true };
    } catch (error) {
      // Even if backend call fails, clear local storage
      tokenUtils.removeToken();
      tokenUtils.removeRefreshToken();
      userUtils.removeUser();
      
      // Don't throw error for logout
      return { success: true };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = tokenUtils.getToken();
    const user = userUtils.getUser();
    return !!(token && user && !tokenUtils.isTokenExpired(token));
  },

  // Get current user
  getCurrentUser: () => {
    return userUtils.getUser();
  },

  // Check if current user is admin
  isAdmin: () => {
    const user = userUtils.getUser();
    return userUtils.isAdmin(user);
  },

  // Refresh authentication token
  refreshToken: async () => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiRequest.post('/auth/refresh', {
        refreshToken: refreshToken,
      });

      if (response.success && response.data) {
        tokenUtils.setToken(response.data.token);
        tokenUtils.setRefreshToken(response.data.refreshToken);
        return response.data.token;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      // If refresh fails, logout user
      authService.logout();
      throw error;
    }
  },

  // Initialize auth state (call on app startup)
  initializeAuth: () => {
    const token = tokenUtils.getToken();
    const user = userUtils.getUser();

    // If no token or user, return null
    if (!token || !user) {
      return null;
    }

    // If token is expired, try to refresh
    if (tokenUtils.isTokenExpired(token)) {
      const refreshToken = tokenUtils.getRefreshToken();
      if (refreshToken && !tokenUtils.isTokenExpired(refreshToken)) {
        // Token refresh should be handled by the auth context
        return { user, tokenExpired: true };
      } else {
        // Both tokens expired, logout
        authService.logout();
        return null;
      }
    }

    return { user, tokenExpired: false };
  },
};