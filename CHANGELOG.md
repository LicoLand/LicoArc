# Changelog

All notable definition-source changes are recorded here. A changelog entry is
not publication, implementation, interoperability, audit, deployment, support,
or operation evidence.

## Unreleased

### Changed

- Define the unreleased `licoarc.protocol-line.v1` as V1 / Generation 1
  and all eight mandatory capabilities: Protocol Foundation, Identity, Pairwise Protection,
  Generic Messaging, Reliable Exchange, HTTPS Transport, Group Collaboration,
  and Federation Governance.
- Add a self-certifying, predecessor-bound user authority chain with explicit
  management and recovery transitions, bounded independently proven Endpoint
  devices, atomic recovery replacement, and explicit fork rejection.
- Bind both Endpoint-state digests and their sibling user-authority-state
  digests into pairwise establishment while keeping authority snapshots
  acyclic and local peer trust unchanged.
- Make exact protected Endpoint confirmations the only authority for Reliable
  Exchange acceptance and effect finality, including attachment and Group
  completion rules. Station results remain transport hints.
- Admit the indivisible `stable-core` Protection Profile with paired X25519 and
  ML-KEM-768 one-time prekeys, dual Ed25519 and ML-DSA-65 authentication,
  fixed transcript-bound admission and confirmation, and bounded X25519 Double
  Ratchet semantics.
- Bind Profile and Protocol Line identities to named non-circular semantic
  projections; exclude lifecycle, publication state, proof-tool output, and
  artifact metadata from semantic identity.
- Close source-owned security accounting, formal proof bindings, mandatory
  capability/Profile conformance corpora, deterministic generation, and
  content-identity verification.
- Set the current machine projection to `Candidate` / `COMPLETE`,
  `sessionEligible: true`, and `publicationEligible: false`.
- Synchronize the English and Simplified Chinese public projections and the
  formal status, lifecycle, architecture, product, and protocol documents.
- Adopt Apache-2.0 for the source publication candidate and synchronize the
  package metadata, README license sections, contribution terms, and changelog.

### Boundary

The repository completes only implementation-neutral definition and
source-integrity verification. Publication and every downstream execution or
delivery claim remain independent.
