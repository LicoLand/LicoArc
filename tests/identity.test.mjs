import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { encodeDeterministicCbor } from "../tools/protocol/deterministic-cbor.mjs";
import {
  admitProtectedAuthorityPayload,
  applyUserAuthorityCatchUp,
  authoritySignatureInput,
  computeUserAuthorityStateDigest,
  deriveUserIdentityRef,
  possessionProofInput,
  replacementPossessionInput,
  validateUserAuthorityState
} from "../tools/protocol/user-authority.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const paths = {
  schema: "spec/v1/identity/identity.schema.json",
  policy: "spec/v1/identity/identity.policy.json",
  registry: "spec/v1/identity/registry.json",
  runtime: "spec/v1/identity/runtime.cddl",
  manifest: "conformance/v1/identity/manifest.json",
  cases: "conformance/v1/identity/cases.json",
  documentation: "docs/protocols/identity-v1.md"
};

const [schema, policy, registry, manifest, documentation,
  runtime, cases] = await Promise.all([
  readJson(paths.schema),
  readJson(paths.policy),
  readJson(paths.registry),
  readJson(paths.manifest),
  readText(paths.documentation),
  readText(paths.runtime),
  readJson(paths.cases)
]);

const DIGEST_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const DIGEST_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const DIGEST_C = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
const DIGEST_D = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
const ID_A = "11".repeat(32);
const SIG_A = "ee".repeat(64);
const ED25519_PROFILE_ID = "176b912b9547ca9c47ace10f881457ab63fcd493ef953616f5859e76b830fd60";
const ML_DSA_65_PROFILE_ID = "427e788bb9aed076acc2fb5a94715d14e694ec5fbc846ac52c8c7e118a6b1b8f";

test("identity source closure is closed, bounded, and candidate-scoped", () => {
  assert.equal(schema.$id, "https://licoarc.com/spec/v1/identity/identity.schema.json");
  assert.equal(policy.wireId, "licoarc.identity.v1");
  assert.equal(policy.lifecycle, "Candidate");
  assert.equal(registry.schemaPath, paths.schema);
  assert.equal(registry.policyPath, paths.policy);
  assert.equal(registry.runtimePath, paths.runtime);
  assert.deepEqual(registry.closedRecordTypes, [
    "userAuthorityState",
    "identityUpdate",
    "affiliationUpdate",
    "routeUpdate",
    "firstContact",
    "discoveryInput",
    "transparencyBundle",
    "stationDescriptor"
  ]);
  assert.equal(policy.bounds.MAX_AFFILIATIONS, 4);
  assert.equal(policy.bounds.MAX_ROUTES, 4);
  assert.equal(policy.bounds.MAX_SIGNATURES, 4);
  assert.equal(policy.bounds.MAX_LISTENERS, 4);
  assert.equal(policy.bounds.MAX_STATION_KEYS, 4);
  assert.equal(policy.bounds.MAX_ENDPOINT_URI_BYTES, 128);
  assert.equal(policy.bounds.MAX_RECORD_BYTES, 141501);
  assert.equal(policy.successorValidation.replacement,
    "atomic-after-complete-validation");
  assert.equal(policy.successorValidation.arrivalOrder, "never-selects");
  assert.equal(policy.successorValidation.stationTime, "never-selects");
  assert.equal(policy.successorValidation.directoryOrder, "never-selects");
  assert.equal(policy.successorValidation.expiry,
    "never-selects-and-never-resets-high-water");
  assert.match(runtime, /identity-record\s*=\s*user-authority-state/);
  assert.match(runtime, /station-descriptor\s*=\s*\{/);
  assert.match(documentation, /atomic operation/u);
  assert.match(documentation, /private-key custody/u);
  assert.equal(manifest.$schema,
    "https://licoarc.com/spec/schemas/conformance-corpus-manifest.schema.json");
  assert.equal(manifest.manifestVersion, "licoarc.conformance-corpus-manifest.v1");
  assert.match(manifest.corpusId, /^licoarc[.].+[.]v[1-9][0-9]*$/u);
  assert.equal(Number.isSafeInteger(manifest.caseCount) && manifest.caseCount > 0, true);
  assert.deepEqual(manifest.operationIds, [...manifest.operationIds].sort());
  assert.equal(new Set(manifest.operationIds).size, manifest.operationIds.length);
  assert.deepEqual(manifest.envelopePaths, [...manifest.envelopePaths].sort());
  assert.equal(new Set(manifest.envelopePaths).size, manifest.envelopePaths.length);
  assert.equal(manifest.envelopePaths.every((sourcePath) =>
    sourcePath.startsWith("conformance/v1/identity/") && sourcePath.endsWith(".json")), true);
  const schemaCases = cases.cases.filter(({ target }) =>
    target.operationId === "licoarc.schema.validate-closed.v1");
  const accepted = schemaCases.filter(({ id }) => id.includes(".accept."));
  const rejected = schemaCases.filter(({ id }) => id.includes(".reject."));
  assert.ok(accepted.some(({ id }) => id.endsWith("station-descriptor-genesis")));
  assert.ok(accepted.every(({ expected }) =>
    expected.result?.valid === true && expected.result.errors.length === 0));
  assert.ok(rejected.every(({ expected }) =>
    expected.result?.valid === false && expected.result.errors.length > 0));
  const operationIds = new Set(cases.cases.map(({ target }) => target.operationId));
  for (const operationId of [
    "licoarc.identity.apply-user-authority-catch-up.v1",
    "licoarc.identity.admit-protected-authority-payload.v1",
    "licoarc.identity.compute-user-authority-state-digest.v1",
    "licoarc.identity.validate-user-authority-transition.v1"
  ]) assert.equal(operationIds.has(operationId), true, operationId);
  assert.equal(JSON.stringify(cases).includes("associationClaim"), false);
});

test("schema accepts direct public records and rejects malformed records", () => {
  for (const record of [
    makeIdentityGenesis(), makeAffiliationGenesis(), makeAffiliationMigration(),
    makeRouteGenesis(), makeFirstContact(), makeDiscoveryInput(), makeTransparencyBundle(),
    makeStationDescriptor()
  ]) assert.deepEqual(validateWithSchema(record, schema), [], record.recordType);

  const missingIdentity = makeIdentityGenesis();
  delete missingIdentity.endpointIdentityRef;
  assert.notDeepEqual(validateWithSchema(missingIdentity, schema), []);
  assert.notDeepEqual(validateWithSchema({ ...makeFirstContact(), singleUse: false }, schema), []);
  assert.notDeepEqual(validateWithSchema({ ...makeDiscoveryInput(), sourceKind: "unknown" }, schema), []);
});

test("Station descriptors have stable seed identity, bounded canonical shape, and retained lineage", () => {
  const genesis = makeStationDescriptor();
  assert.equal(genesis.stationId, deriveStationId("40".repeat(32)));
  assert.equal(genesis.signingKeys[0].keyId, deriveStationKeyId(
    genesis.stationId, genesis.signingKeys[0].keyProfileId,
    genesis.signingKeys[0].publicKey));
  assert.deepEqual(validateWithSchema(genesis, schema), []);
  assert.equal(isCanonicalDescriptor(genesis), true);

  const store = new StationDescriptorStore();
  assert.deepEqual(store.apply(genesis), { accepted: true, reason: "genesis" });
  const successor = structuredClone(genesis);
  successor.descriptorSequence = 4;
  successor.previousDescriptorDigest = store.highWater.digest;
  successor.notBefore = 1800;
  successor.notAfter = 2600;
  assert.deepEqual(store.apply(successor), { accepted: true, reason: "successor" });

  const before = structuredClone(store.highWater);
  const fork = structuredClone(successor);
  fork.notAfter += 1;
  assert.deepEqual(store.apply(fork), { accepted: false, reason: "fork" });
  assert.deepEqual(store.highWater, before);
  assert.deepEqual(store.apply(genesis), { accepted: false, reason: "rollback" });
  assert.deepEqual(store.highWater, before);

  const badPredecessor = structuredClone(successor);
  badPredecessor.descriptorSequence = 5;
  badPredecessor.previousDescriptorDigest = DIGEST_D;
  assert.deepEqual(store.apply(badPredecessor), {
    accepted: false,
    reason: "predecessor-mismatch"
  });
  const badUri = structuredClone(genesis);
  badUri.listeners[0].endpointUri = "https://station.example/path?selector=1";
  assert.notDeepEqual(validateWithSchema(badUri, schema), []);
  assert.equal(registry.stationDescriptorState.expiry, "never-resets-high-water");
  assert.match(policy.stationDescriptor.validity, /never-selects-lineage/u);
});

test("identity, affiliation, and Route chains require genesis and exact successors", () => {
  const identity = new ChainStore("identity");
  const identityGenesis = makeIdentityGenesis();
  assert.deepEqual(identity.apply(identityGenesis), { accepted: true, reason: "genesis" });
  const rotation = makeIdentityRotation();
  assert.deepEqual(identity.apply(rotation), { accepted: true, reason: "successor" });
  assert.equal(identity.highWater.epoch, 2);
  assert.equal(identity.highWater.digest, rotation.stateDigest);
  assert.equal(identity.highWater.endpointIdentityRef, DIGEST_B);

  const affiliation = new ChainStore("affiliation");
  const affiliationGenesis = makeAffiliationGenesis();
  assert.deepEqual(affiliation.apply(affiliationGenesis), { accepted: true, reason: "genesis" });
  const affiliationMigration = makeAffiliationMigration();
  assert.deepEqual(affiliation.apply(affiliationMigration), { accepted: true, reason: "successor" });
  assert.equal(affiliation.highWater.epoch, 2);

  const route = new ChainStore("route");
  const routeGenesis = makeRouteGenesis();
  assert.deepEqual(route.apply(routeGenesis), { accepted: true, reason: "genesis" });
  const routeSuccessor = nextRoute(routeGenesis, route.highWater.digest, 2);
  assert.deepEqual(route.apply(routeSuccessor), { accepted: true, reason: "successor" });
  assert.equal(route.highWater.epoch, 2);
});

test("successor validation is atomic and rejects gap, fork, replay, rollback, and overflow", () => {
  const store = new ChainStore("identity");
  const genesis = makeIdentityGenesis();
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
  const genesis = makeRouteGenesis();
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
  const genesis = makeAffiliationGenesis();
  const migration = makeAffiliationMigration();
  affiliation.apply(genesis);
  const route = new ChainStore("route", { peerEndpointIdentityRef: "2424242424242424242424242424242424242424242424242424242424242424" });
  const routeGenesis = makeRouteGenesis();
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
  const genesis = makeIdentityGenesis();
  const rotation = makeIdentityRotation();
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
  const genesis = makeIdentityGenesis();
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
  const record = makeFirstContact();
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
  const affiliation = makeAffiliationMigration().stationAffiliations[0];
  const route = makeRouteGenesis().routes[0];
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
  const discovery = makeDiscoveryInput();
  const transparency = makeTransparencyBundle();
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
  const affiliation = makeAffiliationMigration();
  while (affiliation.stationAffiliations.length < policy.bounds.MAX_AFFILIATIONS) {
    const n = affiliation.stationAffiliations.length + 40;
    const suffix = n.toString(16).padStart(2, "0");
    const hex = `${"a".repeat(62)}${suffix}`;
    const commitment = `${"c".repeat(62)}${suffix}`;
    const nonce = `${"b".repeat(62)}${suffix}`;
    const id = `${"1".repeat(62)}${suffix}`;
    affiliation.stationAffiliations.push({
      stationDescriptorDigest: hex,
      affiliationCommitment: commitment,
      affiliationNonce: nonce,
      affiliationNotAfter: 2000,
      stationAffiliationSignature: {
        keyProfileId: ED25519_PROFILE_ID,
        keyId: id,
        signaturePurpose: "station-affiliation",
        signatureValue: `${hex}${hex}`
      }
    });
  }
  assert.deepEqual(validateWithSchema(affiliation, schema), [],
    JSON.stringify(validateWithSchema(affiliation, schema)));
  affiliation.stationAffiliations.push(structuredClone(affiliation.stationAffiliations[0]));
  assert.notDeepEqual(validateWithSchema(affiliation, schema), []);

  const route = makeRouteGenesis();
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

  const identity = makeIdentityGenesis();
  while (identity.keyAuthorizations.length < 4) {
    const n = identity.keyAuthorizations.length + 50;
    const hex = n.toString(16).repeat(64).slice(0, 64);
    identity.keyAuthorizations.push({
      keyId: n.toString(16).repeat(64).slice(0, 64),
      keyPurpose: "handshake",
      keyState: "active",
      keyProfileId: ED25519_PROFILE_ID,
      publicKey: hex,
      validFromEpoch: 1
    });
  }
  assert.deepEqual(validateWithSchema(identity, schema), [],
    JSON.stringify(validateWithSchema(identity, schema)));
  identity.keyAuthorizations.push(structuredClone(identity.keyAuthorizations[0]));
  assert.notDeepEqual(validateWithSchema(identity, schema), []);

  const oversized = makeFirstContact();
  assert.equal(Buffer.byteLength(JSON.stringify(oversized), "utf8") < policy.bounds.MAX_RECORD_BYTES, true);
  assert.equal(policy.bounds.MAX_VERIFICATION_INPUT_BYTES < policy.bounds.MAX_RECORD_BYTES, true);
});

test("Endpoint identity cannot embed Station, domain, Provider, account, device, listener, or Handle", () => {
  const identity = makeIdentityGenesis();
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

test("adversarial outcomes remain local and never rely on observer trust", () => {
  assert.equal(policy.applicationAdmission.localPeerTrust, "unchanged-by-authority-validation");
  assert.equal(JSON.stringify(schema).includes("associationClaim"), false);
  assert.equal(policy.firstContact.initialPeerVerificationState, "unverified");
});

test("user authority genesis is self-certifying, canonical, bounded, and signature-excluded", async () => {
  const genesis = makeAuthorityGenesis();
  assert.equal(genesis.authorityEpoch, 0);
  assert.equal(genesis.userIdentityRef, deriveUserIdentityRef(genesis));
  assert.deepEqual(validateWithSchema(genesis, schema), []);
  const digest = computeUserAuthorityStateDigest(genesis);
  const changedSignatures = structuredClone(genesis);
  changedSignatures.authoritySignatures[0].signatureValue = "ff".repeat(64);
  assert.equal(computeUserAuthorityStateDigest(changedSignatures), digest);
  const result = await validateUserAuthorityState(genesis, authorityOptions());
  assert.equal(result.digest, digest);
  assert.equal(result.reason, "genesis");
  assert.equal(Object.isFrozen(result.state.authorizedDevices[0]), true);
});

test("authority digests and signing inputs match the shared fixed vector", () => {
  const managementSigningKeys = authorityKeys("management", 10);
  const recoverySigningKeys = authorityKeys("recovery", 20);
  const userIdentityRef = deriveUserIdentityRef({ managementSigningKeys, recoverySigningKeys });
  const device = {
    endpointIdentityRef: DIGEST_B,
    identityStateDigest: DIGEST_C,
    deviceStatus: "active",
    admittedAuthorityEpoch: 0,
    possessionProof: fixedVectorSignatures("device-possession", 30, 31, 32, 33)
  };
  const state = {
    recordType: "userAuthorityState",
    protocolLineId: DIGEST_A,
    userIdentityRef,
    authorityEpoch: 0,
    authorityTransitionKind: "genesis",
    managementSigningKeys,
    recoverySigningKeys,
    authorizedDevices: [device],
    authoritySignatures: fixedVectorSignatures("authority-genesis", 10, 42, 12, 43)
  };

  assert.equal(userIdentityRef,
    "c73b9b2483d43ef992159c8bf84d65efac0f712f6bd2edb29d28ed7a3941931b");
  assert.equal(computeUserAuthorityStateDigest(state),
    "c91d9ba34346d35bf039ead202878364efd304ad5c9c9c6f60e8b57db7c37181");
  assert.equal(Buffer.from(authoritySignatureInput(state)).toString("hex"),
    "4c49434f4152432d56312f555345522d415554484f524954592d53544154452f5349474e00" +
    "c91d9ba34346d35bf039ead202878364efd304ad5c9c9c6f60e8b57db7c37181");
  assert.equal(Buffer.from(possessionProofInput(state, device)).toString("hex"),
    "4c49434f4152432d56312f555345522d415554484f524954592f4445564943452d504f5353455353494f4e00" +
    "855820aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5820c73b9b2483d43ef992159c8bf84d65efac0f712f6bd2edb29d28ed7a3941931b005820bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb5820cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc");
  const replacement = replacementPossessionInput(state);
  assert.equal(replacement.byteLength, 4437);
  assert.equal(createHash("sha256").update(replacement).digest("hex"),
    "bdc64ba431f64a4d2c50e95ff4ae8e047474833b7dd5633e31dc288091bbd4e7");
});

test("management and recovery transitions reject downgrade, substitution, stale input, and forks atomically", async () => {
  const genesis = makeAuthorityGenesis();
  const acceptedGenesis = await validateUserAuthorityState(genesis, authorityOptions());
  const management = makeAuthoritySuccessor(genesis, "management");
  const acceptedManagement = await validateUserAuthorityState(management, {
    ...authorityOptions(), previousState: acceptedGenesis.state
  });
  assert.equal(acceptedManagement.state.authorityEpoch, 1);

  const stale = structuredClone(management);
  stale.authorityEpoch = 0;
  await assert.rejects(() => validateUserAuthorityState(stale, {
    ...authorityOptions(), previousState: acceptedGenesis.state
  }), errorCode("stale-authority-epoch"));

  const substitutedRecovery = structuredClone(management);
  substitutedRecovery.recoverySigningKeys = authorityKeys("recovery", 70);
  signAuthorityState(substitutedRecovery, genesis.managementSigningKeys, "authority-management");
  await assert.rejects(() => validateUserAuthorityState(substitutedRecovery, {
    ...authorityOptions(), previousState: acceptedGenesis.state
  }), errorCode("management-recovery-authority-substitution"));

  const downgraded = structuredClone(management);
  downgraded.authoritySignatures = [downgraded.authoritySignatures[0]];
  await assert.rejects(() => validateUserAuthorityState(downgraded, {
    ...authorityOptions(), previousState: acceptedGenesis.state
  }), errorCode("authority-signature-composition"));

  const sibling = makeAuthoritySuccessor(genesis, "management");
  sibling.authorizedDevices[0].deviceStatus = "revoked";
  sibling.authorizedDevices[0].revokedAuthorityEpoch = 1;
  signAuthorityState(sibling, genesis.managementSigningKeys, "authority-management");
  await assert.rejects(() => applyUserAuthorityCatchUp(acceptedGenesis,
    [management, sibling], authorityOptions()), errorCode("authority-fork"));
});

test("recovery replacement requires current recovery authority and replacement possession", async () => {
  const genesis = makeAuthorityGenesis();
  const recovery = makeAuthoritySuccessor(genesis, "recovery");
  recovery.recoverySigningKeys = authorityKeys("recovery", 80);
  recovery.possessionProof = {
    recoverySignatures: makeSignatures(recovery.recoverySigningKeys,
      replacementPossessionInput(recovery), "replacement-recovery-possession")
  };
  signAuthorityState(recovery, genesis.recoverySigningKeys, "authority-recovery");
  assert.equal((await validateUserAuthorityState(recovery, {
    ...authorityOptions(), previousState: genesis
  })).reason, "successor");

  const substitutedAuthority = structuredClone(recovery);
  signAuthorityState(substitutedAuthority, substitutedAuthority.recoverySigningKeys,
    "authority-recovery");
  await assert.rejects(() => validateUserAuthorityState(substitutedAuthority, {
    ...authorityOptions(), previousState: genesis
  }), errorCode("unauthorized-authority-signer"));

  const missingPossession = structuredClone(recovery);
  delete missingPossession.possessionProof;
  signAuthorityState(missingPossession, genesis.recoverySigningKeys, "authority-recovery");
  await assert.rejects(() => validateUserAuthorityState(missingPossession, {
    ...authorityOptions(), previousState: genesis
  }), errorCode("replacement-key-possession-required"));
});

test("application admission requires protected matching authority and preserves local peer trust", async () => {
  const genesis = makeAuthorityGenesis();
  const trust = Object.freeze({ verifiedByUser: false });
  const result = await admitProtectedAuthorityPayload({
    payload: genesis,
    expectedAuthorityStateDigest: computeUserAuthorityStateDigest(genesis),
    expectedEndpointIdentityRef: genesis.authorizedDevices[0].endpointIdentityRef,
    expectedIdentityStateDigest: genesis.authorizedDevices[0].identityStateDigest,
    protectedPayloadValidated: true,
    localPeerTrust: trust,
    ...authorityOptions()
  });
  assert.equal(result.applicationAdmitted, true);
  assert.strictEqual(result.localPeerTrust, trust);
  const replay = await admitProtectedAuthorityPayload({
    payload: genesis,
    acceptedAuthority: result,
    expectedAuthorityStateDigest: computeUserAuthorityStateDigest(genesis),
    expectedEndpointIdentityRef: genesis.authorizedDevices[0].endpointIdentityRef,
    expectedIdentityStateDigest: genesis.authorizedDevices[0].identityStateDigest,
    protectedPayloadValidated: true,
    localPeerTrust: trust,
    ...authorityOptions()
  });
  assert.equal(replay.applicationAdmitted, true);
  await assert.rejects(() => admitProtectedAuthorityPayload({
    payload: genesis,
    expectedAuthorityStateDigest: DIGEST_D,
    expectedEndpointIdentityRef: genesis.authorizedDevices[0].endpointIdentityRef,
    expectedIdentityStateDigest: genesis.authorizedDevices[0].identityStateDigest,
    protectedPayloadValidated: true,
    ...authorityOptions()
  }), errorCode("authority-payload-digest-mismatch"));
});

test("device possession resolves the exact protected Endpoint state and rejects cross-Endpoint keys", async () => {
  const genesis = makeAuthorityGenesis();
  await assert.rejects(() => validateUserAuthorityState(genesis, {
    ...authorityOptions(),
    resolveEndpointState: async () => ({
      identityStateDigest: DIGEST_C,
      possessionSigningKeys: authorityKeys("management", 90)
    })
  }), errorCode("unauthorized-possession-signer"));
});

test("unchanged offline-device possession survives successors and a lost device can be revoked", async () => {
  const genesis = makeAuthorityGenesis();
  const acceptedGenesis = await validateUserAuthorityState(genesis, authorityOptions());
  const added = makeAuthoritySuccessor(genesis, "management");
  const newEndpointRef = "d1".repeat(32);
  const newEndpointDigest = "d2".repeat(32);
  const newEndpointKeys = authorityKeys("management", 40);
  added.authorizedDevices.push({
    endpointIdentityRef: newEndpointRef,
    identityStateDigest: newEndpointDigest,
    deviceStatus: "active",
    admittedAuthorityEpoch: 1,
    possessionProof: []
  });
  added.authorizedDevices.sort((left, right) =>
    left.endpointIdentityRef.localeCompare(right.endpointIdentityRef));
  const addedDevice = added.authorizedDevices.find(({ endpointIdentityRef }) =>
    endpointIdentityRef === newEndpointRef);
  addedDevice.possessionProof = makeSignatures(newEndpointKeys,
    possessionProofInput(added, addedDevice), "device-possession");
  signAuthorityState(added, genesis.managementSigningKeys, "authority-management");
  const options = {
    ...authorityOptions(),
    resolveEndpointState: async (endpointIdentityRef) => endpointIdentityRef === DIGEST_B ? {
      identityStateDigest: DIGEST_C,
      possessionSigningKeys: authorityKeys("management", 30)
    } : endpointIdentityRef === newEndpointRef ? {
      identityStateDigest: newEndpointDigest,
      possessionSigningKeys: newEndpointKeys
    } : null
  };
  const acceptedAdded = await validateUserAuthorityState(added, {
    ...options, previousState: acceptedGenesis.state
  });
  const retainedProof = structuredClone(acceptedAdded.state.authorizedDevices.find(
    ({ endpointIdentityRef }) => endpointIdentityRef === DIGEST_B).possessionProof);
  const revoked = makeAuthoritySuccessor(acceptedAdded.state, "management");
  const lost = revoked.authorizedDevices.find(({ endpointIdentityRef }) =>
    endpointIdentityRef === newEndpointRef);
  lost.deviceStatus = "revoked";
  lost.revokedAuthorityEpoch = 2;
  signAuthorityState(revoked, acceptedAdded.state.managementSigningKeys, "authority-management");
  const acceptedRevoked = await validateUserAuthorityState(revoked, {
    ...options,
    previousState: acceptedAdded.state,
    resolveEndpointState: async () => { throw new Error("unchanged devices must not be resolved"); }
  });
  assert.deepEqual(acceptedRevoked.state.authorizedDevices.find(
    ({ endpointIdentityRef }) => endpointIdentityRef === DIGEST_B).possessionProof, retainedProof);
});

test("successors cannot rewrite an unchanged or newly revoked device admission proof", async () => {
  const genesis = makeAuthorityGenesis();
  const accepted = await validateUserAuthorityState(genesis, authorityOptions());
  for (const mutation of ["admitted-epoch", "possession-proof", "revocation-identity"]) {
    const successor = makeAuthoritySuccessor(genesis, "management");
    const device = successor.authorizedDevices[0];
    if (mutation === "admitted-epoch") device.admittedAuthorityEpoch = 1;
    if (mutation === "possession-proof") device.possessionProof[0].signatureValue = "ff".repeat(64);
    if (mutation === "revocation-identity") {
      device.deviceStatus = "revoked";
      device.revokedAuthorityEpoch = 1;
      device.identityStateDigest = DIGEST_D;
    }
    signAuthorityState(successor, genesis.managementSigningKeys, "authority-management");
    await assert.rejects(() => validateUserAuthorityState(successor, {
      ...authorityOptions(), previousState: accepted.state
    }), errorCode("device-admission-mutated"));
  }
});

test("a learned revocation rejects later application records on an existing session", async () => {
  const genesis = makeAuthorityGenesis();
  const acceptedGenesis = await validateUserAuthorityState(genesis, authorityOptions());
  const revoked = makeAuthoritySuccessor(genesis, "management");
  revoked.authorizedDevices[0].deviceStatus = "revoked";
  revoked.authorizedDevices[0].revokedAuthorityEpoch = 1;
  signAuthorityState(revoked, genesis.managementSigningKeys, "authority-management");
  await assert.rejects(() => admitProtectedAuthorityPayload({
    payload: revoked,
    acceptedAuthority: acceptedGenesis,
    expectedAuthorityStateDigest: computeUserAuthorityStateDigest(revoked),
    expectedEndpointIdentityRef: DIGEST_B,
    expectedIdentityStateDigest: DIGEST_C,
    protectedPayloadValidated: true,
    ...authorityOptions()
  }), errorCode("application-endpoint-not-authorized"));
});

function makeAuthorityGenesis() {
  const managementSigningKeys = authorityKeys("management", 10);
  const recoverySigningKeys = authorityKeys("recovery", 20);
  const state = {
    recordType: "userAuthorityState",
    protocolLineId: DIGEST_A,
    userIdentityRef: deriveUserIdentityRef({ managementSigningKeys, recoverySigningKeys }),
    authorityEpoch: 0,
    authorityTransitionKind: "genesis",
    managementSigningKeys,
    recoverySigningKeys,
    authorizedDevices: [{
      endpointIdentityRef: DIGEST_B,
      identityStateDigest: DIGEST_C,
      deviceStatus: "active",
      admittedAuthorityEpoch: 0,
      possessionProof: []
    }],
    authoritySignatures: []
  };
  state.authorizedDevices[0].possessionProof = makeSignatures(authorityKeys("management", 30),
    possessionProofInput(state, state.authorizedDevices[0]), "device-possession");
  signAuthorityState(state, managementSigningKeys, "authority-genesis");
  return state;
}

function makeAuthoritySuccessor(previous, kind) {
  const state = structuredClone(previous);
  state.authorityEpoch += 1;
  state.previousUserAuthorityStateDigest = computeUserAuthorityStateDigest(previous);
  state.authorityTransitionKind = kind;
  state.authoritySignatures = [];
  signAuthorityState(state, kind === "recovery" ? previous.recoverySigningKeys :
    previous.managementSigningKeys, kind === "recovery" ? "authority-recovery" : "authority-management");
  return state;
}

function authorityKeys(purpose, seed) {
  return [
    { keyId: seed.toString(16).padStart(2, "0").repeat(32), keyPurpose: purpose,
      keyProfileId: ED25519_PROFILE_ID, publicKey: (seed + 1).toString(16).padStart(2, "0").repeat(32) },
    { keyId: (seed + 2).toString(16).padStart(2, "0").repeat(32), keyPurpose: purpose,
      keyProfileId: ML_DSA_65_PROFILE_ID, publicKey: (seed + 3).toString(16).padStart(2, "0").repeat(1952) }
  ];
}

function signAuthorityState(state, keys, purpose) {
  state.authoritySignatures = [{}, {}];
  state.authoritySignatures = makeSignatures(keys, authoritySignatureInput(state), purpose);
}

function makeSignatures(keys, input, purpose) {
  return keys.map((key) => ({
    keyProfileId: key.keyProfileId,
    keyId: key.keyId,
    signaturePurpose: purpose,
    signatureValue: fixtureSignature(key.keyId, input,
      key.keyProfileId === ED25519_PROFILE_ID ? 64 : 3309)
  }));
}

function fixedVectorSignatures(purpose, edKey, edValue, mlKey, mlValue) {
  return [
    { keyProfileId: ED25519_PROFILE_ID, keyId: edKey.toString(16).padStart(2, "0").repeat(32),
      signaturePurpose: purpose, signatureValue: edValue.toString(16).padStart(2, "0").repeat(64) },
    { keyProfileId: ML_DSA_65_PROFILE_ID, keyId: mlKey.toString(16).padStart(2, "0").repeat(32),
      signaturePurpose: purpose, signatureValue: mlValue.toString(16).padStart(2, "0").repeat(3309) }
  ];
}

function fixtureSignature(keyId, input, bytes) {
  const block = createHash("sha256").update(Buffer.from(keyId, "hex")).update(input).digest("hex");
  return block.repeat(Math.ceil(bytes * 2 / block.length)).slice(0, bytes * 2);
}

function authorityOptions() {
  return {
    expectedProtocolLineId: DIGEST_A,
    resolveEndpointState: async (endpointIdentityRef) => endpointIdentityRef === DIGEST_B ? {
      identityStateDigest: DIGEST_C,
      possessionSigningKeys: authorityKeys("management", 30)
    } : null,
    verifySignature: async ({ signature, input }) => signature.signatureValue === fixtureSignature(
      signature.keyId, input, signature.keyProfileId === ED25519_PROFILE_ID ? 64 : 3309)
  };
}

function errorCode(code) {
  return (error) => error?.code === code;
}

function makeSignature({ keyId = ID_A, purpose = "endpoint-continuity", value = SIG_A } = {}) {
  return { keyProfileId: ED25519_PROFILE_ID, keyId, signaturePurpose: purpose, signatureValue: value };
}

function makeStationDescriptor() {
  const stationId = deriveStationId("40".repeat(32));
  const publicKey = "41".repeat(32);
  const keyId = deriveStationKeyId(stationId, ED25519_PROFILE_ID, publicKey);
  return {
    recordType: "stationDescriptor",
    stationId,
    descriptorSequence: 1,
    notBefore: 1700,
    notAfter: 2500,
    listeners: [{
      transportProfileId: "42".repeat(32),
      endpointUri: "https://station.example/listen"
    }],
    signingKeys: [{ keyProfileId: ED25519_PROFILE_ID, keyId, publicKey }],
    certificationRefs: ["43".repeat(32)],
    signatures: [makeSignature({
      keyId,
      purpose: "station-descriptor",
      value: "44".repeat(64)
    })]
  };
}

class StationDescriptorStore {
  constructor() {
    this.highWater = null;
  }

  apply(record) {
    if (validateWithSchema(record, schema).length !== 0 || !isCanonicalDescriptor(record) ||
        record.notBefore > record.notAfter) {
      return { accepted: false, reason: "invalid-descriptor" };
    }
    const digest = stationDescriptorDigest(record);
    if (this.highWater === null) {
      if (record.descriptorSequence !== 1 || Object.hasOwn(record, "previousDescriptorDigest") ||
          !record.signatures.some((signature) => signatureAuthorized(signature, record.signingKeys))) {
        return { accepted: false, reason: "invalid-genesis" };
      }
      this.highWater = retainedDescriptor(record, digest);
      return { accepted: true, reason: "genesis" };
    }
    if (record.stationId !== this.highWater.stationId) {
      return { accepted: false, reason: "station-identity-mismatch" };
    }
    if (record.descriptorSequence < this.highWater.sequence) {
      return { accepted: false, reason: "rollback" };
    }
    if (record.descriptorSequence === this.highWater.sequence) {
      return { accepted: false, reason: digest === this.highWater.digest ? "replay" : "fork" };
    }
    if (record.previousDescriptorDigest !== this.highWater.digest) {
      return { accepted: false, reason: "predecessor-mismatch" };
    }
    if (!record.signatures.some((signature) =>
      signatureAuthorized(signature, this.highWater.signingKeys))) {
      return { accepted: false, reason: "continuity-signature-missing" };
    }
    this.highWater = retainedDescriptor(record, digest);
    return { accepted: true, reason: "successor" };
  }
}

function retainedDescriptor(record, digest) {
  return {
    stationId: record.stationId,
    sequence: record.descriptorSequence,
    digest,
    signingKeys: structuredClone(record.signingKeys)
  };
}

function signatureAuthorized(signature, signingKeys) {
  return signingKeys.some((key) =>
    key.keyId === signature.keyId && key.keyProfileId === signature.keyProfileId);
}

function deriveStationId(seedHex) {
  return domainDigest("LICOARC-V1/STATION-ID\0", Buffer.from(seedHex, "hex"));
}

function deriveStationKeyId(stationId, keyProfileId, publicKey) {
  return domainDigest("LICOARC-V1/STATION-KEY-ID\0",
    Buffer.from(stationId, "hex"), Buffer.from(keyProfileId, "hex"),
    Buffer.from(publicKey, "hex"));
}

function stationDescriptorDigest(record) {
  return domainDigest("LICOARC-V1/STATION-DESCRIPTOR\0",
    encodeDeterministicCbor(stationDescriptorWire(record)));
}

function domainDigest(domain, ...parts) {
  const hash = createHash("sha256").update(new TextEncoder().encode(domain));
  for (const part of parts) hash.update(part);
  return hash.digest("hex");
}

function isCanonicalDescriptor(record) {
  return [
    [record.listeners, stationListenerWire],
    [record.signingKeys, stationSigningKeyWire],
    [record.certificationRefs ?? [], (value) => Buffer.from(value, "hex")],
    [record.signatures, signatureWire]
  ].every(([items, project]) => items.every((item, index) => index === 0 ||
    Buffer.compare(Buffer.from(encodeDeterministicCbor(project(items[index - 1]))),
      Buffer.from(encodeDeterministicCbor(project(item)))) < 0));
}

function stationDescriptorWire(record) {
  const value = new Map([
    [0, 7], [1, Buffer.from(record.stationId, "hex")], [2, record.descriptorSequence],
    [4, record.notBefore], [5, record.notAfter],
    [6, record.listeners.map(stationListenerWire)],
    [7, record.signingKeys.map(stationSigningKeyWire)],
    [9, record.signatures.map(signatureWire)]
  ]);
  if (record.previousDescriptorDigest !== undefined) {
    value.set(3, Buffer.from(record.previousDescriptorDigest, "hex"));
  }
  if (record.certificationRefs !== undefined) {
    value.set(8, record.certificationRefs.map((digest) => Buffer.from(digest, "hex")));
  }
  return value;
}

function stationListenerWire(listener) {
  return new Map([
    [0, Buffer.from(listener.transportProfileId, "hex")],
    [1, listener.endpointUri]
  ]);
}

function stationSigningKeyWire(key) {
  return new Map([
    [0, Buffer.from(key.keyProfileId, "hex")],
    [1, Buffer.from(key.keyId, "hex")],
    [2, Buffer.from(key.publicKey, "hex")]
  ]);
}

function signatureWire(signature) {
  return new Map([
    [0, Buffer.from(signature.keyProfileId, "hex")],
    [1, Buffer.from(signature.keyId, "hex")],
    [2, 8],
    [3, Buffer.from(signature.signatureValue, "hex")]
  ]);
}

function makeIdentityGenesis() {
  return {
    recordType: "identityUpdate",
    protocolLineId: DIGEST_A,
    endpointIdentityRef: DIGEST_B,
    identityEpoch: 1,
    transition: "genesis",
    stateDigest: DIGEST_C,
    keyAuthorizations: [{
      keyId: ID_A,
      keyPurpose: "identity",
      keyState: "active",
      keyProfileId: ED25519_PROFILE_ID,
      publicKey: DIGEST_D,
      validFromEpoch: 1
    }],
    continuityProof: {
      proofKind: "genesis",
      predecessorStateDigest: null,
      signature: makeSignature()
    },
    endpointSignature: makeSignature({ value: "ff".repeat(64) })
  };
}

function makeIdentityRotation() {
  const rotation = nextIdentity(makeIdentityGenesis(), 2, "rotation");
  rotation.keyAuthorizations = [{
    keyId: "22".repeat(32),
    keyPurpose: "identity",
    keyState: "active",
    keyProfileId: ED25519_PROFILE_ID,
    publicKey: "13".repeat(32),
    validFromEpoch: 2
  }];
  rotation.endpointSignature = makeSignature({ keyId: "22".repeat(32), value: "15".repeat(64) });
  return rotation;
}

function makeAffiliationGenesis() {
  return {
    recordType: "affiliationUpdate",
    protocolLineId: DIGEST_A,
    endpointIdentityRef: DIGEST_B,
    affiliationEpoch: 1,
    transition: "genesis",
    stationAffiliations: [],
    stateDigest: "16".repeat(32),
    endpointSignature: makeSignature({ value: "17".repeat(64) })
  };
}

function makeAffiliationMigration() {
  return {
    ...makeAffiliationGenesis(),
    affiliationEpoch: 2,
    previousAffiliationUpdateDigest: "16".repeat(32),
    transition: "migration",
    stationAffiliations: [{
      stationDescriptorDigest: "18".repeat(32),
      affiliationCommitment: "19".repeat(32),
      affiliationNonce: "20".repeat(32),
      affiliationNotAfter: 2000,
      stationAffiliationSignature: makeSignature({
        keyId: "33".repeat(32), purpose: "station-affiliation", value: "21".repeat(64)
      })
    }],
    stateDigest: "22".repeat(32),
    endpointSignature: makeSignature({ keyId: "22".repeat(32), value: "23".repeat(64) })
  };
}

function makeRouteGenesis() {
  return {
    recordType: "routeUpdate",
    protocolLineId: DIGEST_A,
    endpointIdentityRef: DIGEST_B,
    peerEndpointIdentityRef: "24".repeat(32),
    routeEpoch: 1,
    transition: "genesis",
    affiliationStateDigest: "22".repeat(32),
    routeNotAfter: 2200,
    routes: [{
      stationDescriptorDigest: "18".repeat(32),
      affiliationCommitment: "19".repeat(32),
      transportProfileId: "25".repeat(32),
      handleClass: "async",
      deliveryHandle: "26".repeat(32),
      serviceUntil: 2100,
      stationServiceSignature: makeSignature({
        keyId: "33".repeat(32), purpose: "station-route-service", value: "27".repeat(64)
      })
    }],
    endpointSignature: makeSignature({ keyId: "22".repeat(32), value: "28".repeat(64) })
  };
}

function makeFirstContact() {
  return {
    recordType: "firstContact",
    handleClass: "firstContact",
    deliveryHandle: "29".repeat(32),
    audienceDigest: "30".repeat(32),
    invitationBinding: "31".repeat(32),
    purpose: "firstContact",
    singleUse: true,
    expiresAt: 1800,
    protectedInvitation: {
      inviterEndpointIdentityRef: DIGEST_B,
      inviteeEndpointIdentityRef: "24".repeat(32),
      invitationBinding: "31".repeat(32),
      purpose: "firstContact",
      audienceDigest: "30".repeat(32),
      handshakeNonce: "32".repeat(32)
    },
    peerVerificationState: "unverified"
  };
}

function makeDiscoveryInput() {
  return {
    recordType: "discoveryInput",
    inputId: "3".repeat(32),
    sourceKind: "directory",
    sourceRef: "34".repeat(32),
    subjectEndpointIdentityRef: DIGEST_B,
    chainKind: "identity",
    stateEpoch: 2,
    stateDigest: "12".repeat(32),
    statementDigest: "35".repeat(32),
    observedAt: 999999,
    expiresAt: 1000000,
    sourceSignature: makeSignature({
      keyId: "44".repeat(32), purpose: "discovery", value: "36".repeat(64)
    }),
    authenticatedInputOnly: true
  };
}

function makeTransparencyBundle() {
  return {
    recordType: "transparencyBundle",
    subjectEndpointIdentityRef: DIGEST_B,
    chainKind: "identity",
    stateEpoch: 2,
    stateDigest: "12".repeat(32),
    witnessInputs: [],
    gossipInputs: [],
    discoveryInputs: [],
    stationSignatureInputs: [],
    verificationInputs: [],
    authority: "bounded-authenticated-input-only",
    endpointRetainsContinuity: true,
    splitView: true
  };
}

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
