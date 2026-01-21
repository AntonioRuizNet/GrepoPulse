"use client";

import { useState } from "react";

function Section({ title, description, endpoint }) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (password.length < 8) {
      setMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error");

      setPassword("");
      setPassword2("");
      setMsg("✅ Actualizada correctamente");
    } catch (err) {
      setMsg(`❌ ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginBottom: 6 }}>{title}</h2>
      <p style={{ marginTop: 0 }}>
        <small>{description}</small>
      </p>

      <form onSubmit={onSubmit} className="row" style={{ gap: 8 }}>
        <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button disabled={loading}>{loading ? "Guardando…" : "Guardar"}</button>
      </form>

      {msg ? (
        <p style={{ marginTop: 10 }}>
          <small>{msg}</small>
        </p>
      ) : null}
    </div>
  );
}

export default function PasswordClient() {
  return (
    <div>
      <Section title="Cambiar contraseña ADMIN" description="Afecta al acceso a /admin." endpoint="/api/admin/password/admin" />
      <Section
        title="Cambiar contraseña USUARIOS"
        description="Afecta al acceso a /dashboard."
        endpoint="/api/admin/password/user"
      />
    </div>
  );
}
