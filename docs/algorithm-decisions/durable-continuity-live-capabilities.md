# Durable continuity and live application capabilities

| Property | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-durable-continuity-live-capabilities` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Scope | Initial V1 continuity, dynamic capability state, order-independent facts and transport independence. |
| Authority | `spec/v1/reliable/continuity.md`, `spec/v1/messaging/capabilities.md` and their owning registries. |

## Question and alternatives

A conversation is not a connection. A capability advertisement is not an
identity binding or an execution grant. An accepted message is not a disposable
cache entry. A transport failure is not a business outcome. Preserve these
separations instead of retaining a frozen binding, adding a longer deadline,
or treating resource exhaustion as permanent message failure.

Select durable store-and-forward with no protocol-imposed message TTL and
per-attempt resource budgets; retain cryptographic parser, nonce, sequence,
identity and authorization checks. Dynamic capability state uses independently
versioned per-scope/per-interface/per-role records; authenticated updates flow
to existing authorized conversations without rebinding. A full-page repair
protocol distinguishes removed capabilities from missed updates.

Confirmation identity denotes authenticated business facts, not the current
cryptographic session. A completion can arrive before an acceptance. Cancellation
intent and known effects remain separate. Duplicate facts coalesce; contradictory
terminal evidence is retained as a conflict, never resolved by arrival order.

## Tradeoffs

Storage quotas, authentication and backpressure remain essential; indefinite
accepted work does not imply unlimited unauthenticated input or unlimited RAM.
No honest-node algorithm guarantees delivery after all copies are destroyed or
through permanently malicious/unavailable paths. Restoring content, user authority
and executable protocol state are separate operations. Do not manufacture new
security proofs from model tests. Changed native semantics reopen proof admission.

## Definition evidence

Owning V1 policies, closed capability schemas, continuity and capability reducers,
confirmation regression tests, source-closed corpora and generated artifacts.
The definition models are not a production storage engine, crypto SDK, consensus
service, client integration or a substitute for independent interoperability tests.
