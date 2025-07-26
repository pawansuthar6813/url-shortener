import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userUtils } from '../utils/helpers';

// Initial state
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isAdmin: userUtils.isAdmin(action.payload),
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        isAdmin: userUtils.isAdmin({ ...state.user, ...action.payload }),
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        const authData = authService.initializeAuth();
        
        if (authData) {
          if (authData.tokenExpired) {
            // Try to refresh token
            try {
              await authService.refreshToken();
              dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: authData.user });
            } catch (error) {
              // Refresh failed, logout user
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          } else {
            // Valid token, set user
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: authData.user });
          }
        } else {
          // No valid auth data
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      }
    };

    initAuth();
  }, []); // Empty dependency array - only run once on mount

  // Login function - wrapped in useCallback to prevent recreation
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Register function - wrapped in useCallback
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Logout function - wrapped in useCallback
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update user profile - wrapped in useCallback
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    // Also update in localStorage
    const updatedUser = { ...state.user, ...userData };
    userUtils.setUser(updatedUser);
  }, [state.user]);

  // Clear error - wrapped in useCallback
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value - memoized to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    // State
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
  }), [
    state.user,
    state.isLoading,
    state.isAuthenticated,
    state.isAdmin,
    state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;