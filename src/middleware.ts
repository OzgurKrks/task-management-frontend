import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE } from './utils/serverCookies';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies using the constant
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  // Log for debugging
  console.log(`[Middleware] Path: ${pathname}, Token exists: ${!!token}`);

  // Check if the path is public (login or register)
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // If the path is public and the user is authenticated, redirect to the dashboard
  if (isPublicPath && token) {
    console.log('[Middleware] Authenticated user accessing public path, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the path requires authentication and the user is not authenticated, redirect to login
  if (!isPublicPath && !token && 
      !pathname.startsWith('/_next') && 
      !pathname.startsWith('/api') && 
      !pathname.includes('.')) {
    console.log('[Middleware] Unauthenticated user accessing protected path, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    // Add a redirect parameter to return to the original page after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}; 