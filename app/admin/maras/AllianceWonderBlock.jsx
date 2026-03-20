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

export default function AllianceWonderBlock({ alliance }) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{alliance.name}</h2>
        <div style={{ marginTop: 6, color: "#6b7280", fontSize: 14 }}>
          Rank: {alliance.rank ?? "-"} · Puntos: {alliance.points ?? "-"} · Mundo: {alliance.world}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Maravilla</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Nivel actual</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Último snapshot</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Nivel detectado en</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Tiempo hasta este nivel</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Mar</th>
            </tr>
          </thead>
          <tbody>
            {alliance.wonders.map((wonder) => (
              <tr key={`${alliance.name}-${wonder.wonderType}`}>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{wonder.wonderName}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{wonder.level}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{formatDate(wonder.capturedAt)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{formatDate(wonder.levelDetectedAt)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{formatDuration(wonder.durationSeconds)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{wonder.sea}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
