"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

export default function SnapshotsApiPage() {
  const [worldId, setWorldId] = useState("es141");
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const formatted = useMemo(
    () =>
      snapshots.map((s) => ({
        ...s,
        fetchedAt: new Date(s.fetchedAt).toLocaleString(),
      })),
    [snapshots],
  );

  async function loadSnapshots() {
    setErr("");
    const res = await fetch(`/api/admin/snapshots?world=${encodeURIComponent(worldId)}`);
    const data = await res.json();
    setSnapshots(data.snapshots || []);
  }

  useEffect(() => {
    loadSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId]);

  async function runSync() {
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId }),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Sync failed");
      }

      setMsg(`OK. Snapshot ${data.snapshotId}. Duración ${data.durationMs}ms`);
      await loadSnapshots();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Snapshots API</h1>
        <p className={styles.subtitle}>Ingesta + históricos por snapshot. Usa el cron en el VPS para automatizar.</p>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.input}
          value={worldId}
          onChange={(e) => setWorldId(e.target.value)}
          placeholder="worldId (ej. es141)"
        />

        <button className={styles.button} onClick={runSync} disabled={loading}>
          {loading ? "Sincronizando…" : "Sync manual"}
        </button>

        <button className={styles.secondaryButton} onClick={loadSnapshots}>
          Refrescar
        </button>
      </div>

      {msg ? <p className={styles.success}>{msg}</p> : null}
      {err ? <p className={styles.error}>{err}</p> : null}

      <div className={styles.separator} />

      <h2 className={styles.sectionTitle}>Últimos snapshots</h2>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Duración (ms)</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {formatted.map((s) => (
              <tr key={s.id}>
                <td>{s.fetchedAt}</td>
                <td>{s.status}</td>
                <td>{s.durationMs ?? ""}</td>
                <td>
                  <small>{s.notes ?? ""}</small>
                </td>
              </tr>
            ))}

            {formatted.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <small>Sin datos todavía.</small>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className={styles.separator} />

      <h2 className={styles.sectionTitle}>Seguridad</h2>
      <a className={styles.link} href="/admin/password">
        Cambiar contraseña
      </a>
    </div>
  );
}
