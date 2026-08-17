# Lico Arc HTTPS Transport Profile v1

Status: Candidate source specification. This document defines carriage only. It
does not publish a Protocol Line, authorize a Station, implement an HTTP client
or server, or turn a Station response into Endpoint evidence.

## Profile identity and authority

The profile and wire identifier is licoarc.https-transport.v1 under Protocol
Line licoarc.v1. Normative machine sources are the registry, bounds, labels,
closed request and response schemas, runtime CDDL, and conformance manifest
under the v1 transport source roots.

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
| RETRIEVE | POST /v1/handles/{deliveryHandle}/retrieve | deterministic CBOR control | 200 one raw protected packet |
| CLAIM | POST /v1/handles/{deliveryHandle}/claim | deterministic CBOR control | 200 bounded deterministic CBOR |
| SETTLE | POST /v1/handles/{deliveryHandle}/settle | deterministic CBOR control | 200 bounded deterministic CBOR |

deliveryHandle is one 32-byte opaque token encoded as exactly 43 unpadded
base64url characters. It appears only in the fixed request-target slot. A
sender envelope identifier, packet-length field, expiry, retention class,
receipt token, polling resource, and JSON outer envelope are forbidden.

Control records use deterministic CBOR, definite shortest encodings, compact
unsigned labels, closed maps, and bounded byte strings. Duplicate or unknown
labels, tags, floats, indefinite lengths, non-shortest integers, trailing
bytes, or an over-bound value reject the complete operation before state
changes. SUBMIT and an accepted RETRIEVE carry exactly one non-empty raw
protected packet of at most MAX_PACKET_BYTES.

## Storage, claim, and settlement

A Station accepts SUBMIT only when it can retain the opaque packet for the
single fixed STORAGE_WINDOW_SECONDS interval. A caller cannot select or extend
retention. Retry, reconnect, Route change, and Station migration never reset
the storage, idempotency, or claim window.

CLAIM returns at most MAX_CLAIM_ITEMS and MAX_CLAIM_BYTES, bound to one claim
identifier and monotonically checked claim epoch. RETRIEVE reads one item in
that live claim. SETTLE atomically marks each requested item complete or
releases it. Stale claims, duplicate item identities, over-bound batches, and
settlement attempts beyond the fixed bound fail closed.

A first-contact handle accepts at most one submission and is consumed by that
acceptance. An asynchronous handle remains finite and bounded by its service
statement. Station service signatures are inputs describing service only;
they do not authenticate a peer or a protected packet.

## Outcomes and retry

The only outcomes are accepted, rejected, transient, and ambiguous. The exact
status mapping and failure classes live in the registry.

- accepted says only that the Station accepted the carrier operation under its
  declared bounded service.
- rejected is terminal for the unchanged request.
- transient may be retried with the same operation identifier and identical
  canonical request.
- ambiguous means the operation might have committed and may be retried only
  with the same identifier and identical request.

Reusing an operation identifier with different canonical headers, target,
control bytes, or protected packet bytes is a conflict and fails closed.
No response, timestamp, signature, queue observation, claim, settlement, or
deletion statement advances Endpoint Accepted, Effect Completed, freshness,
replay, trust, peer identity, or transferable evidence.

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

## Failure and effects

Malformed carrier or control input is rejected before operation state changes.
If a Station cannot honor the fixed storage or claim contract, it rejects
before acceptance. Station loss, deletion, replay, equivocation, correlation,
selective denial, false outcomes, and unavailability remain threat-model
inputs to Endpoint-owned Reliable Exchange.

This profile is pure protocol input. Conformance testing performs no socket,
DNS, TLS, credential, certificate-store, account, signing, deployment, or
hosted-operation effect.
