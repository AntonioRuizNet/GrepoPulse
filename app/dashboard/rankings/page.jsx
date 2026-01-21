import { getDailyRankings } from "@/lib/rankings";
import styles from "./page.module.css";

function Table({ title, rows }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th className={styles.alignRight}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={String(r.id)}>
              <td>{idx + 1}</td>
              <td>{r.name}</td>
              <td className={styles.alignRight}>{r.delta.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function RankingsPage() {
  const worldId = "es141";
  const data = await getDailyRankings(worldId);

  return (
    <div>
      <div className={styles.header}>
        <h1>Rankings</h1>
        <small>
          Ventana: {data.window.firstAt.toLocaleString()} → {data.window.latestAt.toLocaleString()}
        </small>
      </div>

      <div className={styles.grid}>
        <Table title="Top 10 jugadores atacantes del día" rows={data.topPlayersAttack} />
        <Table title="Top 10 jugadores defensores del día" rows={data.topPlayersDef} />
        <Table title="Top 10 alianzas atacantes del día" rows={data.topAlliancesAttack} />
        <Table title="Top 10 alianzas defensores del día" rows={data.topAlliancesDef} />
        <Table title="Top 10 jugadores casiteros del día" rows={data.topBuilders} />
      </div>
    </div>
  );
}
