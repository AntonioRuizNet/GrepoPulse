import { getMonitorData } from "@/lib/monitor";
import MonitorClient from "./MonitorClient";
import styles from "./page.module.css";

export default async function MonitorPage() {
  const worldId = "es141";
  const data = await getMonitorData(worldId, 10);

  return (
    <div className={styles.page}>
      <MonitorClient data={data} />
    </div>
  );
}
