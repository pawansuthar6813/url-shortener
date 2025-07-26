// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  
  // URL Management
  URL: {
    CREATE: '/url/create',
    MY_URLS: '/url/my-urls',
    MY_URLS_PAGINATED: '/url/my-urls/paginated',
    GET_BY_ID: (id) => `/url/${id}`,
    DELETE: (id) => `/url/${id}`,
    TOGGLE_STATUS: (id) => `/url/${id}/toggle-status`,
    ANALYTICS: (id) => `/url/${id}/analytics`,
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    ANALYTICS: '/user/analytics',
    STATS: '/user/stats',
    CHANGE_PASSWORD: '/user/change-password',
  },
  
  // Admin Endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USERS_PAGINATED: '/admin/users/paginated',
    TOGGLE_USER_STATUS: (id) => `/admin/users/${id}/toggle-status`,
    TOGGLE_USER_ROLE: (id) => `/admin/users/${id}/toggle-role`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    URLS: '/admin/urls',
    TOGGLE_URL_STATUS: (id) => `/admin/urls/${id}/toggle-status`,
    DELETE_URL: (id) => `/admin/urls/${id}`,
    SYSTEM_STATS: '/admin/system-stats',
    CLEANUP_EXPIRED: '/admin/cleanup-expired-urls',
    ANALYTICS: '/admin/analytics',
    ACTIVITY_LOG: '/admin/activity-log',
    HEALTH: '/admin/health',
  },
  
  // Public
  REDIRECT: (code) => `/s/${code}`,
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

// Form Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  URL: {
    PATTERN: /^https?:\/\/.+/,
  },
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [10, 25, 50, 100],
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss',
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ANALYTICS: '/analytics',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    URLS: '/admin/urls',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully!',
  URL_CREATED: 'URL shortened successfully!',
  URL_DELETED: 'URL deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
};