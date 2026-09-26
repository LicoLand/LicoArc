# Lico Arc Protocol Product

## Final protocol vision

An open communication protocol for durable human and Agent collaboration across
independent devices and networks. Users can be offline; accepted messages and work
remain recoverable, and their conversations resume without manual reconstruction.
Capabilities evolve while conversations continue. An implementation brand, product,
workflow engine, model provider or database never grants protocol authority.

## Ownership and promises

The three domain entities are owned by [README](README.md#core-domain-model).
Endpoints control identity, keys, plaintext, consent and effects. Stations transport
and may durably store opaque bytes without becoming Endpoint trust authorities.
Networks provide interoperability context rather than legal identity or permission.

The protocol owns stable conversation/message meaning, authenticated custody and
result facts, live capability updates, recovery, bounded processing and adapter
boundaries. It does not select a storage engine, scheduling algorithm or tool body.
Applications own their typed requests/results and actual effect idempotency; they
must implement the durable execution admission contract before causing effects.

Already accepted work has no protocol TTL or total retry budget. Device receipt,
human reading, approval, execution and outcome evidence are distinct. A cancel
request does not fabricate a stopped effect; a missing result is not a failed effect.
Only explicit user actions or agreed application semantics may end a pending intent.
A business deadline can stop execution without deleting evidence or conversation.

## Conformance targets

The five-capability Endpoint Core is independent of transport. Group Collaboration,
HTTPS Transport and Federation Governance are separately defined optional scopes;
using one requires its complete relevant contract, not all unrelated services.
Nostr supplies an optional shared network. Standard NIP-17 chat is a distinct path;
a headless enhanced service need not implement that chat path. Any client implementing
shared open extensions may collaborate. No official service or LicoUp is required.

Capability advertisements describe interface role and availability to authorized
conversations only. They update live without identity rebind or crypto restart and
never authorize execution. Already accepted tasks keep their original interface
meaning while current permission is checked at each action boundary.

## Definition admission and evidence

The initial V1 / Generation 1 is still unreleased; package version 0.1.0 is unchanged.
The revised Candidate is PARTIAL, session-ineligible and publication-ineligible
pending source-owned formal requalification. This is not a V2 or legacy migration.
Content identities are recomputed whenever semantics change; retaining a version
label never permits using an old digest for new bytes.

Closed schemas, registries, requirement/corpus joins and deterministic bundles own
protocol meaning. `spec/v1/reliable/continuity.md`, messaging capabilities and Group
continuity define the new lifecycle contracts. The old proof and its exact source
identity are retained in `formal/`; `formal/requalification.json` records why they
are not current evidence. Definition checks do not establish implementation,
interoperability, audit, publication, deployment, support or operation.
