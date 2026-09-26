/** Group continuity definition reducer; cryptographic and ancestry checks are caller preconditions. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { assertValidAgainstClosedSchema } from './schema.mjs';
import { canonicalizeRestrictedJson } from './canonical-json.mjs';
const schema=JSON.parse(readFileSync(new URL('../../spec/v1/group/resolution.schema.json',import.meta.url)));
const canonical=v=>canonicalizeRestrictedJson(v);
export class GroupContinuityError extends TypeError{constructor(code){super(code);this.code=code;}}
const need=(v,c)=>{if(!v)throw new GroupContinuityError(c);};
export function classifyGroupHistory({authenticated,lineageKnown,senderAuthorizedThen,senderAuthorizedNow,effectRequested,executionApproved=false}){
  need(authenticated===true,'history-unauthenticated');
  if(!lineageKnown)return {disposition:'catch-up-pending',execute:false};
  need(senderAuthorizedThen===true,'historical-sender-unauthorized');
  return {disposition:senderAuthorizedNow?'current':'historical',execute:effectRequested===true&&senderAuthorizedNow===true&&executionApproved===true};
}
export function acceptGroupResolutionVote(state,record,context){
  assertValidAgainstClosedSchema(record,schema);
  need(context?.authenticated===true && context.statesValidated===true,'resolution-unverified');
  need(record.group===context.group&&record.base===context.base,'resolution-scope-mismatch');
  need(record.forks.every((v,i)=>i===0||record.forks[i-1]<v),'resolution-forks-noncanonical');
  need(context.proposedStateDigest===record.proposal && context.proposedPredecessor===record.base &&
    context.proposedEpoch===context.baseEpoch+1,'resolution-state-mismatch');
  need(Array.isArray(context.baseAuthorities)&&context.baseAuthorities.length>0 &&
    new Set(context.baseAuthorities).size===context.baseAuthorities.length &&
    context.baseAuthorities.includes(context.sender),'resolution-authority-required');
  const authorities=[...context.baseAuthorities].sort();
  need(!state.authorities || canonical(state.authorities)===canonical(authorities),'resolution-authority-set-mismatch');
  const key=createHash('sha256').update('LICOARC-GROUP-RESOLUTION-V1\0').update(canonical(record)).digest('hex');
  need(!state.group || (state.group===record.group && state.base===record.base),'resolution-state-scope');
  need(!state.proposal || state.proposal===key,'resolution-proposal-conflict');
  const next={authorities,group:record.group,base:record.base,proposal:key,record:structuredClone(record),votes:[...new Set([...(state.votes??[]),context.sender])].sort()};
  const complete=context.baseAuthorities.every(v=>next.votes.includes(v));
  return {state:next,status:complete?'resolved':'waiting-authorities',resolvedState:complete?record.proposal:null,expired:false};
}
