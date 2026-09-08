import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  assertClosedJsonSchema,
  assertValidProtocolCatalogs,
  cborBytesToHex,
  encodeDeterministicCbor,
  validateAuthoritySessionBinding
} from "../tools/protocol/index.mjs";

const root = resolve(import.meta.dirname, "..");
const readJson = (sourcePath) => readFile(resolve(root, sourcePath), "utf8").then(JSON.parse);
const sourcePaths = {
  profile: "spec/v1/protection/profile.json",
  algorithms: "spec/v1/protection/algorithms.json",
  domains: "spec/v1/protection/domains.json",
  bounds: "spec/v1/protection/bounds.json",
  state: "spec/v1/protection/state.json",
  registry: "spec/v1/protection/registry.json",
  vectors: "conformance/v1/protection/cases.json"
};

const [profile, algorithms, domains, bounds, stateContract, registry, vectors, catalogs, schemas] =
  await Promise.all([
    ...Object.values(sourcePaths).map(readJson),
    Promise.all(["spec/protocol-lines.json", "spec/protection-profiles.json"].map(readJson)),
    Promise.all([
      ["protocolLines", "spec/schemas/protocol-lines.schema.json"],
      ["protectionProfiles", "spec/schemas/protection-profiles.schema.json"],
      ["common", "spec/schemas/catalog-common.schema.json"]
    ].map(async ([name, sourcePath]) => [name, await readJson(sourcePath)]))
      .then(Object.fromEntries)
  ]);

test("Protection Profile semantic sources expose one complete indivisible construction", () => {
  assert.equal(profile.semanticSourceStatus, "COMPLETE");
  assert.equal(profile.indivisible, true);
  assert.equal(profile.componentNegotiation, false);
  assert.equal(profile.fallback, "forbidden");
  const semanticSources = new Set(Object.values(profile.semanticSources));
  for (const sourcePath of [...registry.wireSchemas, registry.runtimeGrammar,
    sourcePaths.algorithms, sourcePaths.domains, sourcePaths.bounds, sourcePaths.state,
    sourcePaths.vectors]) assert.ok(semanticSources.has(sourcePath), sourcePath);
  assert.equal(semanticSources.size, Object.keys(profile.semanticSources).length);

  for (const schema of Object.values(schemas)) assert.doesNotThrow(() => assertClosedJsonSchema(schema));
  assert.doesNotThrow(() => assertValidProtocolCatalogs(catalogs[0], catalogs[1], schemas));
});

test("final-standard primitive and wire shapes agree exactly across algorithms, bounds, and schemas", async () => {
  const primitives = new Map(algorithms.primitives.map((primitive) => [primitive.name, primitive]));
  const expected = {
    "X25519": { privateKeyBytes: 32, publicKeyBytes: 32, sharedSecretBytes: 32 },
    "ML-KEM-768": { dkSeedBytes: 64, encapsulationKeyBytes: 1184, ciphertextBytes: 1088, sharedSecretBytes: 32 },
    "Ed25519": { seedBytes: 32, publicKeyBytes: 32, signatureBytes: 64 },
    "ML-DSA-65": { seedBytes: 32, publicKeyBytes: 1952, signatureBytes: 3309 },
    "ChaCha20-Poly1305": { keyBytes: 32, nonceBytes: 12, tagBytes: 16 }
  };
  for (const [name, shape] of Object.entries(expected)) {
    const primitive = primitives.get(name);
    assert.ok(primitive, name);
    for (const [field, byteLength] of Object.entries(shape)) {
      assert.equal(primitive[field], byteLength, `${name}.${field}`);
    }
  }
  assert.equal(primitives.get("HMAC-SHA-256").outputBytes, 32);
  assert.equal(primitives.get("HMAC-SHA-256").truncation, "forbidden");
  assert.equal(primitives.get("ChaCha20-Poly1305").xchacha, false);

  assert.equal(bounds.primitiveBytes.ML_KEM_768_ENCAPSULATION_KEY, 1184);
  assert.equal(bounds.primitiveBytes.ML_KEM_768_CIPHERTEXT, 1088);
  assert.equal(bounds.primitiveBytes.ML_DSA_65_PUBLIC_KEY, 1952);
  assert.equal(bounds.primitiveBytes.ML_DSA_65_SIGNATURE, 3309);
  assert.equal(bounds.primitiveBytes.CHACHA20_POLY1305_TAG, 16);
  assert.equal(bounds.bounds.MAX_PLAINTEXT_BYTES + 64, bounds.bounds.MAX_PROTECTED_PACKET_BYTES);
  assert.equal(22 + bounds.primitiveBytes.DIGEST256 + bounds.bounds.MAX_RATCHET_HEADER_BYTES,
    bounds.bounds.MAX_RECORD_AAD_BYTES);
  const maximumSessionAccept = encodeDeterministicCbor(new Map([
    [0, new Uint8Array(32)],
    [1, new Uint8Array(32)],
    [2, new Uint8Array(32)],
    [3, new Uint8Array(32)],
    [4, new Uint8Array(32)],
    [5, Number.MAX_SAFE_INTEGER],
    [6, new Uint8Array(32)]
  ]));
  assert.equal(maximumSessionAccept.byteLength, 221);
  assert.equal(bounds.bounds.MAX_SESSION_ACCEPT_BYTES, maximumSessionAccept.byteLength);

  const wireSchemas = await Promise.all(registry.wireSchemas.map(readJson));
  const [prekeySchema, handshakeSchema, acceptSchema, recordSchema] = wireSchemas;
  assert.equal(prekeySchema.$defs.ed25519Signature.pattern, "^[0-9a-f]{128}$");
  assert.equal(prekeySchema.$defs.mlDsa65Signature.pattern, "^[0-9a-f]{6618}$");
  assert.equal(prekeySchema.$defs.mlKem768Ek.pattern, "^[0-9a-f]{2368}$");
  assert.equal(handshakeSchema.$defs.mlKem768Ciphertext.pattern, "^[0-9a-f]{2176}$");
  assert.equal(acceptSchema.properties.mac.pattern, "^[0-9a-f]{64}$");
  assert.ok(handshakeSchema.required.includes("initiatorUserAuthorityStateDigest"));
  assert.ok(handshakeSchema.required.includes("responderUserAuthorityStateDigest"));
  assert.ok(acceptSchema.required.includes("initiatorUserAuthorityStateDigest"));
  assert.ok(acceptSchema.required.includes("responderUserAuthorityStateDigest"));
  const identitySchema = await readJson("spec/v1/identity/identity.schema.json");
  assert.equal(Object.hasOwn(identitySchema.$defs.userAuthorityState.properties,
    "initiatorUserAuthorityStateDigest"), false);
  assert.equal(Object.hasOwn(identitySchema.$defs.userAuthorityState.properties,
    "responderUserAuthorityStateDigest"), false);
  assert.equal(recordSchema.properties.tag.pattern, "^[0-9a-f]{32}$");
  assert.equal(recordSchema.properties.ciphertext.maxLength, bounds.bounds.MAX_PLAINTEXT_BYTES * 2);
});

test("domain separators are fixed distinct ASCII byte strings with one terminal NUL", () => {
  const encoded = Object.values(domains.domains).map((domain) => Buffer.from(domain, "utf8"));
  assert.equal(new Set(encoded.map((bytes) => bytes.toString("hex"))).size, encoded.length);
  for (const bytes of encoded) {
    assert.equal(bytes.at(-1), 0);
    assert.ok(bytes.subarray(0, -1).every((byte) => byte > 0 && byte < 128));
    assert.ok(!bytes.subarray(0, -1).includes(0));
  }
});

test("authority session binding vectors require sibling endpoint and protected authority digests", () => {
  const matching = vectors.cases.filter(({ target }) =>
    target.operationId === "licoarc.protection.validate-authority-session-binding.v1");
  assert.equal(matching.length, 3);
  assert.equal(matching.some(({ id }) => id.endsWith("accept.sibling-endpoint-authority-digests")), true);
  assert.equal(matching.some(({ expected }) =>
    expected.error?.code === "authority-payload-digest-mismatch"), true);
  assert.equal(profile.authorityBinding.authorityStateAcyclicity,
    "authority-snapshots-never-contain-peer-authority-digests");
  assert.equal(profile.authorityBinding.localPeerTrust, "unchanged");
  const accepted = matching.find(({ id }) => id.endsWith("accept.sibling-endpoint-authority-digests"));
  assert.deepEqual(validateAuthoritySessionBinding(accepted.input), { valid: true });
  for (const rejected of matching.filter(({ expected }) => expected.error)) {
    assert.throws(() => validateAuthoritySessionBinding(rejected.input),
      (error) => error.code === rejected.expected.error.code);
  }
});

test("ratchet header and protected record framing are computed from public semantic inputs", () => {
  const headerCase = oneVector("encode-ratchet-header");
  const frameCase = oneVector("frame-protected-record");
  const header = encodeDeterministicCbor(new Map([
    [0, Buffer.from(headerCase.input.dhHex, "hex")],
    [1, headerCase.input.pn],
    [2, headerCase.input.n]
  ]));
  assert.equal(cborBytesToHex(header), headerCase.expected.hex);
  assert.ok(header.byteLength <= bounds.bounds.MAX_RATCHET_HEADER_BYTES);

  const framed = Buffer.concat([
    Buffer.from(frameCase.input.headerHex, "hex"),
    Buffer.from(frameCase.input.ciphertextHex, "hex"),
    Buffer.from(frameCase.input.tagHex, "hex")
  ]);
  assert.equal(framed.toString("hex"), frameCase.expected.hex);
  assert.equal(Buffer.from(frameCase.input.tagHex, "hex").byteLength,
    bounds.primitiveBytes.CHACHA20_POLY1305_TAG);
  assert.equal(algorithms.record.frame, "complete-canonical-header || ciphertext || tag");
});

test("paired prekey redemption and session admission are one compare-and-commit", () => {
  const transition = stateContract.handshakeTransitions.find(({ event }) =>
    event === "authenticated-first-packet");
  assert.equal(transition.atomicCompareAndCommit, true);
  assert.deepEqual(new Set(transition.commit), new Set([
    "session-state",
    "remove-complete-pair-from-active-map",
    "non-reusable-sequence-by-high-water",
    "identical-session-accept",
    "state-generation+1"
  ]));
  assert.deepEqual(stateContract.prekeyInventory.reservationStates, []);

  const before = inventoryState({ generation: 7, highWater: 10, activeSequences: [9, 10] });
  const winner = commitFirstPacket(before, {
    expectedGeneration: 7,
    pairSequence: 10,
    packetDigest: "11".repeat(32),
    sessionAccept: "22".repeat(32),
    authenticated: true
  });
  assert.equal(winner.status, "committed");
  assert.equal(winner.state.generation, 8);
  assert.equal(winner.state.activePairs.has(10), false);
  assert.equal(winner.state.sessions.has(10), true);
  assert.equal(winner.state.committedReplay.get(10).sessionAccept, "22".repeat(32));
  assert.equal(before.activePairs.has(10), true, "the tentative pre-state must remain unchanged");

  const losingConcurrentCommit = commitFirstPacket(winner.state, {
    expectedGeneration: 7,
    pairSequence: 10,
    packetDigest: "33".repeat(32),
    sessionAccept: "44".repeat(32),
    authenticated: true
  });
  assert.equal(losingConcurrentCommit.status, "prekey-consumed");
  assert.strictEqual(losingConcurrentCommit.state, winner.state);

  const replay = commitFirstPacket(winner.state, {
    expectedGeneration: 8,
    pairSequence: 10,
    packetDigest: "11".repeat(32),
    sessionAccept: "ignored",
    authenticated: true
  });
  assert.equal(replay.status, "identical-committed-session-accept");
  assert.equal(replay.sessionAccept, "22".repeat(32));
  assert.strictEqual(replay.state, winner.state);
});

test("ratchet receive publishes state and plaintext only after authentication", () => {
  assert.match(stateContract.tentativeRule, /isolated snapshot/);
  assert.match(stateContract.tentativeRule, /only the named atomic commit may mutate durable state/);
  assert.match(stateContract.receive.commit,
    /atomically-durably-store-ratchet-advance-skipped-key-delta-replay-state-inbox-record-and-state-generation/);

  const before = ratchetState({ generation: 3, nextReceive: 2 });
  const rejected = receiveRecord(before, { messageNumber: 5, authenticated: false });
  assert.equal(rejected.status, "record-authentication");
  assert.strictEqual(rejected.state, before);
  assert.equal(rejected.plaintextReleased, false);

  const accepted = receiveRecord(before, { messageNumber: 5, authenticated: true });
  assert.equal(accepted.status, "committed");
  assert.equal(accepted.state.generation, 4);
  assert.equal(accepted.state.nextReceive, 6);
  assert.deepEqual([...accepted.state.skippedKeys.keys()], [2, 3, 4]);
  assert.equal(accepted.state.skippedKeys.has(5), false);
  assert.equal(accepted.state.durableInbox.length, 1);
  assert.equal(accepted.plaintextReleased, true);
  assert.equal(before.nextReceive, 2);

  const overBound = receiveRecord(before, {
    messageNumber: before.nextReceive + bounds.bounds.MAX_SKIP_PER_RECORD + 1,
    authenticated: true
  });
  assert.equal(overBound.status, "skip-bound");
  assert.strictEqual(overBound.state, before);
});

function oneVector(operation) {
  const matching = vectors.cases.filter(({ target }) =>
    target.operationId === `licoarc.protection.${operation}.v1`);
  assert.equal(matching.length, 1, `one authority vector for ${operation}`);
  return { ...matching[0], expected: matching[0].expected.result };
}

function inventoryState({ generation, highWater, activeSequences }) {
  return Object.freeze({
    generation,
    highWater,
    activePairs: new Map(activeSequences.map((sequence) => [sequence, Object.freeze({ sequence })])),
    sessions: new Map(),
    committedReplay: new Map()
  });
}

function commitFirstPacket(state, input) {
  const replay = state.committedReplay.get(input.pairSequence);
  if (replay?.packetDigest === input.packetDigest) {
    return { status: "identical-committed-session-accept", sessionAccept: replay.sessionAccept, state };
  }
  if (!input.authenticated || input.expectedGeneration !== state.generation ||
      !state.activePairs.has(input.pairSequence)) {
    return { status: "prekey-consumed", state };
  }

  const activePairs = new Map(state.activePairs);
  const sessions = new Map(state.sessions);
  const committedReplay = new Map(state.committedReplay);
  activePairs.delete(input.pairSequence);
  sessions.set(input.pairSequence, Object.freeze({ packetDigest: input.packetDigest }));
  committedReplay.set(input.pairSequence, Object.freeze({
    packetDigest: input.packetDigest,
    sessionAccept: input.sessionAccept
  }));
  return {
    status: "committed",
    state: Object.freeze({
      generation: state.generation + 1,
      highWater: state.highWater,
      activePairs,
      sessions,
      committedReplay
    })
  };
}

function ratchetState({ generation, nextReceive }) {
  return Object.freeze({
    generation,
    nextReceive,
    skippedKeys: new Map(),
    durableInbox: Object.freeze([])
  });
}

function receiveRecord(state, { messageNumber, authenticated }) {
  const skipped = messageNumber - state.nextReceive;
  if (skipped < 0) return { status: "replay", state, plaintextReleased: false };
  if (skipped > bounds.bounds.MAX_SKIP_PER_RECORD ||
      state.skippedKeys.size + skipped > bounds.bounds.MAX_SKIPPED_KEYS) {
    return { status: "skip-bound", state, plaintextReleased: false };
  }

  const tentativeSkippedKeys = new Map(state.skippedKeys);
  for (let number = state.nextReceive; number < messageNumber; number += 1) {
    tentativeSkippedKeys.set(number, Object.freeze({ coordinate: number }));
  }
  if (!authenticated) return { status: "record-authentication", state, plaintextReleased: false };
  tentativeSkippedKeys.delete(messageNumber);
  return {
    status: "committed",
    state: Object.freeze({
      generation: state.generation + 1,
      nextReceive: messageNumber + 1,
      skippedKeys: tentativeSkippedKeys,
      durableInbox: Object.freeze([...state.durableInbox, Object.freeze({ messageNumber })])
    }),
    plaintextReleased: true
  };
}
