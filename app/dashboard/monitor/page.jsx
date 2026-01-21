import { prisma } from "@/lib/prisma";
import { getSea } from "@/lib/sea";
import styles from "./page.module.css";

const WORLD_ID = "es141";
const LIMIT = 50;

function TableCiudadesFantasma({ rows }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Ciudades fantasma</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>X</th>
            <th>Y</th>
            <th className={styles.alignRight}>Puntos</th>
            <th className={styles.alignRight}>Mar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.townId}>
              <td>{r.name}</td>
              <td>{r.islandX}</td>
              <td>{r.islandY}</td>
              <td className={styles.alignRight}>{r.points}</td>
              <td className={styles.alignRight}>{r.sea}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MonitorPage() {
  const towns = await prisma.$queryRaw`
  SELECT
    "townId",
    "name",
    "islandX",
    "islandY",
    "points"
  FROM "Town"
  WHERE
    "worldId" = ${WORLD_ID}
    AND "playerId" = 0
  ORDER BY
    (FLOOR("islandX" / 100) * 10 + FLOOR("islandY" / 100)) ASC,
    "points" DESC
  LIMIT ${LIMIT};
`;

  const rows = towns.map((t) => ({
    ...t,
    sea: getSea(t.islandX, t.islandY),
  }));

  return (
    <div>
      <div className={styles.header}>
        <h1>Monitor</h1>
      </div>

      <div className={styles.grid}>
        <TableCiudadesFantasma rows={rows} />

        {/* Futuras tablas */}
        {/* <OtraTabla /> */}
      </div>
    </div>
  );
}
