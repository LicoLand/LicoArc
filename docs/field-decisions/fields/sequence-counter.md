# Field Review: Sequence or Ratchet Counter

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-sequence-counter` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | sequence, message number, generation, epoch, previous-chain length |
| Candidate layer | Pairwise Protection and possibly Reliable Exchange |
| Observer set | Endpoints; visibility to Station depends on protection framing |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), `spec/v1/protection/runtime.cddl`, `spec/v1/protection/bounds.json`, and `spec/v1/protection/state.json`; this record is not a second field specification. |
| Current conclusion | No common `sequenceCounter` field exists. Any counter, generation, or ratchet number belongs exclusively to the selected Protection Profile's closed frame schema. |

## Question

Which counters must be transmitted, which are derived, and which must be
hidden or authenticated for asynchronous, out-of-order pairwise delivery?

## Role in communication

Counters may select a ratchet key, support skipped-message recovery, identify
epochs, reject replay, or order stream chunks. These are distinct roles and
must not be collapsed into one field without proof.

## Contribution to LicoArc's final vision

Keeping counters inside each Protection Profile binds ordering, replay,
overflow, and skipped-state rules to the exact ratchet that gives them
meaning.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Wrap, rollback, skipped-key exhaustion, replay windows, and cross-epoch confusion are critical. |
| Privacy and metadata | Visible counters reveal ordering, loss, session age, and traffic volume. |
| Interoperability | Integer width, encoding, bounds, persistence, and reset must be exact. |
| Implementation complexity | Out-of-order support creates bounded maps and deletion obligations. |
| CPU, memory, and wire cost | Counter bytes are small; attacker-driven skipped-key computation and storage can be large. |
| Evolution and downgrade | Counter meaning is inseparable from the selected ratchet profile. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Locate the correct protected key state and enforce bounded replay/out-of-order handling. |
| Removal consequence | Some asynchronous ratchets cannot recover out-of-order messages efficiently. |
| Derivation | In-order channels may derive counters from local state; offline delivery may not. |
| Lower-layer carrier | Transport sequence numbers cannot replace endpoint-authenticated ratchet state. |
| Protected placement | Any counter affecting key selection, freshness, or replay must be authenticated by the profile. |
| Duplicate-authority risk | Transport order, ratchet number, logical Message order, and `streamChunk` order have different scopes. |

## Value model

The stable-core Profile carries only `PN` and `N` in its canonical
`ratchet-header`, each in `0..MAX_RATCHET_COUNTER` where
`MAX_RATCHET_COUNTER = 4,294,967,295`. They are authenticated as record AAD;
wrap, rollback, and over-bound skipped-key derivation fail closed. Retry reuses
the exact committed packet and never advances either coordinate. No common
`sequenceCounter`, transport counter, session counter, or compatibility field
exists.

## Alternatives

- Implicit monotonically increasing state on an ordered channel.
- Explicit authenticated message number.
- Epoch plus per-epoch generation.
- Ratchet header containing current and previous-chain counters.
- Random nonces with replay cache, which changes state and denial-of-service
  costs rather than eliminating replay handling.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Double Ratchet
  transmits message-number information to support skipped keys and ratchet
  transitions.
- MLS uses epochs and sender
  generations within authenticated group state.
- Noise `CipherState` advances an implicit nonce
  counter for ordered transport
  messages.
- QUIC packet numbers are transport security state and cannot substitute for
  end-to-end LicoArc counters across Stations.

## Decision history

The review first left the representation open because replay and skipped-key
handling clearly need ordered state while different constructions encode it
differently. The canonical registry resolved the common-layer question, and
the stable-core Profile now closes the exact `PN` and `N` representation,
bounds, persistence, replay, retry, rollback, and failure rules.

## Definition evidence

The definition status is `SPECIFIED`. The active Profile's closed ratchet
header, bounds, and durable state rules own every transmitted counter and
admit no profile-neutral field.
