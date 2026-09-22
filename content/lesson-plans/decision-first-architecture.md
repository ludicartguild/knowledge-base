---
title: "Decision-First Software Architecture"
tags: [lesson-plan, architecture]
level: deep
type: moc
reviewed: 2026-09-22
---

Architecture as a sequence of decisions with named tradeoffs, rather than a catalogue of
patterns to recognise. The test of this path is not whether you can define CQRS, it is
whether you can say when not to use it and what it costs when you do.

Each section ends with a decision lens: the questions an architect should be able to
answer out loud, in a room, without preparation. Those are the self-checks.

## Objectives

By the end of this path you can:

* Name the principle being violated in a design and the cost it imposes over time.
* Choose an architectural style for a specific context and defend it against the alternative.
* Find bounded contexts in a real domain and justify where you put the boundaries.
* Explain what CQRS buys and what it costs, including to a non-technical stakeholder.
* Decompose a system by domain rather than by technical layer, and know when not to.
* Choose between synchronous and asynchronous communication with concrete reasons.
* Design a saga, solve the dual-write problem, and make operations idempotent.
* Work a system design problem systematically without reaching for technology first.

## Prerequisites

Several years writing software, and ideally the experience of having maintained something
you designed. The material assumes you have felt at least one of these problems rather
than only read about it.

## How to use this path

Work in order. Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** the notes to read.
* **Practice:** apply it to a system you actually know.
* **Self-check:** the decision lens. Answer these out loud before expanding the answer.
* **Answer:** collapsed.
* **Ask yourself:** heuristics that test judgement rather than recall.

> [!tip]
> The decision lenses are written as "can I explain" rather than "do I know" deliberately.
> If you cannot say it out loud to another person, you do not have it yet.

## 1. Foundations

The principles, and what violating each one actually costs.

**Focus:** What do the principles protect against? What is the practical difference
between coupling and cohesion?

**Learn:**
* [[software-architecture-map|Software architecture map]]: the territory.
* [[solid|SOLID]], [[grasp|GRASP]], [[dry|DRY]], [[kiss|KISS]], [[yagni|YAGNI]].
* [[coupling-and-cohesion|Coupling and cohesion]], [[encapsulation|Encapsulation]], [[composition-over-inheritance|Composition over inheritance]].
* [[cap-theorem|CAP theorem]].

**Practice:** Take a codebase you maintain and find one concrete violation of each
principle. For each, write the specific cost it has already imposed, not the cost it
theoretically could.

**Self-check:**

* Can I identify which design principle is being violated in a given design and name the specific cost it imposes over time?
* Can I explain the difference between coupling and cohesion, and their practical effect on a codebase I have worked in?
* Can I choose between composition and inheritance and give a concrete, non-trivial reason?
* Can I state CAP Theorem and explain what it means for a system that needs both availability and consistency?

> [!question]- Answer
> **Principles and their costs.** Every principle is a bet about what will change. Single
> responsibility bets that reasons to change will diverge; violating it means unrelated
> changes collide in one file. Open-closed bets that extension is more common than
> modification. Liskov violations mean a subtype surprises its callers, which surfaces as
> a bug far from the class. Interface segregation violations force implementors to stub
> methods they do not need. Dependency inversion violations mean your domain cannot be
> tested without the database.
> **Coupling and cohesion.** Coupling is how much one module must know about another;
> cohesion is how much the contents of one module belong together. They trade against each
> other badly if you optimise one alone: splitting aggressively lowers cohesion and raises
> coupling. The practical signal is how many files you touch for one conceptual change.
> One is healthy, seven means low cohesion, and two in different services means high
> coupling across a boundary that should not exist.
> **Composition against inheritance.** Inheritance couples you to a supertype's
> implementation forever and is a single axis of variation. Composition costs more typing
> and stays flexible. The non-trivial reason to inherit is when the relationship is
> genuinely is-a and stable, and when you control both sides. The usual mistake is
> inheriting for code reuse, which is what produces hierarchies nobody can modify.
> **CAP.** Under a network partition you must choose between consistency and availability.
> The honest reading is that partitions are not optional, so the real choice is what you do
> during one. A system needing both is really choosing where to put each: strong
> consistency on the small set of operations that require it, availability everywhere
> else. Saying "we need CP and AP" means the boundaries have not been drawn yet.

**Ask yourself:**
* Which principle do I cite most and follow least?
* For my system, what actually happens during a partition, and did anyone decide that?

## 2. Structure

Styles, and the rule that distinguishes them.

**Focus:** What is the dependency rule? When does Clean Architecture earn its ceremony?

**Learn:**
* [[hexagonal-architecture|Hexagonal architecture]]: ports and adapters.
* [[inversion-of-control|Inversion of control]] and [[repository-pattern|Repository pattern]].
* [[web-app-architecture|Web app architecture]].

**Practice:** Take one service and draw its actual dependency graph. Mark every arrow
pointing the wrong way. Then pick one and invert it.

**Self-check:**

* Given a greenfield service, can I choose between Clean Architecture and Vertical Slice and explain why one fits that context?
* Can I state the dependency rule precisely and describe what breaks, and where, when it is violated?
* Can I make a credible case for a Modular Monolith to an audience that defaults to distributed systems?
* Can I read an unfamiliar codebase and identify which architectural style it follows, if any?

> [!question]- Answer
> **The dependency rule.** Source code dependencies point inward, toward higher-level
> policy. The domain knows nothing about the database, the framework, or the transport.
> When it is violated, the symptom is that you cannot test business logic without standing
> up infrastructure, and the cost is that every infrastructure change becomes a domain
> change.
> **Clean against Vertical Slice.** Clean organises by layer and is strongest when the
> domain is rich and long-lived and many features share it. Vertical Slice organises by
> feature, putting everything one use case needs together, and is strongest when features
> are largely independent and the domain is thin. Clean's cost is indirection for simple
> operations; Vertical Slice's cost is duplication and drift across slices. Greenfield
> with an unclear domain usually favours slices, because they are easier to reorganise
> once you learn what the domain actually is.
> **Modular Monolith.** One deployable, hard internal module boundaries, no network
> between them. The case is that you get most of the design benefit of services with none
> of the distributed systems cost, and that you can extract a module later once the
> boundary has proven itself. The argument that lands with a distributed-by-default
> audience is that you cannot fix a wrong service boundary cheaply, and you can fix a
> wrong module boundary in an afternoon.
> **Reading an unfamiliar codebase.** Look at the dependency direction and at what the
> top-level folders are named. Folders named for layers mean layered or clean; folders
> named for features mean slices; folders named for technical concerns with dependencies
> everywhere mean no style at all, which is the most common answer.

**Ask yourself:**
* Can I test my business rules without a database running? If not, where is the arrow wrong?
* Would extracting a service from my system be a weekend or a quarter?

## 3. Domain modelling

Finding the boundaries the business already has.

**Focus:** How do you find a bounded context? What distinguishes entity, value object, and
aggregate?

**Learn:**
* [[anti-corruption-layer|Anti-corruption layer]]: protecting a model from a neighbour's.
* [[specification-pattern|Specification pattern]] and [[repository-pattern|Repository pattern]].

**Practice:** Map the bounded contexts of a business domain you know. For each boundary,
write down the language signal and the ownership signal that justified putting it there.

**Self-check:**

* Can I identify bounded contexts in a real domain and justify the boundaries, citing the language and ownership signals I used?
* Can I distinguish entity, value object, and aggregate, and explain the invariant rules governing each?
* Can I explain when an anemic domain model is acceptable and when it becomes a liability?
* Could I facilitate an Event Storming session and turn the output into a context map?

> [!question]- Answer
> **Finding contexts.** The reliable signal is language: the same word meaning different
> things to different people marks a boundary. "Customer" in billing is an account with a
> payment method; in support it is a person with a history. Forcing one model to serve
> both produces a class with thirty fields, two thirds null at any time. The second signal
> is ownership: who decides when this changes.
> **Entity, value object, aggregate.** An entity has identity that persists through change
> and is the same thing tomorrow. A value object has no identity and is defined entirely by
> its attributes, so it should be immutable and compared by value. An aggregate is a
> cluster with one root, and the root is the only entry point. The invariant rule is that
> an aggregate is the consistency boundary: everything inside is consistent within one
> transaction, and everything across aggregates is eventually consistent. Aggregates drawn
> too large make contention; too small make invariants unenforceable.
> **Anemic models.** A model with data and no behaviour, with logic in services. It is
> acceptable when the domain genuinely has no rules, such as a CRUD admin screen or a
> reporting read model. It becomes a liability when rules exist but live in services,
> because the same rule then gets implemented slightly differently in three places and
> nothing prevents an invalid object from existing.
> **Event Storming.** Put domain events on a wall in time order, then add commands,
> actors, and policies, and let clusters emerge. The clusters are candidate aggregates and
> the seams between them are candidate contexts. Facilitating it well means keeping domain
> experts talking and engineers from jumping to schemas, which is the part that actually
> requires practice.

**Ask yourself:**
* Which word in my domain means two things, and have I modelled that or papered over it?
* Which of my aggregates is large because of a real invariant, and which because it was convenient?

## 4. Commands and queries

Splitting the two, and paying for it.

**Focus:** What does CQRS actually buy? How do you explain eventual consistency to
someone who will feel it?

**Learn:**
* [[cqs|Command query separation]] and [[command-pattern|Command pattern]].
* [[mediator-pattern|Mediator pattern]], [[async-data-access|Async data access]].

**Practice:** Take one feature and write down what its read and write models would look
like separated. Then write the sentence you would say to a product owner about what a
user will see in the gap.

**Self-check:**

* Can I explain what CQRS gains and articulate the specific complexity cost?
* Can I design an eventually consistent system and explain the tradeoffs to a non-technical stakeholder, including real-world consequences?
* Can I describe how CQRS and DDD reinforce each other, and where you would use one without the other?

> [!question]- Answer
> **What CQRS buys.** Reads and writes usually have different shapes, different scaling
> needs, and different consistency requirements. Separating them lets each be optimised:
> a normalised write model enforcing invariants and a denormalised read model shaped for
> the screen. It also lets you scale reads independently, which is the common practical
> driver.
> **The cost.** Two models to keep in sync, a synchronisation mechanism that can fail or
> lag, and the whole class of bugs where a user performs an action and does not see it
> reflected. That last one is not a technical cost, it is a product cost, and it is the
> one that gets underestimated.
> **Explaining eventual consistency.** Do not use the phrase. Say: "after they click save,
> there is a window, usually under a second, where the list might still show the old
> value. If they refresh immediately they may see it twice or not at all. We can hide that
> by showing their own change locally, but two users looking at the same screen may
> briefly disagree." Then let them decide whether that is acceptable for this screen,
> because sometimes it genuinely is not.
> **With and without DDD.** They reinforce each other because an aggregate is already a
> consistency boundary and a natural command target, and because a read model can serve a
> screen without distorting the domain model. But CQRS without DDD is common and fine:
> a reporting read replica is CQRS. And DDD without CQRS is fine wherever one model serves
> both directions adequately. Adopting both because they appear in the same books is how
> teams get ceremony without benefit.

**Ask yourself:**
* Would my users notice the gap, and have I asked them rather than assumed?
* Am I separating reads and writes for a measured reason or an anticipated one?

## 5. Decomposition

The highest-stakes decision on this path.

**Focus:** Where do service boundaries go? When is the answer not to decompose at all?

**Learn:**
* [[backends-bff-and-apis|Backends, BFFs, and APIs]].
* [[anti-corruption-layer|Anti-corruption layer]].

**Practice:** Propose a decomposition for a system you know. Then argue the opposite case
as strongly as you can, and see which survives.

**Self-check:**

* Can I identify service boundaries using domain context rather than technical layers, and name the signals I used?
* Can I explain decomposing by capability against by data ownership, and the consequences of each?
* Can I articulate when not to decompose, with specific signals favouring a Modular Monolith?
* Can I explain what a distributed monolith is and what decisions produce one?

> [!question]- Answer
> **Boundaries follow the domain.** Service boundaries should follow bounded contexts. A
> service organised around "all the database operations" or "all the REST endpoints" is a
> technical slice cutting across domain concerns, and it will need to talk to every other
> service for every operation.
> **Capability against data ownership.** Capability decomposition asks what business
> function this performs. Data ownership asks what this is the system of record for. Both
> are valid lenses and they usually agree; where they disagree, you have found either a
> missing context or a piece of data with two owners, which is itself the problem.
> **When not to decompose.** Signals favouring a modular monolith: the domain is not yet
> understood, the team is small enough to coordinate in one deployable, there is no
> independent scaling requirement, and no part has a genuinely different availability need.
> The cost of a wrong service boundary is enormous and the cost of a wrong module boundary
> is a refactor, so decomposing early spends certainty you do not have.
> **Distributed monolith.** Services that must be deployed together, share a database, or
> call each other synchronously for every operation. You get all the operational cost of
> distribution and none of the independence. The decisions that produce it are decomposing
> before understanding the domain, splitting by technical layer, and sharing a database
> "temporarily".
> **The honest summary.** The most common cause of failed microservice adoption is not
> technology, it is wrong decomposition, and wrong boundaries are catastrophically
> expensive to fix once each is a separate deployable with its own data.

**Ask yourself:**
* Could I deploy any one of my services alone, today, without coordinating?
* Which boundary did I draw from the domain and which from the org chart?

## 6. Communication

How the pieces talk.

**Focus:** Synchronous or asynchronous? Queue or stream?

**Learn:**
* [[async-data-access|Async data access]], [[observer-pattern|Observer pattern]].
* [[reliability-patterns|Reliability patterns]]: timeouts, retries, circuit breakers.

**Practice:** For three real interactions in your system, decide sync or async and write
the tradeoff you accepted. At least one of your current sync calls should probably change.

**Self-check:**

* Can I choose between synchronous and asynchronous communication for a scenario and justify it with concrete tradeoffs?
* Can I explain the difference between a message queue and an event stream, and name a scenario where each is clearly right?
* Can I design a messaging topology and select a broker for a given workload?
* Can I explain when an actor model is more appropriate than async messaging?

> [!question]- Answer
> **Choosing.** Synchronous when the caller genuinely cannot proceed without the answer
> and the latency budget allows it. Asynchronous when the caller can continue, when the
> work is slow, or when you need the receiver to be able to be down. The trap is that
> synchronous is easier to write and couples availability: a chain of five synchronous
> calls has the product of five availabilities, and it fails whenever any link does.
> **Queue against stream.** A queue delivers each message to one consumer and the message
> is gone once handled, which fits work distribution: send this email, process this job. A
> stream is an append-only log that many consumers read independently at their own
> positions, retaining history, which fits event distribution: this order was placed, and
> three subsystems care. Using a queue where you need a stream means adding a second
> consumer requires changing the producer.
> **Topology.** Topics for publishing events, queues for work, consumer groups for
> parallelism, and dead-letter queues for what fails repeatedly. The dead-letter queue is
> the part people omit and then discover during an incident, when a poison message has
> been retried for six hours.
> **Broker choice.** Follows the workload. Ordering guarantees, retention, throughput,
> delivery semantics, and operational burden. Most teams should use the managed option
> their cloud provides unless they can name the specific requirement that rules it out.
> **Actors.** Appropriate when you have many independent stateful entities each processing
> its own messages sequentially, such as a device, a game session, or a user's cart. The
> actor model gives you single-threaded reasoning per entity without locks. It is the wrong
> reach when your state is genuinely shared or when the entity count is small.

**Ask yourself:**
* What is the availability of my longest synchronous call chain, multiplied out?
* Where does a repeatedly failing message go in my system right now?

## 7. Resilience

Designing for the failures you will actually get.

**Focus:** How do you coordinate a transaction across services? What is the dual-write
problem?

**Learn:**
* [[concurrency-and-idempotent-writes|Concurrency and idempotent writes]].
* [[reliability-patterns|Reliability patterns]], [[fail-fast|Fail fast]].
* [[database-migrations|Database migrations]].

**Practice:** Find one place in your system where you write to a database and publish a
message. That is a dual write. Fix it with an outbox.

**Self-check:**

* Can I design a distributed saga and explain choreography against orchestration, including what each makes harder?
* Can I explain the dual-write problem and describe two solutions with their tradeoffs?
* Can I identify where back pressure should be applied and the failure mode without it?
* Can I explain idempotency and how to achieve it for a given operation?

> [!question]- Answer
> **Sagas.** A sequence of local transactions, each with a compensating action, replacing
> a distributed transaction you cannot have. Choreography means each service reacts to
> events with no coordinator, which is loosely coupled and makes the overall flow invisible
> in any one place. Orchestration means a coordinator drives the steps, which makes the
> flow explicit and introduces a component that knows about everyone. Choreography makes
> debugging harder; orchestration makes coupling higher. Choose by whether people need to
> see the whole flow, and they usually do.
> **Dual write.** Writing to two systems without a shared transaction, such as saving to
> the database and publishing to a broker. Either can fail after the other succeeds, so
> the two diverge silently. The transactional outbox solution writes the message into the
> same database transaction as the state change, with a separate process publishing from
> that table; it is simple and adds latency. Change data capture reads the database log
> and publishes from it; it needs no application change and adds infrastructure and
> operational complexity. Both are correct; the outbox is usually the right first move.
> **Back pressure.** Applied where a fast producer meets a slow consumer. Without it,
> queues grow unboundedly until memory or disk runs out, and the failure arrives far from
> the cause and long after it. Bounded queues that reject or block are how you make the
> pressure visible at the point it originates.
> **Idempotency.** The same operation applied twice leaves the same state as once.
> Achieved by making the operation naturally idempotent, setting a value rather than
> incrementing, or by recording an idempotency key the server checks. It is not optional
> anywhere retries exist, which in a distributed system is everywhere.

**Ask yourself:**
* Where do I write to two systems without a transaction, and what happens when the second fails?
* If every message were delivered twice tonight, what would break?

## 8. Scale

Making it faster, and the costs of each option.

**Focus:** Which caching strategy, and why are the others wrong here? How do you pick a
shard key?

**Learn:**
* [[databases|Databases]], [[cap-theorem|CAP theorem]].
* [[reliability-patterns|Reliability patterns]].

**Practice:** Find your slowest real query. Decide whether caching, indexing, or a model
change is the right fix, and write why the other two are not.

**Self-check:**

* Can I choose a caching strategy and explain specifically why each other strategy is wrong for that case?
* Can I explain when to shard and how to choose a shard key that avoids hotspots, with a concrete example?
* Can I design load balancing for a stateful service and explain why it differs from stateless?
* Can I describe the relationship between caching and eventual consistency, and the tradeoffs in a TTL?

> [!question]- Answer
> **Caching strategies.** Cache-aside has the application check the cache and populate on
> miss, which is simple and leaves a window where the cache is stale after a write.
> Read-through puts the cache in front of the store. Write-through writes both
> synchronously, keeping them consistent at the cost of write latency. Write-behind
> acknowledges immediately and flushes later, which is fastest and can lose data. The
> choice follows the read-to-write ratio and how much staleness the feature tolerates.
> **Sharding.** Shard when one node can no longer hold the data or serve the load, and not
> before, because sharding removes cross-shard joins and transactions. A good key
> distributes evenly and keeps data queried together on one shard. Sharding orders by
> customer id works when customers are similar in size and fails badly when one customer
> is a thousand times larger than the rest, which is the classic hotspot. Sharding by a
> hash distributes well and destroys range queries.
> **Stateful load balancing.** Stateless services can go round-robin because any instance
> serves any request. Stateful services need the request to reach the instance holding the
> state, through sticky sessions or consistent hashing. The consequence is that scaling in
> and out redistributes state, and that a lost instance loses something, which is why
> externalising state is usually the better answer.
> **Cache TTL and consistency.** A cache is a deliberate eventual consistency window, and
> the TTL is you choosing how stale you will serve. Short TTLs mean more load and less
> staleness; long TTLs the reverse. The mistake is picking a TTL by feel rather than by
> asking how wrong the data may be before someone is harmed.

**Ask yourself:**
* How stale can this data be before a user is misled, and does my TTL reflect that number?
* Is my slow query slow because of volume, or because of the model?

## 9. Operations

Running it, and seeing inside it.

**Focus:** What does each observability layer catch that the others miss? When is a
service mesh worth it?

**Learn:**
* [[observability-with-opentelemetry|Observability with OpenTelemetry]].
* [[kubernetes-workload-basics|Kubernetes workload basics]], [[testing-strategy|Testing strategy]].

**Practice:** Take a real past incident and work out which of the three signals would have
caught it earliest. Then check whether that signal exists.

**Self-check:**

* Can I design an observability strategy and explain what failure category each layer catches that the others miss?
* Can I explain when a service mesh adds genuine value and when it adds overhead the team pays indefinitely?
* Can I walk through a zero-downtime Kubernetes deployment and describe two things that can go wrong and why?
* Can I explain the three pillars and describe a debugging workflow using all three?

> [!question]- Answer
> **What each layer catches.** Metrics catch aggregate degradation: error rate rising,
> latency drifting, saturation approaching a limit. They will not tell you which request
> or why. Traces catch distributed causation: which hop was slow, which service returned
> the error, what the call graph actually was rather than what you thought. Logs catch
> specifics: the exact input, the exact exception, the state at that moment. A system with
> only logs cannot see trends; with only metrics cannot see causes; with only traces cannot
> see what happened inside a span.
> **The debugging workflow.** An alert fires on a metric. A trace locates which service
> and which hop. Logs for that trace id explain what happened there. Each step narrows,
> and missing any one forces guessing at that step.
> **Service mesh.** Genuine value when you need mutual TLS everywhere, uniform retries,
> timeouts, and traffic shifting across many services in many languages, and you do not
> want that logic in every codebase. Overhead when you have a handful of services in one
> language, because you have added a control plane, a sidecar per pod, and a new failure
> domain to solve a problem a shared library solved.
> **Zero-downtime deploys.** Rolling updates with readiness probes, surge and unavailable
> limits, and graceful shutdown honouring termination grace periods. Two things that go
> wrong: readiness probes that report ready before the service can actually serve, so
> traffic arrives at a cold instance; and shutdown that drops in-flight requests because
> the process exits on SIGTERM without draining. Both produce errors that look like
> application bugs.

**Ask yourself:**
* For my last incident, which signal would have caught it first, and did I have it?
* Does my readiness probe check anything the process cannot fake?

## 10. Systems thinking

Putting it together under pressure.

**Focus:** How do you approach an unfamiliar design problem without reaching for
technology?

**Learn:**
* [[software-architecture-map|Software architecture map]]: revisit it with what you now know.
* [System Design Primer](https://github.com/donnemartin/system-design-primer): the standard practice resource.

**Practice:** Work three system design problems end to end: requirements, capacity
estimates, component design, data model, failure modes. Write each as an ADR someone else
could disagree with.

**Self-check:**

* Given a design challenge, can I work through it systematically without jumping to technology choices?
* Can I choose between SQL and NoSQL, and which type, given specific access patterns and scale, and defend it?
* Can I identify the bottleneck in a proposed design rather than defaulting to horizontal scaling?
* Can I name the tradeoffs in a decision explicitly rather than presenting it as simply correct?

> [!question]- Answer
> **The sequence.** Clarify requirements and constraints, including what is out of scope.
> Estimate capacity: request rate, data volume, growth. Design components and their
> interactions. Design the data model, which is usually where the real decisions are.
> Identify failure modes and what happens in each. Only then name technologies, and name
> them as instances of a category so the choice stays arguable.
> **SQL or NoSQL.** Follow the access patterns. Relational when you have relationships you
> query across, need transactions across entities, and the shape is stable. Document when
> you read a whole aggregate at once and rarely join. Wide-column when you have enormous
> volume and known, narrow access patterns. Key-value when you look things up by one key.
> The honest default is relational, and the burden of proof is on leaving it.
> **Finding the bottleneck.** Look for the resource that saturates first under the
> estimated load, usually a single write path, a shared lock, or a database that cannot
> shard. Defaulting to horizontal scaling is a non-answer because it does not help with
> anything that is genuinely serialised, and it hides the constraint until it is more
> expensive.
> **Naming tradeoffs.** The mark of an architect rather than an enthusiast. Every decision
> you present as simply correct is one nobody can challenge, which means nobody can catch
> your error. Say what you gave up and under what conditions you would choose differently,
> and put both in the ADR. That is also what makes the decision reversible later, because
> the next person can see what changed.

**Ask yourself:**
* When did I last write down what I gave up, rather than only what I chose?
* Which of my decisions would I struggle to argue against, and is that confidence or blindness?

## Capstone

Take a system you have worked on and write the architecture decision records it never
had. For each significant decision: the context, the options, what was chosen, what was
given up, and the conditions under which you would revisit it.

Then find the one you now think was wrong and write the ADR that reverses it.

## Self-assessment checklist

- [ ] I can name a violated principle and the cost it has already imposed.
- [ ] I can state the dependency rule and spot where it is broken.
- [ ] I can find bounded contexts and justify them from language and ownership.
- [ ] I can explain CQRS's cost to a non-technical stakeholder.
- [ ] I can decompose by domain, and say when not to decompose at all.
- [ ] I can choose sync or async with concrete tradeoffs, and queue or stream.
- [ ] I can design a saga, solve dual-write, and make an operation idempotent.
- [ ] I can choose a caching strategy and a shard key with reasons.
- [ ] I can say what each observability layer catches that the others miss.
- [ ] I can work a design problem systematically and name what I gave up.
