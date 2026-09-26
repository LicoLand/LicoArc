/** Recompute source joins and content identities, never proof results or test expectations. */
import {createHash} from 'node:crypto';
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {computeProtectionProfileId,computeProtocolLineId} from './protocol/identity.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=async p=>JSON.parse(await readFile(root+p,'utf8'));
const write=async(p,o)=>writeFile(root+p,JSON.stringify(o,null,2)+'\n');
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
const value=async p=>p.endsWith('.json')?json(p):readFile(root+p,'utf8');
async function walk(p){const out=[];for(const name of (await readdir(root+p)).sort()){
 const rel=p+'/'+name,st=await lstat(root+rel);if(st.isSymbolicLink())throw Error('symlink in sources');
 if(st.isDirectory())out.push(...await walk(rel));else if(st.isFile())out.push(rel);else throw Error('not regular');
}return out.sort();}
const manifest=await json('spec/v1/manifest.json');
const conformance=await json('conformance/v1/manifest.json');
const profiles=await json('spec/protection-profiles.json'),lines=await json('spec/protocol-lines.json');
const profile=await json('spec/v1/protection/profile.json'),semanticSources={};
for(const [role,p]of Object.entries(profile.semanticSources))if(role!=='authorityVectors')semanticSources[role]=p.endsWith('.json')?await json(p):new Uint8Array(await readFile(root+p));
const profileId=computeProtectionProfileId({profile,semanticSources,stableClaimIds:profiles.profiles[0].requiredClaimIds,stableNonClaimIds:profiles.profiles[0].stableNonClaimIds});
profile.contentIdentity=profileId;profiles.profiles[0].profileId=profileId;
profiles.activeProfileIds=profiles.profiles[0].sessionEligible?[profileId]:[];
manifest.protectionProfileIds=[profileId];lines.lines[0].protectionProfileIds=[profileId];
await write('spec/v1/protection/profile.json',profile);await write('spec/protection-profiles.json',profiles);
// Close each component root before hashing. The source manifest excludes itself.
const entries=[...manifest.capabilities,{definitionId:'security-accounting',sourceManifestPath:'spec/v1/security/source-manifest.json'}];
for(const entry of entries){const p=entry.sourceManifestPath,sm=await json(p);
 sm.sources=(await Promise.all(sm.sourceRoots.map(walk))).flat().filter(x=>x!==p).sort();await write(p,sm);
 if(entry.capabilityId){
  const paths=sm.sources.filter(x=>x.startsWith('spec/')&&!x.endsWith('source-manifest.json'));
  entry.semanticIdentity=entry.capabilityId==='licoarc.pairwise-protection.v1'?profileId:
   sha(Buffer.from(canonical(await Promise.all(paths.map(async path=>({path,source:await value(path)}))))));
 }
}
const lineId=computeProtocolLineId({generation:1,mandatoryCapabilitySemanticIdentities:lines.lines[0].mandatoryCapabilities.map(id=>manifest.capabilities.find(c=>c.capabilityId===id).semanticIdentity),protectionProfileIds:[profileId],stableClaimIds:lines.lines[0].stableClaimIds,sessionRules:{handshakeBinding:manifest.handshakeBinding,sessionLock:manifest.sessionLock,translationPolicy:manifest.translationPolicy}});
lines.lines[0].protocolLineId=lineId;manifest.protocolLineId=lineId;conformance.protocolLineId=lineId;
await write('spec/protocol-lines.json',lines);
const interop=await json('spec/interop/v1/manifest.json');interop.paths['licoarc-enhanced'].nativeProtocolLineId=lineId;await write('spec/interop/v1/manifest.json',interop);
const fb=await json('spec/v1/security/formal-bindings.json');
const semanticHash=createHash('sha256');
for(const path of fb.semanticSources){const bytes=await readFile(root+path);semanticHash.update(`${path}\0${bytes.length}\0`);semanticHash.update(bytes);}
fb.semanticSourceDigest=semanticHash.digest('hex');await write('spec/v1/security/formal-bindings.json',fb);
// Updating source context copies is not updating case inputs or expected outcomes.
for(const corpus of conformance.capabilityCorpora.concat(conformance.definitionCorpora)){
 const cm=await json(corpus.manifestPath),p=cm.envelopePaths?.[0] ?? corpus.manifestPath.replace(/manifest\.json$/,'cases.json');
 const envelope=await json(p);
 for(const c of envelope.cases){
  for(const b of c.context.sourceBindings)b.sha256=sha(await readFile(root+b.sourcePath));
  for(const d of [...c.context.catalogs,...c.context.publicMaterial])d.value=await value(d.sourcePath);
 }
 await write(p,envelope);
 if(corpus.capabilityId==='licoarc.pairwise-protection.v1')corpus.protectionProfileIds=[profileId];
}
for(const entry of entries){
 const sm=await json(entry.sourceManifestPath),paths=[...new Set([entry.sourceManifestPath,...sm.sources,...(sm.additionalSources??[])])].sort();
 const digest=sha(Buffer.from(canonical(await Promise.all(paths.map(async path=>({path,source:await value(path)}))))));
 if(entry.capabilityId)entry.sourceDigest=digest;
 const target=[...conformance.capabilityCorpora,...conformance.definitionCorpora].find(c=>entry.capabilityId?c.capabilityId===entry.capabilityId:c.definitionId===entry.definitionId);
 target.sourceDigest=digest;
}
manifest.fieldRegistry.sourceDigest=sha(await readFile(root+manifest.fieldRegistry.path));
await write('spec/v1/manifest.json',manifest);await write('conformance/v1/manifest.json',conformance);
const closure=await json('spec/interop/v1/source-manifest.json');closure.sources=(await Promise.all(closure.sourceRoots.map(walk))).flat().sort();
await write('spec/interop/v1/source-manifest.json',closure);
console.log(JSON.stringify({lineId,profileId,proofAdmission:lines.lines[0].sessionEligible?'eligible':'requalification-required'}));
