import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assertClosedJsonSchema,
  validateClosedSchema
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const protectionRoot = path.join(repositoryRoot, "spec/v1/protection");
const conformanceRoot = path.join(repositoryRoot, "conformance/v1/protection");
const relative = (file) => path.relative(repositoryRoot, file).replaceAll(path.sep, "/");
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

const [bounds, failure, labels, profiles, resources, state, registry, sourceManifest,
  capabilitySchema, handshakeSchema, recordSchema, epochSchema, profileSchema,
  corpusManifest, validCorpus, invalidCorpus, runtime, documentation,
  baselineDecision, highDecision] = await Promise.all([
  readJson(path.join(protectionRoot, "bounds.json")),
  readJson(path.join(protectionRoot, "failure.json")),
  readJson(path.join(protectionRoot, "labels.json")),
  readJson(path.join(protectionRoot, "profiles.json")),
  readJson(path.join(protectionRoot, "resource-contract.json")),
  readJson(path.join(protectionRoot, "state.json")),
  readJson(path.join(protectionRoot, "registry.json")),
  readJson(path.join(protectionRoot, "source-manifest.json")),
  readJson(path.join(protectionRoot, "capability.schema.json")),
  readJson(path.join(protectionRoot, "handshake.schema.json")),
  readJson(path.join(protectionRoot, "record.schema.json")),
  readJson(path.join(protectionRoot, "epoch.schema.json")),
  readJson(path.join(protectionRoot, "profile.schema.json")),
  readJson(path.join(conformanceRoot, "manifest.json")),
  readJson(path.join(conformanceRoot, "valid.json")),
  readJson(path.join(conformanceRoot, "invalid.json")),
  readFile(path.join(protectionRoot, "runtime.cddl"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/protocols/pairwise-protection-v1.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/algorithm-decisions/baseline-pairwise-protection-suite.md"), "utf8"),
  readFile(path.join(repositoryRoot, "docs/algorithm-decisions/high-assurance-pairwise-protection-suite.md"), "utf8")
]);

const PROFILE_IDS = {
  baseline: "d9e09414257925eed013b7add0672277fb9f91dd34c2c4e1ee985d0b5b17a7d6",
  "high-assurance": "cbc5bc838141a34aa0dd1b300022de6212f47540f95f9d7958cb1f2dcf74e42e"
};
const LINE_ID = "e04b2e1098100e61ee1d79b04f2b3281aa7450aecc2189afa3ffebe2ec41d1ef";
const ENDPOINT_A = "11".repeat(32);
const ENDPOINT_B = "22".repeat(32);
const KEY_A = "aa".repeat(16);

function hex(byte, bytes) {
  return byte.repeat(bytes);
}

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value) {
  return createHash("sha256").update(canonicalize(value), "utf8").digest("hex");
}

function declaration(endpointIdentityRef, minimumProtectionProfile, nonceByte = "33") {
  return {
    recordType: "capabilityDeclaration",
    protocolLineId: LINE_ID,
    endpointIdentityRef,
    supportedProtectionProfiles: [PROFILE_IDS["high-assurance"], PROFILE_IDS.baseline],
    minimumProtectionProfile,
    capabilityEpoch: 1,
    validFrom: 100,
    validUntil: 1000,
    declarationNonce: hex(nonceByte, 32),
    signature: {
      algorithm: "Ed25519",
      purpose: "capability-declaration",
      keyId: KEY_A,
      value: hex("cc", 64)
    }
  };
}

function transcriptInput(profileName, initiatorCapability, responderCapability, overrides = {}) {
  const profile = profileByName(profileName);
  const responderPrekeyBundle = overrides.responderPrekeyBundle ?? prekeyBundle(profileName);
  const fields = {
    domain: profile.transcript.domain,
    protocolLineId: LINE_ID,
    protectionProfileId: profile.profileId,
    handshakePurpose: "pairing",
    initiatorRole: "initiator",
    responderRole: "responder",
    initiatorEndpointIdentityRef: ENDPOINT_A,
    responderEndpointIdentityRef: ENDPOINT_B,
    initiatorCapabilityDeclaration: initiatorCapability,
    responderCapabilityDeclaration: responderCapability,
    responderPrekeyBundle,
    responderSignedPrekeyId: hex("55", 16),
    responderOneTimePrekeyId: hex("66", 16),
    initiatorEphemeralX25519PublicKey: hex("77", 32),
    responderMlKemPublicKey: hex("88", profileName === "baseline" ? 1184 : 1568),
    initiatorMlKemCiphertext: hex("99", profileName === "baseline" ? 1088 : 1568),
    roleBytes: "0001",
    ...overrides
  };
  return fields;
}

function prekeyBundle(profileName) {
  const profile = profileByName(profileName);
  return {
    recordType: "prekeyBundle",
    identityEd25519PublicKey: hex("12", 32),
    identityMlDsaPublicKey: hex("13", profileName === "baseline" ? 1952 : 2592),
    signedPrekey: {
      id: hex("55", 16),
      publicKey: hex("14", 32),
      signature: hex("15", 64)
    },
    oneTimePrekeys: [{ id: hex("66", 16), publicKey: hex("16", 32) }],
    mlKemPublicKey: hex("88", profileName === "baseline" ? 1184 : 1568)
  };
}

function makeHandshake(profileName = "baseline") {
  const initiator = declaration(ENDPOINT_A, PROFILE_IDS.baseline, "33");
  const responder = declaration(ENDPOINT_B, PROFILE_IDS.baseline, "44");
  const profile = profileByName(profileName);
  if (profileName === "high-assurance") {
    initiator.minimumProtectionProfile = PROFILE_IDS["high-assurance"];
    responder.minimumProtectionProfile = PROFILE_IDS["high-assurance"];
  }
  const input = transcriptInput(profileName, initiator, responder);
  return {
    recordType: "handshake",
    handshakeId: hex("45", 16),
    protocolLineId: LINE_ID,
    protectionProfileId: profile.profileId,
    handshakePurpose: "pairing",
    initiatorRole: "initiator",
    responderRole: "responder",
    initiatorEndpointIdentityRef: ENDPOINT_A,
    responderEndpointIdentityRef: ENDPOINT_B,
    initiatorCapabilityDigest: digest(initiator),
    responderCapabilityDigest: digest(responder),
    responderSignedPrekeyId: hex("55", 16),
    responderOneTimePrekeyId: hex("66", 16),
    initiatorEphemeralX25519PublicKey: hex("77", 32),
    responderMlKemPublicKey: hex("88", profileName === "baseline" ? 1184 : 1568),
    initiatorMlKemCiphertext: hex("99", profileName === "baseline" ? 1088 : 1568),
    transcriptDigest: digest(input),
    signatures: profile.authentication.signatures.map((signature, index) => ({
      ...signature,
      keyId: index === 0 ? KEY_A : hex("bb", 16),
      value: hex(index === 0 ? "dd" : "ee", 128)
    })),
    initiatorCapabilityDeclaration: initiator,
    responderCapabilityDeclaration: responder,
    responderPrekeyBundle: prekeyBundle(profileName)
  };
}

function profileByName(name) {
  const profile = profiles.profiles.find((candidate) => candidate.profileName === name);
  assert.ok(profile, `unknown profile fixture ${name}`);
  return profile;
}

function profileById(profileId) {
  const profile = profiles.profiles.find((candidate) => candidate.profileId === profileId);
  if (!profile) throw new Error("unknown-profile");
  if (profile.lifecycle === "Retired" || profile.retired) throw new Error("retired-profile");
  return profile;
}

function rank(profileId) {
  return profileById(profileId).strengthRank;
}

function selectProfile(left, right) {
  const leftIds = new Set(left.supportedProtectionProfiles);
  const candidates = right.supportedProtectionProfiles
    .filter((profileId) => leftIds.has(profileId))
    .filter((profileId) => rank(profileId) >= rank(left.minimumProtectionProfile))
    .filter((profileId) => rank(profileId) >= rank(right.minimumProtectionProfile));
  if (candidates.length === 0) throw new Error("no-common-profile");
  return candidates.sort((a, b) => rank(b) - rank(a) || a.localeCompare(b))[0];
}

function assertAcceptedSchema(value, schema, label) {
  assert.deepEqual(validateClosedSchema(value, schema), [], label);
}

class RatchetState {
  constructor(profileName) {
    const contract = resources.profiles[profileName];
    this.profileName = profileName;
    this.maxSkipped = contract.MAX_SKIPPED_MESSAGE_KEYS;
    this.replayWindow = contract.MAX_REPLAY_WINDOW;
    this.highest = -1;
    this.skipped = new Set();
    this.replayed = new Set();
    this.terminal = false;
  }

  receive(counter, authenticated = true) {
    const before = this.snapshot();
    if (this.terminal) return this.reject("terminal-session", before);
    if (!Number.isSafeInteger(counter) || counter > bounds.bounds.MAX_COUNTER) {
      return this.reject("counter-wrap", before);
    }
    if (this.replayed.has(counter) || (counter <= this.highest && !this.skipped.has(counter))) {
      return this.reject("replay", before);
    }
    const gap = counter - this.highest - 1;
    if (gap > this.maxSkipped) return this.reject("skipped-bound-exceeded", before);
    if (!authenticated) return this.reject("record-authentication", before);
    for (let skipped = this.highest + 1; skipped < counter; skipped += 1) this.skipped.add(skipped);
    this.skipped.delete(counter);
    this.highest = Math.max(this.highest, counter);
    this.replayed.add(counter);
    while (this.replayed.size > this.replayWindow) this.replayed.delete(Math.min(...this.replayed));
    return { accepted: true, failureClass: null, before, after: this.snapshot() };
  }

  reject(failureClass, before) {
    return { accepted: false, failureClass, before, after: this.snapshot() };
  }

  snapshot() {
    return { highest: this.highest, skipped: [...this.skipped].sort((a, b) => a - b), replayed: [...this.replayed].sort((a, b) => a - b), terminal: this.terminal };
  }
}

function epochTransition(currentEpoch, proposedEpoch, pendingEpochs = 0) {
  if (pendingEpochs >= bounds.bounds.MAX_PENDING_PQ_EPOCHS) throw new Error("epoch-duplicate");
  if (proposedEpoch !== currentEpoch + 1) throw new Error(proposedEpoch <= currentEpoch ? "epoch-stale" : "epoch-gap");
  return { accepted: true, nextEpoch: proposedEpoch };
}

test("protection source closure is explicit, sorted, and complete", async () => {
  const expected = [...sourceManifest.sources].sort();
  assert.deepEqual(sourceManifest.sources, expected);
  assert.equal(new Set(sourceManifest.sources).size, sourceManifest.sources.length);
  assert.equal(sourceManifest.contractVersion, registry.capabilityId);
  assert.equal(sourceManifest.protocolLineId, LINE_ID);
  const files = [];
  for (const root of sourceManifest.sourceRoots) {
    const absoluteRoot = path.join(repositoryRoot, root);
    for (const entry of await readdir(absoluteRoot, { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) {
        const parent = entry.parentPath ?? entry.path ?? absoluteRoot;
        files.push(relative(path.join(parent, entry.name)));
      }
    }
  }
  assert.deepEqual(files.sort(), sourceManifest.sources);
  assert.equal(sourceManifest.undeclaredFiles, "reject");
  assert.equal(sourceManifest.symlinks, "reject");
});

test("all protection schemas are closed and positive wire projections validate", () => {
  for (const [name, schema] of Object.entries({ capabilitySchema, handshakeSchema, recordSchema, epochSchema, profileSchema })) {
    assert.doesNotThrow(() => assertClosedJsonSchema(schema), name);
  }
  const capability = declaration(ENDPOINT_A, PROFILE_IDS.baseline);
  assertAcceptedSchema(capability, capabilitySchema, "capability");
  assert.ok(capability.validUntil > capability.validFrom);
  assert.equal(capability.validFrom <= 100 && 100 < capability.validUntil, true);
  assert.equal(capability.validFrom <= 1001 && 1001 < capability.validUntil, false);
  assertAcceptedSchema(makeHandshake("baseline"), handshakeSchema, "baseline handshake");
  assertAcceptedSchema(makeHandshake("high-assurance"), handshakeSchema, "high handshake");
  assertAcceptedSchema({
    recordType: "establishedRecord",
    sessionId: hex("45", 16),
    epoch: 0,
    direction: "initiator-to-responder",
    counter: 0,
    ciphertext: hex("ab", 32)
  }, recordSchema, "record");
  assertAcceptedSchema({
    recordType: "pqEpoch",
    sessionId: hex("45", 16),
    epoch: 1,
    previousEpochDigest: hex("ef", 32),
    x25519RekeyPublicKey: hex("77", 32),
    mlKemCiphertext: hex("99", 1568),
    transcriptDigest: hex("ef", 32),
    signature: {
      algorithm: "ML-DSA-87",
      purpose: "epoch-transition",
      context: "LicoArc-High-Transcript",
      keyId: hex("bb", 16),
      value: hex("ee", 128)
    }
  }, epochSchema, "pq epoch");
  for (const profile of profiles.profiles) assertAcceptedSchema(profile, profileSchema, profile.profileName);
});

test("profiles are exact indivisible compositions with derived identifiers", () => {
  assert.deepEqual(profiles.profiles.map(({ profileId }) => profileId), [PROFILE_IDS["high-assurance"], PROFILE_IDS.baseline]);
  for (const profile of profiles.profiles) {
    assert.equal(profile.profileId, createHash("sha256").update(`LicoArc/Protection/Profile/v1/${profile.profileName}\0`).digest("hex"));
    assert.equal(profile.lifecycle, "Candidate");
    assert.equal(profile.retired, false);
    assert.equal(profile.authentication.exactSet, true);
    assert.equal(profile.record.senderIdentityOuterVisibility, "never");
    assert.equal(profile.record.profileField, "forbidden-after-establishment");
    assert.equal(profile.record.capabilityField, "forbidden-after-establishment");
    assert.equal(profile.record.endpointIdentityField, "forbidden-after-establishment");
  }
  const baseline = profileByName("baseline");
  const high = profileByName("high-assurance");
  assert.equal(baseline.establishment.postQuantumKeyEncapsulation, "ML-KEM-768");
  assert.equal(high.establishment.postQuantumKeyEncapsulation, "ML-KEM-1024");
  assert.equal(baseline.ratchet.kind, "DoubleRatchet");
  assert.equal(high.ratchet.kind, "TripleRatchet");
  assert.match(high.keySchedule.rootEvolution, /classicalChain \|\| x25519Secret \|\| pqChain \|\| transcriptDigest/);
  assert.deepEqual(baseline.establishment.sharedSecretOrder, ["X25519", "ML-KEM-768"]);
  assert.deepEqual(high.establishment.sharedSecretOrder, ["X25519", "ML-KEM-1024"]);
  assert.equal(high.ratchet.maxPendingEpochs, 1);
  assert.equal(high.ratchet.epochTransition, "all-or-nothing");
  assert.equal(baseline.establishment.maxOneTimePrekeys, bounds.bounds.MAX_PREKEYS_BASELINE);
  assert.equal(high.establishment.maxOneTimePrekeys, bounds.bounds.MAX_PREKEYS_HIGH);
  assert.deepEqual(Object.keys(baseline), Object.keys(high));
  assert.deepEqual(
    Object.keys(baseline),
    [
      "profileId", "profileName", "strengthRank", "lifecycle",
      "algorithmDecisionId", "retired", "providerBoundary", "establishment",
      "authentication", "transcript", "keySchedule", "ratchet", "record",
      "boundsRef", "failurePolicyRef"
    ]
  );
  assert.equal(profiles.selection.componentNegotiation, "forbidden");
  assert.equal(profiles.selection.fallback, "forbidden");
});

test("strongest-common selection is deterministic and rejects downgrade", () => {
  const both = declaration(ENDPOINT_A, PROFILE_IDS.baseline);
  const highMinimum = declaration(ENDPOINT_B, PROFILE_IDS["high-assurance"]);
  assert.equal(selectProfile(both, both), PROFILE_IDS["high-assurance"]);
  assert.throws(() => selectProfile(highMinimum, {
    ...both,
    supportedProtectionProfiles: [PROFILE_IDS.baseline]
  }), /no-common-profile/);
  assert.throws(() => profileById(hex("aa", 32)), /unknown-profile/);
  const retired = structuredClone(profiles.profiles[1]);
  retired.lifecycle = "Retired";
  retired.retired = true;
  profiles.profiles[1] = retired;
  assert.throws(() => profileById(PROFILE_IDS.baseline), /retired-profile/);
  profiles.profiles[1] = profiles.profiles.find(({ profileName }) => profileName === "baseline") ?? retired;
  // Restore the fixture object after the temporary lifecycle assertion.
  profiles.profiles[1].lifecycle = "Candidate";
  profiles.profiles[1].retired = false;
});

test("capability, roles, identities, purpose, key material, and Profile are transcript-bound once", () => {
  for (const profileName of ["baseline", "high-assurance"]) {
    const handshake = makeHandshake(profileName);
    const input = transcriptInput(profileName, handshake.initiatorCapabilityDeclaration, handshake.responderCapabilityDeclaration);
    assert.equal(handshake.transcriptDigest, digest(input), profileName);
    for (const field of ["protectionProfileId", "handshakePurpose", "initiatorEndpointIdentityRef", "responderEndpointIdentityRef", "initiatorCapabilityDeclaration", "responderCapabilityDeclaration", "initiatorEphemeralX25519PublicKey"]) {
      const changed = transcriptInput(profileName, handshake.initiatorCapabilityDeclaration, handshake.responderCapabilityDeclaration, { [field]: field === "handshakePurpose" ? "reconnect" : hex("fe", 32) });
      assert.notEqual(digest(changed), handshake.transcriptDigest, `${profileName}:${field}`);
    }
    const signatureAlgorithms = handshake.signatures.map(({ algorithm }) => algorithm).sort();
    assert.deepEqual(signatureAlgorithms, profileByName(profileName).authentication.signatures.map(({ algorithm }) => algorithm).sort());
  }
  const repeated = { recordType: "establishedRecord", sessionId: hex("45", 16), epoch: 0, direction: "initiator-to-responder", counter: 0, ciphertext: hex("ab", 32), protectionProfileId: PROFILE_IDS.baseline };
  assert.notDeepEqual(validateClosedSchema(repeated, recordSchema), []);
});

test("ratchet replay, out-of-order, bounds, counter wrap, and restart are atomic", () => {
  const baseline = new RatchetState("baseline");
  const first = baseline.receive(0);
  assert.equal(first.accepted, true);
  const outOfOrder = baseline.receive(250);
  assert.equal(outOfOrder.accepted, true);
  assert.equal(outOfOrder.after.highest, 250);
  const replay = baseline.receive(250);
  assert.equal(replay.failureClass, "replay");
  assert.deepEqual(replay.before, replay.after);
  const tooFar = baseline.receive(508);
  assert.equal(tooFar.failureClass, "skipped-bound-exceeded");
  assert.deepEqual(tooFar.before, tooFar.after);
  const unauthenticated = baseline.receive(251, false);
  assert.equal(unauthenticated.failureClass, "record-authentication");
  assert.deepEqual(unauthenticated.before, unauthenticated.after);
  const wrapped = baseline.receive(bounds.bounds.MAX_COUNTER + 1);
  assert.equal(wrapped.failureClass, "counter-wrap");
  const restarted = new RatchetState("baseline");
  restarted.highest = baseline.highest;
  restarted.skipped = new Set(baseline.skipped);
  restarted.replayed = new Set(baseline.replayed);
  assert.equal(restarted.receive(0).failureClass, "replay");
});

test("high-assurance epoch cadence and all-or-nothing ordering are closed", () => {
  assert.deepEqual(epochTransition(0, 1, 0), { accepted: true, nextEpoch: 1 });
  assert.throws(() => epochTransition(0, 2, 0), /epoch-gap/);
  assert.throws(() => epochTransition(1, 1, 0), /epoch-stale/);
  assert.throws(() => epochTransition(0, 1, 1), /epoch-duplicate/);
  const high = resources.profiles["high-assurance"];
  assert.deepEqual(high.pqEpoch, { maxRecords: 64, maxActivitySeconds: 600, maxPending: 1 });
  assert.equal(profileByName("high-assurance").ratchet.epochTransition, "all-or-nothing");
  assert.equal(profileByName("high-assurance").ratchet.maxPendingEpochs, bounds.bounds.MAX_PENDING_PQ_EPOCHS);
});

test("resource contract contains only normative protocol bounds", () => {
  assert.equal(resources.scope, "normative-resource-and-wire-bounds");
  assert.notEqual(resources.profiles.baseline.MAX_HANDSHAKE_WIRE_BYTES, resources.profiles["high-assurance"].MAX_HANDSHAKE_WIRE_BYTES);
  assert.notEqual(resources.profiles.baseline.MAX_PERSISTENT_STATE_BYTES, resources.profiles["high-assurance"].MAX_PERSISTENT_STATE_BYTES);
});

test("failure policy, state lifecycle, wire closure, retirement, and corpus coverage are exact", () => {
  const failureClasses = new Set(failure.failureClasses.map(({ class: name }) => name));
  for (const required of ["unknown-profile", "retired-profile", "no-common-profile", "capability-expired", "transcript-mismatch", "replay", "skipped-bound-exceeded", "counter-wrap", "epoch-gap", "epoch-duplicate", "stable-field-repetition", "malformed"]) assert.ok(failureClasses.has(required), required);
  assert.deepEqual(state.states.map(({ id }) => id), ["new", "capability-validated", "handshake-authenticated", "established", "retiring", "terminal"]);
  assert.equal(state.sessionLock.recordInheritance, "derive-from-session-not-wire-repeat");
  assert.match(runtime, /unknown labels.*rejected|Unknown labels.*rejected/i);
  assert.match(runtime, /established-record/);
  assert.match(runtime, /pq-epoch/);
  assert.match(documentation, /strongest.*common|highest.*strength/i);
  assert.match(documentation, /Normative resource contract/i);
  assert.match(baselineDecision, /Definition status \| `SPECIFIED`/);
  assert.match(highDecision, /Definition status \| `SPECIFIED`/);
  const cases = [...validCorpus, ...invalidCorpus];
  assert.equal(new Set(cases.map(({ id }) => id)).size, cases.length);
  assert.deepEqual(corpusManifest.caseIds, [...cases.map(({ id }) => id)].sort());
  assert.deepEqual(corpusManifest.caseIds, [...corpusManifest.caseIds].sort());
  assert.ok(corpusManifest.requirementCoverage.every(({ caseIds }) => caseIds.every((id) => cases.some((case_) => case_.id === id))));
  assert.ok(validCorpus.every(({ expected }) => expected.outcome === "accept"));
  assert.ok(invalidCorpus.every(({ expected }) => expected.outcome === "reject"));
  for (const keyword of ["positive", "negative", "boundary", "adversarial", "replay", "restart", "retirement"]) {
    assert.match(JSON.stringify({ validCorpus, invalidCorpus, resources, corpusManifest }), new RegExp(keyword, "i"));
  }
});

test("label registry closes all runtime records and forbids stable-field repetition", () => {
  assert.deepEqual(labels.recordTypes, { capability: 0, handshake: 1, established: 2, pqEpoch: 3, prekeyBundle: 4 });
  assert.deepEqual(labels.directions, { initiatorToResponder: 0, responderToInitiator: 1 });
  assert.deepEqual(labels.roles, { initiator: 0, responder: 1 });
  assert.equal(registry.representation.unknownLabels, "reject-record");
  assert.equal(registry.sessionBinding.repeatedStableFields, "reject-record");
  assert.equal(registry.observerBoundary.outerSenderIdentity, "never");
  assert.deepEqual(registry.profiles.map(({ profileId }) => profileId), [PROFILE_IDS["high-assurance"], PROFILE_IDS.baseline]);
});
