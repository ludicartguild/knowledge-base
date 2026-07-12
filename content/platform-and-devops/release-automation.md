---
title: "Release Automation: Semantic Versioning & Conventional Commits"
tags: [platform, cicd]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Release automation removes humans from the mechanical parts of shipping a
version. You write commit messages in a structured format (Conventional
Commits), a tool reads the commit history since the last release, decides the
next version number by the rules of Semantic Versioning, then generates a
changelog, tags the release, and hands off an artifact to a deploy pipeline. The
version number stops being a judgment call and becomes a deterministic function
of what actually changed.

## Why it exists

Doing releases by hand is unreliable in ways that compound over time.

Deciding the version manually invites disagreement and drift. Was this change a
bug fix or a new feature? Should it bump the minor or the patch? Different people
answer differently, and the number stops meaning anything consistent. Consumers
who rely on the number to gauge upgrade risk get misled.

Writing changelogs by hand is tedious, so it gets skipped or done badly.
Entries are forgotten, worded inconsistently, or written days later from faulty
memory. A changelog that is incomplete is worse than none, because people trust
it.

The mechanical steps around a release are easy to get wrong under pressure:
tagging the wrong commit, forgetting to tag at all, publishing an artifact whose
version does not match its tag, or shipping from a dirty working tree. Each of
these is a small mistake with an outsized cost, and each is exactly the kind of
rote work that automation handles perfectly and humans handle poorly.

The core idea of release automation is to make the version number and the
changelog fall out of information you already produce as a side effect of normal
work: your commit messages. If the commits are structured, everything downstream
can be derived.

## How it works

### Semantic Versioning: what the number means

Semantic Versioning (SemVer) gives a version the form `MAJOR.MINOR.PATCH`, for
example `2.4.1`, where each part is a non-negative integer without leading
zeroes. Each position carries a promise about compatibility:

- **MAJOR** increments when you make incompatible [[glossary#a|API]] changes. Upgrading may
  break existing consumers, so they must read release notes and adapt.
- **MINOR** increments when you add functionality in a backward compatible
  manner. Existing consumers keep working; new capability is available if they
  want it.
- **PATCH** increments when you make backward compatible bug fixes. Safe to take
  without changes on the consumer side.

Two refinements matter in practice. A pre-release is denoted by appending a
hyphen and dot separated identifiers after the patch number, as in
`2.4.0-rc.1`; a pre-release has lower precedence than the matching normal
version. Build metadata is appended with a plus sign, as in `2.4.0+build.5`, and
is ignored when comparing versions. One more rule catches people out: major
version zero (`0.y.z`) is the initial development phase where anything may change
at any time, so the usual compatibility promises do not yet apply. Reaching
`1.0.0` is the act of committing to a stable public API.

The value of SemVer is that the number is a contract. A consumer pinned to
`^2.4.1` can accept `2.5.0` automatically but will refuse `3.0.0`, because the
number itself encodes whether the upgrade is safe.

### Conventional Commits: making history machine readable

Semantic Versioning tells you what a version bump means, but not which bump a
given change deserves. Conventional Commits closes that gap by standardizing the
commit message so a tool can classify each change. The structure is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The `type` names the kind of change. Two types are load bearing because they map
directly onto SemVer:

- **`feat`** introduces a new feature. This correlates with a **MINOR** bump.
- **`fix`** patches a bug. This correlates with a **PATCH** bump.

A breaking change is signaled in one of two equivalent ways: a footer beginning
with `BREAKING CHANGE:`, or a `!` appended after the type or scope, as in
`feat!:` or `feat(api)!:`. Either one correlates with a **MAJOR** bump,
regardless of the type used.

Other conventional types such as `docs`, `chore`, `refactor`, `test`, `build`,
`ci`, `perf`, and `style` are common and useful for organizing history and
changelogs, but they do not by themselves force a version bump. The optional
`scope` is a noun in parentheses naming the part of the codebase touched, for
example `fix(parser):`, which lets changelogs group entries by area.

A few example messages:

```
feat(auth): add support for one-time passcodes
fix: prevent race condition when caching tokens
refactor(core): extract retry logic into a helper

feat(api)!: remove the deprecated v1 endpoints

BREAKING CHANGE: clients must migrate to the v2 endpoints.
```

### Deriving the next version automatically

Once history is structured, choosing the next version is deterministic. A
release tool walks every commit since the last release tag and takes the highest
bump implied by any of them: if any commit is breaking, the release is MAJOR; if
none is breaking but at least one is a `feat`, it is MINOR; if only `fix`
commits (and other non-bumping types) are present, it is PATCH. If nothing in
the range warrants a bump, there is simply no release. The human never types a
version number; it is computed.

### Generating changelogs and release notes

The same parsed commits produce the changelog. The tool groups entries by type
(features, bug fixes, breaking changes), formats each from the commit
description and scope, and typically links back to commits or pull requests.
Breaking changes are surfaced prominently, drawn from the `BREAKING CHANGE`
footers, so consumers see migration notes without hunting for them. Because the
changelog is generated from the same source of truth as the version number, the
two can never silently disagree.

### Release pull requests and tagging

There are two common shapes for the automated flow.

One shape runs on every merge to the main branch: the tool computes the next
version, updates version files and the changelog, creates a git tag, and
publishes the artifact in one motion. This is fast and fully hands off.

The other shape uses a standing release pull request. As changes land on the
main branch, the tool maintains an open pull request that accumulates the
pending version bump and the drafted changelog. The release does not happen
until a human merges that pull request, at which point the tag and publish fire.
This adds a deliberate human gate, which teams like when releases carry weight,
while still keeping the version and changelog fully automated. Tools in the
release automation space generally implement one or both of these shapes.

### Feeding a deploy or promotion pipeline

Automation produces a concrete, immutable output: a tagged commit and a
versioned artifact. That artifact becomes the unit that a deployment pipeline
promotes. A common pattern is that publishing a new tag triggers a deploy to a
lower environment, and the same versioned artifact is then promoted through
higher environments by later stages rather than being rebuilt. Because the
version is meaningful and unique, every environment can report exactly which
version it is running, and a rollback is just redeploying a previous known tag.
The structured version is what makes promotion auditable.

## Trade-offs & when to use

The central cost is discipline. The entire scheme rests on commit messages being
correct, so the team has to actually write Conventional Commits, and a
misclassified commit produces a wrong version or a missing changelog entry. A
`feat` mislabeled as a `fix` will fail to bump the minor; a breaking change with
no `BREAKING CHANGE` footer will ship as an ordinary feature and surprise
consumers. Enforcement helps but is not free.

Enforcement usually takes the form of a commit message check, run as a local
commit hook and again in continuous integration, that rejects messages which do
not parse. Teams sometimes soften the burden on contributors by squash merging
pull requests and deriving the single conventional commit from the pull request
title, so only the title needs to be well formed. Either way there is a learning
curve and a period of correction before it becomes habit.

Release automation pays off when you release often, when more than one person
touches the history, when you publish something others depend on and therefore
owe a real compatibility contract, or when manual releases have already produced
mistakes. It pays off least for a solo throwaway project or something that
releases once a year, where the ceremony can outweigh the savings. Pre `1.0.0`
work is a reasonable place to adopt the tooling early, since the compatibility
promises are relaxed and you can build the habit before the number starts
mattering.

## Pitfalls / done-right checklist

- **Enforce the format.** Validate commit messages in a hook and in continuous
  integration. A convention no one checks decays within weeks.
- **Never hand edit the generated version or changelog.** The moment a human
  overrides the computed output, the guarantee that version and changelog match
  reality is gone.
- **Do not forget breaking changes.** The most damaging error is shipping a
  breaking change without the `BREAKING CHANGE` footer or `!`, because it goes
  out as a minor or patch and quietly breaks consumers. Review for this
  explicitly.
- **Keep one source of truth for the version.** Derive package manifests, tags,
  and any embedded version constant from the same computed number rather than
  maintaining several by hand.
- **Release from a clean, current main branch only.** Automate the release off
  the integration branch so you never publish from a dirty or stale tree.
- **Make artifacts immutable and promote, do not rebuild.** The artifact tied to
  a tag should be built once and moved through environments unchanged, so what
  you tested is what you ship.
- **Watch the `0.y.z` boundary.** Understand that before `1.0.0` a `feat` under
  some configurations bumps the patch rather than the minor, and decide
  deliberately when you commit to `1.0.0`.
- **Handle the no release case.** If a batch of merges contains only
  documentation and chore commits, the correct outcome is no new version. Make
  sure the pipeline treats that as success, not an error.

## Mental model

Think of the commit history as an append only ledger of typed changes, and the
release tool as an accountant that closes the books. Each commit is a line item
tagged with what kind of change it is. At release time the accountant reads
every line item since the last close, applies fixed rules to compute one
figure, the next version, and writes the statement, the changelog, from the same
ledger. The human's only job is to record each line item honestly as it
happens. Everything downstream, the number, the notes, the tag, the artifact
that flows into deployment, is arithmetic on that ledger. Get the bookkeeping
right at commit time and the release becomes a calculation rather than a
decision.

## Cross-links

- [[cicd-and-github-actions]]
- [[environments-and-promotion]]
- [[git-and-github]]

## Sources

- Semantic Versioning 2.0.0, the specification defining `MAJOR.MINOR.PATCH` and
  the increment rules: https://semver.org/
- Conventional Commits 1.0.0, the commit message specification and its mapping
  to Semantic Versioning: https://www.conventionalcommits.org/en/v1.0.0/
- semantic-release, a tool that automates version determination, changelog
  generation, tagging, and publishing from Conventional Commits:
  https://semantic-release.gitbook.io/
- release-please, a tool that maintains a standing release pull request and
  automates versioning and changelogs: https://github.com/googleapis/release-please
- commitlint, a linter that enforces Conventional Commits at commit time and in
  continuous integration: https://commitlint.js.org/
