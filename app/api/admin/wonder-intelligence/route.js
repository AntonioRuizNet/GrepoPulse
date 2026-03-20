import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const world = searchParams.get("world");

  const snapshots = await prisma.wonderSnapshot.findMany({
    where: world ? { world } : undefined,
    orderBy: {
      capturedAt: "desc",
    },
  });

  const events = await prisma.wonderLevelEvent.findMany({
    where: world ? { world } : undefined,
    orderBy: {
      detectedAt: "desc",
    },
  });

  // Último snapshot por alianza + maravilla
  const latestMap = new Map();

  for (const s of snapshots) {
    const key = `${s.world}-${s.allianceName}-${s.wonderType}`;
    if (!latestMap.has(key)) {
      latestMap.set(key, s);
    }
  }

  // Último evento por nivel
  const eventMap = new Map();

  for (const e of events) {
    const key = `${e.world}-${e.allianceName}-${e.wonderType}-${e.level}`;
    if (!eventMap.has(key)) {
      eventMap.set(key, e);
    }
  }

  // Agrupar por alianza
  const alliancesMap = new Map();

  for (const row of latestMap.values()) {
    const key = `${row.world}-${row.allianceName}`;

    if (!alliancesMap.has(key)) {
      alliancesMap.set(key, {
        world: row.world,
        name: row.allianceName,
        rank: row.allianceRank,
        points: row.alliancePoints,
        wonders: [],
      });
    }

    const eventKey = `${row.world}-${row.allianceName}-${row.wonderType}-${row.level}`;
    const event = eventMap.get(eventKey);

    alliancesMap.get(key).wonders.push({
      wonderType: row.wonderType,
      wonderName: row.wonderName,
      level: row.level,
      sea: row.sea,
      capturedAt: row.capturedAt,
      levelDetectedAt: event?.detectedAt || null,
      durationSeconds: event?.durationSeconds ?? null,
    });
  }

  return NextResponse.json({
    alliances: [...alliancesMap.values()],
  });
}
