# Artifact And Conformance Verification

This document describes the implemented verification behavior of the
repository. The executable authorities are
[../../tools/generate-artifact.mjs](../../tools/generate-artifact.mjs) and
[../../tests/conformance.test.mjs](../../tests/conformance.test.mjs).

## Artifact Integrity

`npm run artifacts:check` regenerates both tracked bundles in memory and
fails if either immutable artifact differs. The test suite additionally
re-derives the v1 source digest and the v2 digest over artifact version,
digest algorithm, and embedded `sources`.

## Conformance Corpus

The corpus is synthetic:

- `conformance/v2/valid.json` lists envelopes that must conform.
- `conformance/v2/invalid.json` lists named negative cases — currently a
  forbidden `plaintext` field and a missing `ciphertext` — that must not
  conform.

The test harness evaluates each case against the complete embedded schema:
object shape, required and unknown fields, contract version, opaque
identifier patterns, ciphertext length, and RFC 3339 date-time syntax.

## Policy Guardrails

A dedicated test asserts the trust model, forbidden capabilities, and every
positive bounded v2 limit, keeping relays outside encryption and host
authority while bounding retained work.

## Commands

| Command | Behavior |
| --- | --- |
| `npm run artifacts:generate` | Rewrite all bundles from canonical sources |
| `npm run artifacts:check` | Fail if any tracked bundle is stale |
| `npm test` | Run the conformance and integrity tests |
| `npm run verify` | Artifact check plus tests |
