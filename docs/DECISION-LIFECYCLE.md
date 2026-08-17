# LicoArc Decision Lifecycle

This document is the single authority for how LicoArc protocol-definition
decisions are opened, reviewed, decided, defined, superseded, and retired.
LicoArc owns protocol meaning only. Implementations, providers, executable
interoperability, device measurements, audits, packaging, publication,
deployment, support, operation, and product integration are owned and closed
outside this repository and never advance or block a LicoArc decision.

Approved product meaning remains in `README.md` and `PRODUCT.md`; protocol
boundaries remain in `ARCHITECTURE.md`; exact machine-readable meaning remains
in `spec/` and `conformance/`; current definition facts remain in
`docs/STATUS.md`.

## Two independent decision tracks

| Track | Record ID | Workspace | Exclusive question |
| --- | --- | --- | --- |
| Algorithm Decision | `ALG-<slug>` | `docs/algorithm-decisions/` | Which implementation-neutral algorithm or composition LicoArc defines and what its exact Prototype means. |
| Message Field Decision | `FLD-<slug>` | `docs/field-decisions/` | Whether one semantic value needs a LicoArc field and its exact placement, visibility, value, and failure model. |

An Algorithm Decision cannot add or encode a field. A Message Field Decision
cannot select or redefine an algorithm. A change affecting both requires one
record in each track; neither record inherits the other's status.

## Record identity and definition state

Every record has one stable lowercase slug and the corresponding
`ALG-<slug>` or `FLD-<slug>` identifier. At every status it states:

- its track, ID, bounded question, and scope;
- its decision status and definition status;
- its current authority and authority targets;
- alternatives, relevant technical evidence, and residual risks; and
- predecessor or successor records when meaning changes.

Decision status reports approval only:

| Status | Meaning | Permitted next status |
| --- | --- | --- |
| `OPEN` | The question is registered and definition evidence is being collected. | `READY`, `REJECTED` |
| `READY` | Scope, alternatives, acceptance criteria, residual risks, and authority targets are complete enough for explicit review. | `OPEN`, `DECIDED`, `REJECTED` |
| `DECIDED` | The bounded conclusion was approved and linked to its durable authority. | `RETIRED` or a successor record |
| `REJECTED` | The proposal was rejected with a recorded reason. | a new successor record only |
| `RETIRED` | A formerly decided conclusion is no longer active. | none |

Definition status is independent of approval:

| Status | Meaning |
| --- | --- |
| `NOT-SPECIFIED` | No active normative definition exists for the record's scope. |
| `PARTIAL` | Only the explicitly named normative scope is defined; unresolved meaning cannot enter an active Protocol Line. |
| `SPECIFIED` | Exact implementation-neutral semantics are closed in the owning formal and machine-readable sources. |

`DECIDED` is required before `SPECIFIED`, but it does not imply it. A
`PARTIAL` record names the defined scope and the remaining normative ambiguity.
Repository source-integrity checks prove only that tracked definitions,
schemas, registries, corpora, manifests, and generated artifacts agree. They
are not a separate lifecycle status and make no downstream delivery claim.

## Shared admission gates

Before `READY`, a record must:

1. bound the question and non-goals;
2. compare omission or no change with every credible alternative;
3. evaluate security, privacy, trust, interoperability semantics, resource
   bounds, complexity, and evolution;
4. define objectively reviewable acceptance and rejection criteria;
5. identify the formal and machine-readable authority targets; and
6. close any uncertainty capable of changing protocol meaning.

Local research and external standards may inform a review, but local reference
material is untracked and never becomes a normative input, link target,
fixture, or closure condition. A self-contained LicoArc decision needs no
external precedent.

An explicit repository review moves a `READY` record to `DECIDED` only in the
same bounded change that updates or links its durable authority. An objective
admission failure may move `OPEN` directly to `REJECTED`. Chat, plans, tests,
libraries, implementations, or downstream results do not decide protocol
meaning.

After `DECIDED`, set definition status to `SPECIFIED` only when identifiers,
placement, encoding, values, state transitions, validation, failures,
lifecycle, authority, schemas, registries, and definition-level conformance
cases are closed for the declared scope.

## Algorithm Decision gates

Before `READY`, an Algorithm Decision closes or explicitly bounds:

- primary lineage and selected normative construction;
- the implementation-neutral Algorithm Prototype, parameters, composition,
  encodings, domain separation, failure behavior, and assumptions;
- omission and complete alternative constructions;
- source-derived positive, negative, boundary, and adversarial vectors; and
- exact normative resource and wire bounds where applicable.

Dependencies and language providers are downstream implementation choices.
They cannot define an algorithm, supply expected results, or change a
Prototype. An Algorithm Decision cannot authorize a wire field.

## Message Field Decision gates

Before `READY`, a Message Field Decision establishes:

- the exact interoperable action requiring the semantic value;
- why omission, derivation, local state, an existing field, or lower-layer
  framing cannot perform that action;
- producer, consumer, observer, visibility, trust, replay, correlation, and
  downgrade behavior;
- semantic type, presence, bounds, canonical representation, and invalid-input
  behavior; and
- privacy, security, interoperability semantics, resource, complexity, and
  evolution cost.

Only LicoArc roles and invariants can establish field necessity. Products,
languages, providers, deployments, examples, tests, and reference
implementations cannot. A Message Field Decision cannot authorize an
algorithm.

## Mandatory change procedure

1. Open or update the applicable decision record before changing approved
   intent or machine-readable protocol meaning.
2. Keep algorithm and field questions in separate records.
3. Reach `DECIDED` or `REJECTED` through the gates above.
4. Update every formal authority, schema, registry, corpus, manifest,
   generated artifact, index, and projection in one bounded migration.
5. Run deterministic source-integrity checks over tracked protocol-definition
   inputs only.
6. For replacement, create a successor and remove the superseded definition,
   compatibility path, tests, and documentation in the same migration.

Downstream repositories decide how to implement and validate a defined
Protocol Line. Their results may reveal a protocol defect that requires a new
LicoArc decision, but they never become LicoArc completion evidence.
