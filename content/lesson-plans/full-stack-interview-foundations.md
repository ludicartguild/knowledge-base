---
title: "Full-Stack Developer: Interview Foundations"
tags: [lesson-plan, full-stack]
level: fundamentals
type: moc
---


A fundamentals-first path to interview-ready fluency across the modern full-stack.
The aim is not to master every tool, it is to understand how the pieces fit and to
speak clearly and honestly about each one. **Fundamentals over everything:** breadth
to hold a confident conversation, with just enough depth to back it up.

## How to use this path

Work through the phases in order. Each phase links to the notes that cover it in
depth; the [[glossary|glossary]] is a companion for any unfamiliar term.

* For every topic, the goal is to be able to **explain it simply**: what it is, why
  it exists, and where it fits in a real application.
* You will not know everything, and that is expected. Learn **when** it is fine to say
  "I’ll figure it out", see [[communication|Communication]].
* Prefer understanding the shape of a thing over memorising syntax.

> [!tip]
> If you can draw the picture in link:{web-app-architecture}[How a Modern Web App Fits
> Together] and talk through where each topic below lives on it, you are most of the way there.

## Phase 1, Foundations & Communication

Start with the two things that make everything else easier to talk about: how to
communicate as a developer, and the mental model of a web application.

* [[communication|Communication]]: talking to interviewers and clients, asking
  good questions, and the "I’ll figure it out" rule.
* [[web-app-architecture|How a Modern Web App Fits Together]]: the anatomy and
  the request lifecycle that the rest of the path hangs on.
* Keep the [[glossary|glossary]] open throughout.

_Outcome:_ you can sketch the layers of a web app and describe what each does.

## Phase 2, The Web Stack

The core of full-stack: the frontend the user sees, and the backend and APIs behind it.

* [[frontend-and-spas|Frontend & SPAs]]: single-page apps, React fundamentals,
  Angular awareness, TypeScript basics.
* [[backends-bff-and-apis|Backends, BFF & APIs]]: Node/Express/NestJS, REST APIs,
  the Backend-for-Frontend pattern, API security (OAuth2 / JWT), and testing.

_Outcome:_ you can describe how a request travels from a button click to a database
and back, and name the technologies at each step.

## Phase 3, Data

Where application state lives.

* [[databases|Databases]]: SQL vs NoSQL, relational fundamentals, and how
  BigQuery differs from an application database.

_Outcome:_ you can explain when you would choose a relational database over a document
store, and read a simple query.

## Phase 4, Delivery

How code gets from a laptop to running software, reliably and repeatably.

* [[git-and-github|Git & GitHub]]: version control and the pull-request workflow.
* [[docker-and-compose|Docker & Docker Compose]]: containers and multi-service
  local stacks.
* [[cicd-and-github-actions|CI/CD & GitHub Actions]]: automated build, test, and deploy.

_Outcome:_ you can describe the journey from a commit to a deployed change.

## Phase 5, Cloud & Infrastructure

Where modern applications actually run, and how that environment is managed.

* [[cloud-and-gcp|Cloud Fundamentals & GCP]]: what the cloud is and the core GCP
  services (with AWS/Azure equivalents).
* [[infrastructure-as-code|Infrastructure as Code & Terraform]]: defining
  infrastructure in versioned, repeatable code.

_Outcome:_ you can name a handful of cloud services and explain why infrastructure is
written as code.

## Phase 6, AI

The layer employers increasingly expect developers to work alongside.

* [[ai-llms-and-mcps|AI, LLMs & MCPs]]: how large language models work, using them
  from an application, vector search and RAG, and the Model Context Protocol.

_Outcome:_ you can talk about integrating an AI model into an app without overclaiming.

## Phase 7, Interview Readiness

Bring it together. For each topic above, practise a two-minute explanation: what it is,
why it matters, and one concrete example. Revisit [[communication|Communication]]
for how to handle questions at the edge of your knowledge, and skim the
[[glossary|glossary]] one last time so no acronym catches you off guard.

_Outcome:_ you can hold a confident, honest conversation across the whole stack, and
know how to respond well when a question goes past what you know.

## What comes after

Fluency is the start. The natural next step is to **build** something small end to end, 
a single-page frontend talking to an API and a database, containerised, deployed to the
cloud through a CI/CD pipeline. Each note points deeper into its topic when you are ready.
