import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth as any;
  const isLoggedIn = !!session;

  const { nextUrl } = req;
  const isDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isHome = nextUrl.pathname === '/';
  const isAdmin = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin_login';
  const isLoginPage = nextUrl.pathname === '/login';
  const isAdminLoginPage = nextUrl.pathname === '/admin_login';

  // 1. Allow home page
  if (isHome) {
    return NextResponse.next();
  }

  // 2. Protect /dashboard
  if (isDashboard) {
    if (!isLoggedIn || !session.isUserAuthenticated) {
      const loginUrl = new URL('/login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect /admin routes
  if (isAdmin) {
    // Must be logged in, MUST be an admin, and MUST have used admin login
    if (!isLoggedIn || session.user?.role !== 'admin' || !session.isAdminAuthenticated) {
      const loginUrl = new URL('/admin_login', nextUrl);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Prevent accessing login pages if already authenticated for that section
  if (isLoginPage && session?.isUserAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
  if (isAdminLoginPage && session?.isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
