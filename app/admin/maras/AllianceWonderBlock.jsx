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

function HistoryItem({ item }) {
  return (
    <div className={styles.historyItem}>
      <span className={styles.historyBadge}>N{item.level}</span>
      <span>{formatDate(item.detectedAt)}</span>
      <span>R {formatDuration(item.durationSeconds)}</span>
      <span>O {formatDuration(item.officialDurationSeconds)}</span>
      <span>A {formatDuration(item.acceleratedSeconds)}</span>
      <span>X {formatNumber(item.accelerationsUsed)}</span>
    </div>
  );
}

function WonderCard({ wonder }) {
  const history = wonder.history || [];

  return (
    <article className={styles.wonderCard}>
      <div className={styles.wonderTop}>
        <h3 className={styles.wonderName}>{wonder.wonderName}</h3>
        <span className={styles.levelPill}>Nv {wonder.level}</span>
      </div>

      <div className={styles.wonderMeta}>
        <span>Mar {wonder.sea}</span>
        <span>{formatDate(wonder.levelDetectedAt || wonder.capturedAt)}</span>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Real</span>
          <strong className={styles.metricValue}>{formatDuration(wonder.durationSeconds)}</strong>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Oficial</span>
          <strong className={styles.metricValue}>{formatDuration(wonder.officialDurationSeconds)}</strong>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Acelerado</span>
          <strong className={styles.metricValue}>{formatDuration(wonder.acceleratedSeconds)}</strong>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Acelerac.</span>
          <strong className={styles.metricValue}>{formatNumber(wonder.accelerationsUsed)}</strong>
        </div>
      </div>

      <div className={styles.historySection}>
        {history.length ? (
          <div className={styles.historyList}>
            {history.map((item) => (
              <HistoryItem key={`${wonder.wonderType}-${item.level}-${item.detectedAt}`} item={item} />
            ))}
          </div>
        ) : (
          <div className={styles.historyEmpty}>Sin historial detectado.</div>
        )}
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
        <div>
          <div className={styles.eyebrow}>Alliance Panel</div>
          <h2 className={styles.title}>{alliance.name}</h2>
          <div className={styles.meta}>
            <span>#{alliance.rank ?? "-"}</span>
            <span>{alliance.points ?? "-"} pts</span>
            <span>{alliance.world}</span>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryBox}>
            <span className={styles.summaryLabel}>Marav.</span>
            <strong className={styles.summaryValue}>{wonders.length}</strong>
          </div>
          <div className={styles.summaryBox}>
            <span className={styles.summaryLabel}>Nivel medio</span>
            <strong className={styles.summaryValue}>{averageLevel}</strong>
          </div>
          <div className={styles.summaryBox}>
            <span className={styles.summaryLabel}>Acelerac.</span>
            <strong className={styles.summaryValue}>{formatNumber(totalAccelerations)}</strong>
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

      <div className={styles.wondersGrid}>
        {wonders.map((wonder) => (
          <WonderCard key={`${alliance.name}-${wonder.wonderType}`} wonder={wonder} />
        ))}
      </div>
    </section>
  );
}
