import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ayotl } from "./supabase-servidor";

/**
 * Los días de prueba de Mercadito.
 *
 * Mercadito vive en otra Supabase y no tiene cuentas de Google: se entra con
 * teléfono y PIN. El puente es el teléfono que el tester dejó en el
 * formulario.
 *
 * Se habla con su **API de Supabase** (URL + llave secreta) y no con Postgres
 * directo, por dos razones: la conexión directa de ese proyecto es sólo IPv6
 * y desde Railway no resuelve (da `timeout expired`), y la API evita tener
 * que copiar la contraseña de la base a un segundo sitio.
 *
 * Dos señales de que alguien usó la app ese día:
 *  - un pedido suyo (`pedidos.cliente_telefono`), que es actividad de verdad;
 *  - una sesión iniciada ese día. `sesiones` no guarda cuándo se creó, pero sí
 *    `expires_at`, y la sesión dura 30 días exactos: restando se obtiene el
 *    día del login. Es aproximado, así que el pedido manda cuando hay los dos.
 */
const DIAS_SESION = 30;

/** Sahuayo es UTC-6 todo el año: México dejó el horario de verano en 2022. */
const HUSO = "-06:00";

/** Normaliza a diez dígitos: la gente escribe +52, espacios y guiones. */
function digitos(tel: string): string {
  return tel.replace(/\D/g, "").slice(-10);
}

function masDias(fecha: string, n: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type Resultado = { marcados: number; saltados: number; error?: string };

export async function cruzarMercadito(fecha: string): Promise<Resultado> {
  const url = process.env.MERCADITO_SUPABASE_URL;
  const llave = process.env.MERCADITO_SUPABASE_SECRET_KEY;
  const base = ayotl();
  // Decir cuál falta, y no un "sin configurar" a secas: con dos variables
  // nuevas, el fallo típico es un nombre mal escrito en Railway.
  const faltan = [
    !url && "MERCADITO_SUPABASE_URL",
    !llave && "MERCADITO_SUPABASE_SECRET_KEY",
    !base && "SUPABASE_URL/SUPABASE_SECRET_KEY",
  ].filter(Boolean);
  if (faltan.length || !url || !llave || !base) {
    return { marcados: 0, saltados: 0, error: `faltan: ${faltan.join(", ")}` };
  }

  // Los testers con teléfono, indexados por sus diez dígitos.
  const { data: testers, error: errorTesters } = await base
    .from("testers").select("id, telefono")
    .not("telefono", "is", null).is("baja_en", null);
  if (errorTesters) return { marcados: 0, saltados: 0, error: `testers: ${errorTesters.message}` };

  const porTelefono = new Map<string, number>();
  for (const t of testers ?? []) {
    const clave = digitos(String(t.telefono));
    if (clave.length === 10) porTelefono.set(clave, t.id as number);
  }
  if (porTelefono.size === 0) return { marcados: 0, saltados: 0 };

  const mercadito = createClient(url, llave, { auth: { persistSession: false } });
  const desde = `${fecha}T00:00:00${HUSO}`;
  const hasta = `${masDias(fecha, 1)}T00:00:00${HUSO}`;
  const evidencias = new Map<number, Record<string, unknown>>();

  // 1) Pedidos del día. Se filtra el teléfono aquí y no en la consulta porque
  //    en la base está sin normalizar (con +52, espacios o guiones).
  const { data: pedidos, error: errorPedidos } = await mercadito
    .from("pedidos").select("cliente_telefono")
    .gte("created_at", desde).lt("created_at", hasta).limit(2000);
  if (errorPedidos) return { marcados: 0, saltados: 0, error: `pedidos: ${errorPedidos.message}` };

  for (const p of pedidos ?? []) {
    const tester = porTelefono.get(digitos(String(p.cliente_telefono ?? "")));
    if (!tester) continue;
    const previo = (evidencias.get(tester)?.pedidos as number) ?? 0;
    evidencias.set(tester, { pedidos: previo + 1 });
  }

  // 2) Sesiones iniciadas ese día, sólo para quien no tenga ya un pedido.
  const { data: sesiones, error: errorSesiones } = await mercadito
    .from("sesiones").select("usuario_id")
    .gte("expires_at", `${masDias(fecha, DIAS_SESION)}T00:00:00${HUSO}`)
    .lt("expires_at", `${masDias(fecha, DIAS_SESION + 1)}T00:00:00${HUSO}`)
    .limit(2000);
  if (errorSesiones) return { marcados: 0, saltados: 0, error: `sesiones: ${errorSesiones.message}` };

  const ids = [...new Set((sesiones ?? []).map((s) => String(s.usuario_id)))];
  if (ids.length > 0) {
    const { data: usuarios, error: errorUsuarios } = await mercadito
      .from("usuarios").select("id, telefono").in("id", ids);
    if (errorUsuarios) return { marcados: 0, saltados: 0, error: `usuarios: ${errorUsuarios.message}` };
    for (const u of usuarios ?? []) {
      const tester = porTelefono.get(digitos(String(u.telefono ?? "")));
      if (tester && !evidencias.has(tester)) evidencias.set(tester, { sesion: true });
    }
  }

  // 3) A guardar. La función comprueba el periodo del programa y devuelve
  //    false si la fecha cae fuera.
  let marcados = 0, saltados = 0;
  for (const [tester, evidencia] of evidencias) {
    const { data, error } = await base.rpc("registrar_dia_externo", {
      p_tester: tester, p_fecha: fecha, p_app: "mercadito", p_evidencia: evidencia,
    });
    if (error) { console.error("[mercadito] registrar", error.message); continue; }
    if (data === false) saltados++; else marcados++;
  }
  return { marcados, saltados };
}
