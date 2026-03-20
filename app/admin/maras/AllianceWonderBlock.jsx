import styles from "./AllianceWonderBlock.module.css";

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

  if (parts.length === 0) return "0m";

  return parts.join(" ");
}

function formatNumber(value) {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function AllianceWonderBlock({ alliance }) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{alliance.name}</h2>
          <div className={styles.meta}>
            <span>Rank: {alliance.rank ?? "-"}</span>
            <span>Puntos: {alliance.points ?? "-"}</span>
            <span>Mundo: {alliance.world}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Maravilla</th>
              <th>Nivel</th>
              <th>Detectado</th>
              <th>Tiempo real</th>
              <th>Tiempo oficial</th>
              <th>Acelerado</th>
              <th>Aceleraciones</th>
              <th>Mar</th>
            </tr>
          </thead>
          <tbody>
            {alliance.wonders.map((wonder) => (
              <tr key={`${alliance.name}-${wonder.wonderType}`}>
                <td className={styles.wonderName}>{wonder.wonderName}</td>
                <td>{wonder.level}</td>
                <td>{formatDate(wonder.levelDetectedAt || wonder.capturedAt)}</td>
                <td>{formatDuration(wonder.durationSeconds)}</td>
                <td>{formatDuration(wonder.officialDurationSeconds)}</td>
                <td>{formatDuration(wonder.acceleratedSeconds)}</td>
                <td>{formatNumber(wonder.accelerationsUsed)}</td>
                <td>{wonder.sea}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
