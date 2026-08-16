# Field Review: Affiliation Not-After

This record is explanatory. The
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) is normative.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-affiliation-not-after` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | affiliation expiry, guarantor expiry, binding lifetime |
| Candidate layer | AFFILIATE result and protected StationAffiliation |
| Observer set | Affiliating Endpoint and Station; peer Endpoints under protection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Future affiliation schemas and corpus |
| Predecessor or successor | None |
| Current conclusion | Every Station-accepted affiliation commitment has one finite Station-selected upper bound no later than the signing descriptor's expiry. |

## Question

Until when may peers treat B's affiliation signature as a current Station
service commitment?

## Role in communication

B selects and signs the value in an accepted AFFILIATE result. The Endpoint
projects it unchanged into `StationAffiliation`; peers stop accepting the entry
after the bound.

## Contribution to LicoArc's final vision

Bounds how long Station acceptance can support a current affiliation so stale
service relationships cannot remain authoritative indefinitely.

## Field model and trade-offs

The bound makes B's role finite and renewable without embedding B in Endpoint
identity or turning affiliation into a promise of service availability.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Unsigned Unix seconds |
| Presence | Mandatory in accepted AFFILIATE result and StationAffiliation |
| Values or range | Within fixed profile maximum and no later than descriptor `notAfter` |
| Canonical representation | Deterministic unsigned integer |
| Invalid input | Missing, expired, beyond profile maximum, or later than descriptor expiry fails closed; never silently truncated |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bound replay and force periodic Station re-acknowledgement of affiliation. |
| Field-level necessity | Descriptor expiry bounds a key/descriptor, not one Endpoint-specific commitment. |
| Removal consequence | A signed affiliation can be presented indefinitely. |
| Derivation | A peer cannot derive Station-local commitment lifetime. |
| Existing carrier | `serviceUntil` is per Route; `routeNotAfter` is Endpoint-selected and relationship-scoped. |
| Protected placement | Station sees its value; peers receive it only under protection. |
| Duplicate-authority risk | The field has one Station producer and cannot be overridden by Endpoint time. |

## Visibility and trust

The Station can refuse service before expiry. Signature integrity proves only
the bound it issued. Expiry invalidates active use but never resets
`affiliationEpoch` or the retained digest.

## Alternatives

Implicit lifetime, Route expiry reuse, descriptor-expiry-only, and
sender-selected TTL were rejected because their producers and scopes differ.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

TUF informs signed expiry;
MLS informs state/delivery separation; and
Matrix supplies server-authority rejection
evidence.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Bounds replay but not Station refusal or deletion. |
| Privacy and metadata | Hidden from the public; peers observe renewal cadence. |
| Interoperability | Exact skew, maximum lifetime, and rejection behavior remain required. |
| Implementation complexity | One signed comparison and renewal trigger. |
| CPU, memory, and wire cost | One integer. |
| Evolution and downgrade | Later profiles may shorten limits but cannot reinterpret scope. |

## Decision history

The global-affiliation review admitted a separate Station-selected expiry and
explicitly selected reject, not accept-and-cap, when it exceeds descriptor
validity.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
