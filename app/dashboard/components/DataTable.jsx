import styles from "./DataTable.module.css";

export default function DataTable({ head, rows, renderRow, rightAlign = [] }) {
  const right = new Set(rightAlign);
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} className={right.has(h) ? styles.alignRight : ""}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows.map(renderRow)}</tbody>
    </table>
  );
}
