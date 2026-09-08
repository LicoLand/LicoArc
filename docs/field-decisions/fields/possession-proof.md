# Field Review: Device Possession Proof

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-possession-proof` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `possessionProof`, registration challenge, or account approval |
| Candidate layer | Authorized Device entry |
| Observer set | Endpoints validating admission or recovery replacement |
| Existing authority | Existing generic Signature fields and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Reuses generic signature fields; no account or Station attestation. |
| Current conclusion | Each newly admitted Endpoint carries proof over the exact line, user, proposed epoch, Endpoint reference, and independently computed Endpoint-state digest. |

## Question

How does authority prove that a newly named Endpoint controls its replacement
key material rather than merely copying public state?

## Role in communication

The admitted Endpoint signs the fixed domain-separated tuple; authority
validators verify it in addition to predecessor authorization.

## Contribution to LicoArc's final vision

Prevents device admission and recovery from installing keys without Endpoint possession.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Exact line-required bounded signature composition |
| Presence | Mandatory on first admission or changed Endpoint-state digest; preserved for the admitted entry |
| Values or range | Signature over the fixed five-part tuple only |
| Canonical representation | Generic Signature entries in Protocol-Line-fixed order |
| Invalid input | Missing, wrong-purpose, downgraded, mismatched, or surplus proof rejects |

## Necessity proof

Predecessor approval proves intent but not replacement-key possession. A Station
challenge or account login cannot supply Endpoint cryptographic authority.

## Visibility and trust

Protected in peer delivery. Proof authorizes admission only; it does not prove
human consent, safe custody, peer trust, or data recovery.

## Alternatives

No proof permits key substitution; an interactive service challenge adds an
online dependency. The deterministic signed tuple is selected.

## Technical evaluation

Bounded signature verification per newly admitted entry; no recurring proof
for unchanged entries and no lifetime admission cap.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
