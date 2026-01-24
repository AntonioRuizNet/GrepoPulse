"use client";

import styles from "./SeaMapSvg.module.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SeaMapSvg({ staticTowns, changedTowns }) {
  const all = [...staticTowns, ...changedTowns];

  // ZOOM: cuadrícula 4x4 desde el centro
  // Centro del mapa: 500,500
  // 4 mares * 100 = 400px de ancho/alto => viewBox 300..700
  const viewBox = "300 300 400 400";

  return (
    <div className={styles.wrap}>
      <svg viewBox={viewBox} className={styles.svg}>
        {/* sea grid (0..1000) - aunque hagamos zoom, se verá solo el trozo del viewBox */}
        {Array.from({ length: 11 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 100} y1={0} x2={i * 100} y2={1000} className={styles.gridLine} />
            <line x1={0} y1={i * 100} x2={1000} y2={i * 100} className={styles.gridLine} />
          </g>
        ))}

        {/* towns */}
        {all.map((t) => (
          <circle
            key={t.townId}
            cx={clamp(t.x, 0, 1000)}
            cy={clamp(t.y, 0, 1000)}
            r={8} // ✅ puntos mucho más gordos (ajusta 3.5..6)
            fill={t.color}
            className={styles.town} // ✅ fade in/out continuo
          />
        ))}
      </svg>
    </div>
  );
}
