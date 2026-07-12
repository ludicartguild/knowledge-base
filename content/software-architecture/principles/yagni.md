---
title: "YAGNI (You Aren't Gonna Need It)"
tags: [architecture, principles]
level: deep
type: reference
reviewed: 2026-07-12
---


**YAGNI**, "You Aren’t Gonna Need It", comes from Extreme Programming. The canonical statement:

Always implement things when you actually need them, never when you just foresee that you may need them.

## Why

The temptation is constant: "I might need this someday, so I’ll build it now while I’m in the file." YAGNI says don’t. Three reasons:

1. **Most "someday" features are never built or never needed in the form you predicted.** Speculative code is dead weight on the codebase from the day it lands.
2. **Even when the feature does ship eventually, your speculative version is rarely the right one**, by the time the real requirement arrives, it’s almost always different from what you imagined.
3. **Speculative code carries the same maintenance cost as real code**: tests, documentation, security review, dependency updates, refactors. You pay full price for hypothetical value.

## What YAGNI does **not** mean

YAGNI is about **features and abstractions**, not about hygiene. It does **not** tell you to:

* Skip writing tests.
* Skip handling error cases that actually exist.
* Skip refactoring when complexity is genuinely accumulating.
* Skip applying [[solid|SOLID]] / [[grasp|GRASP]] to the code you **do** write.

It tells you not to add the configuration flag, the abstract base class, the plugin point, the "extra" parameter, or the second implementation that isn’t called yet.

## The smell test

When tempted to add something "for later", ask:

* Is there a **named**, **committed** requirement that needs this? Not a guess, an actual one.
* Will the cost of adding it later be **materially** higher than the cost of adding it now? (It usually isn’t: modern tooling makes most additions cheap.)
* Will the cost of **carrying** this code from now until it’s used exceed the savings? (It usually does.)

If the answer to all three isn’t a clear yes, don’t add it.

## The Yagni-Done Trap

A common failure mode is _half-YAGNI_: the developer adds the speculative scaffolding (interface, abstract class, config key) but stops short of the speculative implementation. The codebase ends up with all the cost of the abstraction and none of the benefit, because there’s still only one concrete implementation.

This is worse than either extreme. Either add the feature fully (and prove it works) or don’t add the scaffolding at all.

## Practice & self-check

**Practice**

* Run the three-question smell test on a piece of code you are tempted to add "for later": is there a named, committed requirement; is adding it later materially more expensive; does the carrying cost exceed the savings? Add it only if all three are a clear yes.
* Spot a Yagni-Done Trap in a codebase: an interface, abstract base class, or config key with a single concrete implementation and no caller. Decide whether to complete the feature or delete the scaffolding.
* Take a change described as "applying YAGNI" and check it did not skip something YAGNI does not cover (a test, a real error case, a genuine refactor).

**Check yourself** (you should be able to answer these from this note):

* What is the canonical one-sentence statement of YAGNI?
* What are the three reasons speculative code is a bad bet?
* What does YAGNI explicitly NOT tell you to skip?
* What is the Yagni-Done Trap, and why is it worse than either fully building or not building the feature?

## Relation to other foundational concepts

* [[kiss|KISS]]: YAGNI is "don’t build it yet"; KISS is "and when you do, don’t make it complicated".
* [[dry|DRY (Rule of Three)]]: the Rule of Three is YAGNI applied specifically to abstraction: don’t generalise until you’ve seen the pattern three times.
* [[solid#o-open-closed-principle-ocp|OCP]]: OCP says be open for extension at the points where you **predict** variation. YAGNI tightens that: predict less, and only at points already confirmed to vary. See also _Protected Variations_ in [[grasp|GRASP]].
