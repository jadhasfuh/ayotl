// Crea la versión nueva de una app en App Store Connect (si no existe) y le pone las novedades por idioma,
// para que después tools/appstore/mandar-a-revision.mjs enganche la compilación y la mande. La publicación
// (manual o al aprobarse) se copia de la última versión. Nunca imprime datos de contacto.
//   node tools/appstore/nueva-version.mjs dev.ayotl.warzone 1.0.24 novedades.json
// novedades.json: { "es": "texto", "en": "texto", "ja": "texto" } (por prefijo de idioma: es-MX y es-ES toman "es").
// Hecho el 6-nov-2026 para War Zone 1.0.24 y Kazan 1.0.13 (la ficha, capturas y textos se quedan como estén).
import fs from 'node:fs';
import { api } from './asc.mjs';
const [BUNDLE, VERSION, ARCHIVO] = process.argv.slice(2);
if (!BUNDLE || !VERSION || !ARCHIVO) { console.log('uso: node tools/appstore/nueva-version.mjs <bundle> <versión> <novedades.json>'); process.exit(1); }
const novedades = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
const falla = (paso, r) => { console.log('FALLÓ', paso, r.estado, r.texto.slice(0, 800)); process.exit(1); };

let r = await api('GET', `/v1/apps?filter[bundleId]=${BUNDLE}&fields[apps]=name`);
const app = r.json?.data?.[0]; if (!app) falla('buscar la app', r);
console.log(app.attributes.name, app.id);

r = await api('GET', `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&fields[appStoreVersions]=versionString,appStoreState,releaseType,createdDate&limit=20`);
if (r.estado >= 300) falla('leer las versiones', r);
const versiones = r.json.data;
for (const v of versiones.slice(0, 4)) console.log('  ', v.attributes.versionString, v.attributes.appStoreState, v.attributes.releaseType);
let version = versiones.find(v => v.attributes.versionString === VERSION);
if (!version) {
  const editable = versiones.find(v => ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED'].includes(v.attributes.appStoreState));
  if (editable) {   // ya hay una versión abierta con otro número: se le cambia el número (como la 1.0.93 → 1.0.94 de Mercadito)
    const c = await api('PATCH', `/v1/appStoreVersions/${editable.id}`, { data: { type: 'appStoreVersions', id: editable.id, attributes: { versionString: VERSION } } });
    if (c.estado >= 300) falla('renombrar la versión abierta', c);
    version = c.json.data; console.log('versión abierta', editable.attributes.versionString, '→', VERSION);
  } else {
    const ultima = versiones[0]?.attributes?.releaseType ?? 'AFTER_APPROVAL';
    const c = await api('POST', '/v1/appStoreVersions', { data: { type: 'appStoreVersions', attributes: { platform: 'IOS', versionString: VERSION, releaseType: ultima }, relationships: { app: { data: { type: 'apps', id: app.id } } } } });
    if (c.estado >= 300) falla('crear la versión', c);
    version = c.json.data; console.log('versión creada', VERSION, 'publicación', ultima);
  }
} else console.log('la versión ya existe:', version.attributes.appStoreState);

r = await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?fields[appStoreVersionLocalizations]=locale,whatsNew`);
if (r.estado >= 300) falla('leer los idiomas', r);
for (const loc of r.json.data) {
  const idioma = loc.attributes.locale, texto = novedades[idioma] ?? novedades[idioma.slice(0, 2)];
  if (!texto) { console.log('  sin novedades para', idioma); continue; }
  const c = await api('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, { data: { type: 'appStoreVersionLocalizations', id: loc.id, attributes: { whatsNew: texto } } });
  console.log('  novedades', idioma, c.estado < 300 ? 'ok' : `FALLÓ ${c.estado} ${c.texto.slice(0, 300)}`);
}
