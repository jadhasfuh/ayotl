import { z } from "zod";

/**
 * El contrato del formulario Beta, compartido entre el navegador (para los
 * tipos) y /api/beta (para validar). Los valores permitidos se repiten en la
 * migración como `check`: la base es la última línea de defensa.
 */
export const PLATAFORMAS = ["ios", "android", "web"] as const;
export type Plataforma = (typeof PLATAFORMAS)[number];

export const APPS_BETA = ["mercadito", "jlptest", "dailychallenge"] as const;
export type AppBeta = (typeof APPS_BETA)[number];

export const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  plataforma: z.enum(PLATAFORMAS),
  apps: z.array(z.enum(APPS_BETA)).min(1).max(APPS_BETA.length),
  comentario: z.string().trim().max(500).optional().default(""),
  idioma: z.enum(["es", "en"]).default("es"),
  /**
   * Honeypot: un campo oculto que las personas no ven y los bots rellenan.
   * Se acepta cualquier cosa aquí a propósito: rechazarlo en la validación
   * daría un 400 y la gracia es contestar 200 sin guardar nada.
   */
  sitioweb: z.string().max(500).optional().default(""),
  /** Token de Turnstile; vacío si el widget no está configurado. */
  turnstile: z.string().max(4096).optional().default(""),
});

export type Registro = z.infer<typeof esquemaRegistro>;

/** Códigos que devuelve /api/beta; el formulario los traduce. */
export type ErrorBeta = "datos" | "muchos" | "robot" | "no_disponible" | "generico";
