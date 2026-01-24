import { prisma } from "@/lib/prisma";
import { getSea } from "@/lib/sea";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function epochSeconds(d) {
  return BigInt(Math.floor(d.getTime() / 1000));
}

export async function getMapData(worldId, days = 7) {
  const now = new Date();
  const start = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  const startEpoch = epochSeconds(start);

  // Town positions + current alliance via Player
  const towns = await prisma.town.findMany({
    where: { worldId },
    select: {
      townId: true,
      name: true,
      islandX: true,
      islandY: true,
      points: true,
      playerId: true,
    },
  });

  const playerIds = Array.from(new Set(towns.map((t) => t.playerId)));
  const players = playerIds.length
    ? await prisma.player.findMany({
        where: { worldId, playerId: { in: playerIds } },
        select: { playerId: true, allianceId: true },
      })
    : [];
  const allianceByPlayer = new Map(players.map((p) => [p.playerId, p.allianceId ?? null]));

  const townPoints = towns
    .map((t) => ({
      townId: t.townId,
      name: t.name,
      x: t.islandX,
      y: t.islandY,
      sea: getSea(t.islandX, t.islandY),
      points: t.points,
      allianceId: allianceByPlayer.get(t.playerId) ?? null,
    }))
    .filter((t) => Number.isFinite(t.x) && Number.isFinite(t.y));

  // Conquers in the last N days (used to animate evolution)
  const conquers = await prisma.conquer.findMany({
    where: { worldId, time: { gte: startEpoch } },
    orderBy: { time: "asc" },
    select: {
      townId: true,
      time: true,
      newAllyId: true,
      oldAllyId: true,
    },
  });

  const changedTownIds = new Set(conquers.map((c) => c.townId));
  const changedTowns = townPoints.filter((t) => changedTownIds.has(t.townId));
  const staticTowns = townPoints.filter((t) => !changedTownIds.has(t.townId));

  // Baseline owners for changed towns = oldAllyId of first conquer in window (fallback to current)
  const owner = new Map();
  const firstByTown = new Map();
  for (const c of conquers) {
    if (!firstByTown.has(c.townId)) firstByTown.set(c.townId, c);
  }
  for (const t of changedTowns) {
    const first = firstByTown.get(t.townId);
    owner.set(t.townId, first?.oldAllyId ?? t.allianceId ?? null);
  }

  // Build day frames (owners for changed towns only)
  const frames = [];
  let idx = 0;
  for (let i = 0; i < days; i++) {
    const dayEnd = new Date(start.getTime() + (i + 1) * 24 * 60 * 60 * 1000 - 1);
    const endEpoch = epochSeconds(dayEnd);

    while (idx < conquers.length) {
      const c = conquers[idx];
      const t = BigInt(c.time);
      if (t > endEpoch) break;
      owner.set(c.townId, c.newAllyId ?? null);
      idx++;
    }

    const owners = changedTowns.map((t) => ({
      townId: t.townId,
      allianceId: owner.get(t.townId) ?? null,
    }));

    frames.push({
      date: new Date(dayEnd).toISOString(),
      owners,
    });
  }

  // Alliance names (for legend)
  const allianceIds = Array.from(
    new Set(
      [...staticTowns, ...changedTowns]
        .map((t) => t.allianceId)
        .concat(conquers.map((c) => c.newAllyId ?? null), conquers.map((c) => c.oldAllyId ?? null))
        .filter((v) => typeof v === "number"),
    ),
  );
  const alliances = allianceIds.length
    ? await prisma.alliance.findMany({
        where: { worldId, allianceId: { in: allianceIds } },
        select: { allianceId: true, name: true },
      })
    : [];
  const allianceName = Object.fromEntries(alliances.map((a) => [a.allianceId, a.name]));

  return {
    worldId,
    window: { start: start.toISOString(), end: now.toISOString(), days },
    staticTowns,
    changedTowns,
    frames,
    allianceName,
  };
}
