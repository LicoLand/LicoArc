# LicoArc Status

## Definition authority

This protocol-definition repository owns `licoarc.protocol-line.v1`. The
canonical manifest reports:

| Dimension | Current value |
| --- | --- |
| Lifecycle | `Candidate` |
| Definition status | `COMPLETE` |
| Protocol | V1 / Generation 1 |
| Session eligible | `true` |
| Protocol-Line publication eligible | `false` |
| Mandatory capability closure | 8 of 8 `COMPLETE` |
| Active Protection Profile | `stable-core`, `COMPLETE` |
| Missing definitions or blockers | none |

The eight capabilities are Protocol Foundation, Identity, Pairwise Protection,
Generic Messaging, Reliable Exchange, HTTPS Transport, Group Collaboration,
and Federation Governance.

V1 / Generation 1 defines user-authorized multi-device identity and recovery. Each
authorized device remains an independent Endpoint with its own keys and
sessions. Pairwise establishment binds sibling user-authority-state digests
beside both Endpoint-state digests without a digest cycle. Exact authenticated
Endpoint confirmations control acceptance and effect finality; Station state
does not. User/device authorization never changes local peer trust, and a
Station has no user/device roster or authority-tip role.

## Tracked source closure

The tracked definition graph closes all mandatory semantic source manifests,
the active Profile, stable security claims and required modeled-proof
bindings, the complete declared capability/Profile corpora, named non-circular
Profile and Protocol Line content identities, and deterministic artifact
generation. Formal replay establishes only the declared ideal-model claims
under their recorded assumptions.

`spec/protocol-lines.json` owns the fixed initial V1 definition.
`spec/protection-profiles.json` owns the sole active Profile admission. `spec/v1/` and
`conformance/v1/` are the tracked definition graph;
`artifacts/v1/licoarc.bundle.json` is its deterministic Candidate projection.

`docs/references/` is ignored local research and is not part of the tracked
definition graph.

## Ownership boundary

`sessionEligible: true` permits sessions under the fixed V1 definition.
`publicationEligible: false` is the machine lifecycle decision that keeps this
Candidate ineligible for Protocol-Line publication. It does not forbid
publishing repository source, license, or documentation as repository material
under Apache-2.0, and it does not authorize certification, stability,
deployment, or runtime claims.

The TypeScript, Rust, and Go repositories independently admit and execute the
initial V1 bundle through local decoders, authority validators, session
gates, confirmation reducers, and corpus executors. Those focused SDK paths do
not establish complete product integration, Provider correctness, device
custody, cross-language interoperability, external audit, package release,
publication, deployment, support, or operation. Each claim closes separately
in its owner and cannot advance or block a LicoArc definition or alter its
bytes.
