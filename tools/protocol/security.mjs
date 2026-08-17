import { validateClosedSchema } from "./schema.mjs";

const REQUIRED_PROPERTIES = new Set([
  "hybrid-ake-key-secrecy",
  "mutual-endpoint-authentication",
  "protocol-line-downgrade-resistance",
  "double-ratchet-forward-secrecy",
  "double-ratchet-post-compromise-recovery",
  "pairwise-record-confidentiality",
  "pairwise-record-authentication-and-integrity",
  "sender-metadata-confidentiality"
]);

export class SecurityAccountingError extends TypeError {
  constructor(code, message = code, details = undefined) {
    super(message);
    this.name = "SecurityAccountingError";
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export function assertValidSecurityAccounting({
  claims,
  adversaries,
  bindings,
  registry,
  schemas
}) {
  for (const binding of bindings?.bindings ?? []) {
    if (typeof binding?.authorityPath === "string" &&
        !binding.authorityPath.startsWith("spec/") &&
        !binding.authorityPath.startsWith("docs/")) {
      throw new SecurityAccountingError("reject-wrong-authority");
    }
  }

  const schemaInputs = [
    [claims, schemas.claims],
    [adversaries, schemas.adversaries],
    [bindings, schemas.bindings],
    [registry, schemas.registry]
  ];
  for (const [value, schema] of schemaInputs) {
    const errors = validateClosedSchema(value, schema);
    if (errors.length > 0) {
      throw new SecurityAccountingError("reject-closed-schema",
        `security accounting schema rejection: ${errors.join("; ")}`, errors);
    }
  }

  const adversaryIds = adversaries.models.map(({ id }) => id);
  assertSortedUnique(adversaryIds, "adversary identities");
  const adversarySet = new Set(adversaryIds);
  if (adversaries.models.some((model) =>
    (model.powers?.length ?? 0) === 0 && (model.variants?.length ?? 0) === 0)) {
    throw new SecurityAccountingError("reject-empty-adversary-model");
  }

  const claimIds = claims.claims.map(({ id }) => id);
  assertSortedUnique(claimIds, "security claim identities");
  const claimSet = new Set(claimIds);
  const properties = new Set(claims.claims.map(({ property }) => property));
  if ([...REQUIRED_PROPERTIES].some((property) => !properties.has(property))) {
    throw new SecurityAccountingError("reject-missing-required-claim");
  }
  if (claims.claims.some((claim) => claim.adversary.some((id) => !adversarySet.has(id)))) {
    throw new SecurityAccountingError("reject-unknown-adversary");
  }

  const bindingIds = bindings.bindings.map(({ bindingId }) => bindingId);
  assertSortedUnique(bindingIds, "formal binding identities");
  if (bindings.bindings.some(({ claimId }) => !claimSet.has(claimId))) {
    throw new SecurityAccountingError("reject-unknown-binding-claim");
  }
  const bindingsByClaim = new Map();
  for (const binding of bindings.bindings) {
    const list = bindingsByClaim.get(binding.claimId) ?? [];
    list.push(binding);
    bindingsByClaim.set(binding.claimId, list);
  }

  for (const claim of claims.claims) {
    if (claim.status === "proved") {
      if (typeof claim.proofModel !== "string" || typeof claim.proofLemma !== "string") {
        throw new SecurityAccountingError("reject-missing-proof-reference");
      }
      const kinds = new Set((bindingsByClaim.get(claim.id) ?? []).map(({ kind }) => kind));
      if (bindings.requiredKinds.some((kind) => !kinds.has(kind))) {
        throw new SecurityAccountingError("reject-missing-proof-binding");
      }
    } else if (claim.proofModel !== null || claim.proofLemma !== null) {
      throw new SecurityAccountingError("reject-unproved-proof-reference");
    }
  }

  if (registry.definitionStatus !== "PARTIAL" ||
      registry.missingMandatoryBindingPolicy !== "line-ineligible" ||
      registry.downstreamEvidenceDoesNotAdvanceDefinition !== true ||
      bindings.missingBindingPolicy !== "claim-remains-unproved-and-line-ineligible") {
    throw new SecurityAccountingError("reject-security-boundary");
  }
  return true;
}

function assertSortedUnique(values, label) {
  if (new Set(values).size !== values.length) {
    throw new SecurityAccountingError("reject-duplicate-identity", `${label} must be unique`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) {
      throw new SecurityAccountingError("reject-noncanonical-order", `${label} must be sorted`);
    }
  }
}
