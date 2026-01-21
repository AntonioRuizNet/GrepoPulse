import { prisma } from "@/lib/prisma";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
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

function toBigInt(v) {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string") return BigInt(v);
  return 0n;
}

export async function getDailyRankings(worldId) {
  const { latest, first } = await getTodaySnapshotPair(worldId);

  // Helper para deltas con tablas snapshot (player/alliance kills & ranks)
  async function topPlayerKills(type) {
    const rows = await prisma.$queryRaw`
      SELECT
        p."name" as "name",
        pk1."playerId" as "id",
        pk1."points" as "latestPoints",
        COALESCE(pk0."points", 0) as "firstPoints"
      FROM "PlayerKillSnapshot" pk1
      JOIN "Player" p
        ON p."worldId" = ${worldId} AND p."playerId" = pk1."playerId"
      LEFT JOIN "PlayerKillSnapshot" pk0
        ON pk0."snapshotId" = ${first.id}
       AND pk0."playerId" = pk1."playerId"
       AND pk0."type" = (${type}::"KillType")
      WHERE pk1."snapshotId" = ${latest.id}
        AND pk1."type" = (${type}::"KillType")
      ORDER BY (pk1."points" - COALESCE(pk0."points", 0)) DESC
      LIMIT 10;
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      delta: toBigInt(r.latestPoints) - toBigInt(r.firstPoints),
    }));
  }

  async function topAllianceKills(type) {
    const rows = await prisma.$queryRaw`
      SELECT
        a."name" as "name",
        ak1."allianceId" as "id",
        ak1."points" as "latestPoints",
        COALESCE(ak0."points", 0) as "firstPoints"
      FROM "AllianceKillSnapshot" ak1
      JOIN "Alliance" a
        ON a."worldId" = ${worldId} AND a."allianceId" = ak1."allianceId"
      LEFT JOIN "AllianceKillSnapshot" ak0
        ON ak0."snapshotId" = ${first.id}
       AND ak0."allianceId" = ak1."allianceId"
       AND ak0."type" = (${type}::"KillType")
      WHERE ak1."snapshotId" = ${latest.id}
        AND ak1."type" = (${type}::"KillType")
      ORDER BY (ak1."points" - COALESCE(ak0."points", 0)) DESC
      LIMIT 10;
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      delta: toBigInt(r.latestPoints) - toBigInt(r.firstPoints),
    }));
  }

  async function topPlayerBuilders() {
    const rows = await prisma.$queryRaw`
      SELECT
        p."name" as "name",
        pr1."playerId" as "id",
        pr1."points" as "latestPoints",
        COALESCE(pr0."points", 0) as "firstPoints"
      FROM "PlayerRankSnapshot" pr1
      JOIN "Player" p
        ON p."worldId" = ${worldId} AND p."playerId" = pr1."playerId"
      LEFT JOIN "PlayerRankSnapshot" pr0
        ON pr0."snapshotId" = ${first.id}
       AND pr0."playerId" = pr1."playerId"
      WHERE pr1."snapshotId" = ${latest.id}
      ORDER BY (pr1."points" - COALESCE(pr0."points", 0)) DESC
      LIMIT 10;
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      delta: toBigInt(r.latestPoints) - toBigInt(r.firstPoints),
    }));
  }

  return {
    window: {
      latestAt: latest.fetchedAt,
      firstAt: first.fetchedAt,
    },
    topPlayersAttack: await topPlayerKills("att"),
    topPlayersDef: await topPlayerKills("def"),
    topAlliancesAttack: await topAllianceKills("att"),
    topAlliancesDef: await topAllianceKills("def"),
    topBuilders: await topPlayerBuilders(),
  };
}
