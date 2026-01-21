export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureAdminPasswordBootstrapped } from "@/lib/admin-settings";
import { hashPassword, verifyPassword } from "@/lib/auth";

const Body = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req) {
  try {
    const json = await req.json();
    const { oldPassword, newPassword } = Body.parse(json);

    const setting = await ensureAdminPasswordBootstrapped();
    const ok = await verifyPassword(oldPassword, setting.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Old password incorrect" }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.adminSetting.update({ where: { id: 1 }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
