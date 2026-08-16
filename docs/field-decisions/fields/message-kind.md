# Field Review: Generic Message Kind

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-message-kind` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `kind`, `type`, record class |
| Candidate layer | Generic Message inside protection |
| Observer set | Peer Endpoints |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Current conclusion | Mandatory protected `kind` is the closed enum `event`, `request`, `response`, `error`, `cancel`, or `streamChunk`. |

## Question

How does a receiver select the exact Generic Message grammar and state
transition without exposing product semantics to the Station?

## Role in communication

The Endpoint parser selects one of six application-neutral record classes.
The kind controls required and forbidden fields, correlation behavior, and
state-machine transitions. Application command names remain inside opaque
content or namespaced extensions. Attachment chunks remain `streamChunk`;
Attachment Receive State reuses `event` with one Protocol-Line-owned
`contentType`, so recovery does not add a product or transport kind.

## Contribution to LicoArc's final vision

Defines a small application-neutral protected record core so independent
Endpoints share deterministic state transitions without importing product
commands.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Closed per-kind schemas prevent type confusion and forbidden-field smuggling. |
| Privacy and metadata | Protected placement prevents Stations from classifying message purpose directly. |
| Interoperability | Exact enum and per-kind constraints are straightforward to test across languages. |
| Implementation complexity | Six explicit variants map deterministically to tagged unions in independent implementations. |
| CPU, memory, and wire cost | Integer tags are smaller; text tags are more inspectable before protection. |
| Evolution and downgrade | New core kinds require a new compatible capability or Protocol Line and criticality rules. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Deterministically parse and validate one protected record class. |
| Removal consequence | Receivers must infer semantics from optional fields, producing ambiguous unions. |
| Derivation | Not safely derivable when record shapes evolve or overlap. |
| Lower-layer carrier | Transport method or status cannot describe endpoint Generic Message semantics. |
| Protected placement | The kind changes endpoint interpretation and must be endpoint-authenticated and hidden. |
| Duplicate-authority risk | Outer event type, application type, and record kind can conflict unless each layer owns one discriminator. |

## Value model

The semantic enum is exactly `event`, `request`, `response`, `error`, `cancel`,
and `streamChunk` for the approved first closure. Protocol-Line-pinned
deterministic encoding,
per-kind required fields, and unknown-value failure are fixed by the containing
Protocol Line. Product-specific kinds are forbidden from the core.

A `streamChunk` is independently retryable and confirmable. The attachment
tuple, not Message kind, supplies its reassembly identity.

## Alternatives

- Closed explicit enum.
- Shape-based inference, rejected as ambiguous and brittle.
- A request/response/error-only model, insufficient for events,
  cancellation, and streaming.
- Open string type registry, rejected for the fixed core; product semantics
  use namespaced extensions.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- MCP uses
  JSON-RPC request, response, error, and
  notification shapes, showing
  the value of a small application-neutral core.
- Matrix uses open event-type strings and room
  semantics, offering
  extensibility at the cost of a larger server-visible event model.
- MLS separates proposal, commit, and application
  content at its authenticated
  framing layer; LicoArc needs its own pairwise Generic Message set.

## Decision history

The original decision fixed six semantics while leaving exact spelling and
encoding open. The Canonical Field Registry selected the protected field name
`kind` and exact values, including camel-case `streamChunk`; the future
versioned schema still closes every variant and invalid union.

LicoArc review on 2026-08-03 confirmed that selective attachment recovery
requires no seventh kind: a protected `event` reports receive state and
existing `streamChunk` carries immutable raw-byte slices.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
