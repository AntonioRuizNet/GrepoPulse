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
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#fff" }}
            axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.18)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12, fill: "#fff" }}
            axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.18)" }}
          />
          <Tooltip />
          <Bar dataKey="ratio" fill={BAR_COLOR} radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        <br />
      </div>
    </div>
  );
}
