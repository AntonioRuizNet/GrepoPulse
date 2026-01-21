import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  GREPOLIS_FILES,
  fetchGzipLines,
  worldBaseUrl,
  splitCsvLine,
  asInt,
  asBigInt,
} from './grepolis';

const BATCH_SIZE = 1000;

function nowMs() {
  return Date.now();
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function ensureWorld(worldId) {
  await prisma.world.upsert({
    where: { id: worldId },
    update: {},
    create: { id: worldId },
  });
}

async function upsertPlayersCatalog(worldId, rows) {
  // rows: {playerId, name, allianceId, towns}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    const values = Prisma.join(
      batch.map((r) =>
        Prisma.sql`(${worldId}, ${r.playerId}, ${r.name}, ${r.allianceId}, ${r.towns})`
      )
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Player" ("worldId", "playerId", "name", "allianceId", "towns")
      VALUES ${values}
      ON CONFLICT ("worldId", "playerId") DO UPDATE SET
        "name" = EXCLUDED."name",
        "allianceId" = EXCLUDED."allianceId",
        "towns" = EXCLUDED."towns",
        "updatedAt" = NOW();
    `);
  }
}

async function upsertAlliancesCatalog(worldId, rows) {
  // rows: {allianceId, name}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    const values = Prisma.join(
      batch.map((r) => Prisma.sql`(${worldId}, ${r.allianceId}, ${r.name})`)
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Alliance" ("worldId", "allianceId", "name")
      VALUES ${values}
      ON CONFLICT ("worldId", "allianceId") DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = NOW();
    `);
  }
}

async function upsertTownsCatalog(worldId, rows) {
  // rows: {townId, playerId, name, islandX, islandY, numberOnIsland, points}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    const values = Prisma.join(
      batch.map((r) =>
        Prisma.sql`(${worldId}, ${r.townId}, ${r.playerId}, ${r.name}, ${r.islandX}, ${r.islandY}, ${r.numberOnIsland}, ${r.points})`
      )
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Town" (
        "worldId", "townId", "playerId", "name", "islandX", "islandY", "numberOnIsland", "points"
      )
      VALUES ${values}
      ON CONFLICT ("worldId", "townId") DO UPDATE SET
        "playerId" = EXCLUDED."playerId",
        "name" = EXCLUDED."name",
        "islandX" = EXCLUDED."islandX",
        "islandY" = EXCLUDED."islandY",
        "numberOnIsland" = EXCLUDED."numberOnIsland",
        "points" = EXCLUDED."points",
        "updatedAt" = NOW();
    `);
  }
}

async function upsertIslandsCatalog(worldId, rows) {
  // rows: {islandId, x, y, islandType, availableTowns, resourcesAdvantage, resourcesDisadvantage}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    const values = Prisma.join(
      batch.map((r) =>
        Prisma.sql`(${worldId}, ${r.islandId}, ${r.x}, ${r.y}, ${r.islandType}, ${r.availableTowns}, ${r.resourcesAdvantage}, ${r.resourcesDisadvantage})`
      )
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Island" (
        "worldId", "islandId", "x", "y", "islandType", "availableTowns",
        "resourcesAdvantage", "resourcesDisadvantage"
      )
      VALUES ${values}
      ON CONFLICT ("worldId", "islandId") DO UPDATE SET
        "x" = EXCLUDED."x",
        "y" = EXCLUDED."y",
        "islandType" = EXCLUDED."islandType",
        "availableTowns" = EXCLUDED."availableTowns",
        "resourcesAdvantage" = EXCLUDED."resourcesAdvantage",
        "resourcesDisadvantage" = EXCLUDED."resourcesDisadvantage",
        "updatedAt" = NOW();
    `);
  }
}

async function insertConquers(worldId, rows) {
  // rows: {townId, time, newPlayerId, oldPlayerId, newAllyId, oldAllyId, townPoints}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    const values = Prisma.join(
      batch.map((r) =>
        Prisma.sql`(${worldId}, ${r.townId}, ${r.time}, ${r.newPlayerId}, ${r.oldPlayerId}, ${r.newAllyId}, ${r.oldAllyId}, ${r.townPoints})`
      )
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Conquer" (
        "worldId", "townId", "time", "newPlayerId", "oldPlayerId", "newAllyId", "oldAllyId", "townPoints"
      )
      VALUES ${values}
      ON CONFLICT ("worldId", "townId", "time") DO NOTHING;
    `);
  }
}

async function createPlayerRankSnapshot(snapshotId, rows) {
  // rows: {playerId, points, rank, towns}
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    await prisma.playerRankSnapshot.createMany({
      data: batch.map((r) => ({ ...r, snapshotId })),
      skipDuplicates: true,
    });
  }
}

async function createAllianceRankSnapshot(snapshotId, rows) {
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    await prisma.allianceRankSnapshot.createMany({
      data: batch.map((r) => ({ ...r, snapshotId })),
      skipDuplicates: true,
    });
  }
}

async function createPlayerKillsSnapshot(snapshotId, type, rows) {
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    await prisma.playerKillSnapshot.createMany({
      data: batch.map((r) => ({ ...r, snapshotId, type })),
      skipDuplicates: true,
    });
  }
}

async function createAllianceKillsSnapshot(snapshotId, type, rows) {
  for (const batch of chunkArray(rows, BATCH_SIZE)) {
    await prisma.allianceKillSnapshot.createMany({
      data: batch.map((r) => ({ ...r, snapshotId, type })),
      skipDuplicates: true,
    });
  }
}

export async function syncWorld({ worldId }) {
  const started = nowMs();

  await ensureWorld(worldId);

  const snapshot = await prisma.snapshot.create({
    data: { worldId, status: 'running' },
  });

  const summary = {
    snapshotId: snapshot.id,
    worldId,
    players: 0,
    alliances: 0,
    towns: 0,
    islands: 0,
    conquers: 0,
    playerKillsAll: 0,
    playerKillsAtt: 0,
    playerKillsDef: 0,
    allianceKillsAll: 0,
    allianceKillsAtt: 0,
    allianceKillsDef: 0,
  };

  const base = worldBaseUrl(worldId);

  try {
    // PLAYERS (catalog + snapshot rank)
    {
      const url = `${base}/${GREPOLIS_FILES.players}`;
      const rl = await fetchGzipLines(url);

      const catalogRows = [];
      const rankRows = [];

      for await (const line of rl) {
        if (!line) continue;
        const [id, name, allianceId, points, rank, towns] = splitCsvLine(line);
        const playerId = asInt(id);
        catalogRows.push({
          playerId,
          name,
          allianceId: allianceId === '' ? null : asInt(allianceId),
          towns: asInt(towns),
        });
        rankRows.push({
          playerId,
          points: asBigInt(points),
          rank: asInt(rank),
          towns: asInt(towns),
        });

        if (catalogRows.length >= BATCH_SIZE) {
          await upsertPlayersCatalog(worldId, catalogRows.splice(0));
        }
        if (rankRows.length >= BATCH_SIZE) {
          await createPlayerRankSnapshot(snapshot.id, rankRows.splice(0));
        }
        summary.players++;
      }

      if (catalogRows.length) await upsertPlayersCatalog(worldId, catalogRows);
      if (rankRows.length) await createPlayerRankSnapshot(snapshot.id, rankRows);
    }

    // PLAYER KILLS
    async function syncPlayerKills(file, typeKey, type) {
      const url = `${base}/${file}`;
      const rl = await fetchGzipLines(url);
      const rows = [];
      for await (const line of rl) {
        if (!line) continue;
        const [rank, playerId, points] = splitCsvLine(line);
        rows.push({
          playerId: asInt(playerId),
          rank: asInt(rank),
          points: asBigInt(points),
        });
        if (rows.length >= BATCH_SIZE) {
          await createPlayerKillsSnapshot(snapshot.id, type, rows.splice(0));
        }
        summary[typeKey]++;
      }
      if (rows.length) await createPlayerKillsSnapshot(snapshot.id, type, rows);
    }

    await syncPlayerKills(GREPOLIS_FILES.playerKillsAll, 'playerKillsAll', 'all');
    await syncPlayerKills(GREPOLIS_FILES.playerKillsAtt, 'playerKillsAtt', 'att');
    await syncPlayerKills(GREPOLIS_FILES.playerKillsDef, 'playerKillsDef', 'def');

    // ALLIANCES (catalog + rank snapshot)
    {
      const url = `${base}/${GREPOLIS_FILES.alliances}`;
      const rl = await fetchGzipLines(url);

      const catalogRows = [];
      const rankRows = [];

      for await (const line of rl) {
        if (!line) continue;
        const [id, name, points, villages, members, rank] = splitCsvLine(line);
        const allianceId = asInt(id);

        catalogRows.push({ allianceId, name });
        rankRows.push({
          allianceId,
          points: asBigInt(points),
          villages: asInt(villages),
          members: asInt(members),
          rank: asInt(rank),
        });

        if (catalogRows.length >= BATCH_SIZE) {
          await upsertAlliancesCatalog(worldId, catalogRows.splice(0));
        }
        if (rankRows.length >= BATCH_SIZE) {
          await createAllianceRankSnapshot(snapshot.id, rankRows.splice(0));
        }
        summary.alliances++;
      }

      if (catalogRows.length) await upsertAlliancesCatalog(worldId, catalogRows);
      if (rankRows.length) await createAllianceRankSnapshot(snapshot.id, rankRows);
    }

    // ALLIANCE KILLS
    async function syncAllianceKills(file, typeKey, type) {
      const url = `${base}/${file}`;
      const rl = await fetchGzipLines(url);
      const rows = [];
      for await (const line of rl) {
        if (!line) continue;
        const [rank, allianceId, points] = splitCsvLine(line);
        rows.push({
          allianceId: asInt(allianceId),
          rank: asInt(rank),
          points: asBigInt(points),
        });
        if (rows.length >= BATCH_SIZE) {
          await createAllianceKillsSnapshot(snapshot.id, type, rows.splice(0));
        }
        summary[typeKey]++;
      }
      if (rows.length) await createAllianceKillsSnapshot(snapshot.id, type, rows);
    }

    await syncAllianceKills(GREPOLIS_FILES.allianceKillsAll, 'allianceKillsAll', 'all');
    await syncAllianceKills(GREPOLIS_FILES.allianceKillsAtt, 'allianceKillsAtt', 'att');
    await syncAllianceKills(GREPOLIS_FILES.allianceKillsDef, 'allianceKillsDef', 'def');

    // TOWNS
    {
      const url = `${base}/${GREPOLIS_FILES.towns}`;
      const rl = await fetchGzipLines(url);
      const rows = [];
      for await (const line of rl) {
        if (!line) continue;
        const [id, playerId, name, islandX, islandY, numberOnIsland, points] = splitCsvLine(line);
        rows.push({
          townId: asInt(id),
          playerId: asInt(playerId),
          name,
          islandX: asInt(islandX),
          islandY: asInt(islandY),
          numberOnIsland: asInt(numberOnIsland),
          points: asInt(points),
        });
        if (rows.length >= BATCH_SIZE) {
          await upsertTownsCatalog(worldId, rows.splice(0));
        }
        summary.towns++;
      }
      if (rows.length) await upsertTownsCatalog(worldId, rows);
    }

    // ISLANDS
    {
      const url = `${base}/${GREPOLIS_FILES.islands}`;
      const rl = await fetchGzipLines(url);
      const rows = [];
      for await (const line of rl) {
        if (!line) continue;
        const [id, x, y, islandType, availableTowns, resAdv, resDis] = splitCsvLine(line);
        rows.push({
          islandId: asInt(id),
          x: asInt(x),
          y: asInt(y),
          islandType: asInt(islandType),
          availableTowns: asInt(availableTowns),
          resourcesAdvantage: asInt(resAdv),
          resourcesDisadvantage: asInt(resDis),
        });
        if (rows.length >= BATCH_SIZE) {
          await upsertIslandsCatalog(worldId, rows.splice(0));
        }
        summary.islands++;
      }
      if (rows.length) await upsertIslandsCatalog(worldId, rows);
    }

    // CONQUERS
    {
      const url = `${base}/${GREPOLIS_FILES.conquers}`;
      const rl = await fetchGzipLines(url);
      const rows = [];
      for await (const line of rl) {
        if (!line) continue;
        const [townId, time, newPlayerId, oldPlayerId, newAllyId, oldAllyId, townPoints] = splitCsvLine(line);
        rows.push({
          townId: asInt(townId),
          time: asBigInt(time),
          newPlayerId: newPlayerId === '' ? null : asInt(newPlayerId),
          oldPlayerId: oldPlayerId === '' ? null : asInt(oldPlayerId),
          newAllyId: newAllyId === '' ? null : asInt(newAllyId),
          oldAllyId: oldAllyId === '' ? null : asInt(oldAllyId),
          townPoints: asInt(townPoints),
        });
        if (rows.length >= BATCH_SIZE) {
          await insertConquers(worldId, rows.splice(0));
        }
        summary.conquers++;
      }
      if (rows.length) await insertConquers(worldId, rows);
    }

    const durationMs = nowMs() - started;
    await prisma.snapshot.update({
      where: { id: snapshot.id },
      data: { status: 'ok', durationMs },
    });

    return { ok: true, ...summary, durationMs };
  } catch (err) {
    const durationMs = nowMs() - started;
    await prisma.snapshot.update({
      where: { id: snapshot.id },
      data: { status: 'error', durationMs, notes: String(err?.message || err) },
    });
    throw err;
  }
}
