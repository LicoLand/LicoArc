# Field Review: Protocol Support Statement v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-support-statement-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Protocol Line selection](../../../spec/protocol-lines.json) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/protocol-lines.json`, `spec/v1/manifest.json`, `spec/v1/protection/`, `formal/`, and `conformance/v1/foundation/` |
| Predecessor or successor | Replaces retired `FLD-supported-protocol-lines` and `FLD-supported-protection-profiles`; preserves no retired bytes. |
| Current conclusion | Each Endpoint authenticates one bounded canonical support statement whose entries are exact `(wireId, generation, protocolLineId)` tuples and whose monotonic minimum-generation floor is authenticated with the statement. `protocolLineId` is a DIGEST256 content identity; `wireId` is only a source/catalog locator. |

## Question

Which exact statement lets two Endpoints establish their common complete
Protocol Lines without implementation inference, component negotiation,
content-identity ambiguity, downgrade, or Station authority?

## Role in communication

Each Endpoint produces and authenticates its own support statement. Selection
consumes only entries whose exact line content identity is known, complete,
session-eligible, and allowed by both authenticated minimum-generation floors.
A Station may carry, suppress, replay, or reorder the statement but cannot add
support, lower a floor, authorize a fallback, or select a component Profile.

## Contribution to LicoArc's final vision

Binds one interoperable Endpoint choice to one immutable complete Protocol Line
while preserving Endpoint authority and preventing a carrier, implementation,
or loose capability list from changing protocol meaning.

## Field model and trade-offs

| Value | Approved model |
| --- | --- |
| Support statement | One Endpoint-authenticated canonical object; collection and encoded size are bounded by the complete line. |
| Support entry | Exact tuple `(wireId, generation, protocolLineId)`; entries are canonical, unique, and bounded. |
| `wireId` | Bounded textual source/catalog locator only; it is not a content identity, algorithm selector, or fallback key. |
| `generation` | Unsigned Protocol Line generation used for ordering and the unique-highest choice. |
| `protocolLineId` | Exactly one 32-octet DIGEST256 content identity of the immutable line semantic projection. |
| Minimum floor | Authenticated monotonic `minimumProtocolGeneration`; it cannot decrease, reset, or be supplied by a Station. |
| Profile membership | Owned by the complete line; no independent `supportedProtectionProfiles` negotiation is admitted. |

The selection filter order is fixed: known exact content identity, complete
definition, new-session policy, session eligibility, both minimum floors,
mandatory capability closure, and complete eligible Profile membership. The
unique highest common generation is selected; zero, unknown, mismatched,
unauthenticated, or ambiguous results fail terminally with no state advance.

## Visibility and trust

Support values can fingerprint an Endpoint and a modified statement can force
denial or downgrade. The complete statement and floor are Endpoint-authenticated
before establishment; Station transport is non-authoritative. The exact
transcript binds both statements and the selected result so replay or
cross-context substitution cannot establish a session.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Endpoints need one authenticated, content-addressed common-line input before session establishment. |
| Removal consequence | Without it, implementations can infer support, negotiate components, or silently choose a lower line. |
| Derivation | A textual name or implementation registry cannot prove immutable semantic identity; the line content digest is required. |
| Lower-layer carrier | Station or Transport can carry bytes but cannot authenticate Endpoint support or enforce the floor. |
| Protected placement | The statement is authenticated as Endpoint input and its exact result is transcript-bound; no established-record repetition is needed. |
| Duplicate-authority risk | Independent Profile lists, capability digests, or common fields would conflict with line-owned Profile membership and are rejected. |

## Decision history

The earlier digest-only collection was withdrawn because it omitted generation,
minimum-floor, complete-definition, and authenticated-transcript semantics.
Repository review on 2026-08-31 adopted the bounded tuple statement,
monotonic floor, fixed fail-closed selection order, and line-owned Profile
membership. The exact wire labels and canonical encoding are closed by the
linked machine authority.

## Decision outcome

The selected statement and selection boundary are approved. This decision
does not permit independent Profile or component negotiation.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked schema, labels, bounds, signature input, transcript encoding,
conformance vectors, and aggregate line binding close the exact statement.

## Comparative evidence, never authority

Protocol Line and content-addressing materials may inform vocabulary and risk
only. They cannot define LicoArc field names, values, placement, trust, or
lifecycle.
