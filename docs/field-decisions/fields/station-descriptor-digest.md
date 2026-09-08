# Field Review: Station Descriptor Digest

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-descriptor-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Every Station affiliation and Route needs a digest binding to the exact descriptor whose `stationId` supplies the sole Station identity path and whose key verifies the applicable Station signature. |

## Question

How does an affiliation or Route bind to one exact immutable Station
descriptor?

## Role in communication

The Endpoint supplies the exact descriptor digest in AFFILIATE and protected
state. The descriptor's `stationId` supplies Station identity, while its key
verifies `stationAffiliationSignature` or `stationServiceSignature`.
The digest is content identity, not Endpoint identity, certification, or proof
that the Station behaves honestly.

## Contribution to LicoArc's final vision

Binds affiliation and Route state to one exact authenticated Station
descriptor so identity, keys, listeners, and validity cannot drift
independently.

## Field model and trade-offs

The value is mandatory `DIGEST256` field `stationDescriptorDigest`, binding an
AFFILIATE request/result, asynchronous RESERVE request, `StationAffiliation`,
or `Route` to one authenticated descriptor. Digest profile, canonical input,
domain separation, canonical input, mismatch handling, and replacement rules
are fixed by the Identity descriptor contract and HTTPS Transport v1.

## Visibility and trust

Observers can correlate identical descriptors through the digest. A Station
may serve, suppress, or withhold bytes but cannot substitute different bytes
without detection under the selected digest assumptions. Endpoints must pin
the expected authenticated digest before use.

## Decision history

Repository review decided that authenticated Station state must bind the exact
descriptor rather than inherit mutable lookup results. The portable
Station-affiliation review confirmed that resolving `stationId` through this
descriptor is the single Station-identity path; duplicate Affiliation- or
Route-level `stationId` fields would create conflicting authority. This detail page is not a
second protocol specification and does not select an algorithm.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
