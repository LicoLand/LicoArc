import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const legacyArtifact = JSON.parse(
  await readFile(new URL("../artifacts/fabrigent-v1.json", import.meta.url), "utf8")
);
const artifact = JSON.parse(
  await readFile(new URL("../artifacts/fabrigent-v2.json", import.meta.url), "utf8")
);
const schema = artifact.sources["contracts/v2/relay-envelope.schema.json"];
const policy = artifact.sources["policies/v2/relay-governance.json"];
const valid = artifact.sources["conformance/v2/valid.json"];
const invalid = artifact.sources["conformance/v2/invalid.json"];

function conforms(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const required = schema.required.every((key) => Object.hasOwn(value, key));
  const onlyKnown = Object.keys(value).every((key) => Object.hasOwn(schema.properties, key));
  return required &&
    onlyKnown &&
    value.contractVersion === "fabrigent.relay.v2" &&
    typeof value.envelopeId === "string" &&
    new RegExp(schema.properties.envelopeId.pattern, "u").test(value.envelopeId) &&
    typeof value.mailboxId === "string" &&
    new RegExp(schema.properties.mailboxId.pattern, "u").test(value.mailboxId) &&
    typeof value.ciphertext === "string" &&
    [...value.ciphertext].length >= schema.properties.ciphertext.minLength &&
    [...value.ciphertext].length <= schema.properties.ciphertext.maxLength &&
    isRfc3339DateTime(value.expiresAt);
}

function isRfc3339DateTime(value) {
  if (typeof value !== "string") return false;
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})[Tt](?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.\d+)?(?<zone>[Zz]|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return false;
  const fields = Object.fromEntries(
    ["year", "month", "day", "hour", "minute", "second"]
      .map((name) => [name, Number(match.groups[name])])
  );
  const leapYear = fields.year % 4 === 0 &&
    (fields.year % 100 !== 0 || fields.year % 400 === 0);
  const daysInMonth = [
    31, leapYear ? 29 : 28, 31, 30, 31, 30,
    31, 31, 30, 31, 30, 31
  ][fields.month - 1];
  if (fields.month < 1 || fields.month > 12 ||
      fields.day < 1 || fields.day > daysInMonth ||
      fields.hour > 23 || fields.minute > 59 || fields.second > 59) {
    return false;
  }
  if (match.groups.zone !== "Z" && match.groups.zone !== "z") {
    const [offsetHour, offsetMinute] = match.groups.zone.slice(1).split(":").map(Number);
    if (offsetHour > 23 || offsetMinute > 59) return false;
  }
  return Number.isFinite(Date.parse(value));
}

test("artifact digest binds metadata and every canonical source", () => {
  const canonical = `${JSON.stringify({
    artifactVersion: artifact.artifactVersion,
    digestAlgorithm: artifact.digestAlgorithm,
    sources: artifact.sources
  })}\n`;
  const digest = createHash("sha256").update(canonical).digest("hex");
  assert.equal(artifact.artifactVersion, "fabrigent.bundle.v2");
  assert.equal(artifact.digestAlgorithm, "sha256");
  assert.equal(artifact.digest, digest);
});

test("published v1 artifact remains immutable", () => {
  const canonical = `${JSON.stringify(legacyArtifact.sources)}\n`;
  assert.equal(legacyArtifact.artifactVersion, "fabrigent.bundle.v1");
  assert.equal(legacyArtifact.digestAlgorithm, "sha256");
  assert.equal(
    createHash("sha256").update(canonical).digest("hex"),
    "bf63cd32b9e24ac1c079ffd5b853e797cdd505c05e0defd4149a9207e2da4697"
  );
  assert.equal(
    legacyArtifact.digest,
    "bf63cd32b9e24ac1c079ffd5b853e797cdd505c05e0defd4149a9207e2da4697"
  );
});

test("conformance corpus accepts valid and rejects invalid examples", () => {
  assert.ok(valid.every(conforms));
  assert.ok(invalid.every(({ value }) => !conforms(value)));
});

test("governance keeps relays outside encryption and host authority", () => {
  assert.equal(policy.trustModel, "relay-is-untrusted");
  assert.ok(policy.forbiddenCapabilities.includes("encryption"));
  assert.ok(policy.forbiddenCapabilities.includes("client-key-custody"));
  assert.ok(policy.forbiddenCapabilities.includes("host-permission-authority"));
  for (const limit of [
    "maxCiphertextBytes",
    "maxEnvelopeRetentionSeconds",
    "maxLeaseSeconds",
    "maxMailboxEnvelopes",
    "maxMailboxes",
    "maxRelayEnvelopes"
  ]) {
    assert.ok(Number.isSafeInteger(policy.limits[limit]));
    assert.ok(policy.limits[limit] > 0);
  }
});

test("schema validation enforces every relay-envelope field boundary", () => {
  const base = valid[0];
  assert.equal(conforms(null), false);
  assert.equal(conforms([]), false);
  assert.equal(conforms({ ...base, envelopeId: "short" }), false);
  assert.equal(conforms({ ...base, mailboxId: "contains.invalid.characters" }), false);
  assert.equal(conforms({ ...base, ciphertext: "" }), false);
  assert.equal(conforms({
    ...base,
    ciphertext: "x".repeat(schema.properties.ciphertext.maxLength + 1)
  }), false);
  assert.equal(conforms({ ...base, expiresAt: "2030-02-30T00:00:00Z" }), false);
  assert.equal(conforms({ ...base, expiresAt: "not-a-date" }), false);
});
