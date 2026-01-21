export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { ensureAdminPasswordBootstrapped } from "@/lib/admin-settings";
import { verifyPassword } from "@/lib/auth";

const Body = z.object({ password: z.string().min(1) });
const COOKIE_NAME = "gp_admin";

function isHttps(req) {
  // En local: http. En reverse proxy: usa x-forwarded-proto.
  const xfProto = req.headers.get("x-forwarded-proto");
  if (xfProto) return xfProto === "https";
  // fallback: en dev suele ser http
  return false;
}

export async function POST(req) {
  try {
    const json = await req.json();
    const { password } = Body.parse(json);

    const setting = await ensureAdminPasswordBootstrapped();
    const ok = await verifyPassword(password, setting.passwordHash);

    const res = ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const secret = process.env.ADMIN_JWT_SECRET;

    // Si no hay secreto, no permitimos login (más seguro)
    if (!secret) {
      return NextResponse.json({ error: "Missing ADMIN_JWT_SECRET" }, { status: 500 });
    }

    const secure = isHttps(req) || process.env.NODE_ENV === "production";

    if (!ok) {
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    const key = new TextEncoder().encode(secret);

    const token = await new SignJWT({ user: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(key);

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
