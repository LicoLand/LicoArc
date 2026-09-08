import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const contract = JSON.parse(await readFile(resolve(root, 'formal/runtime.json'), 'utf8'));
const cliArguments = process.argv.slice(2);
const engineArgument = cliArguments.find((argument) => argument.startsWith('--engine='));
const engine = engineArgument?.slice('--engine='.length) ?? contract.engineDefault;
const action = cliArguments.find((argument) => !argument.startsWith('--'));

if (!contract.engineAlternatives.includes(engine)) fail('FORMAL_ENGINE_UNSUPPORTED');
if (!['build', 'version', 'prove', 'replay'].includes(action)) fail('FORMAL_ACTION_UNSUPPORTED');

function fail(code, detail = '') {
  process.stderr.write(`${code}${detail ? `:${detail}` : ''}\n`);
  process.exit(1);
}

function run(arguments_, options = {}) {
  const result = spawnSync(engine, arguments_, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    ...options,
  });
  if (result.error?.code === 'ENOENT') fail('FORMAL_ENGINE_UNAVAILABLE', engine);
  if (result.error) fail('FORMAL_ENGINE_FAILURE');
  return result;
}

if (action === 'build') {
  const result = run([
    'build', '--platform', contract.platform,
    '--tag', contract.imageTag,
    '--file', 'formal/Dockerfile', '.',
  ], { stdio: 'inherit', encoding: undefined });
  if (result.status !== 0) fail('FORMAL_IMAGE_BUILD_FAILED');
  process.exit(0);
}

const inspection = run(['image', 'inspect', contract.imageTag, '--format', '{{json .}}']);
if (inspection.status !== 0) fail('FORMAL_IMAGE_UNAVAILABLE', 'run-formal-build');
let image;
try {
  image = JSON.parse(inspection.stdout.trim());
} catch {
  fail('FORMAL_IMAGE_INSPECTION_INVALID');
}
if (image.Architecture !== 'amd64' || image.Os !== 'linux') fail('FORMAL_IMAGE_PLATFORM_MISMATCH');
if (image.Id !== contract.imageDigest) fail('FORMAL_IMAGE_DIGEST_MISMATCH');
if (image.Config?.Labels?.['org.opencontainers.image.version'] !== contract.tamarin.version) fail('FORMAL_IMAGE_VERSION_LABEL_MISMATCH');
if (image.Config?.Labels?.['org.opencontainers.image.revision'] !== contract.tamarin.sourceCommit) fail('FORMAL_IMAGE_SOURCE_LABEL_MISMATCH');

function container(arguments_) {
  return run([
    'run', '--rm', '--platform', contract.platform,
    '--network', contract.execution.network,
    '--read-only',
    '--env', `LANG=${contract.execution.locale}`,
    '--env', `LC_ALL=${contract.execution.locale}`,
    '--mount', `type=bind,src=${root},dst=/work`,
    contract.imageDigest,
    ...arguments_,
  ]);
}

if (action === 'version') {
  const result = container(['--version']);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const inputArgument = cliArguments.find((argument) => argument.startsWith('--input='));
const outputArgument = cliArguments.find((argument) => argument.startsWith('--output='));
if (!inputArgument) fail('FORMAL_INPUT_REQUIRED');
const input = inputArgument.slice('--input='.length);
const arguments_ = ['--prove', `--heuristic=${contract.execution.heuristic}`];
if (outputArgument) arguments_.push(`--output=/work/${outputArgument.slice('--output='.length)}`);
arguments_.push(`/work/${input}`, '+RTS', `-N${contract.execution.threads}`, '-RTS');
const result = container(arguments_);
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
