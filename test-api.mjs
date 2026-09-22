/**
 * SocioSync – Post-deploy API validation
 * Run: node test-api.mjs
 * Waits ~90 s after push for Vercel to deploy, then verifies:
 *   1. POST colombia unique data → GET verifies it
 *   2. POST usa unique data → GET verifies it
 *   3. Data doesn't mix between sessions
 *   4. Each session has the correct PIN
 */

const BASE = 'https://socio-sync-three.vercel.app/api/sync';
const COLOMBIA_PIN = '2026';
const USA_PIN = '7777';

const uniqueCO = `TEST-CO-${Date.now()}`;
const uniqueUSA = `TEST-USA-${Date.now()}`;

async function get(ws) {
  const res = await fetch(`${BASE}?workspaceId=${ws}&_t=${Date.now()}`, { cache: 'no-store' });
  const json = await res.json();
  return json?.data;
}

async function post(ws, data) {
  const res = await fetch(`${BASE}?workspaceId=${ws}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId: ws, data })
  });
  return res.ok;
}

function check(label, condition) {
  console.log(condition ? `  ✅ ${label}` : `  ❌ ${label}`);
  return condition;
}

async function main() {
  console.log('\n=== SocioSync API Validation ===\n');

  // 1. POST colombia with unique marker + PIN
  const coPayload = {
    workspaceId: 'colombia',
    pin: COLOMBIA_PIN,
    partners: [{ id: 'socio_1', name: 'Socio Colombia' }],
    ts: Date.now(),
    _testMarker: uniqueCO
  };
  const coPost = await post('colombia', coPayload);
  check('POST colombia → 200 OK', coPost);

  // 2. POST usa with unique marker + PIN
  const usaPayload = {
    workspaceId: 'usa',
    pin: USA_PIN,
    partners: [{ id: 'socio_1', name: 'Socio USA' }],
    ts: Date.now(),
    _testMarker: uniqueUSA
  };
  const usaPost = await post('usa', usaPayload);
  check('POST usa → 200 OK', usaPost);

  // Wait 1s for writes to propagate
  await new Promise(r => setTimeout(r, 1000));

  // 3. GET colombia and verify data
  const coData = await get('colombia');
  console.log('\nColombia GET result:', JSON.stringify(coData, null, 2).slice(0, 300));
  check('GET colombia has unique marker', coData?._testMarker === uniqueCO);
  check('GET colombia PIN = 2026', String(coData?.pin || '').trim() === COLOMBIA_PIN);

  // 4. GET usa and verify data
  const usaData = await get('usa');
  console.log('\nUSA GET result:', JSON.stringify(usaData, null, 2).slice(0, 300));
  check('GET usa has unique marker', usaData?._testMarker === uniqueUSA);
  check('GET usa PIN = 7777', String(usaData?.pin || '').trim() === USA_PIN);

  // 5. Verify no data mixing
  check('Colombia marker NOT in usa data', usaData?._testMarker !== uniqueCO);
  check('USA marker NOT in colombia data', coData?._testMarker !== uniqueUSA);

  console.log('\n=== Done ===\n');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
