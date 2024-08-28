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

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (userRole === 'user') {
      console.log('User with role "user" trying to access admin route. Redirecting to /user');
      // Redirect to a corresponding /user path
      const userPath = pathname.replace('/admin', '/user');
      return NextResponse.redirect(new URL(userPath, req.url));
    } else if (userRole !== 'admin') {
      console.log('Non-admin user trying to access admin route. Redirecting to /sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  if (pathname.startsWith('/user')) {
    if (userRole !== 'user' && userRole !== 'admin') {
      console.log('Unauthorized user trying to access user route. Redirecting to /sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  console.log(`User with role ${userRole} is allowed to access ${pathname}`);
  return NextResponse.next();
}

// Apply middleware to paths that require authentication
export const config = {
  matcher: ['/user/:path*', '/admin/:path*'],  // Protect /user and /admin paths
};
