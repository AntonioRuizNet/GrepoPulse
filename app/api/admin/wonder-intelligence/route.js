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
    orderBy: [{ detectedAt: "desc" }, { level: "desc" }],
  });

  const latestMap = new Map();

  for (const snapshot of snapshots) {
    const key = `${snapshot.world}-${snapshot.allianceName}-${snapshot.wonderType}`;

    if (!latestMap.has(key)) {
      latestMap.set(key, snapshot);
    }
  }

  const eventsByWonderMap = new Map();

  for (const event of events) {
    const key = `${event.world}-${event.allianceName}-${event.wonderType}`;

    if (!eventsByWonderMap.has(key)) {
      eventsByWonderMap.set(key, []);
    }

    eventsByWonderMap.get(key).push(event);
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

    const wonderKey = `${row.world}-${row.allianceName}-${row.wonderType}`;
    const wonderEvents = eventsByWonderMap.get(wonderKey) || [];

    const currentLevelEvent = wonderEvents.find((event) => event.level === row.level) || null;

    const history = [...wonderEvents]
      .sort((a, b) => b.level - a.level)
      .map((event) => ({
        level: event.level,
        detectedAt: event.detectedAt,
        previousLevel: event.previousLevel,
        previousDetectedAt: event.previousDetectedAt,
        durationSeconds: event.durationSeconds,
        officialDurationSeconds: event.officialDurationSeconds,
        acceleratedSeconds: event.acceleratedSeconds,
        accelerationsUsed: event.accelerationsUsed,
      }));

    alliancesMap.get(allianceKey).wonders.push({
      wonderType: row.wonderType,
      wonderName: row.wonderName,
      level: row.level,
      sea: row.sea,
      capturedAt: row.capturedAt,
      levelDetectedAt: currentLevelEvent?.detectedAt || null,
      durationSeconds: currentLevelEvent?.durationSeconds ?? null,
      officialDurationSeconds: currentLevelEvent?.officialDurationSeconds ?? null,
      acceleratedSeconds: currentLevelEvent?.acceleratedSeconds ?? null,
      accelerationsUsed: currentLevelEvent?.accelerationsUsed ?? null,
      history,
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
