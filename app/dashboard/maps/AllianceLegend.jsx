import styles from "./AllianceLegend.module.css";

export default function AllianceLegend({ rows }) {
  if (!rows?.length) return <div className={styles.empty}>Sin datos</div>;

  return (
    <div className={styles.list}>
      {rows.map((r) => (
        <div key={String(r.id)} className={styles.row}>
          <span className={styles.dot} style={{ background: r.color }} />
          <div className={styles.name}>{r.name}</div>
          <div className={styles.count}>{r.count}</div>
        </div>
      ))}
    </div>
  );
}
