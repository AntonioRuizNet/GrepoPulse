import AdminSidebar from "../AdminSidebar";
import styles from "../layout.module.css";

export default function ProtectedAdminLayout({ children }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <AdminSidebar />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
