---
title: "Inversion of Control (IoC)"
tags: [architecture]
level: deep
type: reference
---


Inversion of Control is a design principle where the framework or runtime, not your code, controls the program’s flow and object lifecycle, calling your code at the right moments rather than the other way around. Martin Fowler’s 2004 article [_Inversion of Control Containers and the Dependency Injection pattern_](https://martinfowler.com/articles/injection.html) remains the canonical reference.

## The Hollywood Principle

Don’t call us, we’ll call you.

This informal phrasing, named after the Hollywood rejection cliché, captures the reversal precisely. Your code registers itself with a framework (implements an interface, wires up a handler, annotates a method), and the framework decides when to invoke it.

## Traditional vs. Inverted Control Flow

| Control Style | Who is in charge? |
| --- | --- |
| **Traditional** | Your code calls libraries. It creates what it needs, decides what to call, decides when. The `main()` routine is a single chain of commands you authored top to bottom. |
| **Inverted** | The framework calls your code. It manages the event loop, object graph, or lifecycle; your code is a plugin dropped into a slot the framework owns. |

## Before and After: the OrderService example

### WITHOUT IoC, hardwired dependencies

`OrderService` constructs its own collaborators. You cannot test it without a real database and a real mail server.

```python
class PostgresDatabase:
    def save_order(self, order):
        print(f"[DB] saving order: {order}")

class SmtpMailer:
    def send_confirmation(self, order):
        print(f"[MAIL] sending confirmation for: {order}")

class OrderService:
    def __init__(self):
        self.db = PostgresDatabase()      # hardwired
        self.mailer = SmtpMailer()        # hardwired

    def place_order(self, order):
        self.db.save_order(order)
        self.mailer.send_confirmation(order)

# Caller has no say in which DB or mailer is used.
svc = OrderService()
svc.place_order("Laptop")
```

### WITH IoC, dependencies received from outside

Control over object creation is inverted: whoever builds `OrderService` decides which collaborators it receives.

```python
class OrderService:
    def __init__(self, db, mailer):   # <-- dependencies injected
        self.db = db
        self.mailer = mailer

    def place_order(self, order):
        self.db.save_order(order)
        self.mailer.send_confirmation(order)

# ---- production wiring ----
svc = OrderService(db=PostgresDatabase(), mailer=SmtpMailer())
svc.place_order("Laptop")

# ---- test wiring ----
class FakeDatabase:
    def save_order(self, order): pass

class FakeMailer:
    def send_confirmation(self, order): pass

test_svc = OrderService(db=FakeDatabase(), mailer=FakeMailer())
test_svc.place_order("Laptop")   # no real DB, no real email
```

> [!tip]
> The signature `__init__(self, db, mailer)` is the entire IoC contract. The class no longer cares **how** its collaborators are produced, only that they honour the expected interface.

## Mechanisms that implement IoC

IoC is a **principle**, not a mechanism. Many patterns realise it:

| Mechanism | How IoC is expressed | Everyday example |
| --- | --- | --- |
| **Dependency Injection (DI)** | Dependencies are passed in (constructor, setter, or container) rather than created inside. | Constructor injection; Spring/Guice containers; Python’s `pytest` fixtures. |
| **Callbacks / event handlers** | You register a function; the runtime calls it when an event fires. | `button.on_click(handler)`; `addEventListener("click", fn)`. |
| **Template Method pattern** | Base class defines the algorithm skeleton; subclass fills in hook methods the base calls. | Django’s `get()` / `post()` on class-based views; JUnit’s `setUp()` / `tearDown()`. |
| **Framework lifecycle hooks** | Framework drives the lifecycle; your code implements named entry points. | React `render()`, `componentDidMount()`; Flask route decorators; pytest fixtures. |
| **Plugin / extension registries** | Your code declares itself to a registry; the host discovers and invokes it. | VSCode extension API; Python `entry_points`; pytest plugins. |

## IoC Containers

A **container** (also called a DI container or IoC container) automates the wiring. You declare **what** depends on **what** (via config, annotations, or type hints); the container builds the entire object graph for you at startup.

```python
# Example using the `dependency-injector` library
from dependency_injector import containers, providers

class Container(containers.DeclarativeContainer):
    db     = providers.Singleton(PostgresDatabase)
    mailer = providers.Factory(SmtpMailer)
    svc    = providers.Factory(OrderService, db=db, mailer=mailer)

container = Container()
order_service = container.svc()   # container builds and wires everything
```

> [!note]
> Containers are powerful but optional. Constructor injection without a container is perfectly valid, and often preferable, for smaller codebases.

## IoC vs. Dependency Injection vs. Dependency Inversion Principle

These three terms are frequently conflated. They are related but distinct:

| Term | What it is | Scope |
| --- | --- | --- |
| **IoC** | The **principle**: cede control of flow / instantiation to an external authority. | Architecture-level; applies to any language, any paradigm. |
| **Dependency Injection (DI)** | One **technique** for implementing IoC: supply collaborators from the outside rather than creating them inside. | Design-level; the most common IoC mechanism in OO code. |
| **Dependency Inversion Principle (DIP)** | An SOLID **principle**: high-level modules and low-level modules should both depend on **abstractions** (interfaces), not on each other’s concrete types. | Design-level; about the **direction** and **type** of dependencies, not about who creates them. |

> [!note]
> You can apply IoC without DIP (inject a concrete class) and you can apply DIP without a container (write the interface yourself and wire it manually). They complement each other but are independently applicable.

## Why it matters

* **Decoupling**: collaborators can be swapped without touching `OrderService`. Changing the database means changing only the injected object.
* **Testability**: pass in fakes or mocks at construction time; no need for monkey-patching or test databases.
* **Flexibility**: the same class can be configured differently in different deployment contexts (production, staging, test, local).

## Caveats and failure modes

**Over-injection.** Injecting every leaf-level utility (loggers, clocks, string formatters) creates constructors with a dozen parameters. Inject collaborators that carry real variation; embed true invariants.

**Magic / hard-to-trace flow.** Frameworks that call your code through annotations, reflection, or XML config can make it hard to answer "what actually runs when this request arrives?" Prefer explicit wiring when the graph is small enough.

**Abstraction for its own sake.** Extracting an interface just to enable injection, when there is and will only ever be one implementation, is [[yagni|YAGNI]]. Introduce the abstraction when you have a concrete second use (testing counts).

**Constructor telescoping.** Ten-argument constructors signal that the class itself needs splitting ([[solid|SRP]] violation), not that you need a better container.

## Relation to other foundational concepts

* [[solid|SOLID (DIP)]]: DIP specifies that injected dependencies should be **abstractions**, completing the IoC picture: not only is the object handed in, it’s typed against an interface the high-level module owns.
* [[coupling-and-cohesion|Coupling & Cohesion]]: IoC’s primary payoff is reducing efferent coupling; classes stop reaching out to create their collaborators and instead receive a clean, minimal interface.
* [[strategy-pattern|Strategy Pattern]]: the canonical structural expression of IoC: a collaborator implementing a swappable algorithm is injected rather than hard-coded.
* [[repository-pattern|Repository Pattern]]: repositories are a canonical thing you inject; the pattern only works cleanly when the service does not instantiate the repository itself.
* [[composition-over-inheritance|Composition over Inheritance]]: DI is the mechanism that makes composition practical at scale: you compose by injecting, not by subclassing.
