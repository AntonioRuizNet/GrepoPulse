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

  const latestMap = new Map();

  for (const snapshot of snapshots) {
    const key = `${snapshot.world}-${snapshot.allianceName}-${snapshot.wonderType}`;

    if (!latestMap.has(key)) {
      latestMap.set(key, snapshot);
    }
  }

  const eventMap = new Map();

  for (const event of events) {
    const key = `${event.world}-${event.allianceName}-${event.wonderType}-${event.level}`;

    if (!eventMap.has(key)) {
      eventMap.set(key, event);
    }
  }

  const alliancesMap = new Map();

  for (const row of latestMap.values()) {
    const allianceKey = `${row.world}-${row.allianceName}`;

    if (!alliancesMap.has(allianceKey)) {
      alliancesMap.set(allianceKey, {
        world: row.world,
        name: row.allianceName,
        rank: row.allianceRank,
        points: row.alliancePoints,
        wonders: [],
      });
    }

    const eventKey = `${row.world}-${row.allianceName}-${row.wonderType}-${row.level}`;
    const event = eventMap.get(eventKey);

    alliancesMap.get(allianceKey).wonders.push({
      wonderType: row.wonderType,
      wonderName: row.wonderName,
      level: row.level,
      sea: row.sea,
      capturedAt: row.capturedAt,
      levelDetectedAt: event?.detectedAt || null,
      durationSeconds: event?.durationSeconds ?? null,
      officialDurationSeconds: event?.officialDurationSeconds ?? null,
      acceleratedSeconds: event?.acceleratedSeconds ?? null,
      accelerationsUsed: event?.accelerationsUsed ?? null,
    });
  }

  const alliances = [...alliancesMap.values()]
    .map((alliance) => ({
      ...alliance,
      wonders: alliance.wonders.sort((a, b) => a.wonderName.localeCompare(b.wonderName, "es")),
    }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.name.localeCompare(b.name, "es");
    });

  return NextResponse.json({
    alliances,
  });
}
