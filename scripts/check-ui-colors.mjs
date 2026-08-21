import { promises as fs } from 'node:fs';
import path from 'node:path';

async function collect(dir){
  const result=[];
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    if(['node_modules','.next'].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())result.push(...await collect(full));
    else if(full.endsWith('.css'))result.push(full);
  }
  return result;
}

const tokenFile=path.normalize('apps/web/app/design-tokens.css');
const roots=[tokenFile,...(await collect('apps/web/app')).filter(file=>file!==tokenFile)];
const allowed=new Set(['#082653','#061a38','#123b70','#ffbf18','#e5a800','#f4f7fb','#fff','#ffffff','#102747','#667085','#dce3ec']);
const violations=[];
const semantic=new Set(['#147647','#e8f8ef','#92400e','#fffbeb','#b42318','#fff1f2','#1e40af','#eff6ff','#2167d9']);
for(const relative of roots){const source=await fs.readFile(relative,'utf8');for(const match of source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)){if(relative!==tokenFile||(!allowed.has(match[0].toLowerCase())&&!semantic.has(match[0].toLowerCase())))violations.push(`${relative}:${source.slice(0,match.index).split('\n').length} ${match[0]}`)}for(const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*var\(\1\)/gi))violations.push(`${relative}:${source.slice(0,match.index).split('\n').length} self-referencing ${match[1]}`)}
if(violations.length){console.error(`Forbidden brand colors found:\n${violations.join('\n')}`);process.exit(1)}
console.log(`UI color gate passed for ${roots.length} remediated stylesheet(s).`);
