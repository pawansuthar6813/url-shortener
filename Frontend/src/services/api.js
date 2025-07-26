import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { tokenUtils } from '../utils/helpers';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token && !tokenUtils.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = ERROR_MESSAGES.NETWORK_ERROR;
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        tokenUtils.removeToken();
        tokenUtils.removeRefreshToken();
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Only redirect to login if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        error.message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
        break;
        
      case 403:
        // Forbidden - insufficient permissions
        error.message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
        break;
        
      case 404:
        // Not found
        error.message = data?.message || 'Resource not found';
        break;
        
      case 409:
        // Conflict - duplicate resource
        error.message = data?.message || 'Resource already exists';
        break;
        
      case 422:
        // Validation error
        error.message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
        break;
        
      case 500:
        // Server error
        error.message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
        break;
        
      default:
        error.message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
    }

    return Promise.reject(error);
  }
);

// API wrapper functions
export const apiRequest = {
  // GET request
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}) => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// File upload helper
export const uploadFile = async (url, file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await api.post(url, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Download file helper
export const downloadFile = async (url, filename = 'download') => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

export default api;