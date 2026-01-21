export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { setUserPassword } from "@/lib/user-settings";

const Body = z.object({ password: z.string().min(8) });

export async function POST(req) {
  try {
    const { password } = Body.parse(await req.json());
    await setUserPassword(password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
