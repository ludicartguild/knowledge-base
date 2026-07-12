---
title: "GitOps: Declarative, Git-Driven Delivery"
tags: [platform, cicd]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

GitOps is an operating model for delivering software and infrastructure where a git repository holds the **declarative desired state** of a system, and an automated **reconciler** running next to the target continuously makes the real system match what git says. You do not push changes into the environment by running deploy scripts; instead you change git, and an agent **pulls** the new state and converges the environment toward it. Git becomes the single source of truth and the audit log: every change is a commit, drift is detected and corrected automatically, and rollback is just reverting to an earlier commit. It fits declarative targets (Kubernetes above all) extremely well and fits some imperative, one-off steps poorly.

## Why it exists

Traditional delivery is **imperative and push-based**: a person or a pipeline runs a sequence of commands (apply this manifest, restart that service, patch this setting) against a live environment. Two problems follow.

First, **drift**. The live system slowly diverges from any written description of it. Someone hotfixes a setting by hand during an incident, a script half-fails and leaves the system in a partial state, two pipelines apply conflicting changes. Over time nobody can say with confidence what is actually running, because the real state lives only in the cluster, not in any reviewable file.

Second, **weak auditability and recovery**. When deployment is a series of imperative actions, there is no single reliable record of who changed what, when, and why. Reproducing an environment means remembering (or reverse-engineering) the exact sequence of steps that built it, and rolling back a bad change means manually undoing those steps under pressure.

GitOps exists to remove both problems by making the desired state an explicit, versioned artifact and making convergence to that state continuous and automatic rather than a manual event.

## How it works

![[gitops-reconcile.drawio.svg]]

### The four OpenGitOps principles

The CNCF OpenGitOps project defines GitOps through four principles. A system is managed by GitOps when its desired state is:

1. **Declarative.** The desired state is expressed **declaratively**: you describe *what* the system should look like, not the imperative steps to get there. A set of Kubernetes manifests saying "run three replicas of this image with this config" is declarative; a shell script that creates and patches those objects one command at a time is not.
2. **Versioned and immutable.** The desired state is stored so that it is **immutable, versioned, and retains a complete history**. Git is the canonical store: every change is a commit, history is preserved, and any past state can be recovered exactly.
3. **Pulled automatically.** Software agents **automatically pull** the desired state declarations from the source. Nobody hand-carries changes into the environment; the agent watches the source and takes what it finds.
4. **Continuously reconciled.** Software agents **continuously observe** the actual system state and **attempt to apply** the desired state, closing any gap between the two on an ongoing loop rather than at a single deploy moment.

### Git as the single source of truth

In GitOps the repository is authoritative. If it is not in git, it is not part of the desired state. This is what makes the model auditable: the answer to "what should be running" is a specific commit, and the answer to "what changed" is a diff and its pull request. The same review, approval, and history mechanics that already govern application code now govern the running state of the system.

Desired state here means both **configuration and environment shape**: the workloads, their versions, replica counts, config values, network policy, and so on, all expressed as files in the repo. Changing the system means changing those files through the normal git flow (branch, pull request, review, merge), never by touching the live environment directly.

### The reconciler: continuous convergence

The engine of GitOps is a **reconciler** (also called a controller or agent) that runs a loop:

1. Read the desired state from git.
2. Observe the actual state of the live system.
3. Compute the difference.
4. Act to make actual match desired.
5. Repeat, continuously.

This loop is why GitOps is more than "deploy from git." A one-shot deploy applies a change once and forgets it. A reconciler keeps checking forever, so the system converges toward the declared state again and again, not just at the moment of a merge. Tools that implement this model include **Argo CD** and **Flux** in the Kubernetes ecosystem; both run inside (or adjacent to) the cluster and reconcile it against one or more git repositories.

### Pull-based versus push-based delivery

The reconciler placement is what distinguishes GitOps from classic [[glossary#c|CI/CD]]:

- **Push-based (traditional):** an external pipeline holds credentials to the target environment and *pushes* changes in. The environment is passive; the pipeline reaches into it.
- **Pull-based (GitOps):** an agent living **inside** the target environment *pulls* the desired state and applies it from within. The pipeline never needs standing credentials into production; it only needs to update git.

Pull-based delivery has real security and operational benefits. Credentials to mutate the environment stay inside the environment rather than being handed to an external CI system, which shrinks the attack surface, and the same reconciler that deploys also keeps watching, so it can react to drift, not just to pipeline runs.

### Drift detection and self-healing

Because the reconciler continuously compares actual against desired, it naturally detects **drift**: any divergence of the live system from git, whether from a manual change, a failed process, or an outside actor. Given that signal, two responses are possible:

- **Detect and report:** surface the drift (the environment is "out of sync") and let a human decide.
- **Self-heal:** automatically revert the live system back to the declared state, so unauthorized or accidental changes are undone without human action.

Self-healing is a powerful default because it makes git genuinely authoritative: you cannot durably change the system except through git, since anything else gets reconciled away. It is also a footgun if enabled without care (see pitfalls).

### Rollback is git revert

Since the desired state is fully versioned, **rollback is reverting to an earlier commit**. There is no separate rollback tooling or remembered sequence of undo steps; you move git back to a known-good state and the reconciler converges the system to it. Recovery becomes an ordinary, reviewable git operation with the same audit trail as any other change.

## Trade-offs & when to use

GitOps shines when the target has a strong **declarative [[glossary#a|API]]** that a controller can reconcile against. **Kubernetes** is the canonical fit: its objects are already declarative and its control plane is already a reconciliation loop, so GitOps is a natural extension. Declarative infrastructure as code (see [[infrastructure-as-code]]) is a good fit for the same reason.

It fits less naturally where delivery involves **imperative, ordered, or one-off steps** that do not reduce cleanly to "here is the end state, converge to it." Examples include stateful data migrations that must run once in a specific order, long-running interactive cutovers, or operations with side effects that cannot simply be re-applied idempotently. You can wrap some of these in declarative hooks, but the fit is awkward and often better handled by a conventional pipeline step alongside the GitOps flow rather than forced into it.

Other trade-offs to weigh:

- **Operational surface.** You now run and secure the reconciler itself, and manage repository structure for multiple environments.
- **Secrets.** Plain secrets cannot sit in git in the clear; GitOps needs an encryption or external-secrets approach so the source of truth stays safe to store.
- **Feedback shape.** A merge does not immediately mean "deployed"; it means "the reconciler will converge soon." Teams must read sync status rather than a pipeline's final green step.

## Pitfalls / done-right checklist

- **Put the whole desired state in git.** If something is applied out of band, it is invisible and will either drift or be reconciled away confusingly. If it is in the system, it should be in the repo.
- **Never mutate the live environment by hand** as the normal path. Manual changes are, by design, temporary under self-healing and untracked under detect-only. Change git instead.
- **Decide drift policy deliberately** per environment: self-heal where you want git strictly authoritative, detect-and-report where humans must adjudicate. Do not enable aggressive self-healing on a system where legitimate out-of-band changes still happen.
- **Keep secrets out of plaintext git.** Use sealed/encrypted secrets or an external secret store; the audit benefit of git must not become a credential leak.
- **Separate the config repo from application source** (or at least separate the desired-state path), so an app build does not blur into a change to what is running.
- **Express environment differences as git state**, not as imperative overrides applied later; promotion between environments becomes a change to the desired state of the target environment (see [[environments-and-promotion]]).
- **Treat rollback as a first-class git operation**: practice reverting to a known-good commit so recovery is routine, not improvised.
- **Do not force imperative one-off steps into the reconcile loop**; run them as explicit, ordered operations and let GitOps own the steady-state declarative parts.

## Mental model

Think of GitOps as a **thermostat for your system**. You do not walk around the building turning individual heaters on and off (imperative, push). You set a target temperature (the desired state in git), and a controller (the reconciler) continuously measures the actual temperature and acts to close the gap, forever. If someone opens a window and the room cools, the thermostat notices the drift and responds on its own (self-healing). If you want it warmer, you change the setting, not the heaters (change git, not the environment). And the record of every setting you ever chose is written down (versioned history), so returning to yesterday's comfortable setting is a single deliberate change (git revert), not a scramble.

## Cross-links

- [[environments-and-promotion]]: how the same immutable artifact is promoted across dev, staging, and production; in a GitOps model, promotion is expressed as a change to the desired state of the target environment rather than a push into it. That note owns the promotion mechanics; this one owns the reconciliation model.
- [[cicd-and-github-actions]]: the pull-request, build, and pipeline machinery that produces artifacts and updates the desired-state repository, complementing (not replacing) the in-cluster reconciler.
- [[infrastructure-as-code]]: the declarative-desired-state idea applied to infrastructure; GitOps is largely [[glossary#i|IaC]] plus a continuous reconciler and git as the enforced source of truth.

## Sources

- OpenGitOps (CNCF), GitOps Principles v1.0.0: https://opengitops.dev/
- OpenGitOps principles repository: https://github.com/open-gitops/documents/blob/main/PRINCIPLES.md
- Argo CD, Core Concepts and reconciliation: https://argo-cd.readthedocs.io/en/stable/core_concepts/
- Flux, GitOps and the reconciliation model: https://fluxcd.io/flux/concepts/
- Weaveworks, Guide To GitOps (original articulation of the pattern): https://www.weave.works/technologies/gitops/
- CNCF, What is GitOps (glossary): https://glossary.cncf.io/gitops/
