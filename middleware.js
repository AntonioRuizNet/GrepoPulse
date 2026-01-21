import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "gp_admin";

async function isAuthed(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return false;

  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key); // HS256 por defecto si lo firmamos así
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect admin UI
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    if (!(await isAuthed(req))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect admin APIs
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/login")) return NextResponse.next();
    if (!(await isAuthed(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
