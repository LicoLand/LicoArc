# Field Review: Sequence or Ratchet Counter

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-sequence-counter` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | sequence, message number, generation, epoch, previous-chain length |
| Candidate layer | Pairwise Protection and possibly Reliable Exchange |
| Observer set | Endpoints; visibility to Station depends on protection framing |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains a profile-owned disposition and is not a second field specification. |
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

Potential values are bounded unsigned integers or structured epoch/generation
pairs. Width, wrap behavior, reset, maximum skip, previous-chain count,
visibility, and replay-window persistence depend on the selected profile.

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
handling clearly need ordered state while different reviewed constructions
encode it differently. The canonical registry resolved the layer boundary:
there is no algorithm-neutral common counter. Each admitted Protection Profile
must define its own authenticated counter or ratchet coordinates, bounds,
rollback behavior, and invalid-input rules in one closed frame schema.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
