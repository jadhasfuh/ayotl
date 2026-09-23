"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { t, type Idioma } from "@/lib/idioma";

/**
 * «Perdí mi enlace»: se pide el correo y se manda otra vez. Contesta lo
 * mismo exista o no, para que nadie averigüe quién es tester probando
 * correos.
 */
export function PedirEnlace({ idioma, turnstileSitio }: { idioma: Idioma; turnstileSitio: string | null }) {
  const x = t(idioma);
  const [estado, setEstado] = useState<"editando" | "enviando" | "listo">("editando");
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
    const email = new FormData(ev.currentTarget).get("email");
    setEstado("enviando");
    await fetch("/api/beta/enlace", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, idioma, turnstile: token }),
    }).catch(() => {});
    setEstado("listo");
  }

  if (estado === "listo") return <p className="aviso exito" role="status">{x("miPedido")}</p>;

  return (
    <form className="formulario" onSubmit={enviar}>
      {turnstileSitio && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ayotlTurnstileListo&render=explicit"
          strategy="afterInteractive"
        />
      )}
      <div className="campo">
        <label htmlFor="enlace-email">{x("campoEmail")}</label>
        <input id="enlace-email" name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" />
      </div>
      {turnstileSitio && <div ref={widget} className="turnstile" />}
      <button type="submit" className="boton acento" disabled={estado === "enviando" || (!!turnstileSitio && !token)}>
        {estado === "enviando" ? x("enviando") : x("miPedir")}
      </button>
    </form>
  );
}
