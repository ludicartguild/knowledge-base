---
title: "How a Modern Web App Fits Together"
tags: [architecture, web]
level: fundamentals
type: concept
reviewed: 2026-07-12
---


A modern web app is not one program, it’s a chain of small, specialized programs that hand a request along until it turns into pixels on a screen. Full-stack work means being able to point to any link in that chain and explain what it does, why it exists, and what happens if it fails.

## The big picture

![[web-app-anatomy.drawio.svg]]

Every layer has one job. Understanding the boundary between layers is more important than memorizing any single technology.

| Layer | Responsibility | Runs where |
| --- | --- | --- |
| User / Browser | Renders UI, captures input, holds the visible application state. | Client (the user’s device) |
| Frontend SPA | Builds the screens, manages client-side state, calls the BFF for data. | Client (JavaScript downloaded and executed in the browser) |
| BFF (Backend for Frontend) | Talks to the frontend in the shapes it wants; aggregates and reshapes data from multiple backend services into one convenient response. | Server |
| APIs / services | Own business logic and rules for a specific domain (orders, users, billing, etc.). | Server |
| Databases | Persist data durably; enforce structure and integrity. | Server (often a managed service) |
| Cloud | Hosts, scales, and networks everything above; provides infrastructure like load balancers, secrets, and logging. | Cloud provider |
| External / AI services | Third-party capability the app doesn’t own, payments, email, search, or an LLM API. | Cloud (someone else’s server) |

> [!note]
> The **BFF** is easy to underrate. It exists because a mobile app, a web app, and a public API often want the same data shaped differently. Rather than making every frontend negotiate with every backend service directly, the BFF sits in between and does that translation once.

## Following a request

![[request-lifecycle.drawio.svg]]

Trace a single click end to end:

1. **Browser**, the user clicks a button. The SPA’s event handler fires.
2. **Frontend SPA**, the SPA decides it needs data and issues an HTTP request (usually `fetch` or a library wrapping it).
3. **BFF**, receives the request, checks auth, and figures out which downstream service(s) to call.
4. **APIs / services**, apply business rules, validate input, and read or write data.
5. **Databases**, the service queries or updates persisted data and returns rows/documents.
6. **External / AI services**, if the business logic needs it (e.g. charge a card, call an LLM), the service calls out to a third party and waits for a response.
7. **Response travels back up**, database to service, service to BFF, BFF reshapes the combined result, BFF to SPA.
8. **Frontend SPA**, receives JSON, updates its state, re-renders the screen.
9. **Browser**, the user sees the result.

> [!tip]
> Every arrow in that diagram is a place where things can go wrong: a slow query, a timeout calling a third party, a malformed response. When debugging, walk the request the same way, layer by layer, rather than guessing.

## Why it matters

* **Failures are layer-specific.** A blank screen could be a frontend bug, a BFF outage, a database timeout, or a third-party API being down. Knowing the layers narrows the search fast.
* **Performance budgets differ by layer.** A slow database query and a slow network hop to an external API feel identical to the user but require completely different fixes.
* **Security boundaries live between layers.** The browser is untrusted; the BFF and services are where real authorization checks happen.
* **"Full-stack" is a claim about range, not depth everywhere.** It means you can reason across the whole chain: frontend, BFF, services, data, cloud, even if you’re strongest in one or two layers.

## How to talk about this in an interview

Describe the request lifecycle out loud, layer by layer, using plain language before reaching for jargon. Interviewers are listening for whether the mental model is solid, not whether every acronym is memorized.

A strong answer:

* Names each layer and its one job in a sentence.
* Explains **why** a BFF exists rather than just naming it.
* Distinguishes what runs on the client versus the server versus the cloud.
* Can describe what breaks: and where you’d look first, if a page loads data slowly or not at all.

## Key terms

| Term | Quick definition |
| --- | --- |
| SPA | Single-Page Application, a frontend that rewrites the page in the browser instead of reloading from the server on every navigation. |
| BFF | Backend for Frontend, a server-side layer tailored to one frontend’s data shape. |
| API | A defined contract a service exposes so other programs can call it. |
| Client | Code that runs on the user’s device (the browser). |
| Server | Code that runs on a machine the app’s team controls, away from the user. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* Whiteboard the chain from browser to database and back, naming each layer's one job in a single sentence.
* Trace a single button click end to end out loud, following the request down through the layers and the response back up.
* Explain in one or two sentences why a BFF exists rather than having each frontend call the backend services directly.

**Check yourself** (you should be able to answer these from this note):

* What is the BFF's one job, and what problem does it exist to solve?
* Which layers run on the client, which on the server, and which on the cloud provider?
* If a page loads its data slowly or not at all, how do you narrow down which layer is at fault?
* What does the word "full-stack" actually claim: range across the chain, or depth in every layer?

## Watch

![](https://www.youtube.com/watch?v=viaDjz68dg0)

## Related notes

* [[frontend-and-spas|Frontend & SPAs]]: a closer look at the client layer.
* [[backends-bff-and-apis|Backends, BFF & APIs]]: a closer look at the server layer.
* [[databases|Databases]]: how the persistence layer works.
* [[cloud-and-gcp|Cloud & GCP]]: where all of this actually runs.
* [[glossary|Glossary]]: definitions for terms introduced here.
