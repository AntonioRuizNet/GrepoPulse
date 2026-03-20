import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const world = searchParams.get("world");

  const events = await prisma.wonderLevelEvent.findMany({
    where: world ? { world } : undefined,
    orderBy: {
      detectedAt: "desc",
    },
    take: 200,
  });

  return NextResponse.json({
    events,
  });
}
