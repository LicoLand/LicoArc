# Field Review: Confirmation Stage

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-stage` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | Station Received, Endpoint Accepted, Effect Completed, confirmation kind |
| Candidate layer | Transport Profile for Station Received; Reliable Exchange for Endpoint stages |
| Observer set | Sender Endpoint, Station for its own signal, receiving Endpoint |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Predecessor or successor | Succeeded by `FLD-confirmation-stage-compact`. |
| Current conclusion | Retired: the successor preserves both Endpoint stages, shares them over a bounded Message set, and removes routine attachment chunk success. |

## Question

How are the three stages represented without allowing a Station-produced value
to masquerade as endpoint-authenticated acceptance or completion?

## Role in communication

Station Received guides transport retry. Endpoint Accepted confirms durable
protected deduplication. Effect Completed confirms completion of the referenced
local application effect. The successor shares one stage over a bounded Message
set. Routine attachment chunk acceptance is Receive State progress, not a
confirmation stage transition. Under this retired predecessor, ordinary
confirmations had no mandatory transferable checkpoint; the current successor
requires checkpoint coverage before a confirmation advances state.

## Contribution to LicoArc's final vision

Retiring the per-chunk checkpoint scope prevents `confirmationStage` from forcing one control record for every successful attachment chunk.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Provenance and replay protection are essential; authority collapse is the central hazard. |
| Privacy and metadata | Protected endpoint stages hide application progress from Stations; transport receipts still reveal attempts. |
| Interoperability | State transitions, duplicates, reordering, terminality, and conflicts require a closed state machine. |
| Implementation complexity | Separate stages require durable state but prevent unsafe retry heuristics. |
| CPU, memory, and wire cost | Small records; durable confirmation state and retries are the main cost. |
| Evolution and downgrade | A new stage cannot reinterpret old receipts or weaken endpoint-authentication requirements. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Distinguish transport flow control, durable endpoint acceptance, and application completion. |
| Removal consequence | Callers may retry completed effects or treat queue acceptance as final delivery. |
| Derivation | Later stages cannot be inferred from earlier stages or carrier success. |
| Lower-layer carrier | Only Station Received belongs in the Transport Profile. |
| Protected placement | Endpoint Accepted and Effect Completed must be endpoint-authenticated Reliable Exchange records. |
| Duplicate-authority risk | One shared enum outside protection would collapse producers and trust domains. |

## Value model

The design uses two authority-separated representations. `outcomeClass`
reports the Station operation. Protected Endpoint Confirmation uses the closed
enum `endpointAccepted | effectCompleted` and references the logical Message.
This prevents a Station value from entering the endpoint evidence state. A
bounded successor confirmation group shares one stage; only empty verified
Attachment Receive State reports routine attachment success.

## Alternatives

- Separate transport result and protected confirmation message kinds.
- One protected confirmation enum for Endpoint Accepted and Effect Completed,
  with Station Received remaining outside.
- One universal receipt enum, rejected unless provenance and protection make
  authority impossible to confuse.
- Exactly-once delivery claim, rejected because a malicious Station and local
  application effects prevent that guarantee.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push
  distinguishes service delivery acknowledgement from application behavior.
- Messaging brokers expose acceptance and acknowledgement states, but their
  trusted broker and operational semantics are not federation authority.
- MCP / JSON-RPC
  response completion concerns one peer protocol action and does
  not prove an external durable effect.

## Decision history

The original review separated three semantic stages but left their
representation open. The Canonical Field Registry completed that decision:
Station operation outcome stays outside endpoint evidence, while one protected
two-value `confirmationStage` field distinguishes Endpoint acceptance from
effect completion. Candidate work still owns transition, duplicate, replay,
and terminal-state rules.

LicoArc review on 2026-08-03 first added an attachment checkpoint
interpretation. The later compact-control review retired that scope without
adding a third stage and assigned current grouped semantics to
`FLD-confirmation-stage-compact`.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
