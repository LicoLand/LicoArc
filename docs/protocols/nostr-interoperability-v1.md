# Nostr interoperability and open LicoArc enhancements

LicoArc V1 supports a layered definition: ordinary clients communicate using
the shared NIP-17/44/59 private-message baseline; enhanced clients additionally
implement the open LicoArc binding and relevant application definitions.
Neither route requires the LicoUp product or an official service.

The canonical [V1 binding specification](../../spec/interop/v1/protocol.md)
and [manifest](../../spec/interop/v1/manifest.json) define exact kinds, namespace,
source revision, framing, account/session association, capability intersection,
per-message security requirements and failures. The
[field table](../../spec/interop/v1/fields.md) is incorporated by the Canonical
Field Registry. The [decision](../algorithm-decisions/nostr-layered-interoperability.md)
records alternatives and scope.

| Path | Shared requirements | What it does not require |
| --- | --- | --- |
| Standard Nostr private text | NIP-01, NIP-17, NIP-44 v2, NIP-59; NIP-42 when relay-required | LicoArc keys, native Station APIs, native governance, LicoUp |
| Enhanced endpoint messages | Above plus the exact LicoArc binding, native V1 protection and local peer approval | An official client or official relay |
| Enhanced collaboration | Above plus an exact common application id and definition digest, local execution approval | The same workflow engine, UI or product |

A Nostr account is not an Arc Endpoint key. Account association is confirmed
inside the native session; multiple devices retain independent Endpoint
sessions. Capabilities are protected application payloads, not AKE algorithm
negotiation. Standard text never becomes a machine command, and an enhanced
send is never retried as standard chat or a compatibility copy.

The native eight-capability Protocol Line remains defined and independently
verifiable. Its native HTTP restrictions do not define Nostr relay behavior.
A kind-1059 relay can carry enhanced wraps without understanding LicoArc;
ordinary chat interoperability still requires actual NIP-17 client support.
The dedicated inner extension kind is experimental, not an upstream NIP
allocation. Real cross-client tests and composite-security review remain
implementation-owned evidence, not claims made by this definition.
