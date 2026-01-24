"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import styles from "./HotSeasChart.module.css";

const COLORS = [
  "rgba(120,185,255,0.95)",
  "rgba(167,111,255,0.95)",
  "rgba(183,245,216,0.95)",
  "rgba(255,179,193,0.95)",
  "rgba(255,220,160,0.95)",
  "rgba(170,220,255,0.95)",
  "rgba(210,170,255,0.95)",
  "rgba(160,255,220,0.95)",
  "rgba(255,190,220,0.95)",
  "rgba(255,240,180,0.95)",
];

export default function HotSeasChart({ rows }) {
  const data = (rows || []).map((r) => ({
    name: `Mar ${r.sea}`,
    value: Number(r.conquers),
  }));

  return (
    <div className={styles.chartWrap}>
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={130} outerRadius={200} paddingAngle={2}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
