import { assertValidProtocolCatalogs } from "./catalogs.mjs";
import { assertProtocolLineId, assertProtectionProfileId } from "./identity.mjs";
import { assertValidSecurityAccounting } from "./security.mjs";
import { assertValidAgainstClosedSchema } from "./schema.mjs";

export class ProtocolDefinitionError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "ProtocolDefinitionError";
    this.code = code;
  }
}

export function assertValidProtocolDefinition({
  protocolLines,
  protectionProfiles,
  manifest,
  conformance,
  security,
  schemas,
  fieldRegistryDigest,
  discoveredSourcePaths = undefined,
  declaredSourcePaths = undefined,
  profileIdentityInputs = new Map(),
  lineIdentityInput = undefined
}) {
  assertValidProtocolCatalogs(protocolLines, protectionProfiles, schemas);
  const shared = Object.values(schemas).filter((schema) =>
    schema !== schemas.manifest && schema !== schemas.conformance &&
    typeof schema?.$schema === "string");
  assertValidAgainstClosedSchema(manifest, schemas.manifest, { schemas: shared });
  assertValidAgainstClosedSchema(conformance, schemas.conformance, { schemas: shared });

  const line = protocolLines.lines.find((candidate) =>
    candidate.wireId === manifest.wireId && candidate.generation === manifest.generation);
  if (!line) throw new ProtocolDefinitionError("unknown-manifest-line");
  for (const field of ["protocolLineId", "lifecycle", "definitionStatus", "sessionEligible", "publicationEligible"]) {
    if (manifest[field] !== line[field]) throw new ProtocolDefinitionError("manifest-line-status-mismatch");
  }
  assertEqualSet(manifest.capabilities.map(({ capabilityId }) => capabilityId),
    line.definedCapabilities, "manifest-capability-mismatch");
  assertEqualSet(manifest.protectionProfileIds, line.protectionProfileIds,
    "manifest-profile-mismatch");
  assertEqualSet(manifest.stableClaimIds, line.stableClaimIds,
    "manifest-claim-mismatch");
  assertEqualSet(manifest.missingMandatoryCapabilities,
    line.mandatoryCapabilities.filter((id) => !line.definedCapabilities.includes(id)),
    "manifest-missing-capability-mismatch");
  assertEqualSet(manifest.blockers, line.blockers, "manifest-blocker-mismatch");

  assertFieldRegistryBinding(manifest, fieldRegistryDigest);
  if (discoveredSourcePaths !== undefined && declaredSourcePaths !== undefined) {
    assertDeclaredSourceClosure({
      roots: manifest.sourceClosure.roots,
      additionalSources: manifest.sourceClosure.additionalSources,
      discoveredPaths: discoveredSourcePaths,
      declaredPaths: declaredSourcePaths
    });
  } else if (line.definitionStatus === "COMPLETE") {
    throw new ProtocolDefinitionError("source-closure-not-validated");
  }
  const requiredProfileClaimIds = [...new Set(protectionProfiles.profiles
    .filter(({ profileId }) => profileId !== null && protectionProfiles.activeProfileIds.includes(profileId))
    .flatMap(({ requiredClaimIds }) => requiredClaimIds))].sort();
  const securitySummary = assertValidSecurityAccounting({
    ...security,
    schemas: schemas.security,
    requiredProfileClaimIds,
    requireComplete: line.definitionStatus === "COMPLETE"
  });

  if (line.definitionStatus === "COMPLETE") {
    assertCompleteProtocolLineAdmission({
      line,
      protocolLines,
      protectionProfiles,
      manifest,
      conformance,
      securitySummary,
      profileIdentityInputs,
      lineIdentityInput
    });
  } else {
    if (line.protocolLineId !== null || manifest.protocolLineId !== null ||
        line.sessionEligible || manifest.sessionEligible ||
        line.publicationEligible || manifest.publicationEligible) {
      throw new ProtocolDefinitionError("incomplete-line-admission");
    }
  }
  return Object.freeze({ line, securitySummary });
}

export function assertCompleteProtocolLineAdmission({
  line,
  protocolLines,
  protectionProfiles,
  manifest,
  conformance,
  securitySummary,
  profileIdentityInputs = new Map(),
  lineIdentityInput = undefined
}) {
  if (line.definitionStatus !== "COMPLETE" || manifest.definitionStatus !== "COMPLETE" ||
      line.sessionEligible !== true || manifest.sessionEligible !== true ||
      line.publicationEligible !== false || manifest.publicationEligible !== false ||
      line.blockers.length !== 0 || manifest.blockers.length !== 0 ||
      manifest.openDefinitions.length !== 0 || manifest.missingMandatoryCapabilities.length !== 0) {
    throw new ProtocolDefinitionError("complete-line-gates-not-closed");
  }
  if (securitySummary.complete !== true) throw new ProtocolDefinitionError("security-accounting-incomplete");
  const capabilities = new Map(manifest.capabilities.map((entry) => [entry.capabilityId, entry]));
  if (capabilities.size !== manifest.capabilities.length) {
    throw new ProtocolDefinitionError("duplicate-capability");
  }
  for (const capabilityId of line.mandatoryCapabilities) {
    const capability = capabilities.get(capabilityId);
    if (!capability || capability.definitionStatus !== "COMPLETE" ||
        !isDigest(capability.semanticIdentity) || !isDigest(capability.sourceDigest)) {
      throw new ProtocolDefinitionError("mandatory-capability-incomplete");
    }
  }
  assertEqualSet(line.protectionProfileIds, protectionProfiles.activeProfileIds,
    "active-profile-set-mismatch");
  const profiles = new Map(protectionProfiles.profiles
    .filter(({ profileId }) => profileId !== null)
    .map((profile) => [profile.profileId, profile]));
  const provedClaims = new Set(securitySummary.provedClaimIds);
  if (line.stableClaimIds.length === 0 || line.stableClaimIds.some((claimId) => !provedClaims.has(claimId))) {
    throw new ProtocolDefinitionError("protocol-line-claim-set-incomplete");
  }
  const lineClaimSet = new Set(line.stableClaimIds);
  for (const profileId of line.protectionProfileIds) {
    const profile = profiles.get(profileId);
    if (!profile || profile.definitionStatus !== "COMPLETE" || profile.sessionEligible !== true ||
        profile.publicationEligible !== false || profile.blockers.length !== 0 ||
        profile.requiredClaimIds.length === 0 ||
        profile.requiredClaimIds.some((claimId) => !provedClaims.has(claimId) || !lineClaimSet.has(claimId))) {
      throw new ProtocolDefinitionError("active-profile-incomplete");
    }
    const identityInput = profileIdentityInputs instanceof Map
      ? profileIdentityInputs.get(profile.profileLocator)
      : profileIdentityInputs[profile.profileLocator];
    if (!identityInput) throw new ProtocolDefinitionError("missing-profile-identity-input");
    assertProtectionProfileId(profileId, identityInput);
  }

  assertCompleteCorpus(line, conformance);
  if (!lineIdentityInput) throw new ProtocolDefinitionError("missing-protocol-line-identity-input");
  assertProtocolLineId(line.protocolLineId, {
    ...lineIdentityInput,
    generation: line.generation,
    mandatoryCapabilitySemanticIdentities: line.mandatoryCapabilities
      .map((id) => capabilities.get(id).semanticIdentity),
    protectionProfileIds: line.protectionProfileIds,
    stableClaimIds: line.stableClaimIds,
    selectionRules: protocolLines.selection
  });
  return true;
}

export function assertDeclaredSourceClosure({
  roots,
  additionalSources,
  discoveredPaths,
  declaredPaths,
  fieldRegistryPath = "spec/FIELD-REGISTRY.md"
}) {
  for (const values of [roots, additionalSources, discoveredPaths, declaredPaths]) {
    assertSortedUnique(values, "source-closure-members");
    if (values.length > 4096 || values.some((value) => !isSafeRelativePath(value))) {
      throw new ProtocolDefinitionError("invalid-source-closure-path");
    }
  }
  const actual = new Set(discoveredPaths);
  for (const sourcePath of additionalSources) actual.add(sourcePath);
  if (!actual.has(fieldRegistryPath)) throw new ProtocolDefinitionError("field-registry-outside-source-closure");
  if (discoveredPaths.some((sourcePath) =>
    !roots.some((root) => sourcePath === root || sourcePath.startsWith(`${root}/`)))) {
    throw new ProtocolDefinitionError("source-outside-declared-root");
  }
  const actualPaths = [...actual].sort();
  if (actualPaths.length !== declaredPaths.length ||
      actualPaths.some((sourcePath, index) => sourcePath !== declaredPaths[index])) {
    throw new ProtocolDefinitionError("declared-source-closure-mismatch");
  }
  return Object.freeze(actualPaths);
}

function assertFieldRegistryBinding(manifest, digest) {
  if (manifest.fieldRegistry.path !== "spec/FIELD-REGISTRY.md" ||
      manifest.fieldRegistry.authority !== "canonical-field-registry" ||
      manifest.fieldRegistry.sourceDigest !== digest || !isDigest(digest) ||
      !manifest.sourceClosure.additionalSources.includes(manifest.fieldRegistry.path)) {
    throw new ProtocolDefinitionError("canonical-field-registry-unbound");
  }
}

function assertCompleteCorpus(line, conformance) {
  if (conformance.definitionStatus !== "COMPLETE" || conformance.protocolLineId !== line.protocolLineId ||
      conformance.absentCorpora.length !== 0) {
    throw new ProtocolDefinitionError("aggregate-corpus-incomplete");
  }
  const corpora = new Map(conformance.capabilityCorpora.map((entry) => [entry.capabilityId, entry]));
  if (corpora.size !== conformance.capabilityCorpora.length) {
    throw new ProtocolDefinitionError("duplicate-capability-corpus");
  }
  assertEqualSet([...corpora.keys()].sort(), line.mandatoryCapabilities,
    "capability-corpus-set-mismatch");
  for (const capabilityId of line.mandatoryCapabilities) {
    const corpus = corpora.get(capabilityId);
    if (!corpus || corpus.definitionStatus !== "COMPLETE" || corpus.complete !== true ||
        !isDigest(corpus.sourceDigest)) {
      throw new ProtocolDefinitionError("mandatory-capability-corpus-incomplete");
    }
  }
  const protectionCorpus = corpora.get("licoarc.pairwise-protection.v1");
  if (!protectionCorpus) throw new ProtocolDefinitionError("protection-profile-corpus-incomplete");
  assertEqualSet(protectionCorpus.protectionProfileIds, line.protectionProfileIds,
    "protection-profile-corpus-mismatch");
  for (const [capabilityId, corpus] of corpora) {
    if (capabilityId !== "licoarc.pairwise-protection.v1" && corpus.protectionProfileIds.length !== 0) {
      throw new ProtocolDefinitionError("profile-corpus-owned-by-wrong-capability");
    }
  }
  const definitionCorpora = new Map(conformance.definitionCorpora.map((entry) => [entry.definitionId, entry]));
  if (definitionCorpora.size !== conformance.definitionCorpora.length ||
      !definitionCorpora.has("security-accounting") ||
      conformance.definitionCorpora.some((corpus) => corpus.definitionStatus !== "COMPLETE" ||
      corpus.complete !== true || !isDigest(corpus.sourceDigest))) {
    throw new ProtocolDefinitionError("definition-corpus-incomplete");
  }
}

function assertEqualSet(actual, expected, code) {
  assertSortedUnique(actual, code);
  assertSortedUnique(expected, code);
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new ProtocolDefinitionError(code);
  }
}

function assertSortedUnique(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new ProtocolDefinitionError("invalid-canonical-set", label);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) throw new ProtocolDefinitionError("noncanonical-set", label);
  }
}

function isSafeRelativePath(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 256 &&
    !value.startsWith("/") && !value.includes("\\") &&
    value.split("/").every((segment) => segment !== "" && segment !== "." && segment !== "..");
}

function isDigest(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/u.test(value);
}
