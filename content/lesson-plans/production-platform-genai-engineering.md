---
title: "Production Platform & GenAI Engineering"
tags: [lesson-plan, platform, ai]
level: deep
type: moc
reviewed: 2026-07-12
---

A deeper, hands-on path through building and operating a modern cloud-native platform:
from how services authenticate and authorize each other, through data, infrastructure,
delivery, and observability, up to running large-language-model agents in production.
Where the [[full-stack-interview-foundations|full-stack path]] builds fluency, this one
builds working understanding: you implement the ideas, not just explain them.

The notes are deliberately generic and vendor-neutral where it matters: they teach the
transferable pattern first, and name specific technologies only as concrete examples.

## Objectives

By the end of this path you can:

* Reason about identity, trust, and secrets across a distributed system, and implement token validation correctly.
* Model data safely with transactions and idempotent operations.
* Define infrastructure as code and promote a change through environments behind gates.
* Deliver software through a pipeline you would trust with production.
* Explain how an [[glossary#l|LLM]] agent is orchestrated, grounded, and evaluated in production.

## Prerequisites

Comfort with the [[full-stack-interview-foundations|full-stack fundamentals]] (how a web
app, [[glossary#a|API]], and database fit together), a terminal, and access to a cloud account and a
container runtime for the hands-on work.

## How to use this path

Work through the sections in order where you can; security and delivery underpin the rest.
Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer.
* **Learn:** the notes to read.
* **Practice:** build or implement something, this path rewards doing.
* **Self-check:** you understand it when you can do these.
* **Ask yourself:** heuristic questions to test real understanding.

Each section pairs a fundamentals note with deeper notes that implement the ideas; the
practice is hands-on and builds toward the capstone.

## Security

How identity, trust, and secrets work across a distributed system. Start here: almost
every other topic assumes it.

**Focus:** Which [[glossary#o|OAuth2]] grant fits which caller? How does a service verify a token offline
without trusting the attacker? Where do tokens and secrets actually live?

**Learn:**
* [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]]: grant types, [[glossary#p|PKCE]], on-behalf-of, and [[glossary#o|OIDC]].
* [[jwt-validation|JWT validation done right]]: signatures, [[glossary#j|JWKS]], claim checks, algorithm pinning.
* [[web-session-and-token-handling|web session & token handling]]: keeping tokens off the browser, secure cookies, real logout.
* [[secrets-and-supply-chain-security|secrets & supply-chain security]]: short-lived federated credentials and pipeline hardening.

**Practice:** Implement a [[glossary#j|JWT]] validation function that fetches a [[glossary#j|JWKS]], resolves the key by
`kid`, **pins the expected algorithm**, rejects `alg: none`, and checks `iss`/`aud`/`exp`.
Feed it a tampered token and a wrong-audience token and confirm both are rejected.

**Self-check:** you can validate a [[glossary#j|JWT]] correctly by hand, name the grant for user sign-in

> [!question]- Answer
> **Validating.** Fetch the issuer's JWKS, resolve the key by the token's `kid`, and
> verify the signature against a **pinned** algorithm. Reject `alg: none` and reject any
> algorithm you did not expect, since accepting the header's choice is what allows an
> RS256 public key to be replayed as an HMAC secret. Then check `iss` is the issuer you
> trust, `aud` names your service, `exp` has not passed, and `nbf` has been reached.
> Cache the JWKS but honour key rotation.
> **Grants.** User sign-in is authorization code with PKCE. Service-to-service is client
> credentials. Calling a downstream API as the user is on-behalf-of, or token exchange.
> **Why the token belongs on the server.** Anything reachable from browser JavaScript is
> reachable by any XSS on the page. Hold the token server-side and give the browser only
> an httpOnly, Secure, SameSite cookie.
vs service-to-service vs on-behalf-of, and explain why a token belongs on the server.

**Ask yourself:**
* If I skipped the audience check, what specific attack would I be opening up?
* Where in this system would a stolen long-lived secret do the most damage, and how would I remove it?

## Service architecture

Structuring services so they stay changeable: boundaries, interfaces, and the reliability
patterns that keep them honest.

**Focus:** How do you keep a service's core logic independent of its I/O? What makes an
operation safe to retry?

**Learn:**
* [[software-architecture-map|Software Architecture Map]]: the principles (SOLID, coupling & cohesion, IoC) and patterns (Strategy, Repository, Command) this builds on.
* [[hexagonal-architecture|hexagonal architecture]]: isolate the domain core from I/O behind ports and adapters.
* [[anti-corruption-layer|anti-corruption layer]]: a translation boundary that stops an external model corrupting yours.
* [[reliability-patterns|reliability patterns]]: idempotency, retries with backoff and jitter, timeouts, and circuit breakers.

**Practice:** Take a small service and push one external dependency (a database or [[glossary#h|HTTP]]
client) behind an interface, so the core logic can be tested with a fake. Then make one
write operation idempotent (safe to call twice).

**Self-check:** you can explain ports-and-adapters in your own words and point to the seam

> [!question]- Answer
> **The shape.** The core declares interfaces for what it needs, a repository or a
> notifier, and adapters implement them against the real database or HTTP client. The
> dependency points inward: the core never imports the adapter.
> **The seam.** Composition. Wherever the application is wired up, production passes the
> real adapter and the test passes a fake. If your test has to stand up a database to
> exercise a business rule, the seam is in the wrong place or missing.
> **Idempotency.** Calling twice leaves the same state as calling once. Either the
> operation is naturally idempotent (set a value rather than increment it), or the caller
> supplies a key the server records so the replay is recognised and ignored. This is what
> makes a client retry after a timeout safe.
in your code where the real adapter is swapped for a test double.

**Ask yourself:**
* Which part of this service would hurt most to change, and is that because of a missing boundary?
* If a client retried this request after a timeout, would anything go wrong?

## Data & persistence

Talking to a relational store safely and correctly.

**Focus:** What does a transaction guarantee? How do you evolve a schema without downtime?

**Learn:**
* [[databases|databases]]: relational vs [[glossary#n|NoSQL]], transactions & ACID, indexing, normalization.
* [[async-data-access|async data access, pooling & ORMs]]: non-blocking DB access, connection pools, and when to drop to raw [[glossary#s|SQL]].
* [[database-migrations|database migrations]]: versioned schema evolution and zero-downtime expand/contract.
* [[concurrency-and-idempotent-writes|concurrency & idempotent writes]]: optimistic vs pessimistic locking, upserts, and idempotency keys.

**Practice:** Wrap a two-step change (e.g. debit one row, credit another) in a transaction
and prove that a failure midway leaves the data untouched. Add an index and observe the
query plan change.

**Self-check:** you can explain each letter of ACID with an example and describe how a

> [!question]- Answer
> **Atomicity.** All steps commit or none do. A transfer debits and credits both, or
> neither.
> **Consistency.** The transaction moves the database from one valid state to another,
> with constraints and foreign keys holding at commit.
> **Isolation.** Concurrent transactions do not see each other's partial work. The
> isolation level sets how strictly, trading correctness against throughput from read
> committed up to serializable.
> **Durability.** Once committed it survives a crash, because the write-ahead log is
> flushed before the commit is acknowledged.
> **The multi-step change.** Wrapping the debit and credit in one transaction means a
> failure between them rolls back rather than leaving money destroyed. Without it, the
> window between the two writes is a state no business rule permits.
transaction protects a multi-step change.

**Ask yourself:**
* What would break if two of these operations ran at the same time without isolation?
* Which of my writes are safe to retry, and which would double-charge someone?

## Infrastructure as Code

Defining infrastructure declaratively and reproducibly.

**Focus:** What does [[glossary#i|IaC]] buy you over clicking in a console? What is remote state for?

**Learn:**
* [[infrastructure-as-code|infrastructure as code]]: version-controlled, reviewable infrastructure.
* [[terraform-module-and-state-design|module & state design]]: reusable modules, remote state and locking, workspaces vs directory-per-environment.
* [[iac-orchestration-and-layered-config|orchestration & layered config]]: keeping many environments DRY with a root-to-instance precedence cascade.
* [[iac-testing-and-security|testing & securing IaC]]: the validation ladder from fmt through policy-as-code to security scanning.

**Practice:** Write a small Terraform config that provisions one resource (e.g. an object
storage bucket) with **remote state**. Change it, run `plan`, and read the diff before you
`apply`. Then destroy it.

**Self-check:** you can explain what `plan` vs `apply` do, why state is stored remotely,

> [!question]- Answer
> **plan and apply.** `plan` compares your configuration against recorded state and
> against reality, then prints the diff. It changes nothing, so it is safe to run
> anywhere. `apply` executes that diff.
> **Why state is remote.** So everyone resolves against the same recorded reality, and so
> it can be locked. Two concurrent applies against local state produce a corrupted record
> and orphaned resources. State also holds secrets in plain text, so it needs encryption
> and tight access control wherever it lives.
> **Why code beats console.** It is reviewable before it runs, diffable afterwards,
> reproducible in a second environment, and drift becomes detectable. A manual change
> leaves no record of who made it or how to recreate it.
and why infrastructure defined as code is safer than manual changes.

**Ask yourself:**
* If two people applied this at once, what would remote state protect me from?
* What in my infrastructure is still changed by hand, and what risk does that carry?

## Cloud, networking & platform

The runtime substrate: managed services, networking, identity, and containers.

**Focus:** When is a managed service worth it? How does a container become a running
workload?

**Learn:**
* [[cloud-and-gcp|cloud & GCP]]: managed services and the cloud model.
* [[docker-and-compose|Docker & Compose]]: containerizing an application and its dependencies.
* [[cloud-networking|cloud networking]]: [[glossary#v|VPC]]/subnets, load balancers, [[glossary#d|DNS]], [[glossary#t|TLS]], and private connectivity.
* [[iam-and-workload-identity|cloud IAM & workload identity]]: principals, roles, least privilege, and short-lived federated credentials.
* [[kubernetes-workload-basics|Kubernetes workload basics]]: pods, deployments, services, probes, and hardened security contexts.

**Practice:** Containerize a small app with a multi-stage Dockerfile, run it locally with
Compose alongside a database, then deploy the image to a managed container runtime.

**Self-check:** you can build a lean container image, run a multi-service stack locally,

> [!question]- Answer
> **Lean image.** Multi-stage: the build stage carries the toolchain, the final stage
> copies only the artifact onto a slim or distroless base. Run as a non-root user, leave
> no package manager in the final layer, and use `.dockerignore` so the build context
> stays small.
> **Local stack.** Compose brings the app up alongside its database on one network with
> a single command, which is what makes the integration tests runnable on a laptop.
> **What the managed runtime handles.** Scheduling and placement, horizontal scaling,
> health checks and restarts, TLS termination, service discovery, and rolling deploys.
> What you give up is control of the node, some portability, and visibility into what the
> platform decided.
and describe what a managed runtime handles for you (scaling, health, networking).

**Ask yourself:**
* What am I giving up (control, cost, portability) by choosing a managed service here?
* If this container works locally but fails in the cloud, where would I look first?

## CI/CD & delivery

Getting change to production safely.

**Focus:** What should run on every commit? How does a change move from staging to prod
without a leap of faith?

**Learn:**
* [[cicd-and-github-actions|CI/CD with GitHub Actions]]: automated test/build/deploy pipelines.
* [[environments-and-promotion|environments & promotion]]: dev / test / staging / prod, build-once-promote-the-same-artifact, parity, and gates.
* [[gitops|GitOps]]: git as the single source of truth, with a reconciler that continuously converges the live system to the declared state.
* [[release-automation|release automation]]: semantic versioning and conventional commits driving automatic versions, changelogs, and releases.

**Practice:** Build a pipeline that tests and builds an artifact once, deploys it to a
staging environment automatically, and requires a manual approval before production. Make
one job least-privilege and pin its actions to commit SHAs.

**Self-check:** you can describe build-once-promote-the-same-artifact and explain what a

> [!question]- Answer
> **Build once, promote.** Build the artifact a single time, test that exact artifact,
> then move the same immutable bytes through staging to production. Rebuilding per
> environment means production runs something you never tested: dependencies may resolve
> differently, the base image may have moved, build-time configuration may differ. The
> tag you tested and the tag you shipped have to be the same digest.
> **The reviewer gate.** A human checkpoint that a compromised or misconfigured pipeline
> cannot skip on its own, plus an audit record of who approved what. It is the control
> that stops an automated path from carrying a bad change all the way to production
> unattended.
required-reviewer gate protects against.

**Ask yourself:**
* If I rebuilt the artifact for production instead of promoting it, what could differ from what I tested?
* Which secret or permission in this pipeline would I least want leaked, and is it scoped tightly?

## Observability & quality

Knowing what the system is doing and trusting that it works.

**Focus:** How do you follow one request across services? What is worth testing, and at
what level?

**Learn:**
* [[observability-with-opentelemetry|observability with OpenTelemetry]]: traces, metrics, and logs, and following one request across services with distributed tracing.
* [[testing-strategy|a layered testing strategy]]: the test pyramid, test doubles, contract tests, and where each level runs.

**Practice:** Instrument a small service so a single request produces a trace across two
hops, then add a unit test and one integration test that runs against an ephemeral container.

**Self-check:** you can explain the three telemetry signals and place a given test at the

> [!question]- Answer
> **The three signals.** Logs are discrete events, telling you what happened. Metrics are
> numbers aggregated over time, telling you whether it is healthy and what to alert on.
> Traces follow one request across services, telling you where the time went and which
> hop failed. Metrics find the problem, traces locate it, logs explain it.
> **Placing a test.** Ask what it owns. Pure logic with no external dependency is a unit
> test, and there should be many of them because they are fast. The service against a
> real database in an ephemeral container is an integration test. A user journey spanning
> services is end-to-end, and there should be few, because they are slow and flaky in
> proportion to what they cover.
right level of the pyramid.

**Ask yourself:**
* When something breaks in production, what would I look at first, and is it actually instrumented?
* Which of my tests give the most confidence per second they take to run?

## GenAI & agents

Running [[glossary#l|LLM]] agents in production.

**Focus:** How does a backend actually use a model? What are [[glossary#r|RAG]], tool-calling, and
grounding for?

**Learn:**
* [[ai-llms-and-mcps|LLMs, RAG & MCP]]: the fundamentals, how a backend calls a model, retrieval, and tool protocols.
* [[llm-agent-architecture|LLM agent architecture & orchestration]]: the model-in-a-loop, perceive-reason-act, planning, single vs multi-agent, and human-in-the-loop.
* [[tool-calling-and-mcp|tool calling & MCP]]: how a model requests actions, and the open protocol that makes tools pluggable.
* [[rag-and-grounding|RAG & grounding]]: retrieval at query time, chunking, hybrid search, and citations that keep answers checkable.
* [[agent-memory-and-context|agent memory & context management]]: the context window as a budget, compaction, and retrieval-based memory.
* [[llm-evaluation-and-observability|LLM evaluation & observability]]: measuring quality, tracing every call, and failing toward safe behaviour with guardrails.

**Practice:** Build a tiny retrieval-augmented feature: embed a handful of documents, and
on a question, retrieve the closest ones and pass them into the prompt. Notice how the
answer changes with and without retrieval. Then wrap a model call in a minimal
perceive-reason-act loop with one tool, and trace each step so you can see what it did.

**Self-check:** you can explain [[glossary#r|RAG]] end to end, describe why grounding an answer in

> [!question]- Answer
> **RAG end to end.** Chunk the corpus, embed each chunk, and store the vectors. At query
> time, embed the question, retrieve the nearest chunks, place them in the prompt as
> context, generate, and cite what was used.
> **Why grounding helps.** The model answers from text present in its context rather than
> from parametric memory, which is where confident invention comes from. It also gives
> you two controls you otherwise lack: refuse when the best retrieval similarity is below
> a threshold, and attach citations so a wrong answer is checkable rather than merely
> plausible.
> **The agent loop.** Observe the current state, let the model reason about the next
> action, call the tool, feed the result back as a new observation, and repeat until the
> task is done or a step limit is hit. Trace every iteration, because a failure is
> usually a bad tool call several steps back rather than a bad final answer.
retrieved context reduces hallucination, and sketch the agent loop that lets a model call
a tool and act on the result.

**Ask yourself:**
* Where would this agent give a confidently wrong answer, and how would I catch it?
* What would I need to log to debug a bad response after the fact?

## Capstone

Tie it together by shipping one small service that exercises the whole path:

> A containerised service behind token authentication (validated correctly), reading and
> writing a database with transactions, defined with infrastructure as code, and delivered
> through a pipeline that promotes the same artifact from staging to production behind an
> approval gate.

Optionally add a small retrieval-augmented endpoint to fold in the GenAI section.

## Self-assessment checklist

- [ ] I can validate a JWT correctly (JWKS, pinned algorithm, claim checks) and choose the right [[glossary#o|OAuth2]] grant.
- [ ] I can keep tokens and secrets off the client and prefer short-lived federated credentials.
- [ ] I can wrap a multi-step change in a transaction and reason about idempotency.
- [ ] I can provision a resource with Terraform + remote state and read a plan before applying.
- [ ] I can containerize an app and deploy it to a managed runtime.
- [ ] I can build a pipeline that promotes one artifact through environments behind a gate.
- [ ] I can explain RAG end to end and where an LLM agent needs guardrails and observability.
