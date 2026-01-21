'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cambiar');
      setMsg('Contraseña actualizada.');
      setOldPassword('');
      setNewPassword('');
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Cambiar contraseña</h1>
      <p><small>Mínimo 8 caracteres.</small></p>

      <form onSubmit={onSubmit} className="row">
        <input type="password" placeholder="Contraseña actual" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
      </form>

      {msg ? <p><small>{msg}</small></p> : null}
      {err ? <p><small style={{ color: '#ffb4b4' }}>{err}</small></p> : null}

      <hr />
      <Link href="/admin">← Volver</Link>
    </div>
  );
}
