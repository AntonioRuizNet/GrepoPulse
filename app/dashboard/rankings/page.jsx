import { getDailyRankings } from "@/lib/rankings";
import RankingsClient from "./RankingsClient";
import styles from "./page.module.css";

export default async function RankingsPage() {
  const worldId = "es141";
  const data = await getDailyRankings(worldId);
  return (
    <div className={styles.page}>
      <RankingsClient data={data} />
    </div>
  );
}
