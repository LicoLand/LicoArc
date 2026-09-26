/** Deterministic definition model, not a production crypto/subscription/storage service. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertValidAgainstClosedSchema } from './schema.mjs';
import { canonicalizeRestrictedJson } from './canonical-json.mjs';
const schema = JSON.parse(readFileSync(new URL('../../spec/v1/messaging/capability.schema.json', import.meta.url)));
const pageSchema = JSON.parse(readFileSync(new URL('../../spec/v1/messaging/capability-page.schema.json', import.meta.url)));
const generationSchema = JSON.parse(readFileSync(new URL('../../spec/v1/messaging/capability-generation.schema.json', import.meta.url)));
const syncSchema = JSON.parse(readFileSync(new URL('../../spec/v1/messaging/capability-sync.schema.json', import.meta.url)));
const limits = {maxBytes: 16_777_216, maxDepth: 16, maxArrayItems: 65536, maxObjectMembers: 1024, maxStringBytes: 4096};
const canonical = v => canonicalizeRestrictedJson(v, limits);
const hash = v => createHash('sha256').update(canonical(v), 'utf8').digest('hex');
export class CapabilityError extends TypeError { constructor(code) {super(code);this.code=code;} }
const need = (v,c) => { if (!v) throw new CapabilityError(c); };
export const capabilityKey = r => canonical([r.issuer,r.audience,r.capability.id,r.capability.definition,r.role]);
export const emptyCapabilityState = () => ({records:{}, generations:{}, repairs:{}});
const scope = r => canonical([r.issuer,r.audience]);
function validateRecord(r) {
  assertValidAgainstClosedSchema(r,schema);
  need(Buffer.byteLength(canonical(r))<=4096,'capability-record-bound');
}
function authorize(r, c, state) {
  need(c?.authenticated === true && c.issuerAuthorized === true && c.audienceApproved === true, 'capability-unauthorized');
  need(r.issuer === c.issuer && r.audience === c.audience, 'capability-scope-mismatch');
  need(r.generation === c.generation, 'capability-generation-mismatch');
  const known = state.generations[scope(r)];
  need(known === undefined || known === r.generation, 'capability-generation-transition-required');
}
/** A new generation is an authenticated authority transition, never inferred from a fresh session. */
export function admitCapabilityGeneration(state, transition, c) {
  assertValidAgainstClosedSchema(transition,generationSchema);
  need(c?.authenticated === true && c.issuerAuthorized === true && c.audienceApproved === true &&
    c.generationTransitionValid === true, 'generation-transition-unauthorized');
  need(transition.issuer === c.issuer && transition.audience === c.audience &&
    /^[0-9a-f]{32}$/.test(transition.next) && transition.next !== transition.previous, 'invalid-generation-transition');
  const k=scope(transition);
  if(state.generations[k] === transition.next && state.generationPredecessors?.[k] === transition.previous) return {state,changed:[],repairRequired:false,conversationRebind:false,sessionRestart:false};
  need(state.generations[k] === transition.previous, 'generation-predecessor-mismatch');
  const next=structuredClone(state); next.generations[k]=transition.next; next.generationPredecessors={...(next.generationPredecessors??{}),[k]:transition.previous};
  // Preserve old records as unavailable history until repaired; never mistake their omission for revocation.
  return {state:next,changed:[],repairRequired:true,conversationRebind:false,sessionRestart:false};
}
export function applyCapabilityUpdate(state, record, context) {
  validateRecord(record); authorize(record,context,state);
  const k=capabilityKey(record), old=state.records[k];
  if (old?.generation === record.generation) {
    if (record.revision < old.revision) return {state,status:'stale',changed:[],conversationRebind:false,sessionRestart:false};
    if (record.revision === old.revision) {
      need(canonical(record)===canonical(old),'capability-revision-conflict');
      return {state,status:'duplicate',changed:[],conversationRebind:false,sessionRestart:false};
    }
  }
  const next=structuredClone(state); next.records[k]=structuredClone(record);
  next.generations[scope(record)]=record.generation;
  return {state:next,status:'updated',changed:[k],conversationRebind:false,sessionRestart:false};
}
/** Current projection excludes retired generations; the durable archive is not a capability offer. */
export function currentCapabilityRecords(state, {issuer,audience}) {
  const generation=state.generations[canonical([issuer,audience])];
  return Object.values(state.records).filter(r=>r.issuer===issuer && r.audience===audience && r.generation===generation);
}
export function canInvoke(invokerRecords, providerRecords, capability) {
  const matches=(r,role)=>r.role===role && r.availability==='available' &&
    r.capability.id===capability.id && r.capability.definition===capability.definition;
  return invokerRecords.some(r=>matches(r,'invoke')) && providerRecords.some(r=>matches(r,'provide'));
}
export function capabilitySnapshotPages(records, {issuer,audience,generation}) {
  const ordered=[...records].sort((a,b)=>(capabilityKey(a)<capabilityKey(b)?-1:capabilityKey(a)>capabilityKey(b)?1:0));
  ordered.forEach(validateRecord);
  need(new Set(ordered.map(capabilityKey)).size === ordered.length, 'capability-snapshot-duplicate');
  need(ordered.every(r=>r.issuer===issuer && r.audience===audience && r.generation===generation),'capability-snapshot-scope');
  const snapshot=hash(ordered), count=Math.max(1,Math.ceil(ordered.length/64));
  return Array.from({length:count},(_,index)=>({issuer,audience,generation,snapshot,index,count,records:ordered.slice(index*64,(index+1)*64)}));
}
/** Spool state models durable pages. Quotas are local admission policy, never an expiry timer. */
export function applyCapabilityPage(state,page,context,{quotaBytes=8_388_608}={}) {
  assertValidAgainstClosedSchema(page,pageSchema); authorize(page,context,state);
  need(page.index<page.count,'capability-page-index');
  need(Buffer.byteLength(canonical(page))<=262144,'capability-page-bound');
  need(Number.isSafeInteger(quotaBytes)&&quotaBytes>0,'invalid-spool-quota');
  page.records.forEach(r=>{validateRecord(r);authorize(r,context,state);});
  const k=canonical([page.issuer,page.audience,page.generation,page.snapshot]);
  const old=state.repairs[k];
  need(!old || old.count===page.count,'capability-snapshot-count-conflict');
  const previous=old?.pages[page.index];
  if(previous) {
    need(canonical(previous)===canonical(page),'capability-page-conflict');
    return {state,status:'duplicate',changed:[],complete:false,conversationRebind:false,sessionRestart:false};
  }
  const stored=Object.values(state.repairs).reduce((n,s)=>n+Object.values(s.pages).reduce((m,p)=>m+Buffer.byteLength(canonical(p)),0),0);
  need(stored+Buffer.byteLength(canonical(page))<=quotaBytes,'capability-spool-backpressure');
  const next=structuredClone(state);
  next.repairs[k]??={count:page.count,pages:{}};
  next.repairs[k].pages[page.index]=structuredClone(page);
  if(Object.keys(next.repairs[k].pages).length!==page.count)
    return {state:next,status:'repair-pending',changed:[],complete:false,conversationRebind:false,sessionRestart:false};
  // Iterate only admitted pages, never allocate from the untrusted count.
  const pages=Object.values(next.repairs[k].pages).sort((a,b)=>a.index-b.index);
  need(pages.every((p,i)=>p.index===i && (i===page.count-1 || p.records.length===64)),'capability-page-geometry');
  const records=pages.flatMap(p=>p.records), keys=records.map(capabilityKey);
  need(keys.every((key,i)=>i===0 || keys[i-1]<key),'capability-snapshot-order');
  need(hash(records)===page.snapshot,'capability-snapshot-digest');
  delete next.repairs[k];
  let merged=next;const changed=[];
  for(const r of records) {const result=applyCapabilityUpdate(merged,r,context);merged=result.state;changed.push(...result.changed);}
  return {state:merged,status:'repaired',changed,complete:true,conversationRebind:false,sessionRestart:false};
}

export function validateCapabilitySyncRequest(record,context) {
  assertValidAgainstClosedSchema(record,syncSchema);
  need(context?.authenticated===true && context.audienceApproved===true,'capability-sync-unauthorized');
  need(record.issuer===context.localIssuer && record.audience===context.audience,'capability-sync-scope');
  need(Object.hasOwn(record,'snapshot')===Object.hasOwn(record,'indexes'),'capability-sync-shape');
  if(record.indexes) need(record.indexes.every((n,i)=>i===0||record.indexes[i-1]<n),'capability-sync-order');
  return structuredClone(record);
}
