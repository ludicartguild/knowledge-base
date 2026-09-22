---
title: "DevOps with GitHub Actions"
tags: [lesson-plan, platform, cicd]
level: deep
type: moc
reviewed: 2026-09-22
---

DevOps foundations first, then deep fluency in one delivery platform. The culture half is
not preamble: most failed DevOps adoptions bought the tooling and kept the org chart.

GitHub Actions is the vehicle because depth in one system teaches the shape of all of
them. What you learn about promotion, least privilege, and reusability transfers to
whatever you use next.

## Objectives

By the end of this path you can:

* State what DevOps means without listing tools, and name the anti-patterns.
* Use the DORA metrics to describe a team's delivery performance honestly.
* Choose a branching strategy and defend it against the alternatives.
* Distinguish continuous integration, delivery, and deployment precisely.
* Write multi-job workflows with dependencies, conditions, and environments.
* Build matrix jobs, reusable workflows, and composite actions, and know which to reach for.
* Authenticate to a cloud with OIDC instead of long-lived secrets.
* Run self-hosted runners without opening a privilege escalation path.

## Prerequisites

A GitHub account, git fluency, and something you can deploy. Some cloud familiarity
helps by section 8.

## How to use this path

Work in order. Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** build it in a real repository.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

## 1. What DevOps actually is

The culture claim, taken seriously.

**Focus:** What does "you build it, you run it" commit you to? What is DevOps not?

**Learn:**
* [The Phoenix Project](https://itrevolution.com/product/the-phoenix-project/): the novel that made the argument legible to management.
* [Google SRE Book](https://sre.google/books/): a specific, opinionated implementation of the same ideas.

**Practice:** Write down how your current team handles a production incident. Mark each
step where a handoff crosses an organisational boundary. That count is your starting
diagnosis.

**Self-check:** you can define DevOps without naming a tool, and identify the
anti-patterns.

> [!question]- Answer
> **You build it, you run it.** Werner Vogels' one-line version. The team that ships a
> service operates it, which closes the feedback loop between writing code and living
> with it. The uncomfortable implication is that the pager is part of the job.
> **The wall of confusion.** Development rewarded for change, operations rewarded for
> stability, and a throwing-over-the-wall handoff between them. Every DevOps practice is
> ultimately aimed at this.
> **Shift left.** Move testing, security, performance, and deployability earlier rather
> than treating them as gates at the end. Late discovery is what makes them expensive.
> **The autonomous team.** Small enough to take a feature from idea to production without
> crossing an organisational boundary. This is the foundational unit, and it is an org
> design problem rather than a tooling one.
> **What it is not.** Not a job title, not a team you create alongside dev and ops, and
> not a tool you buy. A "DevOps team" sitting between developers and operations has
> rebuilt the wall with a new name, which is the most common failure mode.

**Ask yourself:**
* Who gets paged when my code breaks, and did they write it?
* Which of my handoffs exists for a real reason rather than a historical one?

## 2. Culture and frameworks

The models worth knowing by name.

**Focus:** What are CALMS, the Three Ways, and the DORA metrics? What does a blameless
postmortem actually require?

**Learn:**
* [DORA: DevOps Research and Assessment](https://dora.dev/): the research behind the four metrics.
* [Accelerate](https://itrevolution.com/product/accelerate/): the book presenting that research.

**Practice:** Measure the four DORA metrics for one real repository over the last quarter.
Deployment frequency and lead time are usually available from git history. Be honest
about change failure rate.

**Self-check:** you can state the four DORA metrics and explain why they are chosen, and
describe what makes a postmortem blameless.

> [!question]- Answer
> **DORA's four.** Deployment frequency, lead time for changes, change failure rate, and
> time to restore service. The first two measure throughput, the second two measure
> stability. The important finding is that they correlate positively rather than trading
> off: high performers are both faster and more stable, which contradicts the intuition
> that speed costs safety.
> **CALMS.** Culture, Automation, Lean, Measurement, Sharing. Useful mainly as a reminder
> that automation is one of five and the one people mistake for the whole.
> **The Three Ways.** Flow left to right, feedback right to left, and continual
> experimentation. In that order, because feedback without flow is noise and
> experimentation without feedback is guessing.
> **Blameless postmortems.** Analysing an incident without assigning individual fault.
> The point is not kindness, it is information: people who expect blame withhold the
> details that would prevent recurrence. What makes one actually blameless is whether the
> action items are systemic rather than "be more careful".
> **Toil.** Repetitive manual operational work that scales with the size of the service.
> SRE practice budgets it explicitly and treats reducing it as engineering work rather
> than as something done when there is time.

**Ask yourself:**
* Of the four metrics, which would my team look worst on, and do we measure it at all?
* When something broke last, did the postmortem produce a system change or a resolution to be careful?

## 3. Version control and workflow

The change unit and the rules around it.

**Focus:** Which branching strategy fits your situation? What should branch protection
enforce?

**Learn:**
* [[git-and-github|Git and GitHub]]: the workflow foundations.
* [Trunk Based Development](https://trunkbaseddevelopment.com/): the case against long-lived branches.
* [Conventional Commits](https://www.conventionalcommits.org/): structured messages tools can parse.

**Practice:** Set up branch protection on a real repository requiring review, green CI,
and linear history. Adopt conventional commits and generate a changelog from them.

**Self-check:** you can compare branching strategies with reasons, and say what each
branch protection rule prevents.

> [!question]- Answer
> **The strategies.** Trunk-based means short-lived branches merged to main daily, with
> feature flags hiding incomplete work. GitHub Flow is trunk-based plus pull requests.
> GitFlow adds develop and release branches, and suits versioned software shipped to
> customers who install it rather than continuously deployed services.
> **How to choose.** The real question is how long a branch lives. Long-lived branches
> drift, and the eventual merge conflict is proportional to the drift. If you deploy
> continuously, anything but trunk-based is fighting you.
> **Branch protection.** Require review to get a second pair of eyes. Require green CI so
> main is always releasable. Require linear history so bisecting works. Require signed
> commits where supply chain matters. Restrict force pushes so history cannot be rewritten
> under people.
> **Conventional commits.** `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`. The value is
> downstream: automated changelogs and semantic version bumps derived from what the
> commits claim. The cost is discipline, and the benefit only arrives once something
> actually consumes them.
> **Code review.** Two lenses: does this work, and will this be maintainable. Most review
> comments are about the first and most review value is in the second.

**Ask yourself:**
* How long does my average branch live, and what does that cost at merge?
* Which protection rule would have prevented my last bad incident?

## 4. CI/CD concepts

The three things called CD.

**Focus:** What is the difference between continuous integration, delivery, and
deployment? Why must you not rebuild between environments?

**Learn:**
* [[cicd-and-github-actions|CI/CD and GitHub Actions]]: the concepts and the platform.
* [[environments-and-promotion|Environments and promotion]]: moving one artifact through stages.

**Practice:** Draw your current delivery pipeline as stages. Mark where the artifact is
built and every point where it is rebuilt. Then fix it so it is built once.

**Self-check:** you can distinguish the three, and explain what breaks when you rebuild
per environment.

> [!question]- Answer
> **Continuous integration.** Every commit merges into a shared mainline at least daily
> and is automatically built and tested. The point is preventing integration friction,
> not running tests. A team with tests on a branch nobody merges does not have CI.
> **Continuous delivery.** Every successful build is deployable to production at the
> press of a button. Production deployment remains a human decision.
> **Continuous deployment.** Every successful build is deployed, with no human in the
> loop. It requires observability and automated rollback that most teams do not have, and
> adopting it without them is how you find out.
> **The pipeline.** Source, build, test, deploy, verify. Different artifacts take
> different paths through it, which is why a single pipeline for everything eventually
> stops fitting.
> **Build once, promote.** Build the artifact one time, test that artifact, and move the
> identical bytes through dev, staging, and production. Rebuilding means production runs
> something you never tested: dependencies may resolve differently, the base image may
> have moved, build-time configuration may differ. This is the single most important
> deployment discipline and the one most often broken by accident.

**Ask yourself:**
* Is the thing in production the same artifact that passed my tests, by digest?
* Do I have continuous delivery, or do I have CI and a manual deploy script?

## 5. GitHub Actions foundations

The model underneath the YAML.

**Focus:** What are the five nouns? What are contexts and expressions? Why pin actions?

**Learn:**
* [GitHub Actions documentation](https://docs.github.com/en/actions): the reference.
* [Contexts reference](https://docs.github.com/en/actions/learn-github-actions/contexts): what is available in an expression.

**Practice:** Write a workflow from scratch that triggers on push and pull request, checks
out the code, runs tests, and uploads a result artifact. Pin every action to a commit SHA.

**Self-check:** you can write a workflow from memory and explain the five nouns and why
SHA pinning matters.

> [!question]- Answer
> **The five nouns.** A workflow is a YAML file triggered by an event. An event is what
> triggers it. A job is a set of steps running on one runner. A step is a single task. An
> action is a reusable step someone packaged.
> **Runners.** The machines executing jobs. GitHub-hosted are free for public repos and
> metered for private. Self-hosted are your hardware and your problem, covered in section 9.
> **Contexts.** `github`, `env`, `secrets`, `steps`, `job`, `runner`, `inputs`, `matrix`.
> You reference these constantly, and knowing what is available is most of the fluency.
> **Expressions.** The `${{ }}` language used in `if:` conditions and parameters.
> `${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}` is the pattern
> you will write most often.
> **Why pin to a SHA.** `actions/checkout@v4` is a tag, and a tag can be moved by the
> maintainer or by an attacker who compromises the account. A SHA cannot be moved. For
> anything touching secrets or deploying, pin to the SHA and let Dependabot propose
> updates as pull requests.

**Ask yourself:**
* If a popular action I use were compromised tomorrow, what would it have access to?
* Which context value am I recomputing by hand because I did not know it existed?

## 6. Production workflows

Multi-job pipelines with real gates.

**Focus:** How do jobs depend on each other and pass data? What do GitHub Environments
give you? Why does concurrency control matter for deploys?

**Learn:**
* [Using jobs](https://docs.github.com/en/actions/using-jobs): dependencies, outputs, conditions.
* [Deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments): protection rules and approvals.

**Practice:** Build a pipeline with separate test, build, and deploy jobs using `needs:`.
Deploy to a staging environment automatically and require manual approval for production.
Add a concurrency group so two deploys cannot race.

**Self-check:** you can express job dependencies and outputs, configure an environment
with a required reviewer, and explain what concurrency control prevents.

> [!question]- Answer
> **`needs:`.** Declares that a job waits for another. Jobs without a `needs:` relation
> run in parallel, which is the default and usually what you want for test matrices.
> **Passing data.** Steps expose `outputs`, jobs aggregate step outputs into job outputs,
> and a downstream job reads them through the `needs` context. Files move between jobs as
> artifacts, because jobs run on different machines and share no filesystem.
> **Environments.** Named targets carrying protection rules: required reviewers, wait
> timers, and branch restrictions, plus environment-scoped secrets. This is where the
> manual approval gate lives, and scoping production secrets to the production
> environment is what stops a pull request workflow reaching them.
> **Concurrency.** `concurrency:` groups runs so only one proceeds per group, cancelling
> or queueing the rest. Without it, two merges in quick succession start two deploys to
> the same environment and the slower one can overwrite the newer release. This is a real
> failure mode rather than a theoretical one.
> **Conditions.** `if:` on a job or step, commonly gating deploys on
> `github.ref == 'refs/heads/main'` so branches run tests but never ship.

**Ask yourself:**
* If two people merge within a minute, what does my pipeline do?
* Which secrets are reachable from a workflow triggered by a fork's pull request?

## 7. Advanced patterns

Not repeating yourself across repositories.

**Focus:** What is a matrix build for? When do you reach for a reusable workflow and when
for a composite action?

**Learn:**
* [Reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows): `workflow_call` and its interface.
* [Composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action): packaging steps.

**Practice:** Build a matrix testing across three language versions and two operating
systems. Then extract your build-and-test pipeline into a reusable workflow and call it
from a second repository.

**Self-check:** you can write a matrix with exclusions, and choose correctly between a
reusable workflow and a composite action.

> [!question]- Answer
> **Matrix.** `strategy.matrix` generates the cross product of the dimensions you list.
> `include` adds specific combinations, `exclude` removes them, `fail-fast: false` keeps
> the other legs running when one fails, and `max-parallel` caps concurrency. Turning off
> fail-fast is usually right during development and usually wrong in a merge gate.
> **The distinction that matters.** A reusable workflow is called with `uses:` at the
> job level and brings its own jobs, so it can run multiple jobs on multiple runners. A
> composite action is used at the step level and runs inside an existing job on one
> runner.
> **Choosing.** Many repositories needing the same multi-job pipeline calls for a
> reusable workflow. Many workflows needing the same multi-step sequence within one job
> calls for a composite action. Trying to build a pipeline as a composite action fails
> because it cannot create jobs.
> **Outputs.** A reusable workflow declares `outputs` aggregated from its job outputs, so
> the caller can use a value it computed, such as a version number or an image digest.
> **Versioning.** Callers reference a reusable workflow by ref. Pinning that ref matters
> for the same reason pinning actions does.

**Ask yourself:**
* What is duplicated across my workflows right now, and which pattern would absorb it?
* Would a caller of my reusable workflow know what it needs without reading the source?

## 8. Security and supply chain

The part that is worth getting right first.

**Focus:** What does OIDC replace and why is it better? What should `permissions:` default
to?

**Learn:**
* [[secrets-and-supply-chain-security|Secrets and supply chain security]]: short-lived credentials and pipeline hardening.
* [[iam-and-workload-identity|IAM and workload identity]]: how federation works on the cloud side.
* [OIDC in GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect): the mechanism.

**Practice:** Replace a long-lived cloud credential with OIDC federation scoped to one
repository and one branch. Set `permissions: {}` at the workflow level and grant only what
each job needs. Enable Dependabot for actions.

**Self-check:** you can configure OIDC federation, minimise token permissions, and explain
why a stored cloud key is worse than a federated one.

> [!question]- Answer
> **OIDC.** GitHub mints a short-lived token asserting which repository, branch, and
> workflow is running. Your cloud trusts that issuer and exchanges the token for
> temporary credentials. This is the single most important security pattern in modern
> Actions.
> **Why it beats a stored key.** A stored key is long-lived, exists in two places, works
> from anywhere, and has to be rotated by someone who remembers to. A federated token
> lasts minutes, never exists at rest, and can be scoped so it only works from a specific
> branch of a specific repository. A leaked key is an incident; a leaked federated token
> has usually already expired.
> **`permissions:`.** The `GITHUB_TOKEN` historically had broad write access. Set
> `permissions: {}` at the workflow level and grant narrowly at the job level. A job that
> only runs tests needs `contents: read` and nothing else.
> **Pinning.** Pin third-party actions to immutable SHAs. Pair with Dependabot so you get
> update pull requests rather than silently drifting.
> **The threat model.** A compromised action runs with your job's permissions and can see
> your job's secrets. Minimising both is what limits the damage, because you cannot
> prevent the compromise itself.

**Ask yourself:**
* If an action I depend on turned malicious, what is the worst it could do in my pipeline?
* Which of my stored secrets could be replaced by federation this week?

## 9. Scale and self-hosted runners

When the defaults stop fitting.

**Focus:** What are the hosted runner limits? What makes a self-hosted runner dangerous,
and what fixes it?

**Learn:**
* [Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners): setup and the security warnings.
* [Actions Runner Controller](https://github.com/actions/actions-runner-controller): ephemeral runners on Kubernetes.

**Practice:** Identify the slowest job in a real pipeline and work out whether the
constraint is runner specs, dependency installation, or serialisation. Fix the actual
constraint rather than the one you assumed.

**Self-check:** you can state the hosted limits, explain the self-hosted privilege
escalation risk, and describe what ephemeral runners fix.

> [!question]- Answer
> **Hosted limits.** Concurrency depends on plan, the default Linux runner is two cores
> and seven gigabytes, jobs time out at six hours, and logs are retained for 35 days.
> Larger runners up to 64 cores exist on paid plans with cost scaling roughly linearly.
> **Why self-host.** Access to a private network, specialised hardware such as GPUs, large
> persistent caches, or cost at high volume.
> **The danger.** A long-lived shared self-hosted runner executing workflows from a public
> repository is a known privilege escalation path. Anyone who can open a pull request can
> run code on your machine, and anything a previous job left behind is available to the
> next one.
> **Ephemeral runners.** Created per job and destroyed after, so nothing persists between
> jobs and a compromise does not outlive one run. This is the only safe way to self-host
> anything sensitive.
> **Actions Runner Controller.** Runs ephemeral runners as Kubernetes pods that scale on
> queue depth. The modern answer to self-hosting at scale, and it makes ephemerality the
> default rather than something you remember to configure.
> **Monorepos.** Path filters to skip unaffected work, and change detection so a hundred
> packages do not all rebuild because one changed.

**Ask yourself:**
* Is my slowest job slow because of the runner, or because of something I could cache?
* Does anything persist between jobs on my runners that should not?

## 10. Beyond GitHub Actions

Where the discipline goes next.

**Focus:** What is GitOps and how does it relate to a build pipeline? What does the "run
it" half of "you build it, you run it" require?

**Learn:**
* [[gitops|GitOps]]: reconciling a cluster toward a declared state.
* [[infrastructure-as-code|Infrastructure as code]]: the same idea applied to infrastructure.
* [[observability-with-opentelemetry|Observability with OpenTelemetry]]: shipping with sight.

**Practice:** Split one delivery flow into a build half and a deploy half, with the build
in Actions producing an artifact and the deploy driven by a git-committed manifest. Then
write the runbook you would want at 3am.

**Self-check:** you can explain GitOps against push-based deployment, and describe what
operating a service requires beyond deploying it.

> [!question]- Answer
> **GitOps.** The desired state of the cluster lives in git and a controller inside the
> cluster continuously reconciles toward it. Argo CD and Flux are the common
> implementations.
> **Against push-based deploys.** A push pipeline needs credentials into the cluster from
> outside. A GitOps controller pulls from git, so the cluster needs no inbound access and
> the pipeline needs no cluster credentials. It also means drift is corrected
> automatically rather than discovered later.
> **The natural split.** Actions builds and publishes the artifact and updates a manifest;
> the controller notices and reconciles. The build system stops needing production access
> entirely, which is a large reduction in what a compromised workflow can reach.
> **The run-it half.** Observability so you can see what is happening, on-call so someone
> is responsible, runbooks so that person does not have to reconstruct the system at 3am,
> and postmortems so the same incident does not recur. CI/CD without this is shipping
> blind, and it is the half most teams do last.

**Ask yourself:**
* Does my build system hold credentials it would not need under GitOps?
* If I were paged tonight for this service, what would I wish existed?

## Capstone

One repository with a pipeline that tests on a matrix, builds an artifact once, promotes
it through staging to production behind a required reviewer, authenticates to a cloud
with OIDC and no stored keys, pins every action to a SHA, and refuses to run two deploys
at once.

Then extract the reusable half and call it from a second repository.

## Self-assessment checklist

- [ ] I can define DevOps without naming a tool and name the anti-patterns.
- [ ] I can state the DORA metrics and why they are the ones chosen.
- [ ] I can compare branching strategies and say what each protection rule prevents.
- [ ] I can distinguish CI, continuous delivery, and continuous deployment.
- [ ] I can write a workflow from memory and explain why SHA pinning matters.
- [ ] I can build multi-job pipelines with environments, approvals, and concurrency control.
- [ ] I can choose between a reusable workflow and a composite action with reasons.
- [ ] I can configure OIDC federation and minimise token permissions.
- [ ] I can explain the self-hosted runner risk and what ephemeral runners fix.
- [ ] I can explain GitOps against push-based deployment.
