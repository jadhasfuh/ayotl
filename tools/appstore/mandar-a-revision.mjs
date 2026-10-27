// Manda a revisión de Apple una build ya subida (con tools/subir-ios.sh de cada juego), sin abrir App Store
// Connect: espera a que la build quede VALID, la pone en la versión que se puede editar y crea el envío.
//   node tools/appstore/mandar-a-revision.mjs dev.ayotl.warzone 22
//   node tools/appstore/mandar-a-revision.mjs dev.ayotl.kazan 6 --cancelar   (antes saca de revisión lo que haya)
// Hecho el 27-oct-2026 para War Zone 1.0.20: la (21) se mandó con los anuncios de prueba, se canceló y va la (22).
// La versión de la tienda (texto, capturas, publicación manual o automática) se queda como esté en App Store Connect.
import { api } from './asc.mjs';
const [BUNDLE, BUILD] = process.argv.slice(2);
const CANCELAR = process.argv.includes('--cancelar');
if (!BUNDLE || !BUILD) { console.log('uso: node tools/appstore/mandar-a-revision.mjs <bundle> <compilación> [--cancelar]'); process.exit(1); }
const dormir = ms => new Promise(r => setTimeout(r, ms));
const falla = (paso, r) => { console.log('FALLÓ', paso, r.estado, r.texto.slice(0, 800)); process.exit(1); };
const hora = () => new Date().toISOString().slice(11, 19);

let r = await api('GET', `/v1/apps?filter[bundleId]=${BUNDLE}&fields[apps]=name`);
const app = r.json?.data?.[0]; if (!app) falla('buscar la app', r);
console.log(app.attributes.name, app.id);

// lo que esté esperando revisión: se cancela sólo si se pidió
r = await api('GET', `/v1/reviewSubmissions?filter[app]=${app.id}&filter[state]=WAITING_FOR_REVIEW,IN_REVIEW,READY_FOR_REVIEW`);
for (const e of r.json?.data ?? []) {
  if (!CANCELAR) { console.log('hay un envío en', e.attributes.state, '(', e.id, '): usa --cancelar para sacarlo'); process.exit(1); }
  const c = await api('PATCH', `/v1/reviewSubmissions/${e.id}`, { data: { type: 'reviewSubmissions', id: e.id, attributes: { canceled: true } } });
  if (c.estado >= 300) falla('cancelar el envío', c);
  for (let i = 0; i < 30; i++) {
    const s = await api('GET', `/v1/reviewSubmissions/${e.id}?fields[reviewSubmissions]=state`);
    console.log(hora(), 'cancelando:', s.json?.data?.attributes?.state);
    if (s.json?.data?.attributes?.state === 'COMPLETE') break;
    await dormir(20000);
  }
}

r = await api('GET', `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&fields[appStoreVersions]=versionString,appStoreState`);
const editable = ['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED'];
const version = r.json?.data?.find(v => editable.includes(v.attributes.appStoreState));
if (!version) falla('buscar una versión editable', r);
console.log('versión', version.attributes.versionString, version.attributes.appStoreState);

let build = null;
for (let i = 0; i < 90 && !build; i++) {
  r = await api('GET', `/v1/builds?filter[app]=${app.id}&filter[version]=${BUILD}&fields[builds]=version,processingState,usesNonExemptEncryption`);
  const b = r.json?.data?.[0];
  console.log(hora(), 'build', BUILD, b ? b.attributes.processingState : 'aún no aparece');
  if (b?.attributes.processingState === 'VALID') build = b;
  else if (b && ['FAILED', 'INVALID'].includes(b.attributes.processingState)) process.exit(1);
  else await dormir(60000);
}
if (!build) { console.log('la build no quedó lista en 90 min'); process.exit(1); }
if (build.attributes.usesNonExemptEncryption !== false) console.log('ojo: usesNonExemptEncryption =', build.attributes.usesNonExemptEncryption, '(ITSAppUsesNonExemptEncryption en Info.plist)');

r = await api('PATCH', `/v1/appStoreVersions/${version.id}/relationships/build`, { data: { type: 'builds', id: build.id } });
if (r.estado >= 300) falla('poner la build', r);
r = await api('POST', '/v1/reviewSubmissions', { data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' }, relationships: { app: { data: { type: 'apps', id: app.id } } } } });
if (r.estado >= 300) falla('crear el envío', r);
const envio = r.json.data.id;
r = await api('POST', '/v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: envio } }, appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } } } } });
if (r.estado >= 300) falla('añadir la versión al envío', r);
r = await api('PATCH', `/v1/reviewSubmissions/${envio}`, { data: { type: 'reviewSubmissions', id: envio, attributes: { submitted: true } } });
if (r.estado >= 300) falla('mandar a revisión', r);
console.log('mandado a revisión:', r.json.data.attributes.state, r.json.data.attributes.submittedDate);
