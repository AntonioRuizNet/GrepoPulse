import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import readline from 'readline';

export function worldBaseUrl(worldId) {
  // worldId like "es141"
  return `https://${worldId}.grepolis.com/data`;
}

export const GREPOLIS_FILES = {
  players: 'players.txt.gz',
  playerKillsAll: 'player_kills_all.txt.gz',
  playerKillsAtt: 'player_kills_att.txt.gz',
  playerKillsDef: 'player_kills_def.txt.gz',

  alliances: 'alliances.txt.gz',
  allianceKillsAll: 'alliance_kills_all.txt.gz',
  allianceKillsAtt: 'alliance_kills_att.txt.gz',
  allianceKillsDef: 'alliance_kills_def.txt.gz',

  towns: 'towns.txt.gz',
  conquers: 'conquers.txt.gz',
  islands: 'islands.txt.gz',
};

export async function fetchGzipLines(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status})`);
  }
  if (!res.body) throw new Error(`Response body missing for ${url}`);

  const gunzip = createGunzip();
  const nodeStream = Readable.fromWeb(res.body).pipe(gunzip);

  const rl = readline.createInterface({ input: nodeStream, crlfDelay: Infinity });

  return rl;
}

export function splitCsvLine(line) {
  // Grepolis data is comma-separated, values are URL-encoded.
  // Use decodeURIComponent; treat '+' literally (not space) because PHP urlencode uses + for spaces.
  // We'll convert '+' to space before decoding.
  const parts = line.split(',');
  return parts.map((v) => {
    const normalized = v.replace(/\+/g, ' ');
    try {
      return decodeURIComponent(normalized);
    } catch {
      return normalized;
    }
  });
}

export function asInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

export function asBigInt(value) {
  try {
    // Some files may contain empty strings; treat as 0
    if (value === '' || value == null) return 0n;
    return BigInt(value);
  } catch {
    return 0n;
  }
}

export function validateWorldId(worldId) {
  // Minimal validation: e.g. es141, en123, etc.
  return /^[a-z]{2}\d+$/i.test(worldId);
}
