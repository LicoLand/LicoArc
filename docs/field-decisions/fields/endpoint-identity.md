# Field Review: Endpoint Identity Reference

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-identity` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Candidate spellings | sender, recipient, credential, identity-key reference |
| Candidate layer | Identity/Discovery and Pairwise Protection |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Predecessor or successor | Succeeded by `FLD-endpoint-identity-session-binding`. |
| Current conclusion | Retired: stable identity remains handshake-bound and portable, while established records inherit it instead of repeating the field. |

## Question

What protected identity reference is required for handshake authentication and
continuity, and which identity material, if any, may be visible outside
protection?

## Role in communication

Endpoints bind long-lived or rotating authenticated identity state to
handshake roles, peer-verification evidence, authorized rotation, and session
continuity. A separate Endpoint-wide Affiliation Update states the current
primary and alternate Station service relationships; relationship-scoped
Route Updates then bind private transport candidates to that exact state.
Stations sign only opaque bounded commitments, not Endpoint identity.

## Contribution to LicoArc's final vision

Retiring per-record `endpointIdentityRef` repetition preserves portable Endpoint identity through session context while removing stable repeated metadata from established records.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Misbinding, key substitution, unknown-key-share, split view, and unauthorized rotation are primary risks. |
| Privacy and metadata | Stable visible identity defeats sender or relationship privacy. |
| Interoperability | Exact key purposes, signature inputs, rotation proofs, and comparison rules are required. |
| Implementation complexity | Multi-key hybrid profiles and recovery increase state and verification paths. |
| CPU, memory, and wire cost | Key and proof sizes may be substantial, especially for post-quantum profiles. |
| Evolution and downgrade | Identity continuity must survive profile upgrades without accepting an old or provider-chosen key. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Authenticate the intended peer and detect unauthorized identity replacement. |
| Removal consequence | Pairwise protection can encrypt to an unknown key without proving the intended Endpoint. |
| Derivation | Cannot be derived from Station route, network location, certificate, or provider. |
| Lower-layer carrier | Hop or service authentication does not authenticate the remote Endpoint. |
| Protected placement | Identity keys, references, roles, and continuity evidence must be transcript-bound. |
| Duplicate-authority risk | User, device, account, domain, Station affiliation, route, provider, and key IDs can conflict unless their roles are separated. |

## Value model

The common field is a `DIGEST256` reference to endpoint-controlled
verification material or continuity state. The referenced credential,
rotation, proof linkage, and resolution procedure belong to the selected
Protocol Line. The value is language-neutral, purpose-scoped, independent of
one product or Station, hidden from Stations, and unchanged when a Route
Update replaces Station A with Station B.

## Alternatives

- Direct identity-key commitment.
- Signed Endpoint identity document with authorized key rotation.
- Pairwise pseudonymous identity derived for one relationship.
- Human-readable account or device identifier, rejected as cryptographic
  authority.
- Embedding `stationId`, a domain, or any service-scoped namespace in the
  Endpoint identifier, rejected because service migration would become an
  identity change.
- Station or directory assertion alone, rejected as final trust.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Noise patterns bind static keys in different
  visibility and authentication
  arrangements, demonstrating that identity exposure depends on the selected
  handshake.
- MLS credentials bind members
  to an Authentication Service model; LicoArc cannot inherit that trusted
  service assumption.
- Matrix cross-signing and device verification
  provide useful implementation
  evidence, but Matrix user IDs, device lists, and homeserver key responses
  are not LicoArc Endpoint identity.
- Signal-style sealed sender informs
  metadata minimization but does not by
  itself define LicoArc identity continuity.

## Decision history

The trust and placement decision is complete. The portable Station-affiliation
review clarified that identity is the stable first segment, Endpoint-wide
Station affiliation is the second, and private Route state is the third.
Identity
document grammar, pairwise pseudonymity, visible commitments, rotation,
recovery, and transparency proofs remain separate Candidate decisions.
LicoArc review on 2026-08-03 retired the broad placement and moved current
semantics to `FLD-endpoint-identity-session-binding`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
