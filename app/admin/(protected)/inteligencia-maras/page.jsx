"use client";

import { useEffect, useState } from "react";
import AllianceWonderBlock from "../../maras/AllianceWonderBlock";
import styles from "./page.module.css";

export default function InteligenciaMarasPage() {
  const [alliances, setAlliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`/api/admin/wonder-intelligence?world=es141`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudieron cargar los datos");
      }

      setAlliances(data.alliances || []);
    } catch (error) {
      setErr(error?.message || "Error cargando inteligencia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inteligencia Maras</h1>
        <p className={styles.subtitle}>Vista analítica de progreso, aceleraciones e histórico por alianza.</p>
      </div>

      {loading ? <p className={styles.state}>Cargando...</p> : null}
      {err ? <p className={styles.error}>{err}</p> : null}

      {!loading && !err ? (
        <div className={styles.grid}>
          {alliances.map((alliance) => (
            <AllianceWonderBlock key={`${alliance.world}-${alliance.name}`} alliance={alliance} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
