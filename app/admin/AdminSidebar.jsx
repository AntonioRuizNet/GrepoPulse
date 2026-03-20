"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.css";

const ITEMS = [
  { href: "/admin/snapshots-api", label: "Snapshots API" },
  { href: "/admin/snapshots-maras", label: "Snapshots Maras" },
  { href: "/admin/inteligencia-maras", label: "Inteligencia Maras" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <img src="/android-chrome-512x512.png" alt="GrepoPulse" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`${styles.link} ${active ? styles.active : ""}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
