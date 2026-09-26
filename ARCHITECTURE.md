# Lico Arc Protocol Architecture

## Independent lifetimes

The conversation is a durable authorized peer scope, not a connection or session.
A logical message and its protected intent survive routing, reconnect and recovery.
Application capability revisions do not change either identity. Existing authorized
conversations subscribe to relevant incremental capability updates; offline peers
repair them from authenticated, bounded snapshot pages without rebinding.

## Composition and dependency direction

```text
application definitions and authorized effects
                    |
live capability state / durable custody and task facts
                    |
Endpoint Core: Foundation, Identity, Protection, Messaging, Reliability
                    |
     optional carriage adapters (Nostr or native HTTPS or another approved path)
```

`spec/v1/foundation/targets.json` owns five core capabilities. Group Collaboration,
HTTPS Station carriage and Federation Governance have separate conditional targets.
A client need not implement a Station, and an enhanced headless service need not
implement standard Nostr chat. Transport code cannot choose keys, authority states,
application permissions, a tool catalogue or message lifetime.

## Durable transactions

Persist payload/ciphertext recovery material, native ratchet/replay state and inbox
admission together before releasing plaintext or acknowledging durable custody.
Persist exact prepared outputs before emission. Moving an accepted item between a
hot cache and durable spool transfers custody; evicting the only copy is forbidden.
Claim expiration releases exclusivity, never bytes. Quotas apply before acceptance.

Execution uses a durable gate keyed by authenticated origin, conversation and task
identity. Receiving a request does not require permission to execute it. Unknown
interfaces can be retained for display or later compatible handling. An external
side effect that may already have occurred is reconciled, not blindly retried.
Task outcome evidence is independent of the session that carried it; completion may
arrive before acceptance, and a cancelled local wait does not erase late facts.

## Identity and security

Each independently key-holding device is an Endpoint. Nostr account association is
protected identity control, separate from capability updates. Current authorization
and an unconsumed active paired prekey control establishment, not calendar expiry.
Asynchronous prepared exchanges/replay answers survive alternating online periods.
Never rewind nonce/counters or restart a stale sending state from an old backup.
Retaining delayed ciphertext requires an actual owner for recoverable key material.

Groups distinguish authenticated historical communication from authorization for
current effects. Missing ancestry requests repair; an authenticated fork quarantines
the affected state while the explicit base-authority resolution contract applies.
A device delivery result is not a human-read fact and does not grant multiple devices
permission to execute the same operation.

## Source graph and proof boundary

Normative records, schemas, CDDL, policies and definition corpora have closed source
manifests. Each component and the Protocol Line has a recomputed semantic identity;
the Nostr binding has its own content identity referencing the core. Generators may
update joins and bundles but never fabricate proof output or expected test results.

Current V1 is Candidate / PARTIAL, `sessionEligible: false`,
`publicationEligible: false`. The new transcript and admission rules require formal
requalification; old proof evidence remains bound to its old definition only.
The deterministic models demonstrate specification behavior, not production crypto,
a database durability guarantee, audited SDK behavior or deployed interoperability.
