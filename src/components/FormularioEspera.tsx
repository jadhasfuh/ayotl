"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { t, type Idioma } from "@/lib/idioma";
import { Tortuga } from "./Tortuga";

/**
 * Cuando las 14 plazas están ocupadas, en vez de un cartel de «vuelve otro
 * día» se pide lo mínimo —nombre y correo— para avisar cuando se abra un
 * lugar o empiece otra ronda. Perder esos correos sería tirar a la basura a
 * quien ya estaba interesado.
 *
 * Comparte las defensas del alta normal: honeypot y Turnstile.
 */
export function FormularioEspera({ idioma, turnstileSitio }: { idioma: Idioma; turnstileSitio: string | null }) {
  const x = t(idioma);
  const [estado, setEstado] = useState<"editando" | "enviando" | "listo" | "error">("editando");
  const [token, setToken] = useState("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSitio || !widget.current) return;
    const pintar = () => {
      if (!widget.current || widgetId.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: turnstileSitio, language: idioma, theme: "auto",
        callback: (tk: string) => setToken(tk),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) pintar();
    else window.ayotlTurnstileListo = pintar;
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [turnstileSitio, idioma]);

  async function enviar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const datos = new FormData(ev.currentTarget);
    setEstado("enviando");
    try {
      const res = await fetch("/api/beta/espera", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"), email: datos.get("email"),
          comentario: datos.get("comentario") || "", idioma,
          sitioweb: datos.get("sitioweb") || "", turnstile: token,
        }),
      });
      setEstado(res.ok ? "listo" : "error");
    } catch {
      setEstado("error");
    }
    if (widgetId.current) { window.turnstile?.reset(widgetId.current); setToken(""); }
  }

  if (estado === "listo") {
    return (
      <div className="formulario gracias" role="status">
        <Tortuga lado={96} />
        <h2>{x("esperaGraciasTitulo")}</h2>
        <p>{x("esperaGraciasTexto")}</p>
      </div>
    );
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      {turnstileSitio && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ayotlTurnstileListo&render=explicit"
          strategy="afterInteractive"
        />
      )}
      <div>
        <h2 style={{ marginBottom: "0.35em" }}>{x("esperaTitulo")}</h2>
        <p style={{ margin: 0, color: "var(--tinta-2)" }}>{x("esperaTexto")}</p>
      </div>
      <div className="campo">
        <label htmlFor="espera-nombre">{x("campoNombre")}</label>
        <input id="espera-nombre" name="nombre" type="text" required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <div className="campo">
        <label htmlFor="espera-email">{x("campoEmail")}</label>
        <input id="espera-email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" />
      </div>
      <div className="campo">
        <label htmlFor="espera-comentario">{x("esperaComentario")}</label>
        <input id="espera-comentario" name="comentario" type="text" maxLength={500} />
      </div>
      <div className="trampa" aria-hidden="true">
        <label htmlFor="espera-sitioweb">Website</label>
        <input id="espera-sitioweb" name="sitioweb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {turnstileSitio && <div ref={widget} className="turnstile" />}
      {estado === "error" && <p className="aviso error" role="alert">{x("errorGenerico")}</p>}
      <button type="submit" className="boton acento" disabled={estado === "enviando" || (!!turnstileSitio && !token)}>
        {estado === "enviando" ? x("enviando") : x("esperaEnviar")}
      </button>
      <p className="privacidad">{x("privacidad")}</p>
    </form>
  );
}
