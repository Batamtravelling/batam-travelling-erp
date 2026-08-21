const required = ['DATABASE_URL','DIRECT_URL','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','SUPABASE_MEDIA_BUCKET','SUPABASE_PRIVATE_BUCKET','SERVER_API_URL','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','CORS_ORIGINS','REDIS_URL','ERP_OWNER_EMAIL','PUBLIC_TENANT_SLUG'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Konfigurasi production belum lengkap: ${missing.join(', ')}`);
  process.exit(1);
}
const publicNames = Object.keys(process.env).filter((name) => name.startsWith('NEXT_PUBLIC_'));
const leaked = publicNames.filter((name) => /SECRET|SERVICE|DATABASE|REDIS|PASSWORD/i.test(name));
if (leaked.length) {
  console.error(`Secret tidak boleh memakai prefix NEXT_PUBLIC_: ${leaked.join(', ')}`);
  process.exit(1);
}
for (const name of ['SERVER_API_URL','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_URL']) {
  if (!process.env[name]?.startsWith('https://')) {
    console.error(`${name} wajib HTTPS pada production`);
    process.exit(1);
  }
}
for (const name of ['DATABASE_URL','DIRECT_URL']) {
  if (!/^postgres(?:ql)?:\/\//.test(process.env[name] ?? '')) {
    console.error(`${name} wajib berupa PostgreSQL connection string`);
    process.exit(1);
  }
}
if (!/:6543(?:\/|$)/.test(process.env.DATABASE_URL ?? '')) {
  console.error('DATABASE_URL wajib memakai Supabase transaction pooler port 6543 untuk Vercel runtime');
  process.exit(1);
}
if (!/[?&]pgbouncer=true(?:&|$)/.test(process.env.DATABASE_URL ?? '')) {
  console.error('DATABASE_URL wajib menyertakan pgbouncer=true untuk Prisma transaction pooling');
  process.exit(1);
}
if (/:6543(?:\/|$)/.test(process.env.DIRECT_URL ?? '')) {
  console.error('DIRECT_URL tidak boleh memakai transaction pooler port 6543');
  process.exit(1);
}
if (process.env.PUBLIC_TENANT_SLUG !== 'batam-travelling') {
  console.error('PUBLIC_TENANT_SLUG wajib bernilai batam-travelling untuk deployment ini');
  process.exit(1);
}
if (process.env.SUPABASE_SECRET_KEY === process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY?.startsWith('sb_publishable_')) {
  console.error('SUPABASE_SECRET_KEY tidak boleh memakai publishable key');
  process.exit(1);
}
if (process.env.ALLOW_AUTH_EMAIL_LINK === 'true') {
  console.error('ALLOW_AUTH_EMAIL_LINK harus dimatikan setelah bootstrap owner selesai');
  process.exit(1);
}
for (const name of ['DATABASE_URL','DIRECT_URL','SERVER_API_URL','NEXT_PUBLIC_API_URL','CORS_ORIGINS','REDIS_URL']) {
  if (/localhost|127\.0\.0\.1|replace_me/i.test(process.env[name] ?? '')) {
    console.error(`${name} masih berisi konfigurasi development/placeholder`);
    process.exit(1);
  }
}
console.log('Konfigurasi production memenuhi pemeriksaan statis.');
