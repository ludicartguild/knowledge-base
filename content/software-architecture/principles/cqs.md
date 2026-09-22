---
title: "Command Query Separation (CQS)"
tags: [architecture, principles]
level: deep
type: reference
reviewed: 2026-07-12
---


Command Query Separation is a principle coined by **Bertrand Meyer** (of _Object-Oriented Software Construction_). It says every method should be one of two things, **never both**.

## The two kinds of method

| Kind | What it does | Return |
| --- | --- | --- |
| **Command** | Changes state. | Returns nothing (`void`). |
| **Query** | Returns data. | Has no observable side effects. |

## Why it matters

If a method is a pure query, it becomes safe to call freely:

* in assertions, logs, and debuggers,
* repeatedly without changing behavior,
* in caches and memoization layers,
* in OCP-style strategy plug-ins without surprises.

If a method is a command, the fact that it mutates something becomes **explicit** at the call site.

Mixing the two ("return the next ID **and** increment the counter") makes code harder to reason about, harder to test, and harder to cache.

## Example

```typescript
// Violates CQS - pop() both mutates and returns
stack.pop();        // returns the top AND removes it

// Applies CQS - separate the two
stack.top();        // query: returns top, no mutation
stack.remove();     // command: removes top, returns void
```

## Caveats

Strict CQS cannot be followed everywhere. Common idioms break it on purpose:

* `Iterator.next()`: advances **and** returns.
* `Stack.pop()`: removes **and** returns.
* Atomic `compareAndSwap`: checks **and** mutates.

These exist because doing them atomically is the whole point. CQS is a default, not a law.

## CQS vs. CQRS

CQS is the conceptual ancestor of **CQRS** (Command Query Responsibility **Segregation**), Greg Young’s pattern that takes CQS to the architectural level: split the entire **read model** from the **write model**, often with separate databases, schemas, or services.

* **CQS**: method-level discipline.
* **CQRS**: system-level architecture.

## Practice & self-check

**Practice**

* Take a method that both mutates and returns (for example "return the next ID and increment the counter") and split it into a separate command and query, as the stack example does.
* Scan an interface for CQS violations: flag any method that returns data yet also changes observable state, then decide for each whether it is a deliberate atomic idiom (like `pop()` or `compareAndSwap`) or an accidental mix worth separating.
* Point at a pure query in some code and explain what now becomes safe (calling it in a log, repeatedly, in a cache) precisely because it has no side effects.

**Check yourself** (you should be able to answer these from this note):

* What are the two kinds of method under CQS, and what does each return?
* Why does making a method a pure query make it safe to call in assertions, logs, and caches?
* Name two common idioms that break CQS on purpose, and why they are allowed.
* How do CQS and CQRS differ in scope (method-level vs. system-level)?

> [!question]- Answers
> **The two kinds.** A command changes state and returns nothing. A query returns data and
> has no observable side effects. Every method should be one or the other, never both.
>
> **Why a pure query is safe.** Because calling it cannot change anything, you can call it
> freely and repeatedly without altering behaviour. That makes it safe inside assertions,
> logs, and debuggers, where an accidental mutation would produce a bug that disappears when
> you remove the logging. It also makes it safe to cache or memoize, since the result
> depends only on state the call did not modify. Mixing the two, such as returning the next
> ID while incrementing the counter, removes all of those guarantees at once.
>
> **CQS against CQRS.** Scope. CQS is a method-level rule: this method either mutates or
> returns. CQRS applies the same separation at the system level, with distinct models and
> often distinct stores for the write side and the read side. CQS is nearly free; CQRS buys
> independent optimisation and scaling at the cost of keeping two models in sync.

## Relation to other foundational concepts

* [[solid#s-single-responsibility-principle-srp|SRP]] asks "who can demand changes?" CQS asks "does this method mutate or observe?": two different axes of separation, both reducing coupling.
* [[coupling-and-cohesion|Coupling]]: pure queries can be depended on more safely (lower instability cost for consumers), since they don’t propagate hidden state changes.
* [[solid#o-open-closed-principle-ocp|OCP]]: pure queries are ideal candidates for strategy injection: they can’t surprise the caller with side effects.
