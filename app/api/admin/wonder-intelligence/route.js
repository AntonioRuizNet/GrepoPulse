import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const world = searchParams.get("world");

  const events = await prisma.wonderLevelEvent.findMany({
    where: world ? { world } : undefined,
    orderBy: [{ detectedAt: "desc" }, { level: "desc" }],
  });

  const latestByWonderMap = new Map();
  const historyByWonderMap = new Map();

  for (const event of events) {
    const wonderKey = `${event.world}-${event.allianceName}-${event.wonderType}`;

    if (!latestByWonderMap.has(wonderKey)) {
      latestByWonderMap.set(wonderKey, event);
    }

    if (!historyByWonderMap.has(wonderKey)) {
      historyByWonderMap.set(wonderKey, []);
    }

    historyByWonderMap.get(wonderKey).push({
      level: event.level,
      detectedAt: event.detectedAt,
      finishedAt: event.finishedAt,
      previousLevel: event.previousLevel,
      previousDetectedAt: event.previousDetectedAt,
      durationSeconds: event.durationSeconds,
      officialDurationSeconds: event.officialDurationSeconds,
      acceleratedSeconds: event.acceleratedSeconds,
      accelerationsUsed: event.accelerationsUsed,
    });
  }

  const alliancesMap = new Map();

  for (const event of latestByWonderMap.values()) {
    const allianceKey = `${event.world}-${event.allianceName}`;

    if (!alliancesMap.has(allianceKey)) {
      alliancesMap.set(allianceKey, {
        world: event.world,
        name: event.allianceName,
        rank: event.allianceRank,
        points: event.alliancePoints,
        wonders: [],
      });
    }

    const wonderKey = `${event.world}-${event.allianceName}-${event.wonderType}`;
    const history = (historyByWonderMap.get(wonderKey) || []).sort((a, b) => b.level - a.level);

    alliancesMap.get(allianceKey).wonders.push({
      wonderType: event.wonderType,
      wonderName: event.wonderName,
      level: event.level,
      sea: event.sea,
      capturedAt: event.detectedAt,
      levelDetectedAt: event.detectedAt,
      durationSeconds: event.durationSeconds,
      officialDurationSeconds: event.officialDurationSeconds,
      acceleratedSeconds: event.acceleratedSeconds,
      accelerationsUsed: event.accelerationsUsed,
      history,
    });
  }

  const alliances = [...alliancesMap.values()]
    .map((alliance) => ({
      ...alliance,
      wonders: alliance.wonders.sort((a, b) => (a.wonderName || "").localeCompare(b.wonderName || "", "es")),
    }))
    .sort((a, b) => {
      const rankA = a.rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.rank ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) return rankA - rankB;

      return a.name.localeCompare(b.name, "es");
    });

  return NextResponse.json({
    alliances,
  });
}
