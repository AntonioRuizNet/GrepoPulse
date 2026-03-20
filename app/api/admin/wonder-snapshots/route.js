import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const world = searchParams.get("world");

    const snapshots = await prisma.wonderSnapshot.findMany({
      where: world ? { world } : undefined,
      select: {
        capturedAt: true,
      },
      orderBy: {
        capturedAt: "desc",
      },
    });

    return NextResponse.json({
      snapshots,
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
