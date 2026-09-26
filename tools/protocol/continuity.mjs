/** Executable lifecycle definition. Synthetic auth/persistence inputs are not a production SDK. */
export class ContinuityError extends TypeError {constructor(code){super(code);this.code=code;}}
const need=(v,c)=>{if(!v)throw new ContinuityError(c);};
const copy=structuredClone;
const id=v=>typeof v==='string' && /^[0-9a-f]{32}$/.test(v);
const digest=v=>typeof v==='string' && /^[0-9a-f]{64}$/.test(v);
export const emptyDurableMailbox=()=>({items:{},settled:{},claims:{}});
/** No custody acknowledgment is emitted before a successful modeled durable commit. */
export function storeDurableItem(state,item,{authorized=false,durableCommit=false,quotaBytes=67_108_864}={}) {
  need(authorized,'custody-unauthorized');need(id(item?.id)&&digest(item.digest),'invalid-custody-record');
  need(Number.isSafeInteger(item.bytes)&&item.bytes>0,'invalid-custody-size');
  need(Number.isSafeInteger(quotaBytes)&&quotaBytes>0,'invalid-custody-quota');
  const old=state.items[item.id]??state.settled[item.id];
  if(old){need(old.digest===item.digest,'custody-identity-conflict');return {state,status:'duplicate',acknowledged:true};}
  const used=Object.values(state.items).reduce((n,v)=>n+v.bytes,0);
  if(used+item.bytes>quotaBytes)return {state,status:'backpressure',acknowledged:false};
  if(!durableCommit)return {state,status:'persistence-pending',acknowledged:false};
  const next=copy(state);next.items[item.id]={id:item.id,digest:item.digest,bytes:item.bytes};
  return {state:next,status:'stored',acknowledged:true};
}
export function claimDurableItem(state,itemId,{claimId,now,leaseSeconds=300,authorized=false,durableCommit=false}) {
  need(authorized&&durableCommit,'claim-not-committed');need(id(claimId),'invalid-claim-id');
  need(Number.isSafeInteger(now)&&now>=0 && Number.isSafeInteger(leaseSeconds)&&leaseSeconds>0,'invalid-claim-time');
  need(Number.isSafeInteger(now+leaseSeconds),'claim-time-overflow');
  need(Object.hasOwn(state.items,itemId),'unknown-custody-item');
  const previous=state.claims[itemId];
  need(!previous || previous.until<=now || previous.id===claimId,'claim-busy');
  if(previous?.id===claimId)return {state,status:'duplicate'};
  const next=copy(state);next.claims[itemId]={id:claimId,until:now+leaseSeconds};
  return {state:next,status:'claimed'};
}
export function releaseExpiredClaims(state,now) {
  need(Number.isSafeInteger(now)&&now>=0,'invalid-claim-time');
  const next=copy(state);
  for(const [key,claim] of Object.entries(next.claims))if(claim.until<=now)delete next.claims[key];
  // The bytes remain in custody regardless of time spent offline.
  return next;
}
export function settleDurableItem(state,itemId,{authorized=false,endpointStored=false,explicitDeletion=false,durableCommit=false}={}) {
  need(authorized && (endpointStored || explicitDeletion),'settlement-unauthorized');
  need(durableCommit,'settlement-not-committed');
  if(state.settled[itemId])return {state,status:'duplicate'};
  const item=state.items[itemId];need(item,'unknown-custody-item');
  const next=copy(state);next.settled[itemId]={id:item.id,digest:item.digest};delete next.items[itemId];delete next.claims[itemId];
  return {state:next,status:'settled'};
}
export function advanceDelivery(work,event,{durableCommit=true}={}) {
  need(id(work?.messageId)&&digest(work.intentDigest),'invalid-work-identity');
  need(durableCommit,'work-not-committed');
  const next=copy(work);
  switch(event.type){
    case 'attempt-timeout':case 'budget-exhausted':case 'offline':
      next.delivery=event.type==='budget-exhausted'?'paused-resource':'waiting';break;
    case 'resume':case 'route-change':
      next.delivery='pending';break;
    case 'cancel-request':next.cancelRequested=true;break;
    case 'explicit-delete':need(event.userAuthorized===true,'delete-unauthorized');next.deleted=true;break;
    default:throw new ContinuityError('unknown-delivery-event');
  }
  return next; // elapsed time is deliberately absent from the logical-work transition rule
}
export const emptyExecutorState=()=>({tasks:{}});
const taskKey=r=>JSON.stringify([r.origin,r.conversation,r.taskId]);
export function admitExecution(state,request,context) {
  need(digest(request?.origin)&&id(request.conversation)&&id(request.taskId)&&digest(request.intentDigest),'invalid-execution-request');
  need(context?.authenticated===true,'request-unauthenticated');
  const k=taskKey(request),old=state.tasks[k];
  if(old){need(old.intentDigest===request.intentDigest,'task-identity-conflict');return {state,status:old.status,execute:false};}
  need(context.executionApproved===true && context.target===request.target && digest(request.target),'execution-unauthorized');
  need(context.durableCommit===true,'execution-not-committed');
  const next=copy(state);next.tasks[k]={...copy(request),status:'running',cancelRequested:false};
  return {state:next,status:'running',execute:true};
}
export function recordExecutionEvent(state,request,event,context) {
  need(context?.authenticated===true && context.expectedTarget===context.sender,'execution-evidence-unauthorized');
  const k=taskKey(request),old=state.tasks[k];need(old&&old.intentDigest===request.intentDigest,'unknown-execution');
  need(context.sender===old.target,'wrong-executor');need(context.durableCommit===true,'execution-not-committed');
  const next=copy(state),task=next.tasks[k];
  switch(event.type){
    case 'cancel-request':task.cancelRequested=true;break;
    case 'lost-result':if(task.status==='running')task.status='outcome-unknown';break;
    case 'completed':
      need(digest(event.resultDigest),'invalid-result-digest');
      if(task.resultDigest && task.resultDigest!==event.resultDigest)task.status='evidence-conflict';
      else {task.resultDigest=event.resultDigest;if(task.status!=='evidence-conflict')task.status='completed';}
      break;
    case 'cancel-confirmed':
      // A completion that crossed a cancellation remains an observed fact.
      task.cancelConfirmed=true;if(!['completed','evidence-conflict'].includes(task.status))task.status='cancelled';break;
    default:throw new ContinuityError('unknown-execution-event');
  }
  return {state:next,status:task.status,execute:false};
}
/** Authentication/active inventory replace calendar validity; no timer bypasses revocation. */
export function admitAsynchronousPrekey({identityAuthorized,activePair,alreadyConsumed,signaturesValid}) {
  need(identityAuthorized===true && signaturesValid===true,'prekey-unauthorized');
  need(activePair===true && alreadyConsumed===false,'prekey-unavailable');return {admitted:true};
}
/** A cryptographic bound failure holds ciphertext; it never authenticates or releases plaintext. */
export function classifyDeferredReceive({authenticated=false,missingPredecessor=false,skipBound=false,capacity=false}) {
  if(missingPredecessor || skipBound)return {disposition:'recovery-pending',releasePlaintext:false,discardAcceptedCustody:false};
  if(!capacity)return {disposition:'backpressure',releasePlaintext:false,discardAcceptedCustody:false};
  return {disposition:authenticated?'ready':'invalid',releasePlaintext:authenticated,discardAcceptedCustody:false};
}

/** Adapter readiness is not delivery evidence. Safety/recipient are invariant across transport choice. */
export function selectApprovedCarrier(intent,candidates) {
  need(digest(intent?.recipient) && digest(intent.profileId),'invalid-carrier-intent');
  need(Array.isArray(candidates),'invalid-carrier-list');
  const selected=candidates.find(c=>c.approved===true && c.available===true &&
    c.recipient===intent.recipient && c.profileId===intent.profileId &&
    c.durableDelivery===true && typeof c.adapter==='string');
  return selected?{status:'ready',adapter:selected.adapter,intentUnchanged:true,delivered:false}:
    {status:'waiting-path',adapter:null,intentUnchanged:true,delivered:false};
}
