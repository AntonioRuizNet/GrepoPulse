"use client";

import { useEffect, useState } from "react";
import AllianceWonderBlock from "../../maras/AllianceWonderBlock";

export default function InteligenciaMarasPage() {
  const [alliances, setAlliances] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`/api/admin/wonder-intelligence?world=es141`);
    const data = await res.json();
    setAlliances(data.alliances || []);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Inteligencia Maras</h1>

      <div style={{ display: "grid", gap: 16 }}>
        {alliances.map((a) => (
          <AllianceWonderBlock key={a.name} alliance={a} />
        ))}
      </div>
    </div>
  );
}
