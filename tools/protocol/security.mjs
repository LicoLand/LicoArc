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
  schemas,
  requiredProfileClaimIds = [],
  requireComplete = false
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
    const errors = validateClosedSchema(value, schema, {
      schemas: Object.values(schemas).filter((candidate) => candidate !== schema)
    });
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
  const explicitNonClaims = new Set(claims.nonClaims);
  if ([...REQUIRED_PROPERTIES].some((property) => !properties.has(property))) {
    throw new SecurityAccountingError("reject-missing-required-claim");
  }
  if (claims.claims.some(({ property }) => explicitNonClaims.has(property))) {
    throw new SecurityAccountingError("reject-nonclaim-promoted-to-claim");
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
      if (kinds.size !== (bindingsByClaim.get(claim.id) ?? []).length) {
        throw new SecurityAccountingError("reject-duplicate-proof-binding-kind");
      }
      if (bindings.requiredKinds.some((kind) => !kinds.has(kind))) {
        throw new SecurityAccountingError("reject-missing-proof-binding");
      }
      if ((bindingsByClaim.get(claim.id) ?? []).some((binding) =>
        binding.proofModel !== claim.proofModel || binding.proofLemma !== claim.proofLemma)) {
        throw new SecurityAccountingError("reject-proof-binding-reference-mismatch");
      }
      if (claim.counterexampleStatus !== "no-counterexample-found") {
        throw new SecurityAccountingError("reject-nonterminal-proof-result");
      }
    } else if (claim.proofModel !== null || claim.proofLemma !== null) {
      throw new SecurityAccountingError("reject-unproved-proof-reference");
    } else if ((bindingsByClaim.get(claim.id) ?? []).length > 0) {
      throw new SecurityAccountingError("reject-binding-for-unproved-claim");
    }
  }

  assertSortedUnique(requiredProfileClaimIds, "Profile claim identities");
  const claimById = new Map(claims.claims.map((claim) => [claim.id, claim]));
  for (const claimId of requiredProfileClaimIds) {
    const claim = claimById.get(claimId);
    if (!claim) throw new SecurityAccountingError("reject-unknown-profile-claim");
    if (claim.status !== "proved") throw new SecurityAccountingError("reject-unproved-profile-claim");
  }

  const terminal = claims.claims.every(({ status }) => status === "proved" || status === "explicit-nonclaim");
  const bindingComplete = bindings.status === "complete";
  if (bindingComplete !== terminal) {
    throw new SecurityAccountingError("reject-binding-completion-mismatch");
  }
  if ((registry.definitionStatus === "COMPLETE") !== (terminal && bindingComplete)) {
    throw new SecurityAccountingError("reject-security-definition-status");
  }
  if (requireComplete && registry.definitionStatus !== "COMPLETE") {
    throw new SecurityAccountingError("reject-incomplete-security-accounting");
  }

  const completeProofEvidenceInvalid = registry.definitionStatus === "COMPLETE" &&
    (registry.proofEvidencePath !== "formal/evidence.json" ||
     typeof registry.proofEvidenceDigest !== "string" ||
     !/^[0-9a-f]{64}$/u.test(registry.proofEvidenceDigest));
  if (registry.missingMandatoryBindingPolicy !== "line-ineligible" ||
      completeProofEvidenceInvalid ||
      registry.downstreamEvidenceDoesNotAdvanceDefinition !== true ||
      registry.proofDoesNotDefineProtocol !== true ||
      bindings.missingBindingPolicy !== "claim-remains-unproved-and-line-ineligible") {
    throw new SecurityAccountingError("reject-security-boundary");
  }
  return Object.freeze({
    complete: registry.definitionStatus === "COMPLETE",
    provedClaimIds: Object.freeze(claims.claims.filter(({ status }) => status === "proved").map(({ id }) => id)),
    explicitNonClaimIds: Object.freeze(claims.claims.filter(({ status }) => status === "explicit-nonclaim").map(({ id }) => id))
  });
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
