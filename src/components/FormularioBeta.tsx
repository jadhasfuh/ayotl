"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { APPS } from "@/lib/apps";
import { APPS_BETA, PLATAFORMAS, type ErrorBeta } from "@/lib/beta";
import { t, type Idioma } from "@/lib/idioma";
import { Tortuga } from "./Tortuga";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opciones: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
    ayotlTurnstileListo?: () => void;
  }
}

type Estado = { fase: "editando" | "enviando" | "listo" } | { fase: "error"; codigo: ErrorBeta };

/**
 * El formulario del programa Beta. Manda JSON a /api/beta; nunca habla con
 * Supabase directamente (la tabla no tiene políticas para anon).
 *
 * `turnstileSitio` llega como prop desde la página (leída en el servidor):
 * si es null, el widget no se pinta y el servidor tampoco lo exige.
 */
export function FormularioBeta({ idioma, turnstileSitio }: { idioma: Idioma; turnstileSitio: string | null }) {
  const x = t(idioma);
  const [estado, setEstado] = useState<Estado>({ fase: "editando" });
  const [token, setToken] = useState("");
  const [errorApps, setErrorApps] = useState(false);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Turnstile se pinta explícitamente: si el script ya estaba cargado (se
  // navegó aquí desde otra página), el modo implícito no volvería a
  // escanear el DOM y el widget no aparecería.
  useEffect(() => {
    if (!turnstileSitio || !widget.current) return;
    const pintar = () => {
      if (!widget.current || widgetId.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: turnstileSitio,
        language: idioma,
        theme: "auto",
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
    const form = ev.currentTarget;
    const datos = new FormData(form);
    const apps = datos.getAll("apps").map(String);
    if (apps.length === 0) { setErrorApps(true); return; }
    setErrorApps(false);
    setEstado({ fase: "enviando" });
    try {
      const res = await fetch("/api/beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          email: datos.get("email"),
          plataforma: datos.get("plataforma"),
          apps,
          comentario: datos.get("comentario") || "",
          email_google: datos.get("email_google") || "",
          telefono: datos.get("telefono") || "",
          idioma,
          sitioweb: datos.get("sitioweb") || "",
          turnstile: token,
        }),
      });
      if (res.ok) { setEstado({ fase: "listo" }); return; }
      const cuerpo = (await res.json().catch(() => ({}))) as { error?: ErrorBeta };
      setEstado({ fase: "error", codigo: cuerpo.error ?? "generico" });
    } catch {
      setEstado({ fase: "error", codigo: "generico" });
    }
    // El token de Turnstile es de un solo uso: para reintentar hace falta otro.
    if (widgetId.current) { window.turnstile?.reset(widgetId.current); setToken(""); }
  }

  if (estado.fase === "listo") {
    return (
      <div className="formulario gracias" role="status">
        <Tortuga grosor={2} />
        <h2>{x("graciasTitulo")}</h2>
        <p>{x("graciasTexto")}</p>
      </div>
    );
  }

  const MENSAJES: Record<ErrorBeta, string> = {
    datos: x("errorDatos"), muchos: x("errorMuchos"), robot: x("errorRobot"),
    no_disponible: x("errorNoDisponible"), generico: x("errorGenerico"),
  };
  const PLATAFORMA_TEXTO = { ios: x("plataformaIos"), android: x("plataformaAndroid"), web: x("plataformaWeb") };
  const enviando = estado.fase === "enviando";

  return (
    <form className="formulario" onSubmit={enviar} noValidate={false}>
      {turnstileSitio && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ayotlTurnstileListo&render=explicit"
          strategy="afterInteractive"
        />
      )}
      <div className="campo">
        <label htmlFor="nombre">{x("campoNombre")}</label>
        <input id="nombre" name="nombre" type="text" required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <div className="campo">
        <label htmlFor="email">{x("campoEmail")}</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" />
      </div>
      <div className="campo">
        <label htmlFor="email_google">{x("campoEmailGoogle")}</label>
        <input id="email_google" name="email_google" type="email" maxLength={254} autoComplete="off" inputMode="email" />
        <span className="ayuda">{x("campoEmailGoogleAyuda")}</span>
      </div>
      <div className="campo">
        <label htmlFor="telefono">{x("campoTelefono")}</label>
        <input id="telefono" name="telefono" type="tel" pattern="\+?[0-9 ]{10,15}" maxLength={15} autoComplete="tel" inputMode="tel" />
        <span className="ayuda">{x("campoTelefonoAyuda")}</span>
      </div>
      <fieldset className="campo">
        <legend>{x("campoPlataforma")}</legend>
        <div className="opciones">
          {PLATAFORMAS.map((p, i) => (
            <label key={p} className="opcion">
              <input type="radio" name="plataforma" value={p} required defaultChecked={i === 0} />
              {PLATAFORMA_TEXTO[p]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="campo" aria-describedby={errorApps ? "error-apps" : undefined}>
        <legend>{x("campoApps")}</legend>
        <div className="opciones">
          {APPS_BETA.map((id) => (
            <label key={id} className="opcion">
              <input type="checkbox" name="apps" value={id} onChange={() => setErrorApps(false)} />
              {APPS.find((a) => a.id === id)?.nombre ?? id}
            </label>
          ))}
        </div>
        {errorApps && <p id="error-apps" className="aviso error" role="alert">{x("elegirUnaApp")}</p>}
      </fieldset>
      <div className="campo">
        <label htmlFor="comentario">{x("campoComentario")}</label>
        <textarea id="comentario" name="comentario" maxLength={500} />
        <span className="ayuda">{x("campoComentarioAyuda")}</span>
      </div>
      {/* Trampa para bots: una persona no lo ve ni lo rellena. */}
      <div className="trampa" aria-hidden="true">
        <label htmlFor="sitioweb">Website</label>
        <input id="sitioweb" name="sitioweb" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {turnstileSitio && <div ref={widget} className="turnstile" />}
      {estado.fase === "error" && (
        <p className="aviso error" role="alert">{MENSAJES[estado.codigo]}</p>
      )}
      <button type="submit" className="boton acento" disabled={enviando || (!!turnstileSitio && !token)}>
        {enviando ? x("enviando") : x("enviar")}
      </button>
      <p className="privacidad">{x("privacidad")}</p>
    </form>
  );
}
