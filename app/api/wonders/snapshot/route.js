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

const ALLOWED_ORIGIN = "https://it126.grepolis.com";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonCors(data, init = {}) {
  const response = NextResponse.json(data, init);

  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function getBearerToken(req) {
  const auth = req.headers.get("authorization") || "";
  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req) {
  try {
    const token = getBearerToken(req);

    if (!token || token !== process.env.WONDER_INGEST_SECRET) {
      return jsonCors({ error: "Unauthorized" }, { status: 401 });
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
      return jsonCors({ ok: true, inserted: 0, eventsCreated: 0 });
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

    return jsonCors({
      ok: true,
      inserted: snapshotRows.length,
      eventsCreated,
    });
  } catch (error) {
    return jsonCors({ error: error?.message || String(error) }, { status: 400 });
  }
}
