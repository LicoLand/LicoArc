# Field Review: Fixed Initial Handshake Transcript

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-transcript-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | Approved initial V1 Endpoint authentication intent |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/v1/protection/handshake.schema.json`, `spec/v1/protection/labels.json`, `spec/v1/protection/runtime.cddl`, and `spec/v1/protection/algorithms.json` |
| Predecessor or successor | None |
| Current conclusion | One closed first packet authenticates the exact fixed context. |

## Question

Which values must the Endpoints authenticate before committing a session?

## Role in communication

The initiator sends the fixed line and Profile identities, both Endpoint and
sibling user-authority-state digests, responder signed prekey, initiator key
IDs, hybrid ephemeral inputs, two initiator signatures and client confirmation.
The responder checks the exact identity/key bindings before accepting the
confirmation and atomically redeeming the prekey pair.

## Contribution to LicoArc's final vision

Establishes private Endpoint communication through an untrusted Station while
leaving delivery and identity authority at the Endpoints.

## Field model and trade-offs

The initial packet is one deterministic CBOR map with labels 0 through 14.
Every member is required; extra, duplicate, missing, malformed, noncanonical,
over-bound or trailing input rejects. Line/Profile and identity digests are
32 bytes. The exact field lengths, integer bounds, signature input and
transcript projections are owned by the linked machine authority.

## Necessity proof

The content identities prevent protocol-context substitution. Identity states
and key IDs prevent key misbinding; sibling authority digests preserve the
independent device-authority boundary. Ephemeral values and confirmations bind
the actual session keys. These values cannot be inferred from Station metadata.

## Visibility and trust

The intended recipient authenticates the packet. Station transport never
supplies an identity decision or permission to advance protected state.

## Alternatives

Omitting exact context binding or trusting carrier claims is rejected. The
single fixed protocol needs no version-policy exchange or alternate decoder.

## Decision history

The confirmed initial V1 / Generation 1 direction defines one unpublished
wire shape. Device-authority epochs and ratchet state keep separate meanings.

## Definition evidence

The closed schema, labels, grammar, canonical projections and corpus own the
specified packet and transcript. Independent implementations verify it in
their own repositories.
