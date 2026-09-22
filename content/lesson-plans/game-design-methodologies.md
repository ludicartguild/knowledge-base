---
title: "Game Design: Methodologies to Process"
tags: [lesson-plan, game-dev, design]
level: deep
type: moc
reviewed: 2026-09-22
---

A comparative path through the major schools of game design, ending in a written process
of your own. The destination is not knowing what MDA stands for, it is having a
methodology you can name, defend, and follow when a project is going badly.

The structure is deliberate: take each school on its own terms first, then compare, then
refuse the parts that do not fit your context, then synthesise. Skipping to the synthesis
produces a document that is a shortened version of whichever book you read last.

## Objectives

By the end of this path you can:

* Use MDA and the elemental tetrad fluently in a design conversation.
* Characterise the major design schools by what each is strong and weak at.
* Choose a pre-production methodology and say what it protects against.
* Choose a production methodology fitting your team size and funding model.
* Run playtests that surface confusion rather than confirming what you hoped.
* Pick a documentation format proportional to who will actually read it.
* Name where your context differs from the one a methodology assumes.
* Write a process with objective phase criteria and use it on a real project.

## Prerequisites

Having made at least one small game, even a bad one. The comparisons land differently
once you have felt a project go wrong.

## How to use this path

Work in order; the comparison sections depend on having taken each school seriously
first. Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** apply it to a project you have or want.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test judgement rather than recall.

## 1. Foundational vocabularies

The frameworks that appear in every design conversation.

**Focus:** What does MDA actually claim? What are the aesthetics of play for? How do
player type models help and mislead?

**Learn:**
* [MDA: A Formal Approach to Game Design](https://users.cs.northwestern.edu/~hunicke/MDA.pdf): the original paper, short.
* [Bartle's player types](https://mud.co.uk/richard/hcds.htm): the original taxonomy.

**Practice:** Take a game you know well and describe it through MDA, naming the mechanics,
the dynamics they produce, and the aesthetics those serve. Then name its two primary
aesthetic targets from the list of eight.

**Self-check:** you can apply MDA to a real game, name the eight aesthetics, and explain
what the elemental tetrad adds.

> [!question]- Answer
> **MDA.** Mechanics are the rules and systems. Dynamics are the behaviour that emerges at
> runtime when people play them. Aesthetics are the emotional response. The claim that
> makes it useful is directional: designers work mechanics to dynamics to aesthetics,
> players experience aesthetics to dynamics to mechanics. You build the thing furthest
> from what anyone cares about, which is why designing by intended feeling alone does not
> work.
> **The eight aesthetics.** Sensation, fantasy, narrative, challenge, fellowship,
> discovery, expression, submission. Their value is as a naming tool: most underperforming
> games have an unclear aesthetic target, and the designers cannot say which two of these
> the game is for. Being able to say "this is challenge and discovery, not fellowship" is
> what makes feature arguments resolvable.
> **The elemental tetrad.** Schell's mechanics, story, aesthetics meaning visual and
> audio, and technology, each shaping the others. Broader than MDA because it includes
> technology as a first-class constraint rather than an implementation detail, which is
> honest about how games actually get made.
> **Bartle's types.** Killers, achievers, socialisers, explorers. Useful for thinking
> about motivation in social or progression-driven games. Misleading when treated as a
> taxonomy of people rather than of behaviours, since one person plays differently in
> different games and different moods.

**Ask yourself:**
* Which two aesthetics is my project actually for, and does every feature serve them?
* Am I designing a dynamic I want, or a mechanic I think is clever?

## 2. The major schools

Four practitioners, taken on their own terms.

**Focus:** What is each school strongest at? Where does each leave you without guidance?

**Learn:**
* Jesse Schell, *The Art of Game Design: A Book of Lenses*.
* Tracy Fullerton, *Game Design Workshop*.
* Raph Koster, *A Theory of Fun for Game Design*.
* [Ian Schreiber, Game Design Concepts](https://gamedesignconcepts.wordpress.com/): free course material.

**Practice:** Read at least two of these properly. For each, write a page on what it
assumes about your team, your timeline, and your funding. Those assumptions are where fit
is decided.

**Self-check:** you can characterise each school's strength and weakness, and say which
assumes a context like yours.

> [!question]- Answer
> **Schell.** The discipline through roughly a hundred lenses, short prompts asking
> whether you have considered something. The most influential single book in modern game
> design. Strength: applicable at any stage of any project. Weakness: encyclopedic and
> deliberately imposes no process, so it hands you a toolkit and leaves assembly to you.
> **Fullerton.** Playcentric design: player-centred, prototype-driven, test everything,
> with every concept attached to an exercise. The most practitioner-shaped of the four.
> Strength: builds the prototype-and-playtest reflex, which is the habit that matters
> most. Weakness: lighter on systems-level design.
> **Koster.** Fun as the brain's response to learning, with mastery as the engine.
> Strength: short, and the best explanation available of why games engage at all. Weakness:
> almost no guidance on what to do tomorrow morning.
> **Schreiber.** Academic course material treating design as a discipline with named
> problems. Strength: structured curriculum with actual exercises. Weakness: drier than
> the practitioners, which matters for whether you finish it.
> **The pattern.** Schell gives you questions, Fullerton gives you habits, Koster gives you
> understanding, Schreiber gives you structure. None gives you a process, which is why
> section 10 exists.

**Ask yourself:**
* Which of these am I drawn to, and is that fit or flattery?
* What does each assume about my team size that is not true?

## 3. Pre-production

Deciding what you are making before it is expensive.

**Focus:** What is a vertical slice for? What does "find the fun" actually commit you to?
What makes a design pillar useful?

**Learn:**
* [Daniel Cook, Lost Garden](https://lostgarden.com/): the canonical writing on prototyping and game loops.
* [Stone Librande's one-page designs](https://www.gdcvault.com/): GDC talks on compressing a design onto a page.

**Practice:** Write three to five design pillars for your project. Each must be a
statement that can rule a feature out. Then take three features you want and check each
against the pillars.

**Self-check:** you can distinguish a vertical slice from a playable prototype, and write
pillars that actually filter decisions.

> [!question]- Answer
> **Vertical slice.** One small section polished to shipping quality, demonstrating every
> system end to end. The most-recommended pre-production deliverable for teams above a
> handful of people, because it proves the whole pipeline works and it is what you show a
> publisher. What is genuinely debated is how vertical, how much polish, and how early.
> **Playable prototype.** Looser and lower fidelity, often paper or grey-box, existing only
> to validate the core loop. Cheaper and earlier than a slice, and the right first move
> when you are not yet sure the game is fun.
> **Find the fun.** Prototype many small ideas and discard ruthlessly until one feels good
> in the hands. The commitment people underestimate is the second half: until it is fun,
> no production work is justified. That means being willing to throw away months, which is
> easy to agree to and hard to do when the months have been spent.
> **Design pillars.** Three to five short statements of what the game must be and must not
> be, used to filter every decision. The test of a good pillar is whether it can rule
> something out. "Great combat" rules out nothing. "No modal menus during combat" rules out
> a lot. Well-written pillars are the highest-leverage pre-production artefact because they
> prevent the most expensive kind of scope creep, the kind everyone agrees with.

**Ask yourself:**
* Can any of my pillars actually reject a feature I want?
* If the core loop is not fun in six months, will I really stop?

## 4. Production methodologies

Running the long middle.

**Focus:** Why does Scrum fit games badly? What does milestone development optimise for?
What does long pre-production buy?

**Learn:**
* [Agile Game Development](https://www.agilegamedevelopment.com/): Clinton Keith's adaptation of Scrum for games.
* GDC postmortems: search for projects similar in size to yours.

**Practice:** Pick a methodology for your next project and write down the specific failure
it is protecting you against. If you cannot name one, you have picked by default.

**Self-check:** you can compare the production methodologies by what each optimises for,
and choose one with a reason.

> [!question]- Answer
> **Agile and Scrum.** Two to four week sprints with planning, demos, and retrospectives.
> The default in most studios and often poorly executed, because games are not only
> software. Strength: tight feedback loops. Weakness: art and narrative work do not fit
> sprint boundaries cleanly, and a sprint demo pressures teams toward what demos well
> rather than what the game needs.
> **Milestone-based.** Producer-driven, with pre-defined alpha, beta, and gold milestones
> carrying content and feature lists. Common in AAA and publisher-funded indie. Strength:
> aligns with publisher and marketing calendars, which is what gets you paid. Weakness:
> rigid against design discovery, so what you learn in month eight cannot change the
> month-twelve milestone.
> **Continuous or triple-track.** Design, art, and code each run at their own cadence with
> producers managing dependencies. Strength: each discipline moves at its natural speed.
> Weakness: needs a strong producer and creates silos when it does not have one.
> **Long pre-production, fast production.** Pre-production runs months until fun is
> verified, then production runs quickly on a known-good core. Strength: you never produce
> on top of a broken foundation, which is the most expensive mistake available. Weakness:
> it does not fit a fixed deadline, because you cannot schedule when fun arrives.
> **Choosing.** The real variable is your funding model. Fixed deadline and external money
> pushes you toward milestones whether or not it suits the work.

**Ask yourself:**
* Which failure is my methodology protecting me from, specifically?
* Does my process serve the game or the funding calendar, and do I admit which?

## 5. Playtesting

Finding out what is actually true.

**Focus:** Which method catches which class of problem? Why is blind testing scheduled too
late almost everywhere?

**Learn:**
* [Nielsen on sample size](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/): why five sessions catch most issues.
* Fullerton, *Game Design Workshop*: the playtesting chapters specifically.

**Practice:** Run one think-aloud session with someone who has never seen your game. Do
not explain anything. Write down every moment they were confused, and resist explaining
afterwards.

**Self-check:** you can choose a playtest method for a question, and run a session without
contaminating it.

> [!question]- Answer
> **Internal.** The team plays daily. Cheap and fast, and biased because they know what it
> is supposed to be. Catches blockers and progression breaks; systematically misses
> confusion and onboarding failure, because the team cannot un-know the game.
> **External and blind.** Players who have never seen it. The single most important method
> for catching onboarding and clarity failures, and it must be scheduled before alpha
> rather than after, because after alpha you can no longer afford to act on what it finds.
> **Think-aloud.** The player narrates their thinking while playing. Labour-intensive and
> extremely informative, surfacing confusion in real time rather than in a survey
> afterwards. Roughly five sessions catch most usability issues, which is a far smaller
> number than people assume and is why not doing it is indefensible.
> **Telemetry.** Instrumenting the game and measuring behaviour at scale. Tells you what
> happened with confidence and never tells you why. Complements think-aloud rather than
> replacing it.
> **Not contaminating a session.** Do not explain, do not answer questions during play,
> and do not defend. Every explanation you give is a thing the shipped game will not be
> able to say. The urge to help is the main thing that ruins amateur playtests.

**Ask yourself:**
* When did someone who had never seen my game last play it unaided?
* Did I explain something during the last test, and what does that mean the game failed to say?

## 6. Documentation

Writing only what someone will read.

**Focus:** What is each document format for? Who is the audience, and how long does it
stay true?

**Learn:**
* [Stone Librande: one-page designs](https://www.gdcvault.com/): the case for radical compression.
* Schreiber, *Game Design Concepts*: the documentation material.

**Practice:** Write your project on one page. Everything: the pitch, the loop, the
systems, the aesthetic target. The compression is the exercise.

**Self-check:** you can choose a documentation format by audience, and explain why the
full GDD fell out of favour.

> [!question]- Answer
> **The full GDD.** Fifty to five hundred pages specifying everything. Traditional AAA
> pre-production. Strength: completeness, and the ability to onboard new staff without a
> conversation. Weakness: it rots fast. Within months of production starting it describes
> a game that no longer exists, and nobody updates it because updating it is a week of
> work nobody has.
> **Lean GDD.** Ten to thirty pages of high-leverage content: vision, pillars, core
> mechanics, key systems, business model. Kept current because it is small enough to keep
> current. The modern default for smaller teams, and the right answer for most projects.
> **One-page.** The whole game on a page, usually heavily diagrammed. Best used early, as
> a forcing function for clarity. If it does not fit on a page you probably do not know
> what the game is yet, which is useful information.
> **Pitch document.** Two to ten pages aimed at publishers or funders. A different
> audience and a sales shape, and not a design document. Confusing the two produces a
> design doc that oversells and a pitch that bores.
> **The real test.** Who reads this, how often, and what decision does it change? A
> document nobody reads is not documentation, it is a record of what you believed once.

**Ask yourself:**
* Who reads each of my documents, and when did they last do so?
* Is my design doc currently true?

## 7. Specialised disciplines

The sub-fields with their own literatures.

**Focus:** What does each specialisation know that generalists do not?

**Learn:**
* [Daniel Cook: Game Grammar and Chemistry](https://lostgarden.com/): systems and loop design.
* [Steve Lee: Holistic Level Design](https://www.gdcvault.com/): level design principles.
* Steve Swink, *Game Feel*; Emily Short's blog for narrative design.

**Practice:** Pick the discipline your project most depends on and go deep on it for a
week. Then write down three things you had been doing wrong.

**Self-check:** you can name what each discipline contributes and identify which one your
project most needs.

> [!question]- Answer
> **Systems design.** Loop diagrams, feedback graphs, balance spreadsheets. The core
> insight is that a game is a set of interacting feedback loops, and that most balance
> problems are loop problems rather than number problems. Changing a number treats the
> symptom.
> **Level design.** Grey-box first and polish last, with sightlines, leading, and encounter
> pacing as the actual craft. Leading means guiding the player's attention without
> instruction, through light, contrast, and composition.
> **Narrative design.** Branching against converging structures, environmental
> storytelling, and the discipline of writing for a medium where the player controls
> pacing. The hard constraint is that branches multiply cost and most branches are never
> seen.
> **Combat design.** Game feel, verb-noun decomposition, and the punctuation of an
> exchange. Church's formal abstract design tools framing of intention and perceivable
> consequence is the useful lens: a player forms an intention, acts, and must be able to
> perceive the result. Combat that feels bad usually breaks the third.
> **Why this matters for a generalist.** On a small team you are all of these. Knowing
> which specialisation owns a given problem is how you find the right literature instead
> of reinventing it badly.

**Ask yourself:**
* Which discipline does my game depend on most, and how much have I actually read about it?
* Is my balance problem a number or a loop?

## 8. Context fit

Where methodologies assume a context you do not have.

**Focus:** What does each scale of studio actually do? What breaks when you port a
methodology down to solo?

**Learn:** GDC postmortems from studios at each scale. The gap between what a talk claims
and what the postmortem admits is the useful part.

**Practice:** Write down the context each methodology from sections 4 through 7 assumes:
team size, funding, deadline, and who absorbs process failure. Mark which assumptions are
false for you.

**Self-check:** you can characterise practice at each studio scale and name which
assumptions fail in your context.

> [!question]- Answer
> **AAA.** Teams of fifty to several hundred, cycles of two to five years, publisher
> milestones, and specialised roles where combat, level, narrative, and systems design are
> different people. Often waterfall in practice despite Scrum branding, because milestone
> contracts do not bend.
> **AA and mid-sized indie.** Ten to fifty people, one to three year cycles, hybrid agile
> and milestone, generalist designers, lean documentation.
> **Small indie.** Two to eight people, tight iteration, daily playtests, often
> self-published. Methodology choice has outsized effect here because there is no producer
> absorbing process failure. When the process is wrong, you feel it directly.
> **Solo.** Methodology is almost entirely about you: your discipline, your scope cuts,
> and your motivation through the long middle. Most published methodology assumes
> coordination problems you do not have and ignores the motivation problem that is your
> actual constraint. Game jams work as a methodology school precisely because they compress
> the whole cycle into something you can finish.
> **What breaks porting down.** Anything requiring a room of people, a facilitator, or
> stakeholder alignment. Sprint demos lose their point with no audience. Milestones lose
> their force with no publisher. What survives is prototyping, blind playtesting, pillars,
> and objective phase criteria, because those work on one person.

**Ask yourself:**
* Which of my process steps exists because a book said so rather than because it helps?
* What is my actual constraint, and does my methodology address it at all?

## 9. Your own process

The deliverable the path exists for.

**Focus:** What phases does your process have, and what are the objective criteria for
leaving each?

**Learn:** Reread your own notes from sections 1 through 8. The refusals you wrote are the
raw material.

**Practice:** Write your methodology: vision, pillars, phase structure with entry and exit
criteria, deliverables per phase, and your personal anti-patterns. Then run a real project
through it and revise what did not survive.

**Self-check:** you have a written process with objective criteria, you have used it, and
you can say what you took from each school and what you refused.

> [!question]- Answer
> There is no correct answer, which is the point. What separates a useful process document
> from a decorative one:
>
> **Objective, observable exit criteria.** "The prototype is fun" is not a criterion.
> "Three blind testers played for twenty minutes unprompted and two asked to continue" is.
> If you cannot observe it, it will be decided by how tired you are that week.
> **Named refusals.** "I am not doing vertical slices, because I have no publisher to show
> one to and the polish is wasted at this stage" is more useful than silently omitting it.
> **Deliverables with a reader.** For each artefact: who writes it, who reads it, and how
> long it stays current. An artefact with no reader gets skipped under pressure, correctly.
> **Your personal anti-patterns.** The things you specifically do wrong: scope creep in a
> particular direction, polishing to avoid a hard decision, starting a second project at
> month four. A methodology that does not name your own failure modes will not prevent
> them.
> **It survived a real project.** A process written and never applied is a wish. The
> revision after first contact is where it becomes yours, and the second revision is where
> it becomes true.

**Ask yourself:**
* Which phase criterion would I fudge if I were tired, and how do I make that harder?
* What do I do consistently that no methodology told me to do?

## Capstone

Run one complete small project through your own process, from concept to ship, recording
where the process held and where you went around it. A game jam is the cheapest way to get
a full cycle.

Then revise the process. The going-around-it list is the most valuable output.

## Self-assessment checklist

- [ ] I can apply MDA to a real game and name its aesthetic targets.
- [ ] I can characterise each major school's strength and weakness.
- [ ] I can write design pillars that actually reject features.
- [ ] I can choose a production methodology and name the failure it prevents.
- [ ] I can run a blind think-aloud test without contaminating it.
- [ ] I can choose a documentation format by audience and keep it true.
- [ ] I can name what each specialised discipline contributes.
- [ ] I can identify which methodology assumptions fail in my context.
- [ ] I have a written process with objective criteria that survived a real project.
