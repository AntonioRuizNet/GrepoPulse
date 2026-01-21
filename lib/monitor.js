import { prisma } from "@/lib/prisma";
import { getSea } from "@/lib/sea";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toBigInt(v) {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string") return BigInt(v);
  return 0n;
}

async function getTodaySnapshotPair(worldId) {
  const start = startOfToday();

  const latest = await prisma.snapshot.findFirst({
    where: { worldId, status: "ok", fetchedAt: { gte: start } },
    orderBy: { fetchedAt: "desc" },
    select: { id: true, fetchedAt: true },
  });
  if (!latest) throw new Error("No snapshots today yet");

  const first = await prisma.snapshot.findFirst({
    where: { worldId, status: "ok", fetchedAt: { gte: start } },
    orderBy: { fetchedAt: "asc" },
    select: { id: true, fetchedAt: true },
  });

  return { latest, first };
}

/**
 * Conquer.time en Grepolis suele venir como epoch seconds.
 * Lo comparamos contra startOfToday() convertido a epoch seconds.
 */
function startOfTodayEpochSeconds() {
  const start = startOfToday();
  return BigInt(Math.floor(start.getTime() / 1000));
}

export async function getMonitorData(worldId, limit = 10) {
  const { latest, first } = await getTodaySnapshotPair(worldId);
  const todayEpoch = startOfTodayEpochSeconds();

  // 1) CONQUISTAS DEL DÍA (tabla)
  const conquers = await prisma.conquer.findMany({
    where: { worldId, time: { gte: todayEpoch } },
    orderBy: { time: "desc" },
    take: 50, // fija, ajusta si quieres
    select: {
      townId: true,
      time: true,
      newPlayerId: true,
      oldPlayerId: true,
      newAllyId: true,
      oldAllyId: true,
      townPoints: true,
    },
  });

  // Para mostrar coordenadas/mar necesitamos Town (puede no existir si aún no se sincronizó)
  const townIds = conquers.map((c) => c.townId);
  const towns = await prisma.town.findMany({
    where: { worldId, townId: { in: townIds } },
    select: { townId: true, islandX: true, islandY: true, name: true },
  });
  const townById = new Map(towns.map((t) => [t.townId, t]));

  // Nombres de jugadores (old/new)
  const playerIds = Array.from(
    new Set(conquers.flatMap((c) => [c.newPlayerId, c.oldPlayerId]).filter((v) => typeof v === "number")),
  );
  const players = playerIds.length
    ? await prisma.player.findMany({
        where: { worldId, playerId: { in: playerIds } },
        select: { playerId: true, name: true },
      })
    : [];
  const playerName = new Map(players.map((p) => [p.playerId, p.name]));

  // Nombres de alianzas (old/new)
  const allyIds = Array.from(new Set(conquers.flatMap((c) => [c.newAllyId, c.oldAllyId]).filter((v) => typeof v === "number")));
  const allies = allyIds.length
    ? await prisma.alliance.findMany({
        where: { worldId, allianceId: { in: allyIds } },
        select: { allianceId: true, name: true },
      })
    : [];
  const allyName = new Map(allies.map((a) => [a.allianceId, a.name]));

  const conquersRows = conquers.map((c) => {
    const t = townById.get(c.townId);
    const islandX = t?.islandX ?? null;
    const islandY = t?.islandY ?? null;
    const sea = islandX != null && islandY != null ? getSea(islandX, islandY) : null;

    return {
      townId: c.townId,
      townName: t?.name ?? `#${c.townId}`,
      islandX,
      islandY,
      sea,
      townPoints: c.townPoints,
      time: c.time.toString(),
      oldPlayer: c.oldPlayerId == null ? "-" : (playerName.get(c.oldPlayerId) ?? `#${c.oldPlayerId}`),
      newPlayer: c.newPlayerId == null ? "-" : (playerName.get(c.newPlayerId) ?? `#${c.newPlayerId}`),
      oldAlly: c.oldAllyId == null ? "-" : (allyName.get(c.oldAllyId) ?? `#${c.oldAllyId}`),
      newAlly: c.newAllyId == null ? "-" : (allyName.get(c.newAllyId) ?? `#${c.newAllyId}`),
    };
  });

  // 2) JUGADORES CON MAYOR PÉRDIDA HOY (tabla)
  const losers = await prisma.$queryRaw`
    SELECT
      p."playerId" as "id",
      p."name" as "name",
      pr1."points" as "latestPoints",
      COALESCE(pr0."points", 0) as "firstPoints"
    FROM "PlayerRankSnapshot" pr1
    JOIN "Player" p
      ON p."worldId" = ${worldId} AND p."playerId" = pr1."playerId"
    LEFT JOIN "PlayerRankSnapshot" pr0
      ON pr0."snapshotId" = ${first.id} AND pr0."playerId" = pr1."playerId"
    WHERE pr1."snapshotId" = ${latest.id}
    ORDER BY (pr1."points" - COALESCE(pr0."points", 0)) ASC
    LIMIT ${limit};
  `;

  const topLossPlayers = losers.map((r) => ({
    id: r.id,
    name: r.name,
    delta: (toBigInt(r.latestPoints) - toBigInt(r.firstPoints)).toString(), // negativo
  }));

  // 3) MARES CALIENTES (tabla + chart)
  const hotSeas = await prisma.$queryRaw`
    SELECT
      (FLOOR(t."islandX" / 100) * 10 + FLOOR(t."islandY" / 100))::int AS "sea",
      COUNT(*)::int AS "conquers",
      SUM(c."townPoints")::int AS "points"
    FROM "Conquer" c
    JOIN "Town" t
      ON t."worldId" = c."worldId" AND t."townId" = c."townId"
    WHERE c."worldId" = ${worldId}
      AND c."time" >= ${todayEpoch}
    GROUP BY "sea"
    ORDER BY "conquers" DESC, "points" DESC
    LIMIT 10;
  `;

  const hotSeasRows = hotSeas.map((r) => ({
    sea: r.sea,
    conquers: r.conquers,
    points: r.points,
  }));

  // 4) ALIANZAS EN EXPANSIÓN HOY (tabla) – por puntos ganados
  const expanding = await prisma.$queryRaw`
    SELECT
      a."allianceId" as "id",
      a."name" as "name",
      ar1."points" as "latestPoints",
      COALESCE(ar0."points", 0) as "firstPoints"
    FROM "AllianceRankSnapshot" ar1
    JOIN "Alliance" a
      ON a."worldId" = ${worldId} AND a."allianceId" = ar1."allianceId"
    LEFT JOIN "AllianceRankSnapshot" ar0
      ON ar0."snapshotId" = ${first.id} AND ar0."allianceId" = ar1."allianceId"
    WHERE ar1."snapshotId" = ${latest.id}
    ORDER BY (ar1."points" - COALESCE(ar0."points", 0)) DESC
    LIMIT ${limit};
  `;

  const topAllianceGrowth = expanding.map((r) => ({
    id: r.id,
    name: r.name,
    delta: (toBigInt(r.latestPoints) - toBigInt(r.firstPoints)).toString(),
  }));

  // 5) ÍNDICE DE AGRESIVIDAD (tabla)
  // ratio = (att_delta) / (def_delta + 1)
  const aggressiveness = await prisma.$queryRaw`
    SELECT
      p."playerId" as "id",
      p."name" as "name",
      (pkAtt1."points" - COALESCE(pkAtt0."points", 0)) as "attDelta",
      (pkDef1."points" - COALESCE(pkDef0."points", 0)) as "defDelta",
      (
        (pkAtt1."points" - COALESCE(pkAtt0."points", 0))::float8
        /
        ((pkDef1."points" - COALESCE(pkDef0."points", 0))::float8 + 1.0)
      ) as "ratio"
    FROM "Player" p
    JOIN "PlayerKillSnapshot" pkAtt1
      ON pkAtt1."snapshotId" = ${latest.id} AND pkAtt1."playerId" = p."playerId" AND pkAtt1."type" = ('att'::"KillType")
    JOIN "PlayerKillSnapshot" pkDef1
      ON pkDef1."snapshotId" = ${latest.id} AND pkDef1."playerId" = p."playerId" AND pkDef1."type" = ('def'::"KillType")
    LEFT JOIN "PlayerKillSnapshot" pkAtt0
      ON pkAtt0."snapshotId" = ${first.id} AND pkAtt0."playerId" = p."playerId" AND pkAtt0."type" = ('att'::"KillType")
    LEFT JOIN "PlayerKillSnapshot" pkDef0
      ON pkDef0."snapshotId" = ${first.id} AND pkDef0."playerId" = p."playerId" AND pkDef0."type" = ('def'::"KillType")
    WHERE p."worldId" = ${worldId}
    ORDER BY "ratio" DESC
    LIMIT ${limit};
  `;

  const topAggressive = aggressiveness.map((r) => ({
    id: r.id,
    name: r.name,
    attDelta: toBigInt(r.attDelta).toString(),
    defDelta: toBigInt(r.defDelta).toString(),
    ratio: Number(r.ratio),
  }));

  // KPIs para tarjetas
  const kpis = {
    conquersToday: conquersRows.length,
    hottestSea: hotSeasRows[0]?.sea ?? null,
    hottestSeaConquers: hotSeasRows[0]?.conquers ?? 0,
  };

  // CIUDADES FANTASMA (playerId = 0)
  const ghostTowns = await prisma.$queryRaw`
    SELECT
      "townId",
      "name",
      "islandX",
      "islandY",
      "points"
    FROM "Town"
    WHERE "worldId" = ${worldId}
      AND "playerId" = 0
    ORDER BY
      (FLOOR("islandX" / 100) * 10 + FLOOR("islandY" / 100)) ASC,
      "points" DESC
    LIMIT 50;
  `;

  const ghostTownsRows = ghostTowns.map((t) => ({
    townId: t.townId,
    name: t.name,
    islandX: t.islandX,
    islandY: t.islandY,
    points: t.points,
    sea: getSea(t.islandX, t.islandY),
  }));

  return {
    window: {
      firstAt: first.fetchedAt.toISOString(),
      latestAt: latest.fetchedAt.toISOString(),
    },
    kpis,
    conquersRows,
    topLossPlayers,
    hotSeasRows,
    topAllianceGrowth,
    topAggressive,
    ghostTownsRows,
  };
}
