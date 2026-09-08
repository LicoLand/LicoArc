# Field Review: Protected Padding Absence

This record preserves explanation and decision history. Normative disposition
comes only from the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protected-padding-absence` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `paddingLength`, `unpaddedLength`, profile-owned padding grammar, or no field |
| Candidate layer | Pairwise Protection |
| Observer set | Endpoint, Station, carrier, and outside observer |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, Canonical Field Registry, the stable-core Protection Profile, and conformance material |
| Predecessor or successor | Succeeds `FLD-padding-length`. |
| Current conclusion | The mandatory profile contains no discretionary traffic-shaping padding field, grammar, budget, or negotiation surface. |

## Question

Does a mandatory profile need a field or profile-owned grammar for bytes added
solely to reshape observable traffic length?

## Role in communication

No producer emits such a value and no consumer performs an interoperable
action from it. Endpoints parse only the deterministic framing and intrinsic
cryptographic overhead required by their exact Protection Profile.

## Contribution to LicoArc's final vision

The absence of traffic-shaping padding preserves a minimal deterministic wire while making residual length and timing leakage explicit.

## Field model and trade-offs

There is no field and no profile-owned discretionary grammar. Cryptographic
tags, nonces, fixed primitive encodings, and deterministic record framing are
intrinsic protocol overhead rather than traffic shaping.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Not a field |
| Presence | Forbidden in the mandatory profile |
| Values or range | None |
| Canonical representation | None |
| Invalid input | Input claiming the mandatory profile while adding discretionary traffic-shaping bytes is invalid |

## Necessity proof

No interoperable action requires the value. Omission reduces bandwidth,
latency, allocation, and mobile energy cost. It deliberately leaves actual
outer packet length, timing, frequency, route, and correlation visible.

## Visibility and trust

A Station and transport observer can see outer packet length and timing. No
Endpoint may infer anonymity, unlinkability, or traffic analysis resistance
from Pairwise Protection. Endpoint-protected plaintext and message semantics
remain confidential under the selected Protection Profile.

## Alternatives

Omission is selected. Explicit length fields, deterministic buckets, random
expansion, delayed emission, and synthetic traffic are rejected for the
mandatory profile. A future materially different transport proposal requires
new decision records and a distinct profile identity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the LicoArc-owned performance and
metadata-boundary question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Protection semantics remain unchanged; the protocol makes no anonymity claim. |
| Privacy and metadata | Exact outer length, timing, frequency, route, and correlation remain residual metadata. |
| Interoperability | The mandatory grammar has no padding selector, field, schedule, or removal rule. |
| Implementation complexity | Omission removes schedule negotiation, expansion, parsing, and validation paths. |
| CPU, memory, and wire cost | No discretionary bytes, copies, random generation, or delay are introduced. |
| Evolution and downgrade | A profile cannot add traffic-shaping bytes under the mandatory profile identifier. |

## Decision history

The earlier `FLD-padding-length` rejection kept a profile-owned padding
grammar. The approved performance first review selected complete omission and
updated the durable product, architecture, and registry authorities in the
same bounded migration. This successor does not reinterpret the predecessor.

## Definition evidence

The definition status is `SPECIFIED`. The stable-core record grammar and
bounds admit only intrinsic cryptographic framing and no discretionary
traffic-shaping bytes, selector, negotiation, or compatibility form.
