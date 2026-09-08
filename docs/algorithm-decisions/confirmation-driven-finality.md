# Algorithm Decision: Confirmation-Driven Finality

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-confirmation-driven-finality` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | Explicit initial V1 user direction and authenticated Reliable Exchange boundary |
| Authority targets | [Canonical Field Registry](../../spec/FIELD-REGISTRY.md), [confirmation schema](../../spec/v1/reliable/confirmation.schema.json), [Reliable labels](../../spec/v1/reliable/labels.json), [Reliable runtime grammar](../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../spec/v1/reliable/registry.json), [Reliable bounds](../../spec/v1/reliable/bounds.json), [Group schema](../../spec/v1/group/group.schema.json), [formal bindings](../../spec/v1/security/formal-bindings.json), [Reliable corpus](../../conformance/v1/reliable/cases.json), and [Group corpus](../../conformance/v1/group/cases.json) |
| Predecessor or successor | Succeeds retired `ALG-transferable-evidence-checkpoint`; no checkpoint compatibility path survives. |

## Question and scope

Which bounded procedure lets message, attachment, and Group state advance on
the exact receiving Endpoint's authenticated confirmation without a Station
claim, transferable checkpoint, public content proof, timer, or unbounded retry?
This decision does not define delivery scheduling, application truth, public
verification, storage, cloud behavior, or exactly-once external effects.

## Primary lineage and Algorithm Prototype

1. Accept a confirmation only inside a protected session whose sending
   Endpoint is authorized by the exact authority-state context committed in
   that session. Bind its unique confirmation identity, canonical logical
   Message identities, stage, outcome, optional failure code, and conditional
   result digest into the authenticated record.
2. Deduplicate by confirmation identity and exact authenticated bytes. Exact
   replay is idempotent; reuse with changed content rejects without mutation.
3. `endpointAccepted` advances only on the exact eligible authenticated
   confirmation. `effectCompleted` advances only for authenticated success and
   the expected result digest. No Station-only response advances either stage.
4. Attachment finality additionally requires every authenticated chunk, exact
   offsets and lengths, and the complete declared content digest. A Group
   result's `authority` is `endpoint-confirmation | none`; only an exact
   protected Endpoint confirmation can produce a confirmed result. `none`
   records that confirmation has not arrived and remains pending.
5. Apply one confirmation group atomically and independently to each bounded
   Message identity. Missing, extra, conflicting, replay-substituted, forged,
   wrong-result, or premature input rejects or remains pending according to the
   closed state machine without checkpoint requests.

## Necessity and alternatives

Omission conflates carrier acceptance with Endpoint acceptance and makes effect
completion unverifiable to the sender. Transferable checkpoints add a property
the user did not require and permit checkpoint suppression to block ordinary
finality. Timers and Station receipts have no Endpoint authority. Exact session
authenticated confirmations provide the required peer result with the smallest
authority surface.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Only the session-bound authorized Endpoint can advance the named eligible stage and result. |
| Known attacks and limitations | A peer can lie about its own result or suppress confirmation; the protocol makes no public proof or liveness claim. |
| Misuse and failure behavior | Forgery, wrong session, identity reuse, result mismatch, regression, and Station-only hints fail without state advance. |
| Side channels and secret handling | Confirmation content remains endpoint-protected; transport metadata remains a residual correlation risk. |
| Interoperability | Canonical identity grouping, stage/outcome rules, result binding, replay behavior, and failure classes are line-fixed. |
| Normative CPU work bound by operation | Linear in one bounded confirmation group or attachment chunk batch. |
| Normative memory and state bounds | Bounded deduplication and pending state per record or batch; no lifetime confirmation cap. |
| Persistent protocol state | Highest valid stage/result per logical Message plus bounded replay identity state. |
| Capability and handshake wire bytes | No confirmation bytes enter negotiation; the session authority context is inherited. |
| Established-record and control wire bytes | One bounded protected confirmation; no evidence checkpoint or statement-digest exchange. |
| Work and allocation before peer authentication | No finality work is admitted before protected-session authentication. |
| Agility, downgrade, replacement, and retirement | The initial V1 line removes checkpoint fields and cannot negotiate them back through extensions. |

## Source-derived conformance material

Cases cover exact valid acceptance/effect completion, authenticated failure,
duplicate idempotency, identity reuse with changed bytes, missing confirmation,
forged sender, wrong session/authority digest, wrong stage/outcome/result digest,
Station-only hints, replay across Messages, incomplete attachment/chunk/digest,
and Group results with each confirmation authority value.

## Decision outcome

The implementation selected this construction on 2026-09-08 to realize the
authorized initial V1 confirmation finality and checkpoint retirement.
Residual
risks are peer dishonesty, suppression, and external-effect ambiguity; the exact
authenticated result makes those limits explicit without inventing a notary.

## Definition evidence

The algorithm is `DECIDED` and `SPECIFIED`: the linked registry, Reliable,
attachment, Group result, formal-binding, and conformance sources close exact
initial V1 confirmation transitions, bounds, encodings, failures, and cases.
