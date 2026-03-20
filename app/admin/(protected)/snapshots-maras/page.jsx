"use client";

import { useEffect, useMemo, useState } from "react";

const WORLD_ID = "es141";

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDurationFromDates(current, previous) {
  if (!current || !previous) return "-";

  const diffSeconds = Math.max(0, Math.floor((new Date(current).getTime() - new Date(previous).getTime()) / 1000));

  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  return parts.length ? parts.join(" ") : "0m";
}

export default function SnapshotsMarasPage() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadSnapshots();
  }, []);

  async function loadSnapshots() {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`/api/admin/wonder-snapshots?world=${encodeURIComponent(WORLD_ID)}`, { cache: "no-store" });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudieron cargar los snapshots");
      }

      setSnapshots(data.snapshots || []);
    } catch (error) {
      setErr(error?.message || "Error cargando snapshots");
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    const uniqueDates = [];
    const seen = new Set();

    for (const snapshot of snapshots) {
      const iso = new Date(snapshot.capturedAt).toISOString();

      if (!seen.has(iso)) {
        seen.add(iso);
        uniqueDates.push(iso);
      }
    }

    return uniqueDates.map((capturedAt, index) => ({
      capturedAt,
      duration: formatDurationFromDates(capturedAt, uniqueDates[index + 1]),
    }));
  }, [snapshots]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Snapshots Maras</h1>
        <p style={{ margin: "8px 0 0", color: "#6b7280" }}>Histórico de capturas agrupadas por fecha.</p>
      </div>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={loadSnapshots}
          type="button"
          style={{
            border: "1px solid #d1d5db",
            background: "#ffffff",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Recargar
        </button>

        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Total snapshots: <strong>{rows.length}</strong>
        </div>
      </div>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <div style={{ padding: 20 }}>Cargando...</div>
        ) : err ? (
          <div style={{ padding: 20, color: "#b91c1c" }}>{err}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 20 }}>No hay snapshots disponibles.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Duración
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.capturedAt}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#fcfcfd",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        color: "#111827",
                      }}
                    >
                      {formatDate(row.capturedAt)}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        color: "#374151",
                        fontWeight: 600,
                      }}
                    >
                      {row.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
