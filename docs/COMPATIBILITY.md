# Protocol Line Selection and Lifecycle

LicoArc compatibility means agreement on one exact complete Protocol Line
content identity. It is not agreement on a product version, transport,
implementation, or loose algorithm set.

The current `licoarc.protocol-line.v1` is `Candidate` / `COMPLETE`, permits
authenticated new-session selection, and is not publication-eligible.

## Selection

Each Endpoint authenticates its bounded support statement and monotonic
minimum-generation floor. Selection filters in the exact machine-defined
order: known content identity, complete definition, allowed new-session
policy, session eligibility, both minimum-generation floors, complete
mandatory capabilities, and complete eligible Profiles. Peers then choose the
unique highest common generation.

No common line, more than one meaning at the highest generation, unknown or
mismatched content identity, unauthenticated support, or downgrade input is a
terminal failure without state advance. Fallback, component negotiation,
substitution, Station selection, and translation are forbidden. A session is
locked to the selected line and Profile identities.

## Lifecycle

Definition status and lifecycle are independent. `COMPLETE` records semantic
closure; `Candidate`, `Published`, `Deprecated`, and `Retired` govern use and
distribution according to the registries. Publication is a separate action
that cannot change the definition bytes.

A semantic change creates a new content identity and, when applicable, a new
generation. Published bytes are immutable. Retirement forbids new sessions
and follows the authenticated existing-session policy; no implementation or
Station may invent a migration.

The Profile registry retains exactly two withdrawn identifier allocations as
non-reusable tombstones. Those entries reserve identifiers only. They do not
retain a wire, parser, translator, implementation, or compatibility path.

Publication, implementation, interoperability execution, audit, deployment,
support, and operation are downstream claims and do not participate in
definition completion or selection.
