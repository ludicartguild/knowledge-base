---
title: "Hexagonal Architecture (Ports & Adapters)"
tags: [architecture, patterns]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Hexagonal Architecture (also called Ports and Adapters) puts your business
logic at the center and pushes every piece of technology (web frameworks,
databases, message queues, third party APIs) to the outside edge. The core
talks to the outside world only through **ports**, which are interfaces the core
itself defines. Concrete technologies plug in through **adapters** that implement
those ports. Because every dependency arrow points inward, the core knows nothing
about how it is called or where its data lives, which makes the business rules
easy to test in isolation and cheap to run against swappable real or fake
infrastructure.

## Why it exists

Most naive applications entangle business rules with input and output. A single
class parses an [[glossary#h|HTTP]] request, runs a domain calculation, and writes rows to a
database, all in one place. This coupling of business logic to I/O causes three
recurring problems.

- **Hard to test.** To exercise one rule you must stand up a web server, a real
  database, and network dependencies. Tests become slow, flaky, and expensive to
  write, so people write fewer of them.
- **Hard to change technology.** Swapping a [[glossary#s|SQL]] store for a document store, or a
  [[glossary#r|REST]] entry point for a message consumer, means editing the business logic
  because the logic is fused to the mechanism.
- **Logic leaks outward.** Validation and domain rules end up scattered across
  controllers, [[glossary#o|ORM]] callbacks, and serializers, so no single place describes what
  the system actually does.

Alistair Cockburn named the pattern in 2005 with an explicit goal: "Allow an
application to equally be driven by users, programs, automated test or batch
scripts, and to be developed and tested in isolation from its eventual run-time
devices and databases." The pattern exists to protect a testable, technology
agnostic core from the churn and weight of the outside world.

## How it works

![[hexagonal-ports-and-adapters.drawio.svg]]

### The core (domain) at the center

The inner region holds the application's business logic and domain model: the
rules, entities, and use cases that would still make sense if you rewrote every
framework around them. This core contains no import of a web framework, no SQL,
no HTTP client. It is plain code expressing what the software does.

### Ports are interfaces the core defines

A **port** is a purposeful conversation between the core and the outside world,
expressed as an interface (or a `Protocol` / abstract base, depending on the
language). Crucially, the port is owned by the core and written in the core's own
terms. The core says "I need a way to save an order" or "someone may ask me to
place an order," and it declares that need as an interface. It does not know or
care what technology satisfies it.

There are two kinds of ports, corresponding to the two sides of the hexagon.

- **Driving (primary) ports** describe how the outside world calls into the core.
  These are the use case entry points the application exposes: "place order,"
  "get balance," "register user."
- **Driven (secondary) ports** describe what the core needs from the outside
  world: "persist this," "publish this event," "fetch that exchange rate."

### Adapters implement ports

An **adapter** is technology specific glue that connects a real device or
framework to a port.

- A **driving (primary) adapter** sits on the left or top and initiates action.
  It receives an external stimulus (an HTTP request, a CLI invocation, a queue
  message, a test fixture) and translates it into a call on a driving port.
- A **driven (secondary) adapter** sits on the right or bottom and responds. When
  the core calls a driven port, a concrete adapter (a SQL repository, an SMTP
  client, an in memory fake) carries out the request against real infrastructure.

For any one port there can be many adapters. The same driving port might be
exercised by a web adapter in production and a test adapter in a unit test. The
same persistence port might be backed by a relational adapter in production and
an in memory adapter in tests.

### Dependency inversion so the core depends on nothing external

This is the load bearing idea. Without it you do not have hexagonal architecture,
you just have layers. Normally, high level policy would call down into a
low level database module, so the policy depends on the database. Hexagonal
architecture inverts that: the core declares the interface, and the database
adapter depends on the core by implementing that interface. Every dependency
arrow points inward toward the domain. The database, the web framework, and the
message broker all depend on the core; the core depends on none of them. (See
[[inversion-of-control]] and the Dependency Inversion Principle for the general
mechanism.)

### Swappable real vs fake adapters

Because ports are just interfaces, you can substitute any conforming
implementation. In production you wire real adapters; in tests you wire fakes.
The wiring itself happens at the outermost layer, often called the composition
root or configuration, where concrete adapters are constructed and injected into
the core.

A generic sketch (placeholder names, illustrative):

```python
# --- core: a driven port the domain defines ---
from typing import Protocol

class OrderRepository(Protocol):
    def save(self, order: "Order") -> None: ...
    def get(self, order_id: str) -> "Order": ...

# --- core: a use case (a driving port implementation) ---
class PlaceOrder:
    def __init__(self, orders: OrderRepository):
        self._orders = orders          # depends on the interface, not a DB

    def execute(self, order: "Order") -> None:
        order.validate()               # pure business rule
        self._orders.save(order)

# --- driven adapter for production ---
class SqlOrderRepository:            # implements OrderRepository
    def save(self, order): ...       # real SQL here
    def get(self, order_id): ...

# --- driven adapter for tests ---
class InMemoryOrderRepository:      # implements OrderRepository
    def __init__(self): self._store = {}
    def save(self, order): self._store[order.id] = order
    def get(self, order_id): return self._store[order_id]

# --- composition root wires the concrete adapter in ---
use_case = PlaceOrder(orders=SqlOrderRepository())     # production
test_use_case = PlaceOrder(orders=InMemoryOrderRepository())  # tests
```

The `PlaceOrder` use case never mentions SQL. Testing it needs no database, and
switching stores means writing one new adapter, not touching the rule.

Note on the shape: the hexagon has no mathematical meaning. Cockburn chose six
sides only to give room to draw multiple ports and adapters, rather than being
boxed into a single stack of horizontal layers.

## Trade-offs & when to use

The pattern buys isolation at the cost of indirection. Every crossing of the
boundary passes through an interface, and you write mapping code to translate
between external shapes (DTOs, ORM rows, wire formats) and domain objects. That
is more files, more indirection, and more upfront design.

**When it is overkill.** For a small [[glossary#c|CRUD]] service, a script, a prototype, or any
system where the "business logic" is a thin wrapper over the database, the
ceremony can outweigh the benefit. If there is no real domain to protect, ports
and adapters mostly add layers you step through without gain.

**When it pays off.** The value grows with the richness of the domain and the
lifetime of the system. It pays off when business rules are genuinely complex and
worth testing in isolation, when the same core must be driven multiple ways (HTTP
plus queue plus batch plus CLI), when infrastructure is expected to change
(replaceable database, broker, or provider), or when fast, deterministic tests
that avoid real I/O are a priority. In those settings the indirection is a small
tax for a core you can reason about and evolve independently of technology.

## Pitfalls / done-right checklist

- **Ports defined in infrastructure terms.** If a port method is named after the
  database (`insertRow`) instead of the domain need (`save`), the abstraction has
  already leaked. Ports must speak the core's language.
- **The core importing a framework.** Any `import` of a web framework, ORM,
  driver, or HTTP client inside the core is a red flag. The core should compile
  and test with none of them present.
- **Anemic core, fat adapters.** If all the real logic lives in adapters and the
  center is just data holders, you have the diagram but not the benefit. The
  interesting rules belong in the core.
- **Leaking persistence models into the domain.** ORM entities or DTOs crossing
  into the core recouple it to the mechanism. Map at the boundary.
- **Confusing driving and driven sides.** Driving adapters call the core; driven
  adapters are called by the core. Mixing them up produces circular or wrong
  facing dependencies.
- **Wiring scattered everywhere.** Concrete adapters should be constructed in one
  outer composition root, not `new`-ed up in the middle of business logic.
- **Checklist for "done right":** the core has zero framework imports; every port
  is an interface named in domain terms; every external technology is an adapter;
  all dependency arrows point inward; you can run the whole core against in memory
  fakes with no network or database.

## Mental model

Think of the core as a game console and ports as its standardized sockets. The
console defines the shape of the controller port and the HDMI port; it does not
care who makes the controller or the television. Any device that fits the socket
works, and you can swap a real controller for a test rig without opening the
console. The console (business logic) is designed once; the peripherals
(adapters) come and go. Equivalently: the core declares "here is the plug shape I
need," and the outside world is responsible for building something that fits.

## Cross-links

- [[software-architecture-map]]
- [[inversion-of-control]]
- [[coupling-and-cohesion]]
- [[repository-pattern]]

## Sources

- Alistair Cockburn, "Hexagonal Architecture" (original article, Ports and
  Adapters): https://alistair.cockburn.us/hexagonal-architecture
- "Hexagonal architecture (software)," Wikipedia:
  https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)
- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of
  Software* (Addison-Wesley, 2003), for the domain model and isolated-domain
  motivation.
- Robert C. Martin, "The Dependency Inversion Principle" and *Clean
  Architecture* (Prentice Hall, 2017), for the inward-pointing dependency rule.
- [[glossary#a|AWS]] Prescriptive Guidance, "Hexagonal architecture pattern":
  https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html
