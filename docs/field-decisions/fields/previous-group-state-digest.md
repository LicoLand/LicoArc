# Field Review: Previous Group State Digest

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-previous-group-state-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `previousGroupStateDigest` or derived predecessor |
| Candidate layer | Protected Group Membership State |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` schemas, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | Every non-genesis Group Membership State carries a conditional `previousGroupStateDigest` over its immediate predecessor; genesis omits the field and no other predecessor is accepted. |

## Question

Does a successor Group Membership State need an explicit digest of its
immediate predecessor?

## Role in communication

The Endpoint that authors a successor hashes the complete canonical predecessor
state. Member Endpoints verify the digest before applying the new state, which
lets them detect a gap, fork, rewrite, or cross-Group substitution independently
of Station delivery order. A Station cannot choose or certify the predecessor.

## Contribution to LicoArc's final vision

Binds each protected Group state successor to its exact immediate predecessor
so forks, skipped generations, and rewritten membership history fail closed
without relying on Station order.

## Field model and trade-offs

`previousGroupStateDigest` is a content digest of the complete canonical Group
Membership State immediately preceding the current state. It is absent only
for genesis (epoch `0`). The field commits neither transport framing nor
Station observations; those values are outside Group state identity.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` (32-octet digest) |
| Presence | Conditional: absent only for genesis; mandatory for every successor |
| Values or range | Exactly the digest of the immediate predecessor; one predecessor per state |
| Canonical representation | The selected Protocol Line's deterministic digest over the complete canonical predecessor state |
| Invalid input | Present on genesis, missing on a successor, wrong digest, non-canonical bytes, epoch gap, or conflicting predecessor fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Validate exact Group state succession and detect forks or skipped history even when packets arrive out of order or through different Stations. |
| Field-level necessity | `groupEpoch` supplies numeric order, but states at one epoch can still diverge and a higher epoch does not identify its exact parent. |
| Removal consequence | An Endpoint could accept a state with a fabricated or omitted parent and lose deterministic fork and gap detection. |
| Existing-field evidence | `groupStateDigest` names the current state, while `groupId` and `groupEpoch` do not commit the predecessor's complete contents. |
| Derivation | The receiver cannot derive which predecessor the author intended from arrival order, epoch alone, or a Station receipt. |
| Lower-layer carrier | Transport framing and operation idempotency do not carry protected Group history. |
| Existing carrier | No admitted field owns an immediate Group predecessor binding; adding a second digest is duplicate authority and is forbidden. |
| Protected placement | The digest remains inside the Endpoint-protected Group state. |
| Duplicate-authority risk | A separate transition digest, Station sequence, or Network history cannot replace this exact parent binding. |

## Visibility and trust

The digest is hidden from Stations and authenticated with the successor state.
A Station may suppress, delay, or replay states, but cannot make an unrelated
state a valid successor. Verification occurs before member-set allocation or
authorization; any mismatch rejects the complete state. Digest equality binds
bytes, not human intent, Station honesty, or application effects.

## Alternatives

- Omit the value and use epoch only: rejected because same-epoch forks and
  omitted generations are not identifiable.
- Use only a digest of a smaller state identity: rejected because it permits
  omitted or rewritten predecessor fields.
- Use a Station sequence, receipt, or timestamp: rejected because transport
  observations are not Group authority.
- Include a predecessor digest for genesis: rejected because genesis has no
  predecessor and an artificial zero value creates a second sentinel rule.
- Commit the complete immediate predecessor with a conditional digest:
  selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned predecessor question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Exact parent binding detects forks, gaps, and rewritten history before state advance. |
| Privacy and metadata | Endpoint protection hides membership history; digest length is constant and does not disclose contents. |
| Interoperability | Genesis omission, complete predecessor projection, and fail-closed mismatch handling are deterministic. |
| Implementation complexity | One constant-size digest and bounded retained parent; verification precedes member allocation. |
| CPU, memory, and wire cost | One 32-octet digest and one bounded canonical hash per successor. |
| Evolution and downgrade | The projection is Protocol-Line-specific; an active state chain cannot be translated or reset by migration. |

## Decision history

LicoArc review admitted the immediate-predecessor digest because an epoch alone
cannot detect a same-epoch fork or prove that a successor did not skip a state.
The decision remains independent of `ALG-group-state-evolution`; the algorithm
record does not confer field status. The registry was updated in the same
bounded change and keeps genesis omission explicit.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
