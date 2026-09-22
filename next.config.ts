import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad. La CSP lleva 'unsafe-inline' en scripts porque Next
 * hidrata con scripts inline (y el de tema también lo es); lo que sí cierra
 * es de dónde pueden venir scripts externos: sólo Turnstile.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",   // necesario para el Dockerfile multi-stage de Railway
  reactStrictMode: true,
  experimental: {
    // El layout raíz está en `[idioma]`, así que un 404 no tiene layout en el
    // que apoyarse: `not-found.tsx` salía como cascarón vacío hidratado en el
    // cliente (curl y los buscadores veían el 404 genérico de Next). Con esto,
    // lo que no coincide con ninguna ruta va a `app/global-not-found.tsx`.
    globalNotFound: true,
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: CSP },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }];
  },
  async rewrites() {
    // Los navegadores piden /favicon.ico por su cuenta aunque el HTML
    // declare otro icono; que no sea un 404 en el log.
    return [{ source: "/favicon.ico", destination: "/icono/32" }];
  },
};

export default nextConfig;
