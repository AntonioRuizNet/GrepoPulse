"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./AggressivenessChart.module.css";

const BAR_COLOR = "#B7F5D8"; // verde suave
const GRID_COLOR = "rgba(255,255,255,0.08)";

export default function AggressivenessChart({ rows }) {
  const data = (rows || []).map((r) => ({
    name: r.name,
    ratio: Number(r.ratio),
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12, fill: "#fff" }}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
          />
          <YAxis tick={{ fontSize: 12, fill: "#fff" }} />
          <Tooltip />
          <Bar dataKey="ratio" fill={BAR_COLOR} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.legend}>(Att Δ / (Def Δ + 1))</div>
    </div>
  );
}
