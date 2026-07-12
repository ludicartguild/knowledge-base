---
title: "Environments & Promotion"
tags: [platform, devops, environments, cicd]
level: deep
type: concept
---

## TL;DR

Real systems run in several isolated copies, commonly **dev**, **test/QA**, **staging**, and **production**, so that change can be exercised and verified somewhere safe before it reaches real users and real data. Everything that is not production is loosely called **non-prod**. The discipline that makes this work is **promotion**: build an artifact **once**, then move that same immutable artifact up the chain, injecting per-environment config as you go, behind gates that get stricter the closer you get to production. Two rules carry most of the value: keep the environments as alike as possible (parity), and never rebuild between them.

## Why it exists

You cannot safely test destructive or half-finished work against live users and their data, and you cannot be confident a change works until you have run it somewhere that behaves like production. Environments give you those somewheres: places to integrate, test, and rehearse, isolated from production and from each other.

But isolation alone is not enough. If your test environment differs materially from production (different database engine, different config, stale data shape), then "it passed in test" tells you little. The twelve-factor **dev/prod parity** principle exists precisely because "differences between backing services mean that tiny incompatibilities crop up, causing code that worked and passed tests in development or staging to fail in production." Environments earn their keep only when they are faithful stand-ins.

## How it works

### The common tiers

Names vary by organization, but the ladder is consistent:

- **dev**: where features are built and first integrated; fast, tolerant of breakage, often shared or per-developer.
- **test / QA**: where automated suites and manual testing run against a controlled dataset.
- **staging (pre-prod)**: the closest mirror of production, used for final verification, release rehearsals, and sign-off.
- **production (prod)**: the live environment real users touch.

The lower three (and any others like a demo or integration tier) are collectively **non-prod**. People speak of "lower" and "higher" environments, and of a change "moving up" toward prod.

### Isolation

Each environment gets its **own** infrastructure, data, and credentials. Production data and secrets never flow down into non-prod (that is both a security and a privacy hazard); non-prod uses synthetic or scrubbed data and its own secrets. Configuration that differs per environment (endpoints, feature flags, credentials) is supplied as **config**, kept out of the code, so the same code behaves correctly in each place.

### Promotion: build once, move the same artifact

The key mechanic is the separation of **build, release, run**:

1. **Build** turns a specific commit into an immutable artifact (e.g. a container image).
2. **Release** combines that build with a given environment's config into an immutable, uniquely identified release.
3. **Run** executes a release in its environment.

Crucially, the **same build is promoted up the chain rather than rebuilt per environment**: "it is impossible to make changes to the code at runtime, since there is no way to propagate those changes back to the build stage." Rebuilding for prod would mean the thing you tested is not the thing you shipped. So the artifact that passed in staging is the exact artifact that runs in prod; only the injected config changes.

![[environment-promotion.drawio.svg]]

### Gates that tighten toward production

Promotion is not automatic all the way up. Movement between environments is guarded, and the guards get stricter as risk rises:

- **dev/test**: usually automatic on merge, so feedback is fast.
- **staging**: often automatic once tests pass, or a lightweight approval.
- **production**: an explicit gate, commonly **required reviewers** (a human approves the deploy), sometimes a **wait timer**, and **deployment branch/tag restrictions** (only a release tag or the main branch may deploy). Environment-scoped secrets are released only *after* those protection rules are satisfied.

This is where environments meet delivery: promotion is frequently expressed as a tag or a GitOps state change that targets a protected environment (see [[cicd-and-github-actions]]), and the per-environment infrastructure is defined as code (see [[infrastructure-as-code]]).

### Ephemeral / preview environments

A modern addition: spin up a short-lived environment per pull request (a "preview" or "ephemeral" environment), verify the change in isolation, then tear it down on merge. It gives high parity on demand without maintaining another permanent tier.

## Trade-offs & when to use

- **More tiers** means more confidence but more cost and operational overhead. Small systems may collapse test and staging; large or regulated ones may add integration, performance, or demo tiers.
- **Higher parity** costs more (running production-grade backing services in non-prod) but is the whole point; cutting it (SQLite in dev, managed Postgres in prod) is a false economy that surfaces as prod-only bugs.
- **Ephemeral environments** trade some infra automation effort for excellent per-change isolation.

## Pitfalls / done-right checklist

- **Build once, promote the same artifact**; never rebuild per environment.
- **Keep config out of code** and per-environment; the release = artifact + that environment's config.
- **Isolate fully**: separate data, secrets, and infra per environment; **no production data or secrets in non-prod**.
- **Maximize parity**, especially backing services (same database/cache/queue engines).
- **Gate production** with required reviewers and branch/tag restrictions; release env-scoped secrets only after the gate.
- **Automate the lower tiers** so feedback stays fast; reserve friction for the top of the ladder.

## Mental model

Environments are **dress rehearsals before opening night**. The cast, set, and script (the artifact) stay the same from the tech rehearsal through the dress rehearsal to opening; what changes is the venue and its settings (the config). You would never rewrite the play backstage on opening night, and you would never let an unrehearsed scene go straight to a paying audience. Promotion is walking the same production through progressively more realistic, more scrutinized rehearsals until it is trusted enough for the real crowd.

## Cross-links

- [[secrets-and-supply-chain-security]]: per-environment secrets and why production credentials never reach non-prod.
- [[cicd-and-github-actions]]: the pipeline that performs promotion and enforces environment gates.
- [[infrastructure-as-code]]: defining each environment's infrastructure reproducibly.

## Sources

- The Twelve-Factor App, Dev/prod parity: https://12factor.net/dev-prod-parity
- The Twelve-Factor App, Build, release, run: https://12factor.net/build-release-run
- The Twelve-Factor App, Config: https://12factor.net/config
- GitHub Actions, managing environments and protection rules: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
