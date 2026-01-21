import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'gp_admin';

function isAuthed(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect admin UI
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) return NextResponse.next();
    if (!isAuthed(req)) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect admin APIs
  if (pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin/login')) return NextResponse.next();
    if (!isAuthed(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
