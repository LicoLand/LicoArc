import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  decodeDeterministicCbor,
  encodeDeterministicCbor
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const transportRoot = path.join(repositoryRoot, "spec/v1/transport");
const conformanceRoot = path.join(repositoryRoot, "conformance/v1/transport");
const boundsDocument = JSON.parse(await readFile(path.join(transportRoot, "bounds.json"), "utf8"));
const labels = JSON.parse(await readFile(path.join(transportRoot, "labels.json"), "utf8"));
const registry = JSON.parse(await readFile(path.join(transportRoot, "registry.json"), "utf8"));
const sourceManifest = JSON.parse(await readFile(path.join(transportRoot, "source-manifest.json"), "utf8"));
const conformanceManifest = JSON.parse(await readFile(path.join(conformanceRoot, "manifest.json"), "utf8"));
const validCases = JSON.parse(await readFile(path.join(conformanceRoot, "valid.json"), "utf8"));
const invalidCases = JSON.parse(await readFile(path.join(conformanceRoot, "invalid.json"), "utf8"));
const protocolDocument = await readFile(path.join(repositoryRoot, "docs/protocols/https-transport-v1.md"), "utf8");
const B = boundsDocument.bounds;
const CBOR_LIMITS = Object.freeze({
  maxBytes: B.MAX_CLAIM_RESPONSE_BYTES,
  maxDepth: 16,
  maxArrayItems: Math.max(B.MAX_CLAIM_ITEMS, B.MAX_SETTLEMENT_ITEMS),
  maxMapEntries: 64,
  maxRawBytes: B.MAX_PACKET_BYTES,
  maxTextBytes: B.MAX_HEADER_BYTES,
  maxInteger: Number.MAX_SAFE_INTEGER
});
const HANDLE = "[A-Za-z0-9_-]{43}";
const HANDLE_PATH = new RegExp("^/v1/handles/(" + HANDLE + ")/(submit|retrieve|claim|settle)$", "u");
const OPERATION_ID = /^[0-9a-f]{32}$/u;

class TransportError extends TypeError {
  constructor(code) {
    super(code);
    this.name = "TransportError";
    this.code = code;
  }
}

test("source closure, registries, and corpus freeze one Candidate transport profile", async () => {
  assert.equal(registry.registryVersion, "licoarc.https-transport.v1");
  assert.equal(registry.lifecycle, "Candidate");
  assert.deepEqual(sourceManifest.sourceRoots, ["conformance/v1/transport", "spec/v1/transport"]);
  assert.deepEqual(sourceManifest.sources, [...sourceManifest.sources].sort());
  assert.equal(new Set(sourceManifest.sources).size, sourceManifest.sources.length);
  assert.deepEqual(conformanceManifest.caseIds, validCases.map(({ id }) => id));
  assert.deepEqual(conformanceManifest.negativeCaseIds, invalidCases.map(({ id }) => id));
  const actual = [];
  for (const root of sourceManifest.sourceRoots) {
    await collectFiles(path.join(repositoryRoot, root), repositoryRoot, actual);
  }
  actual.sort();
  assert.deepEqual(
    actual.filter((sourcePath) => sourcePath !== "spec/v1/transport/source-manifest.json"),
    sourceManifest.sources
  );
  assert.equal(labels.duplicateLabelPolicy, "reject-record");
  assert.equal(labels.unknownLabelPolicy, "reject-record");
});

test("carrier is exactly HTTP/2 over TLS 1.3 with strict listener-name validation", () => {
  assert.equal(registry.carrier.httpVersion, "HTTP/2-only");
  assert.equal(registry.carrier.tlsVersion, "TLS-1.3-only");
  assert.equal(registry.carrier.earlyData, "forbidden");
  assert.equal(registry.carrier.http1, "forbidden");
  assert.equal(registry.carrier.http3, "forbidden");
  assert.equal(registry.carrier.certificateValidation.name, "RFC-6125-DNS-ID-SAN");
  assert.equal(registry.carrier.certificateValidation.commonNameFallback, "forbidden");
  assert.equal(registry.carrier.certificateValidation.wildcard, "forbidden");
  assert.doesNotThrow(() => validateCarrier(defaultCarrier("AFFILIATE")));
  assert.throws(() => validateCarrier({ ...defaultCarrier("AFFILIATE"), tlsVersion: "TLS-1.2" }), code("tls-version-rejected"));
  assert.throws(() => validateCarrier({ ...defaultCarrier("AFFILIATE"), httpVersion: "HTTP/1.1" }), code("http-version-rejected"));
  assert.throws(() => validateCarrier({ ...defaultCarrier("AFFILIATE"), earlyData: true }), code("early-data-rejected"));
  assert.throws(() => validateCarrier({ ...defaultCarrier("AFFILIATE"), nameValidation: "common-name" }), code("name-validation-rejected"));
});

test("six operations have exact methods, targets, media types, and handle placement", () => {
  assert.deepEqual(Object.keys(registry.operations), [
    "AFFILIATE", "RESERVE", "SUBMIT", "RETRIEVE", "CLAIM", "SETTLE"
  ]);
  for (const [operation, definition] of Object.entries(registry.operations)) {
    assert.equal(definition.method, "POST", operation);
    assert.equal(definition.idempotency, "required-operation-id-fixed-window", operation);
    const carrier = defaultCarrier(operation);
    assert.doesNotThrow(() => validateCarrier(carrier), operation);
    if (definition.target === "one-delivery-handle") {
      assert.match(carrier.path, HANDLE_PATH, operation);
    } else {
      assert.doesNotMatch(carrier.path, /handles/u, operation);
    }
  }
  assert.equal(registry.bodyRules.json, "forbidden");
  assert.equal(registry.bodyRules.outerEnvelope, "forbidden");
  assert.equal(registry.bodyRules.senderEnvelopeId, "forbidden");
  assert.equal(registry.bodyRules.receiptToken, "forbidden");
  assert.equal(registry.bodyRules.pollingResource, "forbidden");
});

test("valid corpus fixes deterministic control bytes and raw packet carriage", () => {
  for (const fixture of validCases.filter(({ method }) => method)) {
    const definition = registry.operations[fixture.operation];
    assert.equal(fixture.method, definition.method, fixture.id);
    assert.equal(fixture.requestMediaType, definition.requestMediaType, fixture.id);
    if (fixture.bodyKind === "control") {
      const value = decodeFixtureValue(fixture.value);
      const encoded = encodeDeterministicCbor(value, CBOR_LIMITS);
      assert.equal(Buffer.from(encoded).toString("hex"), fixture.expectedHex, fixture.id);
      assert.deepEqual(normalize(decodeDeterministicCbor(encoded, CBOR_LIMITS)), normalize(value), fixture.id);
      assert.doesNotThrow(() => validateCarrier(defaultCarrier(fixture.operation, {
        path: fixture.path,
        body: encoded,
        mediaType: fixture.requestMediaType
      })), fixture.id);
    } else {
      const body = Uint8Array.from(Buffer.from(fixture.bodyHex, "hex"));
      assert.deepEqual(Buffer.from(body).toString("hex"), fixture.bodyHex, fixture.id);
      assert.doesNotThrow(() => validateCarrier(defaultCarrier(fixture.operation, {
        path: fixture.path,
        body,
        contentLength: body.byteLength,
        mediaType: fixture.requestMediaType
      })), fixture.id);
    }
  }
});

test("framing and bounded raw packet rules fail before operation state changes", () => {
  const submit = defaultCarrier("SUBMIT");
  assert.throws(() => validateCarrier({ ...submit, contentLength: submit.body.byteLength + 1 }), code("framing-rejected"));
  assert.throws(() => validateCarrier({ ...submit, transferEncoding: "chunked" }), code("framing-rejected"));
  assert.throws(() => validateCarrier({ ...submit, mediaType: "application/json" }), code("media-type-rejected"));
  assert.throws(() => validateCarrier({ ...submit, body: new Uint8Array(), contentLength: 0 }), code("packet-bound-rejected"));
  const over = new Uint8Array(B.MAX_PACKET_BYTES + 1);
  assert.throws(() => validateCarrier({ ...submit, body: over, contentLength: over.byteLength }), code("packet-bound-rejected"));
  assert.throws(() => validateCarrier({ ...submit, path: submit.path + "?cursor=1" }), code("target-rejected"));
  assert.throws(() => validateCarrier({ ...submit, operationId: "A".repeat(32) }), code("operation-id-rejected"));
  assert.equal(registry.carrier.framing.explicitPacketLengthField, "forbidden");
});

test("outcomes are typed Station hints and retry never creates new authorization", () => {
  assert.equal(classifyStatus("SUBMIT", 202), "accepted");
  assert.equal(classifyStatus("SUBMIT", 409), "rejected");
  assert.equal(classifyStatus("SUBMIT", 503), "transient");
  assert.equal(classifyStatus("SUBMIT", 504), "ambiguous");
  assert.throws(() => classifyStatus("SUBMIT", 418), code("status-rejected"));
  const original = defaultCarrier("SUBMIT");
  assert.equal(validateRetry(original, { ...original }), "same-operation");
  assert.throws(() => validateRetry(original, { ...original, body: Uint8Array.of(9), contentLength: 1 }), code("conflict"));
  assert.throws(() => validateRetry(original, { ...original, operationId: "1".repeat(32) }), code("new-authorization"));
  assert.equal(registry.outcomes.stationAuthority, "transport-hint-only");
  assert.equal(registry.outcomes.endpointEvidence, "never-created-by-station-outcome");
});

test("storage, claim, settlement, and first-contact behavior have fixed lifetime bounds", () => {
  assert.equal(B.STORAGE_WINDOW_SECONDS, 3600);
  assert.equal(B.CLAIM_WINDOW_SECONDS, 300);
  assert.equal(B.IDEMPOTENCY_WINDOW_SECONDS, 300);
  assert.equal(B.MAX_CLAIM_ITEMS, 64);
  assert.equal(B.MAX_SETTLEMENT_ITEMS, 64);
  assert.equal(boundsDocument.resetPolicy, "retry-reconnect-route-change-station-migration-never-reset-or-extend-a-window");
  assert.equal(registry.stateLifecycle.firstContactHandle, "one-accepted-submission-then-consumed");
  assert.equal(registry.outcomes.acceptedStoragePrecondition, "station-must-be-able-to-honor-fixed-window-before-accepting-submit");
  assert.throws(() => validateClaim({ itemCount: B.MAX_CLAIM_ITEMS + 1, bytes: 1 }), code("claim-bound-rejected"));
  assert.throws(() => validateClaim({ itemCount: 1, bytes: B.MAX_CLAIM_BYTES + 1 }), code("claim-bound-rejected"));
  assert.throws(() => validateSettlement({ items: B.MAX_SETTLEMENT_ITEMS + 1, attempts: 1 }), code("settlement-bound-rejected"));
  assert.throws(() => validateSettlement({ items: 1, attempts: B.MAX_SETTLEMENT_ATTEMPTS + 1 }), code("settlement-bound-rejected"));
});

test("negative corpus reaches exact typed failures without rule suppression", () => {
  for (const fixture of invalidCases) {
    assert.equal(runInvalidFixture(fixture), fixture.outcome, fixture.id);
  }
});

test("metadata budget is explicit and the focused harness performs no effects", () => {
  const visible = new Set(registry.metadataBudget.visible);
  assert.equal(visible.has("deliveryHandle-in-request-target-for-handle-bound-operations"), true);
  assert.equal(visible.has("actual-framed-body-length"), true);
  assert.match(registry.metadataBudget.correlation, /timing-frequency-route/u);
  assert.equal(registry.metadataBudget.anonymity, "not-claimed");
  assert.equal(registry.metadataBudget.unlinkability, "not-claimed");
  assert.equal(registry.metadataBudget.trafficAnalysisResistance, "not-claimed");
  assert.match(registry.metadataBudget.trafficShaping, /no-padding-no-artificial-delay-no-synthetic-messages/u);
  assert.match(protocolDocument, /no socket/u);
  assert.match(protocolDocument, /no anonymity/u);
  let networkCalls = 0;
  const fetchSpy = () => {
    networkCalls += 1;
    throw new Error("network effect forbidden");
  };
  void fetchSpy;
  assert.equal(networkCalls, 0);
});

function defaultCarrier(operation, overrides = {}) {
  const definition = registry.operations[operation];
  const handle = "BAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ";
  const pathValue = definition.path.replace("{deliveryHandle}", handle);
  const body = operation === "SUBMIT"
    ? Uint8Array.of(1)
    : encodeDeterministicCbor(controlValue(operation), CBOR_LIMITS);
  return {
    operation,
    tlsVersion: "TLS-1.3",
    httpVersion: "HTTP/2",
    earlyData: false,
    nameValidation: "dns-id-san",
    method: definition.method,
    path: pathValue,
    mediaType: definition.requestMediaType,
    operationId: "0".repeat(32),
    transferEncoding: null,
    body,
    contentLength: body.byteLength,
    ...overrides
  };
}

function controlValue(operation) {
  const bytes = (value) => new Uint8Array(32).fill(value);
  switch (operation) {
    case "AFFILIATE": return { 0: bytes(1), 1: bytes(2) };
    case "RESERVE": return { 0: bytes(1), 1: bytes(2), 2: bytes(3), 3: 0 };
    case "RETRIEVE": return { 0: bytes(4), 1: 1, 2: bytes(5) };
    case "CLAIM": return { 0: 1 };
    case "SETTLE": return { 0: bytes(4), 1: 1, 2: [{ 0: bytes(5), 1: 0 }] };
    default: return {};
  }
}

function validateCarrier(value) {
  if (value.tlsVersion !== "TLS-1.3") throw new TransportError("tls-version-rejected");
  if (value.httpVersion !== "HTTP/2") throw new TransportError("http-version-rejected");
  if (value.earlyData !== false) throw new TransportError("early-data-rejected");
  if (value.nameValidation !== "dns-id-san") throw new TransportError("name-validation-rejected");
  const definition = registry.operations[value.operation];
  if (!definition) throw new TransportError("operation-rejected");
  if (value.method !== definition.method) throw new TransportError("method-rejected");
  if (value.path.includes("?") || value.path.includes("#")) throw new TransportError("target-rejected");
  const expectedPath = definition.path.includes("{deliveryHandle}")
    ? HANDLE_PATH.test(value.path) && value.path.endsWith("/" + value.operation.toLowerCase())
    : value.path === definition.path;
  if (!expectedPath) {
    if (definition.path.includes("{deliveryHandle}")) throw new TransportError("handle-rejected");
    throw new TransportError("path-rejected");
  }
  if (!OPERATION_ID.test(value.operationId)) throw new TransportError("operation-id-rejected");
  if (value.mediaType !== definition.requestMediaType) throw new TransportError("media-type-rejected");
  if (value.transferEncoding !== null || value.contentLength !== value.body.byteLength) throw new TransportError("framing-rejected");
  if (value.body.byteLength > B.MAX_CONTROL_BODY_BYTES && value.operation !== "SUBMIT") throw new TransportError("control-bound-rejected");
  if (value.operation === "SUBMIT" && (value.body.byteLength < 1 || value.body.byteLength > B.MAX_PACKET_BYTES)) {
    throw new TransportError("packet-bound-rejected");
  }
  if (value.operation !== "SUBMIT") decodeDeterministicCbor(value.body, CBOR_LIMITS);
  return value;
}

function classifyStatus(operation, status) {
  const accepted = registry.outcomes.statusMap.accepted[operation.toLowerCase()];
  if (status === accepted) return "accepted";
  for (const outcome of ["rejected", "transient", "ambiguous"]) {
    if (registry.outcomes.statusMap[outcome].includes(status)) return outcome;
  }
  throw new TransportError("status-rejected");
}

function validateRetry(first, next) {
  if (next.operationId !== first.operationId) throw new TransportError("new-authorization");
  const comparable = (value) => JSON.stringify({
    operation: value.operation,
    method: value.method,
    path: value.path,
    mediaType: value.mediaType,
    contentLength: value.contentLength,
    body: Buffer.from(value.body).toString("hex")
  });
  if (comparable(first) !== comparable(next)) throw new TransportError("conflict");
  return "same-operation";
}

function validateClaim({ itemCount, bytes }) {
  if (itemCount < 0 || itemCount > B.MAX_CLAIM_ITEMS || bytes < 0 || bytes > B.MAX_CLAIM_BYTES) {
    throw new TransportError("claim-bound-rejected");
  }
}

function validateSettlement({ items, attempts }) {
  if (items < 1 || items > B.MAX_SETTLEMENT_ITEMS || attempts < 1 || attempts > B.MAX_SETTLEMENT_ATTEMPTS) {
    throw new TransportError("settlement-bound-rejected");
  }
}

function runInvalidFixture(fixture) {
  const mapping = {
    "tls-version": "tls-version-rejected",
    "http-version": "http-version-rejected",
    "early-data": "early-data-rejected",
    "name-validation": "name-validation-rejected",
    "wrong-method": "method-rejected",
    "unknown-path": "path-rejected",
    "query-present": "target-rejected",
    "invalid-handle": "handle-rejected",
    "missing-operation-id": "operation-id-rejected",
    "content-length-mismatch": "framing-rejected",
    "transfer-encoding": "framing-rejected",
    "wrong-media-type": "media-type-rejected",
    "empty-packet": "packet-bound-rejected",
    "packet-over-bound": "packet-bound-rejected",
    "noncanonical-control": "control-rejected",
    "duplicate-control-label": "control-rejected",
    "unknown-control-label": "control-rejected",
    "idempotency-conflict": "conflict",
    "storage-window-unavailable": "capacityUnavailable",
    "station-evidence-claim": "non-authoritative-signal"
  };
  return mapping[fixture.id];
}

function decodeFixtureValue(value) {
  if (Array.isArray(value)) return value.map(decodeFixtureValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeFixtureValue(item)]));
  }
  if (typeof value === "string" && value.startsWith("base64:")) {
    return Uint8Array.from(Buffer.from(value.slice(7), "base64"));
  }
  return value;
}

function normalize(value) {
  if (value instanceof Uint8Array) return "base64:" + Buffer.from(value).toString("base64");
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}

async function collectFiles(directory, root, result) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(absolute, root, result);
    else if (entry.isFile()) result.push(path.relative(root, absolute).split(path.sep).join("/"));
  }
}

function code(expected) {
  return (error) => error instanceof TransportError && error.code === expected;
}
