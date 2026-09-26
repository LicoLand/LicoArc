import test from 'node:test';import assert from 'node:assert/strict';
import {createEndpointConfirmation,applyReliableConfirmation,confirmationBinding} from '../tools/protocol/reliable-confirmations.mjs';
const h=n=>n.toString(16).padStart(64,'0'),id=n=>n.toString(16).padStart(32,'0');
const session={sessionId:id(1),senderEndpointRef:h(2),expectedSenderEndpointRef:h(2),authenticated:true,senderAuthorized:true};
const state=()=>({logicalMessageId:id(1),finalityState:'pending'});
const receipt=(stage='endpointAccepted',outcome='succeeded',extra={})=>createEndpointConfirmation({confirmedMessageIds:[id(1)],confirmationStage:stage,confirmationOutcome:outcome,...extra},h(2));
const apply=(s,c,extra={})=>applyReliableConfirmation({state:s,confirmation:c,session,...extra});

test('a verified completion can arrive first; late acceptance never regresses it',()=>{
 const completed=receipt('effectCompleted','succeeded',{resultDigest:h(3)});
 let s=apply(state(),completed).state;assert.equal(s.finalityState,'completed');assert.equal(s.resultVerified,false);
 s=apply(s,receipt()).state;assert.equal(s.finalityState,'completed');
 s=apply(s,completed,{expectedResultDigest:h(3)}).state;assert.equal(s.resultVerified,true);
});
test('receipt semantic identity is independent of the authenticating session',()=>{
 const c=receipt(),first=apply(state(),c);
 assert.equal(apply(first.state,c,{session:{...session,sessionId:id(99)}}).status,'duplicate');
 assert.equal(confirmationBinding({confirmation:c,senderEndpointRef:h(2),sessionId:id(1)}),confirmationBinding({confirmation:c,senderEndpointRef:h(2),sessionId:id(2)}));
});
test('500 identical facts with different valid batch identifiers do not grow hot state',()=>{
 let s=state();for(let i=2;i<502;i++)s=apply(s,receipt('endpointAccepted','succeeded',{confirmedMessageIds:[id(1),id(i)]})).state;
 assert.equal(Object.keys(s.facts).length,1);assert.equal(s.localEffectAudit.length,1);assert.equal(s.transitionCount,1);assert.equal(Object.keys(s.confirmations).length,0);
});
test('random or reused confirmation ids cannot create new facts',()=>{
 const c=receipt(),s=apply(state(),c).state,before=structuredClone(s);
 assert.throws(()=>apply(s,{...c,confirmationOutcome:'failed'}),e=>e.code==='confirmation-id-mismatch');assert.deepEqual(s,before);
});
test('completion after local timeout or cancel request remains evidence, never reruns work',()=>{
 const s={...state(),finalityState:'failed',delivery:'outcome-unknown',cancelRequested:true};
 const result=apply(s,receipt('effectCompleted','succeeded',{resultDigest:h(3)}));
 assert.equal(result.state.finalityState,'completed');assert.equal(result.state.cancelRequested,true);
});
test('inconsistent authenticated outcomes remain a conflict independent of order',()=>{
 const failed=receipt('effectCompleted','failed'),ok=receipt('effectCompleted','succeeded',{resultDigest:h(3)});
 const a=apply(apply(state(),failed).state,ok).state,b=apply(apply(state(),ok).state,failed).state;
 assert.equal(a.finalityState,'evidence-conflict');assert.equal(b.finalityState,'evidence-conflict');assert.deepEqual(a.facts,b.facts);
});
test('unauthenticated or wrong-device late evidence cannot change a completed result',()=>{
 const c=receipt('effectCompleted','succeeded',{resultDigest:h(3)}),s=apply(state(),c).state;
 for(const patch of [{authenticated:false},{senderAuthorized:false},{senderEndpointRef:h(9)}])assert.throws(()=>apply(s,c,{session:{...session,...patch}}));
 assert.throws(()=>apply(state(),c,{expectedResultDigest:h(4)}),e=>e.code==='wrong-result-digest');
});
