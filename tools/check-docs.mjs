import { readFileSync, lstatSync } from 'node:fs';
import { resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateCatalogue(catalogue, root) {
  if(catalogue.format !== 'licoarc.documentation-catalog.v1') throw Error('unknown documentation catalogue');
  const generated = new Set(['reference/status.md','reference/sources.md','reference/license.md']);
  if(JSON.stringify([...catalogue.generated].sort()) !== JSON.stringify([...generated].sort())) throw Error('unknown generated page');
  const paths=[];
  const walk=(items)=>{
    if(!Array.isArray(items)) throw Error('navigation must be an array');
    for(const item of items){
      if(!item || typeof item!=='object' || Object.keys(item).length!==1) throw Error('one title per entry');
      const [title,value]=Object.entries(item)[0];
      if(!title.trim()) throw Error('empty title');
      if(Array.isArray(value)) walk(value);
      else {
        if(typeof value!=='string' || !value.endsWith('.md') || value.startsWith('/') || value.includes('\\') || posix.normalize(value)!==value || value.split('/').some(x=>x==='..'||x.startsWith('.'))) throw Error('unsafe documentation path');
        if(paths.includes(value)) throw Error('duplicate documentation path');
        if(!generated.has(value) && !lstatSync(resolve(root,value)).isFile()) throw Error('missing source');
        paths.push(value);
      }
    }
  };
  walk(catalogue.navigation);
  for(const [route,source] of Object.entries(catalogue.redirects)){
    if(!/^\/[a-z0-9/-]+\/$/.test(route) || route.includes('//') || !paths.includes(source)) throw Error('invalid legacy redirect');
  }
  return paths;
}
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const paths=validateCatalogue(JSON.parse(readFileSync(resolve(root,'docs/catalog.json'),'utf8')),root);
  console.log(`Documentation catalogue: ${paths.length} navigation targets, source paths and redirects valid.`);
}
