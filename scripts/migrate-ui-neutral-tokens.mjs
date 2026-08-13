import { promises as fs } from 'node:fs';
import path from 'node:path';

const root='apps/web';
const mapping={
  '#fff':'var(--surface-primary)','#ffffff':'var(--surface-primary)',
  '#f4f7fb':'var(--app-background)','#f5f7fb':'var(--app-background)','#f6f8fb':'var(--app-background)',
  '#f8fafc':'var(--surface-subtle)','#f3f7fb':'var(--surface-subtle)','#f5f8fc':'var(--surface-subtle)',
  '#102747':'var(--text-primary)','#10233d':'var(--text-primary)','#152238':'var(--text-primary)',
  '#667085':'var(--text-secondary)','#64748b':'var(--text-secondary)','#697586':'var(--text-secondary)',
  '#dce3ec':'var(--border-default)','#e2e8f0':'var(--border-default)','#e5e9ef':'var(--border-default)',
  '#dfe7f0':'var(--border-default)','#dce6f2':'var(--border-default)','#dce6f1':'var(--border-default)',
  '#cbd5e1':'var(--border-default)','#ccd9e7':'var(--border-default)',
  '#ffd524':'var(--brand-yellow-primary)','#ffdc35':'var(--brand-yellow-primary)'
};

async function collect(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','.next'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await collect(full));else if(full.endsWith('.css'))result.push(full)}return result}
const files=(await collect(root)).filter(file=>!file.endsWith(`${path.sep}design-tokens.css`));let replacements=0;
for(const file of files){let source=await fs.readFile(file,'utf8');const before=source;for(const [legacy,token] of Object.entries(mapping)){const escaped=legacy.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');source=source.replace(new RegExp(`${escaped}(?![0-9a-f])`,'gi'),()=>{replacements++;return token})}source=source.replaceAll('align-items:end','align-items:flex-end');if(source!==before)await fs.writeFile(file,source)}
console.log(`Migrated ${replacements} neutral/approved color occurrences across ${files.length} stylesheets.`);
