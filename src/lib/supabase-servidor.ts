import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null | undefined;

/**
 * Cliente con la llave secreta: salta el RLS, así que sólo vive en el
 * servidor (`server-only` hace que importarlo desde el cliente falle en el
 * build). Devuelve null si Supabase no está configurado: el sitio carga
 * igual y sólo el formulario Beta contesta "no disponible".
 *
 * No hay cliente de navegador en este proyecto a propósito: la única
 * escritura pasa por /api/beta, y la tabla no tiene políticas para anon.
 */
export function supabaseServidor(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  cliente = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cliente;
}

/**
 * Todo lo de este proyecto vive en el esquema `ayotl` de la Supabase de
 * jlptest, nunca en `public` (que es de jlptest) ni en `arcade` (Daily
 * Challenge). Para que la API lo sirva, `ayotl` tiene que estar en
 * Settings → API → Exposed schemas (una vez, a mano).
 */
export function ayotl() {
  return supabaseServidor()?.schema("ayotl") ?? null;
}
