# Field Review: Endpoint Failure Code

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-failure-code` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A protected, bounded failure class is required when peer interoperability depends on distinguishing endpoint terminal and retryable outcomes. |

## Question

What minimum endpoint failure classification is required without exposing
implementation-local diagnostics?

## Role in communication

The receiving Endpoint produces the code, and the sending Endpoint uses it
only for the Reliable Exchange action assigned to that class. Human-readable
diagnostics, stack traces, local policy reasons, and provider errors remain
local.

## Contribution to LicoArc's final vision

Lets peer Endpoints converge on a bounded failure meaning without exposing
sensitive free-form diagnostics or borrowing Station error authority.

## Field model and trade-offs

The value is registered `uint32` field `failureCode`, conditionally mandatory
when `confirmationOutcome` is `rejected` or `failed`. The exact registry,
behavioral mapping, encoding, and invalid-input handling remain specification
gaps. Attachment coverage must distinguish at least invalid index or range,
conflicting chunk bytes, invalid chunk length, final digest mismatch,
cancelled transfer, and source unavailable without carrying sensitive
free-form diagnostics.
The code is part of the complete confirmation Transferable Statement and is
therefore covered by the same mandatory Evidence Checkpoint.

## Visibility and trust

The code is endpoint-authenticated and hidden from Stations. A valid checkpoint
attributes the exact claim to the confirming Endpoint key state, but the peer
can still lie about its own outcome; the code does not prove local effects or
justify disclosing private diagnostics.

## Decision history

Repository review decided that interoperable endpoint failure classes are
needed but implementation and user-facing details are not wire fields. This
detail page is not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

LicoArc review on 2026-08-03 required attachment recovery failures to remain
typed, stage-specific, bounded, and terminal where retry cannot repair the
same immutable attachment identity. Exact numeric assignments remain future
registry work. The transferable-evidence review retained the code and required
the containing confirmation statement to be checkpoint-covered.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
