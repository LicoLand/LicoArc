# Lico Arc Protocol

Lico Arc Protocol is LicoLand's **Protocol Layer**: the
implementation-neutral authority for protocol semantics, station-facing wire
contracts and lifecycle, closed schemas, field and requirement registries, and policies,
definition-level corpora, content-addressed protocol artifacts, compatibility,
and federation governance semantics. This repository is the sole authority for
those materials and checks their deterministic tracked source closure.

Products, repositories, implementations, Providers, deployments, and
external protocols may consume LicoArc or submit proposals, but they never
define its fields or semantics. Every protocol decision must serve the
[LicoArc final protocol vision](PRODUCT.md#final-protocol-vision) and enter the
repository-owned decision and definition closure.

## Core Domain Model

This section is the single authoritative definition of LicoArc's core domain
model. Other documents may summarize it and link here, but must not add,
remove, or independently redefine its entities or trust boundaries.

LicoArc recognizes exactly three domain entity types:

| Entity | Definition | Authority and privacy boundary |
| --- | --- | --- |
| **Endpoint** | The user-controlled origin or destination of protected communication. | The sole runtime authority for its user's keys, plaintext, protected state, peer acceptance, local trust, approval, effects, and endpoint-authenticated evidence. It is an inviolable privacy boundary: neither a Station nor a Network may assume or receive that authority. |
| **Station** | An independently operated intermediary that transports opaque, endpoint-protected data. | Always untrusted by every Endpoint. It has transport authority only and never gains authority over plaintext, keys, Endpoint identity, authenticity, integrity, freshness, replay decisions, approval, effects, or final receipt. |
| **Network** | A federation interoperability context in which participants mutually recognize communication under a pinned LicoArc Protocol Line. A Network may use one or more independently operated Stations. | Provides protocol recognition and carriage context only. It cannot override an Endpoint decision or become a trust root, privacy boundary, identity authority, plaintext authority, or security authority merely through membership, governance, hosting, discovery, or operation. |

The communication invariant is:

```text
Endpoint A ── endpoint-protected LicoArc exchange ──▶
    Network { one or more untrusted Stations } ──▶ Endpoint B
```

Each independently key-holding device or isolated runtime is a distinct
Endpoint. One person may therefore control multiple Endpoints without merging
their identities or protected state. Authority and plaintext remain inside
each Endpoint while untrusted Stations carry opaque data through a
LicoArc-recognized Network to the peer Endpoint. The receiving Endpoint alone
validates and accepts the peer, protected content, and resulting local action.

Here, **sole authority** means sole runtime security and privacy authority for
the user; LicoArc remains the design-time authority for protocol semantics.
LicoArc itself is a protocol, not a fourth runtime entity. Users, Providers,
directories, committees, Network Hosts, implementation languages, and hosted
services may control, support, govern, or realize part of the system, but they
do not add another LicoArc core domain entity type.

A **Group** is a protected, versioned collaboration object whose members are
Endpoints; it is not a fourth entity. A protected Endpoint Association Claim
may describe a non-authoritative relationship among Endpoints, but it never
merges their identities or proves shared human, device, account, ownership, or
trust. Product actions remain namespaced opaque Payload rather than a
protocol-owned command catalog.

## Current Repository Status

The current repository source projection is the **Candidate**
`licoarc.protocol-line.v1` with definition status `PARTIAL`. Its manifest and
generated bundle declare that exact identity and its ineligible status.
Current definition facts are maintained in [`docs/STATUS.md`](docs/STATUS.md).

The [Canonical Field Registry](spec/FIELD-REGISTRY.md) is the sole authority
for active fields. Pairwise Protection currently has zero active Profiles or
wire schemas: Hybrid AKE, prekey consumption, transcript, key confirmation and
Double Ratchet remain open pending an exact construction and proof.

Candidate governance and release artifacts use restricted JCS-canonical JSON
with JSON Schema and content-addressed OCI, DSSE, and TUF controls. Candidate
Endpoint wire data uses deterministic CBOR described by closed CDDL, compact
integer labels, and raw `protectedPacket` bodies. The representation split,
Bounded Group collaboration, Reliable Exchange, HTTPS Transport Profile,
identity continuity and multi-root threshold governance remain specified.
The partial Candidate is not session-eligible, publication-eligible or
Published.

LicoArc checks the tracked definition with its own schemas, field and
requirement registries, policies, corpora, artifact generation, and digest
consistency. `docs/references/` is ignored local research and is not a tracked
input or closure condition. Every implementation and real-world delivery fact
belongs to its downstream owner and cannot advance or block this repository.

English is the normative language of this README; the
[Simplified Chinese localization](README.zh-CN.md) is provided for reference.

## Documentation

- [Core domain model](#core-domain-model)
- [Product goal and boundary](PRODUCT.md)
- [Domain language](CONTEXT.md)
- [Current status](docs/STATUS.md)
- [Architecture](ARCHITECTURE.md)
- [Decision lifecycle](docs/DECISION-LIFECYCLE.md)
- [Algorithm decision workspace](docs/algorithm-decisions/README.md)
- [Canonical field registry](spec/FIELD-REGISTRY.md)
- [Field decision workspace](docs/field-decisions/README.md)
- [Specification index](spec/README.md)
- [Formal documentation index](docs/README.md)
- [Contributing](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)

## Verification

Run `npm run verify` to validate the Canonical Field Registry and its complete
field-detail linkage, the Candidate schema, field and requirement registries,
schema-to-field-registry consistency, requirement source-binding closure,
requirement-to-evidence traceability, conformance corpus,
machine-readable wire ID and lifecycle, generated artifact, digest
consistency, decision-track closure, per-record explanation sections and
decision lifecycle metadata,
and tracked-link integrity. These checks prove definition-source consistency
only; they make no implementation or delivery claim.

License: GPL-3.0-or-later.
