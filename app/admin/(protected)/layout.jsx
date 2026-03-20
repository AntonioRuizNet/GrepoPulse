import AdminSidebar from "../AdminSidebar";
import styles from "../layout.module.css";

export default function ProtectedAdminLayout({ children }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
