# Field Review: Nonce or IV

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-nonce` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | nonce, IV, partial IV, derived sequence nonce |
| Candidate layer | Pairwise Protection |
| Observer set | Endpoints; may be visible without being security-authoritative |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains a profile-owned disposition and is not a second field specification. |
| Current conclusion | Correct nonce handling is mandatory for the chosen construction; transmission as a generic field is not. |

## Question

Does each approved Protection Profile transmit a full or partial nonce, derive
it from authenticated state, or combine both, and how are reuse and rollback
prevented?

## Role in communication

The selected authenticated-encryption construction uses nonce input according
to its profile. The
receiver must reproduce the exact nonce before authentication. A Station may
carry visible nonce material but cannot choose accepted cryptographic state.

## Contribution to LicoArc's final vision

Keeping cryptographic nonce semantics inside the selected Protection Profile
prevents a common field from being detached from its exact key and state
machine.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Reuse under one key can be catastrophic; rollback and cross-profile derivation errors are central hazards. |
| Privacy and metadata | Random visible nonces add equality-resistant bytes but do not hide timing or route. Counters may reveal order. |
| Interoperability | Exact byte order, width, derivation, overflow, and persistence rules require vectors. |
| Implementation complexity | Derived nonces reduce wire fields but couple correctness to durable state. |
| CPU, memory, and wire cost | Usually small; randomness generation and persistence behavior can dominate reliability. |
| Evolution and downgrade | Nonce semantics cannot be shared across profiles unless the complete construction is identical. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Supply the exact per-record authenticated-encryption input required by the selected algorithm. |
| Removal consequence | Depends on whether both endpoints can derive it from synchronized state. |
| Derivation | Commonly possible from sequence, epoch, chain key, or context. |
| Lower-layer carrier | Transport nonces protect only the carrier hop and cannot replace endpoint authenticated-encryption input. |
| Protected placement | Mutation must cause authentication failure; nonce derivation context must be transcript- or state-bound. |
| Duplicate-authority risk | Explicit nonce plus sequence-derived nonce can disagree or enable reuse. |

## Value model

There is no profile-neutral range. Byte width, uniqueness requirement,
randomness requirement, counter construction, partial-IV grammar, overflow,
rollback persistence, and visibility are algorithm-specific.

## Alternatives

- Fully derived nonce from bounded sequence and session context.
- Random transmitted nonce with collision analysis.
- Fixed context prefix plus transmitted partial IV.
- Ratchet-derived nonce and key, with no separate field.
- Provider-generated opaque nonce, rejected unless the exact observable
  behavior is fixed by the LicoArc profile.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- COSE supports IV
  and Partial IV values and allows context to supply another portion.
- Noise maintains a nonce counter in `CipherState`
  rather than defining a
  generic application field.
- TLS 1.3 derives per-record nonces from traffic
  secrets and record sequence
  numbers.
- JWE transmits an initialization vector because its
  selected serialization
  and key-management model require it.

## Decision history

The original review remained open because nonce uniqueness is mandatory but
transmission is construction-specific. The canonical registry resolved the
common-layer question: no common `nonce` or `IV` field exists. Each admitted
Protection Profile must own its exact derived or transmitted construction,
authentication, uniqueness or misuse-resistance proof, bounds, rollback and
crash behavior, and invalid-input handling in its closed frame schema.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
