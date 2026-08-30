# Field Review: Settlement Outcome

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-settle-outcome` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Each `SettlementResult` requires `settleOutcome` with the closed values `completed`, `released`, `staleClaim`, or `attemptLimit`; it reports Station-local settlement only and never advances endpoint evidence. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The Station reports the deterministic local result of settlement so the
claiming Endpoint can converge its transport workflow.

## Contribution to LicoArc's final vision

Reports one Station-local settlement result without advancing Endpoint
receipt, acceptance, or application effect state.

## Field model and trade-offs

The value is exactly one of `completed`, `released`, `staleClaim`, or
`attemptLimit`. It describes the addressed settlement attempt and no later
endpoint or application state.

## Visibility and trust

The claiming Endpoint and Station observe it. Every outcome is an untrusted
Station Signal and cannot establish Endpoint Accepted, Effect Completed,
message authenticity, or freshness.

## Decision history

Repository review admitted the closed settlement result set on 2026-08-02
while preserving the endpoint-evidence boundary. This page is explanatory
history, not a second specification; only `FIELD-REGISTRY.md` is normative.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
