import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: { orders: { executor: 'constant-arrival-rate', rate: 2, timeUnit: '1s', duration: '45s', preAllocatedVUs: 5, maxVUs: 10 } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<1200', 'p(99)<2500'] },
};

const base = __ENV.API_URL;
const packageId = __ENV.STAGING_PACKAGE_ID;
const travelDate = __ENV.STAGING_TRAVEL_DATE;
if (!base || !packageId || !travelDate || __ENV.ENABLE_WRITE_LOAD !== 'true') throw new Error('Set API_URL, STAGING_PACKAGE_ID, STAGING_TRAVEL_DATE, dan ENABLE_WRITE_LOAD=true untuk staging terisolasi');

export default function () {
  const unique = `${__VU}-${__ITER}-${Date.now()}`;
  const response = http.post(`${base}/public/orders`, JSON.stringify({ packageId, fullName: `Load Test ${unique}`, phone: `62899${String(__VU).padStart(3, '0')}${String(__ITER).padStart(5, '0')}`, email: `load-${unique}@example.invalid`, travelDate, pax: 1, notes: 'SYNTHETIC_STAGING_LOAD_TEST' }), { headers: { 'content-type': 'application/json', 'idempotency-key': `load-${unique}-batam-travelling` } });
  check(response, { 'order created or replayed': (r) => r.status === 201 || r.status === 200 });
  sleep(0.2);
}
