import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  assertClosedJsonSchema,
  assertValidSecurityAccounting,
  validateClosedSchema
} from "../tools/protocol/index.mjs";

const root = resolve(import.meta.dirname, "..");
const readJson = (sourcePath) => readFile(resolve(root, sourcePath), "utf8").then(JSON.parse);
const [claims, adversaries, bindings, registry, valid, invalid, schemas] = await Promise.all([
  readJson("spec/v1/security/claims.json"),
  readJson("spec/v1/security/adversary-model.json"),
  readJson("spec/v1/security/formal-bindings.json"),
  readJson("spec/v1/security/registry.json"),
  readJson("conformance/v1/security/valid.json"),
  readJson("conformance/v1/security/invalid.json"),
  Promise.all([
    ["claims", "spec/schemas/security-claims.schema.json"],
    ["adversaries", "spec/schemas/security-adversary-model.schema.json"],
    ["bindings", "spec/schemas/security-formal-bindings.schema.json"],
    ["registry", "spec/schemas/security-registry.schema.json"],
    ["corpus", "spec/schemas/security-corpus.schema.json"]
  ].map(async ([name, sourcePath]) => [name, await readJson(sourcePath)]))
    .then(Object.fromEntries)
]);
const accounting = { claims, adversaries, bindings, registry, schemas };

test("closed security accounting records every required claim without fabricated proof", () => {
  for (const schema of Object.values(schemas)) assert.doesNotThrow(() => assertClosedJsonSchema(schema));
  assert.deepEqual(validateClosedSchema(valid, schemas.corpus), []);
  assert.deepEqual(validateClosedSchema(invalid, schemas.corpus), []);
  assert.doesNotThrow(() => assertValidSecurityAccounting(accounting));

  assert.deepEqual(claims.claims.map(({ id }) => id),
    Array.from({ length: 23 }, (_, index) => `SEC-${String(index + 1).padStart(3, "0")}`));
  assert.ok(claims.claims.every((claim) =>
    claim.status === "unproved" && claim.proofModel === null &&
    claim.proofLemma === null && claim.counterexampleStatus === "not-evaluated"));
  for (const property of [
    "pairwise-record-confidentiality",
    "pairwise-record-authentication-and-integrity",
    "sender-metadata-confidentiality"
  ]) assert.ok(claims.claims.some((claim) => claim.property === property), property);
  assert.deepEqual(bindings.bindings, []);
  assert.equal(bindings.status, "incomplete");
  assert.equal(registry.missingMandatoryBindingPolicy, "line-ineligible");
});

test("security negative corpus executes closed-schema, reference, proof, and authority rejection", () => {
  for (const corpusCase of invalid.cases) {
    const mutated = structuredClone(accounting);
    applyMutation(mutated, corpusCase.mutation);
    assert.throws(() => assertValidSecurityAccounting(mutated), (error) => {
      assert.equal(error.code, corpusCase.expected, corpusCase.id);
      return true;
    });
  }
});

test("adversary and explicit non-claim boundaries remain machine-visible", () => {
  assert.deepEqual(adversaries.models.map(({ id }) => id),
    ["A0", "A1", "A2", "A3", "A4", "A5", "A6"]);
  assert.ok(claims.nonClaims.includes("anonymity"));
  assert.ok(claims.nonClaims.includes("traffic-analysis-resistance"));
  assert.ok(claims.nonClaims.includes("exactly-once-effects-without-application-idempotency"));
  assert.ok(valid.cases.every(({ expected }) => expected === "accept-source-status"));
});

function applyMutation(value, mutation) {
  const claim = value.claims.claims.find(({ id }) => id === mutation.claimId);
  switch (mutation.operation) {
    case "prove-without-binding":
      claim.status = "proved";
      claim.proofModel = "future-model";
      claim.proofLemma = "future-lemma";
      break;
    case "unknown-adversary":
      claim.adversary = ["A99"];
      break;
    case "unknown-claim-member":
      claim.unowned = true;
      break;
    case "remove-required-claim":
      value.claims.claims = value.claims.claims.filter(({ id }) => id !== mutation.claimId);
      break;
    case "add-downstream-binding":
      value.bindings.bindings.push({
        bindingId: "BIND-001",
        claimId: mutation.claimId,
        kind: "protocol-line-id",
        authorityPath: "downstream/results/model.json",
        authorityPointer: "/result",
        authorityDigest: "0".repeat(64)
      });
      break;
    default:
      throw new TypeError(`unknown security mutation ${mutation.operation}`);
  }
}
