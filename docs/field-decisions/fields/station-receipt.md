# Field Review: Station Receipt

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-receipt` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | Transport Profile native response outcome; rejected alternatives: receipt field, receipt token, accepted resource |
| Candidate layer | Transport Profile |
| Observer set | Submitting Endpoint and Station |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the `outcomeClass` decision and is not a second field specification. |
| Current conclusion | The baseline uses one Transport-Profile-native typed response outcome and no standalone receipt field, token, or receipt resource. It reports only the current submission attempt and cannot prove Endpoint acceptance, final delivery, or an application effect. |

## Question

Which Station submission outcomes need interoperable representation without
turning them into endpoint evidence?

## Role in communication

The submitting Endpoint uses the signal to manage transport retry and route
selection. Reliable Exchange remains responsible for protected Endpoint
Accepted and Effect Completed confirmations.

## Contribution to LicoArc's final vision

Keeps Station operation outcomes typed but non-authoritative, preserving the
distinction between carriage, Endpoint acceptance, and completed effect.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | The primary risk is authority confusion between Station Received and Endpoint Accepted. |
| Privacy and metadata | Pollable receipt tokens can link sender, route, and packet attempts. |
| Interoperability | Typed accepted, rejected, transient, and ambiguous outcomes are needed for deterministic retry. |
| Implementation complexity | Carrier-native status is simpler than a second envelope. |
| CPU, memory, and wire cost | Small wire cost; retained receipt resources can amplify Station state. |
| Evolution and downgrade | New outcome classes must fail safely and cannot reinterpret old positive receipts. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Classify one transport attempt as accepted, rejected, ambiguous, or failed. |
| Removal consequence | The sender cannot distinguish immediate rejection from an accepted transport attempt. |
| Derivation | Carrier status may already provide the result. |
| Lower-layer carrier | Transport Profile status, response body, stream reset, or profile-specific acknowledgement. |
| Protected placement | Endpoint confirmations must be protected and are different messages. |
| Duplicate-authority risk | A receipt field and carrier status can disagree; one Transport Profile authority is required. |

## Value model

The baseline semantic classes are accepted, rejected, transient failure, and
ambiguous. Their exact carrier codes, malformed-response behavior, and retry
consequences remain part of the future Transport Profile specification.

There is no independent receipt value, token, or accepted-resource identifier
in the baseline. A request/response profile can use its native response status; another
profile must define one equivalent native outcome mechanism. If later polling
or cancellation proves necessary, its Station-generated resource handle is a
new field question with an independent necessity, scope, lifetime,
authorization, and linkability review. No outcome can elevate the Station's
trust.

## Alternatives

- Use one Transport-Profile-native typed response outcome: selected for the
  baseline.
- Return a Station-local resource identifier for later transport operations:
  rejected from the baseline because neither polling nor cancellation has an
  admitted requirement.
- Add a dedicated receipt body field or token: rejected because it duplicates
  the native response authority and adds linkable Station state.
- Omit positive receipts and treat connection completion as ambiguous.
- Use protected Endpoint Accepted confirmation for reliability, never as a
  substitute for immediate transport flow control.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Web Push returns a
  created message resource and separately defines user-agent acknowledgement.
- MCP and
  JSON-RPC responses prove only that the remote
  protocol peer produced
  a response; they do not establish a third party's completed effect.
- Matrix federation transaction responses
  represent homeserver processing,
  which carries more server authority than LicoArc permits.

## Decision history

Repository review approved the baseline representation on 2026-08-02. One
Transport-Profile-native response outcome is sufficient for immediate flow
control, so the baseline contains no standalone receipt field, token, body, or
pollable receipt resource. This preserves one response authority and avoids
unnecessary Station state and correlation metadata.

The non-authority rule and four semantic outcome classes are decided. Exact
carrier codes, response grammar, invalid-input behavior, and retry table remain
blocked on the first Transport Profile, so specification remains `PARTIAL`.
Polling or cancellation cannot silently add a receipt handle; either requires
a new Message Field Decision.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
