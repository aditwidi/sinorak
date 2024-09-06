// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  if (!token) {
    // Redirect to sign-in if no token is found
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const userRole = token.role;

  // Check access to the /admin path
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      // Redirect non-admin users away from the /admin path
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Redirect to /user or /admin based on user role when accessing the home page
  if (req.nextUrl.pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else if (userRole === 'user') {
      return NextResponse.redirect(new URL('/user', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/user/:path*', '/admin/:path*'], // Add routes that need authentication
};
