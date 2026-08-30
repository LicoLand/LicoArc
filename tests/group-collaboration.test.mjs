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
const groupRoot = path.join(repositoryRoot, "spec/v1/group");
const boundsDocument = JSON.parse(await readFile(path.join(groupRoot, "bounds.json"), "utf8"));
const labels = JSON.parse(await readFile(path.join(groupRoot, "labels.json"), "utf8"));
const registry = JSON.parse(await readFile(path.join(groupRoot, "registry.json"), "utf8"));
const sourceManifest = JSON.parse(await readFile(path.join(groupRoot, "source-manifest.json"), "utf8"));
const B = boundsDocument.bounds;
const CBOR_LIMITS = Object.freeze({
  maxBytes: B.MAX_GROUP_PERSISTED_BYTES,
  maxDepth: 12,
  maxArrayItems: B.MAX_GROUP_MEMBERS,
  maxMapEntries: 16,
  maxRawBytes: B.MAX_GROUP_PAYLOAD_BYTES,
  maxTextBytes: 128,
  maxInteger: Number.MAX_SAFE_INTEGER
});

const ROLES = new Set(["member", "state-authority"]);
const OPERATION_KINDS = new Set(["genesis", "add", "remove", "role"]);
const RESULT_OUTCOMES = new Set(["pending", "delivered", "rejected", "failed"]);
const FAILURE_CODES = new Set([
  "malformed",
  "unauthorized",
  "duplicate",
  "fork",
  "gap",
  "stale",
  "removed-member",
  "over-bound",
  "unknown-state",
  "station-authority",
  "conflict",
  "tombstone-overflow"
]);
const GROUP_DOMAIN = new TextEncoder().encode("LICOARC-GROUP-STATE\0");
const TRANSITION_DOMAIN = new TextEncoder().encode("LICOARC-GROUP-TRANSITION\0");
const PROJECTION_DOMAIN = new TextEncoder().encode("LICOARC-GROUP-PROJECTION\0");

class GroupError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "GroupError";
    this.code = code;
  }
}

test("the Group source closure freezes one bounded protected profile", async () => {
  assert.equal(registry.registryVersion, "licoarc.group-collaboration.v1");
  assert.equal(registry.lifecycle, "Candidate");
  assert.equal(registry.representation.runtime, "deterministic-cbor");
  assert.deepEqual(sourceManifest.sourceRoots, ["conformance/v1/group", "spec/v1/group"]);
  assert.deepEqual(sourceManifest.sources, [...sourceManifest.sources].sort());
  assert.equal(new Set(sourceManifest.sources).size, sourceManifest.sources.length);
  assert.ok(sourceManifest.sources.includes("conformance/v1/group/manifest.json"));
  const actual = [];
  for (const root of sourceManifest.sourceRoots) {
    await collectFiles(path.join(repositoryRoot, root), repositoryRoot, actual);
  }
  actual.sort();
  assert.deepEqual(
    actual.filter((sourcePath) => sourcePath !== "spec/v1/group/source-manifest.json"),
    sourceManifest.sources
  );
  assert.equal(B.MAX_GROUP_MEMBERS, 64);
  assert.equal(B.MAX_PENDING_GROUP_TRANSITIONS, 128);
  assert.equal(B.MAX_PENDING_GROUP_RESULTS, 256);
  assert.equal(B.MAX_GROUP_EPOCH_TOMBSTONES, 1024);
  assert.equal(registry.transitionAuthorization.stationOrder, "never-authority");
  assert.equal(registry.transitionAuthorization.productPermissions, "never-authority");
  assert.equal(registry.projectionPolicy.maxRecipients, "MAX_GROUP_PROJECTIONS");
});

test("canonical state, transition, and message bytes are deterministic and closed", () => {
  const genesis = genesisTransition();
  const state = advanceGroupState(null, genesis);
  const stateBytes = encodeState(state);
  const roundTrip = decodeState(stateBytes);
  assert.deepEqual(normalizeForAssertion(roundTrip), normalizeForAssertion(state));
  assert.equal(toHex(digestState(state)), toHex(stateDigest(state)));
  assert.equal(stateBytes.byteLength <= B.MAX_GROUP_STATE_BYTES, true);
  assert.equal(encodeState(state).toString(), encodeState(roundTrip).toString());

  const message = {
    messageId: bytes16(90),
    groupStateDigest: stateDigest(state),
    payload: Uint8Array.from([0, 1, 2, 127, 128, 255])
  };
  const messageBytes = encodeMessage(message);
  assert.deepEqual(normalizeForAssertion(decodeMessage(messageBytes)), normalizeForAssertion(message));
  assert.throws(
    () => decodeState(concat(stateBytes, Uint8Array.of(0)), { rejectTrailing: true }),
    errorWithCode("malformed")
  );
  assert.throws(
    () => decodeState(Uint8Array.of(0xbf), { rejectTrailing: true }),
    errorWithCode("malformed")
  );
});

test("genesis and exact successor transitions are pure validate-then-advance", () => {
  const genesis = advanceGroupState(null, genesisTransition());
  assert.equal(genesis.groupEpoch, 0);
  assert.equal(genesis.members.length, 2);
  assert.equal(hasRole(genesis, "state-authority"), true);

  const added = advanceGroupState(genesis, {
    groupId: genesis.groupId,
    previousGroupStateDigest: stateDigest(genesis),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  });
  assert.equal(added.groupEpoch, 1);
  assert.deepEqual(memberRefs(added), [endpoint(1), endpoint(2), endpoint(3)].map(toHex));
  assert.equal(toHex(added.groupId), toHex(genesis.groupId));

  const promoted = advanceGroupState(added, {
    groupId: added.groupId,
    previousGroupStateDigest: stateDigest(added),
    nextGroupEpoch: 2,
    authorEndpointRef: endpoint(1),
    operation: { kind: "role", targetEndpointRef: endpoint(2), targetRole: "state-authority" }
  });
  assert.equal(promoted.members.find((member) => toHex(member.endpointIdentityRef) === toHex(endpoint(2))).role, "state-authority");

  const removed = advanceGroupState(promoted, {
    groupId: promoted.groupId,
    previousGroupStateDigest: stateDigest(promoted),
    nextGroupEpoch: 3,
    authorEndpointRef: endpoint(1),
    operation: { kind: "remove", targetEndpointRef: endpoint(3) }
  });
  assert.equal(memberRefs(removed).includes(toHex(endpoint(3))), false);
  assert.equal(removed.members.length, 2);

  // A failed validation cannot mutate the predecessor object or allocate a successor.
  const before = JSON.stringify(normalizeForAssertion(promoted));
  assert.throws(
    () => advanceGroupState(promoted, {
      groupId: promoted.groupId,
      previousGroupStateDigest: stateDigest(promoted),
      nextGroupEpoch: 3,
      authorEndpointRef: endpoint(3),
      operation: { kind: "add", targetEndpointRef: endpoint(4), targetRole: "member" }
    }),
    errorWithCode("unauthorized")
  );
  assert.equal(JSON.stringify(normalizeForAssertion(promoted)), before);
});

test("authorization is exact-predecessor role only and never Station or product authority", () => {
  const state = advanceGroupState(null, genesisTransition());
  const base = {
    groupId: state.groupId,
    previousGroupStateDigest: stateDigest(state),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  };
  const cases = [
    [{ ...base, authorEndpointRef: endpoint(2) }, "unauthorized"],
    [{ ...base, stationOrder: ["first"] }, "station-authority"],
    [{ ...base, stationRole: "state-authority" }, "station-authority"],
    [{ ...base, productPermission: "admin" }, "station-authority"],
    [{ ...base, previousGroupStateDigest: bytes32(99) }, "gap"],
    [{ ...base, groupId: bytes32(99) }, "cross-group"],
    [{ ...base, nextGroupEpoch: 2 }, "gap"],
    [{ ...base, operation: { kind: "unknown", targetEndpointRef: endpoint(3) } }, "malformed"]
  ];
  for (const [input, code] of cases) assert.throws(() => advanceGroupState(state, input), errorWithCode(code));
});

test("duplicate, fork, gap, stale, replay, and removal handling converge without arrival-order authority", () => {
  const store = new GroupStore();
  const genesisResult = store.acceptTransition(genesisTransition());
  const genesis = genesisResult.state;
  const add = {
    groupId: genesis.groupId,
    previousGroupStateDigest: stateDigest(genesis),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  };
  const accepted = store.acceptTransition(add);
  assert.equal(accepted.status, "accepted");
  const duplicate = store.acceptTransition(structuredCloneTransition(add));
  assert.equal(duplicate.status, "duplicate");
  assert.equal(toHex(duplicate.stateDigest), toHex(accepted.stateDigest));

  const fork = { ...structuredCloneTransition(add), operation: { kind: "add", targetEndpointRef: endpoint(4), targetRole: "member" } };
  assert.throws(() => store.acceptTransition(fork), errorWithCode("fork"));

  const gap = {
    ...structuredCloneTransition(add),
    nextGroupEpoch: 3,
    previousGroupStateDigest: accepted.stateDigest,
    operation: { kind: "add", targetEndpointRef: endpoint(4), targetRole: "member" }
  };
  assert.throws(() => store.acceptTransition(gap), errorWithCode("gap"));

  const removed = store.acceptTransition({
    groupId: accepted.state.groupId,
    previousGroupStateDigest: stateDigest(accepted.state),
    nextGroupEpoch: 2,
    authorEndpointRef: endpoint(1),
    operation: { kind: "remove", targetEndpointRef: endpoint(3) }
  });
  assert.equal(removed.status, "accepted");
  assert.throws(() => store.acceptTransition({
    groupId: accepted.state.groupId,
    previousGroupStateDigest: stateDigest(accepted.state),
    nextGroupEpoch: 2,
    authorEndpointRef: endpoint(3),
    operation: { kind: "add", targetEndpointRef: endpoint(4), targetRole: "member" }
  }), errorWithCode("fork"));

  const message = {
    messageId: bytes16(101),
    groupStateDigest: stateDigest(accepted.state),
    payload: Uint8Array.of(1)
  };
  assert.throws(() => projectGroupMessage(store, message, endpoint(3)), errorWithCode("removed-member"));
  assert.throws(() => projectGroupMessage(store, { ...message, groupStateDigest: stateDigest(accepted.state) }, endpoint(1)), errorWithCode("stale"));
});

test("member and operation bounds reject duplicates, unsorted data, overflow, amplification, and malformed roles", () => {
  const state = advanceGroupState(null, genesisTransition());
  const duplicateMembers = [
    { endpointIdentityRef: endpoint(1), role: "state-authority" },
    { endpointIdentityRef: endpoint(1), role: "member" }
  ];
  assert.throws(() => validateMembers(duplicateMembers), errorWithCode("duplicate-member"));
  assert.throws(() => validateMembers([
    { endpointIdentityRef: endpoint(2), role: "member" },
    { endpointIdentityRef: endpoint(1), role: "state-authority" }
  ]), errorWithCode("non-canonical-members"));
  assert.throws(() => validateMembers([]), errorWithCode("empty-members"));
  assert.throws(() => validateMembers(Array.from({ length: B.MAX_GROUP_MEMBERS + 1 }, (_, i) => ({ endpointIdentityRef: bytes32(i + 1), role: "member" }))), errorWithCode("over-bound"));
  assert.throws(() => validateMembers([{ endpointIdentityRef: endpoint(9), role: "owner" }]), errorWithCode("unknown-role"));
  assert.throws(() => advanceGroupState(state, {
    groupId: state.groupId,
    previousGroupStateDigest: stateDigest(state),
    nextGroupEpoch: B.MAX_GROUP_EPOCH + 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  }), errorWithCode("epoch-overflow"));
  assert.throws(() => encodeTransition({
    groupId: state.groupId,
    previousGroupStateDigest: stateDigest(state),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member", padding: "x" }
  }), errorWithCode("malformed"));
});

test("one logical message projects to stable sorted Endpoint deliveries and aggregate evidence is deterministic", () => {
  const store = new GroupStore();
  const state = store.acceptTransition(genesisTransition()).state;
  store.acceptTransition({
    groupId: state.groupId,
    previousGroupStateDigest: stateDigest(state),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  });
  const current = store.currentState;
  const message = { messageId: bytes16(110), groupStateDigest: stateDigest(current), payload: Uint8Array.of(7, 8, 9) };
  const first = projectGroupMessage(store, message, endpoint(1));
  const second = projectGroupMessage(store, message, endpoint(1));
  assert.deepEqual(normalizeForAssertion(second), normalizeForAssertion(first));
  assert.deepEqual(first.projections.map(({ recipientEndpointRef }) => toHex(recipientEndpointRef)), [toHex(endpoint(2)), toHex(endpoint(3))]);
  assert.equal(new Set(first.projections.map(({ projectionId }) => toHex(projectionId))).size, first.projections.length);
  assert.equal(first.projections.every((projection) => projection.projectionId.byteLength === 16), true);

  recordProjectionResult(store, {
    projectionId: first.projections[0].projectionId,
    recipientEndpointRef: first.projections[0].recipientEndpointRef,
    outcome: "delivered",
    authority: "endpoint-evidence"
  });
  recordProjectionResult(store, {
    projectionId: first.projections[1].projectionId,
    recipientEndpointRef: first.projections[1].recipientEndpointRef,
    outcome: "failed",
    failureCode: "timeout",
    authority: "endpoint-evidence"
  });
  const aggregate = aggregateProjectionResults(store, first);
  assert.equal(aggregate.outcome, "partial");
  assert.deepEqual(aggregate.counts, { pending: 0, delivered: 1, rejected: 0, failed: 1 });
  assert.deepEqual(aggregate.results.map(({ recipientEndpointRef }) => toHex(recipientEndpointRef)), first.projections.map(({ recipientEndpointRef }) => toHex(recipientEndpointRef)));
  assert.throws(() => recordProjectionResult(store, {
    projectionId: first.projections[1].projectionId,
    recipientEndpointRef: first.projections[1].recipientEndpointRef,
    outcome: "delivered",
    authority: "station"
  }), errorWithCode("station-authority"));
  assert.throws(() => recordProjectionResult(store, {
    projectionId: first.projections[1].projectionId,
    recipientEndpointRef: first.projections[1].recipientEndpointRef,
    outcome: "delivered",
    authority: "endpoint-evidence"
  }), errorWithCode("conflict"));
});

test("restart restores only bounded protocol state and converges before accepting new input", () => {
  const store = new GroupStore();
  const genesis = store.acceptTransition(genesisTransition()).state;
  const added = store.acceptTransition({
    groupId: genesis.groupId,
    previousGroupStateDigest: stateDigest(genesis),
    nextGroupEpoch: 1,
    authorEndpointRef: endpoint(1),
    operation: { kind: "add", targetEndpointRef: endpoint(3), targetRole: "member" }
  }).state;
  const message = { messageId: bytes16(120), groupStateDigest: stateDigest(added), payload: Uint8Array.of(4) };
  const projection = projectGroupMessage(store, message, endpoint(1));
  recordProjectionResult(store, {
    projectionId: projection.projections[0].projectionId,
    recipientEndpointRef: projection.projections[0].recipientEndpointRef,
    outcome: "delivered",
    authority: "endpoint-evidence"
  });
  const snapshot = store.exportSnapshot();
  assert.equal(Object.hasOwn(snapshot, "station"), false);
  assert.equal(Object.hasOwn(snapshot, "productPermission"), false);
  assert.equal(snapshot.tombstones.length <= B.MAX_GROUP_EPOCH_TOMBSTONES, true);
  const restored = GroupStore.restore(snapshot);
  assert.equal(toHex(stateDigest(restored.currentState)), toHex(stateDigest(store.currentState)));
  assert.deepEqual(normalizeForAssertion(aggregateProjectionResults(restored, projection)), normalizeForAssertion(aggregateProjectionResults(store, projection)));
  const successor = restored.acceptTransition({
    groupId: restored.currentState.groupId,
    previousGroupStateDigest: stateDigest(restored.currentState),
    nextGroupEpoch: 2,
    authorEndpointRef: endpoint(1),
    operation: { kind: "remove", targetEndpointRef: endpoint(3) }
  });
  assert.equal(successor.status, "accepted");
  assert.equal(restored.highWaterEpoch, 2);
});

test("the Group profile keeps the three-entity trust boundary and excludes association authority", async () => {
  const protocol = await readFile(path.join(repositoryRoot, "docs/protocols/group-collaboration-v1.md"), "utf8");
  assert.match(protocol, /Endpoint, Station, and Network remain the only core entities/);
  assert.match(protocol, /Station[^\n]+never[^\n]+authority/i);
  assert.match(protocol, /association claim[^\n]+rejected/i);
  assert.match(protocol, /product permission[^\n]+opaque Payload/i);
  assert.doesNotMatch(protocol, /server-owned room|global membership authority/i);
});

class GroupStore {
  constructor(initialState = null) {
    this.currentState = null;
    this.highWaterEpoch = -1;
    this.epochDigests = new Map();
    this.transitionDigests = new Map();
    this.predecessorEvidence = new Map();
    this.tombstones = new Map();
    this.projections = new Map();
    this.messageDigests = new Map();
    if (initialState !== null) this.#commit(initialState, null);
  }

  acceptTransition(input, claimedState = undefined) {
    const transition = normalizeTransition(input);
    const transitionDigest = digestTransition(transition);
    const predecessorDigest = transition.previousGroupStateDigest ? toHex(transition.previousGroupStateDigest) : "genesis";
    const transitionKey = `${predecessorDigest}:${transition.nextGroupEpoch}`;
    const priorDigest = this.transitionDigests.get(transitionKey);
    if (priorDigest !== undefined) {
      if (priorDigest === toHex(transitionDigest)) {
        const state = this.epochDigests.get(transition.nextGroupEpoch)?.state;
        if (state === undefined) throw new GroupError("conflict");
        return { status: "duplicate", state, stateDigest: stateDigest(state) };
      }
      throw new GroupError("fork");
    }
    if (this.currentState !== null) {
      if (transition.nextGroupEpoch <= this.highWaterEpoch) throw new GroupError("stale");
      if (transition.nextGroupEpoch > this.highWaterEpoch + 1) throw new GroupError("gap");
      if (!bytesEqual(transition.previousGroupStateDigest, stateDigest(this.currentState))) throw new GroupError("gap");
    } else if (transition.operation.kind !== "genesis") {
      throw new GroupError("gap");
    }
    const candidate = advanceGroupState(this.currentState, transition);
    const candidateDigest = stateDigest(candidate);
    if (claimedState !== undefined) {
      validateState(claimedState);
      if (!bytesEqual(candidateDigest, stateDigest(claimedState))) throw new GroupError("conflict");
    }
    if (this.epochDigests.has(candidate.groupEpoch)) throw new GroupError("fork");
    this.#commit(candidate, transitionKey, transitionDigest);
    return { status: "accepted", state: this.currentState, stateDigest: candidateDigest };
  }

  registerProjections(projectionSet, message) {
    const messageKey = toHex(message.messageId);
    const messageDigest = toHex(digestBytes(encodeMessage(message)));
    const oldMessageDigest = this.messageDigests.get(messageKey);
    if (oldMessageDigest !== undefined && oldMessageDigest !== messageDigest) throw new GroupError("conflict");
    if (oldMessageDigest !== undefined) return;
    if (this.projections.size + projectionSet.projections.length > B.MAX_PENDING_GROUP_RESULTS) throw new GroupError("over-bound");
    this.messageDigests.set(messageKey, messageDigest);
    for (const projection of projectionSet.projections) this.projections.set(toHex(projection.projectionId), { ...projection, result: null });
  }

  exportSnapshot() {
    const snapshot = {
      highWaterEpoch: this.highWaterEpoch,
      currentState: this.currentState ? stateToJson(this.currentState) : null,
      epochDigests: [...this.epochDigests.entries()].map(([epoch, entry]) => ({ epoch, stateDigest: toHex(entry.digest), state: stateToJson(entry.state) })),
      predecessorEvidence: [...this.predecessorEvidence.entries()].map(([digest, state]) => ({ digest, state: stateToJson(state) })),
      transitionDigests: [...this.transitionDigests.entries()],
      tombstones: [...this.tombstones.entries()].map(([endpointRef, removedAtEpoch]) => ({ endpointRef, removedAtEpoch })),
      projections: [...this.projections.entries()].map(([projectionId, projection]) => ({ projectionId, projection: projectionToJson(projection) })),
      messageDigests: [...this.messageDigests.entries()]
    };
    const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
    if (bytes.byteLength > B.MAX_GROUP_PERSISTED_BYTES) throw new GroupError("over-bound");
    return snapshot;
  }

  static restore(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.tombstones) || !Array.isArray(snapshot.projections)) throw new GroupError("malformed");
    if (snapshot.tombstones.length > B.MAX_GROUP_EPOCH_TOMBSTONES || snapshot.projections.length > B.MAX_PENDING_GROUP_RESULTS) throw new GroupError("over-bound");
    const store = new GroupStore();
    if (snapshot.currentState !== null) store.#commit(stateFromJson(snapshot.currentState), null);
    if (snapshot.highWaterEpoch !== store.highWaterEpoch) throw new GroupError("conflict");
    if (!Array.isArray(snapshot.epochDigests) || snapshot.epochDigests.length > B.MAX_GROUP_EPOCH_TOMBSTONES) throw new GroupError("over-bound");
    for (const item of snapshot.epochDigests) {
      if (!Number.isSafeInteger(item.epoch) || !/^[0-9a-f]{64}$/u.test(item.stateDigest)) throw new GroupError("malformed");
      const state = stateFromJson(item.state);
      const digest = stateDigest(state);
      if (toHex(digest) !== item.stateDigest || state.groupEpoch !== item.epoch) throw new GroupError("conflict");
      store.epochDigests.set(item.epoch, { digest, state });
    }
    if (!Array.isArray(snapshot.predecessorEvidence) || snapshot.predecessorEvidence.length > B.MAX_GROUP_EPOCH_TOMBSTONES) throw new GroupError("over-bound");
    for (const item of snapshot.predecessorEvidence) {
      if (!item || !/^[0-9a-f]{64}$/u.test(item.digest)) throw new GroupError("malformed");
      store.predecessorEvidence.set(item.digest, stateFromJson(item.state));
    }
    for (const tombstone of snapshot.tombstones) {
      if (!/^[0-9a-f]{64}$/u.test(tombstone.endpointRef) || !Number.isSafeInteger(tombstone.removedAtEpoch)) throw new GroupError("malformed");
      store.tombstones.set(tombstone.endpointRef, tombstone.removedAtEpoch);
    }
    for (const item of snapshot.projections) {
      if (!item || !/^[0-9a-f]{32}$/u.test(item.projectionId)) throw new GroupError("malformed");
      const projection = projectionFromJson(item.projection);
      if (toHex(projection.projectionId) !== item.projectionId) throw new GroupError("conflict");
      store.projections.set(item.projectionId, projection);
    }
    if (!Array.isArray(snapshot.transitionDigests) || snapshot.transitionDigests.length > B.MAX_GROUP_EPOCH_TOMBSTONES) throw new GroupError("over-bound");
    for (const [key, digest] of snapshot.transitionDigests) {
      if (typeof key !== "string" || !/^(?:genesis|[0-9a-f]{64}):[0-9]+$/u.test(key) || !/^[0-9a-f]{64}$/u.test(digest)) throw new GroupError("malformed");
      store.transitionDigests.set(key, digest);
    }
    for (const [messageId, digest] of snapshot.messageDigests ?? []) store.messageDigests.set(messageId, digest);
    return store;
  }

  #commit(state, transitionKey, transitionDigest = state.transitionDigest) {
    validateState(state);
    if (state.members.length > B.MAX_GROUP_MEMBERS) throw new GroupError("over-bound");
    const digest = stateDigest(state);
    const removed = this.currentState === null ? [] : memberRefs(this.currentState).filter((ref) => !memberRefs(state).includes(ref));
    if (this.tombstones.size + removed.length > B.MAX_GROUP_EPOCH_TOMBSTONES) throw new GroupError("tombstone-overflow");
    if (this.currentState !== null) {
      this.predecessorEvidence.set(toHex(stateDigest(this.currentState)), this.currentState);
      if (this.predecessorEvidence.size > B.MAX_GROUP_EPOCH_TOMBSTONES) {
        const oldest = this.predecessorEvidence.keys().next().value;
        this.predecessorEvidence.delete(oldest);
      }
    }
    for (const ref of removed) this.tombstones.set(ref, state.groupEpoch);
    this.currentState = state;
    this.highWaterEpoch = state.groupEpoch;
    this.epochDigests.set(state.groupEpoch, { digest, state });
    if (this.epochDigests.size > B.MAX_GROUP_EPOCH_TOMBSTONES) this.epochDigests.delete(this.epochDigests.keys().next().value);
    if (transitionKey !== null) this.transitionDigests.set(transitionKey, toHex(transitionDigest));
    // The current state is always the latest predecessor evidence as well.
    this.transitionDigests.set(`${state.previousGroupStateDigest ? toHex(state.previousGroupStateDigest) : "genesis"}:${state.groupEpoch}`, toHex(state.transitionDigest));
  }
}

function advanceGroupState(current, rawTransition) {
  const transition = normalizeTransition(rawTransition);
  const transitionBytes = encodeTransition(transition);
  if (transitionBytes.byteLength > B.MAX_GROUP_OPERATION_BYTES) throw new GroupError("over-bound");
  const operation = transition.operation;
  let members;
  if (current === null) {
    if (operation.kind !== "genesis" || transition.nextGroupEpoch !== 0 || transition.previousGroupStateDigest !== undefined) throw new GroupError("malformed");
    if (operation.targetEndpointRef !== undefined || operation.targetRole !== undefined) throw new GroupError("malformed");
    members = validateMembers(operation.initialMembers);
    const author = members.find((member) => bytesEqual(member.endpointIdentityRef, transition.authorEndpointRef));
    if (!author || author.role !== "state-authority") throw new GroupError("unauthorized");
  } else {
    validateState(current);
    const currentDigest = stateDigest(current);
    if (!bytesEqual(transition.groupId, current.groupId)) throw new GroupError("cross-group");
    if (!bytesEqual(transition.previousGroupStateDigest, currentDigest)) throw new GroupError("gap");
    if (transition.nextGroupEpoch <= current.groupEpoch) throw new GroupError("stale");
    if (transition.nextGroupEpoch !== current.groupEpoch + 1) throw new GroupError("gap");
    if (transition.nextGroupEpoch > B.MAX_GROUP_EPOCH) throw new GroupError("epoch-overflow");
    const author = current.members.find((member) => bytesEqual(member.endpointIdentityRef, transition.authorEndpointRef));
    if (!author || author.role !== "state-authority") throw new GroupError("unauthorized");
    members = current.members.map((member) => ({ endpointIdentityRef: cloneBytes(member.endpointIdentityRef), role: member.role }));
    if (operation.kind === "add") {
      if (!operation.targetEndpointRef || operation.targetRole === undefined) throw new GroupError("malformed");
      if (members.some((member) => bytesEqual(member.endpointIdentityRef, operation.targetEndpointRef))) throw new GroupError("duplicate-member");
      if (members.length >= B.MAX_GROUP_MEMBERS) throw new GroupError("over-bound");
      members.push({ endpointIdentityRef: cloneBytes(operation.targetEndpointRef), role: operation.targetRole });
    } else if (operation.kind === "remove") {
      if (!operation.targetEndpointRef || operation.targetRole !== undefined) throw new GroupError("malformed");
      const index = members.findIndex((member) => bytesEqual(member.endpointIdentityRef, operation.targetEndpointRef));
      if (index < 0) throw new GroupError("removed-member");
      const removing = members[index];
      if (members.length === 1 || (removing.role === "state-authority" && members.filter((member) => member.role === "state-authority").length === 1)) throw new GroupError("unauthorized");
      members.splice(index, 1);
    } else if (operation.kind === "role") {
      if (!operation.targetEndpointRef || operation.targetRole === undefined) throw new GroupError("malformed");
      const member = members.find((entry) => bytesEqual(entry.endpointIdentityRef, operation.targetEndpointRef));
      if (!member) throw new GroupError("removed-member");
      if (member.role === operation.targetRole) throw new GroupError("duplicate");
      if (member.role === "state-authority" && operation.targetRole === "member" && members.filter((entry) => entry.role === "state-authority").length === 1) throw new GroupError("unauthorized");
      member.role = operation.targetRole;
    } else {
      throw new GroupError("malformed");
    }
    members = validateMembers(members);
  }
  const transitionDigest = digestTransition(transition);
  const state = {
    groupId: cloneBytes(transition.groupId),
    groupEpoch: transition.nextGroupEpoch,
    ...(transition.previousGroupStateDigest ? { previousGroupStateDigest: cloneBytes(transition.previousGroupStateDigest) } : {}),
    members,
    transitionDigest
  };
  validateState(state);
  return state;
}

function normalizeTransition(value) {
  assertPlainObject(value, "transition");
  const forbidden = ["stationOrder", "stationRole", "station", "productPermission", "arrivalOrder"];
  if (forbidden.some((key) => Object.hasOwn(value, key))) throw new GroupError("station-authority");
  assertExactKeys(value, ["groupId", "previousGroupStateDigest", "nextGroupEpoch", "authorEndpointRef", "operation"], "malformed", ["previousGroupStateDigest"]);
  const groupId = requireBytes(value.groupId, 32, "malformed");
  const previous = value.previousGroupStateDigest === undefined ? undefined : requireBytes(value.previousGroupStateDigest, 32, "malformed");
  if (!Number.isSafeInteger(value.nextGroupEpoch) || value.nextGroupEpoch < 0 || value.nextGroupEpoch > B.MAX_GROUP_EPOCH) throw new GroupError("epoch-overflow");
  const author = requireBytes(value.authorEndpointRef, 32, "malformed");
  assertPlainObject(value.operation, "operation");
  assertExactKeys(value.operation, ["kind", "targetEndpointRef", "targetRole", "initialMembers"], "malformed", ["targetEndpointRef", "targetRole", "initialMembers"]);
  if (!OPERATION_KINDS.has(value.operation.kind)) throw new GroupError("malformed");
  const operation = { kind: value.operation.kind };
  if (value.operation.targetEndpointRef !== undefined) operation.targetEndpointRef = requireBytes(value.operation.targetEndpointRef, 32, "malformed");
  if (value.operation.targetRole !== undefined) {
    if (!ROLES.has(value.operation.targetRole)) throw new GroupError("unknown-role");
    operation.targetRole = value.operation.targetRole;
  }
  if (value.operation.initialMembers !== undefined) operation.initialMembers = validateMembers(value.operation.initialMembers);
  return { groupId, ...(previous ? { previousGroupStateDigest: previous } : {}), nextGroupEpoch: value.nextGroupEpoch, authorEndpointRef: author, operation };
}

function validateState(value) {
  assertPlainObject(value, "state");
  assertExactKeys(value, ["groupId", "groupEpoch", "previousGroupStateDigest", "members", "transitionDigest"], "malformed", ["previousGroupStateDigest"]);
  requireBytes(value.groupId, 32, "malformed");
  if (!Number.isSafeInteger(value.groupEpoch) || value.groupEpoch < 0 || value.groupEpoch > B.MAX_GROUP_EPOCH) throw new GroupError("epoch-overflow");
  if (value.groupEpoch === 0 && value.previousGroupStateDigest !== undefined) throw new GroupError("malformed");
  if (value.groupEpoch > 0 && value.previousGroupStateDigest === undefined) throw new GroupError("gap");
  if (value.previousGroupStateDigest !== undefined) requireBytes(value.previousGroupStateDigest, 32, "malformed");
  validateMembers(value.members);
  requireBytes(value.transitionDigest, 32, "malformed");
  return value;
}

function validateMembers(value) {
  if (!Array.isArray(value)) throw new GroupError("malformed");
  if (value.length === 0) throw new GroupError("empty-members");
  if (value.length > B.MAX_GROUP_MEMBERS) throw new GroupError("over-bound");
  const members = [];
  let previous;
  const seen = new Set();
  for (const member of value) {
    assertPlainObject(member, "member");
    assertExactKeys(member, ["endpointIdentityRef", "role"], "malformed");
    const endpointIdentityRef = requireBytes(member.endpointIdentityRef, 32, "malformed");
    if (!ROLES.has(member.role)) throw new GroupError("unknown-role");
    const key = toHex(endpointIdentityRef);
    if (seen.has(key)) throw new GroupError("duplicate-member");
    if (previous !== undefined && compareBytes(previous, endpointIdentityRef) >= 0) throw new GroupError("non-canonical-members");
    seen.add(key);
    previous = endpointIdentityRef;
    members.push({ endpointIdentityRef: cloneBytes(endpointIdentityRef), role: member.role });
  }
  if (!members.some((member) => member.role === "state-authority")) throw new GroupError("unauthorized");
  return members;
}

function validateMessage(value) {
  assertPlainObject(value, "message");
  assertExactKeys(value, ["messageId", "groupStateDigest", "payload"], "malformed");
  requireBytes(value.messageId, 16, "malformed");
  requireBytes(value.groupStateDigest, 32, "malformed");
  requireBytes(value.payload, undefined, "malformed");
  if (value.payload.byteLength > B.MAX_GROUP_PAYLOAD_BYTES) throw new GroupError("over-bound");
  return value;
}

function projectGroupMessage(store, rawMessage, senderEndpointRef) {
  const message = validateMessage(rawMessage);
  const sender = requireBytes(senderEndpointRef, 32, "malformed");
  if (store.currentState === null) throw new GroupError("unknown-state");
  const currentDigest = stateDigest(store.currentState);
  if (!bytesEqual(message.groupStateDigest, currentDigest)) {
    if (store.tombstones.has(toHex(sender))) throw new GroupError("removed-member");
    throw new GroupError("stale");
  }
  const senderEntry = store.currentState.members.find((member) => bytesEqual(member.endpointIdentityRef, sender));
  if (!senderEntry) {
    if (store.tombstones.has(toHex(sender))) throw new GroupError("removed-member");
    throw new GroupError("unauthorized");
  }
  const projections = store.currentState.members
    .filter((member) => !bytesEqual(member.endpointIdentityRef, sender))
    .map((member) => {
      const projectionId = digestBytes(PROJECTION_DOMAIN, message.groupStateDigest, message.messageId, member.endpointIdentityRef).slice(0, 16);
      return {
        projectionId,
        messageId: cloneBytes(message.messageId),
        groupStateDigest: cloneBytes(message.groupStateDigest),
        recipientEndpointRef: cloneBytes(member.endpointIdentityRef)
      };
    });
  if (projections.length > B.MAX_GROUP_PROJECTIONS) throw new GroupError("over-bound");
  const projectionSet = { messageId: cloneBytes(message.messageId), groupStateDigest: cloneBytes(message.groupStateDigest), senderEndpointRef: sender, projections };
  store.registerProjections(projectionSet, message);
  return projectionSet;
}

function recordProjectionResult(store, rawResult) {
  assertPlainObject(rawResult, "result");
  assertExactKeys(rawResult, ["projectionId", "recipientEndpointRef", "outcome", "failureCode", "authority"], "malformed", ["failureCode"]);
  const projectionId = requireBytes(rawResult.projectionId, 16, "malformed");
  const recipientEndpointRef = requireBytes(rawResult.recipientEndpointRef, 32, "malformed");
  if (!RESULT_OUTCOMES.has(rawResult.outcome)) throw new GroupError("malformed");
  if (!["endpoint-evidence", "none"].includes(rawResult.authority)) throw new GroupError("station-authority");
  if (rawResult.outcome !== "pending" && rawResult.authority !== "endpoint-evidence") throw new GroupError("station-authority");
  if ((rawResult.outcome === "rejected" || rawResult.outcome === "failed") && (!rawResult.failureCode || !FAILURE_CODES.has(rawResult.failureCode) && rawResult.failureCode !== "timeout")) throw new GroupError("malformed");
  if ((rawResult.outcome === "delivered" || rawResult.outcome === "pending") && rawResult.failureCode !== undefined) throw new GroupError("malformed");
  const key = toHex(projectionId);
  const projection = store.projections.get(key);
  if (!projection || !bytesEqual(projection.recipientEndpointRef, recipientEndpointRef)) throw new GroupError("unknown-state");
  const result = {
    projectionId: cloneBytes(projectionId),
    recipientEndpointRef: cloneBytes(recipientEndpointRef),
    outcome: rawResult.outcome,
    ...(rawResult.failureCode !== undefined ? { failureCode: rawResult.failureCode } : {}),
    authority: rawResult.authority
  };
  if (projection.result !== null) {
    if (JSON.stringify(normalizeForAssertion(projection.result)) !== JSON.stringify(normalizeForAssertion(result))) throw new GroupError("conflict");
    return projection.result;
  }
  projection.result = result;
  return result;
}

function aggregateProjectionResults(store, projectionSet) {
  const results = projectionSet.projections.map((projection) => store.projections.get(toHex(projection.projectionId))?.result ?? {
    projectionId: cloneBytes(projection.projectionId),
    recipientEndpointRef: cloneBytes(projection.recipientEndpointRef),
    outcome: "pending",
    authority: "none"
  });
  const counts = { pending: 0, delivered: 0, rejected: 0, failed: 0 };
  for (const result of results) counts[result.outcome] += 1;
  const allDelivered = counts.delivered === results.length;
  const allTerminalFailure = counts.pending === 0 && counts.delivered === 0;
  const outcome = allDelivered ? "complete" : allTerminalFailure ? "failed" : "partial";
  const aggregate = {
    messageId: cloneBytes(projectionSet.messageId),
    groupStateDigest: cloneBytes(projectionSet.groupStateDigest),
    results,
    outcome,
    counts
  };
  if (encodeAggregate(aggregate).byteLength > B.MAX_GROUP_AGGREGATE_BYTES) throw new GroupError("over-bound");
  return aggregate;
}

function encodeState(state) {
  validateState(state);
  return encodeCbor(stateToWire(state), B.MAX_GROUP_STATE_BYTES);
}

function decodeState(bytes, options = {}) {
  try {
    const value = decodeDeterministicCbor(bytes, CBOR_LIMITS);
    const state = stateFromWire(value);
    if (options.rejectTrailing) return state;
    return state;
  } catch (error) {
    if (error instanceof GroupError) throw error;
    throw new GroupError("malformed", error.message);
  }
}

function encodeTransition(transition) {
  const normalized = normalizeTransition(transition);
  return encodeCbor(transitionToWire(normalized), B.MAX_GROUP_OPERATION_BYTES);
}

function encodeMessage(message) {
  validateMessage(message);
  return encodeCbor({ 0: cloneBytes(message.messageId), 1: cloneBytes(message.groupStateDigest), 2: cloneBytes(message.payload) }, B.MAX_GROUP_MESSAGE_CONTROL_BYTES + B.MAX_GROUP_PAYLOAD_BYTES);
}

function decodeMessage(bytes) {
  try {
    const value = decodeDeterministicCbor(bytes, CBOR_LIMITS);
    assertWireLabels(value, ["0", "1", "2"]);
    return validateMessage({ messageId: value["0"], groupStateDigest: value["1"], payload: value["2"] });
  } catch (error) {
    if (error instanceof GroupError) throw error;
    throw new GroupError("malformed", error.message);
  }
}

function encodeAggregate(aggregate) {
  const values = aggregate.results.map((result) => ({ 0: result.projectionId, 1: result.recipientEndpointRef, 2: result.outcome === "pending" ? 0 : result.outcome === "delivered" ? 1 : result.outcome === "rejected" ? 2 : 3, ...(result.failureCode ? { 3: failureCodeValue(result.failureCode) } : {}), 4: result.authority === "endpoint-evidence" ? 0 : 1 }));
  return encodeCbor({ 0: aggregate.messageId, 1: aggregate.groupStateDigest, 2: values, 3: aggregate.outcome === "complete" ? 0 : aggregate.outcome === "partial" ? 1 : 2, 4: { 0: aggregate.counts.pending, 1: aggregate.counts.delivered, 2: aggregate.counts.rejected, 3: aggregate.counts.failed } }, B.MAX_GROUP_AGGREGATE_BYTES);
}

function stateToWire(state) {
  return { 0: cloneBytes(state.groupId), 1: state.groupEpoch, ...(state.previousGroupStateDigest ? { 2: cloneBytes(state.previousGroupStateDigest) } : {}), 3: state.members.map((member) => ({ 0: cloneBytes(member.endpointIdentityRef), 1: member.role === "member" ? 0 : 1 })), 4: cloneBytes(state.transitionDigest) };
}

function stateFromWire(value) {
  assertWireLabels(value, ["0", "1", "3", "4"], ["2"]);
  const members = value["3"];
  if (!Array.isArray(members)) throw new GroupError("malformed");
  return validateState({
    groupId: value["0"],
    groupEpoch: value["1"],
    ...(value["2"] === undefined ? {} : { previousGroupStateDigest: value["2"] }),
    members: members.map((member) => {
      assertWireLabels(member, ["0", "1"]);
      if (![0, 1].includes(member["1"])) throw new GroupError("unknown-role");
      return { endpointIdentityRef: member["0"], role: member["1"] === 0 ? "member" : "state-authority" };
    }),
    transitionDigest: value["4"]
  });
}

function transitionToWire(transition) {
  const operation = transition.operation;
  return {
    0: cloneBytes(transition.groupId),
    ...(transition.previousGroupStateDigest ? { 1: cloneBytes(transition.previousGroupStateDigest) } : {}),
    2: transition.nextGroupEpoch,
    3: cloneBytes(transition.authorEndpointRef),
    4: {
      0: operation.kind === "genesis" ? 0 : operation.kind === "add" ? 1 : operation.kind === "remove" ? 2 : 3,
      ...(operation.targetEndpointRef ? { 1: cloneBytes(operation.targetEndpointRef) } : {}),
      ...(operation.targetRole !== undefined ? { 2: operation.targetRole === "member" ? 0 : 1 } : {}),
      ...(operation.initialMembers ? { 3: operation.initialMembers.map((member) => ({ 0: cloneBytes(member.endpointIdentityRef), 1: member.role === "member" ? 0 : 1 })) } : {})
    }
  };
}

function stateFromJson(value) {
  return validateState({
    groupId: fromHex(value.groupId),
    groupEpoch: value.groupEpoch,
    ...(value.previousGroupStateDigest ? { previousGroupStateDigest: fromHex(value.previousGroupStateDigest) } : {}),
    members: value.members.map((member) => ({ endpointIdentityRef: fromHex(member.endpointIdentityRef), role: member.role })),
    transitionDigest: fromHex(value.transitionDigest)
  });
}

function stateToJson(state) {
  return { groupId: toHex(state.groupId), groupEpoch: state.groupEpoch, ...(state.previousGroupStateDigest ? { previousGroupStateDigest: toHex(state.previousGroupStateDigest) } : {}), members: state.members.map((member) => ({ endpointIdentityRef: toHex(member.endpointIdentityRef), role: member.role })), transitionDigest: toHex(state.transitionDigest) };
}

function projectionToJson(projection) {
  return { projectionId: toHex(projection.projectionId), messageId: toHex(projection.messageId), groupStateDigest: toHex(projection.groupStateDigest), recipientEndpointRef: toHex(projection.recipientEndpointRef), ...(projection.result ? { result: resultToJson(projection.result) } : {}) };
}

function projectionFromJson(value) {
  const projection = { projectionId: fromHex(value.projectionId), messageId: fromHex(value.messageId), groupStateDigest: fromHex(value.groupStateDigest), recipientEndpointRef: fromHex(value.recipientEndpointRef), result: value.result ? resultFromJson(value.result) : null };
  requireBytes(projection.projectionId, 16, "malformed");
  requireBytes(projection.messageId, 16, "malformed");
  requireBytes(projection.groupStateDigest, 32, "malformed");
  requireBytes(projection.recipientEndpointRef, 32, "malformed");
  return projection;
}

function resultToJson(result) {
  return { projectionId: toHex(result.projectionId), recipientEndpointRef: toHex(result.recipientEndpointRef), outcome: result.outcome, ...(result.failureCode ? { failureCode: result.failureCode } : {}), authority: result.authority };
}

function resultFromJson(value) {
  return { projectionId: fromHex(value.projectionId), recipientEndpointRef: fromHex(value.recipientEndpointRef), outcome: value.outcome, ...(value.failureCode ? { failureCode: value.failureCode } : {}), authority: value.authority };
}

function digestState(state) {
  return digestBytes(GROUP_DOMAIN, encodeState(state));
}

function stateDigest(state) {
  return digestState(state);
}

function digestTransition(transition) {
  return digestBytes(TRANSITION_DOMAIN, encodeTransition(transition));
}

function digestBytes(...parts) {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(Buffer.from(part));
  return new Uint8Array(hash.digest());
}

function encodeCbor(value, maxBytes) {
  try {
    const bytes = encodeDeterministicCbor(value, { ...CBOR_LIMITS, maxBytes });
    if (bytes.byteLength > maxBytes) throw new GroupError("over-bound");
    return bytes;
  } catch (error) {
    if (error instanceof GroupError) throw error;
    throw new GroupError("malformed", error.message);
  }
}

function genesisTransition() {
  return {
    groupId: bytes32(10),
    nextGroupEpoch: 0,
    authorEndpointRef: endpoint(1),
    operation: {
      kind: "genesis",
      initialMembers: [
        { endpointIdentityRef: endpoint(1), role: "state-authority" },
        { endpointIdentityRef: endpoint(2), role: "member" }
      ]
    }
  };
}

function structuredCloneTransition(value) {
  return {
    ...value,
    groupId: cloneBytes(value.groupId),
    ...(value.previousGroupStateDigest ? { previousGroupStateDigest: cloneBytes(value.previousGroupStateDigest) } : {}),
    authorEndpointRef: cloneBytes(value.authorEndpointRef),
    operation: {
      ...value.operation,
      ...(value.operation.targetEndpointRef ? { targetEndpointRef: cloneBytes(value.operation.targetEndpointRef) } : {}),
      ...(value.operation.initialMembers ? { initialMembers: value.operation.initialMembers.map((member) => ({ endpointIdentityRef: cloneBytes(member.endpointIdentityRef), role: member.role })) } : {})
    }
  };
}

function memberRefs(state) {
  return state.members.map((member) => toHex(member.endpointIdentityRef));
}

function hasRole(state, role) {
  return state.members.some((member) => member.role === role);
}

function endpoint(seed) {
  return bytes32(seed);
}

function bytes16(seed) {
  return Uint8Array.from({ length: 16 }, (_, index) => (seed + index) & 0xff);
}

function bytes32(seed) {
  return Uint8Array.from({ length: 32 }, (_, index) => (seed + index) & 0xff);
}

function fromHex(value) {
  if (typeof value !== "string" || !/^[0-9a-f]*$/u.test(value) || value.length % 2 !== 0) throw new GroupError("malformed");
  return Uint8Array.from(Buffer.from(value, "hex"));
}

function toHex(value) {
  return Buffer.from(requireBytes(value)).toString("hex");
}

function requireBytes(value, length, code) {
  if (!(value instanceof Uint8Array) || (length !== undefined && value.byteLength !== length)) throw new GroupError(code);
  return value;
}

function cloneBytes(value) {
  return new Uint8Array(value);
}

function bytesEqual(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array) || left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function compareBytes(left, right) {
  const limit = Math.min(left.byteLength, right.byteLength);
  for (let index = 0; index < limit; index += 1) if (left[index] !== right[index]) return left[index] - right[index];
  return left.byteLength - right.byteLength;
}

function concat(...parts) {
  const output = new Uint8Array(parts.reduce((size, part) => size + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function assertPlainObject(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Uint8Array || Object.getPrototypeOf(value) !== Object.prototype) throw new GroupError("malformed", `${name} is not a plain object`);
}

function assertExactKeys(value, allowed, code, optional = []) {
  const set = new Set(allowed);
  for (const key of Object.keys(value)) if (!set.has(key)) throw new GroupError(code, `unknown ${key}`);
  for (const key of allowed) if (!optional.includes(key) && !Object.hasOwn(value, key)) throw new GroupError(code, `missing ${key}`);
}

function assertWireLabels(value, required, optional = []) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new GroupError("malformed");
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new GroupError("malformed");
  for (const key of required) if (!Object.hasOwn(value, key)) throw new GroupError("malformed");
}

function failureCodeValue(code) {
  const index = ["malformed", "unauthorized", "duplicate", "fork", "gap", "stale", "removed-member", "over-bound", "unknown-state", "station-authority", "conflict", "tombstone-overflow", "timeout"].indexOf(code);
  return index < 0 ? 0 : index;
}

function normalizeForAssertion(value) {
  if (value instanceof Uint8Array) return toHex(value);
  if (Array.isArray(value)) return value.map(normalizeForAssertion);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, normalizeForAssertion(item)]));
  return value;
}

function errorWithCode(code) {
  return (error) => error instanceof GroupError && error.code === code;
}

async function collectFiles(directory, root, output) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(absolute, root, output);
    else output.push(path.relative(root, absolute).split(path.sep).join("/"));
  }
}
