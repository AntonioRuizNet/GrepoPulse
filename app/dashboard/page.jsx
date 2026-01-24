import Link from "next/link";
import styles from "./page.module.css";

export default function DashboardHome() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1 className={styles.title}>GrepoPulse</h1>
        <p className={styles.subtitle}>Panel público de datos del mundo</p>
      </div>

      <div className={styles.grid}>
        <Link href="/dashboard/monitor" className={styles.card}>
          <div className={styles.cardTitle}>Monitor</div>
          <div className={styles.cardText}>Señales del día: conquistas, mares calientes y alertas.</div>
        </Link>
        <Link href="/dashboard/rankings" className={styles.card}>
          <div className={styles.cardTitle}>Rankings</div>
          <div className={styles.cardText}>Top diarios por ataque y defensa (jugadores y alianzas).</div>
        </Link>
        <Link href="/dashboard/maps" className={styles.card}>
          <div className={styles.cardTitle}>Mapas</div>
          <div className={styles.cardText}>Evolución territorial de las alianzas (últimos 7 días).</div>
        </Link>
        <Link href="/admin" className={styles.cardAlt}>
          <div className={styles.cardTitle}>Admin</div>
          <div className={styles.cardText}>Acceso privado: sincronización y contraseñas.</div>
        </Link>
      </div>
    </div>
  );
}
