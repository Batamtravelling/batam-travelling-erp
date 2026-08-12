import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [{ duration: '30s', target: 20 }, { duration: '90s', target: 75 }, { duration: '30s', target: 0 }],
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<900', 'p(99)<1800'] },
};

const base = __ENV.API_URL;
const token = __ENV.STAGING_STAFF_TOKEN;
if (!base || !token) throw new Error('API_URL dan STAGING_STAFF_TOKEN wajib menunjuk staging');
const params = { headers: { authorization: `Bearer ${token}` } };

export default function () {
  for (const path of ['/dashboard/role', '/customers?page=1&pageSize=20', '/bookings?page=1&pageSize=20', '/invoices?page=1&pageSize=20', '/trips?page=1&pageSize=20']) {
    const response = http.get(`${base}${path}`, params);
    check(response, { [`${path} 200`]: (r) => r.status === 200 });
  }
  sleep(1);
}
