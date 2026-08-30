# LicoArc Tamarin proof closure

This directory contains the source-bound symbolic proof for all current Core
security claims across Pairwise Protection, Endpoint identity and route
continuity, transferable Evidence, Reliable Exchange, and Transport semantic
sources. The normative protocol remains under `spec/`; this model cannot add
protocol meaning.

`licoarc-core-v1.spthy` owns roles, actions, compromise transitions, atomic
persistence abstraction and lemmas. `tools/formal/generate.mjs` injects the
active Profile and Protocol Line content identities plus SHA-256 bindings derived from normative repository sources
into `generated/licoarc-core-v1.spthy` and regenerates
`spec/v1/security/formal-bindings.json`.

The model treats the hybrid primitive, chain transition, signature
verification, authenticated records, and source-derived bound classifier as
ideal symbolic operations. Its results therefore depend on admitted primitive
security, exact key-purpose and continuity resolution, authenticated peer-key
acceptance, fresh entropy, complete validation before mutation, and atomic
durable compare-and-commit. It does not prove computational security or
downstream implementation resource accounting. The modeled Pairwise
Protection Profile's explicit nonclaims are
physical zeroization, rollback detection after complete store compromise,
ratchet-header confidentiality, transferable session authentication, and
ongoing post-quantum post-compromise recovery. The recovery lemma models only
a fresh uncompromised classical DH input.

The Docker runtime is the explicit default. Podman is available only through
`--engine=podman`; the adapter never falls back automatically. Proof execution
uses `linux/amd64`, the pinned Tamarin 1.12.0 source commit and release-asset
digests, a platform-specific immutable Debian base digest, `C.UTF-8`, the
smart heuristic, one runtime thread and no container network. The runtime
verifies the locally available tag against the reviewed immutable image digest
and invokes that digest, never the mutable tag.

Run `npm run formal:build`, then `npm run formal:check`. The check regenerates
the source bindings, produces a proved theory, replays that proved theory, and
validates the exact named lemmas, binding digests, runtime contract and
canonical evidence. A prover exit status alone is never accepted.
