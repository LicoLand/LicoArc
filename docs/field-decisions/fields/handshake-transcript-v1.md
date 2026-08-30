# Field Review: Handshake Transcript v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-transcript-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Pairwise Protection architecture](../../../ARCHITECTURE.md#3-pairwise-protection) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/v1/protection/`, `formal/`, `conformance/v1/protection/`, `spec/v1/manifest.json`, and `spec/protocol-lines.json` |
| Predecessor or successor | Replaces the withdrawn Candidate transcript scope; it preserves no old digest, label, or wire. |
| Current conclusion | One canonical transcript binds both complete support statements and floors, exact non-circular line/Profile content identities, identity-continuity state, role/purpose, the paired prekeys, public values, first ciphertext, and dual signatures before establishment. |

## Question

Which semantic values and canonical representation must the establishment
transcript bind to reject downgrade, role confusion, unknown-key share,
prekey substitution and session-lock mismatch?

## Role in communication

Both Endpoints derive and validate the same transcript context. Its digest
feeds the hybrid combiner, role-separated KDF domains, handshake signatures,
client confirmation, and SessionAccept MAC. A digest never replaces validation
of each referenced statement or value.

## Contribution to LicoArc's final vision

Makes the exact cross-capability composition and Endpoint identities
interoperable and downgrade-resistant without granting a Station, Provider, or
component negotiation authority.

## Field model and trade-offs

| Transcript input | Approved semantic |
| --- | --- |
| Support | Both Endpoint-authenticated complete support statements and monotonic floors. |
| Line/Profile | DIGEST256 content identities of the exact line and Profile; no self-referential or mutable lifecycle data. |
| Identity | Both Endpoint identity-continuity state digests and authorized public-key references. |
| Context | Derived role and fixed handshake purpose, with no implementation-local replacement. |
| Prekeys | Selected responder paired sequence, X25519 public key, ML-KEM-768 public key, and the initiator ciphertext. |
| Authentication | Initiator and responder identity signatures over the canonical transcript inputs. |
| First packet | Complete canonical first ciphertext and its authenticated client-confirm value. |
| Representation | Deterministic CBOR projection with distinct NUL-terminated ASCII domain separation. |

The line content identity is computed from a canonical semantic projection of
generation, mandatory capability semantic identities, active Profile
identities, stable claim/nonclaim identifiers, and selection/session rules.
The Profile identity is computed from its canonical semantic definition and
stable claim/nonclaim identifiers. Self identity, containing catalogs,
lifecycle/publication state, proof results/bindings, artifact digests, and
external tool metadata are excluded from those preimages. Textual contract
names and `wireId` values remain source/catalog locators only.

## Visibility and trust

Transcript values are Endpoint-authenticated and protected as required by the
handshake; a Station may carry or suppress bytes but cannot interpret them as
authority. The selected line owns mandatory capability membership and
cross-capability bounds. Any mismatch, missing input, unknown identity, invalid
signature, or non-canonical representation fails terminally with no state
advance.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bind every security- and capability-relevant establishment input into one independently reproducible context. |
| Removal consequence | Component substitution, role confusion, identity mismatch, and content-identity ambiguity can produce divergent sessions. |
| Derivation | A line/Profile digest alone cannot bind peer inputs, prekeys, public values, or the first ciphertext. |
| Lower-layer carrier | Station and Transport cannot authenticate or define the Endpoint transcript. |
| Protected placement | Transcript-bound values do not need repetition in ordinary established records; the selected Profile inherits the authenticated context. |
| Duplicate-authority risk | Common capability/Profile/session fields and implementation labels would create competing authority and are rejected. |

## Decision history

Repository review on 2026-08-31 adopted one deterministic transcript context,
non-circular content-identity projections, complete cross-capability binding,
and no independent negotiation or fallback. Exact compact labels, byte ordering,
domain strings, and source vectors are closed by the linked machine authority.

## Decision outcome

The transcript binding is approved as one independent field semantic. It does
not allocate a generic transcript field or authorize a common protected-record
placement before the final source closure.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked schema, labels, byte ordering, domains, bounds, signature inputs,
vectors, and aggregate source closure close the exact transcript semantics.
