"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient({ nextPath = "/admin" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
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
      <h1>Acceso admin</h1>
      <p>
        <small>Introduce la contraseña. </small>
      </p>

      <form onSubmit={onSubmit} className="row">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
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
