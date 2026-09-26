# Nostr interoperability and open LicoArc enhancements

The [binding](../../spec/interop/v1/protocol.md) owns an optional Nostr adapter.
Standard NIP-17 chat is unchanged. Enhanced services need the Nostr carrier and
Endpoint Core, not standard chat or a product UI. The core also supports other
approved adapters and remains independent of Nostr identity and persistence.

Identity association includes a stable conversation reference, never a frozen
capability list. Capability state propagates in independent protected messages,
without rebind. Both pairing and accepted work survive offline periods. A later
transport attempt may refresh its outer wrap without changing the native intent.
Only exact authenticated Endpoint facts, not relay receipts, advance acceptance
or outcome knowledge. Receiving a request does not authorize its execution.

[Core targets](../../spec/v1/foundation/targets.json),
[durable continuity](../../spec/v1/reliable/continuity.md) and
[live capabilities](../../spec/v1/messaging/capabilities.md) define the shared rules.
The experimental inner kind is not an upstream allocation. The revised native
Candidate is PARTIAL and session-ineligible pending formal requalification;
this binding cannot override that gate. No SDK or real-client execution is claimed.
