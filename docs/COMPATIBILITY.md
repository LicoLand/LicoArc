# Compatibility and Protocol Line Lifecycle

LicoArc compatibility is agreement on one exact immutable complete Protocol
Line, not agreement on a product version, transport, implementation or loose
algorithm set. The current v1 source projection is `Candidate`/`PARTIAL` and
therefore cannot establish a session.

## Independent axes

Definition status is `DRAFT`, `PARTIAL` or `COMPLETE`. Lifecycle is `Candidate`,
`Published`, `Deprecated` or `Retired`. A line is eligible for a new session
only when it is complete and its lifecycle policy explicitly permits it.
Publishing freezes its exact bytes. A semantic correction or extension uses a
new complete line and generation; it never mutates Published bytes.

## Multi-line selection

An Endpoint may support multiple Published generations. One session uses
exactly one line. From future Endpoint-authenticated support statements, peers
discard unknown, incomplete, ineligible, retired and below-either-minimum
entries, then select the unique highest common generation. No common result or
more than one distinct meaning at the highest generation is a terminal failure.
String ordering, component negotiation, translation, Station selection and
fallback are forbidden.

The current Candidate has no active Pairwise Protection Profile and is always
filtered out. Its support statement and transcript fields remain open and are
not inferred from this lifecycle procedure.

## Deprecation and retirement

Published bytes remain verifiable after deprecation or retirement. Lifecycle
records own exact new-session and existing-session policy. Retired always
forbids new sessions. An implementation, Provider, Station or unauthenticated
input cannot independently continue, terminate, migrate, translate or rebind
an existing session. The withdrawn Candidate Profiles require termination on
authenticated adoption of their withdrawal and their identifiers are never
reused.

## Capability boundaries

Generic Messaging, Reliable Exchange, Evidence, identity and Transport Profile
semantics remain separate. Numeric `contentType` is protected application
dispatch; it is not Protocol Line or Protection Profile negotiation.
Application capabilities travel as application Payload and never rebuild a
cryptographic session. Transport migration cannot change Endpoint identity,
logical message identity, Protected Intent, authorization or evidence.

Group v1 is a bounded per-member projection Profile with at most 64 projections
per logical Group Message. It is not the permanent architecture for every
future group scale.
