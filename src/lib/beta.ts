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

/**
 * Los correos que valen como cuenta de Google. Daily Challenge entra por
 * «Entrar con Google», así que sin una cuenta así no hay forma de saber
 * quién jugó. Se aceptan los dos dominios de Google; una cuenta de Workspace
 * (correo de empresa con Google detrás) también serviría, pero no se puede
 * distinguir de un correo cualquiera mirando el dominio, así que esos casos
 * se resuelven a mano.
 */
export const DOMINIOS_GOOGLE = ["gmail.com", "googlemail.com"];

export function esCorreoGoogle(email: string): boolean {
  const dominio = email.trim().toLowerCase().split("@")[1] ?? "";
  return DOMINIOS_GOOGLE.includes(dominio);
}

export const esquemaRegistro = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  plataforma: z.enum(PLATAFORMAS),
  apps: z.array(z.enum(APPS_BETA)).min(1).max(APPS_BETA.length),
  comentario: z.string().trim().max(500).optional().default(""),
  /**
   * El correo de Google con el que entra a Play y a las apps, si es otro que
   * el de contacto: es la clave del cruce diario de actividad (ver migración
   * ayotl_programa). Vacío = el mismo de arriba.
   */
  email_google: z.string().trim().toLowerCase().email().max(254).or(z.literal("")).optional().default(""),
  /** WhatsApp: para Mercadito (que entra por teléfono) y para pagar por CoDi. */
  telefono: z.string().trim().regex(/^\+?[0-9 ]{10,15}$/).or(z.literal("")).optional().default(""),
  idioma: z.enum(["es", "en"]).default("es"),
  /**
   * Honeypot: un campo oculto que las personas no ven y los bots rellenan.
   * Se acepta cualquier cosa aquí a propósito: rechazarlo en la validación
   * daría un 400 y la gracia es contestar 200 sin guardar nada.
   */
  sitioweb: z.string().max(500).optional().default(""),
  /** Token de Turnstile; vacío si el widget no está configurado. */
  turnstile: z.string().max(4096).optional().default(""),
}).superRefine((datos, ctx) => {
  // Mercadito se cruza por teléfono (vive en otra base y se entra con
  // teléfono y PIN): sin él, sus días no se pueden contar.
  if (datos.apps.includes("mercadito") && !datos.telefono) {
    ctx.addIssue({ code: "custom", path: ["telefono"], message: "telefono_mercadito" });
  }
  // Daily Challenge se identifica con «Entrar con Google».
  if (datos.apps.includes("dailychallenge") && !esCorreoGoogle(datos.email_google || datos.email)) {
    ctx.addIssue({ code: "custom", path: ["email_google"], message: "google_dailychallenge" });
  }
});

export type Registro = z.infer<typeof esquemaRegistro>;

/** Códigos que devuelve /api/beta; el formulario los traduce. */
export type ErrorBeta = "datos" | "muchos" | "robot" | "no_disponible" | "lleno" | "generico"
  | "telefono_mercadito" | "google_dailychallenge";
