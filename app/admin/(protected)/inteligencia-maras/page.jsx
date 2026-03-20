"use client";

import { useEffect, useState } from "react";
import AllianceWonderBlock from "../../maras/AllianceWonderBlock";

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
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0, marginBottom: 16 }}>Inteligencia Maras</h1>

      {loading ? <p>Cargando...</p> : null}
      {err ? <p style={{ color: "#b91c1c" }}>{err}</p> : null}

      {!loading && !err ? (
        <div style={{ display: "grid", gap: 10 }}>
          {alliances.map((alliance) => (
            <AllianceWonderBlock key={`${alliance.world}-${alliance.name}`} alliance={alliance} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
