"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import SeaMapSvg from "./SeaMapSvg";
import AllianceLegend from "./AllianceLegend";
import styles from "./MapClient.module.css";

/*function colorForAlliance(allianceId) {
  if (allianceId == null) return "rgba(255,255,255,0.18)";
  // simple deterministic palette
  const palette = [
    "rgba(255, 0, 0, 1)",
    "rgba(0, 255, 0, 1)",
    "rgba(251, 255, 0, 1)",
    "rgba(0, 234, 255, 1)",
    "rgba(255, 0, 208, 0.95)",
    "rgb(255, 166, 0)",
    "rgba(255, 255, 255, 0.95)",
    "rgba(112, 112, 112, 0.95)",
  ];
  const idx = Math.abs(Number(allianceId)) % palette.length;
  return palette[idx];
}*/
function colorForAlliance(allianceId) {
  if (allianceId == null) return "rgba(255,255,255,0.18)";

  const id = Number(allianceId);

  // hash simple
  const hue = Math.abs(id * 137.508) % 360; // golden angle

  return `hsl(${hue}, 70%, 55%)`;
}

export default function MapClient({ data }) {
  const { frames, window, staticTowns, changedTowns, allianceName } = data;
  const [frameIndex, setFrameIndex] = useState(Math.max(0, frames.length - 1));

  // autoplay: 7 días → hoy (LOOP infinito + más lento)
  useEffect(() => {
    let i = 0;
    setFrameIndex(0);

    const intervalMs = 2200; // más lento (ajusta si quieres)
    const t = setInterval(() => {
      i = (i + 1) % frames.length; // NUNCA se detiene
      setFrameIndex(i);
    }, intervalMs);

    return () => clearInterval(t);
  }, [frames.length]);

  const ownersByTown = useMemo(() => {
    const m = new Map();
    for (const o of frames[frameIndex]?.owners ?? []) m.set(o.townId, o.allianceId);
    return m;
  }, [frames, frameIndex]);

  const coloredStatic = useMemo(
    () =>
      staticTowns.map((t) => ({
        ...t,
        color: colorForAlliance(t.allianceId),
      })),
    [staticTowns],
  );

  const coloredChanged = useMemo(
    () =>
      changedTowns.map((t) => {
        const a = ownersByTown.get(t.townId) ?? t.allianceId ?? null;
        return { ...t, allianceId: a, color: colorForAlliance(a) };
      }),
    [changedTowns, ownersByTown],
  );

  const legend = useMemo(() => {
    const counts = new Map();
    for (const t of [...coloredStatic, ...coloredChanged]) {
      if (t.allianceId == null) continue;
      counts.set(t.allianceId, (counts.get(t.allianceId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({
        id,
        name: allianceName[id] ?? `#${id}`,
        count,
        color: colorForAlliance(id),
      }));
  }, [coloredStatic, coloredChanged, allianceName]);

  const label = frames[frameIndex]?.date ? new Date(frames[frameIndex].date).toLocaleDateString() : "";

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Mapas</h1>
        <div className={styles.sub}>
          Evolución (últimos {window.days} días): <strong>{label}</strong>
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Mapa de mares">
          <SeaMapSvg staticTowns={coloredStatic} changedTowns={coloredChanged} />
          <div className={styles.hint}>*Animación basada en conquistas recientes y estados actuales.</div>
        </Card>
        <Card title="Alianzas destacadas">
          <AllianceLegend rows={legend} />
        </Card>
      </div>
    </div>
  );
}
