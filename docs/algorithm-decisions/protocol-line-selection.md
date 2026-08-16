# Algorithm Decision: Protocol Line Selection

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-protocol-line-selection` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | Protocol Line lifecycle and compatibility policy |
| Authority targets | `spec/protocol-lines.json` and its definition-level tests |
| Predecessor or successor | None |

## Question and scope

How do two Endpoints select one immutable complete Protocol Line without a
Station, Provider, component algorithm, arrival order, or attacker-controlled
fallback deciding protocol meaning?

## Algorithm Prototype

From Endpoint-authenticated support sets, retain only entries whose definition
is complete, lifecycle permits new sessions, generation meets both Endpoints'
minimum generation, and content identity exactly matches. Select the unique
highest common generation. Zero results, unknown entries, or more than one
distinct meaning at the highest generation are terminal failures with no
fallback and no state advance. A future handshake must authenticate both input
statements and the exact result before a session can exist.

Deprecated and Retired entries use registry-owned new-session and
existing-session policies. Retired always forbids new sessions. An
implementation cannot continue, terminate, migrate, translate, or rebind an
existing session except as the authenticated registry policy states.

## Necessity and alternatives

Lowest-common selection, string ordering, component negotiation, translation,
Station selection, and implementation-local retirement are rejected because
they permit downgrade or divergent semantics.

## Source-derived conformance material

Cases cover unique-highest success and incomplete, below-minimum, unknown,
retired, deprecated-for-new-session, no-common, ambiguous-highest, and
identifier-reuse rejection.

## Decision outcome

The fail-closed unique-highest complete-line procedure is adopted.

## Definition evidence

The definition status is `SPECIFIED` by `spec/protocol-lines.json` and focused
foundation tests. This decision does not add the future authenticated support
statement fields.
