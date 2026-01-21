"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLoginClient({ nextPath = "/dashboard" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }

      router.replace(nextPath);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Acceso usuarios</h1>
      <p>
        <small>Introduce la clave de usuario.</small>
      </p>

      <form onSubmit={onSubmit} className="row">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave de acceso" />
        <button disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>

      {error ? (
        <p>
          <small style={{ color: "#ffb4b4" }}>{error}</small>
        </p>
      ) : null}
    </div>
  );
}
