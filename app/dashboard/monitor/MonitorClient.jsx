"use client";

import StatCard from "./StatCard";
import HotSeasChart from "./HotSeasChart";
import LossPlayersChart from "./LossPlayersChart";
import AggressivenessChart from "./AggressivenessChart";
import styles from "./MonitorClient.module.css";

function Card({ title, children, full = false }) {
  return (
    <div className={`${styles.card} ${full ? styles.full : ""}`}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </div>
  );
}

function SimpleTable({ head, rows, renderRow }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} className={["Mar", "Puntos", "Ratio", "Att Δ", "Def Δ"].includes(h) ? styles.alignRight : ""}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows.map(renderRow)}</tbody>
    </table>
  );
}

export default function MonitorClient({ data }) {
  const { kpis, hotSeasRows } = data;

  return (
    <div className={styles.wrap}>
      {/* KPIs */}
      <div className={styles.kpis}>
        <StatCard title="Conquistas hoy" value={kpis.conquersToday} />
        <StatCard title="Mar más caliente" value={kpis.hottestSea ?? "-"} />
        <StatCard title="Conquistas en ese mar" value={kpis.hottestSeaConquers} />
      </div>

      {/* Chart Mares calientes */}
      <Card title="Mares calientes (Top 10)">
        <HotSeasChart rows={hotSeasRows} />
      </Card>

      {/* GRID 2 por fila */}
      <div className={styles.grid}>
        {/* Jugadores con mayor pérdida: chart */}
        <Card title="Jugadores con mayor pérdida hoy">
          <LossPlayersChart rows={data.topLossPlayers} />
        </Card>

        {/* Índice de agresividad: chart */}
        <Card title="Índice de agresividad (Top 10)">
          <AggressivenessChart rows={data.topAggressive} />
        </Card>
      </div>

      {/* Conquistas FULL WIDTH */}
      <Card title="Conquistas del día (últimas)" full>
        <SimpleTable
          head={["Ciudad", "X", "Y", "Mar", "Puntos", "De", "A"]}
          rows={data.conquersRows}
          renderRow={(r) => (
            <tr key={`${r.townId}-${r.time}`}>
              <td>{r.townName}</td>
              <td>{r.islandX ?? "-"}</td>
              <td>{r.islandY ?? "-"}</td>
              <td className={styles.alignRight}>{r.sea ?? "-"}</td>
              <td className={styles.alignRight}>{r.townPoints}</td>
              <td>{r.oldPlayer}</td>
              <td>{r.newPlayer}</td>
            </tr>
          )}
        />
      </Card>

      {/* GRID 2 por fila */}
      <div className={styles.grid}>
        {/* Alianzas en expansión (tabla) */}
        <Card title="Alianzas en expansión hoy (puntos)">
          <SimpleTable
            head={["#", "Alianza", "Δ"]}
            rows={data.topAllianceGrowth}
            renderRow={(r, idx) => (
              <tr key={String(r.id)}>
                <td>{idx + 1}</td>
                <td>{r.name}</td>
                <td className={styles.alignRight}>{r.delta}</td>
              </tr>
            )}
          />
        </Card>

        <Card title="Ciudades fantasma">
          <SimpleTable
            head={["Nombre", "X", "Y", "Mar", "Puntos"]}
            rows={data.ghostTownsRows}
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
        </Card>
      </div>
    </div>
  );
}
