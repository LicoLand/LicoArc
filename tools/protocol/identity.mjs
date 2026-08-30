import { createHash } from "node:crypto";
import { canonicalizeRestrictedJsonBytes } from "./canonical-json.mjs";
import { encodeDeterministicCbor } from "./deterministic-cbor.mjs";

export const PROFILE_IDENTITY_DOMAIN = "LICOARC/PROFILE-CONTENT-IDENTITY/V1\0";
export const PROTOCOL_LINE_IDENTITY_DOMAIN = "LICOARC/PROTOCOL-LINE-CONTENT-IDENTITY/V1\0";

export class SemanticIdentityError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "SemanticIdentityError";
    this.code = code;
  }
}

/**
 * Build the named, non-circular ProtectionProfileSemanticProjectionV1.
 * Source paths are locators and are intentionally absent. The stable semantic
 * role and canonical bytes are sufficient to prevent role substitution.
 */
export function protectionProfileSemanticProjection({
  profile,
  semanticSources,
  stableClaimIds,
  stableNonClaimIds
}) {
  if (!isPlainObject(profile) || !isPlainObject(profile.semanticSources)) {
    throw new SemanticIdentityError("invalid-profile-descriptor");
  }
  const claims = canonicalStringSet(stableClaimIds, "profile-claim-identities", 128);
  const nonClaims = canonicalStringSet(stableNonClaimIds, "profile-nonclaim-identities", 128);
  const declaredRoles = Object.keys(profile.semanticSources)
    .filter((role) => role !== "authorityVectors")
    .sort();
  if (declaredRoles.length === 0 || declaredRoles.length > 32) {
    throw new SemanticIdentityError("invalid-profile-semantic-source-count");
  }
  const suppliedRoles = semanticSources instanceof Map
    ? [...semanticSources.keys()].sort()
    : Object.keys(semanticSources ?? {}).sort();
  if (!equalArrays(declaredRoles, suppliedRoles)) {
    throw new SemanticIdentityError("profile-semantic-source-set-mismatch");
  }
  const sources = declaredRoles.map((role) => [role, canonicalSemanticBytes(
    semanticSources instanceof Map ? semanticSources.get(role) : semanticSources[role]
  )]);
  return Object.freeze([
    "ProtectionProfileSemanticProjectionV1",
    profile.profileSemanticVersion,
    profile.indivisible,
    profile.componentNegotiation,
    profile.fallback,
    sources,
    claims,
    nonClaims
  ]);
}

/** Build the named, non-circular ProtocolLineSemanticProjectionV1. */
export function protocolLineSemanticProjection({
  generation,
  mandatoryCapabilitySemanticIdentities,
  protectionProfileIds,
  stableClaimIds,
  selectionRules,
  sessionRules
}) {
  if (!Number.isSafeInteger(generation) || generation < 1) {
    throw new SemanticIdentityError("invalid-protocol-line-generation");
  }
  const capabilities = canonicalDigestSet(
    mandatoryCapabilitySemanticIdentities, "capability-semantic-identities", 64);
  const profiles = canonicalDigestSet(protectionProfileIds, "protection-profile-identities", 16);
  const claims = canonicalStringSet(stableClaimIds, "line-claim-identities", 128);
  if (capabilities.length === 0 || profiles.length === 0) {
    throw new SemanticIdentityError("incomplete-protocol-line-composition");
  }
  return Object.freeze([
    "ProtocolLineSemanticProjectionV1",
    generation,
    capabilities,
    profiles,
    claims,
    canonicalSemanticBytes(selectionRules),
    canonicalSemanticBytes(sessionRules)
  ]);
}

export function computeProtectionProfileId(input) {
  return digestProjection(PROFILE_IDENTITY_DOMAIN,
    protectionProfileSemanticProjection(input));
}

export function computeProtocolLineId(input) {
  return digestProjection(PROTOCOL_LINE_IDENTITY_DOMAIN,
    protocolLineSemanticProjection(input));
}

export function assertProtectionProfileId(expected, input) {
  return assertIdentity(expected, computeProtectionProfileId(input), "profile-content-identity-mismatch");
}

export function assertProtocolLineId(expected, input) {
  return assertIdentity(expected, computeProtocolLineId(input), "protocol-line-content-identity-mismatch");
}

function digestProjection(domain, projection) {
  const domainBytes = new TextEncoder().encode(domain);
  const projectionBytes = encodeDeterministicCbor(projection, {
    maxBytes: 4_194_304,
    maxDepth: 16,
    maxArrayItems: 128,
    maxMapEntries: 64,
    maxRawBytes: 1_048_576,
    maxTextBytes: 4_096
  });
  return createHash("sha256").update(domainBytes).update(projectionBytes).digest("hex");
}

function canonicalSemanticBytes(value) {
  if (typeof value === "string") {
    if (!value.endsWith("\n") || value.includes("\r") || value.includes("\0") || value.startsWith("\ufeff")) {
      throw new SemanticIdentityError("noncanonical-semantic-text");
    }
    return new TextEncoder().encode(value);
  }
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  return canonicalizeRestrictedJsonBytes(value, {
    maxBytes: 1_048_576,
    maxDepth: 16,
    maxArrayItems: 256,
    maxObjectMembers: 256,
    maxStringBytes: 65_536
  });
}

function canonicalDigestSet(values, label, maximum) {
  const result = canonicalStringSet(values, label, maximum);
  if (result.some((value) => !/^[0-9a-f]{64}$/u.test(value))) {
    throw new SemanticIdentityError(`invalid-${label}`);
  }
  return result;
}

function canonicalStringSet(values, label, maximum) {
  if (!Array.isArray(values) || values.length > maximum ||
      values.some((value) => typeof value !== "string" || value.length === 0 || value.length > 256)) {
    throw new SemanticIdentityError(`invalid-${label}`);
  }
  const result = [...values].sort();
  if (result.some((value, index) => index > 0 && result[index - 1] === value)) {
    throw new SemanticIdentityError(`duplicate-${label}`);
  }
  return Object.freeze(result);
}

function assertIdentity(expected, actual, code) {
  if (expected !== actual) throw new SemanticIdentityError(code);
  return actual;
}

function equalArrays(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
