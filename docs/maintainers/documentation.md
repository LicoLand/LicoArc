# Documentation maintenance

Keep one authored source for each fact. Documentation changes are reviewed in Git,
and the public HTML is a build artifact, not a second manuscript.

## Authority and document types

| Type | Source | Purpose |
| --- | --- | --- |
| Normative definition | Versioned `spec/` sources, their manifests and field registry | Exact shared meaning, encoding, lifecycle and conformance requirements |
| Domain model | Root README's Core Domain Model | The existing three-entity model; do not redefine it in a guide |
| Explanation and guide | Root product/architecture/context documents and `docs/guides/`, `docs/protocols/` | Reading paths, examples and rationale, with links to owning definitions |
| Current status | Machine manifests, projected by `docs/STATUS.md` | Identify the definition being read; website badges/tables are generated |
| Decision history | `docs/algorithm-decisions/`, `docs/field-decisions/`, `docs/adrs/` | Why decisions were made, not replacement rules |
| Repository policy | CONTRIBUTING, SECURITY, CODE_OF_CONDUCT and maintainer guides | How contributions, reporting and publication work |

A contradiction between a schema and normative prose is a defect to fix together,
not a rule permitting each implementation to choose a different authority. A guide,
a historical decision, a website or a translation cannot silently amend the wire.
The existing [decision lifecycle](../DECISION-LIFECYCLE.md) governs semantic changes.

## Where to put a change

An explanation belongs in the nearest guide or protocol overview. Link to the
normative rule instead of copying tables of limits, lifecycle flags or entire schemas.
A new cross-endpoint rule belongs in its owning `spec/` capability, with the normal
field/algorithm decision work where applicable. Rendering-only edits do not reopen
cryptography or require an SDK deployment.

Public discussion starts in an issue or PR. Record the problem, example, proposed
meaning and compatibility impact there. Accepted decisions become durable decision
records; scratch research and personal reports remain outside the published graph.
Do not require a contributor to complete an algorithm decision to correct a typo.

## Catalogue and navigation

`docs/catalog.json` is the single reader-navigation catalogue. New public guides get
an appropriate section entry. Detailed decision records remain linked from their
workspace indexes, rather than filling the main navigation with hundreds of items.
Publication roots and exclusions are explicit. Build output, local research, scripts,
credentials and untracked files are not documentation inputs.

Use normal relative Markdown links, including links to `.json` and `.cddl` sources.
MkDocs resolves published pages; links to repository-only material point to the
same exact source revision. Keep heading links stable, or supply a route/fragment
redirect in the catalogue when changing an already public location.

The main reference is English. Existing Chinese material stays available, labelled
as localized content; it is not a second wire definition. Do not invent translations
or claim synchronized language coverage where there is none.

## Review a documentation PR

Check the intended audience and document type, direct links to normative sources,
examples, terminology, and whether current-state claims still agree with manifests.
Run `npm run docs:check`. The documentation preview workflow additionally renders
and checks the complete site. This checks publishing integrity, not whether a
protocol design has been deployed.

Do not rename normative files just to obtain attractive website URLs: source paths
may participate in definition artifacts. Navigation and legacy redirects can change
without relocating those authorities.
