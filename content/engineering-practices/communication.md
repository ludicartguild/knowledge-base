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

## Writing things down (the async-first default)

Distributed and partly-remote teams have largely settled on a **written-first** default:
communication that does not require both people to be available at the same time. Updates
are written, decisions are recorded, and status is visible without a meeting. Meetings
become the exception, used for genuinely interactive work rather than for transferring
information one person could have written once.

This changes what good communication looks like. A verbal explanation in a standup reaches
five people for a day. The same explanation in a document reaches everyone who joins in the
next two years. The cost is that writing takes longer than talking, and the payoff only
arrives later, which is why teams have to make it a norm rather than a preference.

### The decision artifacts

Three document types recur, and the differences matter when someone asks you to write one:

| Artifact | Length | Written when | Purpose |
| --- | --- | --- | --- |
| **RFC** (request for comments) | 1 to 5 pages | Before a non-trivial change | Surface disagreement while changing course is still cheap |
| **Design doc** | Varies, often longer | Before implementation | Describe the approach in enough detail to build from |
| **ADR** (architecture decision record) | Under a page | At the moment of decision | Record what was chosen and why, permanently |

An RFC invites argument and expects to change. An ADR is a historical record: it is never
edited after the fact, and a reversal is a new ADR superseding the old one. Some teams use
RFC and design doc interchangeably; nobody uses ADR interchangeably with either, because
the point of an ADR is that it is immutable.

> [!tip]
> The most valuable section of an RFC is **alternatives considered**. It is what stops the
> same debate recurring in six months, and it is the section people skip.

### Working agreements

A **working agreement** is a team's explicit rules for how it operates: which channel
carries what, expected response times, how decisions get recorded, and when interrupting
someone is acceptable. Response expectations are usually tiered, with production incidents
in minutes, a direct blocker within a couple of hours, a pull request review within a
business day, and document feedback within two.

The value is not the specific numbers. It is that norms which are otherwise implicit, and
therefore unevenly understood, become something a new joiner can read instead of inferring
over three months.

## Communicating about AI-assisted work

Agentic tooling has changed what a pull request means, and teams are still settling the
norms. The pattern that has stabilised is **human in the loop**: an agent may read the
codebase, edit files, run tests, and open a pull request, while a person sets the intent
and signs off before anything merges. Authority for consequential decisions stays with the
human.

Two things follow for how you communicate about your own work.

**You own what you submit.** Whether a change was typed or generated, putting your name on
the pull request is a claim that you understand it and believe it is correct. "The model
wrote that part" is not a defence in review, and treating it as one is the fastest way to
lose the trust the rest of this note is about.

**Say what you verified, not what you produced.** A useful pull request description says
which paths you actually exercised, what you tested, and where you are less sure. That is
true regardless of how the code was written, and it matters more when volume is cheap and
review is the bottleneck.

Team norms on disclosure vary and are worth asking about directly rather than assuming.
Some teams want generated changes flagged, some consider the question settled and
uninteresting, and both positions are currently defensible.

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
| Async-first | Written communication as the default; meetings are the exception. |
| RFC | A proposal circulated for comment before a non-trivial change. |
| ADR | A short, permanent record of one architectural decision and its reasoning. |
| Working agreement | A team's written rules for channels, response times, and decisions. |
| Human in the loop | Automation proposes, a person decides and signs off. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* Take a request you received recently, restate it back in different words, then draft one clarifying question that passes the "what would I build differently depending on the answer?" test.
* Rehearse the three-step honesty pattern out loud for something you genuinely don't know: say you don't know, state how you'll find out, give a timeframe.
* Explain, in one or two sentences, when "I'll figure it out" is a confident answer versus when it reads as unprepared.

**Check yourself** (you should be able to answer these from this note):

* What is the dividing line that decides whether "I'll figure it out" is acceptable or not?
* What are the three steps of the reliable pattern for admitting you don't know something?
* What quick test tells you whether a clarifying question is worth asking before you start coding?
* What happens in a retrospective, and how does it differ from a standup?
* What does async-first actually change about how a team communicates, and what does it cost?
* When would you write an RFC, a design doc, and an ADR, and which one is never edited afterwards?
* What does a working agreement make explicit that teams otherwise leave implicit?
* Under a human-in-the-loop norm, who owns a pull request that an agent largely wrote?

> [!question]- Answers
> **The first item is a practice exercise**, so there is no fixed answer. A good clarifying
> question is one where the two possible answers lead to different code. "Should the button
> disable while submitting, and re-enable on failure?" passes. "What colour should the
> spinner be?" usually does not, because you can build it either way and change it later.
>
> **The dividing line for "I'll figure it out".** Has the client already committed to the
> engagement? If yes, saying it about an implementation detail is fine, because the
> commitment is settled and this is just how you get there. If the commitment itself is what
> is being decided, such as "can this be done in two weeks for three thousand", you owe a
> real answer or a concrete plan to get one: "I need a day to scope this before I commit to
> a number."
>
> **The three-step honesty pattern.** Say plainly that you do not know, with no hedging or
> bluffing. State how the answer will be found, whether documentation, a spike, a colleague,
> or a test. Give a timeframe for reporting back. The third step is what turns an admission
> into a commitment.
>
> **The clarifying-question test.** "What would I build differently depending on the
> answer?" If the answer does not change what gets built, it usually is not worth asking
> before starting. The economics behind it: a question asked before writing code is cheap,
> and the same question after two days built on a wrong assumption is expensive.
>
> **Retrospective against standup.** A standup is a short daily check-in, ten to fifteen
> minutes, where each person says what they did, what they will do next, and what is
> blocking them. A retrospective is recurring, usually at the end of a sprint, and discusses
> what went well, what did not, and what to change. The standup is about the work in flight;
> the retrospective is about the process producing it.
>
> **What async-first changes.** Communication stops assuming both people are available at
> once. Updates are written, decisions are recorded, and status is visible without a
> meeting, so meetings are reserved for genuinely interactive work. The cost is that
> writing takes longer than talking and the payoff arrives later, when someone who was not
> in the room reads it. That delay is why it has to be a team norm rather than an
> individual preference.
>
> **The three artifacts.** An RFC goes out before a non-trivial change, one to five pages,
> to surface disagreement while changing course is cheap. A design doc describes the
> approach in enough detail to build from, and overlaps enough with an RFC that many teams
> use the words interchangeably. An ADR is written at the moment of decision, under a page,
> and records what was chosen and why. **The ADR is never edited afterwards**: it is a
> historical record, and reversing a decision means writing a new ADR that supersedes it.
>
> **What a working agreement makes explicit.** Which channel carries what, expected
> response times per urgency, how decisions get recorded, review turnaround, and when
> interrupting is acceptable. Those norms exist on every team whether or not they are
> written; writing them means a new joiner can read them instead of inferring them over
> three months, and means disagreements about them are about the document rather than
> about someone's character.
>
> **Who owns an agent-written pull request.** You do. Human in the loop means automation
> proposes and a person decides, so putting your name on a change is a claim that you
> understand it and believe it is correct. "The model wrote that part" is not a defence in
> review. The useful thing to communicate is what you actually verified and where you are
> less sure, which is true however the code was produced and matters more when generating
> volume is cheap and review is the bottleneck.

## Watch

![](https://www.youtube.com/watch?v=nj1AZoczVvg)

## Related notes

* [[glossary|Glossary]]: full term list referenced across all foundational notes.
* [[git-and-github|Git and GitHub]]: commit messages and [[glossary#p|PR]] descriptions are one of the most common places developer communication shows up in day-to-day work.
