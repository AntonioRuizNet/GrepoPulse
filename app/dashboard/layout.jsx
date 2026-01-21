import styles from "./layout.module.css";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.shell}>
      <DashboardSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
