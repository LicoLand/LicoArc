# Field Review: Protection Profile Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protection-profile-id` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | `profile`, `suite`, `protocolLine` |
| Candidate layer | Pairwise Protection handshake and protected session context |
| Observer set | Peer Endpoints; hidden from Stations in the common protected record |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Predecessor or successor | Succeeded by `FLD-protection-profile-id-session-binding`. |
| Current conclusion | Retired: the successor binds the sole fixed V1 Profile identity into the handshake transcript and forbids per-record repetition after establishment. |

## Question

How do endpoints identify one complete cryptographic and state-machine profile
without negotiating an unsafe Cartesian product or letting a Station choose?

## Role in communication

Endpoints use the identifier to select the exact handshake, algorithms, key
schedule, ratchet, framing, bounds, metadata protection, failure behavior, and
lifecycle. It is security-authoritative only after transcript validation.

## Contribution to LicoArc's final vision

Retiring per-record `protectionProfileId` repetition keeps the complete profile locked by the handshake while removing 32 repeated octets from established records.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Central to downgrade resistance, algorithm retirement, and deterministic failure. |
| Privacy and metadata | Visible profiles fingerprint capability and assurance level; hiding or greasing needs analysis. |
| Interoperability | A closed registry is essential for deterministic behavior across independent implementations. |
| Implementation complexity | Whole-profile selection reduces unsupported combinations and test explosion. |
| CPU, memory, and wire cost | Token cost is tiny; selected suite cost can be substantial. |
| Evolution and downgrade | Every lifecycle transition needs minimum-safe policy and transcript-bound selection. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select one interoperable protection construction and enforce lifecycle policy. |
| Removal consequence | Implementations can silently choose incompatible or weaker semantics. |
| Derivation | Not safely derivable from individual field shapes or algorithm IDs. |
| Lower-layer carrier | A carrier hint may aid dispatch but cannot be the authoritative selection. |
| Protected placement | Selection and both capability declarations must enter the authenticated transcript. |
| Duplicate-authority risk | High if transport version, algorithm fields, and profile token select different semantics. |

## Value model

The semantic value is a 32-octet digest identifier for one closed,
lifecycle-managed complete profile. It is not a list of algorithms and cannot
be minted by an implementation. The Protocol Line manifest admits the exact
profiles and their lifecycle; transport hints never become authoritative.

## Alternatives

- One complete profile identifier.
- Independent `kem`, `signature`, `aead`, `kdf`, and ratchet fields, rejected
  because arbitrary combinations multiply review and downgrade states.
- Implicit compile-time profile, insufficient once cryptographic retirement
  or more than one approved profile exists.
- Transport-selected suite, rejected because the Station is not security
  authority.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- TLS 1.3 authenticates
  negotiated parameters in the handshake transcript.
- MLS uses protocol versions and
  cipher suites with exact registries and authenticated group context.
- COSE requires
  algorithm parameters to be authenticated when possible.
- Matrix algorithm names select event layouts,
  but homeserver-visible event
  metadata and Matrix identity cannot become LicoArc profile authority.

## Decision history

The inclusion, representation, visibility, and authority decision is complete
in the Canonical Field Registry. The fixed V1 transcript binds the sole
admitted Profile identity, exact suite, unknown-value failure, vectors, and
Protocol Line identity together. LicoArc review on 2026-08-03 retired the
broad placement and assigned handshake-only occurrence to
`FLD-protection-profile-id-session-binding`.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
