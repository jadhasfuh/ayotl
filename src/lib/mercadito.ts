import "server-only";
import { Client } from "pg";
import { ayotl } from "./supabase-servidor";

/**
 * Los días de prueba de Mercadito.
 *
 * Mercadito vive en otra Supabase y no tiene cuentas de Google: se entra con
 * teléfono y PIN. El puente es el teléfono que el tester dejó en el
 * formulario. Se conecta con `pg` directo (como hace el propio Mercadito),
 * con el pooler de sesión, y sólo lee.
 *
 * Dos señales de que alguien usó la app ese día:
 *  - un pedido suyo (`pedidos.cliente_telefono`), que es actividad de verdad;
 *  - una sesión creada ese día. `sesiones` no guarda cuándo se creó, pero sí
 *    `expires_at`, y la sesión dura 30 días exactos: restando se obtiene el
 *    día del login. Es aproximado y sólo sirve mientras la sesión no caduque,
 *    así que el pedido manda cuando hay los dos.
 */
const DIAS_SESION = 30;

/** Normaliza a diez dígitos: la gente escribe +52, espacios y guiones. */
function digitos(tel: string): string {
  const soloNumeros = tel.replace(/\D/g, "");
  return soloNumeros.slice(-10);
}

export async function cruzarMercadito(fecha: string): Promise<{ marcados: number; saltados: number; error?: string }> {
  const url = process.env.MERCADITO_DATABASE_URL;
  const base = ayotl();
  if (!url || !base) return { marcados: 0, saltados: 0, error: "sin configurar" };

  const { data: testers } = await base
    .from("testers").select("id, telefono")
    .not("telefono", "is", null).is("baja_en", null);
  const porTelefono = new Map<string, number>();
  for (const t of testers ?? []) {
    const clave = digitos(String(t.telefono));
    if (clave.length === 10) porTelefono.set(clave, t.id as number);
  }
  if (porTelefono.size === 0) return { marcados: 0, saltados: 0 };

  // Mismo TLS que usa el propio Mercadito en su `src/lib/db.ts`: cifrado sí,
  // pero sin verificar la cadena del pooler de Supabase, que no valida contra
  // las CA del sistema. Sin esto, el handshake falla y el cruce revienta.
  const esLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const cliente = new Client({
    connectionString: url,
    ssl: esLocal ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    statement_timeout: 15000,
  });
  // `pg` emite `error` en el propio cliente cuando el socket se cae o el
  // handshake falla. Sin un oyente, Node lo convierte en excepción no
  // capturada y **se lleva el proceso por delante**: el contenedor moría y
  // Cloudflare devolvía un 502 suyo, no el error de la API.
  cliente.on("error", (e) => console.error("[mercadito] cliente", e.message));

  try {
    await cliente.connect();
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error("[mercadito] conexión", detalle);
    return { marcados: 0, saltados: 0, error: `conexión: ${detalle}` };
  }

  let actividad: { telefono: string; pedidos: number; sesion: boolean }[] = [];
  try {
    const telefonos = [...porTelefono.keys()];
    const { rows } = await cliente.query<{ telefono: string; pedidos: string; sesion: boolean }>(
      `with tel as (select unnest($1::text[]) as t)
       select tel.t as telefono,
              (select count(*) from pedidos p
                where right(regexp_replace(p.cliente_telefono, '\\D', '', 'g'), 10) = tel.t
                  and (p.created_at at time zone 'America/Mexico_City')::date = $2::date) as pedidos,
              exists (select 1 from sesiones s
                join usuarios u on u.id = s.usuario_id
                where right(regexp_replace(u.telefono, '\\D', '', 'g'), 10) = tel.t
                  and ((s.expires_at - interval '${DIAS_SESION} days') at time zone 'America/Mexico_City')::date = $2::date) as sesion
       from tel`,
      [telefonos, fecha],
    );
    actividad = rows.map((r) => ({ telefono: r.telefono, pedidos: Number(r.pedidos), sesion: r.sesion }));
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error("[mercadito] consulta", detalle);
    return { marcados: 0, saltados: 0, error: `consulta: ${detalle}` };
  } finally {
    await cliente.end().catch(() => {});
  }

  let marcados = 0, saltados = 0;
  for (const { telefono, pedidos, sesion } of actividad) {
    if (pedidos === 0 && !sesion) continue;
    const tester = porTelefono.get(telefono)!;
    // Pasa por la función, que es la que comprueba el periodo del programa.
    const { data, error } = await base.rpc("registrar_dia_externo", {
      p_tester: tester, p_fecha: fecha, p_app: "mercadito",
      p_evidencia: pedidos > 0 ? { pedidos } : { sesion: true },
    });
    if (error) { console.error("[mercadito] registrar", error.message); continue; }
    if (data === false) saltados++; else marcados++;
  }
  return { marcados, saltados };
}
