import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCapabilityState,applyCapabilityUpdate,canInvoke,capabilitySnapshotPages,applyCapabilityPage,admitCapabilityGeneration,capabilityKey} from '../tools/protocol/capabilities.mjs';
const h=n=>n.toString(16).padStart(64,'0'), id=n=>n.toString(16).padStart(32,'0');
const ctx={authenticated:true,issuerAuthorized:true,audienceApproved:true,issuer:h(1),audience:id(2),generation:id(3)};
const record=(n=0,revision=1,extra={})=>({issuer:ctx.issuer,audience:ctx.audience,generation:ctx.generation,revision,capability:{id:`org.example.tool${n}`,definition:h(4)},role:'provide',availability:'available',...extra});
const error=c=>e=>e.code===c;

test('tool updates propagate incrementally without changing a conversation or session',()=>{
 let state=emptyCapabilityState();
 for(let revision=1;revision<=300;revision++){
  const out=applyCapabilityUpdate(state,record(0,revision,{availability:revision%2?'available':'unavailable'}),ctx);
  assert.equal(out.sessionRestart,false);assert.equal(out.conversationRebind,false);assert.equal(out.changed.length,1);state=out.state;
 }
 assert.equal(Object.keys(state.records).length,1);
});
test('capability removal cannot be undone by late older advertisements',()=>{
 const removed=applyCapabilityUpdate(emptyCapabilityState(),record(0,5,{availability:'removed'}),ctx).state;
 const late=applyCapabilityUpdate(removed,record(0,2),ctx);assert.equal(late.status,'stale');assert.strictEqual(late.state,removed);
 assert.equal(Object.values(late.state.records)[0].availability,'removed');
});
test('equal revision conflicts reject without changing the last accepted state',()=>{
 const state=applyCapabilityUpdate(emptyCapabilityState(),record(),ctx).state,before=structuredClone(state);
 assert.throws(()=>applyCapabilityUpdate(state,record(0,1,{availability:'removed'}),ctx),error('capability-revision-conflict'));
 assert.deepEqual(state,before);assert.equal(applyCapabilityUpdate(state,record(),ctx).status,'duplicate');
});
test('a complete newer per-key record can repair a missing intermediate update',()=>{
 const state=applyCapabilityUpdate(emptyCapabilityState(),record(),ctx).state;
 assert.equal(applyCapabilityUpdate(state,record(0,100),ctx).status,'updated');
});
test('invokers need the interface, not the providing tool implementation',()=>{
 const invoke=record(0,1,{role:'invoke'}),provide=record();
 assert.equal(canInvoke([invoke],[provide],provide.capability),true);
 assert.equal(canInvoke([provide],[provide],provide.capability),false);
 assert.equal(canInvoke([invoke],[{...provide,availability:'removed'}],provide.capability),false);
});
test('capability scope, owner, authority and generation are not inferred from a network path',()=>{
 for(const patch of [{authenticated:false},{issuerAuthorized:false},{audienceApproved:false},{issuer:h(9)},{audience:id(9)},{generation:id(9)}])
  assert.throws(()=>applyCapabilityUpdate(emptyCapabilityState(),record(),{...ctx,...patch}));
 assert.throws(()=>applyCapabilityUpdate(emptyCapabilityState(),{...record(),credential:'secret'},ctx));
});
test('paged repair supports more than 64 total tools and out-of-order pages',()=>{
 const pages=capabilitySnapshotPages(Array.from({length:145},(_,i)=>record(i)),ctx);assert.equal(pages.length,3);
 let state=emptyCapabilityState();
 for(const p of [...pages].reverse())state=applyCapabilityPage(state,p,ctx).state;
 assert.equal(Object.keys(state.records).length,145);assert.equal(Object.keys(state.repairs).length,0);
});
test('partial snapshot is never shown as a complete list or treated as deletion',()=>{
 let state=applyCapabilityUpdate(emptyCapabilityState(),record(999),ctx).state;
 const pages=capabilitySnapshotPages(Array.from({length:65},(_,i)=>record(i)),ctx);
 const result=applyCapabilityPage(state,pages[1],ctx);assert.equal(result.complete,false);
 assert.equal(Object.keys(result.state.records).length,1);
 state=applyCapabilityPage(result.state,pages[0],ctx).state;
 assert.equal(Object.keys(state.records).length,66); // omission is not deletion
});
test('a live update during repair wins over the older snapshot for that same key',()=>{
 const pages=capabilitySnapshotPages(Array.from({length:65},(_,i)=>record(i)),ctx);
 let state=applyCapabilityPage(emptyCapabilityState(),pages[1],ctx).state;
 state=applyCapabilityUpdate(state,record(0,9,{availability:'removed'}),ctx).state;
 state=applyCapabilityPage(state,pages[0],ctx).state;
 assert.equal(state.records[capabilityKey(record())].availability,'removed');
});
test('snapshot corruption, page conflicts, excessive claims and quotas never mutate accepted state',()=>{
 const pages=capabilitySnapshotPages(Array.from({length:65},(_,i)=>record(i)),ctx);
 let state=applyCapabilityPage(emptyCapabilityState(),pages[0],ctx).state,before=structuredClone(state);
 assert.throws(()=>applyCapabilityPage(state,{...pages[0],records:pages[0].records.slice(1)},ctx),error('capability-page-conflict'));
 assert.throws(()=>applyCapabilityPage(state,{...pages[1],records:[{...pages[1].records[0],revision:5}]},ctx),error('capability-snapshot-digest'));
 assert.throws(()=>applyCapabilityPage(state,pages[1],ctx,{quotaBytes:1}),error('capability-spool-backpressure'));
 assert.deepEqual(state,before);
});
test('new issuer generation requires continuity, not a new conversation binding',()=>{
 const state=applyCapabilityUpdate(emptyCapabilityState(),record(),ctx).state;
 assert.throws(()=>applyCapabilityUpdate(state,record(0,1,{generation:id(4)}),{...ctx,generation:id(4)}),error('capability-generation-transition-required'));
 const switched=admitCapabilityGeneration(state,{issuer:ctx.issuer,audience:ctx.audience,previous:id(3),next:id(4)},{...ctx,generationTransitionValid:true});
 assert.equal(switched.conversationRebind,false);
 assert.equal(applyCapabilityUpdate(switched.state,record(0,1,{generation:id(4)}),{...ctx,generation:id(4)}).status,'updated');
 assert.throws(()=>applyCapabilityUpdate(switched.state,record(),ctx),error('capability-generation-transition-required'));
});
test('offline repair state survives a serialize/restore boundary',()=>{
 const pages=capabilitySnapshotPages(Array.from({length:65},(_,i)=>record(i)),ctx);
 const state=applyCapabilityPage(emptyCapabilityState(),pages[0],ctx).state;
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(applyCapabilityPage(restored,pages[1],ctx).complete,true);
});

test('generation change immediately retires old offers without rebuilding any session',async()=>{
 const {currentCapabilityRecords}=await import('../tools/protocol/capabilities.mjs');
 const state=applyCapabilityUpdate(emptyCapabilityState(),record(),ctx).state;
 assert.equal(currentCapabilityRecords(state,ctx).length,1);
 const transition={issuer:ctx.issuer,audience:ctx.audience,previous:id(3),next:id(4)};
 const context={...ctx,generationTransitionValid:true};
 const changed=admitCapabilityGeneration(state,transition,context);
 assert.equal(currentCapabilityRecords(changed.state,ctx).length,0);
 assert.equal(Object.keys(changed.state.records).length,1); // history remains, no old offer
 assert.deepEqual(admitCapabilityGeneration(changed.state,transition,context).state,changed.state);
});
test('repair requests are audience-authorized and name missing immutable snapshot pages',async()=>{
 const {validateCapabilitySyncRequest}=await import('../tools/protocol/capabilities.mjs');
 const request={issuer:ctx.issuer,audience:ctx.audience},context={authenticated:true,audienceApproved:true,localIssuer:ctx.issuer,audience:ctx.audience};
 assert.deepEqual(validateCapabilitySyncRequest(request,context),request);
 const page={...request,snapshot:'4'.repeat(64),indexes:[0,2,4]};
 assert.deepEqual(validateCapabilitySyncRequest(page,context),page);
 assert.throws(()=>validateCapabilitySyncRequest({...page,indexes:[4,2]},context));
 assert.throws(()=>validateCapabilitySyncRequest({...request,indexes:[0]},context));
 assert.throws(()=>validateCapabilitySyncRequest(request,{...context,audienceApproved:false}));
});
