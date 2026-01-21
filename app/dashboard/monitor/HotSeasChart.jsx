"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./HotSeasChart.module.css";

const BAR_COLOR = "#8EC5FF"; // azul suave
const GRID_COLOR = "rgba(255,255,255,0.08)";

export default function HotSeasChart({ rows }) {
  const data = (rows || []).map((r) => ({
    sea: `Mar ${r.sea}`,
    conquers: r.conquers,
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="sea" tick={{ fontSize: 18, fill: "#fff" }} />
          <YAxis tick={{ fontSize: 15, fill: "#fff" }} />
          <Tooltip />
          <Bar dataKey="conquers" fill={BAR_COLOR} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
