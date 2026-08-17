# Security Policy

Lico Arc Protocol defines candidate protocol contracts and governance policy.
Security reports are handled as operational facts, not public claims.

## Supported State

The repository is in its initial `v1` contract line. Security fixes target
the current candidate definition on `main`. The Protocol Line lifecycle
defines immutability for Published artifact bytes; publication-channel status
is downstream and is not reported by this repository. A correction to
Published bytes requires a new definition version rather than an in-place
patch.

## Reporting A Vulnerability

Do not report vulnerabilities through public issues.

Use the repository host's private vulnerability reporting at
<https://github.com/LicoLand/LicoArc/security>. Include enough technical
evidence for triage:

- the affected contract, policy, corpus, or tool;
- reproduction steps or a synthetic failing example;
- expected and actual behavior;
- impact on implementations that pin the affected artifact version;
- a suggested fix, when available.

## In Scope

- The relay envelope contract and its schema invariants.
- Governance policy capability and limit definitions.
- Conformance corpus correctness and synthetic-fixture hygiene.
- Artifact digest generation and verification in `tools/`.
- The candidate first-release invariant that an untrusted station receives no
  message plaintext and cannot turn its receipt into final-delivery evidence.
- Accidental disclosure of secrets, personal data, endpoints, or runtime
  material in tracked content.

## Security Evolution

Every station is assumed to face or participate in global, coordinated,
adaptive, and continuous attacks. No current algorithm or definition check is
a permanent security ceiling. Protection-related work must
continually strengthen, preserve cryptographic agility, resist downgrade,
prefer reviewed open standards, minimize metadata, fail closed, and define
replacement and retirement paths. Endpoint implementations own cryptographic
code, keys, entropy, protected runtime state, providers, executable validation,
and delivery. Lico Arc Protocol owns only the exact versioned
protection-profile and transition semantics and must keep stations outside both
authorities.

## Out Of Scope

- Implementation vulnerabilities in endpoint products or station services,
  which are owned by their respective implementation repositories.
- Social engineering against maintainers or users.
- Reports that require real secrets, private payloads, or private runtime
  data to be disclosed publicly.
