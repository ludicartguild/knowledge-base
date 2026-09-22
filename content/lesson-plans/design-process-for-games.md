---
title: "Design Process for Games"
tags: [lesson-plan, game-dev, design]
level: fundamentals
type: moc
reviewed: 2026-09-22
---

A path from "I know what I like" to a written, tested process for making design
decisions on your own project. The destination is not naming typefaces or reciting the
rule of thirds, it is a repeatable method you trust when the screen is blank.

Two honest framings before you start. This is **informed creator** depth, not
professional designer depth: enough to make smart choices and lead the design work on a
small project, not enough to hire yourself out. And design is learned by doing. Reading
these sections without producing the practice work leaves you with confident vocabulary
and shallow skill.

## Objectives

By the end of this path you can:

* Name the principles operating in any composition and say which one is being violated.
* Build a colour palette that holds up in greyscale and passes contrast checks.
* Pair and scale type deliberately rather than by feel.
* Design an icon set that reads at a glance and stays internally consistent.
* Lay out a screen on a grid and direct where the eye lands first.
* Run a usability pass on your own work without lying to yourself.
* Grey-box a level and talk about game feel in specific terms.
* Compare the major design methodologies and write your own process from the parts that fit.

## Prerequisites

Any drawing or image tool you already have. Figma is free and enough for everything here.
No prior design training assumed.

## How to use this path

Work in order. The later sections assume the vocabulary of the earlier ones. Each section
follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read or watch.
* **Practice:** make something. This path rewards doing and punishes skimming.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

> [!tip]
> Keep every practice artefact, even the bad ones. Section 10 asks you to look back
> across them, and a record of your own early work is more instructive than any example
> someone else made.

## 1. What design actually is

Separating the disciplines people collapse into one word.

**Focus:** What is the difference between visual, graphic, UX, UI, interaction, game, and
service design? Which of them are you actually doing on your project?

**Learn:**
* [IDEO: design thinking](https://designthinking.ideo.com/): the origin of the framing most of the industry uses.
* [Nielsen Norman Group: UX vs UI](https://www.nngroup.com/articles/definition-user-experience/): the clearest short treatment of the distinction.

**Practice:** Take one screen from a game you admire. Write a sentence for each
discipline describing what it contributed to that screen. Where a discipline contributed
nothing, say so.

**Self-check:** you can distinguish the design disciplines and place your own project's
needs among them.

> [!question]- Answer
> **Visual design** is the surface: colour, type, imagery, and the feel they produce.
> **Graphic design** is communication through visual means, usually static and usually
> in service of a message.
> **UI design** is the specific surface a person touches: the controls, their states,
> their arrangement. **UX design** is the whole experience of getting something done,
> most of which is not visible and some of which is not on a screen at all.
> **Interaction design** is the behaviour between the two: what happens when you press
> the thing, and how the system answers.
> **Game design** is the rules and systems that produce play. It overlaps with all of the
> above and is not a subset of any of them.
> **Service design** is the whole journey across touchpoints and over time, including the
> parts that are email, support, and other humans.
>
> On a solo game project you are doing game design, UI, visual, and interaction design,
> usually in the same afternoon. Naming which one you are doing at a given moment is what
> stops you polishing pixels when the rules are the problem.

**Ask yourself:**
* When I say a design "feels off", which discipline is the complaint actually about?
* Which of these am I avoiding because it is less fun than the others?

## 2. Principles of design

The small set of ideas that explain why a composition works.

**Focus:** What are balance, contrast, hierarchy, alignment, repetition, proximity, and
white space? Given a layout that feels wrong, which principle can you name as the cause?

**Learn:**
* [Canva Design School: design principles](https://www.canva.com/learn/design-elements-principles/): a practical, example-heavy introduction.
* *The Non-Designer's Design Book* by Robin Williams: the shortest useful book on this, built around four principles.

**Practice:** Find three interfaces you think are badly designed. For each, name the
principle being violated and produce a corrected version. The correction matters more
than the diagnosis.

**Self-check:** you can name the principles operating in a composition and identify which
one is being violated in a bad one.

> [!question]- Answer
> **Balance** is visual weight distributed across the composition: symmetric, asymmetric
> where size or colour compensates, or radial around a centre.
> **Contrast** is difference that draws attention, whether in size, colour, value, weight,
> or shape. Insufficient contrast is why a design reads as flat and muddy.
> **Hierarchy** tells the viewer what matters most, and in what order. "I don't know where
> to look" is always a hierarchy failure.
> **Alignment** is the invisible lines organising elements, and is the single biggest
> visual difference between amateur and professional work.
> **Repetition** builds consistency and rhythm, which is what turns a set of screens into
> a system.
> **Proximity** groups related items and separates unrelated ones. It is the cheapest way
> to communicate that things belong together.
> **White space** is a tool, not leftover room. Used deliberately it creates focus and
> calm.
> **Unity** is the overall coherence, achieved by repeating colour, type, and shape
> language consistently.
>
> The diagnostic habit worth building: when something feels wrong, walk the list rather
> than nudging elements until it stops bothering you.

**Ask yourself:**
* Which principle do I habitually neglect, and what does my work look like as a result?
* Can I state the hierarchy of this screen in one sentence, first to last?

## 3. Colour

Treating colour as three controllable dimensions rather than a matter of taste.

**Focus:** What are hue, saturation, and value, and which one should you reach for in a
given situation? How do you check a palette for accessibility before you have built
anything?

**Learn:**
* [Refactoring UI: colour](https://www.refactoringui.com/): the most practical treatment of building a palette you can actually use.
* [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/): the standard tool for verifying contrast ratios.
* [Coolors](https://coolors.co/): fast palette generation, useful for exploring rather than deciding.

**Practice:** Build a palette for an imagined game: one primary, one accent, and a
neutral ramp of five steps. Convert it to greyscale and confirm the hierarchy still
reads. Then check every text pairing against WCAG AA.

**Self-check:** you can build a palette that survives greyscale and passes contrast
checks, and you can explain why most beginner palettes look muddy.

> [!question]- Answer
> **The three dimensions.** Hue is the colour itself, saturation is its intensity, value
> is its lightness. Reason in HSL and convert to RGB at the end, because HSL is the model
> where the three are independent and adjustable.
> **Why beginner palettes look muddy.** They vary hue while holding saturation and value
> constant. The colours then carry identical visual weight, so nothing stands out and the
> whole thing reads as a smear. The fix is to vary value first.
> **Why greyscale is the test.** Stripping hue leaves only value, which is what carries
> hierarchy. If the important element stops being obvious in greyscale, the design was
> relying on colour to do a job colour cannot do alone.
> **Accessibility.** Around 8% of men have some colour vision deficiency, so colour must
> never be the only channel carrying meaning. WCAG AA wants 4.5:1 for body text and 3:1
> for large text. Check it before you build, not after.
> **Schemes.** Complementary, split-complementary, analogous, triadic, and tetradic are
> starting points for exploration, not rules that make a palette good.

**Ask yourself:**
* If I removed all colour from this screen, would anyone still know what to do?
* Am I using colour to communicate, or to decorate?

## 4. Typography

Type as a system rather than a font choice.

**Focus:** What is the vocabulary for describing type? How do you pair two typefaces and
build a scale? What changes when type has to render in a game engine?

**Learn:**
* [Practical Typography by Matthew Butterick](https://practicaltypography.com/): opinionated, correct, and free to read.
* [Type Scale](https://typescale.com/): generates a modular scale you can paste into a project.
* [Google Fonts](https://fonts.google.com/): free, well-covered families, with language support filters that matter if you localise.

**Practice:** Pick a heading and body pairing for a game UI and build a type scale at a
single ratio. Set a paragraph, a heading, and a button label with it. Then set the same
content at a second ratio and decide which you prefer and why.

**Self-check:** you can pair typefaces deliberately, build a scale, and explain the
difference between legibility and readability.

> [!question]- Answer
> **Anatomy.** Baseline, x-height, cap height, ascender, descender, counter, stroke,
> terminal, serif. You need these to say what is wrong with a typeface rather than that
> it feels wrong.
> **Pairing.** Most projects need two: something characterful for headings and something
> highly legible for body. Match them by historical era or contrast them clearly by
> category. Two faces that are slightly different read as a mistake rather than a choice.
> **Scale.** Pick one ratio (1.25 and 1.333 are safe) and derive every size from it. A
> coherent scale is why professional work looks intentional at sizes nobody consciously
> notices.
> **Legibility against readability.** Legibility is whether a letter can be recognised.
> Readability is whether a block of text is comfortable to read at length. A display face
> can be highly legible and completely unreadable in paragraphs.
> **Spacing.** Leading of 1.4 to 1.6 times the font size is a safe baseline for body text.
> Tracking is uniform letter spacing; kerning adjusts specific pairs.
> **In games.** Screen rendering needs pixel hinting or distance-field text to stay crisp
> when scaled. Localisation constrains your choice hard, since Latin, CJK, and
> right-to-left scripts need coverage your display face probably lacks. In-world type on
> signs and books is usually a different face from UI type entirely.

**Ask yourself:**
* Is this typeface doing work, or did I pick it because it looked nice in the specimen?
* Will this still be readable at the smallest size it appears, on the worst screen?

## 5. Iconography

Small pictures that have to work without a caption.

**Focus:** What makes an icon read at a glance? What holds an icon set together as a
system? When is diverging from convention worth the cost?

**Learn:**
* [The Noun Project](https://thenounproject.com/): enormous reference library, useful for seeing how a concept is conventionally drawn.
* [Material Symbols guidelines](https://m3.material.io/styles/icons/overview): a thorough public specification of how a large icon system stays consistent.

**Practice:** Design a six-icon set for a game HUD on a 24 by 24 grid: health, inventory,
map, settings, save, quit. Hold stroke weight, corner radius, and level of detail
constant across all six. Then show them to someone without labels and see how many they
name correctly.

**Self-check:** you can design an icon set that reads without labels and stays visually
consistent, and you can say why a given icon fails.

> [!question]- Answer
> **Conceptual clarity.** The icon has to signal its meaning instantly. Generic shapes
> say nothing, so you need a recognisable object or action. If it needs a label to work,
> it has failed as an icon, though a label may still be the right answer.
> **Style consistency.** Every icon in a system shares stroke weight, corner radius, fill
> style, level of detail, and perspective. Mixing any of those is what makes a set read as
> assembled rather than designed.
> **Grid and pixel fitting.** Design on a grid, commonly 24, 32, or 48 square. Sub-pixel
> alignment is the usual cause of an icon looking fuzzy for reasons nobody can name.
> **Convention.** Magnifying glass means search, gear means settings, house means home,
> heart means favourite or health. These are load-bearing. Diverging costs you
> comprehension, so do it only when you gain something specific in return.
> **In games.** Ability icons have to be distinguishable at speed and under stress, often
> at small sizes in a crowded bar. That pushes you toward strong silhouette differences
> rather than fine detail.

**Ask yourself:**
* Would a stranger name this icon correctly with no label and no context?
* Is my set consistent, or does it just use the same colour?

## 6. Layout and composition

Arranging a screen so the eye goes where you want it.

**Focus:** What does a grid buy you? Where does the eye land first, and how do you
control that? What is visual weight?

**Learn:**
* [Material Design: layout](https://m3.material.io/foundations/layout/understanding-layout/overview): grids, spacing, and responsive behaviour, specified in detail.
* [Nielsen Norman Group: F-pattern reading](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/): the eye-tracking evidence behind the scanning patterns.

**Practice:** Lay out a game main menu and a pause screen on an 8-point grid. Mark where
you intend the eye to land first, second, and third. Show it to someone and ask them
what they noticed in what order.

**Self-check:** you can lay out a screen on a grid and direct the viewer's attention
deliberately.

> [!question]- Answer
> **Grids.** Column grids suit text and classical layout, modular grids with rows and
> columns suit dashboards, baseline grids anchor vertical rhythm to type. Pick one and
> subdivide it rather than mixing.
> **The 8-point grid.** All spacing and sizing in multiples of 8. Easy to hold in your
> head, internally consistent, and scales cleanly across densities. The reason it is
> everywhere is that it removes a hundred small arbitrary decisions.
> **Where the eye goes.** The rule of thirds puts focal points at the intersections of a
> three by three division. Z-pattern describes scanning of sparse pages, F-pattern
> describes text-heavy ones, and the Gutenberg diagram weights top-left and bottom-right
> for anything. Use them to place the thing you want pressed.
> **Visual weight.** Larger, darker, more saturated, and more isolated elements pull more
> attention than smaller, lighter, less saturated, surrounded ones. Isolation is the most
> underused of the four.
> **The golden ratio.** Real, recurring, and substantially oversold. Treat it as one
> proportion among several rather than a law of nature.
> **HUD layout.** Screen corners and edges are cheap to glance at and expensive to
> cross. Put persistent information where a glance reaches it and the action does not.

**Ask yourself:**
* Did the viewer's eye go where I intended, or where the brightest thing was?
* What could I remove from this screen without losing anything?

## 7. UX foundations

Designing for what people do rather than what you assume.

**Focus:** What is a user flow and how do you draw one? What are the usability heuristics
and how do you apply them to your own work? What makes onboarding work?

**Learn:**
* [Nielsen Norman Group: 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): the standard checklist, still the most useful single page in the field.
* *The Design of Everyday Things* by Don Norman: affordances, signifiers, and why the door you push is badly designed.

**Practice:** Draw the flow for a player launching your game and reaching the first
meaningful choice. Mark every point where they could get confused or drop out. Then run
the ten heuristics against one of your own screens and write down every violation you
find.

**Self-check:** you can draw a user flow, apply the heuristics to your own work, and
explain what an affordance is.

> [!question]- Answer
> **Flows.** A user flow is the sequence of screens and decisions between an intention
> and its completion. Drawing one exposes the steps you had been mentally skipping, which
> is almost always where players drop out.
> **Heuristics.** Nielsen's ten cover visibility of system status, match to the real
> world, user control and freedom, consistency, error prevention, recognition over
> recall, flexibility, minimalist design, error recovery, and help. Their value is that
> they are a checklist you can run alone, which is exactly what a solo developer needs.
> **Affordances and signifiers.** An affordance is what an object makes possible. A
> signifier is the visible cue telling you so. A door handle affords pulling; a flat
> plate signifies pushing. Most interface confusion is a signifier problem, not an
> affordance problem.
> **Recognition over recall.** Showing options costs screen space and saves the player
> memory. Hiding them costs memory and saves space. Players under pressure have no memory
> to spare.
> **Onboarding.** Teach one thing at the moment it is first needed rather than all things
> at the start. A tutorial the player reads before they have a problem is one they have
> already forgotten.

**Ask yourself:**
* Where in this flow would a first-time player stop and think, and is that deliberate?
* Am I testing this, or am I imagining how someone else would use it?

## 8. Game-specific design

The parts that have no equivalent outside games.

**Focus:** What is grey boxing and why do it before art? What is game feel made of? What
does MDA give you that other frameworks do not?

**Learn:**
* [MDA: A Formal Approach to Game Design](https://users.cs.northwestern.edu/~hunicke/MDA.pdf): the original paper, short and worth reading directly.
* [Game Maker's Toolkit](https://www.youtube.com/@GMTK): the most consistently rigorous public analysis of level design and game feel.
* *Game Feel* by Steve Swink: the book-length treatment of why control feels good or bad.

**Practice:** Grey-box one level or one encounter using untextured primitives. Play it.
Adjust the spaces until it works with no art at all. Then write down three specific
things you would change about the game feel and what you would tune to get them.

**Self-check:** you can grey-box a space and talk about game feel in specific, tunable
terms rather than as a vibe.

> [!question]- Answer
> **Grey boxing.** Building the level in untextured primitives so you can test spatial
> decisions before committing art. It is the cheapest possible iteration loop, and the
> reason to do it first is that art makes a bad layout expensive to change and
> emotionally harder to abandon.
> **Game feel.** Made of concrete, tunable things: input responsiveness and buffer
> windows, acceleration and friction curves, animation timing, camera behaviour and
> shake, hit pause, sound and haptic response. "It feels floaty" is a symptom; the cause
> is one of those numbers.
> **MDA.** Mechanics are the rules, dynamics are the behaviour that emerges when people
> play them, aesthetics are the experience that produces. The value is directional: you
> design mechanics but players experience aesthetics, so you are always working
> backwards from a feeling through behaviour you cannot fully control.
> **Mood boards and style guides.** The board fixes the target before production; the
> guide keeps a team, or a future you, consistent with it. On a solo project the guide
> matters most in month six, when you no longer remember what you decided in month one.

**Ask yourself:**
* Am I adding art because the design is finished, or because the design is hard?
* If this feels wrong, which specific number would I change first?

## 9. Design methodologies

The named processes, taken on their own terms.

**Focus:** What does each of the major methodologies actually prescribe? Which parts
survive contact with a one-person project?

**Learn:**
* [Design Council: the Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/): diverge, converge, twice, with the discovery phase that most people skip.
* [IDEO design thinking](https://designthinking.ideo.com/): empathise, define, ideate, prototype, test.
* [Lean UX](https://www.jeffgothelf.com/blog/): assumption-driven, built around validating before building.

**Practice:** Take one design problem from your project and run it through the Double
Diamond properly, including the discovery half you will want to skip. Write down what
the process surfaced that you would otherwise have missed, and what it cost you in time.

**Self-check:** you can compare the major methodologies on their own terms and say which
parts fit a solo project and which are overhead.

> [!question]- Answer
> **Double Diamond.** Diverge to explore the problem, converge to define it, diverge to
> explore solutions, converge to deliver. The insight most people miss is that the first
> diamond is about the problem, and skipping it is how you build a well-executed answer
> to the wrong question.
> **Design Thinking.** Empathise, define, ideate, prototype, test. Strongest on the
> empathise step, which forces contact with actual users. Weakest in that it can become
> workshop theatre when nobody intends to act on what it surfaces.
> **Lean UX.** State assumptions explicitly, build the smallest thing that tests one, and
> let the result decide. Fits solo work well because it is cheap and because it makes the
> gamble visible.
> **What survives solo.** The discovery half of the first diamond, because it is where
> the expensive mistakes get avoided. Explicit assumptions, because you have nobody to
> argue with. And a real prototype test with one stranger, which is worth more than any
> amount of self-review.
> **What does not.** Anything requiring a room of people, a facilitator, or stakeholder
> alignment. Naming that honestly is more useful than pretending to run the full method.

**Ask yourself:**
* Which methodology am I drawn to, and is that because it fits or because it flatters me?
* What would I have to stop doing to actually follow one of these?

## 10. Your own process

The deliverable the rest of the path exists to produce.

**Focus:** What decisions does your process need to make, and when? What gates does it
have? What do you produce at each stage?

**Learn:** Reread your own practice artefacts from sections 1 through 9. They are the
evidence for what you actually do rather than what you would like to do.

**Practice:** Write your design process as a document. It needs a vision statement, the
principles you will hold, the deliverables each stage produces, the review points, and
the gates that stop you proceeding. Then apply it to a real decision and revise it where
it did not survive contact.

**Self-check:** you have a written process, you have used it on something real, and you
can say which parts of which methodologies you took and which you refused.

> [!question]- Answer
> There is no correct answer here, which is the point. What distinguishes a useful
> process document from a decorative one:
>
> **It names refusals.** "I am not doing personas, because I am one person making a game
> for people like me and the cost exceeds the information" is more useful than silently
> omitting them.
> **It has gates, not just stages.** A gate is a condition that stops you moving on. "No
> art until the grey box plays well" is a gate. "Grey boxing phase" is only a label.
> **It says what gets produced.** A stage that produces no artefact cannot be checked and
> will be skipped under pressure.
> **It survived a real decision.** A process written and never applied is a wish. The
> revision after first contact is where it becomes yours.
>
> If your document looks like a shortened version of the Double Diamond, you have
> probably not yet found where your own work differs from the general case. That usually
> comes after the second or third real application.

**Ask yourself:**
* Which part of my process will I abandon first when a deadline arrives, and what does that tell me?
* What do I do consistently that no methodology told me to do?

## Capstone

Take one screen or one level of your own project from blank page to finished, using your
own process and documenting each stage as you go. Keep the grey box, the rejected
palettes, and the flow sketches alongside the final version.

The artefact is not the screen. It is the record of how you got there, which is the only
thing that transfers to the next one.

## Self-assessment checklist

- [ ] I can name the design disciplines and say which ones my project needs.
- [ ] I can identify the principle being violated in a composition that feels wrong.
- [ ] I can build a palette that holds up in greyscale and passes contrast checks.
- [ ] I can pair typefaces and build a scale, and explain legibility versus readability.
- [ ] I can design an icon set that reads without labels.
- [ ] I can lay out a screen on a grid and control where the eye lands.
- [ ] I can draw a user flow and run the usability heuristics against my own work.
- [ ] I can grey-box a space and describe game feel in tunable terms.
- [ ] I can compare the major methodologies and say what fits solo work.
- [ ] I have a written design process that I have applied to something real.
