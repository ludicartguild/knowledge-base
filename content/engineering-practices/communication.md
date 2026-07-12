---
title: "Communication"
tags: [practices]
level: fundamentals
type: concept
reviewed: 2026-07-12
---


Writing code is only part of the job. A developer also has to explain decisions to non-technical stakeholders, ask questions that surface hidden requirements, and be honest about the limits of their own knowledge. These are learnable, interview-relevant skills, not vague "soft skills", and interviewers screening junior candidates routinely test for them alongside technical fundamentals.

## What good communication looks like

* **Plain language first.** Explain what a change does and why it matters before reaching for jargon. "This caches the results so the page loads faster" beats "I added a memoization layer" when the audience is a client, not another engineer.
* **Confirm understanding before starting work.** Restate the request in different words and check it back: "So the button should disable while the form is submitting, and re-enable if it fails: is that right?"
* **Ask clarifying questions early, not late.** A question asked before writing code is cheap. The same question asked after two days of work built on a wrong assumption is expensive.
* **Surface bad news early.** If a deadline is at risk or an approach will not work, say so as soon as it is known, with a proposed next step attached.
* **Match the audience.** A stakeholder wants impact and timeline. A fellow developer wants the technical detail. Same fact, different framing.

> [!tip]
> A useful test for a clarifying question: "What would I build differently depending on the answer?" If the answer does not change what gets built, it usually is not worth asking before starting.

## The "I’ll figure it out" rule

"I’ll figure it out" is a legitimate, confidence-building thing to say, but only in the right moment. The rule is about **timing**, not honesty.

### When it is acceptable

Mid-project, once work is already underway and the client does not expect the developer to have exact knowledge on the spot. It signals competence and momentum, not uncertainty about the commitment itself.

* **Good moment:** "Does this library support X?" → "Not sure yet, but I’ll figure it out and let you know by tomorrow." The commitment (the feature, the deadline) is already agreed; this is just an implementation detail.
* **Good moment:** A stakeholder asks an offhand question in a stand-up about a small technical detail that does not change scope or cost.

### When it is NOT acceptable

During a proposal, estimate, or any moment where the client is deciding whether to commit money, time, or trust. At that point, "I’ll figure it out" reads as **unprepared**, not confident, because the client cannot yet tell whether the underlying commitment is sound.

* **Bad moment:** A client asks "Can this be done in two weeks for $3,000?" and the answer is "I’ll figure it out." That is the exact moment the client needs a real answer, or an honest "I need a day to scope this before I can commit to a number."
* **Bad moment:** Saying "I’ll figure it out" about whether a core requirement is technically feasible at all, when feasibility is the very thing being evaluated.

> [!note]
> The dividing line: has the client already committed to the engagement? If yes, "I’ll figure it out" on a detail is fine. If the commitment itself is what is being decided, give a real answer or a concrete plan to get one.

## Honesty about what you know vs. don’t

Pretending to know something and being wrong later is worse than admitting a gap up front. The reliable pattern:

1. Say plainly that the answer is not known yet, no hedging or bluffing.
2. State how the answer will be found (documentation, a spike, a colleague, testing).
3. Give a timeframe for reporting back.

For example: "I don’t know off the top of my head how this library handles concurrent writes, but I’ll check the docs and run a quick test, I can have an answer by end of day."

This is more credible than a guessed answer, because it demonstrates a **process** for closing the gap, not just an admission of ignorance.

## Working in a team (Agile basics)

Most engineering teams organize work using Agile/Scrum vocabulary. A junior developer is not expected to run these ceremonies, but should recognize the terms and know roughly what happens in each.

* **Standup**: a short (10-15 minute), daily check-in where each person says what they did, what they will do next, and what is blocking them.
* **Sprint**: a fixed time box (commonly one or two weeks) in which a team commits to completing a set of work.
* **Backlog**: the full list of outstanding work (features, bugs, improvements), ordered roughly by priority, waiting to be pulled into a sprint.
* **Retrospective**: a recurring meeting, usually at the end of a sprint, where the team discusses what went well, what didn’t, and what to change.
* **Scope**: the agreed boundary of what a task, sprint, or project will and will not include. "Scope creep" is unplanned work added without adjusting time or budget.
* **Stakeholder**: anyone with an interest in the outcome of the work who is not necessarily writing the code, a client, product manager, or end user.

## How to talk about this in an interview

* Have one short story ready where a clarifying question changed the outcome of a task: this shows judgment, not just eagerness to ask questions.
* Be ready to describe a time an estimate or answer was not known, and how it was handled ("I said I’d check and get back to them by X").
* Avoid claiming perfect knowledge of every tool mentioned in the job posting. It is stronger to say "I haven’t used that specific library, but I’ve used similar ones and pick things up quickly" than to bluff.
* Use the Agile terms naturally if asked about team process, but don’t over-explain basics unless asked: fluency, not a lecture.

## Key terms

| Term | Meaning |
| --- | --- |
| Standup | Short daily team sync on progress and blockers. |
| Sprint | Fixed time box for completing a committed set of work. |
| Backlog | Prioritized list of all outstanding work. |
| Retrospective | End-of-sprint discussion on what to keep or change. |
| Scope | The agreed boundaries of what a task includes. |
| Stakeholder | Anyone with an interest in the outcome, technical or not. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Watch

![](https://www.youtube.com/watch?v=nj1AZoczVvg)

## Related notes

* [[glossary|Glossary]]: full term list referenced across all foundational notes.
* [[git-and-github|Git and GitHub]]: commit messages and PR descriptions are one of the most common places developer communication shows up in day-to-day work.
