import { getMonitorData } from "@/lib/monitor";
import MonitorClient from "./MonitorClient";
import styles from "./page.module.css";

export default async function MonitorPage() {
  const worldId = "es141";
  const data = await getMonitorData(worldId, 10);

  return (
    <div>
      <div className={styles.header}>
        <h1>Monitor</h1>
        <small>
          Hoy: {new Date(data.window.firstAt).toLocaleString()} → {new Date(data.window.latestAt).toLocaleString()}
        </small>
      </div>

      <MonitorClient data={data} />
    </div>
  );
}
