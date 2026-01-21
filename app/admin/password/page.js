"use client";

import { useState } from "react";
import Link from "next/link";

export default function ChangePassword() {
  // ADMIN
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // USERS
  const [userPassword, setUserPassword] = useState("");
  const [userPassword2, setUserPassword2] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [msgUser, setMsgUser] = useState("");
  const [errUser, setErrUser] = useState("");

  async function onSubmitAdmin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar");
      setMsg("Contraseña ADMIN actualizada.");
      setOldPassword("");
      setNewPassword("");
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitUsers(e) {
    e.preventDefault();
    setLoadingUser(true);
    setMsgUser("");
    setErrUser("");

    try {
      if ((userPassword || "").length < 8) {
        throw new Error("La contraseña de usuarios debe tener al menos 8 caracteres.");
      }
      if (userPassword !== userPassword2) {
        throw new Error("Las contraseñas de usuarios no coinciden.");
      }

      const res = await fetch("/api/admin/password/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: userPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar");

      setMsgUser("Contraseña de USUARIOS actualizada.");
      setUserPassword("");
      setUserPassword2("");
    } catch (e) {
      setErrUser(e.message || String(e));
    } finally {
      setLoadingUser(false);
    }
  }

  return (
    <div className="card">
      <h1>Seguridad</h1>
      <p>
        <small>Mínimo 8 caracteres.</small>
      </p>

      <h2 style={{ marginTop: 18 }}>Cambiar contraseña ADMIN</h2>
      <form onSubmit={onSubmitAdmin} className="row">
        <input
          type="password"
          placeholder="Contraseña actual"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button disabled={loading}>{loading ? "Guardando…" : "Guardar"}</button>
      </form>

      {msg ? (
        <p>
          <small>{msg}</small>
        </p>
      ) : null}
      {err ? (
        <p>
          <small style={{ color: "#ffb4b4" }}>{err}</small>
        </p>
      ) : null}

      <hr style={{ margin: "18px 0" }} />

      <h2>Cambiar contraseña USUARIOS</h2>
      <form onSubmit={onSubmitUsers} className="row">
        <input
          type="password"
          placeholder="Nueva contraseña usuarios"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Repetir contraseña usuarios"
          value={userPassword2}
          onChange={(e) => setUserPassword2(e.target.value)}
        />
        <button disabled={loadingUser}>{loadingUser ? "Guardando…" : "Guardar"}</button>
      </form>

      {msgUser ? (
        <p>
          <small>{msgUser}</small>
        </p>
      ) : null}
      {errUser ? (
        <p>
          <small style={{ color: "#ffb4b4" }}>{errUser}</small>
        </p>
      ) : null}

      <hr />
      <Link href="/admin">← Volver</Link>
    </div>
  );
}
