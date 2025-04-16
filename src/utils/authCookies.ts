import Cookies from 'js-cookie';

// Constants for cookie names
export const AUTH_TOKEN_COOKIE = 'auth_token';
export const USER_COOKIE = 'user';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

// Set authentication token cookie
export const setAuthToken = (token: string): void => {
  Cookies.set(AUTH_TOKEN_COOKIE, token, COOKIE_OPTIONS);
};

// Get authentication token from cookie
export const getAuthToken = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_COOKIE);
};

// Remove authentication token cookie
export const removeAuthToken = (): void => {
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
};

// Set user data in cookie
export const setUserData = (user: any): void => {
  Cookies.set(USER_COOKIE, JSON.stringify(user), COOKIE_OPTIONS);
};

// Get user data from cookie
export const getUserData = (): any => {
  const userData = Cookies.get(USER_COOKIE);
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

// Remove user data cookie
export const removeUserData = (): void => {
  Cookies.remove(USER_COOKIE, { path: '/' });
};

// Clear all auth cookies
export const clearAuthCookies = (): void => {
  removeAuthToken();
  removeUserData();
}; 