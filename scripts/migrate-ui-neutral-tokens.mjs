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
  '#ffd524':'var(--brand-yellow-primary)','#ffdc35':'var(--brand-yellow-primary)',

  // Brand and interactive colors
  '#001b3f':'var(--brand-navy-strong)','#061a35':'var(--brand-navy-strong)','#071d3a':'var(--brand-navy-strong)',
  '#072a5c':'var(--brand-navy-primary)','#073b87':'var(--brand-navy-primary)','#0b2344':'var(--text-primary)',
  '#0b3970':'var(--brand-navy-primary)','#0f172a':'var(--brand-navy-strong)','#0f766e':'var(--brand-navy-primary)',
  '#102843':'var(--text-primary)','#102a43':'var(--text-primary)','#132b47':'var(--text-primary)',
  '#14304b':'var(--text-primary)','#143251':'var(--text-primary)','#172033':'var(--text-primary)',
  '#25466e':'var(--brand-navy-hover)','#334155':'var(--text-primary)','#344e68':'var(--text-primary)',
  '#075fc4':'var(--status-info)','#0868d5':'var(--status-info)','#087fe2':'var(--status-info)',
  '#0c5bb8':'var(--status-info)','#0d5fba':'var(--status-info)','#1265d6':'var(--status-info)',
  '#174a9a':'var(--status-info)','#1d4ed8':'var(--status-info)','#1e4f9c':'var(--status-info)',
  '#075985':'var(--status-info)','#0b4e98':'var(--status-info)','#0d5fba':'var(--status-info)',
  '#1174df':'var(--status-info)','#1e40af':'var(--status-info)','#1f5fbf':'var(--status-info)','#2167d9':'var(--status-info)',
  '#2351c2':'var(--status-info)','#3b82f6':'var(--status-info)',
  '#60a5fa':'var(--status-info)','#75b1ff':'var(--status-info)',

  // Semantic state colors
  '#047857':'var(--status-success)','#075f38':'var(--status-success)','#147647':'var(--status-success)',
  '#14b8a6':'var(--status-success)','#157347':'var(--status-success)','#15803d':'var(--status-success)',
  '#16804d':'var(--status-success)','#168652':'var(--status-success)','#16a34a':'var(--status-success)',
  '#177245':'var(--status-success)','#19a85b':'var(--status-success)','#22c55e':'var(--status-success)',
  '#34d399':'var(--status-success)','#166534':'var(--status-success)','#991b1b':'var(--status-error)',
  '#b42318':'var(--status-error)','#b91c1c':'var(--status-error)',
  '#be123c':'var(--status-error)','#ef4444':'var(--status-error)','#765b00':'var(--status-warning)',
  '#92400e':'var(--status-warning)','#9a3412':'var(--status-warning)','#a16207':'var(--status-warning)',
  '#b45309':'var(--status-warning)','#c45a00':'var(--status-warning)','#f59e0b':'var(--status-warning)',
  '#ffca05':'var(--brand-yellow-primary)',

  // Semantic state surfaces
  '#ccfbf1':'var(--status-success-surface)','#dcfce7':'var(--status-success-surface)',
  '#e7f8ef':'var(--status-success-surface)','#e8f8ef':'var(--status-success-surface)',
  '#e9f8ef':'var(--status-success-surface)','#ecfdf5':'var(--status-success-surface)',
  '#edf9f4':'var(--status-success-surface)','#f0fdfa':'var(--status-success-surface)',
  '#f2fff7':'var(--status-success-surface)','#fee2e2':'var(--status-error-surface)',
  '#feecec':'var(--status-error-surface)','#fff1f2':'var(--status-error-surface)',
  '#fff3d9':'var(--status-warning-surface)','#fff3e8':'var(--status-warning-surface)',
  '#fff7c8':'var(--status-warning-surface)','#fff7ed':'var(--status-warning-surface)',
  '#fffbdf':'var(--status-warning-surface)','#fffbeb':'var(--status-warning-surface)',
  '#d9eaff':'var(--status-info-surface)','#dce9ff':'var(--status-info-surface)',
  '#e0f2fe':'var(--status-info-surface)','#e7f0fb':'var(--status-info-surface)','#e8f1ff':'var(--status-info-surface)',
  '#e9f3ff':'var(--status-info-surface)','#eaf3ff':'var(--status-info-surface)',
  '#edf5ff':'var(--status-info-surface)','#eef4fb':'var(--status-info-surface)',
  '#eef4ff':'var(--status-info-surface)','#eef5ff':'var(--status-info-surface)',
  '#eff6ff':'var(--status-info-surface)',

  // Neutral text, borders, and surfaces
  '#10223a':'var(--text-primary)','#28405f':'var(--text-primary)','#43536a':'var(--text-secondary)',
  '#475569':'var(--text-secondary)','#52627a':'var(--text-secondary)',
  '#52677c':'var(--text-secondary)','#52677d':'var(--text-secondary)','#5c6f8e':'var(--text-secondary)',
  '#5f6f7d':'var(--text-secondary)','#607087':'var(--text-secondary)','#627187':'var(--text-secondary)',
  '#63768a':'var(--text-secondary)','#66798d':'var(--text-secondary)','#68768a':'var(--text-secondary)',
  '#687b8d':'var(--text-secondary)','#6b7d91':'var(--text-secondary)','#6c7f92':'var(--text-secondary)',
  '#6d7f92':'var(--text-secondary)','#708096':'var(--text-secondary)','#708398':'var(--text-secondary)',
  '#718096':'var(--text-secondary)','#738196':'var(--text-secondary)','#748196':'var(--text-secondary)',
  '#78869a':'var(--text-secondary)','#91a7c3':'var(--sidebar-text)','#94a3b8':'var(--text-secondary)',
  '#b8c9de':'var(--sidebar-text)','#b9c8dc':'var(--sidebar-text)','#bbb':'var(--text-secondary)',
  '#b9c2d0':'var(--border-default)','#b9c8d9':'var(--border-default)','#b9d9c7':'var(--border-default)',
  '#bfdbfe':'var(--border-default)','#c7d8eb':'var(--border-default)','#c8d7e5':'var(--border-default)',
  '#cbd8e6':'var(--border-default)','#cbd8e7':'var(--border-default)','#cbd9e6':'var(--border-default)',
  '#ccd6e5':'var(--border-default)','#d7e4f8':'var(--sidebar-text)','#d8e2ec':'var(--border-default)',
  '#dae4ef':'var(--border-default)','#dbe3ee':'var(--border-default)','#dbe4ed':'var(--border-default)','#dbe5f0':'var(--border-default)',
  '#dce9e1':'var(--border-default)','#dfe5ed':'var(--border-default)','#e0e7ef':'var(--border-default)',
  '#e3eaf2':'var(--border-default)','#e4eaf1':'var(--border-default)','#e4ebf3':'var(--border-default)',
  '#e5ebf2':'var(--border-default)','#e6edf4':'var(--border-default)','#e9eef4':'var(--border-default)',
  '#edf1f5':'var(--border-default)','#eef1f5':'var(--border-default)',
  '#e8edf5':'var(--surface-subtle)','#e9eef6':'var(--surface-subtle)','#eaf0f6':'var(--surface-subtle)',
  '#edf1f7':'var(--surface-subtle)','#edf2f7':'var(--surface-subtle)','#eef1f5':'var(--surface-subtle)',
  '#eef2f7':'var(--surface-subtle)','#f1f5f9':'var(--surface-subtle)','#f1f6fb':'var(--surface-subtle)',
  '#f2f6fb':'var(--surface-subtle)','#f4f8fc':'var(--surface-subtle)','#f7fafc':'var(--surface-subtle)',
  '#f8fbff':'var(--surface-subtle)',

  // Alpha colors and legacy shorthand
  '#00000008':'rgba(6,26,56,.03)','#0005':'rgba(6,26,56,.33)',
  '#001b3f0a':'rgba(6,26,56,.04)','#001b3f0c':'rgba(6,26,56,.05)',
  '#001b3f0d':'rgba(6,26,56,.05)','#001b3f55':'rgba(6,26,56,.33)',
  '#001b3faa':'rgba(6,26,56,.67)','#001d4dcc':'rgba(6,26,56,.8)',
  '#052e1660':'rgba(6,26,56,.38)','#071d3a20':'rgba(6,26,56,.13)',
  '#102a4310':'rgba(6,26,56,.06)','#25334d0a':'rgba(6,26,56,.04)',
  '#94a3b84d':'rgba(102,112,133,.3)','#fff1':'rgba(255,255,255,.07)',
  '#fff5':'rgba(255,255,255,.33)'
};

async function collect(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','.next'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await collect(full));else if(/\.(css|tsx?|jsx?)$/.test(full))result.push(full)}return result}
const files=(await collect(root)).filter(file=>!file.endsWith(`${path.sep}design-tokens.css`));let replacements=0;
for(const file of files){let source=await fs.readFile(file,'utf8');const before=source;for(const [legacy,token] of Object.entries(mapping)){const escaped=legacy.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');source=source.replace(new RegExp(`${escaped}(?![0-9a-f])`,'gi'),()=>{replacements++;return token})}source=source.replaceAll('align-items:end','align-items:flex-end');if(source!==before)await fs.writeFile(file,source)}
console.log(`Migrated ${replacements} neutral/approved color occurrences across ${files.length} stylesheets.`);
