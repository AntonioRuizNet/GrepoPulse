import { NextResponse } from 'next/server';
import { z } from 'zod';
import { syncWorld } from '@/lib/sync';
import { validateWorldId } from '@/lib/grepolis';

const Body = z.object({ worldId: z.string().min(1) });

export async function POST(req) {
  try {
    const json = await req.json();
    const { worldId } = Body.parse(json);
    if (!validateWorldId(worldId)) {
      return NextResponse.json({ error: 'Invalid world. Example: es141' }, { status: 400 });
    }
    const result = await syncWorld({ worldId });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
