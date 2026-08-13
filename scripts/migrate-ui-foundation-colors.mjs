import { promises as fs } from 'node:fs';

const migrations={
  'apps/web/app/public-site.css':{
    '#0c5548':'var(--brand-navy-primary)','#d6f458':'var(--brand-yellow-primary)','#f5f1e8':'var(--app-background)','#f9f8f3':'var(--surface-primary)','#10231f':'var(--text-primary)','#d9ded8':'var(--border-default)','#334b45':'var(--text-primary)','#eff5d1':'var(--app-background)','#59736c':'var(--text-secondary)','#52635f':'var(--text-secondary)','#71817d':'var(--text-secondary)','#bddbcf':'var(--brand-navy-hover)','#5b9d91':'var(--brand-navy-primary)','#184f48':'var(--brand-navy-strong)','#e1c794':'var(--border-default)','#173e3433':'rgba(6,26,56,.12)','#d7e7e2':'var(--sidebar-text)','#61706c':'var(--text-secondary)','#dfe4df':'var(--border-default)','#0d6b62':'var(--brand-navy-primary)','#9bc8b8':'var(--brand-navy-hover)','#cc9a58':'var(--brand-yellow-hover)','#425e56':'var(--brand-navy-primary)','#324f73':'var(--brand-navy-hover)','#e8a969':'var(--brand-yellow-primary)','#0f766e':'var(--brand-navy-primary)','#63706d':'var(--text-secondary)','#e5e7e5':'var(--border-default)','#eff5f1':'var(--surface-subtle)','#e9efe8':'var(--surface-subtle)','#bfcac4':'var(--border-default)','#082e28':'var(--brand-navy-strong)','#d6e2df':'var(--sidebar-text)'},
  'apps/web/app/website-enhancements.css':{
    '#dce6f2':'var(--border-default)','#143251':'var(--text-primary)','#eef6ff':'var(--surface-subtle)','#718096':'var(--text-secondary)','#073b87':'var(--brand-navy-primary)','#ffdd35':'var(--brand-yellow-primary)','#f4f8fd':'var(--app-background)','#075ac9':'var(--brand-navy-primary)','#0c86ed':'var(--brand-navy-hover)','#075ac92e':'rgba(6,26,56,.12)','#dcecff':'var(--sidebar-text)','#ffe13e':'var(--brand-yellow-primary)','#ffd524':'var(--brand-yellow-primary)','#173451':'var(--text-primary)','#ffe24c':'var(--surface-primary)','#6c7d91':'var(--text-secondary)','#fff5b8':'var(--surface-subtle)'},
  'apps/web/app/my-trip/portal.css':{
    '#0b3931':'var(--brand-navy-primary)','#c9ded8':'var(--sidebar-text)','#14352f':'var(--text-primary)','#d6f458':'var(--brand-yellow-primary)','#0f766e':'var(--brand-navy-primary)','#cbd5e1':'var(--border-default)','#94a3b8':'var(--text-secondary)','#f1f5f3':'var(--app-background)','#b9d0ca':'var(--sidebar-text)','#134e4a':'var(--brand-navy-hover)','#dfe6e3':'var(--border-default)','#f8faf9':'var(--surface-subtle)','#e5e7eb':'var(--border-default)'}
};
const sharedReplacements={'#64748b':'var(--text-secondary)','#2167d9':'var(--status-info)','#b91c1c':'var(--status-error)','#147647':'var(--status-success)','#e8f8ef':'var(--status-success-surface)','#15803d':'var(--status-success)','#dcfce7':'var(--status-success-surface)','#0004':'rgba(6,26,56,.27)','#0002':'rgba(6,26,56,.13)','#0d5dab1c':'rgba(6,26,56,.11)'};

for(const [file,replacements] of Object.entries(migrations)){
  let source=await fs.readFile(file,'utf8');
  for(const [legacy,token] of Object.entries(replacements))source=source.replaceAll(legacy,token);
  for(const [legacy,token] of Object.entries(sharedReplacements))source=source.replaceAll(legacy,token);
  await fs.writeFile(file,source);
  console.log(`${file}: migrated ${Object.keys(replacements).length} legacy values`);
}
