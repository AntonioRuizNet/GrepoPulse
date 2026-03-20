export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const WonderSchema = z.object({
  wonderType: z.string().min(1),
  wonderName: z.string().min(1),
  level: z.number().int().min(0),
  sea: z.number().int().min(0),
});

const AllianceSchema = z.object({
  rank: z.number().int().min(1),
  name: z.string().min(1),
  points: z.number().int().min(0),
  wonders: z.array(WonderSchema),
});

const BodySchema = z.object({
  capturedAt: z.string().datetime(),
  world: z.string().min(1),
  alliances: z.array(AllianceSchema),
});

function getBearerToken(req) {
  const auth = req.headers.get("authorization") || "";
  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function POST(req) {
  try {
    const token = getBearerToken(req);
    if (!token || token !== process.env.WONDER_INGEST_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = BodySchema.parse(json);

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
      return NextResponse.json({ ok: true, inserted: 0, eventsCreated: 0 });
    }

    let eventsCreated = 0;

    await prisma.$transaction(async (tx) => {
      // 1) guardar snapshots
      await tx.wonderSnapshot.createMany({
        data: snapshotRows,
      });

      // 2) detectar cambios de nivel
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

        // Si no había histórico previo, puedes decidir:
        // a) no crear evento
        // b) crear evento inicial
        // Aquí NO creamos evento inicial.
        if (!previous) continue;

        // Solo crear evento si cambia el nivel
        // Si quieres SOLO subidas, cambia a: row.level > previous.level
        if (row.level !== previous.level) {
          const durationSeconds = Math.max(0, Math.floor((capturedAt.getTime() - previous.capturedAt.getTime()) / 1000));

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
            },
          });

          eventsCreated += 1;
        }
      }
    });

    return NextResponse.json({
      ok: true,
      inserted: snapshotRows.length,
      eventsCreated,
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 400 });
  }
}
