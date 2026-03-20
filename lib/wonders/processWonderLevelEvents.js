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

export async function processWonderLevelEvents({ prisma, body }) {
  const detectedAt = new Date(body.capturedAt);

  let inserted = 0;
  let updatedPrevious = 0;
  let skippedExisting = 0;

  await prisma.$transaction(async (tx) => {
    for (const alliance of body.alliances) {
      for (const wonder of alliance.wonders) {
        const existing = await tx.wonderLevelEvent.findUnique({
          where: {
            world_allianceName_wonderType_level: {
              world: body.world,
              allianceName: alliance.name,
              wonderType: wonder.wonderType,
              level: wonder.level,
            },
          },
        });

        if (existing) {
          skippedExisting += 1;
          continue;
        }

        const previous = await tx.wonderLevelEvent.findFirst({
          where: {
            world: body.world,
            allianceName: alliance.name,
            wonderType: wonder.wonderType,
          },
          orderBy: {
            level: "desc",
          },
        });

        if (previous) {
          const durationSeconds = Math.max(0, Math.floor((detectedAt.getTime() - previous.detectedAt.getTime()) / 1000));

          const { officialDurationSeconds, acceleratedSeconds, accelerationsUsed } = getWonderMetrics(
            previous.level,
            durationSeconds,
          );

          await tx.wonderLevelEvent.update({
            where: { id: previous.id },
            data: {
              finishedAt: detectedAt,
              durationSeconds,
              officialDurationSeconds,
              acceleratedSeconds,
              accelerationsUsed,
            },
          });

          updatedPrevious += 1;
        }

        await tx.wonderLevelEvent.create({
          data: {
            world: body.world,
            allianceName: alliance.name,
            allianceRank: alliance.rank,
            alliancePoints: alliance.points,
            wonderType: wonder.wonderType,
            wonderName: wonder.wonderName,
            level: wonder.level,
            sea: wonder.sea,
            detectedAt,
            previousLevel: previous?.level ?? null,
            previousDetectedAt: previous?.detectedAt ?? null,
          },
        });

        inserted += 1;
      }
    }
  });

  return {
    inserted,
    updatedPrevious,
    skippedExisting,
  };
}
