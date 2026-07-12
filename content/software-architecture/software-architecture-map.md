---
title: "Software Architecture: Map"
tags: [moc, architecture]
level: fundamentals
type: moc
reviewed: 2026-07-12
---

A map of the software-architecture notes: the **principles** that guide design decisions,
the **patterns** that recur in solutions, and the broader **concepts** that tie them
together. Read in any order; the cross-links between notes matter more than the sequence.

## Principles

The "why" behind good structure: heuristics for keeping systems changeable.

* [[solid|SOLID]]: the five object-oriented design principles (SRP, OCP, LSP, ISP, DIP).
* [[grasp|GRASP]]: responsibility-assignment patterns for deciding which object should do what.
* [[coupling-and-cohesion|Coupling & Cohesion]]: the two forces underneath most design quality.
* [[encapsulation|Encapsulation]]: hiding internals behind a stable interface.
* [[composition-over-inheritance|Composition over Inheritance]]: prefer assembling behaviour over subclassing it.
* [[inversion-of-control|Inversion of Control]]: let a framework or container drive, and inject dependencies.
* [[dry|DRY]]: don't repeat knowledge (and when duplication is actually fine).
* [[kiss|KISS]]: prefer the simplest thing that works.
* [[yagni|YAGNI]]: don't build for requirements you don't have yet.
* [[cqs|CQS]]: separate commands (that change state) from queries (that return data).
* [[fail-fast|Fail Fast]]: surface errors loudly at the earliest point.
* [[cap-theorem|CAP Theorem]]: the consistency/availability tradeoff in distributed systems.

## Patterns

Named, reusable solutions to recurring design problems.

* [[strategy-pattern|Strategy]]: swap interchangeable algorithms behind one interface.
* [[command-pattern|Command]]: turn a request into an object you can queue, log, or undo.
* [[observer-pattern|Observer]]: broadcast state changes to unknown subscribers.
* [[mediator-pattern|Mediator]]: route interaction between peers through a central hub.
* [[decorator-pattern|Decorator]]: wrap an object to add behaviour without subclassing.
* [[repository-pattern|Repository]]: abstract data access behind a collection-like interface.
* [[specification-pattern|Specification]]: encapsulate a business rule as a composable, testable object.

## Concepts

* [[web-app-architecture|Web App Architecture]]: how the pieces of a modern web application fit together.

## Related
* [[full-stack-interview-foundations|Full-Stack Interview Foundations]]: a guided path that draws on many of these.
* [[production-platform-genai-engineering|Production Platform & GenAI Engineering]]: applies these principles at platform scale.
* [[glossary|Glossary]]: definitions for the terms used across these notes.
