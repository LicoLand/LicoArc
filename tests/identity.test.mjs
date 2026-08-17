import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const paths = {
  schema: "spec/v1/identity/identity.schema.json",
  policy: "spec/v1/identity/identity.policy.json",
  registry: "spec/v1/identity/registry.json",
  runtime: "spec/v1/identity/runtime.cddl",
  manifest: "conformance/v1/identity/manifest.json",
  valid: "conformance/v1/identity/valid.json",
  invalid: "conformance/v1/identity/invalid.json",
  documentation: "docs/protocols/identity-v1.md"
};

const [schema, policy, registry, manifest, valid, invalid, documentation,
  runtime] = await Promise.all([
  readJson(paths.schema),
  readJson(paths.policy),
  readJson(paths.registry),
  readJson(paths.manifest),
  readJson(paths.valid),
  readJson(paths.invalid),
  readText(paths.documentation),
  readText(paths.runtime)
]);

const allCases = [...valid, ...invalid];
const validById = new Map(valid.map((case_) => [case_.id, case_]));
const invalidById = new Map(invalid.map((case_) => [case_.id, case_]));
const valueCase = (id) => validById.get(id) ?? invalidById.get(id);
const fixture = (id) => structuredClone(validById.get(id).value);

const DIGEST_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const DIGEST_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const DIGEST_C = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
const DIGEST_D = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
const ID_A = "11111111111111111111111111111111";
const SIG_A = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

test("identity source closure is closed, bounded, and candidate-scoped", () => {
  assert.equal(schema.$id, "https://licoarc.com/spec/v1/identity/identity.schema.json");
  assert.equal(policy.wireId, "licoarc.identity.v1");
  assert.equal(policy.lifecycle, "Candidate");
  assert.equal(registry.schemaPath, paths.schema);
  assert.equal(registry.policyPath, paths.policy);
  assert.equal(registry.runtimePath, paths.runtime);
  assert.deepEqual(registry.closedRecordTypes, [
    "identityUpdate",
    "affiliationUpdate",
    "routeUpdate",
    "firstContact",
    "discoveryInput",
    "transparencyBundle",
    "associationClaim"
  ]);
  assert.equal(policy.bounds.MAX_AFFILIATIONS, 4);
  assert.equal(policy.bounds.MAX_ROUTES, 4);
  assert.equal(policy.bounds.MAX_SIGNATURES, 4);
  assert.equal(policy.bounds.MAX_RECORD_BYTES, 65536);
  assert.equal(policy.successorValidation.replacement,
    "atomic-after-complete-validation");
  assert.equal(policy.successorValidation.arrivalOrder, "never-selects");
  assert.equal(policy.successorValidation.stationTime, "never-selects");
  assert.equal(policy.successorValidation.directoryOrder, "never-selects");
  assert.equal(policy.successorValidation.expiry,
    "never-selects-and-never-resets-high-water");
  assert.match(runtime, /identity-record\s*=\s*identity-update/);
  assert.match(documentation, /atomic operation/u);
  assert.match(documentation, /private-key custody/u);
});

test("schema accepts positive record corpus and rejects malformed record corpus", () => {
  for (const case_ of valid) {
    if (case_.kind !== "identity-record") continue;
    assert.deepEqual(validateWithSchema(case_.value, schema), [], case_.id);
  }
  for (const case_ of invalid) {
    if (case_.kind !== "identity-record") continue;
    assert.notDeepEqual(validateWithSchema(case_.value, schema), [], case_.id);
  }
});

test("corpus manifest is deterministic and every requirement has adversarial evidence", () => {
  const ids = allCases.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(manifest.caseIds, [...ids].sort());
  assert.deepEqual(manifest.caseIds, [...manifest.caseIds].sort());
  assert.ok(manifest.caseIds.every((id) => valueCase(id)));
  assert.ok(manifest.requirementCoverage.length >= 7);
  for (const requirement of manifest.requirementCoverage) {
    assert.ok(requirement.requirementId);
    assert.ok(requirement.caseIds.length > 0);
    for (const id of requirement.caseIds) assert.ok(valueCase(id), id);
  }
  for (const case_ of valid) {
    assert.equal(case_.expected.outcome, "accept", case_.id);
  }
  for (const case_ of invalid) {
    assert.equal(case_.expected.outcome, "reject", case_.id);
  }
  const requiredKeywords = [
    "gap", "fork", "replay", "rollback", "split", "rotation",
    "revocation", "recovery", "malicious-station", "single-use"
  ];
  const corpusText = JSON.stringify({ valid, invalid });
  for (const keyword of requiredKeywords) assert.match(corpusText, new RegExp(keyword, "i"));
});

test("identity, affiliation, and Route chains require genesis and exact successors", () => {
  const identity = new ChainStore("identity");
  const identityGenesis = fixture("identity-v1.accept.identity-genesis");
  assert.deepEqual(identity.apply(identityGenesis), { accepted: true, reason: "genesis" });
  const rotation = fixture("identity-v1.accept.identity-rotation");
  assert.deepEqual(identity.apply(rotation), { accepted: true, reason: "successor" });
  assert.equal(identity.highWater.epoch, 2);
  assert.equal(identity.highWater.digest, rotation.stateDigest);
  assert.equal(identity.highWater.endpointIdentityRef, DIGEST_B);

  const affiliation = new ChainStore("affiliation");
  const affiliationGenesis = fixture("identity-v1.accept.affiliation-genesis-unaffiliated");
  assert.deepEqual(affiliation.apply(affiliationGenesis), { accepted: true, reason: "genesis" });
  const affiliationMigration = fixture("identity-v1.accept.affiliation-migration");
  assert.deepEqual(affiliation.apply(affiliationMigration), { accepted: true, reason: "successor" });
  assert.equal(affiliation.highWater.epoch, 2);

  const route = new ChainStore("route");
  const routeGenesis = fixture("identity-v1.accept.route-genesis");
  assert.deepEqual(route.apply(routeGenesis), { accepted: true, reason: "genesis" });
  const routeSuccessor = nextRoute(routeGenesis, route.highWater.digest, 2);
  assert.deepEqual(route.apply(routeSuccessor), { accepted: true, reason: "successor" });
  assert.equal(route.highWater.epoch, 2);
});

test("successor validation is atomic and rejects gap, fork, replay, rollback, and overflow", () => {
  const store = new ChainStore("identity");
  const genesis = fixture("identity-v1.accept.identity-genesis");
  store.apply(genesis);
  const before = structuredClone(store.highWater);

  const gap = nextIdentity(genesis, 3, "gap");
  assert.deepEqual(store.apply(gap), { accepted: false, reason: "gap" });
  assert.deepEqual(store.highWater, before);

  const successor = nextIdentity(genesis, 2, "successor");
  assert.deepEqual(store.apply(successor), { accepted: true, reason: "successor" });
  const afterSuccessor = structuredClone(store.highWater);

  const fork = structuredClone(successor);
  fork.stateDigest = DIGEST_D;
  assert.deepEqual(store.apply(fork), { accepted: false, reason: "fork" });
  assert.deepEqual(store.highWater, afterSuccessor);

  const replay = structuredClone(successor);
  assert.deepEqual(store.apply(replay), { accepted: false, reason: "replay" });
  assert.deepEqual(store.highWater, afterSuccessor);

  const rollback = structuredClone(genesis);
  assert.deepEqual(store.apply(rollback), { accepted: false, reason: "rollback" });
  assert.deepEqual(store.highWater, afterSuccessor);

  const overflow = nextIdentity(successor, policy.bounds.MAX_EPOCH + 1, "overflow");
  assert.deepEqual(store.apply(overflow), { accepted: false, reason: "overflow" });
  assert.deepEqual(store.highWater, afterSuccessor);
});

test("restart restores high-water state before processing and expiry cannot reset it", () => {
  const source = new ChainStore("route");
  const genesis = fixture("identity-v1.accept.route-genesis");
  source.apply(genesis);
  const successor = nextRoute(genesis, source.highWater.digest, 2);
  source.apply(successor);
  source.highWater.expired = true;

  const restarted = ChainStore.restart(source);
  assert.equal(restarted.highWater.epoch, 2);
  assert.equal(restarted.highWater.digest, source.highWater.digest);
  const stale = structuredClone(genesis);
  assert.deepEqual(restarted.apply(stale), { accepted: false, reason: "rollback" });
  assert.equal(restarted.highWater.epoch, 2);
});

test("affiliation migration changes the global state first and Route migration follows it", () => {
  const affiliation = new ChainStore("affiliation");
  const genesis = fixture("identity-v1.accept.affiliation-genesis-unaffiliated");
  const migration = fixture("identity-v1.accept.affiliation-migration");
  affiliation.apply(genesis);
  const route = new ChainStore("route", { peerEndpointIdentityRef: "2424242424242424242424242424242424242424242424242424242424242424" });
  const routeGenesis = fixture("identity-v1.accept.route-genesis");
  assert.equal(route.apply(routeGenesis).accepted, true);
  assert.equal(route.currentAffiliationDigest, routeGenesis.affiliationStateDigest);
  assert.deepEqual(affiliation.apply(migration), { accepted: true, reason: "successor" });
  const migratedRoute = nextRoute(routeGenesis, route.highWater.digest, 2);
  migratedRoute.transition = "migration";
  migratedRoute.affiliationStateDigest = migration.stateDigest;
  assert.deepEqual(route.apply(migratedRoute), { accepted: true, reason: "successor" });
  assert.equal(route.currentAffiliationDigest, migration.stateDigest);
  assert.equal(route.highWater.endpointIdentityRef, DIGEST_B);
});

test("continuity-preserving rotation, revocation, and recovery retain Endpoint identity", () => {
  const store = new ChainStore("identity");
  const genesis = fixture("identity-v1.accept.identity-genesis");
  const rotation = fixture("identity-v1.accept.identity-rotation");
  store.apply(genesis);
  store.apply(rotation);
  const revoked = nextIdentity(rotation, 3, "revocation");
  revoked.revokedKeyDigests = ["1313131313131313131313131313131313131313131313131313131313131313"];
  revoked.keyAuthorizations[0].keyState = "revoked";
  revoked.continuityProof.proofKind = "revocation";
  assert.deepEqual(store.apply(revoked), { accepted: true, reason: "successor" });
  assert.equal(store.status, "revoked");
  const recovery = nextIdentity(revoked, 4, "recovery");
  recovery.recoveryProof = {
    recoveryDigest: "3939393939393939393939393939393939393939393939393939393939393939",
    witnesses: [recovery.continuityProof.signature]
  };
  recovery.continuityProof.proofKind = "recovery";
  recovery.keyAuthorizations[0].keyState = "recovery";
  assert.deepEqual(store.apply(recovery), { accepted: true, reason: "successor" });
  assert.equal(store.status, "active");
  assert.equal(store.highWater.endpointIdentityRef, DIGEST_B);
  assert.equal(store.highWater.epoch, 4);
});

test("continuity failure cannot migrate state to a new Endpoint", () => {
  const store = new ChainStore("identity");
  const genesis = fixture("identity-v1.accept.identity-genesis");
  store.apply(genesis);
  const replacement = nextIdentity(genesis, 2, "successor");
  replacement.endpointIdentityRef = "9999999999999999999999999999999999999999999999999999999999999999";
  assert.deepEqual(store.apply(replacement), {
    accepted: false,
    reason: "continuity-failure-new-endpoint"
  });
  assert.equal(store.highWater.endpointIdentityRef, DIGEST_B);
});

test("first contact is purpose-scoped, single-use, protected, and locally unverified", () => {
  const record = fixture("identity-v1.accept.first-contact-unverified");
  assert.deepEqual(validateWithSchema(record, schema), []);
  assert.equal(record.handleClass, "firstContact");
  assert.equal(record.purpose, "firstContact");
  assert.equal(record.singleUse, true);
  assert.equal(record.peerVerificationState, "unverified");
  assert.equal(record.invitationBinding, record.protectedInvitation.invitationBinding);
  assert.equal(record.audienceDigest, record.protectedInvitation.audienceDigest);
  assert.equal(policy.firstContact.independentTokenField, false);
  assert.equal(policy.firstContact.stationSuccessMeaning, "routing-hint-only");

  const firstContactAttempts = new Set();
  const redeem = () => {
    if (firstContactAttempts.has(record.deliveryHandle)) return false;
    firstContactAttempts.add(record.deliveryHandle);
    return true;
  };
  assert.equal(redeem(), true);
  assert.equal(redeem(), false);
  assert.equal(record.peerVerificationState, "unverified");
});

test("Station observers receive only bounded opaque commitments and finite service statements", () => {
  const affiliation = fixture("identity-v1.accept.affiliation-migration").stationAffiliations[0];
  const route = fixture("identity-v1.accept.route-genesis").routes[0];
  const stationVisibleAffiliation = {
    stationDescriptorDigest: affiliation.stationDescriptorDigest,
    affiliationCommitment: affiliation.affiliationCommitment,
    operationId: "operation-local"
  };
  const stationVisibleRoute = {
    stationDescriptorDigest: route.stationDescriptorDigest,
    affiliationCommitment: route.affiliationCommitment,
    transportProfileId: route.transportProfileId,
    deliveryHandle: route.deliveryHandle,
    serviceUntil: route.serviceUntil,
    stationServiceSignature: route.stationServiceSignature
  };
  const visible = JSON.stringify({ stationVisibleAffiliation, stationVisibleRoute });
  for (const forbidden of [
    "endpointIdentityRef", "affiliationNonce", "stationAffiliations", "peerEndpointIdentityRef",
    "invitationBinding", "plaintext", "peerTrust"
  ]) assert.equal(visible.includes(forbidden), false, forbidden);
  assert.equal(policy.stationBoundary.identityVisibility, "never");
  assert.equal(policy.stationBoundary.stationAuthority,
    "finite-service-statement-only");
  assert.ok(policy.stationBoundary.forbiddenClaims.includes("chain-order"));
  assert.ok(policy.stationBoundary.forbiddenClaims.includes("peer-trust"));
});

test("discovery, witnesses, gossip, Station signatures, and Verification Records remain bounded inputs", () => {
  const discovery = fixture("identity-v1.accept.discovery-input-is-not-authority");
  const transparency = fixture("identity-v1.accept.transparency-bounded-inputs");
  assert.equal(discovery.authenticatedInputOnly, true);
  assert.equal(transparency.authority, "bounded-authenticated-input-only");
  assert.equal(transparency.endpointRetainsContinuity, true);
  assert.equal(policy.transparency.inputSelectsIdentity, false);
  assert.equal(policy.transparency.inputSelectsTrust, false);
  assert.equal(policy.transparency.splitView,
    "surface-conflict-to-endpoint;-never-pick-arrival-or-source");
  for (const field of [
    "witnessInputs", "gossipInputs", "discoveryInputs", "stationSignatureInputs", "verificationInputs"
  ]) {
    assert.equal(transparency[field].length <= policy.bounds.MAX_WITNESS_INPUTS, true);
  }
});

test("schema limits affiliation, Route, key, signature, and transparency collections", () => {
  const affiliation = fixture("identity-v1.accept.affiliation-migration");
  while (affiliation.stationAffiliations.length < policy.bounds.MAX_AFFILIATIONS) {
    const n = affiliation.stationAffiliations.length + 40;
    const suffix = n.toString(16).padStart(2, "0");
    const hex = `${"a".repeat(62)}${suffix}`;
    const commitment = `${"c".repeat(62)}${suffix}`;
    const nonce = `${"b".repeat(62)}${suffix}`;
    const id = `${"1".repeat(30)}${suffix}`;
    affiliation.stationAffiliations.push({
      stationDescriptorDigest: hex,
      affiliationCommitment: commitment,
      affiliationNonce: nonce,
      affiliationNotAfter: 2000,
      stationAffiliationSignature: {
        keyId: id,
        signaturePurpose: "station-affiliation",
        signatureValue: hex
      }
    });
  }
  assert.deepEqual(validateWithSchema(affiliation, schema), [],
    JSON.stringify(validateWithSchema(affiliation, schema)));
  affiliation.stationAffiliations.push(structuredClone(affiliation.stationAffiliations[0]));
  assert.notDeepEqual(validateWithSchema(affiliation, schema), []);

  const route = fixture("identity-v1.accept.route-genesis");
  while (route.routes.length < policy.bounds.MAX_ROUTES) {
    const n = route.routes.length + 40;
    const suffix = n.toString(16).padStart(2, "0");
    const hex = `${"d".repeat(62)}${suffix}`;
    const handle = `${"c".repeat(62)}${suffix}`;
    route.routes.push({
      ...structuredClone(route.routes[0]),
      transportProfileId: hex,
      deliveryHandle: handle
    });
  }
  assert.deepEqual(validateWithSchema(route, schema), [],
    JSON.stringify(validateWithSchema(route, schema)));
  route.routes.push(structuredClone(route.routes[0]));
  assert.notDeepEqual(validateWithSchema(route, schema), []);

  const identity = fixture("identity-v1.accept.identity-genesis");
  while (identity.keyAuthorizations.length < 4) {
    const n = identity.keyAuthorizations.length + 50;
    const hex = n.toString(16).repeat(64).slice(0, 64);
    identity.keyAuthorizations.push({
      keyId: n.toString(16).repeat(32).slice(0, 32),
      keyPurpose: "evidence",
      keyDigest: hex,
      keyState: "active",
      validFromEpoch: 1
    });
  }
  assert.deepEqual(validateWithSchema(identity, schema), [],
    JSON.stringify(validateWithSchema(identity, schema)));
  identity.keyAuthorizations.push(structuredClone(identity.keyAuthorizations[0]));
  assert.notDeepEqual(validateWithSchema(identity, schema), []);

  const oversized = fixture("identity-v1.accept.first-contact-unverified");
  assert.equal(Buffer.byteLength(JSON.stringify(oversized), "utf8") < policy.bounds.MAX_RECORD_BYTES, true);
  assert.equal(policy.bounds.MAX_VERIFICATION_EVIDENCE_BYTES < policy.bounds.MAX_RECORD_BYTES, true);
});

test("Endpoint identity cannot embed Station, domain, Provider, account, device, listener, or Handle", () => {
  const identity = fixture("identity-v1.accept.identity-genesis");
  assert.match(identity.endpointIdentityRef, /^[0-9a-f]{64}$/u);
  for (const excluded of policy.endpointIdentityExclusions) {
    assert.equal(identity.endpointIdentityRef.includes(excluded), false, excluded);
  }
  const docsLower = documentation.toLowerCase();
  for (const phrase of [
    "never constructed", "does not receive the stable endpoint identity",
    "no independent invitation token", "does not prove"
  ]) assert.match(docsLower, new RegExp(phrase, "u"));
});

test("negative corpus records every adversarial outcome without relying on observer trust", () => {
  const required = new Map([
    ["gap", "identity-v1.reject.identity-gap"],
    ["fork", "identity-v1.reject.identity-fork"],
    ["replay", "identity-v1.reject.identity-replay"],
    ["rollback", "identity-v1.reject.identity-rollback-after-restart"],
    ["stale-affiliation", "identity-v1.reject.route-old-affiliation"],
    ["single-use-replay", "identity-v1.reject.first-contact-replay"],
    ["no-authority", "identity-v1.reject.station-time-selects-tip"]
  ]);
  for (const [reason, id] of required) {
    assert.equal(valueCase(id).expected.rejectionClass, reason);
  }
  assert.equal(policy.associationClaims.mergesIdentities, false);
  assert.equal(policy.associationClaims.setsPeerTrust, false);
  assert.equal(policy.firstContact.initialPeerVerificationState, "unverified");
});

class ChainStore {
  constructor(kind, options = {}) {
    this.kind = kind;
    this.peerEndpointIdentityRef = options.peerEndpointIdentityRef ?? null;
    this.highWater = null;
    this.currentAffiliationDigest = options.currentAffiliationDigest ?? null;
    this.status = "active";
  }

  static restart(store) {
    const restarted = new ChainStore(store.kind, {
      peerEndpointIdentityRef: store.peerEndpointIdentityRef,
      currentAffiliationDigest: store.currentAffiliationDigest
    });
    restarted.highWater = structuredClone(store.highWater);
    restarted.status = store.status;
    return restarted;
  }

  apply(record) {
    if (this.kind === "route" &&
        this.currentAffiliationDigest !== null &&
        record.affiliationStateDigest !== this.currentAffiliationDigest) {
      return { accepted: false, reason: "stale-affiliation" };
    }
    const endpointIdentityRef = record.endpointIdentityRef;
    if (this.highWater !== null &&
        endpointIdentityRef !== this.highWater.endpointIdentityRef) {
      return { accepted: false, reason: "continuity-failure-new-endpoint" };
    }
    if (this.kind === "route" && this.peerEndpointIdentityRef !== null &&
        record.peerEndpointIdentityRef !== this.peerEndpointIdentityRef) {
      return { accepted: false, reason: "wrong-relationship" };
    }
    const epoch = epochOf(this.kind, record);
    const digest = logicalDigestFor(this.kind, record);
    if (!Number.isSafeInteger(epoch) || epoch > policy.bounds.MAX_EPOCH) {
      return { accepted: false, reason: "overflow" };
    }
    if (this.highWater === null) {
      if (epoch !== 1 || transitionOf(record) !== "genesis" || predecessorOf(this.kind, record) !== undefined) {
        return { accepted: false, reason: "genesis" };
      }
      this.highWater = this.snapshot(record, epoch, digest);
      if (this.kind === "affiliation") this.currentAffiliationDigest = record.stateDigest;
      if (this.kind === "route") this.currentAffiliationDigest = record.affiliationStateDigest;
      return { accepted: true, reason: "genesis" };
    }
    if (epoch < this.highWater.epoch) return { accepted: false, reason: "rollback" };
    if (epoch === this.highWater.epoch) {
      return {
        accepted: false,
        reason: digest === this.highWater.digest ? "replay" : "fork"
      };
    }
    if (epoch > this.highWater.epoch + 1) return { accepted: false, reason: "gap" };
    if (predecessorOf(this.kind, record) !== this.highWater.digest) {
      return { accepted: false, reason: "fork" };
    }
    if (this.kind === "identity" && this.status === "revoked" &&
        transitionOf(record) !== "recovery") {
      return { accepted: false, reason: "revoked-identity" };
    }
    if (this.kind === "identity" && transitionOf(record) === "recovery" &&
        !record.recoveryProof) {
      return { accepted: false, reason: "recovery-proof" };
    }
    // The candidate is copied only after every check above: this is the
    // atomic high-water replacement boundary.
    this.highWater = this.snapshot(record, epoch, digest);
    if (this.kind === "identity") {
      this.status = transitionOf(record) === "revocation" ? "revoked" : "active";
    }
    if (this.kind === "affiliation") this.currentAffiliationDigest = record.stateDigest;
    if (this.kind === "route") this.currentAffiliationDigest = record.affiliationStateDigest;
    return { accepted: true, reason: "successor" };
  }

  snapshot(record, epoch, digest) {
    return {
      epoch,
      digest,
      endpointIdentityRef: record.endpointIdentityRef,
      peerEndpointIdentityRef: record.peerEndpointIdentityRef
    };
  }
}

function nextIdentity(previous, epoch, transition) {
  const next = structuredClone(previous);
  next.identityEpoch = epoch;
  next.previousIdentityStateDigest = logicalDigestFor("identity", previous);
  next.transition = transition === "successor" ? "rotation" : transition;
  next.stateDigest = epoch === 2 ? "1212121212121212121212121212121212121212121212121212121212121212" :
    epoch === 3 ? "3939393939393939393939393939393939393939393939393939393939393939" :
      "4949494949494949494949494949494949494949494949494949494949494949";
  next.continuityProof.predecessorStateDigest = next.previousIdentityStateDigest;
  next.continuityProof.proofKind = next.transition;
  if (transition === "recovery") {
    next.recoveryProof = {
      recoveryDigest: "3939393939393939393939393939393939393939393939393939393939393939",
      witnesses: [next.continuityProof.signature]
    };
  }
  return next;
}

function nextRoute(previous, predecessorDigest, epoch) {
  const next = structuredClone(previous);
  next.routeEpoch = epoch;
  next.previousRouteUpdateDigest = predecessorDigest;
  next.transition = "migration";
  next.routes[0].deliveryHandle = "5656565656565656565656565656565656565656565656565656565656565656";
  next.routeNotAfter += 1;
  return next;
}

function epochOf(kind, record) {
  return kind === "identity" ? record.identityEpoch :
    kind === "affiliation" ? record.affiliationEpoch : record.routeEpoch;
}

function predecessorOf(kind, record) {
  return kind === "identity" ? record.previousIdentityStateDigest :
    kind === "affiliation" ? record.previousAffiliationUpdateDigest :
      record.previousRouteUpdateDigest;
}

function transitionOf(record) {
  return record.transition;
}

function logicalDigestFor(kind, record) {
  if (kind !== "route") return record.stateDigest;
  const logical = structuredClone(record);
  delete logical.endpointSignature;
  return createHash("sha256").update(canonicalizeJson(logical)).digest("hex");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function readText(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function validateWithSchema(instance, rootSchema, schemaValue = rootSchema,
  context = { instancePath: "", schemaPath: "#" }) {
  if (schemaValue.$ref) {
    const resolved = resolveJsonPointer(rootSchema, schemaValue.$ref.slice(1));
    return validateWithSchema(instance, rootSchema, resolved, context);
  }
  const errors = [];
  if (schemaValue.oneOf) {
    const branchErrors = schemaValue.oneOf.map((branch) =>
      validateWithSchema(instance, rootSchema, branch, context));
    const validBranches = branchErrors.filter((errors) => errors.length === 0);
    if (validBranches.length !== 1) errors.push({ keyword: "oneOf", ...context });
  }
  if (schemaValue.anyOf && !schemaValue.anyOf.some((branch) =>
      validateWithSchema(instance, rootSchema, branch, context).length === 0)) {
    errors.push({ keyword: "anyOf", ...context });
  }
  if (schemaValue.not &&
      validateWithSchema(instance, rootSchema, schemaValue.not, context).length === 0) {
    errors.push({ keyword: "not", ...context });
  }
  if (schemaValue.type && !matchesType(instance, schemaValue.type)) {
    errors.push({ keyword: "type", ...context });
    return errors;
  }
  if (Object.hasOwn(schemaValue, "const") && !deepEqual(instance, schemaValue.const)) {
    errors.push({ keyword: "const", ...context });
  }
  if (schemaValue.enum && !schemaValue.enum.some((candidate) => deepEqual(instance, candidate))) {
    errors.push({ keyword: "enum", ...context });
  }
  if (typeof instance === "string") {
    if (schemaValue.pattern && !new RegExp(schemaValue.pattern, "u").test(instance)) {
      errors.push({ keyword: "pattern", ...context });
    }
    if (schemaValue.minLength !== undefined && [...instance].length < schemaValue.minLength) {
      errors.push({ keyword: "minLength", ...context });
    }
    if (schemaValue.maxLength !== undefined && [...instance].length > schemaValue.maxLength) {
      errors.push({ keyword: "maxLength", ...context });
    }
  }
  if (typeof instance === "number") {
    if (schemaValue.minimum !== undefined && instance < schemaValue.minimum) {
      errors.push({ keyword: "minimum", ...context });
    }
    if (schemaValue.maximum !== undefined && instance > schemaValue.maximum) {
      errors.push({ keyword: "maximum", ...context });
    }
  }
  if (Array.isArray(instance)) {
    if (schemaValue.minItems !== undefined && instance.length < schemaValue.minItems) {
      errors.push({ keyword: "minItems", ...context });
    }
    if (schemaValue.maxItems !== undefined && instance.length > schemaValue.maxItems) {
      errors.push({ keyword: "maxItems", ...context });
    }
    if (schemaValue.uniqueItems === true) {
      const serialized = instance.map((item) => canonicalizeJson(item));
      if (new Set(serialized).size !== serialized.length) errors.push({ keyword: "uniqueItems", ...context });
    }
    if (schemaValue.items) {
      instance.forEach((item, index) => {
        errors.push(...validateWithSchema(item, rootSchema, schemaValue.items, {
          instancePath: `${context.instancePath}/${index}`,
          schemaPath: `${context.schemaPath}/items`
        }));
      });
    }
  }
  if (instance !== null && typeof instance === "object" && !Array.isArray(instance)) {
    if (schemaValue.required) {
      for (const key of schemaValue.required) {
        if (!Object.hasOwn(instance, key)) errors.push({ keyword: "required", ...context, missingProperty: key });
      }
    }
    if (schemaValue.properties) {
      for (const [key, childSchema] of Object.entries(schemaValue.properties)) {
        if (Object.hasOwn(instance, key)) {
          errors.push(...validateWithSchema(instance[key], rootSchema, childSchema, {
            instancePath: `${context.instancePath}/${escapePointer(key)}`,
            schemaPath: `${context.schemaPath}/properties/${escapePointer(key)}`
          }));
        }
      }
      if (schemaValue.additionalProperties === false) {
        for (const key of Object.keys(instance)) {
          if (!Object.hasOwn(schemaValue.properties, key)) {
            errors.push({ keyword: "additionalProperties", ...context, additionalProperty: key });
          }
        }
      }
    }
  }
  return errors;
}

function resolveJsonPointer(root, pointer) {
  let value = root;
  for (const segment of pointer.split("/")) {
    if (!segment) continue;
    value = value[segment.replaceAll("~1", "/").replaceAll("~0", "~")];
  }
  return value;
}

function matchesType(value, type) {
  if (Array.isArray(type)) return type.some((candidate) => matchesType(value, candidate));
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return typeof value === "number" && Number.isSafeInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  if (type === "null") return value === null;
  return false;
}

function deepEqual(left, right) {
  return canonicalizeJson(left) === canonicalizeJson(right);
}

function canonicalizeJson(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`).join(",")}}`;
}

function escapePointer(value) {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}
