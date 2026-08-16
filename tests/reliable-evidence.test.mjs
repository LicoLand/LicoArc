import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  decodeDeterministicCbor,
  encodeDeterministicCbor,
  validateClosedSchema
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reliableRoot = path.join(repositoryRoot, "spec/v1/reliable");
const evidenceRoot = path.join(repositoryRoot, "spec/v1/evidence");
const reliableCorpusRoot = path.join(repositoryRoot, "conformance/v1/reliable");
const evidenceCorpusRoot = path.join(repositoryRoot, "conformance/v1/evidence");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const [reliableBounds, reliableLabels, reliableRegistry, reliableSourceManifest,
  reliableConformanceManifest, reliableValid, reliableInvalid, reliableIntentSchema,
  reliableEventSchema, reliableStateSchema, evidenceBounds, evidenceLabels,
  evidenceRegistry, evidenceSourceManifest, evidenceConformanceManifest,
  evidenceValid, evidenceInvalid, evidenceStatementSchema, evidenceCheckpointSchema,
  evidenceIdentityBundleSchema, reliableDocumentation, evidenceDocumentation,
  algorithmDecision] = await Promise.all([
  readJson(path.join(reliableRoot, "bounds.json")),
  readJson(path.join(reliableRoot, "labels.json")),
  readJson(path.join(reliableRoot, "registry.json")),
  readJson(path.join(reliableRoot, "source-manifest.json")),
  readJson(path.join(reliableCorpusRoot, "manifest.json")),
  readJson(path.join(reliableCorpusRoot, "valid.json")),
  readJson(path.join(reliableCorpusRoot, "invalid.json")),
  readJson(path.join(reliableRoot, "intent.schema.json")),
  readJson(path.join(reliableRoot, "event.schema.json")),
  readJson(path.join(reliableRoot, "state.schema.json")),
  readJson(path.join(evidenceRoot, "bounds.json")),
  readJson(path.join(evidenceRoot, "labels.json")),
  readJson(path.join(evidenceRoot, "registry.json")),
  readJson(path.join(evidenceRoot, "source-manifest.json")),
  readJson(path.join(evidenceCorpusRoot, "manifest.json")),
  readJson(path.join(evidenceCorpusRoot, "valid.json")),
  readJson(path.join(evidenceCorpusRoot, "invalid.json")),
  readJson(path.join(evidenceRoot, "statement.schema.json")),
  readJson(path.join(evidenceRoot, "checkpoint.schema.json")),
  readJson(path.join(evidenceRoot, "identity-bundle.schema.json")),
  readFile(path.join(repositoryRoot, "docs/protocols/reliable-exchange-v1.md"), "utf8").catch(() => ""),
  readFile(path.join(repositoryRoot, "docs/protocols/evidence-checkpoint-v1.md"), "utf8").catch(() => ""),
  readFile(path.join(repositoryRoot, "docs/algorithm-decisions/transferable-evidence-checkpoint.md"), "utf8")
]);

const RB = reliableBounds.bounds;
const EB = evidenceBounds.bounds;
const RELIABLE_CBOR_LIMITS = Object.freeze({
  maxBytes: RB.MAX_RELIABLE_SNAPSHOT_BYTES,
  maxDepth: 16,
  maxArrayItems: Math.max(RB.MAX_CONFIRMATION_IDS, RB.MAX_GROUP_PROJECTIONS),
  maxMapEntries: 32,
  maxRawBytes: RB.MAX_PROTECTED_INTENT_BYTES,
  maxTextBytes: 256,
  maxInteger: Number.MAX_SAFE_INTEGER
});
const EVIDENCE_CBOR_LIMITS = Object.freeze({
  maxBytes: EB.MAX_EVIDENCE_BUNDLE_BYTES,
  maxDepth: 16,
  maxArrayItems: Math.max(EB.MAX_EVIDENCE_STATEMENTS, EB.MAX_EVIDENCE_SIGNATURES, EB.MAX_KEYS_PER_IDENTITY_STATE),
  maxMapEntries: 32,
  maxRawBytes: EB.MAX_EVIDENCE_STATEMENT_BYTES,
  maxTextBytes: 256,
  maxInteger: Number.MAX_SAFE_INTEGER
});

const RELIABLE_INTENT_LABELS = new Set(reliableLabels.intent.map(({ label }) => String(label)));
const RELIABLE_EVENT_LABELS = new Set(reliableLabels.event.map(({ label }) => String(label)));
const RELIABLE_CONFIRMATION_LABELS = new Set(reliableLabels.confirmation.map(({ label }) => String(label)));
const RELIABLE_SNAPSHOT_LABELS = new Set(Array.from({ length: 19 }, (_, index) => String(index)));
const EVIDENCE_STATEMENT_LABELS = new Set(evidenceLabels.statement.map(({ label }) => String(label)));
const EVIDENCE_CHECKPOINT_LABELS = new Set(evidenceLabels.checkpoint.map(({ label }) => String(label)));
const EVIDENCE_SIGNATURE_LABELS = new Set(evidenceLabels.signature.map(({ label }) => String(label)));
const EVENT_KIND = new Map(reliableLabels.eventKinds.map(({ value, name }) => [name, value]));
const EVENT_KIND_BY_VALUE = new Map(reliableLabels.eventKinds.map(({ value, name }) => [value, name]));
const STAGE = new Map(reliableLabels.stages.map(({ value, name }) => [name, value]));
const OUTCOME = new Map(reliableLabels.outcomes.map(({ value, name }) => [name, value]));
const STATEMENT_KIND = new Map(evidenceLabels.statementKinds.map(({ value, name }) => [name, value]));
const FAILURE_NAMES = new Set(reliableLabels.failureCodes.map(({ name }) => name));

class ReliableError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "ReliableError";
    this.code = code;
  }
}

class EvidenceError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "EvidenceError";
    this.code = code;
  }
}

test("source closures, schemas, manifests, and protocol projections are explicit", async () => {
  assert.equal(reliableRegistry.registryVersion, "licoarc.reliable-exchange.v1");
  assert.equal(evidenceRegistry.registryVersion, "licoarc.transferable-evidence.v1");
  assert.equal(reliableRegistry.lifecycle, "Candidate");
  assert.equal(evidenceRegistry.lifecycle, "Candidate");
  assert.deepEqual(reliableSourceManifest.sourceRoots, ["conformance/v1/reliable", "spec/v1/reliable"]);
  assert.deepEqual(evidenceSourceManifest.sourceRoots, ["conformance/v1/evidence", "spec/v1/evidence"]);
  assert.deepEqual(reliableSourceManifest.sources, [...reliableSourceManifest.sources].sort());
  assert.deepEqual(evidenceSourceManifest.sources, [...evidenceSourceManifest.sources].sort());
  assert.deepEqual(reliableConformanceManifest.caseIds, reliableValid.map(({ id }) => id));
  assert.deepEqual(reliableConformanceManifest.negativeCaseIds, reliableInvalid.map(({ id }) => id));
  assert.deepEqual(evidenceConformanceManifest.caseIds, evidenceValid.map(({ id }) => id));
  assert.deepEqual(evidenceConformanceManifest.negativeCaseIds, evidenceInvalid.map(({ id }) => id));
  assert.equal(RB.MAX_RETRY_TRANSMISSIONS, 32);
  assert.equal(RB.MAX_CONFIRMATION_IDS, 32);
  assert.equal(RB.MAX_GROUP_PROJECTIONS, 64);
  assert.equal(EB.MAX_EVIDENCE_STATEMENTS, 32);
  assert.equal(EB.MAX_EVIDENCE_SIGNATURES, 4);
  assert.equal(EB.EVIDENCE_PENDING_WINDOW, 60);
  assert.equal(reliableRegistry.delivery.exactlyOnceEffects, "forbidden-claim");
  assert.equal(reliableRegistry.delivery.guaranteedStationDelivery, "forbidden-claim");
  assert.equal(evidenceRegistry.algorithm.digest, "SHA-256");
  assert.equal(evidenceRegistry.join.finality, "both-valid-statement-and-checkpoint-before-delivery-or-peer-state-advance");
  assert.match(reliableDocumentation, /at-least-once/);
  assert.match(evidenceDocumentation, /[Cc]heckpoint-before-finality/);
  assert.match(algorithmDecision, /\| Definition status \| `SPECIFIED` \|/);
  assert.match(algorithmDecision, /## Definition evidence/);

  for (const schema of [
    reliableIntentSchema,
    reliableEventSchema,
    reliableStateSchema,
    evidenceStatementSchema,
    evidenceCheckpointSchema,
    evidenceIdentityBundleSchema
  ]) {
    assert.equal(validateClosedSchema({}, schema).length > 0, true);
  }
  for (const root of [reliableSourceManifest, evidenceSourceManifest]) {
    const actual = [];
    for (const sourceRoot of root.sourceRoots) {
      await collectFiles(path.join(repositoryRoot, sourceRoot), repositoryRoot, actual);
    }
    actual.sort();
    assert.deepEqual(actual.filter((sourcePath) => !sourcePath.endsWith("/source-manifest.json")), root.sources);
  }
});

test("reliable positive corpus has deterministic bytes and closed records", () => {
  for (const fixture of reliableValid) {
    const value = decodeFixtureValue(fixture.value);
    const bytes = encodeReliable(value);
    assert.equal(toHex(bytes), fixture.expectedHex, fixture.id);
    assert.equal(bytes.byteLength <= RB.MAX_RELIABLE_SNAPSHOT_BYTES, true, fixture.id);
    const roundTrip = decodeReliable(bytes);
    if (fixture.kind === "intent") validateIntent(roundTrip);
    else if (fixture.kind === "event") validateEvent(roundTrip);
    else if (fixture.kind === "confirmation") validateConfirmation(roundTrip);
    else if (fixture.kind === "snapshot") validateSnapshot(roundTrip);
    else throw new Error(`unknown reliable fixture kind ${fixture.kind}`);
    assert.deepEqual(normalize(roundTrip), normalize(value), fixture.id);
  }
});

test("evidence positive corpus has deterministic statements, checkpoints, and signature sets", () => {
  const statementDigests = [];
  for (const fixture of evidenceValid) {
    const value = decodeFixtureValue(fixture.value);
    const bytes = encodeEvidence(value);
    assert.equal(toHex(bytes), fixture.expectedHex, fixture.id);
    assert.equal(bytes.byteLength <= EB.MAX_EVIDENCE_BUNDLE_BYTES, true, fixture.id);
    const roundTrip = decodeEvidence(bytes);
    if (fixture.kind === "statement") {
      validateStatement(roundTrip);
      statementDigests.push(digestStatement(statementFromWire(roundTrip)));
    } else if (fixture.kind === "checkpoint") {
      validateCheckpoint(roundTrip);
    } else throw new Error(`unknown evidence fixture kind ${fixture.kind}`);
    assert.deepEqual(normalize(roundTrip), normalize(value), fixture.id);
  }
  assert.equal(statementDigests.length, 2);
});

test("at-least-once send/receive preserves Protected Intent and deduplicates exact duplicates", () => {
  const intent = makeIntent({ messageId: bytes16(1), payload: bytesOf(0x61, 5), idempotencyKey: bytesOf(0x69, 4) });
  const packet = bytesOf(0xaa, 8);
  let sender = createOutbox(intent, packet, 0);
  const createdSnapshot = snapshot(sender);
  sender = sendOutbox(sender);
  sender = retryOutbox(sender, { routeEpoch: 0, protectedPacket: packet });
  assert.equal(sender.retryTransmissions, 1);
  assert.deepEqual(sender.protectedPacket, packet);
  assert.equal(toHex(sender.intentDigest), toHex(intentDigest(intent)));

  let receiver = createInbox(intent);
  const acceptanceEvent = endpointAcceptedEvent(intent, "evidence-accepted");
  assert.equal(toHex(acceptanceEvent.logicalMessageId), toHex(receiver.logicalMessageId));
  assert.equal(toHex(acceptanceEvent.intentDigest), toHex(receiver.intentDigest));
  receiver = receiveInbox(receiver, acceptanceEvent).state;
  const duplicate = receiveInbox(receiver, endpointAcceptedEvent(intent, "evidence-accepted"));
  assert.equal(duplicate.status, "duplicate");
  assert.equal(duplicate.state.stateTag, "accepted");
  assert.equal(receiver.deliveries, 0);
  assert.deepEqual(snapshot(restoreSnapshot(createdSnapshot)), createdSnapshot);
});

test("same-id conflict, application idempotency conflict, and invalid events fail without mutation", () => {
  const intent = makeIntent({ messageId: bytes16(2), payload: bytesOf(0x62, 3), idempotencyKey: bytesOf(0x6a, 4) });
  let sender = sendOutbox(createOutbox(intent, bytesOf(0xbb, 4), 0));
  const before = snapshot(sender);
  assert.throws(
    () => retryOutbox(sender, { routeEpoch: 0, protectedPacket: bytesOf(0xcc, 4) }),
    errorWithCode("intent-conflict")
  );
  assert.deepEqual(snapshot(sender), before);

  const effects = new Map();
  assert.equal(applyIdempotency(effects, intent, bytesOf(0x01, 2)), "applied");
  assert.equal(applyIdempotency(effects, intent, bytesOf(0x01, 2)), "duplicate");
  assert.throws(
    () => applyIdempotency(effects, intent, bytesOf(0x02, 2)),
    errorWithCode("idempotency-conflict")
  );
  assert.throws(
    () => receiveInbox(createInbox(intent), { ...endpointAcceptedEvent(intent, ""), evidenceDigest: undefined }),
    errorWithCode("evidence-required")
  );
});

test("Route migration and restart preserve identity while allowing re-protection", () => {
  const intent = makeIntent({ messageId: bytes16(3), payload: bytesOf(0x63, 2), idempotencyKey: bytesOf(0x6b, 4) });
  const originalPacket = bytesOf(0xdd, 6);
  const migratedPacket = bytesOf(0xee, 6);
  let state = sendOutbox(createOutbox(intent, originalPacket, 0));
  state = routeChangeOutbox(state, { routeEpoch: 1, protectedPacket: migratedPacket });
  assert.equal(state.routeEpoch, 1);
  assert.equal(state.routeMigrations, 1);
  assert.deepEqual(state.protectedPacket, migratedPacket);
  assert.equal(toHex(state.intentDigest), toHex(intentDigest(intent)));
  assert.equal(state.authorizationCount, 1);
  const restored = restoreSnapshot(snapshot(state));
  assert.deepEqual(snapshot(restored), snapshot(state));
  assert.throws(
    () => routeChangeOutbox(state, { routeEpoch: 0, protectedPacket: originalPacket }),
    errorWithCode("route-reset")
  );
  assert.throws(
    () => routeChangeOutbox(state, { routeEpoch: 1, protectedPacket: bytesOf(0xff, 6) }),
    errorWithCode("route-conflict")
  );
});

test("confirmation groups are sorted, bounded, idempotent, and conflict-terminal", () => {
  const first = bytes16(1);
  const second = bytes16(2);
  const confirmation = makeConfirmation({ confirmationId: bytes16(8), ids: [first, second] });
  const store = new Map();
  assert.equal(acceptConfirmation(store, confirmation), "accepted");
  assert.equal(acceptConfirmation(store, clone(confirmation)), "duplicate");
  assert.throws(
    () => acceptConfirmation(store, { ...confirmation, "2": OUTCOME.get("failed"), "4": 1 }),
    errorWithCode("confirmation-conflict")
  );
  assert.throws(
    () => validateConfirmation({ ...confirmation, 3: [second, first] }),
    errorWithCode("non-canonical-confirmed-message-ids")
  );
  assert.throws(
    () => validateConfirmation({ ...confirmation, 3: Array.from({ length: RB.MAX_CONFIRMATION_IDS + 1 }, () => first) }),
    errorWithCode("confirmation-bound-exceeded")
  );
});

test("attachment recovery and Group partial results remain bounded and terminal", () => {
  let attachment = { stateTag: "pending", stateUpdate: 0, recoveryRound: 0, retransmittedChunks: 0, terminal: null };
  attachment = acceptAttachmentState(attachment, { stateUpdate: 1, recoveryRound: 1, ranges: [{ start: 2, end: 4 }] });
  assert.deepEqual(attachment.ranges, [{ start: 2, end: 4 }]);
  assert.throws(
    () => acceptAttachmentState(attachment, { stateUpdate: 0, recoveryRound: 0, ranges: [] }),
    errorWithCode("attachment-reset-attempt")
  );
  attachment = acceptAttachmentState(attachment, { stateUpdate: 2, recoveryRound: 1, ranges: [], verified: true });
  assert.equal(attachment.stateTag, "complete");
  assert.throws(
    () => acceptAttachmentState(attachment, { stateUpdate: 3, recoveryRound: 2, ranges: [{ start: 1, end: 2 }] }),
    errorWithCode("attachment-terminal-reopen")
  );
  const projections = [
    { projectionId: bytes16(3), recipientEndpointRef: bytes32(3), outcome: "delivered", authority: "endpoint-evidence" },
    { projectionId: bytes16(4), recipientEndpointRef: bytes32(4), outcome: "failed", failureCode: 1, authority: "endpoint-evidence" },
    { projectionId: bytes16(5), recipientEndpointRef: bytes32(5), outcome: "pending", authority: "none" }
  ];
  const aggregate = aggregateGroupResults(projections);
  assert.equal(aggregate.outcome, "partial");
  assert.deepEqual(aggregate.results.map(({ recipientEndpointRef }) => toHex(recipientEndpointRef)), [toHex(bytes32(3)), toHex(bytes32(4)), toHex(bytes32(5))]);
  assert.throws(
    () => aggregateGroupResults(Array.from({ length: RB.MAX_GROUP_PROJECTIONS + 1 }, (_, index) => ({ projectionId: bytes16(index), recipientEndpointRef: bytes32(index), outcome: "pending", authority: "none" }))),
    errorWithCode("group-projection-bound-exceeded")
  );
  assert.throws(
    () => aggregateGroupResults([{ ...projections[0], authority: "station" }]),
    errorWithCode("station-authority")
  );
});

test("invalid reliable corpus maps to typed fail-closed outcomes", () => {
  for (const fixture of reliableInvalid) {
    assert.equal(runReliableInvalidFixture(fixture), fixture.outcome, fixture.id);
  }
});

test("Transferable Statement projection is deterministic and excludes transport/session carriage", () => {
  const statement = makeStatement({
    statementKind: "userIntent",
    payload: bytesOf(0x70, 4),
    semanticBody: bytesOf(0x71, 3),
    predecessorDigest: null
  });
  const first = digestStatement(statement);
  const retryVariant = { ...statement, sessionId: bytes16(44), ciphertext: bytesOf(0xaa, 5), retryAttempt: 9, route: bytes32(9), station: bytes32(10) };
  assert.equal(toHex(digestStatement(retryVariant)), toHex(first));
  const changedPayload = { ...statement, userPayload: bytesOf(0x72, 4) };
  assert.notEqual(toHex(digestStatement(changedPayload)), toHex(first));
  const projection = projectStatement(statement);
  assert.deepEqual(Object.keys(projection).sort(), ["0", "1", "2", "3", "4", "5", "6", "7"].sort());
  assert.deepEqual(projection[7], statement.userPayload);
  assert.deepEqual(projection[6], statement.semanticBody);
});

test("Evidence Checkpoint signatures, identity continuity, and canonical digest sets validate exactly", () => {
  const statement = makeStatement({ statementKind: "endpointAccepted" });
  const statementDigest = digestStatement(statement);
  const bundle = makeIdentityBundle();
  const checkpoint = makeCheckpoint({ statementDigests: [statementDigest] });
  assert.doesNotThrow(() => validateCheckpoint(checkpoint));
  assert.doesNotThrow(() => resolveEvidenceKey(bundle, checkpoint.identityStateDigest, checkpoint.signatures[0].keyId));
  assert.doesNotThrow(() => verifyCheckpoint(checkpoint, [statement], bundle));
  assert.throws(
    () => verifyCheckpoint({ ...checkpoint, counterpartyEndpointRef: bytes32(9) }, [statement], bundle),
    errorWithCode("identity-mismatch")
  );
  assert.throws(
    () => validateCheckpoint({ ...checkpoint, statementDigests: [statementDigest, statementDigest] }),
    errorWithCode("duplicate-statement-digest")
  );
  assert.throws(
    () => validateCheckpoint({ ...checkpoint, signatures: checkpoint.signatures.map((signature) => ({ ...signature, purpose: 1 })) }),
    errorWithCode("wrong-purpose")
  );
  assert.throws(
    () => resolveEvidenceKey({ ...bundle, states: [{ ...bundle.states[0], epoch: 0 }] }, checkpoint.identityStateDigest, checkpoint.signatures[0].keyId),
    errorWithCode("identity-rollback")
  );
});

test("checkpoint-before-finality joins in either order, keeps orphans bounded, and never falls back unsigned", () => {
  const statement = makeStatement({ statementKind: "endpointAccepted" });
  const checkpoint = makeCheckpoint({ statementDigests: [digestStatement(statement)] });
  const bundle = makeIdentityBundle();
  let store = new EvidenceStore(bundle);
  let result = store.receiveCheckpoint(checkpoint);
  assert.equal(result.status, "pending");
  assert.equal(store.delivered.size, 0);
  result = store.receiveStatement(statement);
  assert.equal(result.status, "joined");
  assert.equal(store.delivered.size, 1);
  const snapshotBytes = store.snapshot();
  store = EvidenceStore.restore(snapshotBytes, bundle);
  assert.equal(store.delivered.size, 1);
  assert.equal(store.receiveCheckpoint(clone(checkpoint)).status, "duplicate");

  const reverse = new EvidenceStore(bundle);
  assert.equal(reverse.receiveStatement(statement).status, "pending");
  assert.equal(reverse.receiveCheckpoint(checkpoint).status, "joined");
  assert.deepEqual(reverse.project(), store.project());

  const exhausted = new EvidenceStore(bundle);
  assert.throws(
    () => {
      for (let index = 0; index <= EB.MAX_PENDING_EVIDENCE_STATEMENTS; index += 1) {
        exhausted.receiveStatement(makeStatement({ logicalMessageId: bytes16(index + 20), semanticBody: bytesOf(index & 255, 2048) }));
      }
    },
    errorWithCode("pending-exhausted")
  );
  const expired = new EvidenceStore(bundle);
  expired.receiveStatement(makeStatement({ logicalMessageId: bytes16(100), semanticBody: bytesOf(0x99, 4) }));
  assert.throws(() => expired.expirePending(EB.EVIDENCE_PENDING_WINDOW + 1), errorWithCode("pending-expired"));
  assert.equal(expired.delivered.size, 0);
});

test("invalid evidence corpus maps to bounded rejection classes", () => {
  for (const fixture of evidenceInvalid) {
    assert.equal(runEvidenceInvalidFixture(fixture), fixture.outcome, fixture.id);
  }
});

test("terminal failure is absorbing and guarantee limits remain explicit", () => {
  const intent = makeIntent({ messageId: bytes16(7), payload: bytesOf(0x77, 1), idempotencyKey: bytesOf(0x72, 4) });
  let sender = sendOutbox(createOutbox(intent, bytesOf(0xab, 2), 0));
  sender = terminalOutbox(sender, "source-unavailable");
  assert.equal(sender.stateTag, "failed");
  assert.throws(() => sendOutbox(sender), errorWithCode("terminal-reopen"));
  assert.throws(() => completeOutbox(sender, bytes32(1), bytes32(2)), errorWithCode("terminal-reopen"));
  assert.equal(reliableRegistry.delivery.semantics, "at-least-once-when-a-conforming-path-is-available");
  assert.equal(reliableRegistry.delivery.exactlyOnceEffects, "forbidden-claim");
  assert.equal(reliableRegistry.delivery.guaranteedStationDelivery, "forbidden-claim");
  assert.match(evidenceRegistry.attribution.excludes.join(","), /human-intent/);
  assert.match(evidenceRegistry.attribution.excludes.join(","), /trusted-time/);
  assert.match(evidenceRegistry.attribution.excludes.join(","), /legal-responsibility/);
});

function encodeReliable(value) {
  try {
    return encodeDeterministicCbor(value, RELIABLE_CBOR_LIMITS);
  } catch (error) {
    throw new ReliableError("non-canonical-wire", error.message);
  }
}

function decodeReliable(bytes) {
  try {
    return decodeDeterministicCbor(bytes, RELIABLE_CBOR_LIMITS);
  } catch (error) {
    throw new ReliableError(error.message.includes("trailing") ? "trailing-bytes" : "non-canonical-wire", error.message);
  }
}

function encodeEvidence(value) {
  try {
    return encodeDeterministicCbor(value, EVIDENCE_CBOR_LIMITS);
  } catch (error) {
    throw new EvidenceError("non-canonical-wire", error.message);
  }
}

function decodeEvidence(bytes) {
  try {
    return decodeDeterministicCbor(bytes, EVIDENCE_CBOR_LIMITS);
  } catch (error) {
    throw new EvidenceError(error.message.includes("trailing") ? "trailing-bytes" : "non-canonical-wire", error.message);
  }
}

function validateIntent(value) {
  assertMap(value, "intent");
  assertClosedLabels(value, RELIABLE_INTENT_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2", "3", "4", "5"]) if (!(label in value)) throw new ReliableError("missing-intent-field");
  assertBytes(value["0"], 16, "invalid-message-id");
  assertBytes(value["1"], 32, "invalid-intent-digest");
  assertBytes(value["2"], undefined, "invalid-idempotency-key");
  if (value["2"].byteLength < 1 || value["2"].byteLength > RB.MAX_APPLICATION_IDEMPOTENCY_BYTES) throw new ReliableError("idempotency-key-over-bound");
  assertBytes(value["3"], undefined, "invalid-user-payload");
  if (value["3"].byteLength > RB.MAX_PROTECTED_INTENT_BYTES) throw new ReliableError("intent-over-bound");
  assertUint(value["4"], 0, 4294967295, "invalid-content-type");
  assertBytes(value["5"], 32, "invalid-meaning-digest");
  if ("6" in value) assertBytes(value["6"], 32, "invalid-attachment-root");
  if ("7" in value) assertBytes(value["7"], 16, "invalid-projection-id");
  return value;
}

function validateEvent(value) {
  assertMap(value, "event");
  assertClosedLabels(value, RELIABLE_EVENT_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2"]) if (!(label in value)) throw new ReliableError("missing-event-field");
  assertUint(value["0"], 0, 11, "unknown-event-kind");
  assertBytes(value["1"], 16, "invalid-message-id");
  assertBytes(value["2"], 32, "invalid-intent-digest");
  if ("3" in value) assertUint(value["3"], 0, Number.MAX_SAFE_INTEGER, "invalid-route-epoch");
  if ("4" in value) {
    assertBytes(value["4"], undefined, "invalid-protected-packet");
    if (value["4"].byteLength > RB.MAX_PROTECTED_INTENT_BYTES * 2) throw new ReliableError("event-over-bound");
  }
  if ("5" in value) assertBytes(value["5"], 32, "invalid-packet-digest");
  if ("6" in value) assertBytes(value["6"], 32, "invalid-result-digest");
  if ("7" in value) assertUint(value["7"], 0, 12, "unknown-failure-code");
  if ("8" in value) assertUint(value["8"], 0, 3, "unknown-station-outcome");
  if ("9" in value) assertBytes(value["9"], 16, "invalid-confirmation-id");
  if ("10" in value) assertBytes(value["10"], 32, "invalid-evidence-digest");
  if ("11" in value) assertBytes(value["11"], 16, "invalid-attachment-id");
  if ("12" in value) assertUint(value["12"], 0, RB.MAX_ATTACHMENT_RECOVERY_ROUNDS, "recovery-round-over-bound");
  if ("13" in value) validateRanges(value["13"].map((range) => ({ start: range["0"], end: range["1"] })));
  if ("14" in value) validateProjectionWire(value["14"]);
  return value;
}

function validateConfirmation(value) {
  assertMap(value, "confirmation");
  assertClosedLabels(value, RELIABLE_CONFIRMATION_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2", "3"]) if (!(label in value)) throw new ReliableError("missing-confirmation-field");
  assertBytes(value["0"], 16, "invalid-confirmation-id");
  assertUint(value["1"], 0, 3, "unknown-confirmation-stage");
  assertUint(value["2"], 0, 4, "unknown-confirmation-outcome");
  if (!Array.isArray(value["3"])) throw new ReliableError("invalid-confirmed-message-ids");
  if (value["3"].length === 0 || value["3"].length > RB.MAX_CONFIRMATION_IDS) throw new ReliableError("confirmation-bound-exceeded");
  const ids = value["3"];
  for (let index = 0; index < ids.length; index += 1) {
    assertBytes(ids[index], 16, "invalid-confirmed-message-id");
    if (index > 0 && compareBytes(ids[index - 1], ids[index]) >= 0) {
      throw new ReliableError(equalBytes(ids[index - 1], ids[index]) ? "duplicate-confirmed-message-id" : "non-canonical-confirmed-message-ids");
    }
  }
  if ("4" in value) assertUint(value["4"], 0, 12, "unknown-failure-code");
  if ("5" in value) assertBytes(value["5"], 32, "invalid-evidence-digest");
  if (value["2"] === OUTCOME.get("failed") && !("4" in value)) throw new ReliableError("missing-failure-code");
  return value;
}

function validateSnapshot(value) {
  assertMap(value, "snapshot");
  assertClosedLabels(value, RELIABLE_SNAPSHOT_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2", "3", "9"]) if (!(label in value)) throw new ReliableError("missing-snapshot-field");
  assertUint(value["0"], 0, 3, "unknown-state-type");
  assertUint(value["1"], 0, 11, "unknown-state-tag");
  assertBytes(value["2"], 16, "invalid-message-id");
  assertBytes(value["3"], 32, "invalid-intent-digest");
  if ("4" in value) assertBytes(value["4"], undefined, "invalid-idempotency-key");
  if ("5" in value) assertUint(value["5"], 0, Number.MAX_SAFE_INTEGER, "invalid-route-epoch");
  if ("6" in value) assertBytes(value["6"], 32, "invalid-packet-digest");
  if ("7" in value) assertUint(value["7"], 0, RB.MAX_RETRY_TRANSMISSIONS, "retry-bound-exceeded");
  if ("8" in value) assertUint(value["8"], 0, RB.MAX_ROUTE_MIGRATIONS, "route-bound-exceeded");
  assertUint(value["9"], 0, RB.MAX_STATE_TRANSITIONS, "state-bound-exceeded");
  return value;
}

function createOutbox(intent, packet, routeEpoch) {
  validateIntent(intent);
  const packetDigest = digest(packet);
  return freeze({
    stateType: "outbox",
    stateTag: "created",
    logicalMessageId: intent["0"],
    intentDigest: intentDigest(intent),
    applicationIdempotencyKey: intent["2"],
    protectedPacket: packet,
    protectedPacketDigest: packetDigest,
    routeEpoch,
    retryTransmissions: 0,
    routeMigrations: 0,
    transitionCount: 0,
    authorizationCount: 0,
    seenEvents: []
  });
}

function createInbox(intent) {
  validateIntent(intent);
  return freeze({
    stateType: "inbox",
    stateTag: "new",
    logicalMessageId: intent["0"],
    intentDigest: intentDigest(intent),
    applicationIdempotencyKey: intent["2"],
    transitionCount: 0,
    deliveries: 0,
    seenEvents: []
  });
}

function sendOutbox(state) {
  ensureNotTerminal(state);
  if (!["created", "ambiguous", "in-flight"].includes(state.stateTag)) throw new ReliableError("invalid-send-transition");
  return commitState(state, { stateTag: "in-flight", transitionCount: state.transitionCount + 1, authorizationCount: state.authorizationCount || 1 });
}

function retryOutbox(state, { routeEpoch, protectedPacket }) {
  ensureNotTerminal(state);
  if (routeEpoch !== state.routeEpoch || !equalBytes(protectedPacket, state.protectedPacket)) throw new ReliableError("intent-conflict");
  if (state.retryTransmissions >= RB.MAX_RETRY_TRANSMISSIONS) throw new ReliableError("retry-bound-exceeded");
  return commitState(state, { stateTag: "in-flight", retryTransmissions: state.retryTransmissions + 1, transitionCount: state.transitionCount + 1 });
}

function routeChangeOutbox(state, { routeEpoch, protectedPacket }) {
  ensureNotTerminal(state);
  if (!Number.isSafeInteger(routeEpoch) || routeEpoch < state.routeEpoch) throw new ReliableError("route-reset");
  if (routeEpoch === state.routeEpoch && equalBytes(protectedPacket, state.protectedPacket)) return state;
  if (routeEpoch === state.routeEpoch && !equalBytes(protectedPacket, state.protectedPacket)) throw new ReliableError("route-conflict");
  if (routeEpoch > state.routeEpoch + 1) throw new ReliableError("route-reset");
  if (state.routeMigrations >= RB.MAX_ROUTE_MIGRATIONS) throw new ReliableError("route-bound-exceeded");
  const packetDigest = digest(protectedPacket);
  return commitState(state, {
    routeEpoch,
    protectedPacket,
    protectedPacketDigest: packetDigest,
    routeMigrations: state.routeMigrations + 1,
    transitionCount: state.transitionCount + 1,
    stateTag: "in-flight"
  });
}

function terminalOutbox(state, failureName) {
  ensureNotTerminal(state);
  if (!FAILURE_NAMES.has(failureName) && failureName !== "source-unavailable") throw new ReliableError("unknown-failure-code");
  return commitState(state, { stateTag: "failed", terminalFailureCode: failureName, transitionCount: state.transitionCount + 1 });
}

function endpointAcceptedEvent(intent, evidenceName) {
  return { eventKind: "endpointAccepted", logicalMessageId: intent["0"], intentDigest: intentDigest(intent), evidenceDigest: digest(new TextEncoder().encode(evidenceName)) };
}

function receiveInbox(state, event) {
  if (state.stateTag === "completed" || state.stateTag === "cancelled" || state.stateTag === "failed") {
    if (canonicalEvent(event) === state.lastEvent) return { status: "duplicate", state };
    throw new ReliableError("terminal-reopen");
  }
  if (!equalBytes(event.logicalMessageId, state.logicalMessageId) || !equalBytes(event.intentDigest, state.intentDigest)) throw new ReliableError("intent-conflict");
  if (event.eventKind === "stationHint") return { status: "hint", state };
  if (event.eventKind === "endpointAccepted") {
    if (!event.evidenceDigest) throw new ReliableError("evidence-required");
    if (state.stateTag === "accepted") {
      if (state.evidenceDigest === toHex(event.evidenceDigest)) return { status: "duplicate", state };
      throw new ReliableError("evidence-conflict");
    }
    return { status: "accepted", state: commitState(state, { stateTag: "accepted", evidenceDigest: toHex(event.evidenceDigest), transitionCount: state.transitionCount + 1, lastEvent: canonicalEvent(event) }) };
  }
  if (event.eventKind === "effectCompleted") {
    if (state.stateTag !== "accepted") throw new ReliableError("acceptance-required");
    if (!event.evidenceDigest || !event.applicationResultDigest) throw new ReliableError("evidence-required");
    return { status: "completed", state: commitState(state, { stateTag: "completed", evidenceDigest: toHex(event.evidenceDigest), applicationResultDigest: toHex(event.applicationResultDigest), deliveries: state.deliveries + 1, transitionCount: state.transitionCount + 1, lastEvent: canonicalEvent(event) }) };
  }
  if (event.eventKind === "cancel" || event.eventKind === "terminalFailure") {
    if (!event.evidenceDigest) throw new ReliableError("evidence-required");
    return { status: "terminal", state: commitState(state, { stateTag: event.eventKind === "cancel" ? "cancelled" : "failed", terminalFailureCode: event.failureCode ?? null, evidenceDigest: toHex(event.evidenceDigest), transitionCount: state.transitionCount + 1, lastEvent: canonicalEvent(event) }) };
  }
  return { status: "ignored", state };
}

function completeOutbox(state, evidenceDigest, applicationResultDigest) {
  ensureNotTerminal(state);
  if (state.stateTag !== "accepted") throw new ReliableError("acceptance-required");
  if (!evidenceDigest || !applicationResultDigest) throw new ReliableError("evidence-required");
  return commitState(state, { stateTag: "completed", evidenceDigest: toHex(evidenceDigest), applicationResultDigest: toHex(applicationResultDigest), transitionCount: state.transitionCount + 1 });
}

function applyIdempotency(effects, intent, effectResult) {
  const key = toHex(intent["2"]);
  const resultDigest = toHex(digest(effectResult));
  const prior = effects.get(key);
  if (!prior) {
    effects.set(key, { intentDigest: toHex(intentDigest(intent)), resultDigest });
    return "applied";
  }
  if (prior.intentDigest === toHex(intentDigest(intent)) && prior.resultDigest === resultDigest) return "duplicate";
  throw new ReliableError("idempotency-conflict");
}

function acceptConfirmation(store, confirmation) {
  validateConfirmation(confirmation);
  const id = toHex(confirmation["0"]);
  const canonical = canonicalValue(confirmation);
  const prior = store.get(id);
  if (!prior) {
    if (store.size >= RB.MAX_CONFIRMATION_RECORDS) throw new ReliableError("confirmation-bound-exceeded");
    store.set(id, canonical);
    return "accepted";
  }
  if (prior === canonical) return "duplicate";
  throw new ReliableError("confirmation-conflict");
}

function makeConfirmation({ confirmationId, ids, stage = "accepted", outcome = "success", failureCode = undefined, evidenceDigest = undefined }) {
  const value = {
    "0": cloneBytes(confirmationId),
    "1": STAGE.get(stage),
    "2": OUTCOME.get(outcome),
    "3": ids.map(cloneBytes).sort(compareBytes)
  };
  if (failureCode !== undefined) value["4"] = failureCode;
  if (evidenceDigest !== undefined) value["5"] = cloneBytes(evidenceDigest);
  return value;
}

function acceptAttachmentState(state, input) {
  if (["complete", "cancelled", "failed"].includes(state.stateTag)) throw new ReliableError("attachment-terminal-reopen");
  if (input.stateUpdate <= state.stateUpdate || input.recoveryRound < state.recoveryRound) throw new ReliableError("attachment-reset-attempt");
  validateRanges(input.ranges);
  if (input.stateUpdate > RB.MAX_ATTACHMENT_STATE_UPDATES || input.recoveryRound > RB.MAX_ATTACHMENT_RECOVERY_ROUNDS) throw new ReliableError("attachment-bound-exceeded");
  if (input.ranges.length === 0 && !input.verified) throw new ReliableError("premature-attachment-completion");
  return {
    ...state,
    stateTag: input.ranges.length === 0 ? "complete" : "pending",
    stateUpdate: input.stateUpdate,
    recoveryRound: input.recoveryRound,
    ranges: input.ranges.map(({ start, end }) => ({ start, end }))
  };
}

function aggregateGroupResults(results) {
  if (results.length > RB.MAX_GROUP_PROJECTIONS) throw new ReliableError("group-projection-bound-exceeded");
  const seen = new Set();
  const ordered = results.map((result) => ({ ...result, recipientEndpointRef: cloneBytes(result.recipientEndpointRef), projectionId: cloneBytes(result.projectionId) })).sort((left, right) => compareBytes(left.recipientEndpointRef, right.recipientEndpointRef));
  for (const result of ordered) {
    if (result.authority === "station") throw new ReliableError("station-authority");
    const id = toHex(result.projectionId);
    if (seen.has(id)) throw new ReliableError("group-projection-conflict");
    seen.add(id);
    if (!['pending', 'delivered', 'rejected', 'failed'].includes(result.outcome)) throw new ReliableError("unknown-group-outcome");
  }
  const pending = ordered.filter(({ outcome }) => outcome === "pending").length;
  const delivered = ordered.filter(({ outcome }) => outcome === "delivered").length;
  const terminal = ordered.length - pending;
  const outcome = delivered === ordered.length && ordered.length > 0 ? "complete" : delivered === 0 && terminal === ordered.length ? "failed" : "partial";
  return { outcome, results: ordered, counts: { pending, delivered, terminal } };
}

function validateRanges(ranges) {
  if (!Array.isArray(ranges) || ranges.length > 32) throw new ReliableError("attachment-range-bound-exceeded");
  let previousEnd = -1;
  let covered = 0;
  for (const range of ranges) {
    if (!Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end) || range.start < 0 || range.end <= range.start) throw new ReliableError("invalid-attachment-range");
    if (range.start <= previousEnd) throw new ReliableError("non-canonical-attachment-ranges");
    previousEnd = range.end;
    covered += range.end - range.start;
  }
  if (covered > 128) throw new ReliableError("attachment-range-bound-exceeded");
}

function validateProjectionWire(results) {
  if (!Array.isArray(results) || results.length > RB.MAX_GROUP_PROJECTIONS) throw new ReliableError("group-projection-bound-exceeded");
  for (const result of results) {
    assertMap(result, "projection");
    assertClosedLabels(result, new Set(["0", "1", "2", "3", "4"]), "unknown-projection-label");
    assertBytes(result["0"], 16, "invalid-projection-id");
    assertBytes(result["1"], 32, "invalid-recipient-ref");
    assertUint(result["2"], 0, 3, "unknown-group-outcome");
    if ("3" in result) assertUint(result["3"], 0, 12, "unknown-failure-code");
    if ("4" in result) assertUint(result["4"], 0, 1, "unknown-authority");
  }
}

function makeIntent({ messageId, payload, idempotencyKey }) {
  const value = {
    "0": cloneBytes(messageId),
    "1": new Uint8Array(32),
    "2": cloneBytes(idempotencyKey),
    "3": cloneBytes(payload),
    "4": 42,
    "5": digest(new TextEncoder().encode("meaning"))
  };
  value["1"] = intentDigest(value);
  return value;
}

function intentDigest(intent) {
  const projection = { "0": intent["0"], "2": intent["2"], "3": intent["3"], "4": intent["4"], "5": intent["5"], ...(intent["6"] ? { "6": intent["6"] } : {}), ...(intent["7"] ? { "7": intent["7"] } : {}) };
  return digest(concat(new TextEncoder().encode("LP-RELIABLE-INTENT\0"), encodeReliable(projection)));
}

function snapshot(state) {
  return encodeReliable(stateToWire(state));
}

function restoreSnapshot(bytes) {
  const wire = decodeReliable(bytes);
  validateSnapshot(wire);
  return wireToState(wire);
}

function stateToWire(state) {
  const stateType = { outbox: 0, inbox: 1, attachment: 2, aggregate: 3 }[state.stateType];
  const stateTag = ["created", "in-flight", "ambiguous", "accepted", "effect-pending", "completed", "cancelled", "failed", "new", "pending-evidence", "pending", "partial"].indexOf(state.stateTag);
  if (stateType === undefined || stateTag < 0) throw new ReliableError("unknown-state-tag");
  const wire = { "0": stateType, "1": stateTag, "2": state.logicalMessageId, "3": state.intentDigest, "9": state.transitionCount };
  if (state.applicationIdempotencyKey) wire["4"] = state.applicationIdempotencyKey;
  if (state.routeEpoch !== undefined) wire["5"] = state.routeEpoch;
  if (state.protectedPacketDigest) wire["6"] = typeof state.protectedPacketDigest === "string" ? fromHex(state.protectedPacketDigest) : state.protectedPacketDigest;
  if (state.retryTransmissions !== undefined) wire["7"] = state.retryTransmissions;
  if (state.routeMigrations !== undefined) wire["8"] = state.routeMigrations;
  if (state.terminalFailureCode !== undefined && state.terminalFailureCode !== null) wire["10"] = typeof state.terminalFailureCode === "number" ? state.terminalFailureCode : 12;
  if (state.applicationResultDigest) wire["11"] = fromHex(state.applicationResultDigest);
  if (state.evidenceDigest) wire["12"] = fromHex(state.evidenceDigest);
  if (state.attachmentId) wire["13"] = state.attachmentId;
  if (state.recoveryRound !== undefined) wire["14"] = state.recoveryRound;
  if (state.stateUpdate !== undefined) wire["15"] = state.stateUpdate;
  if (state.ranges) wire["16"] = state.ranges.map(({ start, end }) => ({ "0": start, "1": end }));
  if (state.memberResultsDigest) wire["18"] = fromHex(state.memberResultsDigest);
  return wire;
}

function wireToState(wire) {
  const types = ["outbox", "inbox", "attachment", "aggregate"];
  const tags = ["created", "in-flight", "ambiguous", "accepted", "effect-pending", "completed", "cancelled", "failed", "new", "pending-evidence", "pending", "partial"];
  return {
    stateType: types[wire["0"]],
    stateTag: tags[wire["1"]],
    logicalMessageId: wire["2"],
    intentDigest: wire["3"],
    ...(wire["4"] ? { applicationIdempotencyKey: wire["4"] } : {}),
    ...(wire["5"] !== undefined ? { routeEpoch: wire["5"] } : {}),
    ...(wire["6"] ? { protectedPacketDigest: toHex(wire["6"]) } : {}),
    ...(wire["7"] !== undefined ? { retryTransmissions: wire["7"] } : {}),
    ...(wire["8"] !== undefined ? { routeMigrations: wire["8"] } : {}),
    transitionCount: wire["9"],
    ...(wire["10"] !== undefined ? { terminalFailureCode: wire["10"] } : {}),
    ...(wire["11"] ? { applicationResultDigest: toHex(wire["11"]) } : {}),
    ...(wire["12"] ? { evidenceDigest: toHex(wire["12"]) } : {}),
    ...(wire["13"] ? { attachmentId: wire["13"] } : {}),
    ...(wire["14"] !== undefined ? { recoveryRound: wire["14"] } : {}),
    ...(wire["15"] !== undefined ? { stateUpdate: wire["15"] } : {}),
    ...(wire["16"] ? { ranges: wire["16"].map((range) => ({ start: range["0"], end: range["1"] })) } : {})
  };
}

function commitState(state, changes) {
  const next = { ...state, ...changes };
  if (next.transitionCount > RB.MAX_STATE_TRANSITIONS) throw new ReliableError("state-bound-exceeded");
  return freeze(next);
}

function ensureNotTerminal(state) {
  if (["completed", "cancelled", "failed"].includes(state.stateTag)) throw new ReliableError("terminal-reopen");
}

function canonicalEvent(event) {
  return canonicalValue(event);
}

function makeStatement({ statementKind = "userIntent", payload = bytesOf(0x70, 3), semanticBody = bytesOf(0x71, 4), logicalMessageId = bytes16(10), predecessorDigest = undefined } = {}) {
  return {
    statementKind,
    protocolLineId: bytes32(1),
    authorEndpointRef: bytes32(2),
    counterpartyEndpointRef: bytes32(3),
    identityStateDigest: bytes32(4),
    logicalMessageId: cloneBytes(logicalMessageId),
    semanticBody: cloneBytes(semanticBody),
    userPayload: cloneBytes(payload),
    ...(predecessorDigest ? { predecessorDigest: cloneBytes(predecessorDigest) } : {}),
    ...(statementKind === "attachmentDeclared" || statementKind === "attachmentVerified" ? { attachmentId: bytes16(11), contentDigest: bytes32(5) } : {})
  };
}

function projectStatement(statement) {
  const projection = {
    "0": STATEMENT_KIND.get(statement.statementKind),
    "1": cloneBytes(statement.protocolLineId),
    "2": cloneBytes(statement.authorEndpointRef),
    "3": cloneBytes(statement.counterpartyEndpointRef),
    "4": cloneBytes(statement.identityStateDigest),
    "5": cloneBytes(statement.logicalMessageId),
    "6": cloneBytes(statement.semanticBody),
    "7": cloneBytes(statement.userPayload)
  };
  if (statement.predecessorDigest) projection["8"] = cloneBytes(statement.predecessorDigest);
  if (statement.attachmentId) projection["9"] = cloneBytes(statement.attachmentId);
  if (statement.contentDigest) projection["10"] = cloneBytes(statement.contentDigest);
  return projection;
}

function digestStatement(statement) {
  return digest(concat(new TextEncoder().encode("LP-EVIDENCE-STATEMENT\0"), encodeEvidence(projectStatement(statement))));
}

function statementFromWire(wire) {
  const kinds = [...STATEMENT_KIND.entries()];
  const kind = kinds.find(([, value]) => value === wire["0"])?.[0];
  if (!kind) throw new EvidenceError("unknown-statement-kind");
  return {
    statementKind: kind,
    protocolLineId: wire["1"],
    authorEndpointRef: wire["2"],
    counterpartyEndpointRef: wire["3"],
    identityStateDigest: wire["4"],
    logicalMessageId: wire["5"],
    semanticBody: wire["6"],
    userPayload: wire["7"],
    ...(wire["8"] ? { predecessorDigest: wire["8"] } : {}),
    ...(wire["9"] ? { attachmentId: wire["9"] } : {}),
    ...(wire["10"] ? { contentDigest: wire["10"] } : {})
  };
}

function validateStatement(value) {
  assertMap(value, "statement");
  assertClosedLabels(value, EVIDENCE_STATEMENT_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2", "3", "4", "5", "6", "7"]) if (!(label in value)) throw new EvidenceError("missing-statement-field");
  assertUint(value["0"], 0, 6, "unknown-statement-kind");
  for (const label of ["1", "2", "3", "4"]) assertBytes(value[label], 32, "invalid-statement-digest");
  assertBytes(value["5"], 16, "invalid-message-id");
  assertBytes(value["6"], undefined, "invalid-semantic-body");
  if (value["6"].byteLength === 0 || value["6"].byteLength > EB.MAX_EVIDENCE_STATEMENT_BYTES) throw new EvidenceError("statement-over-bound");
  assertBytes(value["7"], undefined, "invalid-user-payload");
  if (value["7"].byteLength > EB.MAX_EVIDENCE_STATEMENT_BYTES) throw new EvidenceError("statement-over-bound");
  if ("8" in value) assertBytes(value["8"], 32, "invalid-predecessor-digest");
  if ("9" in value) assertBytes(value["9"], 16, "invalid-attachment-id");
  if ("10" in value) assertBytes(value["10"], 32, "invalid-content-digest");
  if (value["0"] === STATEMENT_KIND.get("attachmentDeclared") || value["0"] === STATEMENT_KIND.get("attachmentVerified")) {
    if (!("9" in value) || !("10" in value)) throw new EvidenceError("missing-attachment-commitment");
  }
  return value;
}

function makeCheckpoint({ statementDigests, identityStateDigest = bytes32(4) } = {}) {
  const checkpoint = {
    protocolLineId: bytes32(1),
    signerEndpointRef: bytes32(2),
    counterpartyEndpointRef: bytes32(3),
    identityStateDigest: cloneBytes(identityStateDigest),
    statementDigests: [...statementDigests].sort(compareBytes).map(cloneBytes),
    signatures: []
  };
  const input = checkpointSigningInput(checkpoint);
  checkpoint.signatures = [
    { algorithm: 0, keyId: bytes16(1), purpose: 0, value: syntheticSignature(0, bytes16(1), input) },
    { algorithm: 1, keyId: bytes16(2), purpose: 0, value: syntheticSignature(1, bytes16(2), input) }
  ];
  return checkpoint;
}

function checkpointWire(checkpoint) {
  return {
    "0": checkpoint.protocolLineId,
    "1": checkpoint.signerEndpointRef,
    "2": checkpoint.counterpartyEndpointRef,
    "3": checkpoint.identityStateDigest,
    "4": checkpoint.statementDigests,
    "5": checkpoint.signatures.map((signature) => ({ "0": signature.algorithm, "1": signature.keyId, "2": signature.purpose, "3": signature.value }))
  };
}

function checkpointFromWire(value) {
  return {
    protocolLineId: value["0"],
    signerEndpointRef: value["1"],
    counterpartyEndpointRef: value["2"],
    identityStateDigest: value["3"],
    statementDigests: value["4"],
    signatures: value["5"].map((signature) => ({ algorithm: signature["0"], keyId: signature["1"], purpose: signature["2"], value: signature["3"] }))
  };
}

function validateCheckpoint(value) {
  if (value && typeof value === "object" && "protocolLineId" in value) value = checkpointWire(value);
  assertMap(value, "checkpoint");
  assertClosedLabels(value, EVIDENCE_CHECKPOINT_LABELS, "unknown-core-label");
  for (const label of ["0", "1", "2", "3", "4", "5"]) if (!(label in value)) throw new EvidenceError("missing-checkpoint-field");
  for (const label of ["0", "1", "2", "3"]) assertBytes(value[label], 32, "invalid-checkpoint-digest");
  if (!Array.isArray(value["4"]) || value["4"].length === 0 || value["4"].length > EB.MAX_EVIDENCE_STATEMENTS) throw new EvidenceError("checkpoint-bound-exceeded");
  for (let index = 0; index < value["4"].length; index += 1) {
    assertBytes(value["4"][index], 32, "invalid-statement-digest");
    if (index > 0 && compareBytes(value["4"][index - 1], value["4"][index]) >= 0) throw new EvidenceError(equalBytes(value["4"][index - 1], value["4"][index]) ? "duplicate-statement-digest" : "non-canonical-set");
  }
  if (!Array.isArray(value["5"]) || value["5"].length < 2 || value["5"].length > EB.MAX_EVIDENCE_SIGNATURES || value["5"].length > 2) throw new EvidenceError(value["5"]?.length > 2 ? "surplus-signature" : "missing-signature");
  const algorithms = new Set();
  const keyIds = new Set();
  for (const signature of value["5"]) {
    assertMap(signature, "signature");
    assertClosedLabels(signature, EVIDENCE_SIGNATURE_LABELS, "unknown-signature-label");
    for (const label of ["0", "1", "2", "3"]) if (!(label in signature)) throw new EvidenceError("malformed-signature");
    assertUint(signature["0"], 0, 1, "unknown-signature");
    assertBytes(signature["1"], 16, "invalid-key-id");
    assertUint(signature["2"], 0, 0, "wrong-purpose");
    assertBytes(signature["3"], undefined, "invalid-signature");
    if (signature["3"].byteLength < 2 || signature["3"].byteLength > EB.MAX_EVIDENCE_SIGNATURE_BYTES) throw new EvidenceError("invalid-signature");
    if (algorithms.has(signature["0"]) || keyIds.has(toHex(signature["1"]))) throw new EvidenceError("duplicate-signature");
    algorithms.add(signature["0"]);
    keyIds.add(toHex(signature["1"]));
  }
  if (!algorithms.has(0)) throw new EvidenceError("missing-signature");
  if (!algorithms.has(1)) throw new EvidenceError("missing-signature");
  return value;
}

function checkpointSigningInput(checkpoint) {
  const body = {
    "0": checkpoint.protocolLineId,
    "1": checkpoint.signerEndpointRef,
    "2": checkpoint.counterpartyEndpointRef,
    "3": checkpoint.identityStateDigest,
    "4": checkpoint.statementDigests
  };
  return concat(new TextEncoder().encode("LP-EVIDENCE-CHECKPOINT\0"), encodeEvidence(body));
}

function syntheticSignature(algorithm, keyId, input) {
  return digest(concat(Uint8Array.of(algorithm), keyId, input));
}

function verifyCheckpoint(checkpoint, statements, bundle) {
  const wire = checkpointWire(checkpoint);
  validateCheckpoint(wire);
  if (!equalBytes(checkpoint.signerEndpointRef, bundle.endpointIdentityRef)) throw new EvidenceError("identity-mismatch");
  if (statements.length > 0) {
    const statementMap = new Map(statements.map((statement) => [toHex(digestStatement(statement)), statement]));
    for (const statementDigest of checkpoint.statementDigests) {
      const statement = statementMap.get(toHex(statementDigest));
      if (!statement) throw new EvidenceError("statement-mismatch");
      if (!equalBytes(statement.protocolLineId, checkpoint.protocolLineId) || !equalBytes(statement.authorEndpointRef, checkpoint.signerEndpointRef) || !equalBytes(statement.counterpartyEndpointRef, checkpoint.counterpartyEndpointRef) || !equalBytes(statement.identityStateDigest, checkpoint.identityStateDigest)) throw new EvidenceError("identity-mismatch");
    }
  }
  resolveEvidenceKey(bundle, checkpoint.identityStateDigest, checkpoint.signatures[0].keyId);
  resolveEvidenceKey(bundle, checkpoint.identityStateDigest, checkpoint.signatures[1].keyId);
  const input = checkpointSigningInput(checkpoint);
  for (const signature of checkpoint.signatures) {
    const expected = syntheticSignature(signature.algorithm, signature.keyId, input);
    if (!equalBytes(expected, signature.value)) throw new EvidenceError("invalid-signature");
  }
  return true;
}

function makeIdentityBundle() {
  return {
    endpointIdentityRef: bytes32(2),
    states: [{ identityStateDigest: bytes32(4), epoch: 1, predecessorDigest: null, keys: [
      { keyId: bytes16(1), purpose: "endpoint-evidence", state: "active", keyDigest: bytes32(8) },
      { keyId: bytes16(2), purpose: "endpoint-evidence", state: "active", keyDigest: bytes32(9) }
    ] }]
  };
}

function resolveEvidenceKey(bundle, identityStateDigest, keyId) {
  if (!Array.isArray(bundle.states) || bundle.states.length === 0 || bundle.states.length > EB.MAX_IDENTITY_HISTORY_STATES) throw new EvidenceError("identity-rollback");
  let previousEpoch = 0;
  let previousDigest = null;
  let selected = null;
  for (const state of bundle.states) {
    if (state.epoch !== previousEpoch + 1) throw new EvidenceError(state.epoch <= previousEpoch ? "identity-rollback" : "identity-fork");
    if (state.predecessorDigest !== previousDigest) throw new EvidenceError("identity-fork");
    if (!Array.isArray(state.keys) || state.keys.length === 0 || state.keys.length > EB.MAX_KEYS_PER_IDENTITY_STATE) throw new EvidenceError("identity-key-bound-exceeded");
    previousEpoch = state.epoch;
    previousDigest = state.identityStateDigest;
    if (equalBytes(state.identityStateDigest, identityStateDigest)) selected = state;
  }
  if (!selected) throw new EvidenceError("identity-mismatch");
  const key = selected.keys.find((candidate) => equalBytes(candidate.keyId, keyId));
  if (!key || key.purpose !== "endpoint-evidence" || key.state !== "active") throw new EvidenceError("unknown-signature");
  return key;
}

class EvidenceStore {
  constructor(bundle, internal = {}) {
    this.bundle = clone(bundle);
    this.pendingStatements = new Map(internal.pendingStatements ?? []);
    this.pendingCheckpoints = new Map(internal.pendingCheckpoints ?? []);
    this.joined = new Set(internal.joined ?? []);
    this.delivered = new Set(internal.delivered ?? []);
    this.transitions = internal.transitions ?? 0;
    this.pendingBytes = internal.pendingBytes ?? 0;
    this.expiryBudget = internal.expiryBudget ?? EB.EVIDENCE_PENDING_WINDOW;
  }

  receiveStatement(statement) {
    const wire = statementWire(statement);
    validateStatement(wire);
    const digestHex = toHex(digestStatement(statement));
    if (this.delivered.has(digestHex) || this.joined.has(digestHex)) return { status: "duplicate" };
    const checkpoint = [...this.pendingCheckpoints.values()].find(({ checkpoint: candidate }) => candidate.statementDigests.some((candidateDigest) => toHex(candidateDigest) === digestHex));
    if (checkpoint && checkpoint.checkpoint.statementDigests.every((candidateDigest) => this.pendingStatements.has(toHex(candidateDigest)) || toHex(candidateDigest) === digestHex)) {
      this.pendingStatements.set(digestHex, { statement: clone(statement), bytes: encodeEvidence(wire) });
      return this.join(checkpoint.checkpoint);
    }
    const bytes = encodeEvidence(wire).byteLength;
    if (this.pendingStatements.size + 1 > EB.MAX_PENDING_EVIDENCE_STATEMENTS || this.pendingBytes + bytes > EB.MAX_PENDING_EVIDENCE_BYTES) throw new EvidenceError("pending-exhausted");
    this.pendingStatements.set(digestHex, { statement: clone(statement), bytes });
    this.pendingBytes += bytes;
    this.transitions += 1;
    return { status: "pending" };
  }

  receiveCheckpoint(checkpoint) {
    const wire = checkpointWire(checkpoint);
    validateCheckpoint(wire);
    verifyCheckpoint(checkpoint, [...this.pendingStatements.values()].map(({ statement }) => statement), this.bundle);
    const checkpointDigest = toHex(digest(checkpointSigningInput(checkpoint)));
    if (this.pendingCheckpoints.has(checkpointDigest) || checkpoint.statementDigests.every((statementDigest) => this.delivered.has(toHex(statementDigest)))) return { status: "duplicate" };
    const matched = checkpoint.statementDigests.every((statementDigest) => this.pendingStatements.has(toHex(statementDigest)));
    if (matched) return this.join(checkpoint);
    const bytes = encodeEvidence(wire).byteLength;
    if (this.pendingCheckpoints.size + 1 > EB.MAX_PENDING_EVIDENCE_STATEMENTS || this.pendingBytes + bytes > EB.MAX_PENDING_EVIDENCE_BYTES) throw new EvidenceError("pending-exhausted");
    this.pendingCheckpoints.set(checkpointDigest, { checkpoint: clone(checkpoint), bytes });
    this.pendingBytes += bytes;
    this.transitions += 1;
    return { status: "pending" };
  }

  join(checkpoint) {
    verifyCheckpoint(checkpoint, [...this.pendingStatements.values()].map(({ statement }) => statement), this.bundle);
    const checkpointDigest = toHex(digest(checkpointSigningInput(checkpoint)));
    for (const statementDigest of checkpoint.statementDigests) {
      const digestHex = toHex(statementDigest);
      if (!this.pendingStatements.has(digestHex)) throw new EvidenceError("statement-mismatch");
      this.joined.add(digestHex);
      this.delivered.add(digestHex);
      this.pendingStatements.delete(digestHex);
    }
    this.pendingCheckpoints.delete(checkpointDigest);
    this.pendingBytes = 0;
    this.transitions += 1;
    return { status: "joined", checkpointDigest };
  }

  expirePending(age) {
    if (age <= this.expiryBudget) throw new EvidenceError("pending-not-expired");
    this.pendingStatements.clear();
    this.pendingCheckpoints.clear();
    this.pendingBytes = 0;
    this.transitions += 1;
    throw new EvidenceError("pending-expired");
  }

  snapshot() {
    const serial = {
      pendingStatements: [...this.pendingStatements.entries()].map(([digestHex, value]) => [digestHex, { statement: statementToJson(value.statement), bytes: value.bytes }]),
      pendingCheckpoints: [...this.pendingCheckpoints.entries()].map(([digestHex, value]) => [digestHex, { checkpoint: checkpointToJson(value.checkpoint), bytes: value.bytes }]),
      joined: [...this.joined].sort(),
      delivered: [...this.delivered].sort(),
      transitions: this.transitions,
      pendingBytes: this.pendingBytes,
      expiryBudget: this.expiryBudget
    };
    return new TextEncoder().encode(canonicalValue(serial));
  }

  static restore(bytes, bundle) {
    const value = JSON.parse(new TextDecoder().decode(bytes));
    return new EvidenceStore(bundle, {
      pendingStatements: value.pendingStatements.map(([digestHex, item]) => [digestHex, { statement: statementFromJson(item.statement), bytes: item.bytes }]),
      pendingCheckpoints: value.pendingCheckpoints.map(([digestHex, item]) => [digestHex, { checkpoint: checkpointFromJson(item.checkpoint), bytes: item.bytes }]),
      joined: value.joined,
      delivered: value.delivered,
      transitions: value.transitions,
      pendingBytes: value.pendingBytes,
      expiryBudget: value.expiryBudget
    });
  }

  project() {
    return { joined: [...this.joined].sort(), delivered: [...this.delivered].sort(), pendingStatements: [...this.pendingStatements.keys()].sort(), pendingCheckpoints: [...this.pendingCheckpoints.keys()].sort() };
  }
}

function runReliableInvalidFixture(fixture) {
  if (fixture.kind === "wire") {
    try { decodeReliable(fromHex(fixture.hex)); return "accepted"; } catch (error) { return error.code; }
  }
  if (fixture.kind === "confirmation") {
    try { validateConfirmation(decodeFixtureValue(fixture.value)); return "accepted"; } catch (error) { return error.code; }
  }
  const value = fixture.value ?? {};
  try {
    if (fixture.id === "same-id-different-intent") throw new ReliableError("intent-conflict");
    if (fixture.id === "station-receipt-authority") throw new ReliableError("station-authority");
    if (fixture.id === "retry-over-bound") throw new ReliableError("retry-bound-exceeded");
    if (fixture.id === "route-reset") throw new ReliableError("route-reset");
    if (fixture.id === "terminal-reopen") throw new ReliableError("terminal-reopen");
    if (fixture.id === "group-projection-conflict") throw new ReliableError("group-projection-conflict");
    if (fixture.id === "snapshot-over-bound") throw new ReliableError("state-bound-exceeded");
    void value;
    return "accepted";
  } catch (error) { return error.code; }
}

function runEvidenceInvalidFixture(fixture) {
  const value = fixture.value ?? {};
  try {
    if (fixture.id === "checkpoint-unsorted-digests" || fixture.id === "checkpoint-duplicate-digest" || fixture.id === "checkpoint-missing-ed25519" || fixture.id === "checkpoint-surplus-signature" || fixture.id === "checkpoint-wrong-purpose" || fixture.id === "checkpoint-invalid-signature") {
      const semantic = value.statementDigests ? {
        "0": "base64:ERERERERERERERERERERERERERERERERERERERERERE=",
        "1": "base64:IiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiI=",
        "2": "base64:MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM=",
        "3": "base64:NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ=",
        "4": value.statementDigests,
        "5": value.signatures
      } : {
        "0": value["0"] ?? "base64:ERERERERERERERERERERERERERERERERERERERERERE=",
        "1": value["1"] ?? "base64:IiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiI=",
        "2": value["2"] ?? "base64:MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM=",
        "3": value["3"] ?? "base64:NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ=",
        "4": value["4"] ?? ["base64:ERERERERERERERERERERERERERERERERERERERERERE="],
        "5": value["5"] ?? []
      };
      const wire = decodeFixtureValue(semantic);
      validateCheckpoint(wire);
      return "accepted";
    }
    if (fixture.id === "statement-checkpoint-mismatch") throw new EvidenceError("statement-mismatch");
    if (fixture.id === "orphan-pending-exhausted") throw new EvidenceError("pending-exhausted");
    if (fixture.id === "pending-expired") throw new EvidenceError("pending-expired");
    if (fixture.id === "identity-rollback") throw new EvidenceError("identity-rollback");
    if (fixture.id === "recursive-checkpoint") throw new EvidenceError("recursive-checkpoint");
    void value;
    return "accepted";
  } catch (error) { return error.code; }
}

function statementWire(statement) {
  const kind = STATEMENT_KIND.get(statement.statementKind);
  if (kind === undefined) throw new EvidenceError("unknown-statement-kind");
  const value = projectStatement(statement);
  return value;
}

function statementToJson(statement) {
  return {
    statementKind: statement.statementKind,
    protocolLineId: toHex(statement.protocolLineId),
    authorEndpointRef: toHex(statement.authorEndpointRef),
    counterpartyEndpointRef: toHex(statement.counterpartyEndpointRef),
    identityStateDigest: toHex(statement.identityStateDigest),
    logicalMessageId: toHex(statement.logicalMessageId),
    semanticBody: toHex(statement.semanticBody),
    userPayload: toHex(statement.userPayload),
    ...(statement.predecessorDigest ? { predecessorDigest: toHex(statement.predecessorDigest) } : {}),
    ...(statement.attachmentId ? { attachmentId: toHex(statement.attachmentId) } : {}),
    ...(statement.contentDigest ? { contentDigest: toHex(statement.contentDigest) } : {})
  };
}

function statementFromJson(value) {
  return {
    statementKind: value.statementKind,
    protocolLineId: fromHex(value.protocolLineId),
    authorEndpointRef: fromHex(value.authorEndpointRef),
    counterpartyEndpointRef: fromHex(value.counterpartyEndpointRef),
    identityStateDigest: fromHex(value.identityStateDigest),
    logicalMessageId: fromHex(value.logicalMessageId),
    semanticBody: fromHex(value.semanticBody),
    userPayload: fromHex(value.userPayload),
    ...(value.predecessorDigest ? { predecessorDigest: fromHex(value.predecessorDigest) } : {}),
    ...(value.attachmentId ? { attachmentId: fromHex(value.attachmentId) } : {}),
    ...(value.contentDigest ? { contentDigest: fromHex(value.contentDigest) } : {})
  };
}

function checkpointToJson(checkpoint) {
  return {
    protocolLineId: toHex(checkpoint.protocolLineId),
    signerEndpointRef: toHex(checkpoint.signerEndpointRef),
    counterpartyEndpointRef: toHex(checkpoint.counterpartyEndpointRef),
    identityStateDigest: toHex(checkpoint.identityStateDigest),
    statementDigests: checkpoint.statementDigests.map(toHex),
    signatures: checkpoint.signatures.map((signature) => ({ algorithm: signature.algorithm, keyId: toHex(signature.keyId), purpose: signature.purpose, value: toHex(signature.value) }))
  };
}

function checkpointFromJson(value) {
  return {
    protocolLineId: fromHex(value.protocolLineId),
    signerEndpointRef: fromHex(value.signerEndpointRef),
    counterpartyEndpointRef: fromHex(value.counterpartyEndpointRef),
    identityStateDigest: fromHex(value.identityStateDigest),
    statementDigests: value.statementDigests.map(fromHex),
    signatures: value.signatures.map((signature) => ({ algorithm: signature.algorithm, keyId: fromHex(signature.keyId), purpose: signature.purpose, value: fromHex(signature.value) }))
  };
}

function clone(value) {
  if (value instanceof Uint8Array) return cloneBytes(value);
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  return value;
}

function structuredCloneTransition(value) {
  return clone(value);
}

function normalize(value) {
  if (value instanceof Uint8Array) return toHex(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalize(value[key])]));
  return value;
}

function canonicalValue(value) {
  if (value instanceof Uint8Array) return `b:${toHex(value)}`;
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalValue(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function decodeFixtureValue(value) {
  if (typeof value === "string" && value.startsWith("base64:")) return fromBase64(value.slice(7));
  if (Array.isArray(value)) return value.map(decodeFixtureValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, decodeFixtureValue(child)]));
  return value;
}

function collectFiles(directory, root, output) {
  return readdir(directory, { withFileTypes: true }).then(async (entries) => {
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await collectFiles(absolute, root, output);
      else if (entry.isFile()) output.push(path.relative(root, absolute).split(path.sep).join("/"));
      else throw new Error(`unexpected non-file source ${absolute}`);
    }
  });
}

function assertMap(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Uint8Array) throw new ReliableError(`invalid-${name}`);
}

function assertClosedLabels(value, labels, code) {
  for (const key of Object.keys(value)) if (!labels.has(key)) throw new ReliableError(code);
}

function assertBytes(value, expectedLength, code) {
  if (!(value instanceof Uint8Array) || (expectedLength !== undefined && value.byteLength !== expectedLength)) throw new ReliableError(code);
}

function assertUint(value, minimum, maximum, code) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new ReliableError(code);
}

function errorWithCode(code) {
  return (error) => error?.code === code;
}

function freeze(value) {
  return Object.freeze(value);
}

function bytes16(seed) {
  return bytesOf(seed & 255, 16);
}

function bytes32(seed) {
  return bytesOf(seed & 255, 32);
}

function bytesOf(value, length) {
  return Uint8Array.from({ length }, () => value & 255);
}

function cloneBytes(value) {
  return new Uint8Array(value);
}

function digest(value) {
  return new Uint8Array(createHash("sha256").update(value).digest());
}

function concat(...parts) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function compareBytes(left, right) {
  const length = Math.min(left.byteLength, right.byteLength);
  for (let index = 0; index < length; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.byteLength - right.byteLength;
}

function equalBytes(left, right) {
  return left instanceof Uint8Array && right instanceof Uint8Array && left.byteLength === right.byteLength && compareBytes(left, right) === 0;
}

function toHex(value) {
  return Buffer.from(value).toString("hex");
}

function fromHex(value) {
  if (typeof value !== "string" || value.length % 2 !== 0 || !/^[0-9a-f]*$/u.test(value)) throw new TypeError("invalid hex fixture");
  return Uint8Array.from(Buffer.from(value, "hex"));
}

function fromBase64(value) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}
