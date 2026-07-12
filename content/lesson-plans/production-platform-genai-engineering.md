---
title: "Production Platform & GenAI Engineering"
tags: [moc, lesson-plan]
level: deep
type: moc
---

A curated learning path through the concerns of building and operating a modern
cloud-native platform, from how services authenticate and authorize each other, through
data, infrastructure, delivery, and observability, up to running large-language-model
agents in production. It is organized as a map: each entry links to a deep reference note
you can read on its own, and the ordering is a suggested path rather than a strict
sequence.

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
patterns that keep them honest. *(Notes in progress.)*

## Data & persistence

Talking to a relational store safely and correctly: async access, migrations,
transactions, and idempotent writes. *(Notes in progress.)*

## Infrastructure as Code

Defining infrastructure declaratively: module and state design, keeping environments DRY,
and testing/scanning infrastructure like code. *(Notes in progress.)*

## Cloud, networking & platform

The runtime substrate: managed services, networking, identity and access management, and
container orchestration basics. *(Notes in progress.)*

## CI/CD & delivery

Getting change to production safely: GitOps and environment promotion, and automated,
convention-driven releases.

* [[environments-and-promotion|environments & promotion]]: dev / test / staging / prod and the non-prod tiers, build-once-promote-the-same-artifact, parity, and gates that tighten toward production.

More delivery notes in progress.

## Observability & quality

Knowing what the system is doing and trusting that it works: telemetry with OpenTelemetry,
and a layered testing strategy. *(Notes in progress.)*

## GenAI & agents

Running LLM agents in production: orchestration, tool use, retrieval and grounding, memory,
evaluation, and observability. *(Notes in progress.)*
