"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./VerticalBarChart.module.css";

const GRID_COLOR = "rgba(255,255,255,0.08)";
const DEFAULT_BAR = "rgba(120,185,255,0.95)";

export default function VerticalBarChart({ rows, valueKey, color = DEFAULT_BAR, height = 320, valueFormatter }) {
  const data = (rows || []).map((r) => ({
    name: r.name,
    value: Number(r[valueKey] ?? 0),
  }));

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={height}>
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
            width={140}
            tick={{ fontSize: 12, fill: "#fff" }}
            axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.18)" }}
          />
          <Tooltip formatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />
          <Bar dataKey="value" fill={color} radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
