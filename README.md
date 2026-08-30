# Lico Arc Protocol

[简体中文](README.zh-CN.md)

Lico Arc Protocol is LicoLand's implementation-neutral **Protocol Layer**. It
owns protocol meaning: closed schemas and registries, deterministic wire
representations, security and lifecycle rules, definition-level conformance
corpora, content-addressed Protocol Line artifacts, and federation governance.

Products and implementations may execute an exact pinned definition or submit
proposals, but they cannot redefine it. Publication, implementation,
interoperability execution, audit, deployment, support, and operation remain
separate downstream concerns.

## Core Domain Model

This section is the sole authority for LicoArc's three domain entities.

| Entity | Definition | Authority boundary |
| --- | --- | --- |
| **Endpoint** | The user-controlled origin or destination of protected communication. | Sole runtime authority for its keys, plaintext, protected state, peer acceptance, local approval, effects, and endpoint-authenticated evidence. |
| **Station** | An independently operated intermediary that transports opaque endpoint-protected data. | Untrusted by Endpoints. It has only the transport authority explicitly granted by the pinned Protocol Line. |
| **Network** | A federation interoperability context whose participants recognize communication under one pinned Protocol Line. | Provides recognition and transport context; it is not a trust root, identity authority, plaintext authority, or endpoint security authority. |

```text
Endpoint A ── endpoint-protected LicoArc exchange ──▶
    Network { one or more untrusted Stations } ──▶ Endpoint B
```

Every independently key-holding device or isolated runtime is a distinct
Endpoint. A Group is a protected collaboration object whose members are
Endpoints, not a fourth entity.

## Current Definition

The tracked source graph defines `licoarc.protocol-line.v1` as:

| Property | Value |
| --- | --- |
| Lifecycle | `Candidate` |
| Definition status | `COMPLETE` |
| New-session eligibility | `true` |
| Publication eligibility | `false` |
| Mandatory capabilities | 9, all `COMPLETE` |
| Active Protection Profile | `stable-core`, `COMPLETE` |

The nine mandatory capabilities are Protocol Foundation, Identity, Pairwise
Protection, Generic Messaging, Reliable Exchange, HTTPS Transport, Group
Collaboration, Transferable Evidence, and Federation Governance.

`stable-core` is an indivisible hybrid construction with paired X25519 and
ML-KEM-768 one-time prekeys, dual Ed25519 and ML-DSA-65 authentication,
transcript-bound selection and confirmation, and a bounded X25519 Double
Ratchet. Profile and Protocol Line identities are computed from named,
non-circular semantic projections. Proof admission, security accounting, and
the complete declared conformance corpus are part of definition admission.

`sessionEligible: true` means the Candidate definition permits authenticated
new-session selection under its machine policy. It does not mean Published,
implemented, interoperable, audited, deployed, supported, or operational.

Canonical current facts are in [`spec/v1/manifest.json`](spec/v1/manifest.json),
[`spec/protocol-lines.json`](spec/protocol-lines.json),
[`spec/protection-profiles.json`](spec/protection-profiles.json), and
[`docs/STATUS.md`](docs/STATUS.md).

## Documentation

- [Product authority and scope](PRODUCT.md)
- [Architecture](ARCHITECTURE.md)
- [Domain vocabulary](CONTEXT.md)
- [Current status](docs/STATUS.md)
- [Compatibility and lifecycle](docs/COMPATIBILITY.md)
- [Protocol documents](docs/protocols/)
- [Definition verification](docs/conformance/verification.md)
- [Decision lifecycle](docs/DECISION-LIFECYCLE.md)
- [Canonical Field Registry](spec/FIELD-REGISTRY.md)
- [Formal documentation index](docs/README.md)

Run `npm run verify` for the repository-owned source-integrity checks. These
checks validate the definition graph and generated artifact only; they do not
claim downstream execution or delivery.

License: GPL-3.0-or-later.
