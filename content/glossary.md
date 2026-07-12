---
title: "Glossary & Acronym Dictionary"
tags: [reference]
level: fundamentals
type: reference
reviewed: 2026-07-12
---


Definitions are deliberately plain-English, enough to follow a conversation or a job description, not a textbook treatment. Where a term has a deeper note elsewhere in this knowledge base, the entry links out to it. Entries are grouped by first letter; acronyms are spelled out on first mention.

> [!tip]
> Acronyms are expanded the first time they appear in each note across this knowledge base (for example, "SPA (Single-Page Application)"). After that, only the acronym is used.

## A

* **Agile/Scrum**\
A family of iterative project-management approaches for software teams. Instead of planning an entire project up front, work is broken into short cycles with regular check-ins and adjustments. Scrum is the most common specific framework for running Agile, see [[communication|team communication practices]].
* **Angular**\
A full-featured frontend framework (maintained by Google) for building single-page applications, opinionated about structure and built around TypeScript. See [[frontend-and-spas|frontend & SPAs]].
* **API (Application Programming Interface)**\
A defined set of rules that lets one piece of software talk to another, usually a set of URLs and data formats a client can call to read or change data on a server. See [[web-app-architecture|web app architecture]] and [[backends-bff-and-apis|backends & APIs]].
* **API key**\
A secret string a client sends with a request to identify itself to an API. It is simpler than full user login (OAuth2) and is typically used for machine-to-machine or third-party integrations rather than individual human users.
* **Auth (authentication vs. authorization)**\
Two related but distinct concepts. **Authentication** answers "who are you?" (logging in, proving identity). **Authorization** answers "what are you allowed to do?" (permissions, roles). A system can authenticate a user correctly and still deny them access if they’re not authorized.
* **AWS (Amazon Web Services)**\
Amazon’s cloud computing platform, rents out servers, storage, databases, and managed services over the internet instead of requiring a company to buy its own hardware. See [[cloud-and-gcp|cloud platforms]].
* **Azure**\
Microsoft’s cloud computing platform, functionally similar to AWS and GCP but with its own product names and tight integration with Microsoft’s enterprise tools. See [[cloud-and-gcp|cloud platforms]].

## B

* **Backend**\
The part of an application that runs on a server rather than in the user’s browser, handles business logic, talks to databases, and enforces rules the client shouldn’t be trusted to enforce itself. See [[backends-bff-and-apis|backends & APIs]].
* **Backlog**\
The running list of work a team has agreed is worth doing but hasn’t scheduled yet. Items are pulled from the backlog into a sprint when there’s capacity. See [[communication|team communication practices]].
* **BFF (Backend for Frontend)**\
A backend service built specifically to serve one particular frontend’s needs, it shapes and combines data from other services into exactly the format that frontend wants, instead of making the frontend stitch together multiple raw APIs. See [[backends-bff-and-apis|backends & APIs]].
* **BigQuery**\
Google Cloud’s serverless data warehouse for running fast SQL queries over very large datasets without managing servers. See [[cloud-and-gcp|cloud platforms]].
* **Branch**\
An independent line of development in a Git repository, letting someone work on a change without affecting the main codebase until it’s merged.
* **Build**\
The process of turning source code into something runnable, compiling, bundling, minifying, or otherwise transforming code into its deployable form.

## C

* **Cache**\
A place that stores a copy of data so future requests for that data can be served faster than recomputing or refetching it from the original source. Caches trade a small risk of staleness for a large gain in speed.
* **CDN (Content Delivery Network)**\
A network of geographically distributed servers that store copies of static content (images, scripts, stylesheets) close to users, so pages load faster no matter where in the world the request comes from.
* **CI/CD (Continuous Integration / Continuous Delivery or Deployment)**\
A practice and set of tools that automatically test, build, and (for CD) ship code every time it changes, instead of doing those steps manually before each release.
* **Cloud (IaaS/PaaS/SaaS)**\
Renting computing resources over the internet instead of owning hardware. **IaaS** (Infrastructure as a Service) rents raw servers/storage/networking; **PaaS** (Platform as a Service) rents a managed environment to run your app without managing the servers underneath; **SaaS** (Software as a Service) is a finished application you use directly (e.g., email, a CRM). See [[cloud-and-gcp|cloud platforms]].
* **Commit**\
A saved snapshot of changes in a Git repository, with a message describing what changed and why.
* **Container**\
A lightweight, self-contained package that bundles an application with everything it needs to run (code, dependencies, system tools) so it behaves the same on any machine. Docker is the most common tool for building and running containers.
* **CRUD (Create, Read, Update, Delete)**\
The four basic operations almost every application performs on data. Most APIs and database interactions map directly onto these four actions.
* **CSRF (Cross-Site Request Forgery)**\
An attack where a site the user is logged into is tricked into accepting a forged request the user did not intend, by riding on their existing session/cookie. Mitigated by the `SameSite` cookie attribute and anti-forgery tokens. See [[web-session-and-token-handling|web session & token handling]].

## D

* **Database**\
A structured system for storing, retrieving, and managing data. See [[databases|databases]].
* **Dependency**\
A piece of external code (a library or package) that a project relies on to work. Dependencies are typically installed and tracked via a package manager.
* **Deploy**\
The act of making a built version of an application available and running in a target environment (staging, production, etc.).
* **DNS (Domain Name System)**\
The internet’s system for translating human-readable domain names (like `example.com`) into the numeric IP addresses computers use to find each other.
* **Docker**\
A tool for building, distributing, and running containers, the de facto standard for containerizing applications.

* **DTO (Data Transfer Object)**\
A simple object used to carry data across a boundary (such as an API request or response), decoupling the external wire shape from internal domain models.

## E

* **Embedding**\
A numeric representation (a vector of numbers) of a piece of text, image, or other data that captures its meaning, allowing a computer to compare how similar two pieces of content are mathematically. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **Endpoint**\
A specific URL (and HTTP method) that an API exposes for a particular operation, for example, `GET /users/42` is one endpoint. See [[backends-bff-and-apis|backends & APIs]].
* **Environment / env var**\
An **environment** is a particular deployed context an app runs in (local, staging, production). An **environment variable** (env var) is a configuration value set outside the code itself, like a database URL or API key, so the same code can behave differently depending on where it runs.
* **Environments (dev / test / staging / prod) & non-prod**\
The separate, isolated copies a system runs in: **dev** (build/integrate), **test/QA** (testing), **staging/pre-prod** (production-like final verification), and **production** (live users). Everything that is not production is **non-prod**. Isolated so change can be exercised safely before reaching real users and data. See [[environments-and-promotion|environments & promotion]]. (See also "Staging vs. production".)

## F

* **Fine-tuning**\
Further training an existing pretrained model on a smaller, specific dataset so it performs better on a narrower task, rather than training a model from scratch. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **Framework vs. library**\
A **library** is code you call when you need it, you’re in control of the flow. A **framework** calls your code according to its own structure and lifecycle, it’s in control of the flow, and you fill in the pieces it expects (this is often summarized as "inversion of control").
* **Frontend**\
The part of an application that runs in the user’s browser (or device), what the user sees and interacts with directly. See [[frontend-and-spas|frontend & SPAs]].

## G

* **GCP (Google Cloud Platform)**\
Google’s cloud computing platform, offering compute, storage, databases, and managed services such as BigQuery and Vertex AI. See [[cloud-and-gcp|cloud platforms]].
* **Gemini**\
Google’s family of large language models, used both in consumer products and via API/Vertex AI for building AI-powered applications. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].

* **Git**\
A distributed version-control system that tracks changes to files over time, letting many people work on the same codebase and merge their work. See [[git-and-github|Git & GitHub]].
* **GitOps**\
An operational model where the desired state of infrastructure and deployments is declared in Git, and automation continuously reconciles the running system to match. See [[environments-and-promotion|environments & promotion]].

## H

* **HTTP/HTTPS (HyperText Transfer Protocol / Secure)**\
The protocol web browsers and servers use to exchange requests and responses. HTTPS is HTTP encrypted with TLS, so data in transit can’t be easily read or tampered with by anyone intercepting it.

## I

* **IaC (Infrastructure as Code)**\
Defining infrastructure (servers, networks, databases) in version-controlled configuration files instead of clicking through a cloud console by hand, so environments are reproducible and reviewable like code. Terraform is a common tool for this.
* **IAM (Identity and Access Management)**\
The cloud/service system for defining who (users, service accounts) may perform which actions on which resources, via roles and policies. Least-privilege IAM is a core security practice. See [[secrets-and-supply-chain-security|secrets & supply-chain security]].
* **Idempotency**\
A property where performing an operation multiple times has the same effect as performing it once (e.g. a well-designed write API that a client can safely retry). Important for reliability under retries.
* **IdP (Identity Provider)**\
The service that authenticates users and issues tokens (the OAuth2/OIDC authorization server). Applications delegate "who is this user" to the IdP instead of storing passwords themselves. See [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]].
* **Image**\
A packaged, read-only template used to create containers, it bundles an application’s code, dependencies, and runtime environment into a single distributable unit (a "Docker image").
* **Index**\
A data structure a database maintains alongside a table to make lookups on specific columns much faster, at the cost of extra storage and slightly slower writes. See [[databases|databases]].
* **Integration test**\
A test that checks whether multiple parts of a system work correctly together (e.g., an API endpoint talking to a real database), as opposed to testing one piece in isolation.

## J

* **JavaScript**\
The programming language that runs natively in web browsers, also usable on the server via Node.js. It’s the foundation of almost all interactive web frontends.
* **JSON (JavaScript Object Notation)**\
A lightweight, human-readable text format for representing structured data (objects, arrays, key-value pairs). It’s the default format most APIs use to send and receive data.
* **JWK / JWKS (JSON Web Key / JWK Set)**\
A JWK is a public key in JSON form; a JWKS is the set of them an issuer publishes so anyone can verify its signed tokens. Each key has a `kid` (key ID) used to pick the right one, which also enables seamless key rotation. See [[jwt-validation|JWT validation]].
* **JWS (JSON Web Signature)**\
The signed form of a token: the `header.payload.signature` structure whose signature proves the payload was issued by the holder of the signing key and not altered. See [[jwt-validation|JWT validation]].
* **JWT (JSON Web Token)**\
A compact, signed token format commonly used to represent an authenticated user’s identity and claims, passed between client and server so the server can verify the request without a separate database lookup on every call.

## K

* **Kubernetes (K8s)**\
A system for automatically deploying, scaling, and managing groups of containers across a cluster of machines, handling things like restarting failed containers and load-balancing traffic between them.

## L

* **Load balancer**\
A component that sits in front of multiple servers and distributes incoming requests across them, so no single server gets overwhelmed and traffic keeps flowing if one server fails.
* **LLM (Large Language Model)**\
A machine learning model trained on huge amounts of text to predict and generate language, powering chat assistants, summarization, code generation, and more. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].

## M

* **MCP (Model Context Protocol)**\
An open standard that lets AI assistants connect to external tools and data sources (files, APIs, databases) through a common protocol, instead of every integration being custom-built. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **Merge**\
Combining changes from one Git branch into another, bringing that branch’s history together with the target branch’s.
* **Merge conflict**\
A situation where Git can’t automatically combine two branches because both changed the same lines of the same file, requiring a person to manually decide which changes to keep.
* **Microservice**\
An architectural style where an application is built as a collection of small, independently deployable services, each responsible for one capability, that communicate over the network.
* **Middleware**\
Code that runs in between receiving a request and producing a response, commonly used for cross-cutting concerns like logging, authentication checks, or error handling that should apply to many endpoints at once.
* **Mock**\
A fake stand-in for a real dependency (a database, an API, a service) used in tests so the test can run in isolation, quickly and predictably, without needing the real thing.
* **Monolith**\
An application built and deployed as a single unit, where all functionality lives in one codebase and one deployable, as opposed to being split into microservices.
* **mTLS (mutual TLS)**\
TLS where both sides present certificates, so the client and server each cryptographically verify the other's identity, not just the client verifying the server as in ordinary HTTPS. Common for service-to-service trust.

## N

* **Node.js**\
A runtime that lets JavaScript run outside the browser, most commonly used to build backend servers and command-line tools in JavaScript or TypeScript.
* **NoSQL**\
A broad category of databases that don’t use the traditional relational (table-and-row) model, includes document stores, key-value stores, and graph databases, often chosen for flexible schemas or particular scaling needs. See [[databases|databases]].
* **npm (Node Package Manager)**\
The default package manager for Node.js, used to install, publish, and manage JavaScript library dependencies.

## O

* **OAuth2**\
An industry-standard protocol that lets a user grant one application limited access to their data on another service, without sharing their password with the first application (e.g., "Sign in with Google").
* **OIDC (OpenID Connect)**\
A thin authentication layer on top of OAuth2. Where OAuth2 grants access, OIDC adds an ID token (a signed JWT of identity claims) so the client learns *who* the user is. See [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]].
* **OpenTelemetry (OTel)**\
An open standard and set of libraries for generating and exporting telemetry, traces, metrics, and logs, in a vendor-neutral way, so observability data is not tied to one backend.
* **ORM (Object-Relational Mapper)**\
A library that lets developers interact with a database using the programming language’s native objects and methods instead of writing raw SQL by hand. See [[databases|databases]].

## P

* **Package manager**\
A tool that installs, updates, and tracks a project’s external dependencies (e.g., npm for JavaScript, pip for Python), usually recording exact versions so builds are reproducible.
* **PKCE (Proof Key for Code Exchange)**\
An extension to the OAuth2 authorization-code flow that binds the code to the client that started the flow (via a `code_verifier`/`code_challenge` pair), so an intercepted code cannot be redeemed by an attacker. Now recommended for all clients. See [[oauth2-and-oidc-flows|OAuth2 & OIDC flows]].
* **PR (Pull Request)**\
A request to merge one branch’s changes into another, opened so teammates can review the diff, discuss it, and approve it before it becomes part of the shared codebase.
* **Promotion**\
Moving the same immutable build/release up the environment ladder (dev to test to staging to production), injecting per-environment config at each step, rather than rebuilding for each environment. Higher environments are guarded by stricter gates. See [[environments-and-promotion|environments & promotion]].
* **Pub/Sub (Publish/Subscribe)**\
A messaging pattern where senders ("publishers") emit messages to a channel without knowing who’s listening, and receivers ("subscribers") get every message on channels they’ve subscribed to, commonly used to decouple services. See [[cloud-and-gcp|cloud platforms]].

## Q

* **Query**\
A request for data made to a database (most commonly written in SQL) or, more generally, a structured question sent to any data source.
* **Queue**\
A data structure or messaging system that holds items to be processed in order, letting producers add work without waiting for it to be handled immediately and letting consumers process it at their own pace.

## R

* **RAG (Retrieval-Augmented Generation)**\
A technique where an LLM’s response is grounded by first retrieving relevant documents or data (often via vector search) and feeding them into the model’s context, so it answers using specific, up-to-date information rather than relying only on what it memorized during training. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **RBAC (Role-Based Access Control)**\
Granting permissions by assigning users to roles (e.g. viewer, editor, admin) and attaching permissions to roles, rather than to individuals one by one. A common model for the authorization half of [[oauth2-and-oidc-flows|auth]].
* **React**\
A popular JavaScript library for building user interfaces out of reusable components, widely used for single-page applications. See [[frontend-and-spas|frontend & SPAs]].
* **Repo (repository)**\
A directory tracked by a version control system (like Git), containing a project’s code and its full history of changes.
* **REST (Representational State Transfer)**\
An architectural style for designing APIs around resources (like `/users` or `/orders`) and standard HTTP methods (GET, POST, PUT, DELETE) to act on them. Most "REST APIs" in practice loosely follow these conventions rather than implementing the full formal style. See [[web-app-architecture|web app architecture]].
* **RP (Relying Party)**\
In OIDC, the application that relies on the identity provider to authenticate users (it "relies" on the IdP). "RP-initiated logout" is the app asking the IdP to end the session. See [[web-session-and-token-handling|web session & token handling]].
* **Runtime**\
The environment in which code actually executes (as opposed to when it’s written or compiled), also used to mean the software that provides that environment, like Node.js for JavaScript.

## S

* **SARIF (Static Analysis Results Interchange Format)**\
A standard JSON format for reporting static-analysis and security-scan findings, so results from different tools surface uniformly in code review. See [[secrets-and-supply-chain-security|secrets & supply-chain security]].
* **Schema**\
The defined structure of data, what fields/columns exist, their types, and how they relate to each other, whether in a database table or a JSON payload. See [[databases|databases]].
* **SDK (Software Development Kit)**\
A packaged set of tools, libraries, and documentation provided by a platform or service to make it easier to build against it, often wrapping raw API calls in convenient, language-specific code.
* **Serverless**\
A cloud model where code runs on demand without the developer provisioning or managing any servers, the platform handles scaling automatically, and billing is typically based on actual usage rather than reserved capacity. See [[cloud-and-gcp|cloud platforms]].
* **SLSA (Supply-chain Levels for Software Artifacts)**\
An industry framework of incrementally adoptable guidelines for build/supply-chain integrity, guarding against source, build-platform, and dependency tampering, and introducing build provenance. See [[secrets-and-supply-chain-security|secrets & supply-chain security]].
* **SPA (Single-Page Application)**\
A web application that loads a single HTML page once and then updates content dynamically with JavaScript, instead of requesting a whole new page from the server for every navigation. See [[frontend-and-spas|frontend & SPAs]].
* **Sprint**\
A fixed, short time period (commonly one to two weeks) in Scrum during which a team commits to completing a defined set of work from the backlog. See [[communication|team communication practices]].
* **SQL (Structured Query Language)**\
The standard language for querying and manipulating data in relational databases. See [[databases|databases]].
* **Staging vs. production**\
**Staging** is an environment that mirrors production as closely as possible, used to test changes before they go live. **Production** is the live environment real users interact with.
* **Standup**\
A short, regular team meeting (often daily) where each person briefly shares what they did, what they’re doing next, and any blockers. See [[communication|team communication practices]].
* **STS (Security Token Service)**\
A service that issues short-lived security tokens/credentials, typically in exchange for proof of identity, as when a CI job trades an OIDC token for a temporary cloud credential. See [[secrets-and-supply-chain-security|secrets & supply-chain security]].

## T

* **Terraform**\
A widely used Infrastructure as Code tool that lets teams define cloud resources in configuration files and apply them consistently across environments and providers.
* **TLS/SSL (Transport Layer Security / Secure Sockets Layer)**\
Cryptographic protocols that encrypt data sent over a network connection. SSL is the older, deprecated predecessor to TLS, but the term "SSL" is still used colloquially to mean TLS.
* **TTL (Time To Live)**\
How long a piece of data (a cache entry, DNS record, or token) remains valid before it expires and must be refreshed.
* **TypeScript**\
A superset of JavaScript that adds static types, which are checked before the code runs, catching many bugs earlier and improving editor tooling.

## U

* **Unit test**\
A test that checks a single, small piece of code (typically one function or method) in isolation from the rest of the system, usually with any dependencies mocked out.

## V

* **Vector search**\
Searching for items by comparing their embeddings (numeric vectors) rather than matching exact keywords, so results can be found based on meaning or similarity even when the wording is different. See [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **Vertex AI**\
Google Cloud’s managed platform for building, training, and deploying machine learning models, including access to Gemini and other foundation models. See [[cloud-and-gcp|cloud platforms]] and [[ai-llms-and-mcps|AI, LLMs & MCPs]].
* **VPC (Virtual Private Cloud)**\
An isolated, private network within a cloud provider where resources can communicate with each other while being shielded from the public internet by default.

## W

* **Webhook**\
A way for one system to notify another automatically when something happens, by sending an HTTP request to a URL the receiving system has registered in advance, the reverse of polling for updates.
* **WIF (Workload Identity Federation)**\
Letting a workload (e.g. a CI job) authenticate to a cloud using a short-lived, federated OIDC token instead of a stored long-lived key. The cloud trusts the token's issuer and claims and returns a temporary credential. See [[secrets-and-supply-chain-security|secrets & supply-chain security]].

## X

* **XSS (Cross-Site Scripting)**\
An attack where malicious script is injected into a page and runs with the same privileges as the site's own code, letting it read anything the page can (including tokens in browser storage). A key reason to keep tokens out of the browser. See [[web-session-and-token-handling|web session & token handling]].

## Related notes

* [[web-app-architecture|Web app architecture]]
* [[frontend-and-spas|Frontend & SPAs]]
* [[backends-bff-and-apis|Backends, BFFs & APIs]]
* [[databases|Databases]]
* [[cloud-and-gcp|Cloud platforms & GCP]]
* [[ai-llms-and-mcps|AI, LLMs & MCPs]]
* [[communication|Team communication practices]]
