import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertClosedJsonSchema } from "../tools/protocol/index.mjs";
import { B, manifest, schemas, canonical, sha256, classifyRumor, fragmentObject,
  validateEnvelope, emptyAssemblyState, releaseAssemblies, acceptFragment,
  validateBinding, freezeBinding, commonCapabilities, agreementDigest,
  selectPath, validateCollaboration, semanticBindingId,
  emptyBindingInbox, holdBeforeBinding, resolveBindingInbox, commitBindingInbox } from "../tools/interop/v1.mjs";
import { buildBindingArtifact } from "../tools/generate-interop-artifact.mjs";

const root = new URL("../", import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const corpus = await read("conformance/interop/v1/cases.json");
const A = "1".repeat(64), Z = "2".repeat(64), CHANNEL = "3".repeat(32), DEF = "4".repeat(64);
const context = { outerAuthenticated: true, sender: A, recipient: Z };
const cap = { id: "org.example.review", definition: DEF };
const binding = { binding: DEF, channel: CHANNEL, initiator: A, responder: Z,
  session: "6".repeat(64), conversation: "8".repeat(32) };
const contextBinding = { ...binding, ...context, role: "initiator", nativeAuthenticated: true,
  authorityAdmitted: true, peerApproved: true, deviceRevoked: false };
const expectError = (fn, code) => assert.throws(fn, (e) => e.code === code, code);

function execute(c) {
  const i = c.input;
  try {
    switch (c.operation) {
      case "classify": return classifyRumor(i.rumor, i.context);
      case "route": return selectPath(i.requirement, i.readiness, i.capability);
      case "binding": validateBinding(i.text, i.expectedContext); return "valid";
      case "envelope": validateEnvelope(i.text); return "valid";
      case "intersection": return commonCapabilities(i.left, i.right);
      case "collaboration": return validateCollaboration(i.text, i.context).bytes.toString("hex");
      case "roundtrip": {
        const bytes = Buffer.alloc(i.length, i.byte);
        const fragments = fragmentObject(bytes, i.channel, i.type).reverse();
        let state = emptyAssemblyState(), result;
        for (const fragment of fragments) {
          result = acceptFragment(state, canonical(fragment), i.context, 10);
          state = result.state;
        }
        assert.deepEqual(result.bytes, bytes); assert.equal(state.reserved, 0);
        return result.status;
      }
      default: throw new Error(`unknown corpus operation: ${c.operation}`);
    }
  } catch (error) {
    if (typeof error.code === "string") return error.code;
    throw error;
  }
}
for (const c of corpus.cases) test(`Nostr corpus: ${c.id}`, () => assert.deepEqual(execute(c), c.expected));

test("the manifest keeps V1 and independent, product-neutral interoperability claims", () => {
  assert.equal(manifest.generation, 1);
  assert.equal(manifest.paths["nostr-dm"].requiresLicoArc, false);
  assert.deepEqual(manifest.upstream.baselineNips, ["01", "17", "44", "59"]);
  assert.equal(manifest.paths["licoarc-enhanced"].requiresLicoUp, false);
  assert.equal(manifest.paths["licoarc-enhanced"].requiresFederationMembership, false);
  assert.equal(manifest.upstream.upstreamAllocation, "not-claimed");
  assert.equal(manifest.carrier.nip78Carrier, "forbidden");
  assert.equal(manifest.routing.automaticDowngrade, false);
  assert.equal(manifest.routing.compatibilityCopy, false);
  for (const value of Object.values(manifest.securityBoundary)) assert.equal(value, false);
  for (const schema of Object.values(schemas)) assertClosedJsonSchema(schema);
});

test("hashing has a separate known-answer vector", () => {
  assert.equal(sha256(Buffer.from("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("closed canonical envelope rejects extra keys, duplicate keys, whitespace and invalid sizes", () => {
  const e = fragmentObject(Buffer.from("a"), CHANNEL, "protected-record")[0];
  for (const wrong of [{ ...e, unknown: true }, { ...e, length: 0 }, { ...e, length: 524289 },
    { ...e, index: -1 }, { ...e, index: 64 }, { ...e, data: "YQ" }, { ...e, channel: A },
    { ...e, type: "execute" }, { ...e, digest: DEF.toUpperCase().replaceAll("4", "G") }])
    assert.throws(() => validateEnvelope(canonical(wrong)));
  assert.throws(() => validateEnvelope(canonical(e).replace('"index":0', '"index":0,"index":0')));
  assert.throws(() => validateEnvelope(canonical(e) + " "));
  assert.throws(() => validateEnvelope(" ".repeat(16385)));
  assert.throws(() => fragmentObject(Buffer.alloc(0), CHANNEL, "protected-record"));
  assert.throws(() => fragmentObject(Buffer.alloc(524289), CHANNEL, "protected-record"));
});

test("reassembly accepts deterministic permutations across fragment boundaries", () => {
  for (const length of [2, 8191, 8192, 8193, 16384, 16385, 65536, 524287]) {
    const bytes = Buffer.alloc(length); for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 13) % 256;
    const parts = fragmentObject(bytes, CHANNEL, "protected-record");
    const order = [...parts.filter((_, i) => i % 2), ...parts.filter((_, i) => !(i % 2)).reverse()];
    let state = emptyAssemblyState(), result;
    for (const p of order) { result = acceptFragment(state, canonical(p), context, 30); state = result.state; }
    assert.equal(result.status, "complete"); assert.deepEqual(result.bytes, bytes);
  }
});

test("duplicate fragments have no lifetime and hot-state reclamation needs durable recovery", () => {
  const parts = fragmentObject(Buffer.alloc(8193), CHANNEL, "protected-record");
  const first = acceptFragment(emptyAssemblyState(), canonical(parts[0]), context, 1);
  const duplicate = acceptFragment(first.state, canonical(parts[0]), context, 500);
  assert.equal(duplicate.status, "duplicate"); assert.equal(duplicate.state.reserved, 8193);
  assert.equal(Object.hasOwn([...duplicate.state.entries.values()][0], "deadline"), false);
  assert.equal(acceptFragment(duplicate.state, canonical(parts[1]), context, 31_536_000).status, "complete");
  assert.equal(acceptFragment(duplicate.state, canonical(parts[1]), context, 0).status, "complete");
  const keys = [...duplicate.state.entries.keys()];
  expectError(() => releaseAssemblies(duplicate.state, keys, {}), "durable-recovery-required");
  assert.equal(releaseAssemblies(duplicate.state, keys, {durableRecoveryVerified:true}).reserved, 0);
});

test("conflicting fragments fail without mutation; final hash failure releases only transport state", () => {
  const parts = fragmentObject(Buffer.alloc(8193), CHANNEL, "protected-record");
  const state = acceptFragment(emptyAssemblyState(), canonical(parts[0]), context, 0).state;
  const altered = { ...parts[0], data: Buffer.alloc(8192, 1).toString("base64") };
  expectError(() => acceptFragment(state, canonical(altered), context, 1), "fragment-conflict");
  assert.equal(state.entries.size, 1); assert.equal([...state.entries.values()][0].parts.size, 1);
  const wrongLast = { ...parts[1], data: "AQ==" };
  const result = acceptFragment(state, canonical(wrongLast), context, 1);
  assert.equal(result.status, "digest-mismatch"); assert.equal(result.state.reserved, 0);
  assert.equal(state.entries.size, 1); // reducer did not mutate the caller's committed state
});

test("sender, recipient, channel, type and digest isolate reassembly", () => {
  const parts = fragmentObject(Buffer.alloc(8193), CHANNEL, "protected-record");
  const original = acceptFragment(emptyAssemblyState(), canonical(parts[0]), context, 0).state;
  for (const [p, ctx] of [
    [parts[1], { ...context, sender: DEF }], [parts[1], { ...context, recipient: DEF }],
    [{ ...parts[1], channel: "7".repeat(32) }, context],
    [{ ...parts[1], type: "first-packet" }, context], [{ ...parts[1], digest: DEF }, context]
  ]) {
    const result = acceptFragment(original, canonical(p), ctx, 1);
    assert.equal(result.status, "pending"); assert.equal(result.state.entries.size, 2);
  }
  const wrong = { ...parts[0], length: 8194 };
  expectError(() => acceptFragment(original, canonical(wrong), context, 1), "fragment-length-conflict");
});

test("peer and global limits are checked before reserving more state", () => {
  let state = emptyAssemblyState();
  for (let peer = 0; peer < 4; peer++) for (let n = 0; n < 4; n++) {
    const part = fragmentObject(Buffer.alloc(524288, n), (n + 1).toString(16).padStart(32, "0"), "protected-record")[0];
    state = acceptFragment(state, canonical(part), { ...context, sender: String(peer + 1).repeat(64) }, 0).state;
  }
  assert.equal(state.entries.size, 16); assert.equal(state.reserved, 8388608);
  const extra = fragmentObject(Buffer.alloc(8193), "9".repeat(32), "protected-record")[0];
  expectError(() => acceptFragment(state, canonical(extra), context, 1), "global-object-limit");
  const peerState = { ...state, entries: new Map([...state.entries].slice(0, 4)), reserved: 4 * 524288 };
  expectError(() => acceptFragment(peerState, canonical(extra), context, 1), "peer-object-limit");
});

test("identity association is immutable but contains no mutable capability list", () => {
  const accepted = validateBinding(canonical(binding), contextBinding);
  const frozen = freezeBinding(null, accepted);
  assert.deepEqual(freezeBinding(frozen, structuredClone(accepted)), frozen);
  expectError(() => freezeBinding(frozen, { ...accepted, conversation: "7".repeat(32) }), "binding-changed");
  const responder = { ...binding };
  const digest = agreementDigest(binding, responder);
  assert.match(digest, /^[0-9a-f]{64}$/);
  assert.equal(digest, agreementDigest(responder, binding));
  assert.equal(Object.hasOwn(schemas.binding.properties, "capabilities"), false);
  expectError(() => agreementDigest(binding, { ...responder, session: DEF }), "agreement-context-mismatch");
  const duplicate = [{ id: "org.a", definition: DEF }, { id: "org.a", definition: A }];
  expectError(() => commonCapabilities(duplicate, []), "capability-order-or-duplicate");
});

test("all absent enhanced prerequisites fail rather than selecting ordinary chat", () => {
  for (const enhancedSession of [false, true]) for (const bindingReady of [false, true])
    for (const inboxAvailable of [false, true]) for (const sendApproved of [false, true]) {
      for (const requirement of ["enhanced-message", "enhanced-collaboration"]) {
        const r = { enhancedSession, bindingReady, inboxAvailable, sendApproved, common: [cap], relayOK: true };
        if (enhancedSession && bindingReady && inboxAvailable && sendApproved)
          assert.equal(selectPath(requirement, r, cap), "licoarc-enhanced");
        else assert.throws(() => selectPath(requirement, r, cap));
      }
    }
});

test("prebinding application disposition survives replay and a modeled restart without execution", () => {
  const record = { channel: CHANNEL, nativeRecordId: DEF, payload: Buffer.from("sensitive"),
    nativeAuthenticated: true, authorityAdmitted: true };
  const first = holdBeforeBinding(emptyBindingInbox(), record, 0);
  assert.equal(first.status, "binding-pending");
  const recovered = { ...first.state, entries: new Map([...first.state.entries].map(([k, v]) =>
    [k, { ...v, payload: Buffer.from(v.payload) }])) };
  const replay = holdBeforeBinding(recovered, record, 100);
  assert.equal(replay.state.reserved, 9); assert.equal(replay.state.entries.size, 1);
  assert.equal(resolveBindingInbox(replay.state, CHANNEL, false, 110).candidates.length, 0);
  const ready = resolveBindingInbox(replay.state, CHANNEL, true, 120);
  assert.equal(ready.candidates.length, 1); assert.equal(ready.state.reserved, 9);
  expectError(() => commitBindingInbox(ready.state, CHANNEL, [DEF], false), "inbox-handoff-not-committed");
  assert.equal(commitBindingInbox(ready.state, CHANNEL, [DEF], true).reserved, 0);
  assert.equal(ready.candidates[0].payload.toString(), "sensitive");
  expectError(() => holdBeforeBinding(recovered, { ...record, payload: Buffer.from("changed") }, 100), "native-inbox-conflict");
  const expired = resolveBindingInbox(replay.state, CHANNEL, true, 600);
  assert.deepEqual(expired.failures, []); assert.equal(expired.candidates.length, 1);
});

test("prebinding inbox enforces channel limits and native authentication", () => {
  let state = emptyBindingInbox();
  for (let i = 0; i < 4; i++) state = holdBeforeBinding(state, {
    channel: CHANNEL, nativeRecordId: String(i).repeat(64), payload: Buffer.from([i]),
    nativeAuthenticated: true, authorityAdmitted: true
  }, 0).state;
  const fifth = { channel: CHANNEL, nativeRecordId: DEF, payload: Buffer.from("x"),
    nativeAuthenticated: true, authorityAdmitted: true };
  assert.equal(holdBeforeBinding(state, fifth, 1).status, "backpressure");
  expectError(() => holdBeforeBinding(state, { ...fifth, nativeAuthenticated: false }, 1), "native-admission-required");
  assert.equal(holdBeforeBinding(state, fifth, 31_536_000).status, "backpressure");
});

test("independent artifact closes sources and separates semantic identity from evidence/status", async () => {
  const artifact = await buildBindingArtifact();
  const stored = await read("artifacts/v1/nostr-interop.bundle.json");
  assert.equal(canonical(artifact), canonical(stored));
  assert.equal(artifact.bindingId, semanticBindingId(artifact.sources));
  const copy = structuredClone(artifact.sources);
  copy["spec/interop/v1/manifest.json"].lifecycle = "different-lifecycle-for-test";
  copy["spec/interop/v1/manifest.json"].definitionStatus = "different-status-for-test";
  copy["conformance/interop/v1/cases.json"].cases[0].expected = "different-evidence-for-test";
  assert.equal(artifact.bindingId, semanticBindingId(copy));
  copy["spec/interop/v1/protocol.md"] += "\nDifferent semantics.\n";
  assert.notEqual(artifact.bindingId, semanticBindingId(copy));
  const native = await read("spec/v1/manifest.json");
  assert.equal(native.protocolLineId, manifest.paths["licoarc-enhanced"].nativeProtocolLineId);
  assert.equal(manifest.routing.requiresNostrForCore, false);
});
