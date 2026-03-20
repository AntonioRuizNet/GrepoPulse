import { WONDER_LEVELS_X1 } from "@/app/constants/wonderLevels";

function getWonderMetrics(level, durationSeconds) {
  const levelConfig = WONDER_LEVELS_X1[level];

  if (!levelConfig) {
    return {
      officialDurationSeconds: 0,
      acceleratedSeconds: 0,
      accelerationsUsed: 0,
    };
  }

  const officialDurationSeconds = levelConfig.buildSeconds;
  const accelerationSeconds = levelConfig.accelerationSeconds;

  const acceleratedSeconds = Math.max(0, officialDurationSeconds - durationSeconds);

  const accelerationsUsed = accelerationSeconds > 0 ? Number((acceleratedSeconds / accelerationSeconds).toFixed(2)) : 0;

  return {
    officialDurationSeconds,
    acceleratedSeconds,
    accelerationsUsed,
  };
}

export async function processWonderSnapshot({ prisma, body }) {
  const capturedAt = new Date(body.capturedAt);

  const snapshotRows = body.alliances.flatMap((alliance) =>
    alliance.wonders.map((wonder) => ({
      capturedAt,
      world: body.world,
      allianceName: alliance.name,
      allianceRank: alliance.rank,
      alliancePoints: alliance.points,
      wonderType: wonder.wonderType,
      wonderName: wonder.wonderName,
      level: wonder.level,
      sea: wonder.sea,
    })),
  );

  if (snapshotRows.length === 0) {
    return {
      inserted: 0,
      eventsCreated: 0,
    };
  }

  let eventsCreated = 0;

  await prisma.$transaction(async (tx) => {
    await tx.wonderSnapshot.createMany({
      data: snapshotRows,
    });

    for (const row of snapshotRows) {
      const previous = await tx.wonderSnapshot.findFirst({
        where: {
          world: row.world,
          allianceName: row.allianceName,
          wonderType: row.wonderType,
          capturedAt: {
            lt: capturedAt,
          },
        },
        orderBy: {
          capturedAt: "desc",
        },
        select: {
          level: true,
          capturedAt: true,
        },
      });

      if (!previous) continue;

      if (row.level > previous.level) {
        const durationSeconds = Math.max(0, Math.floor((capturedAt.getTime() - previous.capturedAt.getTime()) / 1000));

        const { officialDurationSeconds, acceleratedSeconds, accelerationsUsed } = getWonderMetrics(row.level, durationSeconds);

        await tx.wonderLevelEvent.create({
          data: {
            world: row.world,
            allianceName: row.allianceName,
            wonderType: row.wonderType,
            level: row.level,
            detectedAt: capturedAt,
            previousLevel: previous.level,
            previousDetectedAt: previous.capturedAt,
            durationSeconds,
            officialDurationSeconds,
            acceleratedSeconds,
            accelerationsUsed,
          },
        });

        eventsCreated += 1;
      }
    }
  });

  return {
    inserted: snapshotRows.length,
    eventsCreated,
  };
}
