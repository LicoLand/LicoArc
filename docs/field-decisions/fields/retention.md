# Field Review: Absolute Retention Timestamp

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-retention` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `expiresAt`, absolute expiry timestamp |
| Candidate layer | Former structured Outer Envelope body |
| Observer set | Sender Endpoint and Station |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the exclusion decision and is not a second field specification. |
| Authority targets | Removal from the successor Candidate schema, registry, corpus, requirements, and bundle |
| Predecessor or successor | [`FLD-transport-retention`](transport-retention.md) owns the separate relative Transport Profile parameter question |
| Current conclusion | An absolute structured-body `expiresAt` field is excluded; the separate sender-supplied relative retention proposal is rejected by `FLD-transport-retention`. |

## Question

Does the target station-facing carrier need a sender-provided absolute expiry
timestamp in a structured body?

## Role in communication

The Station may use the value to stop attempting delivery and reclaim
resources. Endpoint acceptance must use protected freshness and replay state,
not this value or the Station's clock.

## Contribution to LicoArc's final vision

Rejecting a sender-supplied absolute expiry prevents Station clocks and
retention policy from becoming message freshness or delivery authority.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | A malicious Station can ignore, shorten, or extend retention by copying bytes; endpoints cannot treat the value as proof. |
| Privacy and metadata | Exact absolute times improve cross-Station correlation; coarse relative values may leak less. |
| Interoperability | Unit, range, overflow, zero, and response semantics must be identical across languages. |
| Implementation complexity | A fixed profile window avoids absolute-time parsing and clock-synchronization branches. |
| CPU, memory, and wire cost | Wire cost is small; queue and storage cost is Station-local and potentially large. |
| Evolution and downgrade | Retention semantics must not be confused with protected freshness during migration. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bound an interoperable store-and-forward request when offline delivery is part of the profile. |
| Removal consequence | The Station applies local retention policy; interoperability may still work but sender intent is lost. |
| Derivation | A Station can derive age from local arrival time, but not the sender's requested window. |
| Lower-layer carrier | A Transport Profile retention parameter can carry it. |
| Protected placement | Endpoint freshness belongs in the protected packet; hiding a Station action request would make it unusable. |
| Duplicate-authority risk | Absolute expiry plus protected expiry or local Station TTL can disagree. |

## Value model

The rejected representation is an absolute timestamp in a structured body. It
depends on sender clock interpretation, leaks precise correlation data, and
duplicates both Station-local retention policy and protected Endpoint
freshness. A relative duration has different semantics and belongs to the
separate `FLD-transport-retention` decision.

## Alternatives

- No field; Station policy alone controls retention.
- Relative TTL in the Transport Profile.
- Absolute expiration time in the envelope.
- Coarse retention classes that leak less precision.
- Endpoint-protected expiration used only for endpoint acceptance, separate
  from Station cleanup.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push TTL
  uses seconds, permits shorter retention, and separates service retention
  from application processing.
- Matrix exposes server-origin timestamps and
  event age, but those
  homeserver-visible values are too entangled with server state to inherit.
- Reliable messaging systems commonly keep retention as broker policy; those
  implementation settings are not automatically federation fields.

## Decision history

After its admission evidence closed and the record reached `READY`, repository
review approved exclusion on 2026-08-01: the target carrier has no
structured Outer Envelope and no absolute `expiresAt` body field. Absolute Station
retention time cannot prove Endpoint freshness, replay status, deletion, or
delivery, and its precise timestamp adds clock dependence and correlation.

This record's bounded definition remains partial. The station-facing carrier
has no sender-supplied expiry field; the successor field decision rejects a
relative request in favor of one fixed Transport Profile window.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
