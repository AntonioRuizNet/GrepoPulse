'use client';

import { useEffect, useMemo, useState } from 'react';

export default function AdminHome() {
  const [worldId, setWorldId] = useState('es141');
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const formatted = useMemo(() => snapshots.map((s) => ({ ...s, fetchedAt: new Date(s.fetchedAt).toLocaleString() })), [snapshots]);

  async function loadSnapshots() {
    setErr('');
    const res = await fetch(`/api/admin/snapshots?world=${encodeURIComponent(worldId)}`);
    const data = await res.json();
    setSnapshots(data.snapshots || []);
  }

  useEffect(() => {
    loadSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId]);

  async function runSync() {
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Sync failed');
      setMsg(`OK. Snapshot ${data.snapshotId}. Duración ${data.durationMs}ms`);
      await loadSnapshots();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Panel de administración</h1>
      <p><small>Ingesta + históricos por snapshot. Usa el cron en el VPS para automatizar.</small></p>

      <div className="row">
        <input value={worldId} onChange={(e) => setWorldId(e.target.value)} placeholder="worldId (ej. es141)" />
        <button onClick={runSync} disabled={loading}>{loading ? 'Sincronizando…' : 'Sync manual'}</button>
        <button className="secondary" onClick={loadSnapshots}>Refrescar</button>
      </div>

      {msg ? <p><small>{msg}</small></p> : null}
      {err ? <p><small style={{ color: '#ffb4b4' }}>{err}</small></p> : null}

      <hr />

      <h2>Últimos snapshots</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Fecha</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Duración (ms)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Notas</th>
            </tr>
          </thead>
          <tbody>
            {formatted.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.12)' }}>{s.fetchedAt}</td>
                <td style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.12)' }}>{s.status}</td>
                <td style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.12)' }}>{s.durationMs ?? ''}</td>
                <td style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,0.12)' }}><small>{s.notes ?? ''}</small></td>
              </tr>
            ))}
            {formatted.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 8 }}><small>Sin datos todavía.</small></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <hr />

      <h2>Seguridad</h2>
      <p><a href="/admin/password">Cambiar contraseña</a></p>
    </div>
  );
}
