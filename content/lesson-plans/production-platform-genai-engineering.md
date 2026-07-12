---
title: "Production Platform & GenAI Engineering"
tags: [moc, lesson-plan]
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
* Explain how an LLM agent is orchestrated, grounded, and evaluated in production.

## Prerequisites

Comfort with the [[full-stack-interview-foundations|full-stack fundamentals]] (how a web
app, API, and database fit together), a terminal, and access to a cloud account and a
container runtime for the hands-on work.

## How to use this path

Work through the sections in order where you can; security and delivery underpin the rest.
Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer.
* **Learn:** the notes to read.
* **Practice:** build or implement something, this path rewards doing.
* **Self-check:** you understand it when you can do these.
* **Ask yourself:** heuristic questions to test real understanding.

Some sections link a fundamentals note today with deeper notes still planned; the practice
is scoped to what exists.

## Security

How identity, trust, and secrets work across a distributed system. Start here: almost
every other topic assumes it.

**Focus:** Which OAuth2 grant fits which caller? How does a service verify a token offline
without trusting the attacker? Where do tokens and secrets actually live?

**Learn:**
* [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]]: grant types, PKCE, on-behalf-of, and OIDC.
* [[jwt-validation|JWT validation done right]]: signatures, JWKS, claim checks, algorithm pinning.
* [[web-session-and-token-handling|web session & token handling]]: keeping tokens off the browser, secure cookies, real logout.
* [[secrets-and-supply-chain-security|secrets & supply-chain security]]: short-lived federated credentials and pipeline hardening.

**Practice:** Implement a JWT validation function that fetches a JWKS, resolves the key by
`kid`, **pins the expected algorithm**, rejects `alg: none`, and checks `iss`/`aud`/`exp`.
Feed it a tampered token and a wrong-audience token and confirm both are rejected.

**Self-check:** you can validate a JWT correctly by hand, name the grant for user sign-in
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

**Practice:** Take a small service and push one external dependency (a database or HTTP
client) behind an interface, so the core logic can be tested with a fake. Then make one
write operation idempotent (safe to call twice).

**Self-check:** you can explain ports-and-adapters in your own words and point to the seam
in your code where the real adapter is swapped for a test double.

**Ask yourself:**
* Which part of this service would hurt most to change, and is that because of a missing boundary?
* If a client retried this request after a timeout, would anything go wrong?

*Deeper notes planned: hexagonal / ports-and-adapters, anti-corruption layers, retry and backoff patterns.*

## Data & persistence

Talking to a relational store safely and correctly.

**Focus:** What does a transaction guarantee? How do you evolve a schema without downtime?

**Learn:**
* [[databases|databases]]: relational vs NoSQL, transactions & ACID, indexing, normalization.

**Practice:** Wrap a two-step change (e.g. debit one row, credit another) in a transaction
and prove that a failure midway leaves the data untouched. Add an index and observe the
query plan change.

**Self-check:** you can explain each letter of ACID with an example and describe how a
transaction protects a multi-step change.

**Ask yourself:**
* What would break if two of these operations ran at the same time without isolation?
* Which of my writes are safe to retry, and which would double-charge someone?

*Deeper notes planned: async data access, migrations, and idempotent writes at scale.*

## Infrastructure as Code

Defining infrastructure declaratively and reproducibly.

**Focus:** What does IaC buy you over clicking in a console? What is remote state for?

**Learn:**
* [[infrastructure-as-code|infrastructure as code]]: version-controlled, reviewable infrastructure.

**Practice:** Write a small Terraform config that provisions one resource (e.g. an object
storage bucket) with **remote state**. Change it, run `plan`, and read the diff before you
`apply`. Then destroy it.

**Self-check:** you can explain what `plan` vs `apply` do, why state is stored remotely,
and why infrastructure defined as code is safer than manual changes.

**Ask yourself:**
* If two people applied this at once, what would remote state protect me from?
* What in my infrastructure is still changed by hand, and what risk does that carry?

*Deeper notes planned: module & state design, keeping environments DRY, and testing/scanning infrastructure.*

## Cloud, networking & platform

The runtime substrate: managed services, networking, identity, and containers.

**Focus:** When is a managed service worth it? How does a container become a running
workload?

**Learn:**
* [[cloud-and-gcp|cloud & GCP]]: managed services and the cloud model.
* [[docker-and-compose|Docker & Compose]]: containerizing an application and its dependencies.

**Practice:** Containerize a small app with a multi-stage Dockerfile, run it locally with
Compose alongside a database, then deploy the image to a managed container runtime.

**Self-check:** you can build a lean container image, run a multi-service stack locally,
and describe what a managed runtime handles for you (scaling, health, networking).

**Ask yourself:**
* What am I giving up (control, cost, portability) by choosing a managed service here?
* If this container works locally but fails in the cloud, where would I look first?

*Deeper notes planned: cloud networking, IAM & Workload Identity Federation, Kubernetes workload basics.*

## CI/CD & delivery

Getting change to production safely.

**Focus:** What should run on every commit? How does a change move from staging to prod
without a leap of faith?

**Learn:**
* [[cicd-and-github-actions|CI/CD with GitHub Actions]]: automated test/build/deploy pipelines.
* [[environments-and-promotion|environments & promotion]]: dev / test / staging / prod, build-once-promote-the-same-artifact, parity, and gates.

**Practice:** Build a pipeline that tests and builds an artifact once, deploys it to a
staging environment automatically, and requires a manual approval before production. Make
one job least-privilege and pin its actions to commit SHAs.

**Self-check:** you can describe build-once-promote-the-same-artifact and explain what a
required-reviewer gate protects against.

**Ask yourself:**
* If I rebuilt the artifact for production instead of promoting it, what could differ from what I tested?
* Which secret or permission in this pipeline would I least want leaked, and is it scoped tightly?

*Deeper notes planned: GitOps reconciliation and convention-driven releases.*

## Observability & quality

Knowing what the system is doing and trusting that it works.

**Focus:** How do you follow one request across services? What is worth testing, and at
what level?

*Planned: telemetry with OpenTelemetry (traces, metrics, logs) and a layered testing
strategy. Until then, the [[full-stack-interview-foundations|full-stack path]] covers
testing fundamentals.*

## GenAI & agents

Running LLM agents in production.

**Focus:** How does a backend actually use a model? What are RAG, tool-calling, and
grounding for?

**Learn:**
* [[ai-llms-and-mcps|LLMs, RAG & MCP]]: the fundamentals, how a backend calls a model, retrieval, and tool protocols.

**Practice:** Build a tiny retrieval-augmented feature: embed a handful of documents, and
on a question, retrieve the closest ones and pass them into the prompt. Notice how the
answer changes with and without retrieval.

**Self-check:** you can explain RAG end to end and describe why grounding an answer in
retrieved context reduces hallucination.

**Ask yourself:**
* Where would this agent give a confidently wrong answer, and how would I catch it?
* What would I need to log to debug a bad response after the fact?

*Deeper notes planned: agent orchestration, tool-use loops, grounding & citations, memory management, and evaluation.*

## Capstone

Tie it together by shipping one small service that exercises the whole path:

> A containerised service behind token authentication (validated correctly), reading and
> writing a database with transactions, defined with infrastructure as code, and delivered
> through a pipeline that promotes the same artifact from staging to production behind an
> approval gate.

Optionally add a small retrieval-augmented endpoint to fold in the GenAI section.

## Self-assessment checklist

- [ ] I can validate a JWT correctly (JWKS, pinned algorithm, claim checks) and choose the right OAuth2 grant.
- [ ] I can keep tokens and secrets off the client and prefer short-lived federated credentials.
- [ ] I can wrap a multi-step change in a transaction and reason about idempotency.
- [ ] I can provision a resource with Terraform + remote state and read a plan before applying.
- [ ] I can containerize an app and deploy it to a managed runtime.
- [ ] I can build a pipeline that promotes one artifact through environments behind a gate.
- [ ] I can explain RAG end to end and where an LLM agent needs guardrails and observability.
