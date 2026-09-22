"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function EntrarAdmin({ configurado }: { configurado: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setEnviando(true); setError("");
    const contrasena = new FormData(ev.currentTarget).get("contrasena");
    const res = await fetch("/api/admin/entrar", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contrasena }),
    });
    setEnviando(false);
    if (res.ok) { router.refresh(); return; }
    setError(res.status === 401 ? "Contraseña incorrecta." : "El panel no está configurado (falta ADMIN_SECRETO).");
  }

  if (!configurado) return <p className="aviso error">El panel no está configurado: falta <code>ADMIN_SECRETO</code> en Railway.</p>;
  return (
    <form className="formulario" onSubmit={entrar}>
      <div className="campo">
        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" required autoComplete="current-password" autoFocus />
      </div>
      {error && <p className="aviso error" role="alert">{error}</p>}
      <button type="submit" className="boton acento" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
