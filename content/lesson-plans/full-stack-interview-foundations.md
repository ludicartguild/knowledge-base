---
title: "Full-Stack Developer: Interview Foundations"
tags: [lesson-plan, web]
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
* Explain concisely what every layer of the stack does and why it exists: frontend, backend/[[glossary#a|API]], database, delivery, cloud, and AI.
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

> [!question]- Answer
> **The layers.** The browser renders and handles interaction. The frontend owns
> presentation and client-side state. The backend API owns business rules,
> authorization, and validation, and is the only tier that trusts nothing from the
> client. The database owns persistence and integrity. A cache and a queue sit alongside
> when read load or slow work demands them.
> **Handling a question past your knowledge.** Say what you do know, mark the boundary
> plainly, then give a route to the answer. "I have not run that in production. What I do
> know is how the pieces fit. I would start by reading X and proving it with a small
> test." Interviewers probe, so a bluff costs more than the gap it covers.
one honest way to handle a question at the edge of your knowledge.

**Ask yourself:**
* Could I explain the request lifecycle to a non-technical person in a few sentences?
* When I hit something I don't know, is my instinct to be honest or to bluff?

## The Web Stack

The core of full-stack: the frontend the user sees, and the backend and APIs behind it.

**Focus:** What is a [[glossary#s|SPA]] and what problem does it solve? What is a [[glossary#r|REST]] API, a [[glossary#b|BFF]], and
why keep auth logic on the server?

**Learn:**
* [[frontend-and-spas|Frontend & SPAs]]: single-page apps, React fundamentals, Angular awareness, TypeScript basics.
* [[backends-bff-and-apis|Backends, BFF & APIs]]: Node/Express/NestJS, REST APIs, the Backend-for-Frontend pattern, API security ([[glossary#o|OAuth2]] / [[glossary#j|JWT]]), and testing.

**Practice:** Pick a simple app you know (a to-do list, a store). List the API endpoints
it would need (method + path), and say which logic runs on the frontend vs the backend and
why. Then rehearse a short "what is a SPA and how does it talk to the backend" explanation.

**Self-check:** you can trace a request from a button click to a database and back, naming

> [!question]- Answer
> **The path.** Click fires a handler, which calls the API over HTTPS. DNS resolves, TLS
> negotiates, a load balancer picks a server. Middleware validates the token, the route
> handler validates input, business logic runs, the driver or ORM issues SQL over a
> pooled connection. Rows come back, get serialized to JSON, and the response updates
> frontend state, which triggers a re-render.
> **What a BFF adds.** One backend shaped for one client. It aggregates several
> downstream calls into a single round trip, trims fields the client will never use, and
> holds tokens server-side so the browser never touches them. The cost is another
> deployable and another place for logic to drift, so it earns its keep when clients
> diverge or when token custody matters.
the technology at each step, and explain what a BFF adds.

**Ask yourself:**
* Given a new piece of logic, how do I decide whether it belongs on the frontend or the backend?
* Could I justify adding a BFF here, or would it be over-engineering?

## Data

Where application state lives.

**Focus:** When do you choose [[glossary#s|SQL]] vs [[glossary#n|NoSQL]]? What is a join, an index, a transaction?

**Learn:**
* [[databases|Databases]]: SQL vs NoSQL, relational fundamentals, transactions & ACID, and how BigQuery differs from an application database.

**Practice:** Write (by hand) a `users` and `orders` schema with a foreign key, then a SQL
query joining them. Explain out loud when you would reach for a document store instead.

**Self-check:** you can justify a relational-vs-document choice, read a simple join, and

> [!question]- Answer
> **Choosing.** Relational when the shape is stable and you query across relationships,
> because you get joins, constraints, and transactions. Document when the shape varies
> per record, or you read a whole aggregate at once and rarely join. The honest version
> of the answer is that most application data is relational and NoSQL is chosen for a
> specific access pattern, not as a default.
> **A join.** Matching rows across tables on a key:
> `SELECT u.name, o.total FROM users u JOIN orders o ON o.user_id = u.id`.
> **Why ACID matters for money.** Without atomicity a payment debits without crediting.
> Without isolation two concurrent checkouts sell the same last item. Without durability
> an order you already confirmed disappears in a crash. Each one is a state a customer
> would notice.
say what ACID guarantees and why they matter for money or orders.

**Ask yourself:**
* For a brand-new feature, what would actually make me reach for NoSQL over SQL?
* What kind of data would make me nervous to store without ACID guarantees?

## Delivery

How code gets from a laptop to running software, reliably and repeatably.

**Focus:** What is the pull-request workflow? What does a container solve? What does a
[[glossary#c|CI/CD]] pipeline do on each commit?

**Learn:**
* [[git-and-github|Git & GitHub]]: version control and the pull-request workflow.
* [[docker-and-compose|Docker & Docker Compose]]: containers and multi-service local stacks.
* [[cicd-and-github-actions|CI/CD & GitHub Actions]]: automated build, test, and deploy.

**Practice:** Describe, step by step, what happens from `git commit` to a deployed change
through a CI/CD pipeline, and name what could fail at each step.

**Self-check:** you can walk through the commit-to-deploy journey and explain why a

> [!question]- Answer
> **The journey.** Commit and push, CI triggers, dependencies install, lint and unit
> tests run, the artifact or image is built, integration tests run against it, the image
> is pushed to a registry, staging deploys, smoke tests pass, a human approves,
> production deploys behind health checks, and a failing check rolls back.
> **What fails where.** Flaky tests, dependencies resolving to a different version than
> yesterday, a registry permission, a migration that works on an empty database but not
> a full one, and configuration that differs between environments.
> **What the container fixes.** The image carries the runtime, the libraries, and the app
> as one unit, so what passed in CI is byte-for-byte what runs in production. Most of
> "works on my machine" was environment drift the image now pins.
container makes "works on my machine" less of a problem.

**Ask yourself:**
* What in my workflow would break, and how, if the CI/CD pipeline vanished tomorrow?
* Which step of commit-to-deploy am I least able to explain without hand-waving?

## Cloud & Infrastructure

Where modern applications actually run, and how that environment is managed.

**Focus:** What is the cloud (IaaS/PaaS/SaaS)? What does Infrastructure as Code buy you?

**Learn:**
* [[cloud-and-gcp|Cloud Fundamentals & GCP]]: what the cloud is and the core [[glossary#g|GCP]] services (with [[glossary#a|AWS]]/Azure equivalents).
* [[infrastructure-as-code|Infrastructure as Code & Terraform]]: defining infrastructure in versioned, repeatable code.

**Practice:** Name three cloud services and the problem each solves. In one or two
sentences, explain why teams write infrastructure as code instead of clicking in a console.

**Self-check:** you can distinguish IaaS/PaaS/SaaS with an example each and explain the

> [!question]- Answer
> **The three.** IaaS gives you raw compute, network, and storage while you manage the OS
> and everything above it, as with EC2 or Compute Engine. PaaS takes your code and
> manages the runtime beneath it, as with Cloud Run or App Engine. SaaS is finished
> software you only use, as with Gmail. The line between them is how far up the stack
> the provider's responsibility stops.
> **Why infrastructure as code.** Environments become reproducible, so staging can be
> stood up identical to production. Changes become reviewable, since a diff appears in a
> pull request before it runs. And they become versioned, so the history says what
> changed, when, and by whom. Clicking through a console gives you none of the three and
> leaves no way to recreate what you built.
value of [[glossary#i|IaC]] (reproducible, reviewable, versioned environments).

**Ask yourself:**
* Why would a team pay for managed services instead of running the servers themselves?
* What tends to go wrong when infrastructure is changed by hand instead of as code?

## AI

The layer employers increasingly expect developers to work alongside.

**Focus:** What is an [[glossary#l|LLM]] from an app developer's view? What are [[glossary#r|RAG]] and [[glossary#m|MCP]] for?

**Learn:**
* [[ai-llms-and-mcps|AI, LLMs & MCPs]]: how large language models work, using them from an application, vector search and RAG, and the Model Context Protocol.

**Practice:** Explain, without overclaiming, how you would add an AI feature (say, "answer
questions about our docs") to an app, and where RAG and vector search fit.

**Self-check:** you can describe calling a model from an application and explain RAG in

> [!question]- Answer
> **Calling a model.** An HTTP request carrying a prompt and parameters, with the
> response returned as text or structured output, often streamed. The engineering around
> it is the real work: the key stays server-side, and you handle rate limits, retries,
> timeouts, and cost per call.
> **RAG in plain language.** A model knows what is in its prompt plus what it absorbed in
> training, and it does not know your documents. So you search your documents first, put
> the relevant passages into the prompt, and ask the model to answer from those. The
> answer is grounded in text you supplied rather than assembled from memory, and you can
> cite which passages it used.
> **Being honest about it.** Separate what you have built from what you have read about.
> Claiming production experience you lack is the fastest way to lose a room.
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

> [!question]- Answer
> This one has no fact to recall. The move is the same every time: name what you know,
> mark the boundary, offer a route.
>
> "I have not operated Kubernetes at scale. I have deployed to Cloud Run and I understand
> the scheduling and health-check model in principle. If I picked it up, I would start
> with how a Deployment maps to ReplicaSets and Pods and prove it on something small."
>
> What reads as confidence is specificity: what *you* did rather than what the team did,
> a willingness to say you do not know, and a next sentence that is a plan rather than a
> shrug. Rambling past the edge of your knowledge is what reads as bluffing, and it is
> usually obvious.
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
