# Lico Arc HTTPS Transport Profile v1

Status: Candidate source specification. This document defines carriage only. It
does not publish a Protocol Line, authorize a Station, implement an HTTP client
or server, or turn a Station response into an Endpoint confirmation.

## Profile identity and authority

The stable Transport contract/wire locator is `licoarc.https-transport.v1`.
The enclosing Protocol Line content identity is selected and authenticated by
session establishment; this carrier neither repeats nor selects it. Normative
machine sources are the registry, bounds, labels, closed request and response
schemas, runtime CDDL, and conformance manifest under the v1 transport source
roots.

The registry fixes all carrier and state meaning. HTTP, TLS, a Station, a
certificate issuer, and an implementation are not independent protocol
authorities.

## Carrier

Every operation uses HTTP/2 over TLS 1.3. HTTP/1.1, HTTP/3, h2c, TLS early
data, renegotiation, content coding, transfer encoding, trailers, queries,
fragments, and streaming request bodies are forbidden.

The Endpoint validates the certificate chain and the DNS-ID SAN against the
authenticated listener name in the Station descriptor. Common Name fallback
and wildcards are forbidden. An IPAddress SAN is accepted only when the
authenticated listener itself uses that exact IP literal. The profile does not
require client certificates or application-specific certificate pinning.

Every request has one lowercase 32-hex-character LicoArc-Operation-Id.
Content-Length is canonical decimal and equals the exact body octet count.
The profile media type has no parameters.

## Operations

| Operation | Method and target | Request body | Accepted result |
| --- | --- | --- | --- |
| AFFILIATE | POST /v1/affiliate | deterministic CBOR control | 201 deterministic CBOR |
| RESERVE | POST /v1/reserve | deterministic CBOR control | 201 deterministic CBOR |
| SUBMIT | POST /v1/handles/{deliveryHandle}/submit | one raw protected packet | 202 deterministic CBOR |
| CLAIM | POST /v1/handles/{deliveryHandle}/claim | deterministic CBOR control | 200 bounded deterministic CBOR |
| SETTLE | POST /v1/handles/{deliveryHandle}/settle | deterministic CBOR control | 200 bounded deterministic CBOR |

deliveryHandle is one 32-byte opaque token encoded as exactly 43 unpadded
base64url characters. It appears only in the fixed request-target slot. A
sender envelope identifier, packet-length field, expiry, retention class,
receipt token, polling resource, and JSON packet wrapper are forbidden.

Control records use deterministic CBOR, definite shortest encodings, compact
unsigned labels, closed maps, and bounded byte strings. Duplicate or unknown
labels, tags, floats, indefinite lengths, non-shortest integers, trailing
bytes, or an over-bound value reject the complete operation before state
changes. SUBMIT carries exactly one non-empty raw protected packet of at most
MAX_PACKET_BYTES. CLAIM is the sole packet-acquisition operation.

## Storage, claim, and settlement

A Station accepts SUBMIT only when it can retain the opaque packet for the
single fixed STORAGE_WINDOW_SECONDS interval. A caller cannot select or extend
retention. Retry, reconnect, Route change, and Station migration never reset
the storage, idempotency, or claim window.

CLAIM returns the protected packets themselves: at most MAX_CLAIM_ITEMS and
MAX_CLAIM_BYTES, bound to one claim identifier and monotonically checked claim
epoch. SETTLE atomically closes every requested claim membership: `complete`
removes its packet and `release` returns its packet to the available queue.
The whole SETTLE request commits once or not at all. Stale claims, duplicate
item identities, over-bound batches, and settlement attempts beyond the fixed
bound fail closed without mutation.

A first-contact handle accepts at most one submission and is consumed by that
acceptance. An asynchronous handle remains finite and bounded by its service
statement. Station service signatures are inputs describing service only;
they do not authenticate a peer or a protected packet.

## Body authority, outcomes, and retry

The deterministic CBOR response body is the sole Lico Arc authority for the
outcome, failure class, retry hint, claim identity, claim epoch, packets, and
settlement results. Semantic response headers are forbidden. HTTP status is
validated only for consistency with the already decoded body; a missing or
malformed body, an unknown status, or a mismatch is a carrier failure and
leaves state unchanged. The only body outcomes are accepted, rejected,
transient, and ambiguous. The exact consistency mapping and failure classes
live in the registry.

- accepted says only that the Station accepted the carrier operation under its
  declared bounded service.
- rejected is terminal for the unchanged request.
- transient may be retried with the same operation identifier and identical
  canonical request.
- ambiguous means the operation might have committed and may be retried only
  with the same identifier and identical request.

Reusing an operation identifier with different canonical headers, target,
control bytes, or protected packet bytes is a conflict and fails closed.
Every operation validates against tentative queue, claim, and idempotency
state, then commits its state plus canonical request digest and canonical
response body in one transaction. Exact retry replays that body without
reapplying state. Restart restores all three state families before accepting
input. Malformed, conflicting, stale, over-bound, or status-mismatched input
returns the byte-identical pre-state.
No response, timestamp, signature, queue observation, claim, settlement, or
deletion statement advances Endpoint Accepted, Effect Completed, freshness,
replay, trust, peer identity, acceptance, effect, or finality.

## Residual metadata

The Station and network can observe the Delivery Handle on handle-bound
operations, fixed operation type and path, actual framed body length, media
type, status, operation identifier within its idempotency scope, connection
route, certificate name, timing, frequency, retry pattern, and typed Station
outcome. Equality of handles, operations, packets, sizes, routes, and timing
can correlate activity.

Only protected packet bytes hide application plaintext and meaning. The
profile makes no anonymity, unlinkability, presence hiding, traffic-analysis
resistance, or traffic-shaping claim. It adds no discretionary padding,
artificial delay, synthetic messages, mandatory keepalive, or sender-selected
retention.

## Exact resource accounting

The canonical control maximum is 2,739 octets. A maximum CLAIM carries
33,554,432 protected-packet octets plus exactly 2,739 surrounding CBOR octets,
so `MAX_CLAIM_RESPONSE_BYTES` is 33,557,171. Raw protected-packet octets are
excluded from control and Transport-overhead accounting because Pairwise
Protection and Reliable Exchange already charge them; retransmissions remain
charged to the Reliable Exchange budget.

Transport overhead counts the request and response decoded header-field
sections, request target, and canonical control-body octets. HTTP/2 and TLS
frame selection is implementation carriage outside this deterministic count.
With each header-field section bounded to 2,048 octets and the target bounded
to 128 octets, the exact operation maxima are 4,374 (AFFILIATE), 4,449
(RESERVE), 4,233 (SUBMIT), 6,967 (CLAIM), and 9,143 (SETTLE) octets. The
profile-wide maximum is therefore 9,143.

## Failure and effects

Malformed carrier or control input is rejected before operation state changes.
If a Station cannot honor the fixed storage or claim contract, it rejects
before acceptance. Station loss, deletion, replay, equivocation, correlation,
selective denial, false outcomes, and unavailability remain threat-model
inputs to Endpoint-owned Reliable Exchange.

This profile is pure protocol input. Conformance testing performs no socket,
DNS, TLS, credential, certificate-store, account, signing, deployment, or
hosted-operation effect.
