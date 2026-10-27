// Cliente mínimo de la API de App Store Connect con la clave de equipo (la misma de tools/subir-ios.sh de
// War Zone y Kazan: ~/.appstoreconnect/private_keys/AuthKey_DLN655Z92Q.p8; una individual da 401).
//   node tools/appstore/asc.mjs GET '/v1/apps?filter[bundleId]=dev.ayotl.warzone'
//   node tools/appstore/asc.mjs PATCH /v1/reviewSubmissions/ID '{"data":{...}}'
// Nunca imprime la clave ni el token.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
const KID = 'DLN655Z92Q', ISS = '31afe099-41c1-41ee-a9a1-efa1c5d70bf4';
const clave = fs.readFileSync(`${os.homedir()}/.appstoreconnect/private_keys/AuthKey_${KID}.p8`, 'utf8');
const b64 = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
export function token() {
  const ahora = Math.floor(Date.now() / 1000);
  const datos = `${b64({ alg: 'ES256', kid: KID, typ: 'JWT' })}.${b64({ iss: ISS, iat: ahora, exp: ahora + 1200, aud: 'appstoreconnect-v1' })}`;
  const firma = crypto.sign('sha256', Buffer.from(datos), { key: clave, dsaEncoding: 'ieee-p1363' });
  return `${datos}.${firma.toString('base64url')}`;
}
export async function api(metodo, ruta, cuerpo) {
  const r = await fetch('https://api.appstoreconnect.apple.com' + ruta, {
    method: metodo, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: cuerpo ? (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)) : undefined,
  });
  const texto = await r.text();
  let json = null; try { json = JSON.parse(texto); } catch {}
  return { estado: r.status, json, texto };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const [metodo, ruta, cuerpo] = process.argv.slice(2);
  const r = await api(metodo, ruta, cuerpo);
  console.log(r.estado); console.log(JSON.stringify(r.json ?? r.texto, null, 1).slice(0, 6000));
}
