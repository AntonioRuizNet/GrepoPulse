import Link from "next/link";
import styles from "./DashboardSidebar.module.css";

export default function DashboardSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <img src="/android-chrome-512x512.png" alt="GrepoPulse" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        <Link href="/dashboard/monitor" className={styles.navLink}>
          Monitor
        </Link>
        <Link href="/dashboard/rankings" className={styles.navLink}>
          Rankings
        </Link>
        <Link href="/dashboard/maps" className={styles.navLink}>
          Mapas
        </Link>
      </nav>
    </aside>
  );
}
