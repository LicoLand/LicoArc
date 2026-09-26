# Documentation publishing

## One source, two repositories

LicoArc owns Markdown, specification sources and `docs/catalog.json`. The
licoarc.com repository owns a pinned MkDocs toolchain, theme assets and publishing
workflows. It does not maintain protocol chapter HTML or a parallel protocol narrative.

The build copies an explicit set of tracked sources into a temporary staging tree,
renders them with MkDocs, and produces navigation, section anchors, search data,
sitemap, machine-readable Markdown copies and a source-to-page map. Current status
comes from the manifests in that same checkout, never a separately typed website value.
Every public page links back to its source revision; decision history is visibly distinct
from the current normative reference.

## Public channel and previews

The website's publishing configuration follows LicoArc's protected `release` branch.
A build resolves it once to an exact commit, checks out that commit, and records it
with a digest of the publication inputs in the generated provenance. The name V1 is
not a substitute for that exact revision. Protocol status is displayed, not changed,
by publication; documentation can describe a Candidate without claiming it is deployed.

PR previews use an explicit source revision, never a hidden switch of the public
channel. Preview builds receive no Pages deployment permission and are marked noindex.
A documentation PR can render its own source through the pinned website renderer.

After the companion publishing changes reach their protected branches, the website
workflow automatically checks the source branch hourly, and also runs on website
changes or an explicit dispatch. GitHub scheduling can be delayed; this is automatic
synchronization, not an immediate-delivery guarantee. It needs no cross-repository
write token. A maintainer can trigger the same workflow after a promotion for prompt
publication. Do not silently follow an unreviewed feature branch on the public site.

## Reproduce or roll back

Download a preview/build artifact or check out its recorded source and renderer
commits. The website README provides the build command and locked dependencies.
Rendered HTML can be hosted by any ordinary static server; GitHub Pages is not part
of protocol meaning. A failed build does not upload a replacement site.

Rollback means selecting a previous exact source commit in the website publishing
configuration, then building it with a compatible renderer. It never edits an old
specification in place or changes a protocol version number. Restore the branch
selector when the corrected source is ready.

## Changes and support

Document substantive changes in the root changelog. Report incorrect prose against
its LicoArc source page; report navigation/rendering failures against licoarc.com.
[Contributing](../../CONTRIBUTING.md) and [Security](../../SECURITY.md) are the existing
public entry points. Source license and document scope remain visible on the site.
Do not turn publication workflows, search indexing or server availability into
prerequisites for protocol design review.
