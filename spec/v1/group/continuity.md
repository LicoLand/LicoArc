# Group continuity, delayed history and conflict repair — V1

Group state is Endpoint-owned; a relay, arrival timestamp, numerical epoch or
client brand never selects group authority. This capability is optional to core
pairwise communication. A group uses exact authenticated membership snapshots.

## Delayed messages

Receiving a valid later membership snapshot does not erase earlier snapshots
still referenced by unprocessed messages. Missing ancestry triggers bounded
catch-up: retain authenticated pending records in durable storage, request exact
predecessors and retry validation without moving the authoritative high-water
state backwards. Limit hot pages, not the age of accepted work.

Historical content and new execution are different. A message referencing an
old snapshot can be durably classified historical if its sender was authorized
there and the lineage/signature validate. Current authorization is separately
required for any new effect. A removed sender cannot regain current rights by
backdating or citing an old snapshot. Without independently authenticated causal
checkpoint evidence that a delayed operation was accepted before revocation,
do not execute it under revoked authority. Unverifiable history remains explicitly
unverified/quarantined, not silently deleted or promoted to current authority.
Group state snapshots may be compacted only when exact required lineage/recovery
proofs remain available; arbitrary latest-state replacement is not proof of ancestry.

## Concurrent administrative changes

Ordinary authorized successors keep their existing grammar. Equal-parent distinct
successors are explicit forks. Detection quarantines affected membership-dependent
mutations, not unrelated conversations or durable history. Retain both authenticated
branches, notify the authorized group administrators, and obtain a resolution; do
not select whichever branch a relay happened to deliver first.

A resolution is a protected Group-control application object, contentType 1279328261,
using resolution.schema.json. It names the group, uncontested base state digest,
sorted distinct fork-state digests, and a proposed complete resolved state digest.
The complete proposed state travels with the existing state grammar and has base
as predecessor and base epoch+1. Each original state authority at that exact base
sends its identical resolution vote through its own authenticated Endpoint session.
The receiver verifies full base/branch/proposal states and collects votes by Endpoint.
No proposal takes effect without every base state authority's matching vote. Duplicate
votes do not add authority. Votes for a different proposal are conflicts, not updates.
Explicit unanimous approval permits a previously forked lineage to be replaced by
that checkpoint; this is a resolution operation, not an ordinary rollback or an
arrival-order choice. Descendants of losing branches remain historical/conflicted,
not active authorization. Retain the checkpoint and retired-branch frontier.

This V1 rule chooses safety over automatic progress during a partition: an unavailable
administrator may delay resolution, without timing out messages. There is no claim of
partition-proof consensus or automatic merge of incompatible permissions. A future
alternative group policy needs its own authenticated definition and explicit group
adoption, not a silent relaxation of this rule. Admin recovery cannot be delegated to
a Station. Routine concurrent proposals can be serialized by cooperating administrators;
a bare task/relay lease is not authority to overwrite membership.

## Person, device and execution

Per-Endpoint delivery records are not a person's read status. Applications may declare
an explicit any-authorized-device or all-selected-devices custody target and must
report which target was met. One dormant device must not negate another device's
actual receipt. Copying group content to several authorized devices is not permission
for several executions. An effect target/handoff follows core durable continuity.
