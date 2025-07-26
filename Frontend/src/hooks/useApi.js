import { useState, useCallback } from 'react';
import { errorUtils } from '../utils/helpers';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      return response;
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    callApi,
    clearError,
  };
};

// Custom hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialPage = 0, pageSize = 10) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction(page, size);
      
      if (response.success) {
        setData(response.data.content || response.data);
        setCurrentPage(response.data.number || page);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || response.data.length);
      }
      
      return response;
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, currentPage, pageSize]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      fetchData(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchData]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      fetchData(currentPage - 1);
    }
  }, [currentPage, fetchData]);

  const goToPage = useCallback((page) => {
    if (page >= 0 && page < totalPages) {
      fetchData(page);
    }
  }, [totalPages, fetchData]);

  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  return {
    data,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    fetchData,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
};