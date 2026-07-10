---
title: "DRY (Don't Repeat Yourself)"
tags: [architecture]
level: deep
type: reference
---


**DRY** — "Don’t Repeat Yourself" — is a principle popularized by Andy Hunt and Dave Thomas in _The Pragmatic Programmer_. It says every piece of knowledge in a system should have a single, unambiguous, authoritative representation.

## Why duplication is costly

Duplicated code carries hidden costs:

* **Technical debt** — every copy is a future change site.
* **Engineering time lost to bugs** — when one copy is fixed but the others drift out of parity, the divergence becomes a source of subtle bugs.
* **Cognitive load** — readers can’t tell whether two similar-looking blocks are intentionally the same or accidentally similar.

## When duplication is harmful

The cost of duplication scales with how **likely the code is to change**. Stable, rarely-touched duplication is cheap. Volatile duplication is expensive.

Rule of thumb: **duplicate code that changes a lot will hurt you; duplicate code that never changes won’t**.

## The Rule of Three

Unconditional elimination of duplication can itself be harmful — premature abstraction often locks in the **wrong** shape, which is harder to undo than the duplication it replaced. The **Rule of Three** exists to guard against this:

1. Write a piece of code.
2. Write the same piece of code again. **Resist the urge to generalise.**
3. Write the same piece of code a third time. **Now** you are allowed to consider generalising it.

By the third repetition you usually understand which parts are truly invariant and which only **look** similar, so the abstraction you build is the right one.

## Common misreading

DRY is about **knowledge**, not about **characters that happen to be identical**. Two functions that look identical but represent two unrelated business rules are **not** a DRY violation — they will diverge in the future and should be left alone.

## Relation to other foundational concepts

* [[kiss|KISS]] — premature de-duplication often violates KISS by introducing abstractions before they’re justified.
* [[yagni|YAGNI]] — the Rule of Three is essentially YAGNI applied to abstraction: don’t build the generalised version until you actually need it.
* [[coupling-and-cohesion|Coupling]] — a bad de-duplication can **increase** coupling by forcing two unrelated callers to share an abstraction they shouldn’t.
* [[solid|SRP]] — duplication that crosses actor boundaries is often a sign that two different responsibilities have been merged. Separating them resolves both the duplication and the SRP violation at once.
