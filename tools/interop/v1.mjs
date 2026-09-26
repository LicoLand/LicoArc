/**
 * Deterministic V1 definition model. NOT a Nostr/Endpoint cryptographic SDK.
 * Authentication facts are explicit preconditions supplied by synthetic cases;
 * a production owner must establish them with real signature/MAC/native checks.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { canonicalizeRestrictedJson, parseRestrictedJson,
  assertValidAgainstClosedSchema } from "../protocol/index.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = async (name) => JSON.parse(await readFile(`${root}spec/interop/v1/${name}`, "utf8"));
export const manifest = await read("manifest.json");
export const schemas = Object.fromEntries(await Promise.all(
  ["carrier", "binding", "collaboration"].map(async (name) => [name, await read(`${name}.schema.json`)])));
export const B = Object.freeze({ ...manifest.bounds });
const HEX64 = /^[0-9a-f]{64}$/;
const HEX32 = /^[0-9a-f]{32}$/;
const LIMITS = Object.freeze({ maxBytes: 16_777_216, maxDepth: 32,
  maxArrayItems: 4096, maxObjectMembers: 1024, maxStringBytes: 4_194_304 });
export class InteropError extends TypeError {
  constructor(code) { super(code); this.name = "InteropError"; this.code = code; }
}
function requireThat(condition, code) { if (!condition) throw new InteropError(code); }
export function canonical(value) { return canonicalizeRestrictedJson(value, LIMITS); }
export function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
export function decodeCanonical(text, schemaName, maxBytes) {
  requireThat(typeof text === "string", "invalid-json-input");
  const value = parseRestrictedJson(text, { ...LIMITS, maxBytes });
  requireThat(text === canonical(value), "noncanonical-json");
  assertValidAgainstClosedSchema(value, schemas[schemaName]);
  return value;
}
export function decodeBase64(text, maxBytes) {
  requireThat(typeof text === "string" && text.length <= 4 * Math.ceil(maxBytes / 3), "base64-size");
  requireThat(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text), "invalid-base64");
  const bytes = Buffer.from(text, "base64");
  requireThat(bytes.length <= maxBytes && bytes.toString("base64") === text, "noncanonical-base64");
  return bytes;
}
function accountContext(context) {
  requireThat(context?.outerAuthenticated === true, "outer-authentication-required");
  requireThat(HEX64.test(context.sender) && HEX64.test(context.recipient), "account-context-invalid");
}
/** A structural dispatcher AFTER NIP-01/44/59 validation, not a signature verifier. */
export function classifyRumor(rumor, context) {
  accountContext(context);
  requireThat(rumor && rumor.pubkey === context.sender, "seal-rumor-author-mismatch");
  requireThat(Array.isArray(rumor.tags) && rumor.tags.some((t) =>
    Array.isArray(t) && t[0] === "p" && t[1] === context.recipient), "recipient-mismatch");
  if (rumor.kind === 14) {
    requireThat(typeof rumor.content === "string", "chat-content-invalid");
    return "standard-text"; // Never inspect a string as executable control data.
  }
  if (rumor.kind !== manifest.paths["licoarc-enhanced"].innerRumorKind) return "unsupported";
  if (canonical(rumor.tags) !== canonical([["t", "licoarc.v1"], ["p", context.recipient]])) return "unsupported";
  return "enhanced-carrier";
}
export function fragmentObject(bytes, channel, type) {
  requireThat(bytes instanceof Uint8Array, "object-bytes-required");
  requireThat(bytes.length >= 1 && bytes.length <= B.MAX_OBJECT_BYTES, "object-size");
  requireThat(HEX32.test(channel), "channel-invalid");
  requireThat(manifest.carrier.objectTypes.includes(type), "object-type");
  const source = Buffer.from(bytes);
  const digest = sha256(source);
  return Array.from({ length: Math.ceil(source.length / B.MAX_FRAGMENT_BYTES) }, (_, index) => ({
    channel, type, digest, length: source.length, index,
    data: source.subarray(index * B.MAX_FRAGMENT_BYTES, (index + 1) * B.MAX_FRAGMENT_BYTES).toString("base64")
  }));
}
export function validateEnvelope(text) {
  const envelope = decodeCanonical(text, "carrier", B.MAX_ENVELOPE_BYTES);
  const count = Math.ceil(envelope.length / B.MAX_FRAGMENT_BYTES);
  requireThat(count <= B.MAX_FRAGMENTS && envelope.index < count, "fragment-index");
  const bytes = decodeBase64(envelope.data, B.MAX_FRAGMENT_BYTES);
  requireThat(bytes.length === Math.min(B.MAX_FRAGMENT_BYTES,
    envelope.length - envelope.index * B.MAX_FRAGMENT_BYTES), "fragment-geometry");
  return { envelope, bytes, count };
}
export function emptyAssemblyState() { return { entries: new Map(), reserved: 0, clock: 0 }; }
function advanceClock(state, now) {
  requireThat(Number.isSafeInteger(now) && now >= 0, "invalid-observation-time");
}
/** Explicit cache reclamation requires a durable recovery copy; age never deletes accepted fragments. */
export function releaseAssemblies(state, keys, { durableRecoveryVerified = false } = {}) {
  requireThat(durableRecoveryVerified === true, "durable-recovery-required");
  const entries = new Map(state.entries); let reserved = state.reserved;
  for (const key of keys) { const value = entries.get(key); if (value) {entries.delete(key); reserved -= value.length;} }
  return { ...state, entries, reserved };
}
/** Pure reducer: rejected input throws without changing state; complete digest failures release only carrier cache. */
export function acceptFragment(state, text, context, now) {
  accountContext(context); advanceClock(state, now);
  const { envelope: e, bytes, count } = validateEnvelope(text);
  const peer = canonical([context.sender, context.recipient]);
  const key = canonical([context.sender, context.recipient, e.channel, e.type, e.digest]);
  const current = state.entries.get(key);
  if (current) {
    requireThat(e.length === current.length, "fragment-length-conflict");
    const previous = current.parts.get(e.index);
    if (previous) {
      requireThat(previous.equals(bytes), "fragment-conflict");
      return { state: { ...state, clock: now }, status: "duplicate" };
    }
  } else {
    requireThat(state.entries.size < B.MAX_PENDING_OBJECTS, "global-object-limit");
    requireThat([...state.entries.values()].filter((v) => v.peer === peer).length < B.MAX_PENDING_OBJECTS_PER_PEER,
      "peer-object-limit");
    requireThat(state.reserved + e.length <= B.MAX_REASSEMBLY_BYTES, "reassembly-byte-limit");
  }
  const next = current ? { ...current, parts: new Map(current.parts) } : {
    peer, length: e.length, parts: new Map()
  };
  next.parts.set(e.index, bytes);
  const entries = new Map(state.entries);
  let reserved = state.reserved + (current ? 0 : e.length);
  if (next.parts.size === count) {
    const complete = Buffer.concat(Array.from({ length: count }, (_, index) => next.parts.get(index)));
    entries.delete(key); reserved -= next.length;
    const output = { state: { entries, reserved, clock: now } };
    if (complete.length !== e.length || sha256(complete) !== e.digest) return { ...output, status: "digest-mismatch" };
    return { ...output, status: "complete", bytes: complete, type: e.type, channel: e.channel };
  }
  entries.set(key, next);
  return { state: { entries, reserved, clock: now }, status: "pending" };
}
function validateCapabilities(capabilities) {
  requireThat(Array.isArray(capabilities) && capabilities.length <= B.MAX_CAPABILITIES, "capability-bound");
  for (let i = 0; i < capabilities.length; i++) {
    assertValidAgainstClosedSchema(capabilities[i], schemas.collaboration.properties.capability);
    if (i > 0) requireThat(capabilities[i - 1].id < capabilities[i].id, "capability-order-or-duplicate");
  }
}
/** Model-only expected context must be independently derived from an authenticated native session. */
export function validateBinding(text, expected) {
  const record = decodeCanonical(text, "binding", B.MAX_BINDING_BYTES);
  requireThat(expected?.nativeAuthenticated === true && expected?.authorityAdmitted === true,
    "native-admission-required");
  requireThat(expected?.peerApproved === true && expected?.deviceRevoked === false,
    "peer-authorization-required");
  accountContext(expected);
  requireThat(expected.role === "initiator" || expected.role === "responder", "binding-role");
  for (const key of ["binding", "channel", "initiator", "responder", "session", "conversation"])
    requireThat(record[key] === expected[key], `binding-${key}-mismatch`);
  const receiverRole = expected.role === "initiator" ? "responder" : "initiator";
  requireThat(record[expected.role] === expected.sender && record[receiverRole] === expected.recipient,
    "binding-account-role-mismatch");
  return record;
}
export function freezeBinding(previous, next) {
  if (previous !== null) requireThat(canonical(previous) === canonical(next), "binding-changed");
  return structuredClone(next);
}
export function commonCapabilities(left, right) {
  validateCapabilities(left); validateCapabilities(right);
  const rightById = new Map(right.map((c) => [c.id, c.definition]));
  return left.filter((c) => rightById.get(c.id) === c.definition).map((c) => ({ ...c }));
}
export function agreementDigest(initiator, responder) {
  for (const record of [initiator, responder]) {
    assertValidAgainstClosedSchema(record, schemas.binding);
  }
  for (const key of ["binding", "channel", "initiator", "responder", "session", "conversation"])
    requireThat(initiator[key] === responder[key], "agreement-context-mismatch");
  return sha256(Buffer.concat([Buffer.from("LICOARC-NOSTR-V1/AGREEMENT\0", "ascii"),
    Buffer.from(canonical([initiator, responder]), "utf8")]));
}
export function selectPath(requirement, readiness, capability = null) {
  requireThat(readiness?.sendApproved === true, "send-approval-required");
  if (requirement === "standard-chat") {
    requireThat(readiness.inboxAvailable === true, "recipient-inbox-unavailable");
    return "nostr-dm";
  }
  requireThat(requirement === "enhanced-message" || requirement === "enhanced-collaboration", "unknown-requirement");
  requireThat(readiness.enhancedSession === true, "enhanced-unavailable");
  requireThat(readiness.bindingReady === true, "binding-required");
  if (requirement === "enhanced-collaboration") {
    requireThat(capability && Array.isArray(readiness.common) && readiness.common.some((c) =>
      c.id === capability.id && c.definition === capability.definition), "capability-unavailable");
  }
  requireThat(readiness.inboxAvailable === true, "recipient-inbox-unavailable");
  return "licoarc-enhanced";
}
export function validateCollaboration(text, context) {
  const record = decodeCanonical(text, "collaboration", B.MAX_APPLICATION_BYTES * 2);
  requireThat(context?.bindingReady === true, "binding-required");
  requireThat(record.conversation === context.conversation, "conversation-mismatch");
  requireThat(context.nativeAuthenticated === true && context.audienceApproved === true, "collaboration-unauthorized");
  // Receipt and safe storage are independent from execution authorization / current tool availability.
  return { record, bytes: decodeBase64(record.payload, B.MAX_APPLICATION_BYTES) };
}
export function semanticBindingId(sources) {
  const sourceManifest = sources["spec/interop/v1/manifest.json"];
  requireThat(sourceManifest && Array.isArray(sourceManifest.semanticSources), "semantic-manifest-required");
  const paths = sourceManifest.semanticSources;
  requireThat(paths.length > 0 && canonical(paths) === canonical([...new Set(paths)].sort()), "semantic-source-order");
  const projection = paths.map((path) => {
    requireThat(Object.hasOwn(sources, path), "semantic-source-missing");
    const source = structuredClone(sources[path]);
    if (path === "spec/interop/v1/manifest.json") {
      delete source.lifecycle; delete source.definitionStatus; delete source.implementationStatus;
    }
    return { path, source };
  });
  return sha256(Buffer.from(canonical(projection), "utf8"));
}

/** Durable-inbox transaction projections, not storage implementations. */
export function emptyBindingInbox() { return { entries: new Map(), reserved: 0, clock: 0 }; }
export function holdBeforeBinding(state, record, now) {
  advanceClock(state, now);
  requireThat(record.nativeAuthenticated === true && record.authorityAdmitted === true, "native-admission-required");
  requireThat(HEX32.test(record.channel) && HEX64.test(record.nativeRecordId), "native-inbox-key-invalid");
  requireThat(record.payload instanceof Uint8Array && record.payload.length <= B.MAX_OBJECT_BYTES, "inbox-payload-bound");
  const key = canonical([record.channel, record.nativeRecordId]);
  const previous = state.entries.get(key);
  if (previous) {
    requireThat(previous.payload.equals(Buffer.from(record.payload)),
      "native-inbox-conflict");
    return { state: { ...state, clock: now }, status: "binding-pending" };
  }
  if (state.entries.size >= B.MAX_PREBINDING_MESSAGES ||
      [...state.entries.values()].filter(v => v.channel === record.channel).length >= B.MAX_PREBINDING_MESSAGES_PER_CHANNEL ||
      state.reserved + record.payload.length > B.MAX_PREBINDING_BYTES)
    return { state, status: "backpressure" }; // do not commit/consume a native key; the durable ciphertext spool retains custody
  const entries = new Map(state.entries);
  entries.set(key, { channel: record.channel, nativeRecordId: record.nativeRecordId,
    payload: Buffer.from(record.payload) });
  return { state: { entries, reserved: state.reserved + record.payload.length, clock: now }, status: "binding-pending" };
}
export function resolveBindingInbox(state, channel, bindingReady, now) {
  advanceClock(state, now);
  requireThat(HEX32.test(channel) && typeof bindingReady === "boolean", "binding-context-invalid");
  const candidates = bindingReady ? [...state.entries.values()].filter(r => r.channel === channel)
    .map(r => ({ ...r, payload: Buffer.from(r.payload) })) : [];
  // Listing candidates is not a durable handoff. Keep custody until the destination commit succeeds.
  return { state, candidates, failures: [] };
}
export function commitBindingInbox(state, channel, recordIds, durableCommit) {
  requireThat(durableCommit === true, "inbox-handoff-not-committed");
  requireThat(HEX32.test(channel) && Array.isArray(recordIds) && recordIds.every(id => HEX64.test(id)), "invalid-inbox-handoff");
  const entries = new Map(state.entries); let reserved = state.reserved;
  for (const recordId of recordIds) { const key = canonical([channel, recordId]), r = entries.get(key);
    if(r) {entries.delete(key); reserved -= r.payload.length;} }
  return { ...state, entries, reserved };
}
