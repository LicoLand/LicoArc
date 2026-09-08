# Field Review: Nonce or IV

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-nonce` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | nonce, IV, partial IV, derived sequence nonce |
| Candidate layer | Pairwise Protection |
| Observer set | Endpoints; may be visible without being security-authoritative |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), `spec/v1/protection/domains.json`, `spec/v1/protection/runtime.cddl`, and `spec/v1/protection/state.json`; this record is not a second field specification. |
| Current conclusion | The stable-core Profile derives each record nonce from the direction chain and `N`; no nonce or IV field is transmitted. |

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

The stable-core Profile derives one nonce per direction chain and `N` under
the exact `LICOARC-V1/RATCHET/NONCE\0` domain. The established record repeats
neither nonce nor session or Profile identifiers. `N` is bounded by
`MAX_RATCHET_COUNTER`; retry emits the identical committed ciphertext rather
than re-encrypting; counter overflow, rollback, or nonce reuse fails closed.
No profile-neutral nonce range or compatibility representation exists.

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
common-layer question, and the stable-core Profile now closes its derived
nonce construction, domain separation, counter bound, retry, rollback,
persistence, and failure behavior.

## Definition evidence

The definition status is `SPECIFIED`. The active Profile's closed construction
derives every nonce and admits no transmitted nonce, IV, partial IV, or
fallback field.
