// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  console.log('Middleware triggered for path:', pathname);
  console.log('Token:', token);

  // Redirect to sign-in if there is no token (user is not authenticated)
  if (!token) {
    console.log('No token found. Redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const userRole = token.role;

  // Redirect to corresponding path based on role when accessing the home page
  if (pathname === '/') {
    if (userRole === 'admin') {
      console.log('Redirecting admin to /admin');
      return NextResponse.redirect(new URL('/admin', req.url));
    } else if (userRole === 'user') {
      console.log('Redirecting user to /user');
      return NextResponse.redirect(new URL('/user', req.url));
    }
  }

  // Role-based access control for /admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole === 'user') {
      console.log('User with role "user" trying to access admin route. Redirecting to /user');
      const userPath = pathname.replace('/admin', '/user');
      return NextResponse.redirect(new URL(userPath, req.url));
    } else if (userRole !== 'admin') {
      console.log('Non-admin user trying to access admin route. Redirecting to /sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // Role-based access control for /user routes
  if (pathname.startsWith('/user')) {
    if (userRole !== 'user' && userRole !== 'admin') {
      console.log('Unauthorized user trying to access user route. Redirecting to /sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  console.log(`User with role ${userRole} is allowed to access ${pathname}`);
  return NextResponse.next();
}

// Apply middleware to paths that require authentication, including the home page
export const config = {
  matcher: ['/', '/user/:path*', '/admin/:path*'],  // Protect /, /user, and /admin paths
};
