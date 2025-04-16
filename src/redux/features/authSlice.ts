import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Cookie names and functions for client-side cookie handling
export const AUTH_TOKEN_COOKIE = 'auth_token';
const USER_COOKIE_NAME = 'user_data';

// Client-side cookie functions
const setAuthToken = (token: string): void => {
  Cookies.set(AUTH_TOKEN_COOKIE, token, { expires: 7, path: '/' });
};

const getAuthToken = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_COOKIE);
};

const setUserData = (user: any): void => {
  Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), { expires: 7, path: '/' });
};

const getUserData = (): any => {
  const userData = Cookies.get(USER_COOKIE_NAME);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }
  return null;
};

const clearAuthCookies = (): void => {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(USER_COOKIE_NAME, { path: '/' });
};

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-management-backend-ts41.onrender.com/api';

// Create axios instance specifically for auth
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initial state
const initialState: AuthState = {
  user: getUserData() || null,
  token: getAuthToken() || null,
  isAuthenticated: !!getAuthToken(),
  isLoading: false,
  error: null,
};

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(`/auth/login`, credentials);
      
      // Save token and user to cookies
      setAuthToken(response.data.token);
      setUserData(response.data);
      
      // Show success toast
      showSuccessToast('Login successful! Redirecting...');
      
      // Force window reload to refresh authentication state and trigger middleware
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
      
      return response.data;
    } catch (error: any) {
      // Show error toast
      showErrorToast(error.response?.data?.message || 'Failed to login');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to login'
      );
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authAxios.post(`/auth/register`, credentials);
      
      // Save token and user to cookies
      setAuthToken(response.data.token);
      setUserData(response.data);
      
      // Show success toast
      showSuccessToast('Registration successful! Redirecting...');
      
      // Force window reload to refresh authentication state and trigger middleware
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
      
      return response.data;
    } catch (error: any) {
      // Show error toast
      showErrorToast(error.response?.data?.message || 'Failed to register');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to register'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Remove token and user from cookies
      clearAuthCookies();
      
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Show success toast
      showSuccessToast('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 