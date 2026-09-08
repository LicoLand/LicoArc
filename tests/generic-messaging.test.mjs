import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  decodeDeterministicCbor,
  encodeDeterministicCbor
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagingRoot = path.join(repositoryRoot, "spec/v1/messaging");
const boundsDocument = JSON.parse(await readFile(path.join(messagingRoot, "bounds.json"), "utf8"));
const labels = JSON.parse(await readFile(path.join(messagingRoot, "labels.json"), "utf8"));
const registry = JSON.parse(await readFile(path.join(messagingRoot, "registry.json"), "utf8"));
const sourceManifest = JSON.parse(await readFile(path.join(messagingRoot, "source-manifest.json"), "utf8"));
const B = boundsDocument.bounds;
const CBOR_LIMITS = Object.freeze({
  maxBytes: 1_048_576,
  maxDepth: 16,
  maxArrayItems: Math.max(B.MAX_REQUEST_RANGES, B.MAX_ATTACHMENTS, B.MAX_EXTENSIONS),
  maxMapEntries: 64,
  maxRawBytes: B.MAX_PAYLOAD_BYTES,
  maxTextBytes: 4096,
  maxInteger: Number.MAX_SAFE_INTEGER
});
const KIND_BY_VALUE = new Map(labels.kind.map(({ value, name }) => [value, name]));
const KIND_VALUE = new Map(labels.kind.map(({ value, name }) => [name, value]));
const FAILURE_CODES = new Map(labels.failureCode.map(({ value, name }) => [value, name]));
const RECEIVE_OUTCOMES = new Map(labels.receiveOutcome.map(({ value, name }) => [value, name]));
const CORE_MESSAGE_LABELS = new Set(labels.message.map(({ label }) => String(label)));
const DESCRIPTOR_LABELS = new Set(labels.descriptor.map(({ label }) => String(label)));
const RANGE_LABELS = new Set(labels.range.map(({ label }) => String(label)));
const STATE_LABELS = new Set(labels.receiveState.map(({ label }) => String(label)));

class MessagingError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "MessagingError";
    this.code = code;
  }
}

test("the source closure and registry freeze one deterministic messaging line", async () => {
  assert.equal(registry.registryVersion, "licoarc.generic-messaging.v1");
  assert.equal(registry.lifecycle, "Candidate");
  assert.deepEqual(sourceManifest.sourceRoots, ["conformance/v1/messaging", "spec/v1/messaging"]);
  assert.deepEqual(sourceManifest.sources, [...sourceManifest.sources].sort());
  assert.equal(new Set(sourceManifest.sources).size, sourceManifest.sources.length);
  const actual = [];
  for (const root of sourceManifest.sourceRoots) {
    await collectFiles(path.join(repositoryRoot, root), repositoryRoot, actual);
  }
  actual.sort();
  assert.deepEqual(actual.filter((sourcePath) => sourcePath !== "spec/v1/messaging/source-manifest.json"), sourceManifest.sources);
  assert.equal(registry.representation.runtime, "deterministic-cbor");
  assert.equal(registry.representation.translation, undefined);
  assert.equal(registry.attachmentPolicy.chunkSize, "fixed-by-bounds");
  assert.equal(B.ATTACHMENT_CHUNK_BYTES <= B.MAX_PAYLOAD_BYTES, true);
  assert.equal(B.MAX_ATTACHMENT_BYTES <= B.MAX_ATTACHMENT_CHUNKS * B.ATTACHMENT_CHUNK_BYTES, true);
});

test("direct synthetic messages have deterministic bytes and six closed classes", () => {
  const correlatedId = bytes16(20);
  const messages = [
    { 0: bytes16(1), 1: KIND_VALUE.get("event"), 3: 0, 4: new Uint8Array() },
    { 0: bytes16(2), 1: KIND_VALUE.get("request"), 3: 42, 4: Uint8Array.of(0, 1, 2, 254, 255) },
    { 0: bytes16(3), 1: KIND_VALUE.get("response"), 2: correlatedId, 3: 42, 4: Uint8Array.of(1) },
    { 0: bytes16(4), 1: KIND_VALUE.get("error"), 2: correlatedId, 3: 43, 4: new Uint8Array() },
    { 0: bytes16(5), 1: KIND_VALUE.get("cancel"), 2: correlatedId, 3: 44, 4: Uint8Array.of(9) },
    { 0: bytes16(6), 1: KIND_VALUE.get("streamChunk"), 2: correlatedId, 3: 99, 4: Uint8Array.of(7), 7: 0, 8: true }
  ];
  const messageKinds = new Set();
  for (const value of messages) {
    const firstEncoding = encode(value);
    const secondEncoding = encode(value);
    assert.deepEqual(firstEncoding, secondEncoding);
    const decoded = decode(firstEncoding);
    assert.doesNotThrow(() => validateGenericMessage(decoded));
    messageKinds.add(KIND_BY_VALUE.get(decoded["1"]));
    assert.deepEqual(decoded, value);
  }
  assert.deepEqual([...messageKinds].sort(), ["cancel", "error", "event", "request", "response", "streamChunk"]);

  for (const state of [pendingReceiveState(), completeReceiveState()]) {
    const encoded = encode(state);
    const decoded = decode(encoded);
    assert.doesNotThrow(() => validateReceiveState(decoded));
    assert.deepEqual(decoded, state);
  }
});

test("ordinary Payload bytes are opaque and round-trip without transformation", () => {
  const bytes = Uint8Array.from([0, 1, 2, 127, 128, 254, 255]);
  const message = {
    0: Uint8Array.from({ length: 16 }, (_, index) => index + 1),
    1: KIND_VALUE.get("event"),
    3: 31337,
    4: bytes
  };
  const decoded = decode(encode(message));
  assert.deepEqual(decoded["4"], bytes);
  assert.equal(decoded["4"].byteLength, bytes.byteLength);
  assert.equal(decoded["3"], 31337);
  assert.throws(() => validateGenericMessage({ ...message, 4: new Uint8Array(B.MAX_PAYLOAD_BYTES + 1) }), errorWithCode("payload-over-bound"));
});

test("core fields, conditional fields, extension namespace, and reserved meanings fail closed", () => {
  const base = {
    0: bytes16(1),
    1: KIND_VALUE.get("event"),
    3: 0,
    4: new Uint8Array()
  };
  assert.throws(() => validateGenericMessage({ ...base, 11: 0 }), errorWithCode("unknown-core-label"));
  assert.throws(() => validateGenericMessage({ ...base, 1: 6 }), errorWithCode("unknown-kind"));
  assert.throws(() => validateGenericMessage({ ...base, 3: 4294901762 }), errorWithCode("unknown-reserved-meaning"));
  assert.throws(() => validateGenericMessage({ ...base, 3: 2147483648 }), errorWithCode("unknown-reserved-meaning"));
  assert.throws(() => validateGenericMessage({ ...base, 5: { 12: new Uint8Array([1]) } }), errorWithCode("reserved-extension-label"));
  assert.throws(() => validateGenericMessage({ ...base, 5: { 65536: new Uint8Array([1]) }, 6: [65536] }), errorWithCode("unknown-critical-extension"));
  assert.doesNotThrow(() => validateGenericMessage({ ...base, 5: { 65536: new Uint8Array([1]) } }));
  assert.throws(() => validateGenericMessage({ ...base, 1: KIND_VALUE.get("response") }), errorWithCode("missing-correlation"));
  assert.throws(() => validateGenericMessage({ ...base, 1: KIND_VALUE.get("streamChunk"), 2: bytes16(2), 7: 0 }), errorWithCode("stream-shape"));
  assert.throws(() => validateGenericMessage({ ...base, 1: KIND_VALUE.get("streamChunk"), 2: bytes16(2), 7: 0, 8: true, 9: bytes16(3) }), errorWithCode("attachment-final-forbidden"));
});

test("attachment descriptors and the fixed chunk grid derive all geometry", () => {
  const zero = deriveGeometry(0);
  assert.equal(zero.chunkCount, 0);
  assert.equal(zero.chunkSize, B.ATTACHMENT_CHUNK_BYTES);
  const exact = deriveGeometry(B.ATTACHMENT_CHUNK_BYTES * 2);
  assert.equal(exact.chunkCount, 2);
  assert.equal(exact.chunkLength(0), B.ATTACHMENT_CHUNK_BYTES);
  assert.equal(exact.chunkLength(1), B.ATTACHMENT_CHUNK_BYTES);
  const remainder = deriveGeometry(B.ATTACHMENT_CHUNK_BYTES + 7);
  assert.equal(remainder.chunkCount, 2);
  assert.equal(remainder.chunkOffset(1), B.ATTACHMENT_CHUNK_BYTES);
  assert.equal(remainder.chunkLength(1), 7);
  const boundary = deriveGeometry(B.MAX_ATTACHMENT_BYTES);
  assert.equal(boundary.chunkCount, B.MAX_ATTACHMENT_CHUNKS);
  assert.equal(boundary.chunkLength(B.MAX_ATTACHMENT_CHUNKS - 1), B.ATTACHMENT_CHUNK_BYTES);
  assert.throws(() => deriveGeometry(B.MAX_ATTACHMENT_BYTES + 1), errorWithCode("attachment-over-bound"));
  assert.throws(() => deriveGeometry(Number.MAX_SAFE_INTEGER), errorWithCode("attachment-over-bound"));
  const descriptor = {
    0: bytes16(4),
    1: B.MAX_MEDIA_TYPE,
    2: 7,
    3: bytes32(5)
  };
  assert.doesNotThrow(() => validateDescriptor(descriptor));
  assert.throws(() => validateDescriptor({ ...descriptor, 0: new Uint8Array(15) }), errorWithCode("invalid-attachment-id"));
  assert.throws(() => validateDescriptor({ ...descriptor, 3: new Uint8Array(31) }), errorWithCode("invalid-content-digest"));
});

test("attachment chunks bind immutable tuple identity and exact derived lengths", () => {
  const descriptor = { 0: bytes16(7), 1: 7, 2: B.ATTACHMENT_CHUNK_BYTES + 3, 3: bytes32(8) };
  const declaringMessageId = bytes16(9);
  const first = {
    0: bytes16(10),
    1: KIND_VALUE.get("streamChunk"),
    2: declaringMessageId,
    3: 7,
    4: new Uint8Array(B.ATTACHMENT_CHUNK_BYTES),
    7: 0,
    9: descriptor[0]
  };
  assert.doesNotThrow(() => validateGenericMessage(first));
  assert.doesNotThrow(() => validateAttachmentChunk(first, descriptor));
  const final = { ...first, 0: bytes16(11), 4: new Uint8Array([1, 2, 3]), 7: 1 };
  assert.doesNotThrow(() => validateAttachmentChunk(final, descriptor));
  assert.throws(() => validateAttachmentChunk({ ...first, 4: new Uint8Array(B.ATTACHMENT_CHUNK_BYTES - 1) }, descriptor), errorWithCode("invalid-length"));
  assert.throws(() => validateAttachmentChunk({ ...first, 7: 2 }, descriptor), errorWithCode("invalid-geometry"));
  assert.throws(() => validateAttachmentChunk({ ...first, 9: bytes16(12) }, descriptor), errorWithCode("conflicting-chunk"));
  assert.equal(declaringMessageId.byteLength, 16);
});

test("receive-state control payload has canonical ranges, terminality, and typed outcomes", () => {
  const state = pendingReceiveState();
  assert.doesNotThrow(() => validateReceiveState(state));
  const complete = completeReceiveState();
  assert.doesNotThrow(() => validateReceiveState(complete));
  assert.throws(() => validateReceiveState({ ...state, 1: [{ 0: 6, 1: 8 }, { 0: 1, 1: 3 }] }), errorWithCode("non-canonical-ranges"));
  assert.throws(() => validateReceiveState({ ...state, 1: [{ 0: 1, 1: 3 }, { 0: 3, 1: 5 }] }), errorWithCode("non-canonical-ranges"));
  assert.throws(() => validateReceiveState({ ...state, 1: [{ 0: 1, 1: B.MAX_REQUESTED_CHUNKS + 1 }] }), errorWithCode("invalid-range"));
  assert.throws(() => validateReceiveState({ ...complete, 3: 0 }), errorWithCode("premature-completion"));
  assert.throws(() => validateReceiveState({ ...complete, 3: 2 }), errorWithCode("missing-failure-code"));
  assert.throws(() => validateReceiveState({ ...complete, 3: 3, 4: 999 }), errorWithCode("unknown-failure-code"));
  assert.throws(() => validateStateTransition({ current: { stateUpdate: 4, recoveryRound: 2, outcome: "pending" }, incoming: { stateUpdate: 3, recoveryRound: 2, outcome: "pending" } }), errorWithCode("stale-state"));
  assert.throws(() => validateStateTransition({ current: { stateUpdate: 4, recoveryRound: 2, outcome: "pending" }, incoming: { stateUpdate: 0, recoveryRound: 0, outcome: "pending" } }), errorWithCode("reset-attempt"));
  assert.throws(() => validateStateTransition({ current: { stateUpdate: 4, recoveryRound: 2, outcome: "complete" }, incoming: { stateUpdate: 5, recoveryRound: 3, outcome: "pending" } }), errorWithCode("terminal-reopen"));
});

test("streaming digest accounting never requires a full attachment copy", async () => {
  const content = Uint8Array.from({ length: B.ATTACHMENT_CHUNK_BYTES * 2 + 17 }, (_, index) => index % 251);
  const descriptor = { 0: bytes16(13), 1: 7, 2: content.byteLength, 3: digest(content) };
  const reads = [];
  const result = await streamAttachment({
    byteLength: descriptor[2],
    readChunk: async (index, offset, length) => {
      reads.push({ index, offset, length });
      return content.slice(offset, offset + length);
    }
  });
  assert.deepEqual(result.digest, descriptor[3]);
  assert.equal(result.bytesRead, content.byteLength);
  assert.equal(result.peakChunkBytes, B.ATTACHMENT_CHUNK_BYTES);
  assert.deepEqual(reads, [
    { index: 0, offset: 0, length: B.ATTACHMENT_CHUNK_BYTES },
    { index: 1, offset: B.ATTACHMENT_CHUNK_BYTES, length: B.ATTACHMENT_CHUNK_BYTES },
    { index: 2, offset: B.ATTACHMENT_CHUNK_BYTES * 2, length: 17 }
  ]);
  await assert.rejects(() => streamAttachment({
    byteLength: descriptor[2],
    readChunk: async () => new Uint8Array(B.ATTACHMENT_CHUNK_BYTES - 1)
  }), errorWithCode("invalid-length"));
});

test("lifetime maxima cannot be reset by retries or transport changes", () => {
  assert.throws(() => enforceLifetime({ controlBytes: B.MAX_ATTACHMENT_CONTROL_BYTES + 1 }), errorWithCode("lifetime-bound-exceeded"));
  assert.throws(() => enforceLifetime({ stateUpdates: B.MAX_ATTACHMENT_STATE_UPDATES + 1 }), errorWithCode("lifetime-bound-exceeded"));
  assert.throws(() => enforceLifetime({ recoveryRounds: B.MAX_ATTACHMENT_RECOVERY_ROUNDS + 1 }), errorWithCode("lifetime-bound-exceeded"));
  assert.throws(() => enforceLifetime({ retransmittedChunks: B.MAX_ATTACHMENT_RETRANSMITTED_CHUNKS + 1 }), errorWithCode("lifetime-bound-exceeded"));
  assert.throws(() => enforceLifetime({ stateUpdates: 0, event: "route-change", previous: B.MAX_ATTACHMENT_STATE_UPDATES }), errorWithCode("lifetime-bound-exceeded"));
  assert.equal(B.ATTACHMENT_RECOVERY_WINDOW, 86400);
});

function encode(value) {
  try {
    return encodeDeterministicCbor(value, CBOR_LIMITS);
  } catch (error) {
    if (error?.message?.includes("raw bytes exceed")) throw new MessagingError("payload-over-bound", error.message);
    throw error;
  }
}

function decode(bytes) {
  return decodeDeterministicCbor(bytes, CBOR_LIMITS);
}

function validateGenericMessage(value) {
  assertMap(value, "message");
  assertClosedLabels(value, CORE_MESSAGE_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "3", "4"]) if (!(label in value)) throw new MessagingError("missing-core-field");
  assertBytes(value["0"], 16, "invalid-message-id");
  if (!Number.isSafeInteger(value["1"]) || !KIND_BY_VALUE.has(value["1"])) throw new MessagingError("unknown-kind");
  if (!Number.isSafeInteger(value["3"]) || value["3"] < 0 || value["3"] > B.MAX_CONTENT_TYPE) throw new MessagingError("invalid-content-type");
  const ordinary = value["3"] <= labels.contentTypes.ordinaryMaximum;
  const reserved = value["3"] >= labels.contentTypes.reservedRange[0];
  if (!ordinary && !(reserved && value["3"] === labels.contentTypes.reserved[0].value)) throw new MessagingError("unknown-reserved-meaning");
  assertBytes(value["4"], undefined, "invalid-payload");
  if (value["4"].byteLength > B.MAX_PAYLOAD_BYTES) throw new MessagingError("payload-over-bound");
  validateExtensions(value);
  const kind = KIND_BY_VALUE.get(value["1"]);
  const hasRelatesTo = "2" in value;
  if (hasRelatesTo) assertBytes(value["2"], 16, "invalid-correlation");
  if (["response", "error", "cancel", "streamChunk"].includes(kind) && !hasRelatesTo) throw new MessagingError("missing-correlation");
  if (kind === "streamChunk") {
    if (!("7" in value) || !Number.isSafeInteger(value["7"]) || value["7"] < 0) throw new MessagingError("stream-shape");
    const hasAttachment = "9" in value;
    const hasFinal = "8" in value;
    if (hasAttachment === hasFinal) throw new MessagingError(hasAttachment ? "attachment-final-forbidden" : "stream-shape");
    if (hasAttachment) assertBytes(value["9"], 16, "invalid-attachment-id");
    else if (typeof value["8"] !== "boolean") throw new MessagingError("stream-shape");
  } else if (["7", "8", "9"].some((label) => label in value)) {
    throw new MessagingError("forbidden-stream-field");
  }
  if ("10" in value) {
    if (!Array.isArray(value["10"]) || value["10"].length > B.MAX_ATTACHMENTS) throw new MessagingError("attachment-count-over-bound");
    const identities = new Set();
    for (const descriptor of value["10"]) {
      validateDescriptor(descriptor);
      const key = toHex(descriptor["0"]);
      if (identities.has(key)) throw new MessagingError("duplicate-attachment-id");
      identities.add(key);
    }
  }
  if (value["3"] === labels.contentTypes.reserved[0].value) {
    if (kind !== "event" || !hasRelatesTo || "10" in value) throw new MessagingError("invalid-receive-state-placement");
    validateReceiveState(decode(value["4"]), { encodedBytes: value["4"] });
  }
  return value;
}

function validateExtensions(value) {
  if (!("5" in value)) {
    if ("6" in value && value["6"].length > 0) throw new MessagingError("unknown-critical-extension");
    return;
  }
  const extensions = value["5"];
  assertMap(extensions, "extensions");
  if (Object.keys(extensions).length > B.MAX_EXTENSIONS) throw new MessagingError("extension-count-over-bound");
  let extensionBytes = 0;
  for (const [label, bytes] of Object.entries(extensions)) {
    if (!/^(?:0|[1-9][0-9]*)$/u.test(label)) throw new MessagingError("reserved-extension-label");
    const numeric = Number(label);
    if (!Number.isSafeInteger(numeric) || numeric < labels.extensions.acceptedRange[0] || numeric > labels.extensions.acceptedRange[1]) throw new MessagingError("reserved-extension-label");
    assertBytes(bytes, undefined, "invalid-extension-bytes");
    if (bytes.byteLength > B.MAX_EXTENSION_BYTES) throw new MessagingError("extension-over-bound");
    extensionBytes += bytes.byteLength;
  }
  if (extensionBytes > B.MAX_CONTROL_RECORD_BYTES) throw new MessagingError("extension-bytes-over-bound");
  if ("6" in value) {
    if (!Array.isArray(value["6"]) || value["6"].length > B.MAX_CRITICAL_EXTENSIONS) throw new MessagingError("critical-over-bound");
    let previous = -1;
    for (const label of value["6"]) {
      if (!Number.isSafeInteger(label) || label <= previous) throw new MessagingError("non-canonical-critical");
      previous = label;
      if (!(String(label) in extensions) || !labels.extensions.recognizedCriticalLabels.includes(label)) throw new MessagingError("unknown-critical-extension");
    }
  }
}

function validateDescriptor(value) {
  assertMap(value, "descriptor");
  assertClosedLabels(value, DESCRIPTOR_LABELS, "unknown-descriptor-label");
  for (const label of ["0", "1", "2", "3"]) if (!(label in value)) throw new MessagingError("missing-descriptor-field");
  assertBytes(value["0"], 16, "invalid-attachment-id");
  if (!Number.isSafeInteger(value["1"]) || value["1"] < 0 || value["1"] > B.MAX_MEDIA_TYPE) throw new MessagingError("invalid-media-type");
  if (!Number.isSafeInteger(value["2"]) || value["2"] < 0 || value["2"] > B.MAX_ATTACHMENT_BYTES) throw new MessagingError("attachment-over-bound");
  assertBytes(value["3"], 32, "invalid-content-digest");
  deriveGeometry(value["2"]);
  return value;
}

function validateAttachmentChunk(message, descriptor) {
  validateGenericMessage(message);
  validateDescriptor(descriptor);
  if (KIND_BY_VALUE.get(message["1"]) !== "streamChunk" || !("9" in message)) throw new MessagingError("invalid-attachment-chunk");
  if (!bytesEqual(message["9"], descriptor["0"])) throw new MessagingError("conflicting-chunk");
  const geometry = deriveGeometry(descriptor["2"]);
  if (message["7"] >= geometry.chunkCount) throw new MessagingError("invalid-geometry");
  const expectedLength = geometry.chunkLength(message["7"]);
  if (message["4"].byteLength !== expectedLength) throw new MessagingError("invalid-length");
  return { offset: geometry.chunkOffset(message["7"]), length: expectedLength };
}

function validateReceiveState(value, options = {}) {
  assertMap(value, "receive-state");
  assertClosedLabels(value, STATE_LABELS, "unknown-control-label");
  for (const label of ["0", "1", "2", "3", "5"]) if (!(label in value)) throw new MessagingError("missing-control-field");
  assertBytes(value["0"], 16, "invalid-attachment-id");
  if (!Array.isArray(value["1"]) || value["1"].length > B.MAX_REQUEST_RANGES) throw new MessagingError("range-bound-exceeded");
  let covered = 0;
  let previousEnd = -1;
  for (const range of value["1"]) {
    assertMap(range, "range");
    assertClosedLabels(range, RANGE_LABELS, "unknown-range-label");
    if (!("0" in range) || !("1" in range) || !Number.isSafeInteger(range["0"]) || !Number.isSafeInteger(range["1"])) throw new MessagingError("invalid-range");
    const start = range["0"];
    const end = range["1"];
    if (start < 0 || end <= start || start <= previousEnd) throw new MessagingError("non-canonical-ranges");
    if (end > B.MAX_ATTACHMENT_CHUNKS) throw new MessagingError("invalid-range");
    covered += end - start;
    if (covered > B.MAX_REQUESTED_CHUNKS) throw new MessagingError("range-bound-exceeded");
    previousEnd = end;
  }
  if (!Number.isSafeInteger(value["2"]) || value["2"] < 0 || value["2"] > B.MAX_STATE_UPDATE) throw new MessagingError("state-bound-exceeded");
  if (!Number.isSafeInteger(value["5"]) || value["5"] < 0 || value["5"] > B.MAX_RECOVERY_ROUND) throw new MessagingError("recovery-round-exceeded");
  if (!RECEIVE_OUTCOMES.has(value["3"])) throw new MessagingError("unknown-receive-outcome");
  const outcome = RECEIVE_OUTCOMES.get(value["3"]);
  if (outcome === "pending" && value["1"].length === 0) throw new MessagingError("premature-completion");
  if (outcome === "complete" && value["1"].length !== 0) throw new MessagingError("complete-with-ranges");
  if ((outcome === "cancelled" || outcome === "failed") && !("4" in value)) throw new MessagingError("missing-failure-code");
  if ("4" in value && (!Number.isSafeInteger(value["4"]) || !FAILURE_CODES.has(value["4"])) ) throw new MessagingError("unknown-failure-code");
  if (outcome === "pending" && "4" in value) throw new MessagingError("pending-failure-code");
  if (options.encodedBytes && options.encodedBytes.byteLength > B.MAX_RECOVERY_STATE_BYTES) throw new MessagingError("control-budget-exceeded");
  return value;
}

function validateStateTransition({ current, incoming }) {
  const terminal = new Set(["complete", "cancelled", "failed"]);
  if (terminal.has(current.outcome) && incoming.outcome !== current.outcome) throw new MessagingError("terminal-reopen");
  if (incoming.stateUpdate < current.stateUpdate || incoming.recoveryRound < current.recoveryRound) {
    if (incoming.stateUpdate === 0 || incoming.recoveryRound === 0) throw new MessagingError("reset-attempt");
    throw new MessagingError("stale-state");
  }
  return incoming;
}

function deriveGeometry(byteLength) {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0 || byteLength > B.MAX_ATTACHMENT_BYTES) throw new MessagingError("attachment-over-bound");
  const chunkCount = byteLength === 0 ? 0 : Math.ceil(byteLength / B.ATTACHMENT_CHUNK_BYTES);
  if (chunkCount > B.MAX_ATTACHMENT_CHUNKS) throw new MessagingError("attachment-chunk-count-over-bound");
  return {
    chunkCount,
    chunkSize: B.ATTACHMENT_CHUNK_BYTES,
    chunkOffset(index) {
      if (!Number.isSafeInteger(index) || index < 0 || index >= chunkCount) throw new MessagingError("invalid-geometry");
      return index * B.ATTACHMENT_CHUNK_BYTES;
    },
    chunkLength(index) {
      const offset = this.chunkOffset(index);
      return Math.min(B.ATTACHMENT_CHUNK_BYTES, byteLength - offset);
    }
  };
}

async function streamAttachment({ byteLength, readChunk }) {
  const geometry = deriveGeometry(byteLength);
  const hash = createHash("sha256");
  let bytesRead = 0;
  let peakChunkBytes = 0;
  for (let index = 0; index < geometry.chunkCount; index += 1) {
    const offset = geometry.chunkOffset(index);
    const length = geometry.chunkLength(index);
    const chunk = await readChunk(index, offset, length);
    if (!(chunk instanceof Uint8Array) || chunk.byteLength !== length) throw new MessagingError("invalid-length");
    peakChunkBytes = Math.max(peakChunkBytes, chunk.byteLength);
    hash.update(chunk);
    bytesRead += chunk.byteLength;
  }
  return { digest: new Uint8Array(hash.digest()), bytesRead, peakChunkBytes };
}

function enforceLifetime({ controlBytes = 0, stateUpdates = 0, recoveryRounds = 0, retransmittedChunks = 0, event, previous = 0 }) {
  if (controlBytes > B.MAX_ATTACHMENT_CONTROL_BYTES || stateUpdates > B.MAX_ATTACHMENT_STATE_UPDATES || recoveryRounds > B.MAX_ATTACHMENT_RECOVERY_ROUNDS || retransmittedChunks > B.MAX_ATTACHMENT_RETRANSMITTED_CHUNKS) throw new MessagingError("lifetime-bound-exceeded");
  if (event && previous > stateUpdates) throw new MessagingError("lifetime-bound-exceeded");
}

function pendingReceiveState() {
  return { 0: bytes16(30), 1: [{ 0: 1, 1: 3 }, { 0: 6, 1: 8 }], 2: 4, 3: 0, 5: 2 };
}

function completeReceiveState() {
  return { 0: bytes16(30), 1: [], 2: 5, 3: 1, 5: 3 };
}

function assertMap(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Uint8Array) throw new MessagingError(`${name}-not-map`);
}

function assertClosedLabels(value, allowed, code) {
  for (const label of Object.keys(value)) if (!allowed.has(label)) throw new MessagingError(code);
}

function assertBytes(value, expectedLength, code) {
  if (!(value instanceof Uint8Array) || (expectedLength !== undefined && value.byteLength !== expectedLength)) throw new MessagingError(code);
}

function errorWithCode(code) {
  return (error) => error instanceof MessagingError && error.code === code;
}

function bytes16(seed) {
  return Uint8Array.from({ length: 16 }, (_, index) => (seed + index) & 0xff);
}

function bytes32(seed) {
  return Uint8Array.from({ length: 32 }, (_, index) => (seed + index) & 0xff);
}

function digest(bytes) {
  return new Uint8Array(createHash("sha256").update(bytes).digest());
}

function bytesEqual(left, right) {
  return left instanceof Uint8Array && right instanceof Uint8Array && left.byteLength === right.byteLength && left.every((byte, index) => byte === right[index]);
}

function toHex(bytes) {
  return Buffer.from(bytes).toString("hex");
}

async function collectFiles(directory, root, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(absolute, root, output);
    else output.push(path.relative(root, absolute).split(path.sep).join("/"));
  }
}
