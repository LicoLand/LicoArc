# Field Review: Transport Envelope Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-transport-envelope-id` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | `envelopeId`, Station message resource ID, submission token |
| Candidate layer | Transport Profile or structured transport body |
| Observer set | Sender Endpoint and Station; possibly receiving Endpoint |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the rejection decision and is not a second field specification. |
| Authority targets | Removal from the successor Candidate schema, registry, corpus, and bundle |
| Predecessor or successor | A future differently scoped Station response resource would require a new decision ID |
| Current conclusion | A sender-supplied transport Envelope identifier is rejected; Station-local resources remain Transport Profile response or local state, while logical Message identity remains endpoint-protected. |

## Question

Is a globally or route-stable outer identifier needed, or can each Station
assign a local submission resource while Reliable Exchange uses a protected
logical Message identifier?

## Role in communication

Possible uses include Station deduplication, retry correlation, retrieval,
acknowledgement, cancellation, and diagnostics. Each use has different scope
and authority; one opaque field should not silently combine them.

## Contribution to LicoArc's final vision

Rejecting a redundant transport Envelope identifier keeps logical identity,
idempotency, and Station resource handles in separate bounded scopes.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Station-generated IDs cannot prove Endpoint acceptance; sender IDs can enable replay or cancellation confusion if scopes are vague. |
| Privacy and metadata | Stable equality is directly correlatable across retries and routes. |
| Interoperability | Scope and collision semantics matter more than string syntax. |
| Implementation complexity | Removing a redundant ID simplifies state machines; local transport resources still need implementation handling. |
| CPU, memory, and wire cost | Small wire cost but potentially large Station indexes and deduplication state. |
| Evolution and downgrade | Conflated IDs become hard to split later without compatibility ambiguity. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Not yet identified as one interoperable action shared by all Transport Profiles. |
| Removal consequence | A Station can return a local resource identifier; endpoints still deduplicate with protected Message identity. |
| Derivation | A local identifier can be allocated at submission. Hashing packet bytes leaks equality and is not a neutral replacement. |
| Lower-layer carrier | Transport Profile resource locations, stream IDs, request IDs, or connection-local handles can carry transport correlation. |
| Protected placement | Logical Message identity belongs in Reliable Exchange and survives route changes. |
| Duplicate-authority risk | High: envelope ID, request ID, Station resource ID, and Message ID can conflict. |

## Value model

If admitted, scope must be explicit: per Station, per route, per submission, or
per exact packet. Generation authority, uniqueness, opacity, byte bounds,
collision handling, retry reuse, route-change behavior, and retention must be
closed. No such model is currently approved.

## Alternatives

- Station-generated resource ID returned only by the Transport Profile.
- Connection-local request correlation.
- Protected logical Message ID, invisible to the Station.
- Exact-packet equality for local caching, with no protocol identity claim.
- No identifier for fire-and-forget submission.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push lets the
  push service create a message resource and return its URI rather than
  requiring a sender-defined body ID.
- JSON-RPC uses `id` to correlate a
  request and response within that protocol interaction; it is not a durable
  delivery identity.
- Matrix event IDs participate in room graphs and
  server federation, a much
  stronger server-visible role than LicoArc has justified.

## Decision history

The objective admission failure permitted rejection from `OPEN`; repository
review rejected the sender-supplied transport Envelope identifier on
2026-08-01. No interoperable request action requires it: a Station can
allocate a scoped local response resource, connection-local correlation can
remain in the Transport Profile, and Reliable Exchange owns protected logical
Message identity. Keeping `envelopeId` would add stable correlation and
duplicate authority without passing the necessity gate.

The active definition has no `envelopeId`; the registry, schema, corpus,
requirements, projections, and generated artifact close the rejection as one
source migration.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
