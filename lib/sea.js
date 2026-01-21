export function getSea(islandX, islandY) {
  const x = Number(islandX);
  const y = Number(islandY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const seaX = Math.floor(x / 100);
  const seaY = Math.floor(y / 100);
  return seaX * 10 + seaY;
}
