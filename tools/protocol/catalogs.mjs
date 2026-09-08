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

  if (protocolLines.lines.length !== 1 || protectionProfiles.profiles.length !== 1) {
    throw new CatalogError("initial V1 requires one exact line and Profile");
  }
  const [line] = protocolLines.lines;
  const [profile] = protectionProfiles.profiles;
  for (const [entry, label] of [[line, "Protocol Line"], [profile, "Profile"]]) {
    if (entry.generation !== 1 || entry.lifecycle !== "Candidate" ||
        entry.definitionStatus !== "COMPLETE" || entry.sessionEligible !== true ||
        entry.publicationEligible !== false || entry.blockers.length !== 0) {
      throw new CatalogError(`${label} must be the complete initial V1 Candidate`);
    }
  }
  for (const [values, label] of [
    [line.mandatoryCapabilities, "mandatory capabilities"],
    [line.definedCapabilities, "defined capabilities"],
    [line.stableClaimIds, "line claims"],
    [profile.requiredClaimIds, "Profile claims"],
    [profile.stableNonClaimIds, "Profile nonclaims"],
  ]) assertSortedUnique(values, label);
  if (typeof line.protocolLineId !== "string" || typeof profile.profileId !== "string" ||
      line.mandatoryCapabilities.some((id) => !line.definedCapabilities.includes(id)) ||
      line.protectionProfileIds.length !== 1 || line.protectionProfileIds[0] !== profile.profileId ||
      protectionProfiles.activeProfileIds.length !== 1 ||
      protectionProfiles.activeProfileIds[0] !== profile.profileId) {
    throw new CatalogError("initial V1 must bind its exact complete capability and Profile closure");
  }
  return true;
}

function assertSortedUnique(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new CatalogError(`${label} must be strings`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) throw new CatalogError(`${label} must be sorted and unique`);
  }
}
