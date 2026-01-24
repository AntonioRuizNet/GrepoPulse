"use client";

import StatCard from "./StatCard";
import HotSeasChart from "./HotSeasChart";
import LossPlayersChart from "./LossPlayersChart";
import AggressivenessChart from "./AggressivenessChart";
import Card from "../components/Card";
import DataTable from "../components/DataTable";
import styles from "./MonitorClient.module.css";

function GhostTownsTable({ rows }) {
  return (
    <DataTable
      head={["Nombre", "X", "Y", "Mar", "Puntos"]}
      rightAlign={["Mar", "Puntos"]}
      rows={rows}
      renderRow={(r) => (
        <tr key={String(r.townId)}>
          <td>{r.name}</td>
          <td>{r.islandX}</td>
          <td>{r.islandY}</td>
          <td className={styles.alignRight}>{r.sea ?? "-"}</td>
          <td className={styles.alignRight}>{r.points}</td>
        </tr>
      )}
    />
  );
}

function SeaConquersGrid({ seas }) {
  return (
    <div className={styles.seaGrid}>
      {seas.map((s) => (
        <Card key={String(s.sea)} title={`Mar ${s.sea}`}>
          <DataTable
            head={["Ciudad", "X", "Y", "Puntos", "De", "A"]}
            rightAlign={["Puntos"]}
            rows={s.rows}
            renderRow={(r) => (
              <tr key={`${r.townId}-${r.time}`}>
                <td>{r.townName}</td>
                <td>{r.islandX ?? "-"}</td>
                <td>{r.islandY ?? "-"}</td>
                <td className={styles.alignRight}>{r.townPoints}</td>
                <td>{r.oldPlayer}</td>
                <td>{r.newPlayer}</td>
              </tr>
            )}
          />
        </Card>
      ))}
    </div>
  );
}

export default function MonitorClient({ data }) {
  const { kpis, hotSeasRows, ghostTownsRows, conquersBySea } = data;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Monitor</h1>
        <div className={styles.sub}>Señales del día (actualización automática)</div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <StatCard title="Conquistas hoy" value={kpis.conquersToday} />
        <StatCard title="Mar más caliente" value={kpis.hottestSea ?? "-"} />
        <StatCard title="Conquistas en ese mar" value={kpis.hottestSeaConquers} />
      </div>

      {/* Pie + tabla en row */}
      <div className={styles.row2}>
        <Card title="Mares calientes (Top 10)">
          <HotSeasChart rows={hotSeasRows} />
        </Card>

        <Card title="Ciudades fantasma">
          <GhostTownsTable rows={ghostTownsRows} />
        </Card>
      </div>

      {/* Charts verticales */}
      <div className={styles.grid}>
        <Card title="Jugadores con mayor pérdida hoy">
          <LossPlayersChart rows={data.topLossPlayers} />
        </Card>
        <Card title="Índice de agresividad (Top 10)">
          <AggressivenessChart rows={data.topAggressive} />
        </Card>
      </div>

      {/* Conquistas por mares */}
      <div className={styles.sectionTitle}>Conquistas del día por mares (últimas 10)</div>
      <SeaConquersGrid seas={conquersBySea} />
    </div>
  );
}
