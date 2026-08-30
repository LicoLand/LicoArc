# Field Review: Delivery Handle

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-delivery-handle` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `mailboxId`, `deliveryHandle`, push resource, request target |
| Candidate layer | Transport Profile request target |
| Observer set | Sender Endpoint, Station, receiving Endpoint's transport client |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Authority targets | The HTTPS Transport schema, registry, corpus, and complete Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | Asynchronous and first-contact Station routing use one short-lived opaque Delivery Handle in the Transport Profile request target; when projected into a current Route, the exact handle is covered by the Station's bounded service signature and never becomes a structured-body `mailboxId`, independent invitation token, or Endpoint identity. |

## Question

What minimum opaque value lets a Station route a packet without learning or
asserting Endpoint identity?

## Role in communication

The sender presents a routing capability or lookup handle. The Station uses it
only to choose a delivery queue or active receiver path. The receiving
Endpoint must not treat successful routing as proof of peer identity.

## Contribution to LicoArc's final vision

Provides a short-lived opaque routing capability that keeps Endpoint identity
and message meaning separate from Station addressing.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Must authorize only bounded routing and must not authenticate an Endpoint. Bearer capability theft is a direct risk. |
| Privacy and metadata | Equality, reuse duration, Station scope, and colluding-Station visibility dominate the metadata cost. |
| Interoperability | Exact entropy, encoding, comparison, and expiry rules are needed if LicoArc owns the value. |
| Implementation complexity | Transport-target carriage is simpler than duplicating route data inside the packet. |
| CPU, memory, and wire cost | Small, but Station indexes and abuse controls must remain implementation-local. |
| Evolution and downgrade | Stable handles become difficult to retire; rotation must not silently change Endpoint identity. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select the Station-local destination for asynchronous or multiplexed delivery. |
| Removal consequence | Delivery is impossible unless the connection, request target, or another carrier context already selects the destination. |
| Derivation | It cannot be derived from protected content without giving the Station decryption authority. |
| Lower-layer carrier | A capability URI, request path, connection binding, or authenticated transport context can carry it. |
| Protected placement | Endpoint identity and recipient binding must remain inside endpoint-authenticated protection. |
| Duplicate-authority risk | A body field plus request-target value can disagree and create route confusion. |

## Value model

The semantic value is a 32-octet opaque, non-enumerable capability in the
Transport Profile request target. One Protocol-Line-pinned URI-safe text
encoding is used only when a Transport Profile embeds it in a URI
representation. A first-contact specialization is
purpose-scoped, short-lived, single-use, and authorizes only one bounded
routing attempt; it does not authenticate either Endpoint or the invitation.
An accepted asynchronous reservation returns a Station-signed commitment to
the exact affiliation commitment, handle, Transport Profile, descriptor, and
`serviceUntil` value. The Endpoint-wide Affiliation Update selects the
Station; the Route Update only supplies private paths under that exact state.
The Station never signs `endpointIdentityRef` for this purpose. HTTPS
Transport v1 makes the handle Station-scoped, bounds the asynchronous route by
signed `serviceUntil`, consumes a first-contact handle on its one accepted
submission, preserves fixed idempotency state across retry and restart, and
rejects unknown, malformed, expired, conflicting, or already consumed use.
Human-readable names, domains, user IDs, device IDs, and implementation
database keys are not acceptable substitutes.

## Alternatives

- Capability URI or request target supplied by the Transport Profile.
- Connection-bound destination with no per-packet field.
- Short-lived opaque body/header value when the carrier cannot route
  otherwise.
- Stable mailbox/account identifier, rejected as the privacy baseline because
  it increases linkability and can be mistaken for Endpoint identity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push routes
  through capability URLs and requires substantial random entropy in those
  URLs. The routing value is not inside the encrypted message body.
- Matrix room and user identifiers enable rich
  server-side routing and state,
  but their stable, homeserver-visible semantics conflict with LicoArc's
  minimized Station role.
- MLS uses an untrusted Delivery Service, but group
  identifiers and group
  semantics do not directly solve pairwise opaque routing.

## Decision history

After its admission evidence closed and the record reached `READY`, repository
review approved the bounded placement decision on 2026-08-01: the
Delivery Handle is necessary for asynchronous Station routing, is carried by
the Transport Profile request target, and is not duplicated as `mailboxId` in
a structured body. The selected placement minimizes duplicate authority and keeps
route selection separate from Endpoint identity. The later portable
Station-affiliation review added a Station signature and service expiry around
the Route projection without changing the Delivery Handle into an identity or
availability guarantee.

HTTPS Transport v1 closes the 32-octet token, unpadded base64url target
encoding, Station scope, signed asynchronous service bound, first-contact
single-use behavior, atomic idempotency, restart, and invalid-input rules. The
rejected independent first-contact token alternative is recorded in
[`FLD-first-contact-token`](first-contact-token.md).

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
