# Lico Arc Protocol

[简体中文](README.zh-CN.md)

LicoArc defines open, implementation-neutral communication contracts for people,
devices and agents. Conversations persist while connections change. Accepted
messages, files and work wait safely for offline peers; application capabilities
update existing conversations without rebinding or restarting encrypted sessions.

Nostr is an optional network adapter, not the foundation of identity or durable
custody. The standard NIP-17 private-message path preserves interoperability with
other supporting clients. Enhanced peers use the open LicoArc Endpoint Core and
shared application definitions, over Nostr or another approved adapter. Neither
path requires LicoUp, an official client, a particular model or an official service.

## Core Domain Model

This section is the sole authority for LicoArc's three domain entities.

| Entity | Definition | Authority boundary |
| --- | --- | --- |
| **Endpoint** | A user-controlled origin or destination of protected communication. Each independently key-holding device or isolated runtime is a separate Endpoint. | Controls keys, plaintext, peer trust, durable local state, consent, effects and authenticated confirmations. |
| **Station** | An independently operated intermediary carrying opaque protected data. | Untrusted. Its custody or relay receipt never proves Endpoint storage, approval or execution. It has no user/device authority roster. |
| **Network** | An interoperability context for mutually understood communication contracts. | Supplies recognition and transport context, not an identity root, plaintext authority or Endpoint authorization. |

A Group is a protected collaboration object whose members are Endpoints, not a
fourth entity. An application actor or Agent is scoped by its authorized Endpoint;
its display name is not an execution grant.

## What V1 defines

The [Endpoint Core](spec/v1/foundation/targets.json) requires five capabilities:
Protocol Foundation, Identity, Pairwise Protection, Generic Messaging and Reliable
Exchange. Group Collaboration, native HTTPS Station carriage and Federation
Governance have separate conditional conformance targets. Supporting the core does
not require implementing a chat UI, Nostr, a Station server or network governance.

[Durable continuity](spec/v1/reliable/continuity.md) separates connection attempts,
custody, approvals and execution facts. Resource budgets bound a processing turn,
not the life of a message. Timed claim release never deletes the claimed item.
[Live capabilities](spec/v1/messaging/capabilities.md) separate knowing an interface,
providing a tool, availability and permission. Only the last controls authorization.

## Current definition

| Property | Value |
| --- | --- |
| Protocol | `licoarc.protocol-line.v1`, V1 / Generation 1 |
| Lifecycle | `Candidate` |
| Definition status | `PARTIAL` — revised semantics require formal requalification |
| New-session eligibility | `false` |
| Protocol-Line publication eligibility | `false` |
| Mandatory core capabilities | 5; 3 separately defined optional scopes |
| Package version | `0.1.0`, unchanged |

The primitives remain X25519/ML-KEM-768 and Ed25519/ML-DSA-65 with a classic
X25519 Double Ratchet. This revision changes prekey admission/transcripts,
confirmation semantics and content identities. The prior proof remains preserved
with its original digest; it does **not** prove this revision. See
[status](docs/STATUS.md) and [formal requalification](formal/requalification.json).
A source check is neither SDK execution, a security audit nor cross-client testing.

## Documentation and verification

Start with the [reader guide](docs/README.md) or [implementer guide](docs/guides/implementer-start.md),
then [Product](PRODUCT.md), [Architecture](ARCHITECTURE.md),
[Nostr interoperability](spec/interop/v1/protocol.md), and the
[documentation index](docs/README.md). Normative sources are in `spec/`; generated
bundles in `artifacts/` bind their exact sources and synthetic conformance corpora.

```sh
npm run definition:refresh
npm run verify
npm run conformance:check
```

`definition:refresh` recomputes source identities and artifacts, never proof output
or expected test results. `formal:check` currently fails with an explicit
requalification requirement rather than reusing the old proof as current evidence.
All examples are synthetic. Implementation, interoperability, publication, audit,
deployment, support and operation belong to downstream owners.

License: Apache-2.0.
