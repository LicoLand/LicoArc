import test from 'node:test';import assert from 'node:assert/strict';
import {emptyDurableMailbox,storeDurableItem,claimDurableItem,releaseExpiredClaims,settleDurableItem,advanceDelivery,emptyExecutorState,admitExecution,recordExecutionEvent,admitAsynchronousPrekey,classifyDeferredReceive} from '../tools/protocol/continuity.mjs';
import {classifyGroupHistory,acceptGroupResolutionVote} from '../tools/protocol/group-continuity.mjs';
import {readFileSync} from 'node:fs';
const h=n=>n.toString(16).padStart(64,'0'),id=n=>n.toString(16).padStart(32,'0'),err=c=>e=>e.code===c;
const item={id:id(1),digest:h(2),bytes:123},custody={authorized:true,durableCommit:true};
const request={origin:h(1),conversation:id(2),taskId:id(3),intentDigest:h(4),target:h(5)};
const action={authenticated:true,executionApproved:true,target:h(5),durableCommit:true};
const evidence={authenticated:true,sender:h(5),expectedTarget:h(5),durableCommit:true};

test('no delivery, attachment or pairing TTL remains in the authoritative bounds',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
 const transport=read('spec/v1/transport/bounds.json'),messages=read('spec/v1/messaging/bounds.json'),interop=read('spec/interop/v1/manifest.json'),protection=read('spec/v1/protection/bounds.json');
 assert.equal(transport.bounds.STORAGE_WINDOW_SECONDS,undefined);assert.equal(messages.bounds.ATTACHMENT_RECOVERY_WINDOW,undefined);
 assert.equal(interop.bounds.PAIRING_WINDOW_SECONDS,undefined);assert.equal(interop.bounds.ASSEMBLY_WINDOW_SECONDS,undefined);
 assert.equal(protection.bounds.MAX_BUNDLE_VALIDITY_SPAN_SECONDS,undefined);
 assert.equal(interop.routing.capabilityUpdateRebind,false);
});
test('device custody is acknowledged only after the durable commit',()=>{
 const state=emptyDurableMailbox();const before=storeDurableItem(state,item,{authorized:true});
 assert.equal(before.acknowledged,false);assert.deepEqual(state,emptyDurableMailbox());
 assert.equal(storeDurableItem(state,item,custody).acknowledged,true);
});
test('quota exhaustion refuses new custody without deleting an existing item',()=>{
 const state=storeDurableItem(emptyDurableMailbox(),item,custody).state;
 const denied=storeDurableItem(state,{...item,id:id(9)}, {...custody,quotaBytes:item.bytes});
 assert.equal(denied.status,'backpressure');assert.strictEqual(denied.state,state);assert.equal(denied.acknowledged,false);
});
test('a month or a year offline expires a claim, never the item it leased',()=>{
 for(const days of [1,30,365,3650]){
  let state=storeDurableItem(emptyDurableMailbox(),item,custody).state;
  state=claimDurableItem(state,item.id,{...custody,claimId:id(3),now:0}).state;
  state=JSON.parse(JSON.stringify(state));state=releaseExpiredClaims(state,days*86400);
  assert.deepEqual(state.items[item.id],item);assert.equal(Object.keys(state.claims).length,0);
  assert.equal(claimDurableItem(state,item.id,{...custody,claimId:id(4),now:days*86400}).status,'claimed');
 }
});
test('fetch and station hints alone never settle custody',()=>{
 const state=storeDurableItem(emptyDurableMailbox(),item,custody).state;
 assert.throws(()=>settleDurableItem(state,item.id,{...custody,stationOK:true}),err('settlement-unauthorized'));
 const settled=settleDurableItem(state,item.id,{...custody,endpointStored:true});
 assert.equal(Object.keys(settled.state.items).length,0);
 assert.equal(storeDurableItem(settled.state,item,custody).status,'duplicate');
 assert.throws(()=>storeDurableItem(settled.state,{...item,digest:h(7)},custody),err('custody-identity-conflict'));
});
test('1000 exhausted retry turns and route changes retain the same logical intent',()=>{
 const original={messageId:id(1),intentDigest:h(2),delivery:'pending',payload:'protected-application'};let work=original;
 for(let i=0;i<1000;i++){work=advanceDelivery(work,{type:'budget-exhausted'});work=advanceDelivery(work,{type:'route-change'});}
 assert.equal(work.messageId,original.messageId);assert.equal(work.intentDigest,original.intentDigest);assert.equal(work.payload,original.payload);assert.equal(work.delivery,'pending');
});
test('cancellation is an intention; a transport timeout does not become an effect failure',()=>{
 let work={messageId:id(1),intentDigest:h(2),effect:'outcome-unknown'};
 work=advanceDelivery(work,{type:'cancel-request'});work=advanceDelivery(work,{type:'attempt-timeout'});
 assert.equal(work.cancelRequested,true);assert.equal(work.effect,'outcome-unknown');assert.equal(work.delivery,'waiting');
});
test('requests can be stored before approval, but execution requires an authorized atomic admission',()=>{
 assert.equal(storeDurableItem(emptyDurableMailbox(),item,custody).status,'stored');
 assert.throws(()=>admitExecution(emptyExecutorState(),request,{...action,executionApproved:false}),err('execution-unauthorized'));
 assert.throws(()=>admitExecution(emptyExecutorState(),request,{...action,durableCommit:false}),err('execution-not-committed'));
 assert.equal(admitExecution(emptyExecutorState(),request,action).execute,true);
});
test('two deliveries to one executor never start the same work twice',()=>{
 const first=admitExecution(emptyExecutorState(),request,action);
 assert.equal(admitExecution(first.state,request,action).execute,false);
 assert.throws(()=>admitExecution(first.state,{...request,intentDigest:h(8)},action),err('task-identity-conflict'));
 assert.throws(()=>admitExecution(emptyExecutorState(),request,{...action,target:h(6)}),err('execution-unauthorized'));
});
test('crash-after-effect is unknown and is not permission to automatically rerun',()=>{
 const first=admitExecution(emptyExecutorState(),request,action);
 const lost=recordExecutionEvent(first.state,request,{type:'lost-result'},evidence);
 const restored=JSON.parse(JSON.stringify(lost.state));const retry=admitExecution(restored,request,action);
 assert.equal(retry.status,'outcome-unknown');assert.equal(retry.execute,false);
});
test('cancel/complete race preserves both the request to stop and the actual result',()=>{
 let state=admitExecution(emptyExecutorState(),request,action).state;
 state=recordExecutionEvent(state,request,{type:'cancel-request'},evidence).state;
 state=recordExecutionEvent(state,request,{type:'cancel-confirmed'},evidence).state;
 const end=recordExecutionEvent(state,request,{type:'completed',resultDigest:h(9)},evidence);
 const task=Object.values(end.state.tasks)[0];assert.equal(task.cancelRequested,true);assert.equal(task.resultDigest,h(9));assert.equal(end.execute,false);
});
test('active prekeys are admitted after long delay but revocation and reuse still reject',()=>{
 assert.equal(admitAsynchronousPrekey({identityAuthorized:true,activePair:true,alreadyConsumed:false,signaturesValid:true,daysOffline:365}).admitted,true);
 assert.throws(()=>admitAsynchronousPrekey({identityAuthorized:false,activePair:true,alreadyConsumed:false,signaturesValid:true}));
 assert.throws(()=>admitAsynchronousPrekey({identityAuthorized:true,activePair:true,alreadyConsumed:true,signaturesValid:true}));
});
test('ratchet skip or ancestry gaps defer recovery without releasing unauthenticated plaintext',()=>{
 for(const patch of [{skipBound:true},{missingPredecessor:true}])assert.deepEqual(classifyDeferredReceive(patch),{disposition:'recovery-pending',releasePlaintext:false,discardAcceptedCustody:false});
});
test('historical group content can survive a membership change without reviving execution authority',()=>{
 assert.deepEqual(classifyGroupHistory({authenticated:true,lineageKnown:true,senderAuthorizedThen:true,senderAuthorizedNow:false,effectRequested:true}),{disposition:'historical',execute:false});
 assert.equal(classifyGroupHistory({authenticated:true,lineageKnown:false}).disposition,'catch-up-pending');
});
test('group fork resolution requires all exact base authorities; timeout and relay votes have no power',()=>{
 const record={group:id(1),base:h(2),forks:[h(3),h(4)],proposal:h(5)};
 const c={authenticated:true,statesValidated:true,group:id(1),base:h(2),proposedStateDigest:h(5),proposedPredecessor:h(2),baseEpoch:3,proposedEpoch:4,baseAuthorities:[h(6),h(7)],sender:h(6)};
 const a=acceptGroupResolutionVote({},record,c);assert.equal(a.status,'waiting-authorities');
 assert.equal(acceptGroupResolutionVote(a.state,record,c).status,'waiting-authorities');
 assert.throws(()=>acceptGroupResolutionVote(a.state,record,{...c,sender:h(9)}),err('resolution-authority-required'));
 const b=acceptGroupResolutionVote(JSON.parse(JSON.stringify(a.state)),record,{...c,sender:h(7),daysOffline:365});
 assert.equal(b.status,'resolved');assert.equal(b.expired,false);
});

test('Nostr is optional: an equivalent authorized native adapter preserves the same work', async()=>{
 const {selectApprovedCarrier}=await import('../tools/protocol/continuity.mjs');
 const intent={recipient:'1'.repeat(64),profileId:'2'.repeat(64)},base={...intent,approved:true,durableDelivery:true,available:true};
 assert.deepEqual(selectApprovedCarrier(intent,[{...base,adapter:'nostr',available:false},{...base,adapter:'native-https'}]),{status:'ready',adapter:'native-https',intentUnchanged:true,delivered:false});
 for(const modified of [{approved:false},{recipient:'3'.repeat(64)},{profileId:'4'.repeat(64)},{durableDelivery:false}])
  assert.equal(selectApprovedCarrier(intent,[{...base,adapter:'other',...modified}]).status,'waiting-path');
 assert.equal(selectApprovedCarrier(intent,[]).status,'waiting-path');
});
test('historical group authorization alone never grants execution',()=>{
 assert.equal(classifyGroupHistory({authenticated:true,lineageKnown:true,senderAuthorizedThen:true,senderAuthorizedNow:true,effectRequested:true}).execute,false);
});

test('new prekey and first-packet byte bounds are exact after removing calendar fields',async()=>{
 const {encodeDeterministicCbor}=await import('../tools/protocol/index.mjs');
 const labels=JSON.parse(readFileSync(new URL('../spec/v1/protection/labels.json',import.meta.url)));
 const bounds=JSON.parse(readFileSync(new URL('../spec/v1/protection/bounds.json',import.meta.url))).bounds;
 const maximal=fields=>Object.fromEntries(fields.map(f=>[f.label,f.type==='uint53'?Number.MAX_SAFE_INTEGER:f.type==='PrekeyBundle'?maximal(labels.prekeyBundle):new Uint8Array(f.type==='DIGEST256'?32:Number(f.type.replace('bstr','')))]));
 assert.equal(encodeDeterministicCbor(maximal(labels.prekeyBundle)).length,bounds.MAX_PREKEY_BUNDLE_BYTES);
 assert.equal(encodeDeterministicCbor(maximal(labels.firstPacket)).length,bounds.MAX_FIRST_PACKET_BYTES);
 assert.equal(labels.prekeyBundle.some(f=>[8,9].includes(f.label)),false);
});
test('execution conflict evidence cannot be cleared by a duplicate completion or cancellation',()=>{
 let state=admitExecution(emptyExecutorState(),request,action).state;
 for(const value of [h(10),h(11),h(10)])state=recordExecutionEvent(state,request,{type:'completed',resultDigest:value},evidence).state;
 assert.equal(Object.values(state.tasks)[0].status,'evidence-conflict');
 state=recordExecutionEvent(state,request,{type:'cancel-confirmed'},evidence).state;
 assert.equal(Object.values(state.tasks)[0].status,'evidence-conflict');
 assert.equal(admitExecution(state,request,action).execute,false);
});
