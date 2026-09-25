// Checks getBusinessStatus at edge times. Run: npm run test:status
// (Vite loads the source so extensionless imports resolve as in the app.)
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// No dependency pre-scan: it would still be running when the server closes
const server = await createServer({ root, appType: 'custom', logLevel: 'error', server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true } });
const { getBusinessStatus, formatOpensAt } = await server.ssrLoadModule('/src/utils/businessStatus.js');
const { hours } = await server.ssrLoadModule('/src/data/businessInfo.js');

let fail = 0;
const check = (label, got, want) => { const ok = got === want; if (!ok) fail++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${got}${ok ? '' : `  (want ${want})`}`); };
const describe = (s) => s.isOpen ? `OPEN until ${s.closesAt}` : `CLOSED // OPENS ${formatOpensAt(s.opensAt)}`;
// 2026-09-24 is a Thursday; Chicago is on CDT (UTC-5)
const at = (iso, opts) => describe(getBusinessStatus(new Date(`${iso}:00-05:00`), opts));

console.log('visitor TZ =', Intl.DateTimeFormat().resolvedOptions().timeZone);
check('display strings', JSON.stringify(hours.schedule.map(r => r.time)),
  JSON.stringify(['7:00 AM - 10:00 PM', '7:00 AM - 12:00 AM', '8:00 AM - 12:00 AM', '8:00 AM - 8:00 PM']));
check('Thu 12:00', at('2026-09-24T12:00'), 'OPEN until 10 PM');
check('Thu 21:59', at('2026-09-24T21:59'), 'OPEN until 10 PM');
check('Thu 22:00', at('2026-09-24T22:00'), 'CLOSED // OPENS TOMORROW 7 AM');
check('Fri 23:59', at('2026-09-25T23:59'), 'OPEN until 12 AM');
check('Sat 00:00', at('2026-09-26T00:00'), 'CLOSED // OPENS 8 AM');
check('Sat 23:59', at('2026-09-26T23:59'), 'OPEN until 12 AM');
check('Sun 00:00', at('2026-09-27T00:00'), 'CLOSED // OPENS 8 AM');
check('Sun 19:59', at('2026-09-27T19:59'), 'OPEN until 8 PM');
check('Sun 20:00', at('2026-09-27T20:00'), 'CLOSED // OPENS TOMORROW 7 AM');
check('Mon 06:59', at('2026-09-28T06:59'), 'CLOSED // OPENS 7 AM');
check('Mon 07:00', at('2026-09-28T07:00'), 'OPEN until 10 PM');

// Compact format keeps minutes that aren't on the hour
const halfPast = { schedule: [{ days: [1], open: '07:30', close: '21:30' }] };
check('Half-hour close', at('2026-09-28T12:00', halfPast), 'OPEN until 9:30 PM');
check('Half-hour open', at('2026-09-28T06:00', halfPast), 'CLOSED // OPENS 7:30 AM');

// Hypothetical 02:00 close: the real data closes at exactly 00:00, so it never
// exercises being open after midnight
const lateClose = { schedule: [{ days: [5, 6], open: '20:00', close: '02:00' }] };
check('02:00 close: Sat 01:30 (Fri spillover)', at('2026-09-26T01:30', lateClose), 'OPEN until 2 AM');
check('02:00 close: Sat 02:00', at('2026-09-26T02:00', lateClose), 'CLOSED // OPENS 8 PM');
check('02:00 close: Sun 01:59 (Sat spills over week boundary)', at('2026-09-27T01:59', lateClose), 'OPEN until 2 AM');
check('02:00 close: Sun 02:00', at('2026-09-27T02:00', lateClose), 'CLOSED // OPENS FRI 8 PM');
check('02:00 close: Fri 19:59', at('2026-09-25T19:59', lateClose), 'CLOSED // OPENS 8 PM');

// Bar time zone ignores visitor zone: 03:00 UTC Sat = Fri 22:00 Chicago
check('UTC instant', describe(getBusinessStatus(new Date('2026-09-26T03:00:00Z'))), 'OPEN until 12 AM');
// Winter (CST, UTC-6): Mon 06:30 CST = 12:30 UTC
check('CST Mon 06:30', describe(getBusinessStatus(new Date('2026-12-07T12:30:00Z'))), 'CLOSED // OPENS 7 AM');

await server.close();
console.log(fail ? `${fail} FAILED` : 'all passed');
process.exit(fail ? 1 : 0);
