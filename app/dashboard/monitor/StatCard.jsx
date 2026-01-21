"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./StatCard.module.css";

function isNumberLike(v) {
  return typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)));
}

export default function StatCard({ title, value }) {
  const numeric = useMemo(() => (isNumberLike(value) ? Number(value) : null), [value]);
  const [shown, setShown] = useState(numeric ?? value);

  useEffect(() => {
    if (numeric == null) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const from = 0;
    const to = numeric;
    const dur = 450;

    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setShown(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric, value]);

  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{String(shown)}</div>
    </div>
  );
}
