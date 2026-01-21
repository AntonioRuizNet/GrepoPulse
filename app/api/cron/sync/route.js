import { NextResponse } from 'next/server';
import { syncWorld } from '@/lib/sync';
import { validateWorldId } from '@/lib/grepolis';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured: missing CRON_SECRET' }, { status: 500 });
  }

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || token !== secret) return unauthorized();

  const { searchParams } = new URL(req.url);
  const worldId = (searchParams.get('world') || '').trim();
  if (!validateWorldId(worldId)) {
    return NextResponse.json({ error: 'Invalid world. Example: es141' }, { status: 400 });
  }

  try {
    const result = await syncWorld({ worldId });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
