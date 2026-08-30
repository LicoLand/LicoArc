import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  assertCompleteProtocolLineAdmission,
  assertValidSecurityAccounting,
  computeProtectionProfileId,
  computeProtocolLineId,
  protectionProfileSemanticProjection,
  protocolLineSemanticProjection
} from "../tools/protocol/index.mjs";
import {
  CONFORMANCE_OPERATION_IDS,
  preflightConformanceCases,
  runConformanceCases
} from "../tools/conformance/index.mjs";

const root = resolve(import.meta.dirname, "..");
const readJson = (sourcePath) => readFile(resolve(root, sourcePath), "utf8").then(JSON.parse);

test("complete admission is generic, content-bound, proof-bound, and publication-independent", () => {
  const fixture = completeAdmissionFixture();
  assert.equal(assertCompleteProtocolLineAdmission(fixture), true);

  const incompleteCapability = structuredClone(fixture);
  incompleteCapability.manifest.capabilities[0].definitionStatus = "PARTIAL";
  assert.throws(() => assertCompleteProtocolLineAdmission(incompleteCapability),
    errorWithCode("mandatory-capability-incomplete"));

  const unproved = structuredClone(fixture);
  unproved.securitySummary.complete = false;
  assert.throws(() => assertCompleteProtocolLineAdmission(unproved),
    errorWithCode("security-accounting-incomplete"));

  const missingCorpus = structuredClone(fixture);
  missingCorpus.conformance.capabilityCorpora =
    missingCorpus.conformance.capabilityCorpora.slice(1);
  assert.throws(() => assertCompleteProtocolLineAdmission(missingCorpus),
    errorWithCode("capability-corpus-set-mismatch"));

  const circularOrWrongProfile = structuredClone(fixture);
  circularOrWrongProfile.protectionProfiles.profiles[0].profileId = "f".repeat(64);
  assert.throws(() => assertCompleteProtocolLineAdmission(circularOrWrongProfile),
    errorWithCode("active-profile-incomplete"));
});

test("Profile and Protocol Line identities use named non-circular semantic projections", () => {
  const fixture = completeAdmissionFixture();
  const profileInput = fixture.profileIdentityInputs.get("stable-core");
  const profileProjection = protectionProfileSemanticProjection(profileInput);
  const lineProjection = protocolLineSemanticProjection({
    ...fixture.lineIdentityInput,
    generation: fixture.line.generation,
    mandatoryCapabilitySemanticIdentities: fixture.line.mandatoryCapabilities
      .map((capabilityId) => fixture.manifest.capabilities
        .find((capability) => capability.capabilityId === capabilityId).semanticIdentity),
    protectionProfileIds: fixture.line.protectionProfileIds,
    stableClaimIds: fixture.line.stableClaimIds,
    selectionRules: fixture.protocolLines.selection
  });

  assert.equal(profileProjection[0], "ProtectionProfileSemanticProjectionV1");
  assert.equal(lineProjection[0], "ProtocolLineSemanticProjectionV1");
  assert.doesNotMatch(JSON.stringify(profileProjection), new RegExp(fixture.line.protectionProfileIds[0], "u"));
  assert.doesNotMatch(JSON.stringify(lineProjection), new RegExp(fixture.line.protocolLineId, "u"));

  const profileWithExcludedMetadata = structuredClone(profileInput);
  profileWithExcludedMetadata.profile.contentIdentity = "e".repeat(64);
  profileWithExcludedMetadata.profile.lifecycle = "Published";
  profileWithExcludedMetadata.profile.proofResult = "external-tool-output";
  assert.equal(computeProtectionProfileId(profileWithExcludedMetadata),
    fixture.line.protectionProfileIds[0]);

  const lineWithExcludedMetadata = {
    ...fixture.lineIdentityInput,
    protocolLineId: "e".repeat(64),
    wireId: "source-locator-only",
    lifecycle: "Published",
    proofResult: "external-tool-output",
    generation: fixture.line.generation,
    mandatoryCapabilitySemanticIdentities: fixture.line.mandatoryCapabilities
      .map((capabilityId) => fixture.manifest.capabilities
        .find((capability) => capability.capabilityId === capabilityId).semanticIdentity),
    protectionProfileIds: fixture.line.protectionProfileIds,
    stableClaimIds: fixture.line.stableClaimIds,
    selectionRules: fixture.protocolLines.selection
  };
  assert.equal(computeProtocolLineId(lineWithExcludedMetadata), fixture.line.protocolLineId);

  const changedSemantics = structuredClone(profileInput);
  changedSemantics.semanticSources.algorithms = { suite: "changed" };
  assert.notEqual(computeProtectionProfileId(changedSemantics), fixture.line.protectionProfileIds[0]);
});

test("cross-capability maxima are exact, positive, and fit their declared enclosing records", async () => {
  const [protection, messaging, reliable, transport, group, evidence, identityProfiles] =
    await Promise.all([
      "spec/v1/protection/bounds.json",
      "spec/v1/messaging/bounds.json",
      "spec/v1/reliable/bounds.json",
      "spec/v1/transport/bounds.json",
      "spec/v1/group/bounds.json",
      "spec/v1/evidence/bounds.json",
      "spec/v1/identity/signature-profiles.json"
    ].map(readJson));

  for (const source of [protection, messaging, reliable, transport, group, evidence]) {
    for (const [name, value] of Object.entries(source.bounds)) {
      assert.ok(typeof value === "number" && Number.isSafeInteger(value) && value > 0,
        `${source.registryVersion}.${name}`);
    }
  }

  assert.equal(protection.bounds.MAX_PROTECTED_PACKET_BYTES,
    reliable.bounds.MAX_PROTECTED_PACKET_BYTES);
  assert.equal(protection.bounds.MAX_PROTECTED_PACKET_BYTES, transport.bounds.MAX_PACKET_BYTES);
  assert.ok(messaging.bounds.MAX_MESSAGE_RECORD_BYTES <= protection.bounds.MAX_PLAINTEXT_BYTES);
  assert.ok(reliable.bounds.MAX_PROTECTED_INTENT_BYTES <= protection.bounds.MAX_PLAINTEXT_BYTES);
  assert.equal(reliable.bounds.MAX_RELIABLE_SNAPSHOT_BYTES,
    reliable.bounds.MAX_PROTECTED_PACKET_BYTES + reliable.bounds.MAX_RELIABLE_SNAPSHOT_METADATA_BYTES);
  assert.ok(group.bounds.MAX_GROUP_AGGREGATE_BYTES <= reliable.bounds.MAX_RELIABLE_EVENT_METADATA_BYTES);
  assert.equal(group.bounds.MAX_GROUP_PROJECTIONS, reliable.bounds.MAX_GROUP_PROJECTIONS);
  assert.equal(group.bounds.MAX_GROUP_PAYLOAD_BYTES, messaging.bounds.MAX_PAYLOAD_BYTES);

  const signatureProfiles = new Map(identityProfiles.profiles.map((profile) => [profile.name, profile]));
  assert.equal(evidence.bounds.ED25519_PUBLIC_KEY_BYTES,
    signatureProfiles.get("Ed25519").semanticDefinition.publicKeyBytes);
  assert.equal(evidence.bounds.ED25519_SIGNATURE_BYTES,
    signatureProfiles.get("Ed25519").semanticDefinition.signatureBytes);
  assert.equal(evidence.bounds.ML_DSA_65_PUBLIC_KEY_BYTES,
    signatureProfiles.get("ML-DSA-65").semanticDefinition.publicKeyBytes);
  assert.equal(evidence.bounds.ML_DSA_65_SIGNATURE_BYTES,
    signatureProfiles.get("ML-DSA-65").semanticDefinition.signatureBytes);
  assert.equal(evidence.bounds.MAX_EVIDENCE_CHECKPOINT_BYTES,
    evidence.canonicalMaxima.checkpointBytes);
  assert.equal(evidence.bounds.MAX_EVIDENCE_IDENTITY_BUNDLE_BYTES,
    evidence.canonicalMaxima.identityBundleBytes);
  assert.equal(evidence.bounds.MAX_EVIDENCE_VERIFICATION_PACKAGE_BYTES,
    evidence.canonicalMaxima.verificationPackageBytes);
});

test("formal binding validation remains source-authoritative and lifecycle-generic", async () => {
  const [claims, adversaries, bindings, registry, schemaEntries] = await Promise.all([
    readJson("spec/v1/security/claims.json"),
    readJson("spec/v1/security/adversary-model.json"),
    readJson("spec/v1/security/formal-bindings.json"),
    readJson("spec/v1/security/registry.json"),
    Promise.all([
      ["claims", "spec/schemas/security-claims.schema.json"],
      ["adversaries", "spec/schemas/security-adversary-model.schema.json"],
      ["bindings", "spec/schemas/security-formal-bindings.schema.json"],
      ["registry", "spec/schemas/security-registry.schema.json"]
    ].map(async ([name, sourcePath]) => [name, await readJson(sourcePath)]))
  ]);
  const schemas = Object.fromEntries(schemaEntries);
  const summary = assertValidSecurityAccounting({ claims, adversaries, bindings, registry, schemas });
  assert.equal(summary.complete, registry.definitionStatus === "COMPLETE");
  assert.equal(bindings.status === "complete", registry.definitionStatus === "COMPLETE");
  assert.equal(new Set(bindings.requiredKinds).size, bindings.requiredKinds.length);

  const bindingsByClaim = Map.groupBy(bindings.bindings, (binding) => binding.claimId);
  for (const claim of claims.claims) {
    const claimBindings = bindingsByClaim.get(claim.id) ?? [];
    if (claim.status === "proved") {
      assert.deepEqual(new Set(claimBindings.map((binding) => binding.kind)),
        new Set(bindings.requiredKinds), claim.id);
      assert.ok(claimBindings.every((binding) =>
        binding.proofModel === claim.proofModel && binding.proofLemma === claim.proofLemma), claim.id);
    } else {
      assert.equal(claimBindings.length, 0, claim.id);
    }
  }

  const wrongAuthority = structuredClone({ claims, adversaries, bindings, registry, schemas });
  if (wrongAuthority.bindings.bindings.length === 0) {
    wrongAuthority.bindings.bindings.push({
      bindingId: "BIND-SYNTHETIC-WRONG-AUTHORITY",
      claimId: claims.claims[0].id,
      kind: bindings.requiredKinds[0],
      proofModel: "model",
      proofLemma: "lemma",
      authorityPath: "downstream/provider-result.json",
      authorityPointer: "/result",
      authorityDigest: "0".repeat(64)
    });
  } else {
    wrongAuthority.bindings.bindings[0].authorityPath = "downstream/provider-result.json";
  }
  assert.throws(() => assertValidSecurityAccounting(wrongAuthority),
    errorWithCode("reject-wrong-authority"));
});

test("generic conformance execution ignores reporting IDs and expected values until comparison", async () => {
  assert.ok(CONFORMANCE_OPERATION_IDS.includes("licoarc.foundation.encode-deterministic-cbor.v1"));
  const cases = [
    publicCase({ id: "generic.case-a", value: [1, 2], expectedHex: "820102" }),
    publicCase({ id: "generic.case-b", value: [3], expectedHex: "8103" })
  ];
  assert.equal(preflightConformanceCases(cases).length, 2);

  const first = await runConformanceCases(cases, { seed: "focused-seed-a" });
  const second = await runConformanceCases(cases, { seed: "focused-seed-b" });
  assert.equal(first.status, "passed");
  assert.equal(second.status, "passed");
  assert.notEqual(first.primarySeedDigest, second.primarySeedDigest);
  assert.deepEqual(resultMap(first), resultMap(second));

  const renamed = structuredClone(cases[0]);
  renamed.id = "reporting-id-only";
  const renamedResult = await runConformanceCases([renamed]);
  assert.deepEqual(renamedResult.results[0].actual, first.results[0].actual);

  const wrongExpected = structuredClone(cases[0]);
  wrongExpected.expected.result.hex = "00";
  const comparison = await runConformanceCases([wrongExpected]);
  assert.equal(comparison.status, "failed");
  assert.deepEqual(comparison.results[0].actual, first.results[0].actual);

  const privateMaterial = structuredClone(cases[0]);
  privateMaterial.input.privateKeyHex = "00";
  assert.throws(() => preflightConformanceCases([privateMaterial]),
    errorWithCode("private-key-material-forbidden"));
  const oracleAlias = structuredClone(cases[0]);
  oracleAlias.input.caseId = "dispatch-me";
  assert.throws(() => preflightConformanceCases([oracleAlias]),
    errorWithCode("implicit-case-alias-forbidden"));
});

function completeAdmissionFixture() {
  const stableClaimIds = ["SEC-A"];
  const profileIdentityInput = {
    profile: {
      profileSemanticVersion: "synthetic.complete-profile.v1",
      indivisible: true,
      componentNegotiation: false,
      fallback: "forbidden",
      semanticSources: { algorithms: "semantic-locator-only" }
    },
    semanticSources: { algorithms: { suite: "synthetic-public-semantics" } },
    stableClaimIds,
    stableNonClaimIds: ["NONCLAIM-A"]
  };
  const profileId = computeProtectionProfileId(profileIdentityInput);
  const mandatoryCapabilities = ["capability.alpha", "licoarc.pairwise-protection.v1"];
  const capabilityIdentities = ["1".repeat(64), "2".repeat(64)];
  const selection = {
    choice: "unique-highest-common-generation",
    fallback: "forbidden"
  };
  const lineIdentityInput = {
    sessionRules: {
      newSession: "authenticated-complete-only",
      publication: "separate"
    }
  };
  const protocolLineId = computeProtocolLineId({
    ...lineIdentityInput,
    generation: 1,
    mandatoryCapabilitySemanticIdentities: capabilityIdentities,
    protectionProfileIds: [profileId],
    stableClaimIds,
    selectionRules: selection
  });
  const line = {
    wireId: "synthetic.protocol-line.v1",
    generation: 1,
    protocolLineId,
    definitionStatus: "COMPLETE",
    sessionEligible: true,
    publicationEligible: false,
    mandatoryCapabilities,
    definedCapabilities: mandatoryCapabilities,
    protectionProfileIds: [profileId],
    stableClaimIds,
    blockers: []
  };
  const capabilities = mandatoryCapabilities.map((capabilityId, index) => ({
    capabilityId,
    definitionStatus: "COMPLETE",
    semanticIdentity: capabilityIdentities[index],
    sourceDigest: String(index + 3).repeat(64)
  }));
  const capabilityCorpora = mandatoryCapabilities.map((capabilityId, index) => ({
    capabilityId,
    definitionStatus: "COMPLETE",
    complete: true,
    sourceDigest: String(index + 5).repeat(64),
    protectionProfileIds: capabilityId === "licoarc.pairwise-protection.v1" ? [profileId] : []
  }));
  return {
    line,
    protocolLines: { selection },
    protectionProfiles: {
      activeProfileIds: [profileId],
      profiles: [{
        profileLocator: "stable-core",
        profileId,
        definitionStatus: "COMPLETE",
        sessionEligible: true,
        publicationEligible: false,
        blockers: [],
        requiredClaimIds: stableClaimIds
      }]
    },
    manifest: {
      definitionStatus: "COMPLETE",
      sessionEligible: true,
      publicationEligible: false,
      blockers: [],
      openDefinitions: [],
      missingMandatoryCapabilities: [],
      capabilities
    },
    conformance: {
      protocolLineId,
      definitionStatus: "COMPLETE",
      absentCorpora: [],
      capabilityCorpora,
      definitionCorpora: [{
        definitionId: "security-accounting",
        definitionStatus: "COMPLETE",
        complete: true,
        sourceDigest: "7".repeat(64)
      }]
    },
    securitySummary: {
      complete: true,
      provedClaimIds: stableClaimIds,
      explicitNonClaimIds: ["NONCLAIM-A"]
    },
    profileIdentityInputs: new Map([["stable-core", profileIdentityInput]]),
    lineIdentityInput
  };
}

function publicCase({ id, value, expectedHex }) {
  return {
    $schema: "https://licoarc.com/spec/schemas/conformance-case.schema.json",
    caseVersion: "licoarc.conformance-case.v1",
    id,
    target: { operationId: "licoarc.foundation.encode-deterministic-cbor.v1" },
    context: {
      sourceBindings: [{
        sourcePath: "spec/v1/foundation/bounds.json",
        sha256: "0".repeat(64)
      }],
      catalogs: [],
      publicMaterial: [],
      clock: {},
      state: {},
      transport: {},
      storage: {}
    },
    input: { value },
    expected: { result: { hex: expectedHex } }
  };
}

function resultMap(report) {
  return Object.fromEntries(report.results.map(({ id, actual }) => [id, actual]));
}

function errorWithCode(code) {
  return (error) => {
    assert.equal(error.code, code);
    return true;
  };
}
