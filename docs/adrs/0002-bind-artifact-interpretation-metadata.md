# ADR 0002: Bind Artifact Interpretation Metadata

## Status

Implemented.

## Decision

Starting with `fabrigent.bundle.v2`, the content digest binds the canonical
serialization of `artifactVersion`, `digestAlgorithm`, and `sources`.
Consumers verify all three fields against an exact external pin before
interpreting the embedded contract or policy.

The published `fabrigent.bundle.v1` bytes and digest remain immutable. This
security strengthening ships as a new version rather than changing the
meaning of its existing digest.

## Consequences

- Metadata substitution changes the v2 digest and fails pin verification.
- Consumers migrate explicitly from `fabrigent.relay.v1` to
  `fabrigent.relay.v2`; no compatibility fallback is provided.
- The generator and conformance suite continue verifying both immutable
  artifact lines.
