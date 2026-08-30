# LicoArc Status

## Definition authority

This protocol-definition repository owns `licoarc.protocol-line.v1`. The
canonical manifest reports:

| Dimension | Current value |
| --- | --- |
| Lifecycle | `Candidate` |
| Definition status | `COMPLETE` |
| Session eligible | `true` |
| Publication eligible | `false` |
| Mandatory capability closure | 9 of 9 `COMPLETE` |
| Active Protection Profile | `stable-core`, `COMPLETE` |
| Missing definitions or blockers | none |

The nine capabilities are Protocol Foundation, Identity, Pairwise Protection,
Generic Messaging, Reliable Exchange, HTTPS Transport, Group Collaboration,
Transferable Evidence, and Federation Governance.

## Tracked source closure

The tracked definition graph closes all mandatory semantic source manifests,
the active Profile, stable security claims and required proof bindings, the
complete declared capability/Profile corpora, named non-circular Profile and
Protocol Line content identities, and deterministic artifact generation.

`spec/protocol-lines.json` owns line lifecycle and selection.
`spec/protection-profiles.json` owns active Profile admission and exactly two
non-reusable withdrawn identifier allocation tombstones. `spec/v1/` and
`conformance/v1/` are the tracked definition graph;
`artifacts/v1/licoarc.bundle.json` is its deterministic Candidate projection.

`docs/references/` is ignored local research and is not part of the tracked
definition graph.

## Ownership boundary

`sessionEligible: true` permits authenticated new-session selection under the
machine policy. `publicationEligible: false` means this repository state does
not authorize publication.

Language implementations, Providers, Endpoint or Station runtime behavior,
executable interoperability, audits, packages, publication channels,
deployment, support, and operation close independently in their owners. They
cannot advance or block a LicoArc definition or alter its bytes.
