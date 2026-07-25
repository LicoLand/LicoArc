# Changelog

All notable changes to Fabrigent's contracts, policies, conformance corpora,
and artifacts are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/). Published contract lines are
immutable; this file records repository-level change history.

## [Unreleased]

### Security

- Add the immutable v2 artifact line, binding interpretation metadata into
  its content digest and requiring bounded envelope retention, relay mailbox
  count, and relay-wide envelope count in its governance policy.
- Validate every relay-envelope schema field in the conformance harness,
  including opaque identifiers, ciphertext size, and RFC 3339 date-times.

### Added

- Required public documentation set: product definition, contributing guide,
  code of conduct, security policy, and a formal `docs/` tree covering
  architecture, functionality, protocol, examples, runbook, compatibility,
  entity layout, and decision records.
- Local-only asset boundaries: `docs/plans/`, `docs/reports/`, `cache/`, and
  `build/` are ignored and must never be tracked.

## [0.1.0] - 2026-07-25

### Added

- Initial `v1` federation contract line: the opaque relay envelope schema
  `fabrigent.relay.v1` (`contracts/v1/relay-envelope.schema.json`).
- Relay governance policy `fabrigent.relay-governance.v1` with required and
  forbidden capabilities and envelope limits
  (`policies/v1/relay-governance.json`).
- Synthetic valid and invalid conformance corpora (`conformance/v1/`).
- Content-addressed bundle artifact `artifacts/fabrigent-v1.json` with a
  SHA-256 digest over the canonical sources.
- Artifact generator and checker (`tools/generate-artifact.mjs`), npm
  verification scripts, and the conformance test suite.
