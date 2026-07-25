# Fabrigent Entity And Configuration Layout

This document is the canonical map of the tracked entities that make up the
Fabrigent authority and the rules each location follows.

## Layout

| Path | Entity | Documented In |
| --- | --- | --- |
| `contracts/v1/` | Wire contract schemas (JSON Schema draft 2020-12) | [protocols/relay-envelope-v1.md](protocols/relay-envelope-v1.md) |
| `contracts/v2/` | Current wire contract schema | [protocols/relay-envelope-v2.md](protocols/relay-envelope-v2.md) |
| `policies/v1/` | Governance policy definitions | [protocols/relay-envelope-v1.md](protocols/relay-envelope-v1.md) |
| `policies/v2/` | Current governance policy definitions | [protocols/relay-envelope-v2.md](protocols/relay-envelope-v2.md) |
| `conformance/v1/`, `conformance/v2/` | Synthetic valid and invalid corpora | [functionality/artifact-and-conformance-verification.md](functionality/artifact-and-conformance-verification.md) |
| `artifacts/` | Immutable content-addressed bundles | [architecture/overview.md](architecture/overview.md) |
| `tools/` | Maintainer tooling (artifact generator) | [RUNBOOK.md](RUNBOOK.md) |
| `tests/` | Conformance and integrity tests | [RUNBOOK.md](RUNBOOK.md) |
| `docs/` | Formal documentation | [README.md](README.md) |

## Rules

- Version directories (`v1/`, `v2/`, and future lines) are the unit of immutability;
  see [COMPATIBILITY.md](COMPATIBILITY.md).
- Every JSON entity under `contracts/`, `policies/`, and `conformance/` is
  embedded verbatim into their bundle artifact. V2 and later digests also
  bind artifact interpretation metadata.
- Examples and fixtures contain only synthetic values.
- `docs/plans/`, `docs/reports/`, `cache/`, and `build/` are local-only and
  ignored; they must never contain tracked material.
