# Algorithm Decision: Protected Size-Bucket Schedule

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-protected-size-bucket-schedule` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Performance-first privacy boundary](../../PRODUCT.md#transport-visible-metadata-and-endpoint-state) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, and future Protection Profiles |
| Predecessor or successor | None |

## Question and scope

Should a mandatory Protection Profile add a deterministic size-bucket
procedure to reduce exact-length leakage? This record does not add a field or
control application Payload.

## Primary lineage and Algorithm Prototype

No Algorithm Prototype is required after rejection. The question is
self-contained: adding bytes solely to reshape observable traffic conflicts
with the approved performance-first baseline.

## Necessity and alternatives

The selected alternative is no discretionary traffic-shaping padding. Fixed
alignment, deterministic buckets, adaptive buckets, delayed emission, and
synthetic traffic were rejected for the mandatory profile. Exact outer length
and timing remain explicit residual metadata.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | No schedule is selected and no anonymity or traffic-analysis-resistance claim is made. |
| Known attacks and limitations | The named attacks, misuse conditions, and residual assumptions constrain downstream implementations without becoming LicoArc delivery gates. |
| Misuse and failure behavior | A profile that adds discretionary traffic-shaping bytes is not the mandatory profile and must not claim compatibility under its identifier. |
| Side channels and secret handling | Downstream implementations own provider behavior, secret erasure, runtime memory, and side-channel controls. |
| Interoperability | No schedule is defined; the active profile grammar normatively excludes discretionary traffic-shaping bytes. |
| CPU, memory, battery, and wire cost | Rejection avoids bandwidth amplification, additional allocation, and sender-selected expansion. |
| Agility, downgrade, replacement, and retirement | A future traffic-shaping proposal would require a new decision and new profile identity; it cannot reopen this record. |

## Source-derived conformance material

No schedule corpus is required. The active Protection Profile definition
contains no discretionary traffic-shaping bytes, and its documented overhead
is intrinsic to the selected primitives and deterministic framing.

## Decision outcome

The proposal is `REJECTED`. The approved product invariant favors minimal
latency, bandwidth, allocation, and mobile cost and explicitly accepts outer
length and timing leakage. Further research cannot make a mandatory
size-bucket schedule eligible under this decision ID.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This record creates no active normative algorithm definition.
