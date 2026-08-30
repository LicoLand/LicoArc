import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const checkOnly = process.argv.includes('--check');
const templatePath = 'formal/licoarc-core-v1.spthy';
const generatedPath = 'formal/generated/licoarc-core-v1.spthy';
const bindingsPath = 'spec/v1/security/formal-bindings.json';

const semanticPaths = [
  'spec/protection-profiles.json',
  'spec/protocol-lines.json',
  'spec/v1/evidence/bounds.json',
  'spec/v1/evidence/checkpoint.schema.json',
  'spec/v1/evidence/identity-bundle.schema.json',
  'spec/v1/evidence/labels.json',
  'spec/v1/evidence/registry.json',
  'spec/v1/evidence/runtime.cddl',
  'spec/v1/evidence/source-manifest.json',
  'spec/v1/evidence/statement.schema.json',
  'spec/v1/identity/identity.policy.json',
  'spec/v1/identity/identity.schema.json',
  'spec/v1/identity/labels.json',
  'spec/v1/identity/registry.json',
  'spec/v1/identity/runtime.cddl',
  'spec/v1/identity/signature-profiles.json',
  'spec/v1/identity/source-manifest.json',
  'spec/v1/manifest.json',
  'spec/v1/protection/algorithms.json',
  'spec/v1/protection/bounds.json',
  'spec/v1/protection/domains.json',
  'spec/v1/protection/failures.json',
  'spec/v1/protection/handshake.schema.json',
  'spec/v1/protection/labels.json',
  'spec/v1/protection/prekey-bundle.schema.json',
  'spec/v1/protection/profile.json',
  'spec/v1/protection/record.schema.json',
  'spec/v1/protection/runtime.cddl',
  'spec/v1/protection/session-accept.schema.json',
  'spec/v1/protection/state.json',
  'spec/v1/protection/support.schema.json',
  'spec/v1/reliable/bounds.json',
  'spec/v1/reliable/confirmation.schema.json',
  'spec/v1/reliable/event.schema.json',
  'spec/v1/reliable/intent.schema.json',
  'spec/v1/reliable/labels.json',
  'spec/v1/reliable/registry.json',
  'spec/v1/reliable/runtime.cddl',
  'spec/v1/reliable/source-manifest.json',
  'spec/v1/reliable/state.schema.json',
  'spec/v1/transport/bounds.json',
  'spec/v1/transport/labels.json',
  'spec/v1/transport/registry.json',
  'spec/v1/transport/request.schema.json',
  'spec/v1/transport/response.schema.json',
  'spec/v1/transport/runtime.cddl',
  'spec/v1/transport/source-manifest.json',
];

const claimProofs = new Map([
  ['SEC-001', 'SEC_001_hybrid_ake_key_secrecy'],
  ['SEC-002', 'SEC_002_mutual_endpoint_authentication'],
  ['SEC-003', 'SEC_003_classical_pq_hybrid_robustness'],
  ['SEC-004', 'SEC_004_unknown_key_share_resistance'],
  ['SEC-005', 'SEC_005_key_compromise_impersonation_boundary'],
  ['SEC-006', 'SEC_006_protocol_line_downgrade_resistance'],
  ['SEC-007', 'SEC_007_protection_profile_downgrade_resistance'],
  ['SEC-008', 'SEC_008_session_independence'],
  ['SEC-009', 'SEC_009_initial_forward_secrecy'],
  ['SEC-010', 'SEC_010_double_ratchet_forward_secrecy'],
  ['SEC-011', 'SEC_011_double_ratchet_post_compromise_recovery'],
  ['SEC-012', 'SEC_012_replay_resistance'],
  ['SEC-013', 'SEC_013_state_rollback_resistance'],
  ['SEC-014', 'SEC_014_identity_continuity'],
  ['SEC-015', 'SEC_015_route_migration_safety'],
  ['SEC-016', 'SEC_016_evidence_unforgeability'],
  ['SEC-017', 'SEC_017_evidence_identity_attribution'],
  ['SEC-018', 'SEC_018_station_cannot_manufacture_endpoint_accepted'],
  ['SEC-019', 'SEC_019_station_cannot_manufacture_effect_completed'],
  ['SEC-020', 'SEC_020_fail_closed_resource_bounds'],
  ['SEC-021', 'SEC_021_pairwise_record_confidentiality'],
  ['SEC-022', 'SEC_022_pairwise_record_authentication_and_integrity'],
  ['SEC-023', 'SEC_023_sender_metadata_confidentiality'],
]);
const bindingAuthorities = [
  ['protocol-line-id', 'spec/protocol-lines.json', '/lines/0/protocolLineId'],
  ['profile-id', 'spec/protection-profiles.json', '/profiles/0/profileId'],
  ['algorithm-id', 'spec/v1/protection/algorithms.json', '/primitives'],
  ['domain-separator', 'spec/v1/protection/domains.json', '/domains'],
  ['field-label', 'spec/v1/protection/labels.json', '/ratchetHeader'],
  ['bound', 'spec/v1/protection/bounds.json', '/bounds'],
  ['failure-enum', 'spec/v1/protection/failures.json', '/failures'],
];
const bindingPlan = [...claimProofs].flatMap(([claimId, proofLemma]) =>
  bindingAuthorities.map(([kind, authorityPath, pointer]) =>
    [claimId, kind, authorityPath, pointer, proofLemma]));

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function bytes(path) {
  return readFile(resolve(root, path));
}

function pointerValue(value, pointer) {
  return pointer.split('/').slice(1).reduce((current, token) => {
    const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
    if (current === null || current === undefined || !(key in current)) {
      throw new Error(`FORMAL_BINDING_POINTER_MISSING:${pointer}`);
    }
    return current[key];
  }, value);
}

const sourceDigests = new Map();
for (const path of [...new Set([...semanticPaths, ...bindingPlan.map((entry) => entry[2])])].sort()) {
  sourceDigests.set(path, sha256(await bytes(path)));
}

const aggregate = createHash('sha256');
for (const path of semanticPaths) {
  const content = await bytes(path);
  aggregate.update(`${path}\0${content.length}\0`);
  aggregate.update(content);
}
const bindingDigest = aggregate.digest('hex');
const macroBlock = `/* generated semantic-source binding: ${bindingDigest} */`;

const protocolLineCatalog = JSON.parse(await readFile(resolve(root, 'spec/protocol-lines.json'), 'utf8'));
const protectionProfileCatalog = JSON.parse(await readFile(resolve(root, 'spec/protection-profiles.json'), 'utf8'));
const activeLines = protocolLineCatalog.lines.filter((line) => line.sessionEligible === true);
const activeProfiles = protectionProfileCatalog.profiles.filter((profile) =>
  profile.profileId !== null && protectionProfileCatalog.activeProfileIds.includes(profile.profileId));
if (activeLines.length !== 1 || activeProfiles.length !== 1 ||
    !/^[0-9a-f]{64}$/u.test(activeLines[0].protocolLineId) ||
    !/^[0-9a-f]{64}$/u.test(activeProfiles[0].profileId)) {
  throw new Error('FORMAL_ACTIVE_CONTENT_IDENTITY_SET_INVALID');
}

const template = await readFile(resolve(root, templatePath), 'utf8');
if ((template.match(/\/\* @generated-bindings \*\//g) ?? []).length !== 1) {
  throw new Error('FORMAL_TEMPLATE_MARKER_INVALID');
}
const generatedTheory = template
  .replace('/* @generated-bindings */', macroBlock)
  .replaceAll('PROTOCOL_LINE_CONSTANT', `'${activeLines[0].protocolLineId}'`)
  .replaceAll('PROFILE_CONSTANT', `'${activeProfiles[0].profileId}'`)
  .replaceAll('BINDING_DIGEST_CONSTANT', `'${bindingDigest}'`);

const bindings = [];
for (const [claimId, kind, authorityPath, pointer, proofLemma] of bindingPlan) {
  const authority = JSON.parse(await readFile(resolve(root, authorityPath), 'utf8'));
  const value = pointerValue(authority, pointer);
  const valueDigest = sha256(Buffer.from(JSON.stringify(value)));
  const suffix = `${claimId}-${kind}-${bindings.filter((binding) => binding.claimId === claimId && binding.kind === kind).length + 1}`.toUpperCase();
  bindings.push({
    bindingId: `BIND-${suffix}`,
    claimId,
    kind,
    authorityPath,
    authorityPointer: pointer,
    authorityDigest: sourceDigests.get(authorityPath),
    authorityValueDigest: valueDigest,
    proofModel: generatedPath,
    proofLemma,
  });
}

const registry = {
  $schema: 'https://licoarc.com/spec/schemas/security-formal-bindings.schema.json',
  $id: 'https://licoarc.com/spec/v1/security/formal-bindings.json',
  registryVersion: 'licoarc.formal-bindings.v1',
  lifecycle: 'Candidate',
  status: 'complete',
  requiredKinds: ['protocol-line-id', 'profile-id', 'algorithm-id', 'domain-separator', 'field-label', 'bound', 'failure-enum'],
  semanticSourceDigest: bindingDigest,
  semanticSources: semanticPaths,
  bindings: bindings.sort((left, right) => left.bindingId.localeCompare(right.bindingId)),
  authority: 'generated-only-from-decided-specified-normative-sources',
  missingBindingPolicy: 'claim-remains-unproved-and-line-ineligible',
  modelAuthority: 'never-a-second-protocol',
};
const generatedRegistry = `${JSON.stringify(registry, null, 2)}\n`;

async function writeOrCheck(path, expected) {
  const absolute = resolve(root, path);
  if (checkOnly) {
    let actual;
    try {
      actual = await readFile(absolute, 'utf8');
    } catch {
      throw new Error(`FORMAL_GENERATED_MISSING:${path}`);
    }
    if (actual !== expected) throw new Error(`FORMAL_GENERATED_STALE:${path}`);
    return;
  }
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, expected, 'utf8');
}

await writeOrCheck(generatedPath, generatedTheory);
await writeOrCheck(bindingsPath, generatedRegistry);
process.stdout.write(`formal bindings ${checkOnly ? 'current' : 'generated'}: ${bindings.length}\n`);
