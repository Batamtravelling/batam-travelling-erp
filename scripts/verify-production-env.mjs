const required = ['DATABASE_URL','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','CORS_ORIGINS','REDIS_URL','ERP_OWNER_EMAIL'];
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
for (const name of ['NEXT_PUBLIC_API_URL','NEXT_PUBLIC_SUPABASE_URL']) {
  if (!process.env[name]?.startsWith('https://')) {
    console.error(`${name} wajib HTTPS pada production`);
    process.exit(1);
  }
}
console.log('Konfigurasi production memenuhi pemeriksaan statis.');
