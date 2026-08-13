import { promises as fs } from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const appRoot=path.join(root,'apps','web','app');
const outputRoot=path.join(root,'docs','ui-audit');
const approved=new Set(['#082653','#061A38','#123B70','#FFBF18','#E5A800','#F4F7FB','#FFFFFF','#102747','#667085','#DCE3EC']);
const semantic=new Set(['#15803D','#047857','#147647','#16804D','#22C55E','#16A34A','#B91C1C','#B42318','#BE123C','#EF4444','#F59E0B','#9A3412','#92400E','#1E40AF','#2167D9','#3B82F6','#60A5FA']);
const roleByPrefix={dashboard:'Authenticated','crm':'CRM permission','sales':'Quotation permission',bookings:'Booking permission',pos:'Booking manage',packages:'Package permission','package-reviews':'Package permission','service-products':'Package permission',operations:'Trip permission',projects:'Project permission',tasks:'Task permission',employees:'Employee permission',vendors:'Vendor permission',finance:'Finance permission',reports:'Owner dashboard permission',content:'Content permission','media-library':'Media permission','asset-knowledge':'Knowledge permission',archives:'Archive permission',settings:'Settings permission','my-trip':'Customer token'};
const publicRoots=new Set(['','articles','contact','promotions','terms','tickets','transportation','trip','sign-in','sign-up','account','erp-sign-in']);

async function files(dir,predicate){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','.next'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(full,predicate));else if(predicate(full))result.push(full)}return result}
function routeFromFile(file){const relative=path.relative(appRoot,path.dirname(file)).replaceAll('\\','/');if(!relative)return '/';return '/'+relative.replace(/\[\.\.\.([^\]]+)\]/g,':$1*').replace(/\[([^\]]+)\]/g,':$1')}
function category(route){const first=route.split('/')[1]??'';if(publicRoots.has(first))return first.startsWith('sign-')||['account','erp-sign-in'].includes(first)?'authentication':'public website';if(first==='my-trip')return 'customer portal';return first||'ERP'}
function apiDeps(source){return [...new Set([...source.matchAll(/api(?:Get|Post|Patch|Delete|Upload)(?:<[^>]+>)?\((?:`|'|")([^`'"]+)/g)].map(match=>match[1].replace(/\?.*/,'')))]}
function stylesFor(source,globalStyles){const local=[...source.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(match=>match[1]);return [...globalStyles,...local]}

const layoutSource=await fs.readFile(path.join(appRoot,'layout.tsx'),'utf8');
const globalStyles=[...layoutSource.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(match=>match[1]);
const pageFiles=await files(appRoot,file=>file.endsWith(`${path.sep}page.tsx`));
const routes=[];
for(const file of pageFiles.sort()){
  const source=await fs.readFile(file,'utf8');const route=routeFromFile(file);const first=route.split('/')[1]??'';
  routes.push({url:route,file:path.relative(root,file).replaceAll('\\','/'),layout:'apps/web/app/layout.tsx + AppShell',stylesheets:stylesFor(source,globalStyles),globalComponents:['RootLayout','AppShell'],role:publicRoots.has(first)?'Public':(roleByPrefix[first]??'Authenticated'),category:category(route),routeStatus:source.length<300?'placeholder':'implemented/verification required',apiDependencies:apiDeps(source),desktopStatus:'pending automated visual audit',mobileStatus:'pending automated visual audit',visualStatus:'pending',screenshotStatus:'pending'});
}

const uiFiles=await files(path.join(root,'apps','web'),file=>/\.(css|scss|sass|less|tsx|ts|svg)$/.test(file));
const colorPattern=/(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|transparent)\b|(?:linear|radial)-gradient\([^;}{]*\))/g;
const colors=new Map();
for(const file of uiFiles){const source=await fs.readFile(file,'utf8');for(const match of source.matchAll(colorPattern)){const raw=match[0];const normalized=raw.startsWith('#')?raw.toUpperCase():raw.toLowerCase();const line=source.slice(0,match.index).split('\n').length;const record=colors.get(normalized)??{value:normalized,count:0,files:new Set(),locations:[],kind:normalized.includes('gradient')?'gradient':normalized.startsWith('#')?'hex':'functional/named'};record.count++;record.files.add(path.relative(root,file).replaceAll('\\','/'));if(record.locations.length<12)record.locations.push(`${path.relative(root,file).replaceAll('\\','/')}:${line}`);colors.set(normalized,record)}}
const inventory=[...colors.values()].map(record=>({...record,files:[...record.files],classification:approved.has(record.value)?'approved token value':semantic.has(record.value)?'semantic exception':'legacy/review required',action:approved.has(record.value)||semantic.has(record.value)?'keep via token':'map or replace'})).sort((a,b)=>b.count-a.count||a.value.localeCompare(b.value));

await fs.mkdir(outputRoot,{recursive:true});
await fs.writeFile(path.join(outputRoot,'route-manifest.json'),JSON.stringify({generatedAt:new Date().toISOString(),routeCount:routes.length,routes},null,2)+'\n');
await fs.writeFile(path.join(outputRoot,'color-inventory.json'),JSON.stringify({generatedAt:new Date().toISOString(),uniqueColorCount:inventory.length,approved:[...approved],semanticAllowlist:[...semantic],colors:inventory},null,2)+'\n');
const summary=`# UI Foundation Audit Index\n\nGenerated mechanically from frontend source.\n\n- Routes: ${routes.length}\n- Stylesheets: ${uiFiles.filter(file=>/\.(css|scss|sass|less)$/.test(file)).length}\n- Unique color/gradient expressions: ${inventory.length}\n- Legacy/review-required expressions: ${inventory.filter(item=>item.classification==='legacy/review required').length}\n\nArtifacts:\n\n- [Route manifest](./route-manifest.json)\n- [Color inventory](./color-inventory.json)\n\nRoute and visual status fields remain pending until browser evidence is recorded. Presence of a page component is not proof of completion.\n`;
await fs.writeFile(path.join(outputRoot,'README.md'),summary);
console.log(JSON.stringify({routeCount:routes.length,uniqueColors:inventory.length,legacyColors:inventory.filter(item=>item.classification==='legacy/review required').length},null,2));
