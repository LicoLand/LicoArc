# LicoArc Status

## Definition authority

This protocol-definition repository owns `licoarc.protocol-line.v1`, initial V1 /
Generation 1. The canonical manifest reports Candidate / PARTIAL,
`sessionEligible: false`, `publicationEligible: false`, with blocker
`SEC-proof-requalification`. Package version 0.1.0 is unchanged.

The Endpoint Core has five mandatory capabilities. Group Collaboration, HTTPS
Transport and Federation Governance are separately defined optional scopes.
The Nostr binding is SPECIFIED and independent of the ordinary NIP-17 chat path;
its enhanced path cannot bypass core session admission.

Durable work has no protocol lifetime. Capability updates reach existing authorized
conversations without rebind. Source definitions and deterministic models cover
custody, recovery, live capability repair, confirmation facts and Group continuity.
The revised cryptographic transcript and admission have not completed current proof
admission; the old evidence has not been relabelled as new evidence.

## Tracked source closure

The tracked definition graph is under `spec/` and `conformance/`. Deterministic
artifacts bind its schemas, policies, corpus and current content identities.
`formal/requalification.json` binds the retained prior proof and lists new proof
obligations. `formal:generate` and `formal:check` stop explicitly until the formal
model has been requalified; source tests do not advance that status.

`docs/references/` is ignored local research, not a definition source.

## Ownership boundary

Publishing repository source and documentation does not publish a Protocol Line,
authorize a session, claim a crypto implementation, or establish delivery through a
malicious Station. SDKs, client integration, independent interoperability, security
audits, packaging, deployment, support and operation remain downstream concerns.
Those downstream results cannot advance or block a LicoArc definition or alter its
bytes. The source-owned formal gate is a separate, currently open obligation.
