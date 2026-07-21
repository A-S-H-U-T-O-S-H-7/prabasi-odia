import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Admin routes protection
  if (path.startsWith('/admin')) {
    // Allow admin login page
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get('admin-session')?.value;
    
    if (!sessionToken) {
      // Redirect to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};