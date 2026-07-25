# Fabrigent Compatibility Policy

## Versioning Model

Fabrigent publishes versioned contract lines. Each line lives in matching
`contracts/`, `policies/`, and `conformance/` version directories and is
bundled into an immutable, content-addressed artifact. The current wire
contract identifies itself as `fabrigent.relay.v2`; the published
`fabrigent.relay.v1` artifact remains available unchanged.

## Rules

- A published version directory is immutable. Corrections and extensions
  ship as a new version.
- Implementations pin an exact artifact and verify its `digest` before
  relying on its contents. In `v2`, SHA-256 binds the canonical
  `artifactVersion`, `digestAlgorithm`, and embedded sources. The immutable
  `v1` digest binds its embedded sources as originally published.
- Consumers must treat `additionalProperties: false` as normative: an
  envelope with unknown fields is non-conformant.
- The governance policy's required capabilities are the minimum a conformant
  relay deployment supports; the forbidden capabilities must never appear.

## Compatibility Guarantees

- Within a version line, the schema, policy, and corpus never change; the
  artifact digest is the integrity proof.
- Across versions, no wire-level compatibility is implied. Consumers migrate
  explicitly and reject any contract version they did not pin.

## Toolchain

The generator and tests require Node.js 22 or newer, as declared in
[../package.json](../package.json). The toolchain is a maintainer concern
only; consumers need only the artifact JSON.
