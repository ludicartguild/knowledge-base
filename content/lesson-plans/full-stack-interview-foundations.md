---
title: "Full-Stack Developer: Interview Foundations"
tags: [moc, lesson-plan]
level: fundamentals
type: moc
reviewed: 2026-07-12
---


A fundamentals-first path to interview-ready fluency across the modern full-stack.
The aim is not to master every tool, it is to understand how the pieces fit and to
speak clearly and honestly about each one. **Fundamentals over everything:** breadth
to hold a confident conversation, with just enough depth to back it up.

## Objectives

By the end of this path you can:

* Sketch the anatomy and request lifecycle of a modern web application and place any topic on it.
* Explain concisely what every layer of the stack does and why it exists: frontend, backend/API, database, delivery, cloud, and AI.
* Name the common technology at each layer and one reason you would reach for it.
* Answer entry-level questions on each topic, and respond well when a question goes past what you know.

## Prerequisites

Basic programming familiarity (variables, functions, a little JavaScript or Python) and
having used a web app as a user. No prior full-stack experience assumed.

## How to use this path

Work through the sections in order; they build on each other. Each section follows the
same rhythm:

* **Focus:** the questions you should be able to answer by the end of the section.
* **Learn:** the notes to read (the [[glossary|glossary]] is a companion for any unfamiliar term).
* **Practice:** an active exercise, do not just read.
* **Self-check:** you are ready to move on when you can do these.
* **Ask yourself:** heuristic questions to test whether you really understand it, not just recognise it.

The overarching goal for every topic is to **explain it simply**: what it is, why it
exists, and where it fits. You will not know everything, and that is expected: learn
**when** it is fine to say "I'll figure it out", see [[communication|Communication]].
Prefer understanding the shape of a thing over memorising syntax.

> [!tip]
> If you can draw the picture in [[web-app-architecture|How a Modern Web App Fits Together]]
> and talk through where each topic below lives on it, you are most of the way there.

## Foundations & Communication

Start with the two things that make everything else easier to talk about: how to
communicate as a developer, and the mental model of a web application.

**Focus:** What are the layers of a web app? What happens between a click and a response?
How do you handle a question you cannot fully answer?

**Learn:**
* [[communication|Communication]]: talking to interviewers and clients, asking good questions, and the "I'll figure it out" rule.
* [[web-app-architecture|How a Modern Web App Fits Together]]: the anatomy and the request lifecycle the rest of the path hangs on.

**Practice:** From memory, draw the web-app diagram (browser, frontend, backend/API,
database) and narrate a request end to end out loud. Redraw it until you need no reference.

**Self-check:** you can sketch the layers of a web app, describe what each does, and state
one honest way to handle a question at the edge of your knowledge.

**Ask yourself:**
* Could I explain the request lifecycle to a non-technical person in a few sentences?
* When I hit something I don't know, is my instinct to be honest or to bluff?

## The Web Stack

The core of full-stack: the frontend the user sees, and the backend and APIs behind it.

**Focus:** What is a SPA and what problem does it solve? What is a REST API, a BFF, and
why keep auth logic on the server?

**Learn:**
* [[frontend-and-spas|Frontend & SPAs]]: single-page apps, React fundamentals, Angular awareness, TypeScript basics.
* [[backends-bff-and-apis|Backends, BFF & APIs]]: Node/Express/NestJS, REST APIs, the Backend-for-Frontend pattern, API security (OAuth2 / JWT), and testing.

**Practice:** Pick a simple app you know (a to-do list, a store). List the API endpoints
it would need (method + path), and say which logic runs on the frontend vs the backend and
why. Then rehearse a short "what is a SPA and how does it talk to the backend" explanation.

**Self-check:** you can trace a request from a button click to a database and back, naming
the technology at each step, and explain what a BFF adds.

**Ask yourself:**
* Given a new piece of logic, how do I decide whether it belongs on the frontend or the backend?
* Could I justify adding a BFF here, or would it be over-engineering?

## Data

Where application state lives.

**Focus:** When do you choose SQL vs NoSQL? What is a join, an index, a transaction?

**Learn:**
* [[databases|Databases]]: SQL vs NoSQL, relational fundamentals, transactions & ACID, and how BigQuery differs from an application database.

**Practice:** Write (by hand) a `users` and `orders` schema with a foreign key, then a SQL
query joining them. Explain out loud when you would reach for a document store instead.

**Self-check:** you can justify a relational-vs-document choice, read a simple join, and
say what ACID guarantees and why they matter for money or orders.

**Ask yourself:**
* For a brand-new feature, what would actually make me reach for NoSQL over SQL?
* What kind of data would make me nervous to store without ACID guarantees?

## Delivery

How code gets from a laptop to running software, reliably and repeatably.

**Focus:** What is the pull-request workflow? What does a container solve? What does a
CI/CD pipeline do on each commit?

**Learn:**
* [[git-and-github|Git & GitHub]]: version control and the pull-request workflow.
* [[docker-and-compose|Docker & Docker Compose]]: containers and multi-service local stacks.
* [[cicd-and-github-actions|CI/CD & GitHub Actions]]: automated build, test, and deploy.

**Practice:** Describe, step by step, what happens from `git commit` to a deployed change
through a CI/CD pipeline, and name what could fail at each step.

**Self-check:** you can walk through the commit-to-deploy journey and explain why a
container makes "works on my machine" less of a problem.

**Ask yourself:**
* What in my workflow would break, and how, if the CI/CD pipeline vanished tomorrow?
* Which step of commit-to-deploy am I least able to explain without hand-waving?

## Cloud & Infrastructure

Where modern applications actually run, and how that environment is managed.

**Focus:** What is the cloud (IaaS/PaaS/SaaS)? What does Infrastructure as Code buy you?

**Learn:**
* [[cloud-and-gcp|Cloud Fundamentals & GCP]]: what the cloud is and the core GCP services (with AWS/Azure equivalents).
* [[infrastructure-as-code|Infrastructure as Code & Terraform]]: defining infrastructure in versioned, repeatable code.

**Practice:** Name three cloud services and the problem each solves. In one or two
sentences, explain why teams write infrastructure as code instead of clicking in a console.

**Self-check:** you can distinguish IaaS/PaaS/SaaS with an example each and explain the
value of IaC (reproducible, reviewable, versioned environments).

**Ask yourself:**
* Why would a team pay for managed services instead of running the servers themselves?
* What tends to go wrong when infrastructure is changed by hand instead of as code?

## AI

The layer employers increasingly expect developers to work alongside.

**Focus:** What is an LLM from an app developer's view? What are RAG and MCP for?

**Learn:**
* [[ai-llms-and-mcps|AI, LLMs & MCPs]]: how large language models work, using them from an application, vector search and RAG, and the Model Context Protocol.

**Practice:** Explain, without overclaiming, how you would add an AI feature (say, "answer
questions about our docs") to an app, and where RAG and vector search fit.

**Self-check:** you can describe calling a model from an application and explain RAG in
plain language, while being honest about the limits of your experience.

**Ask yourself:**
* Where would an LLM be the wrong tool for the job?
* How would I explain the limits (and risks) of an AI feature to a non-technical stakeholder?

## Interview Readiness

Bring it together. For each topic above, deliver a clean, short explanation: what it is,
why it matters, and one concrete example. Revisit [[communication|Communication]] for
handling questions at the edge of your knowledge, and skim the [[glossary|glossary]] so no
acronym catches you off guard.

**Practice:** Do a mock interview (with a friend or out loud to yourself). Sample prompts:
"Walk me through what happens when I load this web page." "SQL or NoSQL for a chat app, and
why?" "What is a JWT and how does a server trust it?" "How would you deploy this change
safely?" Record yourself once and listen back for filler and hedging.

**Self-check:** you can hold a confident, honest conversation across the whole stack and
respond well when a question goes past what you know.

**Ask yourself:**
* Which topic am I least confident explaining out loud, and what would fix that?
* When a question goes past what I know, what is my honest, useful next sentence?

## Capstone

Fluency is the start; building cements it. Ship one small thing end to end:

> A single-page frontend talking to your own API, backed by a database, containerised with
> Docker, and deployed to the cloud through a CI/CD pipeline.

Keep it tiny (a to-do list is plenty). The point is to touch every layer once, so that in
an interview you are describing something you have actually done.

## Self-assessment checklist

- [ ] I can draw the web-app diagram from memory and narrate a request lifecycle.
- [ ] I can explain frontend vs backend vs API vs BFF and where auth belongs.
- [ ] I can justify a SQL-vs-NoSQL choice and read a simple join; I know what ACID means.
- [ ] I can walk through commit → CI/CD → deploy and say what a container solves.
- [ ] I can distinguish IaaS/PaaS/SaaS and explain the value of Infrastructure as Code.
- [ ] I can describe using an LLM from an app, plus RAG and MCP, without overclaiming.
- [ ] I can give a short, clear explanation of any topic above, and handle "I don't know" gracefully.
