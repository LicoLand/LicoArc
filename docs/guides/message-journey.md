# A message's journey

An explanatory walkthrough; [durable continuity](../../spec/v1/reliable/continuity.md)
is the normative source. Alice and Bob below are fictional participants, not test keys.

## Save before acknowledging

Alice authorizes a message. Her Endpoint records the message and its delivery intent
before sending protected bytes. A Station may hold the ciphertext while Bob is offline.
Its receipt is not a claim that Bob has read, approved or executed anything.

## Continue after an interruption

Bob can reconnect later. His Endpoint saves recoverable content and the information
needed to recognize a duplicate before acknowledging durable acceptance. Losing a
connection, exhausting one batch's budget or closing the user interface does not
expire accepted work. The next permitted processing turn continues the same intent.

## Keep receipt and permission separate

A request may be safely received while waiting for Bob's approval. A standing policy
may already allow his Agent to act. Mere receipt, a tool name or a capability update
does not create that permission. Completed work and an unread result are also separate.

## Change a capability without changing the conversation

Bob adds a tool. His Endpoint sends an authorized capability update to existing
affected conversations. Alice learns the new interface without re-pairing. If she
was offline, the [capability repair process](../../spec/v1/messaging/capabilities.md)
restores her view when connectivity returns.

## Recognize the same work on another path

A new route, wrapper or security session does not turn the message into a new task.
A result can arrive before its earlier receipt. The endpoints retain authenticated
facts and reconcile them; they do not blindly repeat an external action just because
its acknowledgment was delayed.

This walkthrough does not promise unlimited storage or recover deleted keys. Actual
custody needs a recoverable copy and an eventually available approved path. The
protocol keeps that responsibility distinct from the lifetime of a network request.
