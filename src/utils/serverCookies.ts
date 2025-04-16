import { cookies } from 'next/headers';

// Cookie isimlendirmeleri
export const AUTH_TOKEN_COOKIE = 'auth_token';
const USER_COOKIE_NAME = 'user_data';

// Auth token cookie işlemleri
export const getAuthCookie = async (): Promise<string | undefined> => {
  try {
    // Try with async cookies API (Next.js 15+)
    const cookieStore = await cookies().catch(() => {
      // Fallback to sync API (Next.js 14 and earlier)
      return cookies() as any;
    });
    
    const authCookie = cookieStore.get(AUTH_TOKEN_COOKIE);
    return authCookie?.value;
  } catch (error) {
    // Try again with the synchronous API as fallback
    try {
      const cookieStore = cookies() as any;
      const authCookie = cookieStore.get(AUTH_TOKEN_COOKIE);
      return authCookie?.value;
    } catch (secondError) {
      console.error('Error getting auth cookie:', secondError);
      return undefined;
    }
  }
};

// User data cookie işlemleri
export const getUserCookie = async (): Promise<any | undefined> => {
  try {
    // Try with async cookies API (Next.js 15+)
    const cookieStore = await cookies().catch(() => {
      // Fallback to sync API (Next.js 14 and earlier)
      return cookies() as any;
    });
    
    const userCookie = cookieStore.get(USER_COOKIE_NAME);
    
    if (userCookie?.value) {
      try {
        return JSON.parse(userCookie.value);
      } catch (e) {
        console.error('Failed to parse user cookie:', e);
        return undefined;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error getting user cookie:', error);
    return undefined;
  }
}; 