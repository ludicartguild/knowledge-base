---
title: "A Layered Testing Strategy"
tags: [practices, testing]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

A layered testing strategy spreads automated checks across several levels of scope
and cost. You write many small, fast unit tests, fewer integration tests that
exercise how components fit together, and only a handful of slow end to end tests
that drive the whole system. This shape is the test pyramid. Each layer buys a
different kind of confidence at a different price. The goal is a portfolio that
catches most defects quickly and cheaply, reserving the slow, brittle, expensive
checks for the few scenarios that truly need them.

## Why it exists

Testing has two failure modes that a layered strategy is designed to avoid.

The first is leaning too hard on end to end tests. Tests that drive a full system
through its outer interface are appealing because a passing one feels like proof
that everything works. In practice they are slow, because they spin up real
processes and wait on real dependencies, and they are flaky, because any timing
issue, network hiccup, or unrelated change anywhere in the stack can make them
fail. A suite dominated by these tests takes a long time to run and produces
failures that are hard to diagnose, so people stop trusting it and stop running
it. This top heavy shape is the ice cream cone anti pattern.

The second failure mode is the opposite: relying only on isolated unit tests.
Unit tests confirm that each piece behaves correctly on its own, but they mock
away everything around them, so they cannot see the seams. Bugs live in the seams:
a mismatched data format between two services, a query that is valid in isolation
but wrong against a real schema, a configuration value that only matters when
components are wired together. With no integration coverage, each unit passes
while the assembled system fails.

A layered strategy exists to hold both concerns at once. Fast, focused tests give
quick feedback on logic, and a smaller number of broader tests confirm that the
parts actually connect. The layering is deliberate: put most of the weight where
tests are cheap and stable, and use the expensive layers sparingly.

## How it works

![[test-pyramid.drawio.svg]]

### The test pyramid

The pyramid, popularized by Mike Cohn and refined in writing by Martin Fowler and
Ham Vocke, arranges tests by scope. The base is the widest layer and the top is
the narrowest, which mirrors how many tests of each kind you should have.

Unit tests sit at the base. They exercise a single unit of behavior, a function,
a class, a small cluster of objects, in isolation from external systems. They run
in memory in milliseconds, so you can have thousands of them and still get an
answer in seconds. They pin down logic, edge cases, and branching, and they
localize failures precisely because their scope is small.

Integration tests sit in the middle. They check that a unit works correctly
against something it does not control: a database, a message broker, a file
system, another module across an internal boundary. They are slower than unit
tests because they touch real infrastructure or realistic substitutes, and there
are fewer of them because each covers more ground. Their job is to catch the
wiring defects that unit tests mock away.

End to end tests sit at the narrow top. They drive the whole system the way a user
or an external caller would, through its outermost interface, with real
dependencies running behind it. They give the strongest signal that the system
works as a whole, and they are the slowest and most fragile, so you keep them few
and reserve them for a handful of critical paths rather than exhaustive coverage.

The pyramid is a heuristic about proportion, not a rigid rule. The names of the
layers matter less than the principle: prefer the fastest test that can still
give you the confidence you need, and only climb to a broader layer when a
narrower one genuinely cannot.

### Test doubles

To keep the lower layers fast and isolated, you replace a real dependency with a
stand in called a test double. Gerard Meszaros catalogued five kinds, and using
the right one keeps tests honest.

A dummy is an object passed only to fill a parameter list; it is never actually
used. A stub returns canned answers to the calls a test makes, and nothing more,
so you can steer a unit down a chosen path. A spy is a stub that also records how
it was called, letting you assert afterward that, for example, a notification was
sent. A mock is preprogrammed with expectations about which calls it should
receive and fails verification if those calls do not happen as specified. A fake
has a real, working implementation that takes a shortcut unfit for production, the
classic example being an in memory store standing in for a database.

### Mocks versus fakes

The practical tension is between mocks and fakes, and it maps onto two styles of
testing. A mock asserts on interactions: it verifies that your code called a
collaborator in a particular way. This couples the test to how the code works, so
a refactor that changes the calls while preserving behavior can break a mock based
test even though nothing is actually wrong. A fake asserts on outcomes: you write
to the fake, read back, and check the result, which lets internals change freely
as long as behavior holds. Fakes tend to produce more durable tests, while mocks
are useful when the interaction itself is the behavior you care about, such as
confirming that a payment was actually charged. Overusing mocks is a common way to
end up with tests that pass while the real system is broken, because every
collaborator has been replaced with an assumption.

### Contract tests between services

When independent services talk to each other, end to end tests are a heavy way to
catch integration drift. Contract testing is lighter. The consumer of an [[glossary#a|API]]
declares the shape of the requests it makes and responses it expects, and that
contract is verified against the provider in the provider's own test suite. Each
side is tested on its own, yet a breaking change on the provider fails a fast test
rather than surfacing only in a slow end to end run or, worse, in production. This
gives cross service confidence without paying the full end to end cost.

### Testing at the boundary

Layering works best when the system is built so that its core logic does not
depend directly on external systems. When infrastructure sits behind well defined
interfaces, the core can be unit tested with simple fakes at those boundaries, and
the adapters that implement the boundaries get their own focused integration
tests against the real thing. Testability and clean boundaries reinforce each
other: code that is hard to test in isolation is usually code whose dependencies
are tangled into its logic.

### Ephemeral containers for integration tests

Integration tests need real dependencies, but shared long lived test environments
drift, collide, and hide state between runs. The modern approach is to start the
dependency in a throwaway container at the beginning of the test run and tear it
down at the end, so each run gets a clean, realistic instance of the actual
database or broker rather than a mock of it. This keeps integration tests both
realistic and reproducible, and it lets them run the same way on a developer
machine and in continuous integration.

### Coverage as a signal, not a target

Code coverage measures which lines your tests execute. It is a useful diagnostic:
a sudden drop or a persistently untested module is worth a look. It is a poor
goal. Once a coverage percentage becomes a target, people write tests that touch
lines without asserting anything meaningful, and the number rises while real
confidence does not. High coverage does not prove the assertions are good, and
100 percent coverage can still miss the integration seams that unit tests mock
away. Read coverage as a hint about where you might be blind, not as a grade.

### Deterministic versus flaky tests

A deterministic test gives the same result every time for the same code. A flaky
test passes and fails without any code change, usually because it depends on
timing, ordering, shared state, real clocks, or network conditions. Flaky tests
are corrosive: a red build that might just be noise trains people to rerun until
green and to ignore failures, which defeats the purpose of the suite. Treat flakes
as defects in the tests. Quarantine them so they stop blocking others, then fix
the nondeterminism at its root rather than papering over it with retries.

### Where each layer runs in continuous integration

The layers map onto stages of a pipeline by speed. Unit tests run first, on every
push and in pre merge checks, because they finish in seconds and give the tightest
feedback loop. Integration tests run next, often spinning up their ephemeral
containers as part of the pipeline, gating merges but tolerating a longer runtime.
End to end tests run last and least often, sometimes only against a deployed
staging environment or on a schedule rather than on every commit, because they are
slow and their failures need investigation. Ordering fast to slow means most
breakages are caught in the cheapest stage and the expensive stages run only
against changes that already cleared the earlier gates.

## Trade offs and when to use

Every layer trades confidence against speed and cost. A unit test is cheap to
write, fast to run, and stable, but its confidence is narrow: it says one piece
works, not that the system does. An end to end test gives broad, realistic
confidence, but it is expensive to write, slow to run, and prone to flakiness. The
integration layer sits between, buying seam level confidence at a moderate price.
The pyramid shape falls directly out of this: put most tests where each one is
cheap, and spend the expensive tests only where nothing cheaper will do.

Use unit tests for logic, calculations, edge cases, and anything with many
branches. Use integration tests where your code meets something it does not
control, a datastore, a queue, an external boundary. Use end to end tests for a
small set of critical user journeys whose full path you cannot verify any other
way. Use contract tests in place of broad end to end coverage when the risk is
drift between independently deployed services.

The main anti pattern is the ice cream cone, the pyramid inverted, with a mass of
slow end to end tests on top and little underneath. It usually grows by accident:
end to end tests are easy to add one at a time and feel reassuring, so the suite
accretes them until it is slow, flaky, and distrusted. The correction is not to
delete coverage but to push it down the pyramid, replacing broad tests with
focused ones that check the same behavior faster.

## Pitfalls and done right checklist

- Do not invert the pyramid. If most of your tests drive the full stack, expect
  slow, flaky runs that people learn to ignore.
- Do not skip the middle. All unit tests and no integration tests means every
  piece passes while the assembled system fails at the seams.
- Do not overmock. Tests that assert on interactions can pass while the real
  behavior is broken; prefer fakes and assert on outcomes where you can.
- Do not chase a coverage number. Treat coverage as a signal about blind spots,
  not a target to hit.
- Do not tolerate flaky tests. Quarantine and fix the nondeterminism; never
  normalize reruns.
- Do run real dependencies in integration tests, using ephemeral containers so
  each run is clean, realistic, and reproducible.
- Do order the pipeline fast to slow, so cheap stages catch most breakages before
  the expensive ones run.
- Do use contract tests between independently deployed services instead of leaning
  on end to end runs to catch integration drift.
- Do write each test at the lowest layer that can still give the confidence you
  need.

## Mental model

Think of it as a budget for confidence. Confidence is what you are buying, and it
comes in tiers priced by scope: cheap and narrow at the bottom, expensive and
broad at the top. A rational buyer spends most of the budget where each unit of
confidence is cheapest and buys the expensive tiers only for the few things that
demand them. The pyramid is simply what a well spent testing budget looks like
when you draw it. When the shape inverts into a cone, you are overpaying: lots of
money spent on slow, fragile confidence that a fraction of the cost, spent lower
down, would have bought more reliably.

## Cross-links

- [[cicd-and-github-actions]]
- [[iac-testing-and-security]]
- [[hexagonal-architecture]]

## Sources

- Martin Fowler, "Test Pyramid" (bliki), https://martinfowler.com/bliki/TestPyramid.html
- Ham Vocke, "The Practical Test Pyramid" (martinfowler.com),
  https://martinfowler.com/articles/practical-test-pyramid.html
- Martin Fowler, "Test Double" (bliki), https://martinfowler.com/bliki/TestDouble.html
- Martin Fowler, "Mocks Aren't Stubs", https://martinfowler.com/articles/mocksArentStubs.html
- Gerard Meszaros, xUnit Test Patterns: Refactoring Test Code (Addison Wesley),
  http://xunitpatterns.com/
- Martin Fowler, "Contract Test" (bliki), https://martinfowler.com/bliki/ContractTest.html
- Google Testing Blog, "Test Sizes",
  https://testing.googleblog.com/2010/12/test-sizes.html
- Google Testing Blog, "Flaky Tests at Google and How We Mitigate Them",
  https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html
- Google Testing Blog, "Code Coverage Best Practices",
  https://testing.googleblog.com/2020/08/code-coverage-best-practices.html
