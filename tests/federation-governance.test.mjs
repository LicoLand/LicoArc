import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assertClosedJsonSchema,
  assertValidAgainstClosedSchema,
  canonicalizeRestrictedJson,
  parseRestrictedJson,
  validateClosedSchema
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const governanceRoot = path.join(repositoryRoot, "spec/v1/governance");
const schema = await readJson("spec/v1/governance/governance.schema.json");
const policy = await readJson("spec/v1/governance/governance.policy.json");
const registry = await readJson("spec/v1/governance/registry.json");
const sourceManifest = await readJson("spec/v1/governance/source-manifest.json");

const ROLE_ORDER = ["membership", "compatibility", "revocation", "distribution", "consistency", "recovery", "abuse"];
const DIGEST_ZERO = "0".repeat(64);
const DIGEST_A = "a".repeat(64);
const NETWORK_REF = "1".repeat(64);

test("governance source closure is explicit, sorted, and JCS-only", async () => {
  assert.deepEqual(sourceManifest.sourceRoots, ["conformance/v1/governance", "spec/v1/governance"]);
  assert.equal(sourceManifest.sorted, true);
  assert.equal(sourceManifest.undeclaredFiles, "reject");
  assert.equal(sourceManifest.symlinks, "reject");
  assert.deepEqual(sourceManifest.sources, [...sourceManifest.sources].sort());
  assert.equal(new Set(sourceManifest.sources).size, sourceManifest.sources.length);
  assert.ok(sourceManifest.sources.includes("conformance/v1/governance/manifest.json"));

  const actual = [];
  for (const root of sourceManifest.sourceRoots) await collectFiles(path.join(repositoryRoot, root), actual);
  actual.sort();
  assert.deepEqual(actual.filter((sourcePath) => sourcePath !== "spec/v1/governance/source-manifest.json"), sourceManifest.sources);
  assert.equal(registry.representation, "restricted-jcs");
  assert.equal(registry.sourceClosure.undeclaredFiles, "reject");
  assert.equal(policy.representation.encoding, "restricted-jcs");
  assert.equal(policy.distributionPolicy.publication, "out-of-scope");
});

test("governance schema is closed and the canonical base bundle validates", () => {
  assert.doesNotThrow(() => assertClosedJsonSchema(schema));
  const bundle = buildBundle();
  assert.deepEqual(validateClosedSchema(bundle, schema), []);
  assert.doesNotThrow(() => assertValidAgainstClosedSchema(bundle, schema));
  assert.notDeepEqual(validateClosedSchema({ ...bundle, unexpected: true }, schema), []);
  assert.equal(registry.unknownFieldPolicy, "reject-record");
  assert.equal(registry.unknownRolePolicy, "reject-record");
  assert.deepEqual(registry.requiredAuthorizationRoles, ROLE_ORDER);
});

test("restricted JCS canonicalization and role signature domains are deterministic", () => {
  const value = { z: 1, a: { y: true, x: "ok" }, array: [3, 2, 1] };
  const shuffled = { array: [3, 2, 1], a: { x: "ok", y: true }, z: 1 };
  assert.equal(canonicalizeRestrictedJson(value), canonicalizeRestrictedJson(shuffled));
  assert.equal(digest(value), digest(shuffled));
  assert.throws(() => parseRestrictedJson('{"x":1,"x":2}'), /duplicate/u);
  assert.throws(() => parseRestrictedJson('{"x":1} trailing'), /trailing/u);

  const bundle = buildBundle();
  for (const authorization of bundle.authorizations) {
    assert.equal(authorization.signedDigest, bundle.bundleDigest);
    for (const signature of authorization.signatures) {
      assert.equal(signature.role, authorization.role);
      assert.equal(signature.signedDigest, bundle.bundleDigest);
      assert.equal(signature.signatureScope, `licoarc.federation-governance.v1|${authorization.role}|${bundle.bundleDigest}`);
      assert.equal(signature.signatureValue, signatureDigest(signature));
    }
  }
});

test("complete governance bundles, rotation, and replay commit atomically", () => {
  const base = buildBundle();
  const initialState = emptyLocalState();
  const accepted = evaluate(base, initialState, 2000);
  assert.equal(accepted.outcome, "accept");
  assert.equal(accepted.rejectionClass, "none");
  assert.equal(accepted.nextState.bundleDigest, base.bundleDigest);
  assert.equal(accepted.nextState.bundleEpoch, base.bundleEpoch);
  assert.deepEqual(initialState, emptyLocalState());
  assert.doesNotThrow(() => assertValidAgainstClosedSchema(base, schema));

  const rotation = buildRotation(base.bundleDigest);
  const rotated = evaluate(rotation, installedLocalState(base), 2500);
  assert.equal(rotated.outcome, "accept");
  assert.equal(rotated.rejectionClass, "none");
  assert.equal(rotated.nextState.bundleDigest, rotation.bundleDigest);
  assert.equal(rotated.nextState.bundleEpoch, rotation.bundleEpoch);
  assert.doesNotThrow(() => assertValidAgainstClosedSchema(rotation, schema));

  const installed = installedLocalState(base);
  const replay = evaluate(base, installed, 2000);
  assert.equal(replay.outcome, "accept");
  assert.equal(replay.rejectionClass, "replay");
  assert.deepEqual(replay.nextState, installed);
});

test("invalid governance inputs fail closed without mutating local high-water state", () => {
  const base = buildBundle();
  const initial = emptyLocalState();

  const unknownRole = structuredClone(base);
  unknownRole.authorizations[0].role = "operator";
  assertRejectedWithoutMutation(unknownRole, initial, 2000, "unknown-role");

  const insufficientThreshold = structuredClone(base);
  insufficientThreshold.authorizations[0].signatures.length = 0;
  assertRejectedWithoutMutation(insufficientThreshold, initial, 2000, "insufficient-threshold");

  assertRejectedWithoutMutation(base, initial, base.distribution.timestamp.expiresAt, "expired");

  const inconsistentSnapshot = structuredClone(base);
  inconsistentSnapshot.distribution.timestamp.snapshotDigest = DIGEST_A;
  assertRejectedWithoutMutation(inconsistentSnapshot, initial, 2000, "inconsistent-snapshot");

  const equivocation = structuredClone(base);
  equivocation.consistency.observations[0].observedDigest = DIGEST_A;
  assertRejectedWithoutMutation(equivocation, initial, 2000, "equivocation");

  const splitView = structuredClone(base);
  splitView.consistency.splitView = true;
  assertRejectedWithoutMutation(splitView, initial, 2000, "split-view");

  const partialCommittee = structuredClone(base);
  partialCommittee.authorizations[0].signatures.length = 2;
  assertRejectedWithoutMutation(partialCommittee, initial, 2000, "partial-committee");

  const wrongSignatureScope = structuredClone(base);
  wrongSignatureScope.authorizations[0].signatures[0].signatureScope = `licoarc.federation-governance.v1|wrong|${base.bundleDigest}`;
  assertRejectedWithoutMutation(wrongSignatureScope, initial, 2000, "signature-scope");

  const stationAdmission = structuredClone(base);
  stationAdmission.endpointAdmission.authority = "station";
  assertRejectedWithoutMutation(stationAdmission, initial, 2000, "authority-boundary");

  const staleState = installedLocalState(base);
  staleState.bundleEpoch = 2;
  assertRejectedWithoutMutation(base, staleState, 2000, "stale");

  const replayConflict = structuredClone(base);
  replayConflict.bundleDigest = DIGEST_A;
  assertRejectedWithoutMutation(replayConflict, installedLocalState(base), 2000, "replay");

  const rotation = buildRotation(base.bundleDigest);
  rotation.recovery.previousBundleDigest = DIGEST_A;
  assertRejectedWithoutMutation(rotation, installedLocalState(base), 2500, "invalid-recovery");
});

test("role separation, distribution bindings, recovery, and local authority boundaries are explicit", () => {
  const bundle = buildBundle();
  const activeByRole = new Map();
  for (const root of bundle.rootSet) {
    if (root.status === "active") activeByRole.set(root.role, (activeByRole.get(root.role) ?? 0) + 1);
    assert.equal(root.keyThreshold >= 2, true);
    assert.equal(root.rootDigest, digest(without(root, "rootDigest")));
  }
  for (const role of ROLE_ORDER) assert.equal(activeByRole.get(role), 2, role);
  assert.equal(bundle.distribution.targets.targetDigest, bundle.distribution.targets.ociDescriptor.digest);
  assert.equal(bundle.distribution.targets.dsse.payloadDigest, bundle.distribution.targets.targetDigest);
  assert.equal(bundle.distribution.snapshot.targetsDigest, bundle.distribution.targets.metadataDigest);
  assert.equal(bundle.distribution.timestamp.snapshotDigest, bundle.distribution.snapshot.metadataDigest);
  assert.equal(bundle.endpointAdmission.authority, "endpoint-local");
  assert.equal(bundle.endpointAdmission.automaticAdmission, false);
  assert.equal(bundle.abusePolicy.advisoryOnly, true);
  assert.equal(bundle.abusePolicy.membershipEffect, "none");
  assert.equal(bundle.abusePolicy.endpointAdmissionEffect, "local-only");
  assert.equal(policy.rootPolicy.rotation.oldRootMayAuthorizeReplacement, false);
  assert.equal(policy.endpointAdmission.authority, "endpoint-local");
  assert.ok(policy.outOfScope.includes("credentials"));
  assert.ok(policy.outOfScope.includes("signing-services"));
});

function buildBundle() {
  const rootSet = [];
  for (let roleIndex = 0; roleIndex < ROLE_ORDER.length; roleIndex += 1) {
    const role = ROLE_ORDER[roleIndex];
    rootSet.push(makeRoot(role, 10 + roleIndex * 2));
    rootSet.push(makeRoot(role, 11 + roleIndex * 2));
  }
  return finalizeBundle({
    recordType: "governanceBundle",
    governanceVersion: "licoarc.federation-governance.v1",
    lifecycle: "Candidate",
    networkRef: NETWORK_REF,
    bundleEpoch: 1,
    bundleDigest: DIGEST_ZERO,
    rootSet,
    membershipStatements: [statementForMembership(1)],
    compatibilityCertifications: [statementForCertification(2)],
    revocations: [statementForRevocation(3)],
    distribution: distributionFor(rootSet),
    consistency: consistencyFor(),
    endpointAdmission: endpointAdmissionPolicy(),
    abusePolicy: abusePolicyFor(),
    recovery: recoveryFor(),
    authorizations: []
  });
}

function buildRotation(previousBundleDigest) {
  const bundle = buildBundle();
  const oldRoot = bundle.rootSet.find((root) => root.role === "membership");
  oldRoot.status = "retired";
  oldRoot.rootDigest = digest(without(oldRoot, "rootDigest"));
  const replacement = makeRoot("membership", 99, "active", 2, oldRoot.rootDigest);
  bundle.rootSet.push(replacement);
  bundle.bundleEpoch = 2;
  bundle.recovery = recoveryFor({
    recoveryEpoch: 2,
    event: "root-rotation",
    previousBundleDigest,
    replacedRootIds: [oldRoot.rootId],
    replacementRootIds: [replacement.rootId],
    evidenceDigests: [digest({ oldRootId: oldRoot.rootId, newRootId: replacement.rootId, predecessor: oldRoot.rootDigest })]
  });
  bundle.distribution = distributionFor(bundle.rootSet);
  bundle.consistency = consistencyFor();
  return finalizeBundle(bundle);
}

function finalizeBundle(bundle) {
  for (const root of bundle.rootSet) {
    root.rootDigest = digest(without(root, "rootDigest"));
  }
  bundle.distribution = distributionFor(bundle.rootSet);
  bundle.consistency = consistencyFor(bundle.distribution);
  for (const item of bundle.membershipStatements) item.metadataDigest = digest(without(item, "metadataDigest"));
  for (const item of bundle.compatibilityCertifications) item.metadataDigest = digest(without(item, "metadataDigest"));
  for (const item of bundle.revocations) item.metadataDigest = digest(without(item, "metadataDigest"));
  bundle.recovery.recoveryDigest = digest(without(bundle.recovery, "recoveryDigest"));
  bundle.bundleDigest = digest(signedMetadata(bundle));
  bundle.authorizations = ROLE_ORDER.map((role) => authorizationFor(bundle, role));
  return bundle;
}

function makeRoot(role, seed, status = "active", rootVersion = 1, predecessorRootDigest = null) {
  const keys = [1, 2].map((offset) => ({
    keyId: idTag(seed * 2 + offset),
    keyDigest: digestTag(seed * 2 + offset + 100),
    status: "active"
  }));
  const root = {
    rootId: idTag(seed),
    role,
    rootVersion,
    status,
    keyThreshold: 2,
    keys,
    validFrom: rootVersion === 1 ? 0 : 2000,
    validUntil: 9000,
    rootDigest: DIGEST_ZERO,
    predecessorRootDigest
  };
  root.rootDigest = digest(without(root, "rootDigest"));
  return root;
}

function authorizationFor(bundle, role) {
  const activeRoots = bundle.rootSet.filter((root) => root.role === role && root.status === "active").sort((left, right) => left.rootId.localeCompare(right.rootId));
  const signatures = activeRoots.flatMap((root) => root.keys.filter((key) => key.status === "active").slice(0, 2).map((key) => {
    const signature = {
      rootId: root.rootId,
      keyId: key.keyId,
      role,
      signatureScope: `licoarc.federation-governance.v1|${role}|${bundle.bundleDigest}`,
      signedDigest: bundle.bundleDigest,
      signatureValue: DIGEST_ZERO
    };
    signature.signatureValue = signatureDigest(signature);
    return signature;
  }));
  return {
    role,
    threshold: 2,
    authorizedRootIds: activeRoots.map(({ rootId }) => rootId),
    signedDigest: bundle.bundleDigest,
    signatures
  };
}

function statementForMembership(seed) {
  const statement = {
    subjectRef: digestTag(seed),
    membershipEpoch: 1,
    state: "active",
    metadataDigest: DIGEST_ZERO,
    validFrom: 1000,
    notAfter: 5000
  };
  statement.metadataDigest = digest(without(statement, "metadataDigest"));
  return statement;
}

function statementForCertification(seed) {
  const statement = {
    subjectRef: digestTag(seed + 10),
    protocolLineId: digestTag(seed + 19),
    capabilityDigests: [digestTag(seed + 20), digestTag(seed + 21)],
    certificationEpoch: 1,
    validFrom: 1000,
    notAfter: 5000,
    metadataDigest: DIGEST_ZERO
  };
  statement.metadataDigest = digest(without(statement, "metadataDigest"));
  return statement;
}

function statementForRevocation(seed) {
  const statement = {
    targetKind: "key",
    targetDigest: digestTag(seed + 30),
    reasonCode: "expiry",
    effectiveAt: 4000,
    revocationEpoch: 1,
    metadataDigest: DIGEST_ZERO
  };
  statement.metadataDigest = digest(without(statement, "metadataDigest"));
  return statement;
}

function distributionFor(rootSet) {
  const rootDigests = rootSet.map(({ rootDigest }) => rootDigest).sort();
  const root = { version: 1, metadataDigest: digest({ version: 1, rootDigests }) };
  const targetPath = "protocol/v1/licoarc.bundle.json";
  const targetDigest = digest({ targetPath, mediaType: "application/vnd.oci.image.manifest.v1+json", size: 4096 });
  const ociDescriptor = { mediaType: "application/vnd.oci.image.manifest.v1+json", digest: targetDigest, size: 4096 };
  const dsse = {
    payloadType: "application/vnd.oci.image.manifest.v1+json",
    payloadDigest: targetDigest,
    envelopeDigest: DIGEST_ZERO,
    signingDigest: targetDigest
  };
  dsse.envelopeDigest = digest(without(dsse, "envelopeDigest"));
  const targets = {
    version: 1,
    metadataDigest: DIGEST_ZERO,
    targetPath,
    targetDigest,
    ociDescriptor,
    dsse
  };
  targets.metadataDigest = digest(without(targets, "metadataDigest"));
  const snapshot = {
    version: 1,
    metadataDigest: DIGEST_ZERO,
    rootVersion: root.version,
    targetsVersion: targets.version,
    targetsDigest: targets.metadataDigest
  };
  snapshot.metadataDigest = digest(without(snapshot, "metadataDigest"));
  const timestamp = {
    version: 1,
    metadataDigest: DIGEST_ZERO,
    snapshotVersion: snapshot.version,
    snapshotDigest: snapshot.metadataDigest,
    expiresAt: 3000
  };
  timestamp.metadataDigest = digest(without(timestamp, "metadataDigest"));
  return {
    root,
    targets,
    snapshot,
    timestamp,
    rollback: {
      minimumRootVersion: 1,
      minimumTargetsVersion: 1,
      minimumSnapshotVersion: 1,
      minimumTimestampVersion: 1,
      consistentSnapshot: true
    }
  };
}

function consistencyFor(distribution = null) {
  const snapshotDigest = distribution?.snapshot?.metadataDigest ?? DIGEST_ZERO;
  const snapshotVersion = distribution?.snapshot?.version ?? 1;
  const observations = [1, 2].map((seed) => ({
    observerRef: digestTag(150 + seed),
    observedVersion: snapshotVersion,
    observedDigest: snapshotDigest,
    statementDigest: digest({ observerRef: digestTag(150 + seed), observedVersion: snapshotVersion, observedDigest: snapshotDigest })
  }));
  const consistency = {
    consistencyEpoch: 1,
    rootVersion: 1,
    snapshotVersion,
    snapshotDigest,
    observations,
    splitView: false,
    evidenceDigest: DIGEST_ZERO
  };
  consistency.evidenceDigest = digest(without(consistency, "evidenceDigest"));
  return consistency;
}

function endpointAdmissionPolicy() {
  return {
    authority: "endpoint-local",
    automaticAdmission: false,
    membershipInput: "membership-statements-only",
    certificationInput: "compatibility-certifications-only",
    revocationInput: "revocations-only",
    abuseInput: "advisory-only",
    stationAuthority: "none",
    networkHostAuthority: "none",
    artifactServiceAuthority: "none"
  };
}

function abusePolicyFor() {
  const advisory = {
    advisoryRef: digestTag(180),
    scopeRef: digestTag(181),
    category: "review",
    expiresAt: 2500,
    evidenceDigest: DIGEST_ZERO
  };
  advisory.evidenceDigest = digest(without(advisory, "evidenceDigest"));
  return {
    authority: "local-operator-policy",
    advisoryOnly: true,
    advisories: [advisory],
    protectedEvidence: "never-included",
    membershipEffect: "none",
    compatibilityEffect: "none",
    endpointAdmissionEffect: "local-only"
  };
}

function recoveryFor(overrides = {}) {
  return {
    recoveryEpoch: overrides.recoveryEpoch ?? 1,
    event: overrides.event ?? "none",
    previousBundleDigest: overrides.previousBundleDigest ?? null,
    replacedRootIds: overrides.replacedRootIds ?? [],
    replacementRootIds: overrides.replacementRootIds ?? [],
    evidenceDigests: overrides.evidenceDigests ?? [],
    recoveryDigest: DIGEST_ZERO
  };
}

function evaluate(bundle, state, now) {
  const before = structuredClone(state);
  const reject = (rejectionClass) => ({ outcome: "reject", rejectionClass, nextState: before });

  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) return reject("instance-type");
  if (bundle.endpointAdmission?.authority !== "endpoint-local" || bundle.endpointAdmission?.automaticAdmission !== false) return reject("authority-boundary");
  if (bundle.abusePolicy?.advisoryOnly !== true || bundle.abusePolicy?.membershipEffect !== "none" || bundle.abusePolicy?.endpointAdmissionEffect !== "local-only") return reject("authority-boundary");
  if (bundle.consistency?.splitView === true) return reject("split-view");
  if (bundle.consistency?.observations?.some(({ observedDigest }) => observedDigest !== bundle.consistency.snapshotDigest)) return reject("equivocation");
  if (bundle.distribution?.timestamp?.snapshotDigest !== bundle.distribution?.snapshot?.metadataDigest || bundle.distribution?.snapshot?.targetsDigest !== bundle.distribution?.targets?.metadataDigest) return reject("inconsistent-snapshot");
  if (bundle.distribution?.timestamp?.version !== undefined && bundle.distribution.timestamp.version < 1) return reject("rollback");
  if (bundle.distribution?.timestamp?.expiresAt !== undefined && now >= bundle.distribution.timestamp.expiresAt) return reject("expired");
  if (bundle.bundleEpoch !== undefined && bundle.bundleEpoch < state.bundleEpoch) return reject("stale");
  if (bundle.bundleEpoch !== undefined && bundle.bundleEpoch === state.bundleEpoch && state.bundleDigest !== null && bundle.bundleDigest !== state.bundleDigest) return reject("replay");
  if (bundle.bundleEpoch !== undefined && bundle.bundleEpoch === state.bundleEpoch && state.bundleDigest !== null && bundle.bundleDigest === state.bundleDigest && bundle.bundleDigest !== digest(signedMetadata(bundle))) return reject("replay");
  if (bundle.rootSet?.some((root) => root.status === "compromised") && bundle.recovery?.event !== "compromise-recovery") return reject("compromised-root");
  if (bundle.recovery?.event === "none" && (bundle.recovery.previousBundleDigest !== null || bundle.recovery.replacedRootIds.length > 0 || bundle.recovery.replacementRootIds.length > 0 || bundle.recovery.evidenceDigests.length > 0)) return reject("invalid-rotation");
  if (bundle.recovery?.event === "root-rotation" && (!bundle.recovery.previousBundleDigest || bundle.recovery.replacedRootIds.length === 0 || bundle.recovery.replacementRootIds.length === 0)) return reject("invalid-rotation");
  if (bundle.recovery?.event === "root-rotation" && bundle.recovery.previousBundleDigest !== state.bundleDigest) return reject("invalid-recovery");
  if (bundle.recovery?.event === "compromise-recovery" && bundle.recovery.previousBundleDigest !== state.bundleDigest) return reject("invalid-recovery");
  if (bundle.authorizations?.some((authorization) => !ROLE_ORDER.includes(authorization.role))) return reject("unknown-role");
  if (bundle.authorizations?.some((authorization) => authorization.signatures?.length < 4)) {
    const short = bundle.authorizations.find((authorization) => authorization.signatures?.length < 4);
    return reject(short?.signatures?.length === 2 ? "partial-committee" : "insufficient-threshold");
  }
  if (bundle.authorizations?.some((authorization) => authorization.signatures?.some((signature) => signature.signedDigest !== bundle.bundleDigest || signature.signatureScope !== `licoarc.federation-governance.v1|${authorization.role}|${bundle.bundleDigest}`))) return reject("signature-scope");

  const schemaErrors = validateClosedSchema(bundle, schema);
  if (schemaErrors.length > 0) return reject("required-field");
  if (bundle.bundleDigest !== digest(signedMetadata(bundle))) return reject("canonical-digest-mismatch");
  if (bundle.recovery.recoveryDigest !== digest(without(bundle.recovery, "recoveryDigest"))) return reject("invalid-recovery");
  if (!validateRoots(bundle.rootSet)) return reject("compromised-root");
  if (!validateDistribution(bundle.distribution, bundle.rootSet, now)) return reject("inconsistent-snapshot");
  if (!validateConsistency(bundle.consistency, bundle.distribution)) return reject("equivocation");
  if (!validateAuthorizations(bundle)) return reject("insufficient-threshold");

  if (bundle.bundleEpoch === state.bundleEpoch && state.bundleDigest === bundle.bundleDigest) return { outcome: "accept", rejectionClass: "replay", nextState: before };
  if (bundle.bundleEpoch !== state.bundleEpoch + 1 && state.bundleEpoch !== 0) return reject("stale");
  const nextState = {
    networkRef: bundle.networkRef,
    bundleEpoch: bundle.bundleEpoch,
    bundleDigest: bundle.bundleDigest,
    roleVersions: Object.fromEntries(ROLE_ORDER.map((role) => [role, Math.max(...bundle.rootSet.filter((root) => root.role === role).map((root) => root.rootVersion))]))
  };
  return { outcome: "accept", rejectionClass: "none", nextState };
}

function validateRoots(rootSet) {
  const rootsByRole = new Map(ROLE_ORDER.map((role) => [role, []]));
  for (const root of rootSet) {
    if (!rootsByRole.has(root.role) || root.keyThreshold < 2 || root.keys.filter((key) => key.status === "active").length < root.keyThreshold) return false;
    if (root.status === "active" && root.predecessorRootDigest !== null && root.rootVersion === 1) return false;
    if (root.rootDigest !== digest(without(root, "rootDigest"))) return false;
    rootsByRole.get(root.role).push(root);
  }
  return ROLE_ORDER.every((role) => rootsByRole.get(role).filter((root) => root.status === "active").length >= 2);
}

function validateDistribution(distribution, rootSet, now) {
  if (!distribution.rollback.consistentSnapshot) return false;
  if (now >= distribution.timestamp.expiresAt) return false;
  if (distribution.targets.targetDigest !== distribution.targets.ociDescriptor.digest) return false;
  if (distribution.targets.dsse.payloadDigest !== distribution.targets.targetDigest || distribution.targets.dsse.signingDigest !== distribution.targets.targetDigest) return false;
  if (distribution.targets.dsse.envelopeDigest !== digest(without(distribution.targets.dsse, "envelopeDigest"))) return false;
  if (distribution.targets.metadataDigest !== digest(without(distribution.targets, "metadataDigest"))) return false;
  if (distribution.snapshot.targetsVersion !== distribution.targets.version || distribution.snapshot.targetsDigest !== distribution.targets.metadataDigest) return false;
  if (distribution.snapshot.metadataDigest !== digest(without(distribution.snapshot, "metadataDigest"))) return false;
  if (distribution.timestamp.snapshotVersion !== distribution.snapshot.version || distribution.timestamp.snapshotDigest !== distribution.snapshot.metadataDigest) return false;
  if (distribution.timestamp.metadataDigest !== digest(without(distribution.timestamp, "metadataDigest"))) return false;
  const rootDigest = digest({ version: distribution.root.version, rootDigests: rootSet.map(({ rootDigest }) => rootDigest).sort() });
  return distribution.root.metadataDigest === rootDigest;
}

function validateConsistency(consistency, distribution) {
  if (consistency.snapshotDigest !== distribution.snapshot.metadataDigest || consistency.snapshotVersion !== distribution.snapshot.version) return false;
  if (consistency.observations.length < 2) return false;
  return consistency.observations.every(({ observedVersion, observedDigest }) => observedVersion === consistency.snapshotVersion && observedDigest === consistency.snapshotDigest);
}

function validateAuthorizations(bundle) {
  const seenRoles = new Set();
  const rootById = new Map(bundle.rootSet.map((root) => [root.rootId, root]));
  for (const authorization of bundle.authorizations) {
    if (seenRoles.has(authorization.role) || authorization.threshold !== 2) return false;
    seenRoles.add(authorization.role);
    const expectedRootIds = bundle.rootSet.filter((root) => root.role === authorization.role && root.status === "active").map(({ rootId }) => rootId).sort();
    if (JSON.stringify(expectedRootIds) !== JSON.stringify([...authorization.authorizedRootIds].sort())) return false;
    const perRoot = new Map();
    const signerIds = new Set();
    for (const signature of authorization.signatures) {
      const root = rootById.get(signature.rootId);
      if (!root || root.status !== "active" || root.role !== authorization.role || !authorization.authorizedRootIds.includes(signature.rootId)) return false;
      const key = root.keys.find((candidate) => candidate.keyId === signature.keyId);
      if (!key || key.status !== "active") return false;
      const pair = `${signature.rootId}:${signature.keyId}`;
      if (signerIds.has(pair)) return false;
      signerIds.add(pair);
      perRoot.set(signature.rootId, (perRoot.get(signature.rootId) ?? 0) + 1);
      if (signature.signatureValue !== signatureDigest(signature)) return false;
    }
    if (perRoot.size < authorization.threshold) return false;
    for (const rootId of authorization.authorizedRootIds) if ((perRoot.get(rootId) ?? 0) < rootById.get(rootId).keyThreshold) return false;
  }
  return seenRoles.size === ROLE_ORDER.length;
}

function signedMetadata(bundle) {
  return without(without(bundle, "bundleDigest"), "authorizations");
}

function signatureDigest(signature) {
  return digest({ rootId: signature.rootId, keyId: signature.keyId, role: signature.role, signatureScope: signature.signatureScope, signedDigest: signature.signedDigest });
}

function emptyLocalState() {
  return { networkRef: NETWORK_REF, bundleEpoch: 0, bundleDigest: null, roleVersions: {} };
}

function installedLocalState(bundle) {
  return {
    networkRef: bundle.networkRef,
    bundleEpoch: bundle.bundleEpoch,
    bundleDigest: bundle.bundleDigest,
    roleVersions: Object.fromEntries(ROLE_ORDER.map((role) => [role, 1]))
  };
}

function assertRejectedWithoutMutation(bundle, state, now, rejectionClass) {
  const before = structuredClone(state);
  const result = evaluate(bundle, state, now);
  assert.equal(result.outcome, "reject");
  assert.equal(result.rejectionClass, rejectionClass);
  assert.deepEqual(result.nextState, before);
  assert.deepEqual(state, before);
}

function without(value, key) {
  const clone = structuredClone(value);
  delete clone[key];
  return clone;
}

function digest(value) {
  return createHash("sha256").update(canonicalizeRestrictedJson(value)).digest("hex");
}

function digestTag(seed) {
  return seed.toString(16).padStart(2, "0").slice(-2).repeat(32);
}

function idTag(seed) {
  return seed.toString(16).padStart(2, "0").slice(-2).repeat(16);
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

async function collectFiles(directory, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(repositoryRoot, absolute).split(path.sep).join("/");
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`symlink in governance source closure: ${relative}`);
    if (entry.isDirectory()) await collectFiles(absolute, output);
    else if (entry.isFile()) output.push(relative);
    else throw new Error(`non-regular governance source: ${relative}`);
  }
}
