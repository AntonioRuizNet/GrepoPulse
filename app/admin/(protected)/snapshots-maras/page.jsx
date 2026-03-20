"use client";

import { useEffect, useState } from "react";

export default function SnapshotsMarasPage() {
  const [events, setEvents] = useState([]);
  const [world, setWorld] = useState("es141");

  useEffect(() => {
    load();
  }, [world]);

  async function load() {
    const res = await fetch(`/api/admin/wonder-events?world=${world}`);
    const data = await res.json();
    setEvents(data.events || []);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Snapshots Maras</h1>

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Alianza</th>
            <th>Maravilla</th>
            <th>Nivel</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>{new Date(e.detectedAt).toLocaleString()}</td>
              <td>{e.allianceName}</td>
              <td>{e.wonderType}</td>
              <td>{e.level}</td>
              <td>{e.durationSeconds}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
