# Field Review: Routes

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-routes` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Authenticated discovery needs a bounded ordered set of relationship-specific transport candidates under one exact Endpoint-wide affiliation state; order is attempt preference, not global affiliation authority. |

## Question

What route candidates must authenticated discovery communicate for an
Endpoint to attempt protocol transport?

## Role in communication

The sending Endpoint publishes a bounded ordered private snapshot to one peer.
Each Route repeats an identity-bound `affiliationCommitment`, includes a
Station-signed bounded route capability, and must belong to the exact global
state named by `affiliationStateDigest`. Ordering supplies attempt preference
only; the receiver retains local route-selection policy. Primary and alternate
Station affiliation comes exclusively from `stationAffiliations`.

## Contribution to LicoArc's final vision

Provides bounded private transport candidates under one exact affiliation
state while leaving global Station affiliation and local route choice in their
proper authorities.

## Field model and trade-offs

The value is mandatory field `routes`, typed `Route[1..MAX_ROUTES]`, containing
bounded ordered transport candidates. Every Route binds one authenticated
Station descriptor, current affiliation commitment, exact Transport Profile,
private Delivery Handle, Station-selected service expiry, and Station route
signature. The Identity policy fixes `MAX_ROUTES = 4`; the schema and grammar
fix canonical representation and duplicate rejection. Declared order is
attempt preference only, while the receiving Endpoint retains final local
selection policy.

## Visibility and trust

Only peer Endpoints observe the value under endpoint protection. The peer can
learn and correlate the advertised current Station topology. Endpoint
authentication proves selection; the Station service signature proves only
issuance of the bounded handle tuple. Neither makes a Station honest,
available, an Endpoint identity authority, or a source of delivery evidence.
Endpoints must resist stale, conflicting, forked, and rollback route sets.

## Decision history

Repository review decided that multiple authenticated transport candidates
may be needed and must remain separate from Endpoint identity. Threat review
then removed primary-affiliation authority from Route order: every Route now
depends on an exact Endpoint-wide affiliation state, while ordering remains
relationship-local attempt preference. This detail page does not define their wire grammar and
is not a second protocol specification. The sole field semantics authority is
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md), and it wins over
any conflicting explanation here.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
