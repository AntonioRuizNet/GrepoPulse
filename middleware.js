import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "gp_admin";
const USER_COOKIE = "gp_user";

async function verifyCookie(req, cookieName, secretEnv) {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return false;
  const secret = process.env[secretEnv];
  if (!secret) return false;

  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

async function isAdmin(req) {
  return verifyCookie(req, ADMIN_COOKIE, "ADMIN_JWT_SECRET");
}

async function isUser(req) {
  // user cookie válida o admin (admin puede ver user zone)
  if (await isAdmin(req)) return true;
  return verifyCookie(req, USER_COOKIE, "USER_JWT_SECRET");
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Admin UI
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    if (!(await isAdmin(req))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin APIs
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/login")) return NextResponse.next();
    if (!(await isAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Solo protegemos admin. El dashboard es público.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
