---
title: "Backends, BFF & APIs"
tags: [backend, apis, testing]
level: fundamentals
type: concept
---


The backend is the part of an app that runs on a server the team controls, away from the user’s device. It owns business logic, talks to databases, and exposes that logic to the outside world through an API, a defined contract other programs can call. A junior full-stack developer doesn’t need to have built a large-scale backend, but should be able to explain what a Node.js server does, describe a REST endpoint, and reason about who’s allowed to call it and why.

## Backends & runtimes (Node, Express, NestJS)

**Node.js** is a runtime that lets JavaScript run outside the browser. It’s what makes it possible to write a server in the same language used on the frontend, instead of switching to a different language for each side of the stack.

Two common ways to build a Node backend:

* **Express**: a minimal, unopinionated web framework. It gives you routing and middleware and gets out of the way; the project’s structure is up to you.
* **NestJS**: a structured, opinionated framework built on TypeScript. It borrows ideas from Angular (modules, dependency injection, decorators) to enforce a consistent architecture, which tends to pay off as a codebase and team grow.

```typescript
// Minimal Express server
import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

> [!tip]
> Express and NestJS both end up serving HTTP requests over Node.js, the difference is how much structure is imposed on you versus how much you have to decide yourself. Neither is "better" in the abstract; it depends on team size and how much consistency the project needs.

## REST APIs

**REST (Representational State Transfer)** is an architectural style for designing APIs around **resources** (like `users` or `orders`) and standard HTTP methods to act on them. A resource is addressed by a URL; the HTTP verb says what to do to it. Requests and responses are typically JSON.

| Verb | Typical meaning |
| --- | --- |
| GET | Read a resource (or a list of resources). No side effects. |
| POST | Create a new resource. |
| PUT | Replace (or fully update) an existing resource. |
| DELETE | Remove a resource. |

Status codes tell the caller what happened without needing to parse the response body: `200 OK` for success, `201 Created` after a successful POST, `400 Bad Request` for invalid input, `401 Unauthorized` / `403 Forbidden` for auth problems, `404 Not Found` for a missing resource, `500 Internal Server Error` for something breaking on the server.

```javascript
// A tiny REST endpoint: fetch one user by id
app.get("/users/:id", async (req, res) => {
  const user = await db.users.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
});
```

Most "REST APIs" in practice loosely follow these conventions rather than implementing the full formal style described in Roy Fielding’s original dissertation, that’s normal, and fine to say out loud.

## The BFF pattern

A **BFF (Backend for Frontend)** is a backend tailored to the needs of one specific frontend. Instead of a mobile app, a web app, and a public API all negotiating directly with the same general-purpose backend services, each frontend gets its own thin server-side layer that calls those services, combines their responses, and reshapes the result into exactly what that frontend wants.

It exists because different frontends often want the same underlying data shaped differently: a mobile screen might need a small, flattened payload to save bandwidth, while a web dashboard might want a richer, nested response. Without a BFF, either every backend service tries to serve every possible shape (bloat), or every frontend does its own complex aggregation (duplication). The BFF absorbs that translation in one place.

> [!note]
> The BFF sits between the frontend and the "real" backend services, it’s not where core business logic lives. Its job is orchestration and reshaping, not owning domain rules.

## API security

Two concerns come up constantly around APIs: **authentication** ("who are you?") and **authorization** ("what are you allowed to do?"). A system can correctly authenticate someone and still refuse a request because they’re not authorized for that action.

**OAuth2** is an industry-standard protocol for **delegated authorization**, it lets a user grant one application limited access to their data on another service without handing over their password. "Sign in with Google" is OAuth2 in action: the app never sees the user’s Google password, only a token proving limited, revocable access.

**JWT (JSON Web Token)** is a compact, signed token format. After a user authenticates, the server issues a JWT containing their identity and claims. The client stores it and sends it back on later requests, usually in an `Authorization: Bearer <token>` header. Because the token is signed, the server can verify it wasn’t tampered with, without a database lookup on every single request.

![[auth-oauth-jwt.drawio.svg]]

```javascript
// Middleware checking a Bearer token before letting a request through
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

> [!tip]
> If asked the difference in an interview: authentication proves identity (logging in); authorization decides what an already-identified user can do (permissions). OAuth2 is a protocol for granting access; JWT is a token format often used to carry the result of that access around.

## Testing

* **Unit tests** check one small piece of code: typically a single function, in isolation, with dependencies mocked out. They’re fast and pin down logic bugs early.
* **Integration tests** check that multiple parts work correctly together, such as an API endpoint talking to a real (or realistic) database. They catch problems unit tests can’t see, like a wrong query or a misconfigured route.
* **End-to-end tests** drive the whole app the way a user would, often through a real browser.

**Jest** is a widely used JavaScript/TypeScript test runner and assertion library, commonly used for unit and integration tests. **Cypress** is an end-to-end testing tool that drives a real browser to click through an app the way a user would, useful for verifying that the frontend and backend work together correctly.

```typescript
// A Jest unit test with a mocked dependency
test("returns 404 when the user is missing", async () => {
  const db = { users: { findById: jest.fn().mockResolvedValue(null) } };

  const result = await getUser(db, "missing-id");

  expect(result.status).toBe(404);
});
```

Mocking replaces a real dependency (a database, an external API) with a stand-in that returns controlled, predictable responses, so a test can focus on the logic being tested without needing the real thing to be running.

## How to talk about this in an interview

Junior candidates aren’t expected to have built a production-grade backend from scratch or to have memorized every HTTP status code. It’s fine to say something like: "I understand REST conventions, and I know the difference between authentication and authorization, I haven’t wired up a full OAuth2 flow personally, but I know what problem it solves and I’d look up the specifics when implementing it." Being clear and calm about **how** you’d figure something out matters more than reciting details from memory. See [[communication|Communication]] for more on framing gaps in knowledge honestly.

A strong answer:

* Explains what a REST endpoint is and names a couple of status codes with what they mean.
* Can state, in one sentence, why a BFF exists.
* Keeps authentication and authorization straight, even under follow-up questions.
* Knows the rough difference between a unit test and an integration test.

## Key terms

| Term | Quick definition |
| --- | --- |
| Node.js | A runtime that lets JavaScript run outside the browser, commonly used to build backend servers. |
| Express | A minimal, unopinionated Node.js web framework. |
| NestJS | A structured, opinionated Node.js framework built on TypeScript. |
| Endpoint | A specific URL and HTTP method that an API exposes for one operation. |
| BFF | Backend for Frontend, a server-side layer tailored to one frontend’s data shape. |
| OAuth2 | A protocol for delegated authorization, granting limited access without sharing a password. |
| JWT | A compact, signed token used to carry an authenticated user’s identity and claims. |
| Middleware | Code that runs between receiving a request and producing a response, e.g. auth checks. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Watch

![](https://www.youtube.com/watch?v=-mN3VyJuCjM)

## Related notes

* [[web-app-architecture|Web app architecture]]: where the backend and BFF sit in the bigger picture.
* [[frontend-and-spas|Frontend & SPAs]]: the client that calls these APIs.
* [[databases|Databases]]: what the backend reads from and writes to.
* [[communication|Communication]]: how to talk about knowledge gaps in an interview.
* [[glossary|Glossary]]: definitions for terms introduced here.
