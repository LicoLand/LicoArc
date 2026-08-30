import { validateClosedSchema } from "./schema.mjs";

export const CATALOG_COMMON_SCHEMA_ID =
  "https://licoarc.com/spec/schemas/catalog-common.schema.json";

export class CatalogError extends TypeError {
  constructor(message, details = undefined) {
    super(message);
    this.name = "CatalogError";
    if (details !== undefined) this.details = details;
  }
}

export function assertValidProtocolCatalogs(protocolLines, protectionProfiles, schemas) {
  if (schemas?.common?.$id !== CATALOG_COMMON_SCHEMA_ID) {
    throw new CatalogError("the shared catalog schema must be supplied as schemas.common");
  }
  const sharedSchemas = Object.values(schemas).filter((schema) =>
    schema !== schemas.protocolLines && schema !== schemas.protectionProfiles &&
    typeof schema?.$schema === "string");
  const lineErrors = validateClosedSchema(protocolLines, schemas.protocolLines, { schemas: sharedSchemas });
  const profileErrors = validateClosedSchema(protectionProfiles, schemas.protectionProfiles, { schemas: sharedSchemas });
  const errors = [...lineErrors, ...profileErrors];
  if (errors.length > 0) throw new CatalogError(`catalog schema rejection: ${errors.join("; ")}`, errors);

  assertSortedUnique(protocolLines.lines.map(lineIdentity), "Protocol Line identities");
  const profileIds = protectionProfiles.profiles
    .map(({ profileId }) => profileId)
    .filter((profileId) => profileId !== null);
  const activeProfileIds = protectionProfiles.activeProfileIds;
  const reservedProfileIds = protectionProfiles.reservedIdentifiers.map(({ id }) => id);
  assertSortedUnique(protectionProfiles.profiles.map(profileIdentity), "Profile catalog identities");
  assertSortedUnique(profileIds, "assigned Profile identities");
  assertSortedUnique(activeProfileIds, "active Profile identities");
  assertSortedUnique(reservedProfileIds, "reserved Profile identities");
  const reservedProfileSet = new Set(reservedProfileIds);
  if (profileIds.some((profileId) => reservedProfileSet.has(profileId))) {
    throw new CatalogError("a reserved Profile identifier cannot become active");
  }

  const profileById = new Map(protectionProfiles.profiles
    .filter(({ profileId }) => profileId !== null)
    .map((profile) => [profile.profileId, profile]));
  const activeProfileSet = new Set(activeProfileIds);
  for (const profile of protectionProfiles.profiles) {
    if (profile.minimumGeneration > profile.generation) {
      throw new CatalogError("a Profile minimum generation cannot exceed its generation");
    }
    assertSortedUnique(profile.requiredClaimIds, "Profile claim identities");
    assertSortedUnique(profile.stableNonClaimIds, "Profile nonclaim identities");
    assertSortedUnique(profile.blockers, "Profile blockers");
    const active = profile.profileId !== null && activeProfileSet.has(profile.profileId);
    if (active && (profile.definitionStatus !== "COMPLETE" || profile.blockers.length > 0)) {
      throw new CatalogError("an active Profile must be complete, content-bound, and unblocked");
    }
    if (!active && (profile.sessionEligible !== false || profile.newSessionPolicy === "allow-authenticated")) {
      throw new CatalogError("an inactive Profile must remain ineligible");
    }
    if (profile.definitionStatus !== "COMPLETE" &&
        (profile.profileId !== null || profile.sessionEligible !== false ||
         profile.publicationEligible !== false || profile.newSessionPolicy !== "forbid-incomplete" ||
         profile.blockers.length === 0)) {
      throw new CatalogError("an incomplete Profile must remain unidentified, ineligible, and explicitly blocked");
    }
    assertPolicyConsistency(profile, "Profile");
  }
  if (activeProfileIds.some((profileId) => !profileById.has(profileId))) {
    throw new CatalogError("an active Profile identity must resolve to exactly one catalog entry");
  }
  if (protectionProfiles.reservedIdentifiers.length !== 2) {
    throw new CatalogError("exactly two retired Profile identifier allocations must remain tombstoned");
  }
  for (const tombstone of protectionProfiles.reservedIdentifiers) {
    if (tombstone.lifecycle !== "Retired" || tombstone.newSessionPolicy !== "forbid-retired" || tombstone.reusable !== false) {
      throw new CatalogError("a Profile tombstone must remain retired, ineligible, and non-reusable");
    }
    assertPolicyConsistency(tombstone, "Profile tombstone");
  }

  for (const line of protocolLines.lines) {
    if (line.minimumGeneration > line.generation) {
      throw new CatalogError("a Protocol Line minimum generation cannot exceed its generation");
    }
    assertSortedUnique(line.mandatoryCapabilities, "mandatory capability identities");
    assertSortedUnique(line.definedCapabilities, "defined capability identities");
    assertSortedUnique(line.protectionProfileIds, "Protocol Line Profile identities");
    assertSortedUnique(line.stableClaimIds, "Protocol Line claim identities");
    assertSortedUnique(line.blockers, "Protocol Line blockers");
    const missing = line.mandatoryCapabilities.filter((capabilityId) =>
      !line.definedCapabilities.includes(capabilityId));

    if (line.definitionStatus === "COMPLETE") {
      if (typeof line.protocolLineId !== "string" || missing.length > 0 || line.blockers.length > 0) {
        throw new CatalogError("a complete Protocol Line must be content-bound with no missing capability or blocker");
      }
      if (line.mandatoryCapabilities.includes("licoarc.pairwise-protection.v1") &&
          line.protectionProfileIds.length === 0) {
        throw new CatalogError("a complete Pairwise-capable Protocol Line must bind a complete Protection Profile");
      }
    } else if (line.protocolLineId !== null || line.sessionEligible !== false ||
               line.publicationEligible !== false ||
               line.newSessionPolicy !== "forbid-incomplete" ||
               line.blockers.length === 0) {
      throw new CatalogError("an incomplete Protocol Line must remain unbound, ineligible, and explicitly blocked");
    }

    for (const profileId of line.protectionProfileIds) {
      const profile = profileById.get(profileId);
      if (!profile || profile.definitionStatus !== "COMPLETE" || !activeProfileSet.has(profileId)) {
        throw new CatalogError("a Protocol Line references an unknown or incomplete Protection Profile");
      }
    }
    if (["Published", "Deprecated", "Retired"].includes(line.lifecycle) &&
        (line.definitionStatus !== "COMPLETE" || typeof line.protocolLineId !== "string")) {
      throw new CatalogError("a published lifecycle record must target complete immutable content");
    }
    assertPolicyConsistency(line, "Protocol Line");
  }
  return true;
}

export function selectProtocolLine({ protocolLines, protectionProfiles, localSupport, peerSupport }) {
  if (!isAuthenticatedSupport(localSupport) || !isAuthenticatedSupport(peerSupport)) {
    return rejection(protocolLines.selection.unauthenticatedSupport);
  }

  const byWireGeneration = groupByWireGeneration(protocolLines.lines);
  for (const support of [localSupport, peerSupport]) {
    for (const entry of support.lines) {
      const knownGeneration = byWireGeneration.get(wireGeneration(entry));
      if (!knownGeneration) return rejection(protocolLines.selection.unknown);
      if (!knownGeneration.some((line) => line.protocolLineId === entry.protocolLineId)) {
        return rejection(protocolLines.selection.contentIdentityMismatch);
      }
    }
  }

  const localByWireGeneration = groupSupportByWireGeneration(localSupport.lines);
  const peerByWireGeneration = groupSupportByWireGeneration(peerSupport.lines);
  for (const [key, localDigests] of localByWireGeneration) {
    const peerDigests = peerByWireGeneration.get(key);
    if (peerDigests && ![...localDigests].some((digest) => peerDigests.has(digest))) {
      return rejection(protocolLines.selection.contentIdentityMismatch);
    }
  }

  const peerIdentities = new Set(peerSupport.lines.map(supportIdentity));
  const activeIds = new Set(protectionProfiles.activeProfileIds);
  const activeProfiles = new Map(protectionProfiles.profiles
    .filter((profile) => profile.profileId !== null && activeIds.has(profile.profileId))
    .map((profile) => [profile.profileId, profile]));
  const candidates = [];
  for (const localEntry of localSupport.lines) {
    if (!peerIdentities.has(supportIdentity(localEntry))) continue;
    const line = protocolLines.lines.find((candidate) => lineMatchesSupport(candidate, localEntry));
    if (!line || !lineEligible(line, activeProfiles, localSupport.minimumGeneration,
      peerSupport.minimumGeneration)) continue;
    candidates.push(line);
  }

  if (candidates.length === 0) return rejection(protocolLines.selection.zeroResult);
  const highestGeneration = Math.max(...candidates.map(({ generation }) => generation));
  const highest = candidates.filter(({ generation }) => generation === highestGeneration);
  const unique = new Map(highest.map((line) => [lineIdentity(line), line]));
  if (unique.size !== 1) return rejection(protocolLines.selection.ambiguousHighest);
  const [selected] = unique.values();
  return {
    status: protocolLines.selection.success,
    selected: {
      wireId: selected.wireId,
      generation: selected.generation,
      protocolLineId: selected.protocolLineId
    },
    sessionEstablished: false,
    stateAdvanced: false
  };
}

export function resolveExistingSessionPolicy({ protocolLines, registryAuthenticated, line }) {
  if (registryAuthenticated !== true) return rejection(protocolLines.selection.unauthenticatedSupport);
  const generationEntries = protocolLines.lines.filter((candidate) =>
    candidate.wireId === line.wireId && candidate.generation === line.generation);
  if (generationEntries.length === 0) return rejection(protocolLines.selection.unknown);
  const exact = generationEntries.find((candidate) => candidate.protocolLineId === line.protocolLineId);
  if (!exact) return rejection(protocolLines.selection.contentIdentityMismatch);
  return {
    status: "registry-policy",
    existingSessionPolicy: exact.existingSessionPolicy,
    authenticatedEffectiveGeneration: exact.authenticatedEffectiveGeneration,
    implementationChoice: false,
    stateAdvanced: false
  };
}

function assertPolicyConsistency(entry, label) {
  if (entry.lifecycle === "Retired" &&
      (entry.newSessionPolicy !== "forbid-retired" || entry.sessionEligible === true)) {
    throw new CatalogError(`${label} retirement must forbid new sessions`);
  }
  if (entry.lifecycle === "Deprecated" &&
      !["allow-authenticated", "forbid-deprecated"].includes(entry.newSessionPolicy)) {
    throw new CatalogError(`${label} deprecation policy is not registry-owned`);
  }
  if (entry.newSessionPolicy === "allow-authenticated" && entry.sessionEligible !== true) {
    throw new CatalogError(`${label} cannot allow a new session while ineligible`);
  }
  if (entry.existingSessionPolicy === "terminate-at-authenticated-generation") {
    if (!Number.isSafeInteger(entry.authenticatedEffectiveGeneration)) {
      throw new CatalogError(`${label} termination bound must be an authenticated generation`);
    }
  } else if (entry.authenticatedEffectiveGeneration !== null) {
    throw new CatalogError(`${label} carries an unused effective generation`);
  }
}

function lineEligible(line, activeProfiles, localMinimum, peerMinimum) {
  if (line.definitionStatus !== "COMPLETE" || line.sessionEligible !== true ||
      line.newSessionPolicy !== "allow-authenticated" ||
      line.generation < line.minimumGeneration || line.generation < localMinimum ||
      line.generation < peerMinimum ||
      line.mandatoryCapabilities.some((capabilityId) => !line.definedCapabilities.includes(capabilityId))) {
    return false;
  }
  return line.protectionProfileIds.every((profileId) => {
    const profile = activeProfiles.get(profileId);
    return profile?.definitionStatus === "COMPLETE" && profile.sessionEligible === true &&
      profile.newSessionPolicy === "allow-authenticated" &&
      profile.generation >= profile.minimumGeneration;
  });
}

function isAuthenticatedSupport(value) {
  return value?.authenticated === true && Number.isSafeInteger(value.minimumGeneration) &&
    value.minimumGeneration >= 1 && Array.isArray(value.lines) &&
    value.lines.every((entry) => typeof entry?.wireId === "string" &&
      Number.isSafeInteger(entry.generation) && entry.generation >= 1 &&
      typeof entry.protocolLineId === "string" && /^[0-9a-f]{64}$/u.test(entry.protocolLineId)) &&
    new Set(value.lines.map(supportIdentity)).size === value.lines.length;
}

function groupByWireGeneration(lines) {
  const groups = new Map();
  for (const line of lines) {
    const key = wireGeneration(line);
    const group = groups.get(key) ?? [];
    group.push(line);
    groups.set(key, group);
  }
  return groups;
}

function groupSupportByWireGeneration(lines) {
  const groups = new Map();
  for (const line of lines) {
    const key = wireGeneration(line);
    const group = groups.get(key) ?? new Set();
    group.add(line.protocolLineId);
    groups.set(key, group);
  }
  return groups;
}

function lineMatchesSupport(line, support) {
  return line.wireId === support.wireId && line.generation === support.generation &&
    line.protocolLineId === support.protocolLineId;
}

function wireGeneration(value) {
  return `${value.wireId}\u0000${value.generation}`;
}

function supportIdentity(value) {
  return `${wireGeneration(value)}\u0000${value.protocolLineId}`;
}

function lineIdentity(value) {
  return supportIdentity(value);
}

function profileIdentity(value) {
  return `${value.profileLocator}\u0000${value.generation}`;
}

function rejection(reason) {
  return { status: reason, selected: null, sessionEstablished: false, stateAdvanced: false };
}

function assertSortedUnique(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new CatalogError(`${label} must be strings`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) throw new CatalogError(`${label} must be sorted and unique`);
  }
}
