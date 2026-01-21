"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DashboardLoginClient.module.css";

export default function DashboardLoginClient({ nextPath = "/dashboard" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return;
      router.replace(nextPath);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
        />
        <button className={styles.button} disabled={loading || !password}>
          {loading ? "…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
