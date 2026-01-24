import { getMapData } from "@/lib/maps";
import MapClient from "./MapClient";
import styles from "./page.module.css";

export default async function MapsPage() {
  const worldId = "es141";
  const data = await getMapData(worldId, 7);
  return (
    <div className={styles.page}>
      <MapClient data={data} />
    </div>
  );
}
