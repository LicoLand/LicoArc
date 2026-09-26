import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import {
  assertClosedJsonSchema,
  assertValidSecurityAccounting
} from "../tools/protocol/index.mjs";

const root = resolve(import.meta.dirname, "..");
const readJson = (sourcePath) => readFile(resolve(root, sourcePath), "utf8").then(JSON.parse);
const [claims, adversaries, bindings, registry, schemas] = await Promise.all([
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
    .then(Object.fromEntries)
]);
const accounting = { claims, adversaries, bindings, registry, schemas };
const [protectionProfiles, algorithms, protocolLines, proofEvidenceBytes, generatedTheory] = await Promise.all([
  readJson("spec/protection-profiles.json"),
  readJson("spec/v1/protection/algorithms.json"),
  readJson("spec/protocol-lines.json"),
  readFile(resolve(root, "formal/evidence.json")),
  readFile(resolve(root, "formal/generated/licoarc-core-v1.spthy"), "utf8")
]);
const proofEvidence = JSON.parse(proofEvidenceBytes);

test("security accounting is closed, source-authoritative, and lifecycle-generic", () => {
  for (const schema of Object.values(schemas)) assert.doesNotThrow(() => assertClosedJsonSchema(schema));
  const summary = assertValidSecurityAccounting(accounting);
  assert.equal(summary.complete, registry.definitionStatus === "COMPLETE");
  assert.equal(bindings.status === "complete", registry.definitionStatus === "COMPLETE");
  assert.equal(registry.missingMandatoryBindingPolicy, "line-ineligible");
  assert.equal(registry.proofDoesNotDefineProtocol, true);
  assert.equal(registry.downstreamEvidenceDoesNotAdvanceDefinition, true);
  assert.equal(bindings.bindings.length, 0);
  assert.equal(registry.proofEvidencePath, null);
  assert.equal(registry.proofEvidenceDigest, null);
  assert.equal(bindings.requiredKinds.length, 7);
  assert.ok(bindings.semanticSources.includes("spec/protocol-lines.json"));
  assert.ok(bindings.semanticSources.includes("spec/protection-profiles.json"));

  const ids = claims.claims.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), ids);
  for (const property of [
    "hybrid-ake-key-secrecy",
    "mutual-endpoint-authentication",
    "protocol-line-content-binding",
    "double-ratchet-forward-secrecy",
    "double-ratchet-post-compromise-recovery",
    "self-certifying-user-authority",
    "management-and-recovery-transition-authorization",
    "endpoint-possession-authorization",
    "acyclic-sibling-endpoint-authority-session-binding",
    "authenticated-confirmation-finality",
    "pairwise-record-confidentiality",
    "pairwise-record-authentication-and-integrity",
    "sender-metadata-confidentiality"
  ]) assert.ok(claims.claims.some((claim) => claim.property === property), property);
});

test("every proved claim carries every exact formal binding kind and reference", () => {
  const byClaim = Map.groupBy(bindings.bindings, (binding) => binding.claimId);
  for (const claim of claims.claims) {
    const claimBindings = byClaim.get(claim.id) ?? [];
    if (claim.status !== "proved") {
      assert.equal(claimBindings.length, 0, claim.id);
      assert.equal(claim.proofModel, null, claim.id);
      assert.equal(claim.proofLemma, null, claim.id);
      continue;
    }
    assert.equal(claim.counterexampleStatus, "no-counterexample-found", claim.id);
    assert.deepEqual(
      new Set(claimBindings.map(({ kind }) => kind)),
      new Set(bindings.requiredKinds),
      claim.id
    );
    assert.ok(claimBindings.every((binding) =>
      binding.proofModel === claim.proofModel && binding.proofLemma === claim.proofLemma), claim.id);
  }
});

test("the pending Profile retains exact claims and nonclaims without claiming proof", () => {
  const expectedClaimIds = Array.from({ length: 23 }, (_, index) =>
    `SEC-${String(index + 1).padStart(3, "0")}`);
  assert.deepEqual(claims.claims.map(({ id }) => id), expectedClaimIds);
  assert.ok(claims.claims.every(({ status, counterexampleStatus }) => status === "unproved" && counterexampleStatus === "not-run"));

  assert.deepEqual(protectionProfiles.activeProfileIds, []);
  const activeProfile = protectionProfiles.profiles[0];
  assert.deepEqual(activeProfile.requiredClaimIds, [
    ...expectedClaimIds.slice(0, 13),
    ...expectedClaimIds.slice(19)
  ]);
  const exactProfileNonclaims = [
    "ongoing-post-quantum-post-compromise-recovery",
    "physical-zeroization",
    "ratchet-header-confidentiality",
    "rollback-detection-under-fully-compromised-store"
  ];
  assert.deepEqual(activeProfile.stableNonClaimIds, exactProfileNonclaims);
  assert.deepEqual([...algorithms.nonclaims].sort(), exactProfileNonclaims);
  assert.ok(exactProfileNonclaims.every((nonclaim) => claims.nonClaims.includes(nonclaim)));
});

test("prior proof remains content-bound evidence for its old definition, never the new Candidate", async () => {
  const requalification = await readJson("formal/requalification.json");
  assert.equal(requalification.status, "required");
  assert.equal(requalification.supersededEvidenceDigest, createHash("sha256").update(proofEvidenceBytes).digest("hex"));
  assert.equal(protocolLines.lines[0].sessionEligible, false);
  assert.equal(protocolLines.lines[0].definitionStatus, "PARTIAL");
  assert.notEqual(protocolLines.lines[0].protocolLineId, "c0b64d71865ce972a944db3d31a18cb03395300f3ed006c21e64429178c23a08");
  assert.doesNotMatch(generatedTheory, new RegExp(protocolLines.lines[0].protocolLineId));
  assert.match(proofEvidence.imageDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.ok(proofEvidence.lemmas.some(({ result }) => result === "verified"));
  for (const command of ["tools/formal/generate.mjs", "tools/formal/check.mjs"]) {
    const result = spawnSync(process.execPath, [command], { cwd: root, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr + result.stdout, /FORMAL_MODEL_REQUALIFICATION_REQUIRED/);
  }
});

test("unknown adversaries and downstream proof authority fail closed", () => {
  const unknownAdversary = structuredClone(accounting);
  unknownAdversary.claims.claims[0].adversary = ["A-UNKNOWN"];
  assert.throws(() => assertValidSecurityAccounting(unknownAdversary),
    errorWithCode("reject-unknown-adversary"));

  if (bindings.bindings.length > 0) {
    const downstream = structuredClone(accounting);
    downstream.bindings.bindings[0].authorityPath = "downstream/provider-result.json";
    assert.throws(() => assertValidSecurityAccounting(downstream),
      errorWithCode("reject-wrong-authority"));
  }
});

test("explicit nonclaims remain unavailable as positive guarantees", () => {
  assert.ok(claims.nonClaims.includes("anonymity"));
  assert.ok(claims.nonClaims.includes("traffic-analysis-resistance"));
  assert.ok(claims.nonClaims.includes("exactly-once-effects-without-application-idempotency"));
  assert.ok(claims.nonClaims.includes("security-after-full-live-endpoint-compromise-before-recovery"));

  const positiveProperties = new Set(claims.claims
    .filter(({ status }) => status === "proved")
    .map(({ property }) => property));
  for (const nonClaim of claims.nonClaims) assert.ok(!positiveProperties.has(nonClaim), nonClaim);

  const promoted = structuredClone(accounting);
  promoted.claims.claims[2].property = claims.nonClaims[0];
  assert.throws(() => assertValidSecurityAccounting(promoted),
    errorWithCode("reject-nonclaim-promoted-to-claim"));
});

function errorWithCode(code) {
  return (error) => {
    assert.equal(error.code, code);
    return true;
  };
}
