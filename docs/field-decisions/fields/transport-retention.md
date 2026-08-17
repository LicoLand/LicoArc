# Field Review: Transport Retention Request

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-transport-retention` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Candidate spellings | relative TTL, `retentionSeconds`, coarse retention class, no request |
| Candidate layer | Transport Profile parameter |
| Observer set | Sending Endpoint and Station |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the exclusion decision and is not a second field specification. |
| Authority targets | Future Transport Profile constant, pre-acceptance rejection semantics, corpus, and Protocol Line manifest |
| Predecessor or successor | Split from [`FLD-retention`](retention.md), which excludes absolute `expiresAt` |
| Current conclusion | Sender-supplied per-submission TTL, retention duration, and retention class are rejected; one fixed Transport Profile window applies to every accepted submission. |

## Question

Must the mandatory Transport Profile accept a sender-provided bounded relative
retention request for offline store-and-forward, or should one fixed profile
window apply to every accepted submission?

## Role in communication

The rejected field would have let a sender request an upper bound on one
delivery attempt. The approved profile constant supplies the interoperable
window without message-specific metadata. A malicious Station may still
discard early or retain copied bytes longer; neither the rejected field nor
the fixed window can prove deletion, Endpoint freshness, replay rejection,
receipt, or delivery.

## Contribution to LicoArc's final vision

Using one profile-owned storage window removes sender-selected retention
metadata and keeps bounded offline carriage deterministic.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | The fixed window remains transport-only and cannot become freshness, replay, deletion, or delivery evidence. |
| Privacy and metadata | No message-specific retention value is exposed; storage duration remains correlatable at the profile level. |
| Interoperability | One profile constant and one pre-acceptance inability failure avoid unit, zero, omission, overflow, and unsupported-value variation. |
| Implementation complexity | Removing the field eliminates parsing and per-submission policy branches; fixed-window queue behavior remains. |
| CPU, memory, and wire cost | No field cost; Station queue and storage cost remains local and potentially large. |
| Evolution and downgrade | The fixed window changes only with a new Transport Profile version and cannot be silently shortened after acceptance. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | No required interoperable action needs sender-selected lifetime; mandatory offline delivery needs only one profile window. |
| Field-level necessity | Failed: the fixed profile constant completes bounded store-and-forward without a request field. |
| Removal consequence | The fixed profile window still supports offline delivery, but the sender cannot request a portable per-submission upper delivery-attempt window. |
| Existing-field evidence | Current `expiresAt` presence proves only current Candidate shape and supplies no retention-parameter necessity. |
| Derivation | A Station can derive age from its local receipt time but cannot derive sender intent. |
| Lower-layer carrier | A Transport Profile parameter could carry the request, but carrier availability does not establish necessity. |
| Existing carrier | Protected Endpoint freshness cannot substitute because the Station cannot read it; the fixed profile window supplies the Station obligation without sender control. |
| Protected placement | Endpoint freshness remains separately protected; no Station-visible retention request is required. |
| Duplicate-authority risk | Relative request, Station policy, and protected freshness must have distinct names and precedence. |

## Value model

No per-submission value model is admitted. The future Transport Profile will
specify one exact storage-window constant and a typed pre-acceptance rejection
when a Station cannot honor it. Absolute time is independently excluded by
`FLD-retention`. The constant's exact duration remains Transport Profile
specification work rather than a message field.

## Visibility and trust

No sender retention value is exposed. Every accepted submission uses the same
profile window, reducing message-specific correlation. A malicious Station can
still suppress, shorten, replay, ignore, or retain a copy past that window.
Endpoints cannot treat the window as security or deletion evidence.

## Alternatives

- No parameter; the Transport Profile defines one mandatory fixed window and a
  Station unable to honor it rejects before acceptance. **Selected.**
- One bounded relative duration in the Transport Profile.
- A small closed set of coarse retention classes.
- Endpoint-protected expiry used only for Endpoint acceptance, which does not
  instruct Station cleanup.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push supplies comparison evidence for a
  relative TTL. LicoArc rejects that per-message control because one fixed
  profile window satisfies the required action with less visible metadata.
- HTTP supplies only carrier vocabulary; LicoArc
  must define any retention parameter itself.
- Matrix server timestamps and event age do not
  satisfy the Endpoint-authoritative trust boundary.

## Decision history

The objective admission failure permitted rejection from `OPEN`; repository
review rejected the sender-supplied retention field on 2026-08-02. One fixed
profile window supports mandatory bounded offline store-and-forward without a
per-message value, while Endpoint-protected acceptance time handles endpoint
freshness independently. A Station unable to honor the window rejects before
acceptance. The rejected field would add metadata and duplicate lifetime
semantics without enabling a required interoperable action.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
