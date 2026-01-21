export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const worldId = (searchParams.get("world") || "es141").trim();

  const snapshots = await prisma.snapshot.findMany({
    where: { worldId },
    orderBy: { fetchedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ worldId, snapshots });
}
