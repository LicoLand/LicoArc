# Algorithm Decision: `<conceptual-name>`

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-<slug>` |
| Decision status | `OPEN`, `READY`, `DECIDED`, `REJECTED`, or `RETIRED` |
| Definition status | `NOT-SPECIFIED`, `PARTIAL`, or `SPECIFIED` |
| Existing authority | `<link or none>` |
| Authority targets | `<PRODUCT / ARCHITECTURE / spec / conformance paths>` |
| Predecessor or successor | `<decision ID or none>` |

## Question and scope

State one bounded algorithm, composition, parameter-set, or algorithmic
procedure decision. Name all non-goals. A required transmitted value belongs
to an independent Message Field Decision.

## Primary lineage and Algorithm Prototype

State the selected construction, normative edition, corrections, security or
correctness assumptions, adversary model, exact algorithm steps, parameters,
encodings, domain separation, failure behavior, and normalized LicoArc
Algorithm Prototype. Local research may inform the review but is neither
tracked nor normative.

## Necessity and alternatives

Describe the interoperable requirement, the consequence of omission, the
no-algorithm option, complete alternative constructions, and why composition
at another layer does or does not solve the problem.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | |
| Known attacks and limitations | |
| Misuse and failure behavior | |
| Side channels and secret handling | |
| Interoperability | |
| Normative CPU work bound by operation | |
| Normative memory and state bounds | |
| Persistent protocol state | |
| Capability and handshake wire bytes | |
| Established-record and control wire bytes | |
| Work and allocation before peer authentication | |
| Agility, downgrade, replacement, and retirement | |

For a Protection Profile or an algorithm used by one, the evaluation maps
these rows to exact implementation-neutral Protocol-Line resource and wire
bounds. Runtime measurements and device admission belong downstream.

## Source-derived conformance material

List source-derived LicoArc positive, negative, boundary, adversarial vectors,
or invariants. Expected results come from the Algorithm Prototype, never from
a dependency output.

## Decision outcome

For `OPEN`, list the unresolved definition questions. For `READY`, show that
every definition criterion is closed. For `DECIDED` or `REJECTED`, state the
exact outcome, rationale, approval record, and authority link.

## Definition evidence

State the exact normative scope closed by the linked authorities and any
remaining ambiguity. Downstream implementation or validation evidence is not
recorded here.
