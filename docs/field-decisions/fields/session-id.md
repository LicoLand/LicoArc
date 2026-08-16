# Field Review: Session Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-session-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `sessionId`, channel ID, handshake hash, implicit state key |
| Candidate layer | Pairwise Protection |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Current conclusion | `sessionId` is a mandatory, unpredictable, relationship-scoped `ID128` inside endpoint protection. It selects bounded session state and never authenticates a peer by itself. |

## Question

Do endpoints need to transmit an explicit session identifier, or can they
select state using authenticated key material, route context, a handshake
hash, or trial decryption within hard bounds?

## Role in communication

An explicit value could select ratchet state before decryption, disambiguate
concurrent sessions, and support reset. It must not authenticate the peer or
allow a Station to retarget a packet into another session.

## Contribution to LicoArc's final vision

Selects the exact relationship session state for protected records without
exposing Endpoint identity or allowing a Station to define session continuity.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Session confusion, cross-session replay, collision, and reset attacks must fail closed. |
| Privacy and metadata | Stable visible IDs expose relationship duration and traffic linkage. |
| Interoperability | Derivation, truncation, collision handling, and state selection must be exact. |
| Implementation complexity | No field increases bounded lookup work; explicit IDs increase lifecycle state. |
| CPU, memory, and wire cost | A hint can reduce trial work but creates retained indexes. |
| Evolution and downgrade | Session identity must bind the selected profile and cannot survive unsafe profile reinterpretation. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Efficiently select one of multiple bounded receiving states. |
| Removal consequence | Receiver may need bounded trial processing or another lookup key. |
| Derivation | Potentially derivable from handshake transcript, public key, or protected state. |
| Lower-layer carrier | A Delivery Handle or connection can narrow candidates but cannot establish session identity. |
| Protected placement | The selected session and handshake transcript must be endpoint-authenticated. |
| Duplicate-authority risk | Session ID, Delivery Handle, key ID, and Endpoint identity can overlap or conflict. |

## Value model

The admitted value is a 16-octet unpredictable identifier scoped to one
pairwise relationship and carried only inside endpoint protection. It is not
derived from a Station route, Endpoint identity, key identifier, or transcript
hash. Protocol Line constants still bound active-state lookup, rotation,
retirement, and reset behavior.

## Alternatives

- Implicit single session per relationship.
- Bounded trial decryption across candidate states.
- Authenticated transcript-derived identifier.
- Unprotected key lookup hint that cannot influence acceptance.
- Stable random ID, which is simple but highly correlatable if visible.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Matrix Olm and Megolm expose session identifiers
  to select ratchet state,
  accepting homeserver-visible correlation as part of their event model.
- MLS uses `group_id` and epoch to select group
  state; its group and Delivery
  Service semantics do not directly transfer to pairwise LicoArc.
- Noise maintains channel state after the handshake
  and does not require a
  universal application-level session ID.

## Decision history

The original review remained `OPEN` because implicit state, transcript-derived
keys, and visible lookup hints had not been separated. The canonical registry
closed the common-layer choice: a random protected `ID128` gives deterministic
bounded lookup across reconnect, rekey, concurrent sessions, and Station
route change without exposing a stable relationship handle to the Station.
Profile-owned counters and key references remain separate and cannot replace
or reinterpret `sessionId`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
