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

  // Redirect to /user or /admin based on user role when accessing the home page
  if (req.nextUrl.pathname === '/') {
    const userRole = token.role;
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
