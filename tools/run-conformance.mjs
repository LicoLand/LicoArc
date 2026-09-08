import process from "node:process";
import { runConformanceRepository } from "./conformance/index.mjs";

const MAX_REPORTED_FAILURES = 64;

try {
  const seed = parseSeed(process.argv.slice(2));
  const report = await runConformanceRepository(seed === undefined ? {} : { seed });
  const failures = report.results
    .filter(({ status }) => status === "failed")
    .slice(0, MAX_REPORTED_FAILURES)
    .map(({ id, operationId }) => ({ id, operationId }));
  const failureCount = report.results.length - report.results.filter(({ status }) => status === "passed").length;
  writeResult({
    status: report.status,
    caseCount: report.caseCount,
    operationCount: report.operationIds.length,
    failureCount,
    reportedFailureCount: failures.length,
    primarySeedDigest: report.primarySeedDigest,
    alternateSeedDigest: report.alternateSeedDigest,
    failures
  });
  if (report.status !== "passed") process.exitCode = 1;
} catch (error) {
  writeResult({
    status: "error",
    code: typeof error?.code === "string" ? error.code : "conformance-runner-failure"
  });
  process.exitCode = 1;
}

function parseSeed(arguments_) {
  if (arguments_.length === 0) return undefined;
  if (arguments_.length !== 1 || !arguments_[0].startsWith("--seed=")) {
    throw runnerError("invalid-conformance-arguments");
  }
  const seed = arguments_[0].slice("--seed=".length);
  if (seed.length === 0 || Buffer.byteLength(seed, "utf8") > 256) {
    throw runnerError("invalid-order-seed");
  }
  return seed;
}

function writeResult(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function runnerError(code) {
  return Object.assign(new TypeError(code), { code });
}
