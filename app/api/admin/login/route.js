export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAdminPasswordBootstrapped } from "@/lib/admin-settings";
import { setAdminSession, verifyPassword, clearAdminSession } from "@/lib/auth";

const Body = z.object({ password: z.string().min(1) });

export async function POST(req) {
  try {
    const json = await req.json();
    const { password } = Body.parse(json);

    const setting = await ensureAdminPasswordBootstrapped();
    const ok = await verifyPassword(password, setting.passwordHash);
    if (!ok) {
      clearAdminSession();
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    setAdminSession({ user: "admin" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
