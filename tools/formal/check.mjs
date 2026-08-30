import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const engineArgument = process.argv.find((argument) => argument.startsWith('--engine='));
const engine = engineArgument ?? '--engine=docker';
const runtime = JSON.parse(await readFile(resolve(root, 'formal/runtime.json'), 'utf8'));
const securityRegistryPath = resolve(root, 'spec/v1/security/registry.json');
run('tools/formal/generate.mjs', []);
const bindings = JSON.parse(await readFile(resolve(root, 'spec/v1/security/formal-bindings.json'), 'utf8'));
const claims = JSON.parse(await readFile(resolve(root, 'spec/v1/security/claims.json'), 'utf8'));
const provedClaims = [...new Map(bindings.bindings.map((binding) => [binding.claimId, binding.proofLemma]))];
const lemmaNames = [
  'executable_honest_handshake',
  'executable_ratchet_evolution',
  'executable_identity_and_route',
  'executable_evidence',
  'executable_reliable_and_metadata',
  'executable_resource_bounds',
  ...provedClaims.map(([, lemma]) => lemma),
];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function pointerValue(value, pointer) {
  return pointer.split('/').slice(1).reduce((current, token) => {
    const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
    if (current === null || current === undefined || !(key in current)) {
      throw new Error('FORMAL_BINDING_POINTER_MISSING');
    }
    return current[key];
  }, value);
}

function run(script, arguments_) {
  const result = spawnSync(process.execPath, [resolve(root, script), ...arguments_], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw new Error('FORMAL_PROCESS_FAILURE');
  if (result.status !== 0) {
    const code = result.stderr.trim().split('\n').find((line) => line.startsWith('FORMAL_'));
    throw new Error(code ?? 'FORMAL_PROVER_FAILED');
  }
  return result.stdout;
}

const versionOutput = run('tools/formal/runtime.mjs', ['version', engine]);
if (!versionOutput.includes(`tamarin-prover ${runtime.tamarin.version}`)) {
  throw new Error('FORMAL_PROVER_VERSION_MISMATCH');
}

const generatedPath = 'formal/generated/licoarc-core-v1.spthy';
const provedPath = 'formal/proofs/licoarc-core-v1.proved.spthy';
const firstPass = run('tools/formal/runtime.mjs', [
  'prove', engine, `--input=${generatedPath}`, `--output=${provedPath}`,
]);
const rawProvedTheory = await readFile(resolve(root, provedPath), 'utf8');
const generatedFooter = rawProvedTheory.lastIndexOf('\n/*\nGenerated from:\n');
const generatedClose = rawProvedTheory.indexOf('\n*/\n\nend', generatedFooter);
if (generatedFooter < 0 || generatedClose < 0 ||
    rawProvedTheory.slice(generatedClose + '\n*/\n\nend'.length).trim() !== '') {
  throw new Error('FORMAL_PROVED_THEORY_FOOTER_INVALID');
}
const canonicalProvedTheory = `${rawProvedTheory.slice(0, generatedFooter)}\nend\n`;
await writeFile(resolve(root, provedPath), canonicalProvedTheory, 'utf8');
const replay = run('tools/formal/runtime.mjs', ['replay', engine, `--input=${provedPath}`]);
const provedTheory = await readFile(resolve(root, provedPath), 'utf8');
const proofSummaryLines = `${firstPass}\n${replay}`.split('\n');

if (/\bsorry\b/.test(provedTheory)) throw new Error('FORMAL_PROOF_CONTAINS_SORRY');
for (const lemma of lemmaNames) {
  const inTheory = new RegExp(`lemma\\s+${lemma}:`).test(provedTheory);
  const verified = proofSummaryLines.some((line) => line.includes(lemma) && line.includes('verified'));
  if (!inTheory) throw new Error(`FORMAL_LEMMA_MISSING:${lemma}`);
  if (!verified) throw new Error(`FORMAL_LEMMA_NOT_VERIFIED:${lemma}`);
}

for (const binding of bindings.bindings) {
  const authority = await readFile(resolve(root, binding.authorityPath));
  if (sha256(authority) !== binding.authorityDigest) {
    throw new Error(`FORMAL_BINDING_DIGEST_MISMATCH:${binding.bindingId}`);
  }
  if (!lemmaNames.includes(binding.proofLemma)) {
    throw new Error(`FORMAL_BINDING_LEMMA_UNKNOWN:${binding.bindingId}`);
  }
  const authorityDocument = JSON.parse(authority.toString('utf8'));
  const valueDigest = sha256(Buffer.from(JSON.stringify(pointerValue(authorityDocument, binding.authorityPointer))));
  if (valueDigest !== binding.authorityValueDigest) {
    throw new Error(`FORMAL_BINDING_VALUE_MISMATCH:${binding.bindingId}`);
  }
}

const boundKinds = new Set(bindings.bindings.map((binding) => binding.kind));
for (const kind of bindings.requiredKinds) {
  if (!boundKinds.has(kind)) throw new Error(`FORMAL_BINDING_KIND_MISSING:${kind}`);
}
for (const [claimId, lemma] of provedClaims) {
  const claim = claims.claims.find((candidate) => candidate.id === claimId);
  if (!claim) throw new Error(`FORMAL_CLAIM_MISSING:${claimId}`);
  if (claim.status !== 'proved' || claim.proofLemma !== lemma || claim.proofModel !== generatedPath) {
    throw new Error(`FORMAL_CLAIM_NOT_BOUND:${claimId}`);
  }
}
for (const claim of claims.claims.filter((candidate) => candidate.status === 'proved')) {
  if (!provedClaims.some(([claimId]) => claimId === claim.id)) {
    throw new Error(`FORMAL_PROVED_CLAIM_UNBOUND:${claim.id}`);
  }
}

const evidence = {
  evidenceVersion: 'licoarc.tamarin-proof-evidence.v1',
  prover: `tamarin-prover-${runtime.tamarin.version}`,
  sourceCommit: runtime.tamarin.sourceCommit,
  platform: runtime.platform,
  imageDigest: runtime.imageDigest,
  baseImageDigest: runtime.baseImage.split('@')[1],
  runtimeContractDigest: sha256(await readFile(resolve(root, 'formal/runtime.json'))),
  generatedTheoryDigest: sha256(await readFile(resolve(root, generatedPath))),
  provedTheoryDigest: sha256(Buffer.from(provedTheory)),
  formalBindingsDigest: sha256(await readFile(resolve(root, 'spec/v1/security/formal-bindings.json'))),
  semanticSourceDigest: bindings.semanticSourceDigest,
  execution: {
    locale: runtime.execution.locale,
    heuristic: runtime.execution.heuristic,
    threads: runtime.execution.threads,
    network: runtime.execution.network,
    arguments: runtime.execution.arguments,
  },
  replay: 'verified',
  lemmas: lemmaNames.map((name) => ({ name, result: 'verified' })),
};
const evidenceBytes = `${JSON.stringify(evidence, null, 2)}\n`;
await writeFile(resolve(root, 'formal/evidence.json'), evidenceBytes, 'utf8');
const securityRegistry = JSON.parse(await readFile(securityRegistryPath, 'utf8'));
securityRegistry.proofEvidenceDigest = sha256(Buffer.from(evidenceBytes));
await writeFile(securityRegistryPath, `${JSON.stringify(securityRegistry, null, 2)}\n`, 'utf8');
process.stdout.write(`formal proof replay verified: ${lemmaNames.length} lemmas\n`);
