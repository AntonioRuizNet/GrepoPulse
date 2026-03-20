import styles from "./AllianceWonderBlock.module.css";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "-";

  const totalSeconds = Number(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  return parts.length ? parts.join(" ") : "0m";
}

function formatNumber(value) {
  if (value === null || value === undefined) return "-";

  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function shortenWonderName(name) {
  if (!name) return "-";

  const clean = name
    .replace(/^Il\s/i, "")
    .replace(/^La\s/i, "")
    .replace(/^Le\s/i, "")
    .replace(/^I\s/i, "")
    .replace(/^L'/i, "")
    .trim();

  return clean.length > 14 ? `${clean.slice(0, 14)}…` : clean;
}

function buildWonderRows(wonder) {
  const history = Array.isArray(wonder.history) ? wonder.history : [];

  if (history.length) {
    return [...history]
      .sort((a, b) => Number(b.level || 0) - Number(a.level || 0))
      .map((item) => ({
        level: item.level ?? "-",
        detectedAt: item.detectedAt,
        durationSeconds: item.durationSeconds,
        officialDurationSeconds: item.officialDurationSeconds,
        acceleratedSeconds: item.acceleratedSeconds,
        accelerationsUsed: item.accelerationsUsed,
      }));
  }

  return [
    {
      level: wonder.level ?? "-",
      detectedAt: wonder.levelDetectedAt || wonder.capturedAt,
      durationSeconds: wonder.durationSeconds,
      officialDurationSeconds: wonder.officialDurationSeconds,
      acceleratedSeconds: wonder.acceleratedSeconds,
      accelerationsUsed: wonder.accelerationsUsed,
    },
  ];
}

function WonderTable({ wonder }) {
  const rows = buildWonderRows(wonder);

  return (
    <article className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div className={styles.tableTitleGroup}>
          <h3 className={styles.tableTitle}>{wonder.wonderName}</h3>
          <div className={styles.tableMeta}>
            <span>Tipo: {wonder.wonderType || "-"}</span>
            <span>Mar: {wonder.sea ?? "-"}</span>
            <span>Nivel actual: {wonder.level ?? "-"}</span>
          </div>
        </div>

        <span className={styles.currentLevelPill}>Nv {wonder.level ?? "-"}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.wonderTable}>
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Detectado</th>
              <th>Real</th>
              <th>Oficial</th>
              <th>Acelerado</th>
              <th>Aceleraciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${wonder.wonderType}-${row.level}-${row.detectedAt || "empty"}`}>
                <td>
                  <span className={styles.levelBadge}>N{row.level}</span>
                </td>
                <td>{formatDate(row.detectedAt)}</td>
                <td>{formatDuration(row.durationSeconds)}</td>
                <td>{formatDuration(row.officialDurationSeconds)}</td>
                <td>{formatDuration(row.acceleratedSeconds)}</td>
                <td>{formatNumber(row.accelerationsUsed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function AllianceWonderBlock({ alliance }) {
  const wonders = alliance.wonders || [];

  const totalLevels = wonders.reduce((sum, wonder) => sum + (wonder.level || 0), 0);
  const averageLevel = wonders.length ? (totalLevels / wonders.length).toFixed(1) : "0.0";

  const totalAccelerations = wonders.reduce((sum, wonder) => sum + Number(wonder.accelerationsUsed || 0), 0);

  const chartData = wonders.map((wonder) => ({
    name: shortenWonderName(wonder.wonderName),
    fullName: wonder.wonderName,
    level: wonder.level || 0,
    accelerations: Number(wonder.accelerationsUsed || 0),
  }));

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerStats}>
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Posición</span>
            <strong className={styles.headerValue}>#{alliance.rank ?? "-"}</strong>
          </div>

          <div className={`${styles.headerItem} ${styles.headerItemAlliance}`}>
            <span className={styles.headerLabel}>Nombre alianza</span>
            <strong className={styles.headerValue}>{alliance.name || "-"}</strong>
          </div>

          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Puntos</span>
            <strong className={styles.headerValue}>{formatNumber(alliance.points)}</strong>
          </div>

          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Maravillas</span>
            <strong className={styles.headerValue}>{wonders.length}</strong>
          </div>

          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>Media de maravillas</span>
            <strong className={styles.headerValue}>{averageLevel}</strong>
          </div>
        </div>
      </div>

      <div className={styles.chartPanel}>
        <ResponsiveContainer width="100%" height={170}>
          <ComposedChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(56,189,248,0.24)",
                borderRadius: 10,
                color: "#e2e8f0",
                boxShadow: "0 12px 40px rgba(2, 6, 23, 0.45)",
              }}
              formatter={(value, name) => {
                if (name === "level") return [value, "Nivel"];
                if (name === "accelerations") return [value, "Aceleraciones"];
                return [value, name];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || "-"}
            />
            <Bar yAxisId="left" dataKey="level" radius={[6, 6, 0, 0]} fill="url(#barGradientMini)" maxBarSize={22} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accelerations"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#22d3ee" }}
              activeDot={{ r: 4 }}
            />
            <defs>
              <linearGradient id="barGradientMini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tablesSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Detalle por tipo de maravilla</h3>
            <p className={styles.sectionText}>Aceleraciones totales: {formatNumber(totalAccelerations)}</p>
          </div>
        </div>

        <div className={styles.tablesGrid}>
          {wonders.map((wonder) => (
            <WonderTable key={`${alliance.name}-${wonder.wonderType}`} wonder={wonder} />
          ))}
        </div>
      </div>
    </section>
  );
}
