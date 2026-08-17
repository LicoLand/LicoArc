import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  assertClosedJsonSchema,
  assertValidProtocolCatalogs,
  resolveExistingSessionPolicy,
  selectProtocolLine
} from "../tools/protocol/index.mjs";

const root = resolve(import.meta.dirname, "..");
const readJson = (sourcePath) => readFile(resolve(root, sourcePath), "utf8").then(JSON.parse);

const [registry, profiles, lines, manifest, lineSchema, profileSchema, selectionCorpus] =
  await Promise.all([
    readJson("spec/v1/protection/registry.json"),
    readJson("spec/protection-profiles.json"),
    readJson("spec/protocol-lines.json"),
    readJson("spec/v1/manifest.json"),
    readJson("spec/schemas/protocol-lines.schema.json"),
    readJson("spec/schemas/protection-profiles.schema.json"),
    readJson("conformance/v1/foundation/selection.json")
  ]);
const schemas = { protocolLines: lineSchema, protectionProfiles: profileSchema };

test("Pairwise Protection is an honest partial definition with no active wire", () => {
  assert.equal(registry.definitionStatus, "PARTIAL");
  assert.equal(registry.sessionEligible, false);
  assert.deepEqual(registry.activeProfiles, []);
  assert.deepEqual(registry.wireSchemas, []);
  assert.equal(registry.runtimeGrammar, null);
  assert.equal(registry.conformanceCorpus, null);
});

test("Protocol Line and Profile catalogs are closed, coherent, and non-selectable", () => {
  assert.doesNotThrow(() => assertClosedJsonSchema(lineSchema));
  assert.doesNotThrow(() => assertClosedJsonSchema(profileSchema));
  assert.doesNotThrow(() => assertValidProtocolCatalogs(lines, profiles, schemas));

  assert.deepEqual(profiles.activeProfiles, []);
  assert.equal(profiles.reservedIdentifiers.length, 2);
  assert.ok(profiles.reservedIdentifiers.every((entry) =>
    entry.status === "withdrawn-candidate" && entry.reusable === false &&
    entry.lifecycle === "Retired" && entry.newSessionPolicy === "forbid-retired"));
  assert.equal(profiles.admission.reducedSecurityFallback, "forbidden");
  assert.equal(profiles.admission.componentNegotiation, "forbidden");

  const line = lines.lines[0];
  assert.equal(line.contentDigest, null);
  assert.equal(line.definitionStatus, "PARTIAL");
  assert.equal(line.sessionEligible, false);
  assert.equal(line.publicationEligible, false);
  assert.ok(line.mandatoryCapabilities.includes("licoarc.pairwise-protection.v1"));
  assert.ok(!line.definedCapabilities.includes("licoarc.pairwise-protection.v1"));
  assert.ok(manifest.missingMandatoryCapabilities.includes("licoarc.pairwise-protection.v1"));
  assert.ok(!manifest.capabilities.some(({ capabilityId }) =>
    capabilityId === "licoarc.pairwise-protection.v1"));
});

test("selection corpus executes unique-highest, minimum, lifecycle, ambiguity, and no-fallback policy", () => {
  const fixture = syntheticCatalogs();
  assert.doesNotThrow(() => assertValidProtocolCatalogs(
    fixture.protocolLines, fixture.protectionProfiles, schemas));

  for (const corpusCase of selectionCorpus.cases) {
    if (corpusCase.existing) {
      const result = resolveExistingSessionPolicy({
        protocolLines: fixture.protocolLines,
        registryAuthenticated: corpusCase.registryAuthenticated,
        line: supportEntry(fixture.aliases.get(corpusCase.existing))
      });
      assert.equal(result.existingSessionPolicy, corpusCase.expected, corpusCase.id);
      assert.equal(result.implementationChoice, false, corpusCase.id);
      assert.equal(result.stateAdvanced, false, corpusCase.id);
      continue;
    }

    const result = selectProtocolLine({
      protocolLines: fixture.protocolLines,
      protectionProfiles: fixture.protectionProfiles,
      localSupport: supportStatement(
        corpusCase.local.map((alias) => fixture.aliases.get(alias)),
        corpusCase.localMinimumGeneration,
        corpusCase.localAuthenticated ?? true),
      peerSupport: supportStatement(
        corpusCase.peer.map((alias) => fixture.aliases.get(alias)),
        corpusCase.peerMinimumGeneration,
        corpusCase.peerAuthenticated ?? true)
    });
    assert.equal(result.status, corpusCase.expected, corpusCase.id);
    assert.equal(result.stateAdvanced, false, corpusCase.id);
    assert.equal(result.sessionEstablished, false, corpusCase.id);
    if (corpusCase.selectedGeneration !== undefined) {
      assert.equal(result.selected?.generation, corpusCase.selectedGeneration, corpusCase.id);
    } else {
      assert.equal(result.selected, null, corpusCase.id);
    }
  }
});

test("catalog mutations reject unknown members, capability gaps, and tombstone reuse", () => {
  const fixture = syntheticCatalogs();

  const unknownMember = structuredClone(fixture.protocolLines);
  unknownMember.selection.implementationDefault = "fallback";
  assert.throws(() => assertValidProtocolCatalogs(
    unknownMember, fixture.protectionProfiles, schemas), /catalog schema rejection/);

  const capabilityGap = structuredClone(fixture.protocolLines);
  capabilityGap.lines.find(({ generation }) => generation === 1).definedCapabilities =
    capabilityGap.lines.find(({ generation }) => generation === 1)
      .definedCapabilities.filter((id) => id !== "licoarc.pairwise-protection.v1");
  assert.throws(() => assertValidProtocolCatalogs(
    capabilityGap, fixture.protectionProfiles, schemas), /missing capability/);

  const reused = structuredClone(fixture.protectionProfiles);
  reused.activeProfiles[0].profileId = reused.reservedIdentifiers[0].id;
  assert.throws(() => assertValidProtocolCatalogs(
    fixture.protocolLines, reused, schemas), /reserved Profile identifier/);

  const unknownProfile = structuredClone(fixture.protocolLines);
  unknownProfile.lines.find(({ generation }) => generation === 1).protectionProfileIds =
    ["f".repeat(64)];
  assert.throws(() => assertValidProtocolCatalogs(
    unknownProfile, fixture.protectionProfiles, schemas), /unknown or incomplete/);
});

function syntheticCatalogs() {
  const profileId = "a".repeat(64);
  const mandatory = [...lines.lines[0].mandatoryCapabilities];
  const defined = [...new Set([
    ...mandatory,
    "licoarc.federation-governance.v1",
    "licoarc.group-collaboration.v1"
  ])].sort();
  const aliases = new Map();
  const complete = (alias, generation, digest, overrides = {}) => {
    const line = {
      wireId: "licoarc.selection-line.v1",
      generation,
      minimumGeneration: 1,
      contentDigest: digest.repeat(64),
      lifecycle: "Candidate",
      definitionStatus: "COMPLETE",
      sessionEligible: true,
      publicationEligible: true,
      newSessionPolicy: "allow-authenticated",
      existingSessionPolicy: "continue-authenticated",
      authenticatedEffectiveGeneration: null,
      mandatoryCapabilities: mandatory,
      definedCapabilities: defined,
      protectionProfileIds: [profileId],
      blockers: [],
      ...overrides
    };
    aliases.set(alias, line);
    return line;
  };

  const records = [
    complete("complete-v1", 1, "1"),
    complete("complete-v2", 2, "2"),
    complete("alternate-v2", 2, "3"),
    complete("deprecated-v3", 3, "4", {
      lifecycle: "Deprecated",
      sessionEligible: false,
      publicationEligible: false,
      newSessionPolicy: "forbid-deprecated",
      existingSessionPolicy: "terminate-on-authenticated-adoption"
    }),
    (() => {
      const line = {
        ...complete("partial-v3", 3, "7"),
        contentDigest: null,
        definitionStatus: "PARTIAL",
        sessionEligible: false,
        publicationEligible: false,
        newSessionPolicy: "forbid-incomplete",
        existingSessionPolicy: "terminate-on-authenticated-adoption",
        protectionProfileIds: [],
        blockers: ["ALG-core-v1-hybrid-ake"]
      };
      aliases.set("partial-v3", line);
      return line;
    })(),
    complete("retired-v4", 4, "5", {
      lifecycle: "Retired",
      sessionEligible: false,
      publicationEligible: false,
      newSessionPolicy: "forbid-retired",
      existingSessionPolicy: "terminate-on-authenticated-adoption"
    }),
    complete("deprecated-continue-v5", 5, "6", {
      lifecycle: "Deprecated",
      sessionEligible: false,
      publicationEligible: false,
      newSessionPolicy: "forbid-deprecated",
      existingSessionPolicy: "continue-authenticated"
    })
  ].sort((left, right) => lineIdentity(left).localeCompare(lineIdentity(right), "en"));

  aliases.set("unknown-v5", {
    wireId: "licoarc.unknown-line.v1",
    generation: 5,
    contentDigest: "8".repeat(64)
  });

  const protocolLines = structuredClone(lines);
  protocolLines.lines = records;
  const protectionProfiles = structuredClone(profiles);
  protectionProfiles.activeProfiles = [{
    profileId,
    generation: 1,
    minimumGeneration: 1,
    contentDigest: "b".repeat(64),
    lifecycle: "Candidate",
    definitionStatus: "COMPLETE",
    sessionEligible: true,
    publicationEligible: true,
    newSessionPolicy: "allow-authenticated",
    existingSessionPolicy: "continue-authenticated",
    authenticatedEffectiveGeneration: null,
    sourceManifestPath: "spec/v1/protection/source-manifest.json",
    requiredClaimIds: ["SEC-001"]
  }];
  return { protocolLines, protectionProfiles, aliases };
}

function supportStatement(lineRecords, minimumGeneration, authenticated) {
  return {
    authenticated,
    minimumGeneration,
    lines: lineRecords.map(supportEntry)
  };
}

function supportEntry(line) {
  return {
    wireId: line.wireId,
    generation: line.generation,
    contentDigest: line.contentDigest
  };
}

function lineIdentity(line) {
  return `${line.wireId}\u0000${line.generation}\u0000${line.contentDigest}`;
}
