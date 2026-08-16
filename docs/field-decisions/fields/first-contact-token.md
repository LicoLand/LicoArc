# Field Review: First-Contact Delivery Token

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-first-contact-token` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Candidate spellings | invitation token, capability token, anonymous route token |
| Candidate layer | Rejected independent Discovery, Transport Profile, or Outer Header field |
| Observer set | Inviter Endpoint, initiating Endpoint, Station, possibly directory |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the rejection decision and is not a second field specification. |
| Authority targets | The future Transport Profile and Pairwise Protection profile must specify the first-contact Delivery Handle scope and protected handshake validation without adding this field. |
| Predecessor or successor | The visible routing role is already owned by [`FLD-delivery-handle`](delivery-handle.md); any future independent token proposal requires a new successor record. |
| Current conclusion | Reject an independent first-contact token field. A short-lived, non-enumerable, purpose-scoped, single-use Delivery Handle supplies the visible routing capability; Endpoint-protected handshake data supplies identity and invitation validation. |

## Question

What minimum token lets an unknown Endpoint initiate one bounded protected
contact without exposing a stable Endpoint address or granting a Station
identity authority?

## Role in communication

The inviter creates or authorizes a bounded first-contact capability. The
initiator presents it. A Station may route on it, but the receiving Endpoint
must validate scope, audience, expiry, single-use state, and the resulting
protected handshake.

## Contribution to LicoArc's final vision

Rejecting an independent first-contact token prevents duplicate routing
authority; one purpose-bound Delivery Handle and protected invitation binding
remain sufficient.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Theft, replay, scope confusion, token substitution, and oracle responses are primary risks. |
| Privacy and metadata | Reuse or issuer structure can link inviter, invitee, Station, and attempts. |
| Interoperability | Exact consumption, expiry, race, revocation, and retry behavior must be deterministic. |
| Implementation complexity | Single-use distributed state is difficult under concurrent Stations and partitions. |
| CPU, memory, and wire cost | Token bytes are small; replay and revocation state can be significant. |
| Evolution and downgrade | A token cannot silently become a stable address or weaker bearer credential. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Route and authorize unsolicited first contact without publishing a stable address. |
| Removal consequence | First contact requires a pre-existing session, stable public route, or another invitation mechanism. |
| Derivation | Cannot be safely derived from public Endpoint identity without enumeration risk. |
| Lower-layer carrier | Capability URI, QR payload, link, or Transport Profile request target. |
| Protected placement | Some routing component must remain visible; authorization and identity binding must be endpoint-validated. |
| Duplicate-authority risk | Invitation token, Delivery Handle, and handshake token can overlap or disagree. |

## Value model

There is no independent value model. First contact specializes the admitted
Delivery Handle rather than adding an invitation, capability, or anonymous
route field. The Delivery Handle's exact entropy, encoding, audience, route
scope, expiry, consumption, replay, and invalid-input behavior remain future
Transport Profile specification work. Endpoint identity, invitation purpose,
and handshake authorization remain endpoint-protected and cannot be derived
from Station routing success.

## Alternatives

- Reuse a short-lived Delivery Handle with explicit first-contact scope:
  selected; it is the only Station-visible routing capability.
- Capability URI distributed out of band: it may carry the admitted Delivery
  Handle and protected invitation material, but does not create a new field.
- Endpoint-authenticated invitation data containing or binding the routing
  component: belongs to the protected handshake, not Station-visible routing.
- Directory-mediated invitation, rejected if the directory becomes final
  trust authority.
- No anonymous first contact in the first release.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push capability URLs
  use unguessable bearer URLs for bounded resource access, while warning that
  disclosure grants authority.
- Matrix invitation tokens and room membership
  depend on homeserver-visible
  membership state and therefore cannot be adopted wholesale.
- One-time prekeys in asynchronous messaging inform single-use state, but a
  cryptographic prekey and a routing capability solve different problems.

## Decision history

Repository review rejected the independent first-contact token field on
2026-08-02. The admitted Delivery Handle already supplies the only
Station-visible value required to route one bounded first-contact attempt.
Adding another token would duplicate route authority, create disagreement and
substitution cases, and expose an additional correlation value without
enabling a new interoperable action. This duplicate scope is an objective
admission failure, so the record moves directly from `OPEN` to `REJECTED`.

This rejection does not remove first contact. The future Transport Profile
must close the specialized Delivery Handle's entropy, scope, expiry,
single-use and concurrent-redemption behavior. The future Pairwise Protection
profile must independently authenticate the peer, invitation purpose, and
handshake transcript. Neither obligation can reintroduce this independent
Station-visible field.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
