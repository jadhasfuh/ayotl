// Saca de la revisión de Apple lo que una app tenga esperando (o en revisión) y espera a que quede cancelado, para
// mandar otra compilación. Después: nueva-version.mjs (renombra la versión y pone novedades) y mandar-a-revision.mjs.
//   node tools/appstore/cancelar-revision.mjs dev.ayotl.warzone
// Hecho el 6-nov-2026 (Adrián: «si están en revisión la cancelas y reenvías la última versión»).
import { api } from './asc.mjs';
const [BUNDLE] = process.argv.slice(2);
if (!BUNDLE) { console.log('uso: node tools/appstore/cancelar-revision.mjs <bundle>'); process.exit(1); }
const dormir = ms => new Promise(r => setTimeout(r, ms));
let r = await api('GET', `/v1/apps?filter[bundleId]=${BUNDLE}&fields[apps]=name`);
const app = r.json?.data?.[0]; if (!app) { console.log('no encuentro la app', r.estado); process.exit(1); }
r = await api('GET', `/v1/reviewSubmissions?filter[app]=${app.id}&filter[state]=WAITING_FOR_REVIEW,IN_REVIEW,READY_FOR_REVIEW,UNRESOLVED_ISSUES`);
const envios = r.json?.data ?? [];
if (!envios.length) { console.log(app.attributes.name, ': nada en revisión'); process.exit(0); }
for (const e of envios) {
  console.log(app.attributes.name, ': cancelando el envío', e.id, e.attributes.state);
  const c = await api('PATCH', `/v1/reviewSubmissions/${e.id}`, { data: { type: 'reviewSubmissions', id: e.id, attributes: { canceled: true } } });
  if (c.estado >= 300) { console.log('FALLÓ', c.estado, c.texto.slice(0, 400)); process.exit(1); }
  for (let i = 0; i < 40; i++) {
    const s = await api('GET', `/v1/reviewSubmissions/${e.id}?fields[reviewSubmissions]=state`);
    const estado = s.json?.data?.attributes?.state; console.log('  ', estado);
    if (estado === 'COMPLETE' || estado === 'CANCELING' && i > 30) break;
    await dormir(15000);
  }
}
