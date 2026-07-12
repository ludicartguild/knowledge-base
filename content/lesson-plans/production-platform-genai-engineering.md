---
title: "Production Platform & GenAI Engineering"
tags: [moc, lesson-plan]
level: deep
type: moc
reviewed: 2026-07-12
---

A curated learning path through the concerns of building and operating a modern
cloud-native platform: from how services authenticate and authorize each other, through
data, infrastructure, delivery, and observability, up to running large-language-model
agents in production. Each section links the notes that exist today and flags where
deeper notes are planned; read in any order.

The notes are deliberately generic and vendor-neutral where it matters: they teach the
transferable pattern first, and name specific technologies only as concrete examples.

## Security

How identity, trust, and secrets work across a distributed system. Start here: almost
every other topic assumes it.

* [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]]: delegated authorization and authentication, and which grant type to use when (user sign-in, service-to-service, on-behalf-of).
* [[jwt-validation|JWT validation done right]]: how a service verifies a signed token offline, and the validation mistakes that turn "verify" into "trust the attacker".
* [[web-session-and-token-handling|web session & token handling]]: keeping tokens off the browser with a backend-for-frontend, secure cookies, and real logout.
* [[secrets-and-supply-chain-security|secrets & supply-chain security]]: replacing long-lived secrets with short-lived federated credentials, and hardening the build pipeline itself.

## Service architecture

Structuring services so they stay changeable: boundaries, interfaces, and the reliability
patterns that keep them honest.

* [[software-architecture-map|Software Architecture Map]]: the principles (SOLID, coupling & cohesion, IoC) and patterns (Strategy, Repository, Command) this builds on.

*Deeper platform-specific notes planned: hexagonal / ports-and-adapters, anti-corruption layers, idempotency and retry patterns.*

## Data & persistence

Talking to a relational store safely and correctly.

* [[databases|databases]]: relational vs NoSQL, transactions & ACID, indexing, normalization.

*Deeper notes planned: async data access, migrations, and idempotent writes at scale.*

## Infrastructure as Code

Defining infrastructure declaratively and reproducibly.

* [[infrastructure-as-code|infrastructure as code]]: what IaC is and why version-controlled, reviewable infrastructure matters.

*Deeper notes planned: module & state design, keeping environments DRY, and testing/scanning infrastructure.*

## Cloud, networking & platform

The runtime substrate: managed services, networking, identity, and containers.

* [[cloud-and-gcp|cloud & GCP]]: managed services and the cloud model.
* [[docker-and-compose|Docker & Compose]]: containerizing an application and its dependencies.

*Deeper notes planned: cloud networking, IAM & Workload Identity Federation, Kubernetes workload basics.*

## CI/CD & delivery

Getting change to production safely.

* [[cicd-and-github-actions|CI/CD with GitHub Actions]]: automated test/build/deploy pipelines.
* [[environments-and-promotion|environments & promotion]]: dev / test / staging / prod, build-once-promote-the-same-artifact, parity, and gates that tighten toward production.

*Deeper notes planned: GitOps reconciliation and convention-driven releases.*

## Observability & quality

Knowing what the system is doing and trusting that it works.

*Planned: telemetry with OpenTelemetry, and a layered testing strategy.*

## GenAI & agents

Running LLM agents in production.

* [[ai-llms-and-mcps|LLMs, RAG & MCP]]: the fundamentals, how a backend uses a model, retrieval, and tool protocols.

*Deeper notes planned: agent orchestration, tool-use loops, grounding & citations, memory management, and evaluation.*
