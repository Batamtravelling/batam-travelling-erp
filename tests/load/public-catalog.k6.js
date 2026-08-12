import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<750', 'p(99)<1500'],
  },
};

const base = __ENV.API_URL;
if (!base) throw new Error('API_URL wajib diisi dan harus menunjuk ke staging');

export default function () {
  const packages = http.get(`${base}/public/packages`);
  check(packages, { 'catalog 200': (r) => r.status === 200 });
  const profile = http.get(`${base}/public/company-profile`);
  check(profile, { 'profile 200': (r) => r.status === 200 });
  sleep(1);
}
