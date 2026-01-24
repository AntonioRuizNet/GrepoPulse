"use client";

import Card from "../components/Card";
import VerticalBarChart from "../components/VerticalBarChart";
import styles from "./RankingsClient.module.css";

export default function RankingsClient({ data }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Rankings</h1>
        <div className={styles.sub}>
          Ventana: {data.window.prevAt ? new Date(data.window.prevAt).toLocaleString() : "snapshot anterior"} →{" "}
          {new Date(data.window.latestAt).toLocaleString()}
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Top 10 jugadores atacantes del día">
          <VerticalBarChart rows={data.topPlayersAttack} valueKey="delta" color="rgba(183,245,216,0.95)" />
        </Card>
        <Card title="Top 10 jugadores defensores del día">
          <VerticalBarChart rows={data.topPlayersDef} valueKey="delta" color="rgba(120,185,255,0.95)" />
        </Card>
        <Card title="Top 10 alianzas atacantes del día">
          <VerticalBarChart rows={data.topAlliancesAttack} valueKey="delta" color="rgba(255,220,160,0.95)" />
        </Card>
        <Card title="Top 10 alianzas defensores del día">
          <VerticalBarChart rows={data.topAlliancesDef} valueKey="delta" color="rgba(255,179,193,0.95)" />
        </Card>
      </div>
    </div>
  );
}
