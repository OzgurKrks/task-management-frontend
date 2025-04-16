import axios from 'axios';
import { getAuthToken } from '@/utils/authCookies';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a base axios instance for public requests
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a private axios instance that includes auth token for client side requests
export const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Could implement token refresh logic here
      
      // For now, just reject with the error
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Create a server-side axios instance with configurable auth token
export const createServerAxios = (token?: string) => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  
  return instance;
};

// Default export for backward compatibility
export default axiosInstance; 