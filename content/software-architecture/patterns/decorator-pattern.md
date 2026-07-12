---
title: "Decorator Pattern"
tags: [architecture, patterns]
level: deep
type: reference
reviewed: 2026-07-12
---


A **structural** design pattern that attaches additional responsibilities to an object at runtime by wrapping it in another object that shares the same interface. Each wrapper adds exactly one responsibility and delegates everything else to the object it wraps. From Gang of Four, _Design Patterns: Elements of Reusable Object-Oriented Software_ (Gamma, Helm, Johnson, Vlissides, 1994).

Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

## The problem it solves: combinatorial subclass explosion

Suppose you have a `Coffee` class and three optional add-ons: milk, sugar, whipped cream. Supporting every combination via subclassing produces:

`CoffeeWithMilk`, `CoffeeWithSugar`, `CoffeeWithWhip`, `CoffeeWithMilkAndSugar`, `CoffeeWithMilkAndWhip`, `CoffeeWithSugarAndWhip`, `CoffeeWithMilkAndSugarAndWhip`, seven concrete classes for three boolean options. With four options it’s fifteen. With five it’s thirty-one. The count doubles every time you add a feature.

The Decorator pattern eliminates this: each add-on is its own decorator, and you stack them freely at runtime. Three add-on classes cover all seven combinations above.

## Structure

```python
import abc


# ── Component interface ───────────────────────────────────────────────────────

class Coffee(abc.ABC):
    @abc.abstractmethod
    def cost(self) -> float: ...

    @abc.abstractmethod
    def description(self) -> str: ...


# ── Concrete component (base object being wrapped) ────────────────────────────

class Espresso(Coffee):
    def cost(self) -> float:
        return 1.99

    def description(self) -> str:
        return "Espresso"


# ── Abstract decorator (shares the interface; holds a reference to a Coffee) ──

class CoffeeDecorator(Coffee, abc.ABC):
    def __init__(self, coffee: Coffee) -> None:
        self._coffee = coffee          # the wrapped object

    # Default delegation - concrete decorators override what they need.
    def cost(self) -> float:
        return self._coffee.cost()

    def description(self) -> str:
        return self._coffee.description()


# ── Concrete decorators ───────────────────────────────────────────────────────

class Milk(CoffeeDecorator):
    def cost(self) -> float:
        return self._coffee.cost() + 0.25

    def description(self) -> str:
        return self._coffee.description() + ", milk"


class Sugar(CoffeeDecorator):
    def cost(self) -> float:
        return self._coffee.cost() + 0.10

    def description(self) -> str:
        return self._coffee.description() + ", sugar"


class Whip(CoffeeDecorator):
    def cost(self) -> float:
        return self._coffee.cost() + 0.50

    def description(self) -> str:
        return self._coffee.description() + ", whip"


# ── Stacking ──────────────────────────────────────────────────────────────────

drink = Whip(Milk(Espresso()))
print(drink.description())  # Espresso, milk, whip
print(drink.cost())         # 2.74  (1.99 + 0.25 + 0.50)

# Order changes the description string but not the total cost here.
# In cases where order matters (e.g., a "double-milk" discount applied
# before a surcharge), the stacking order is load-bearing.
```

> [!note]
> `Whip(Milk(Espresso()))` reads inside-out: start with an `Espresso`, wrap it in `Milk`, wrap that in `Whip`. Each layer sees only the interface of the thing it wraps, it has no idea whether it is wrapping a base object or another decorator.

## How the delegation chain works

When you call `drink.cost()` on `Whip(Milk(Espresso()))`:

1. `Whip.cost()` calls `self._coffee.cost()` (the `Milk` instance) and adds 0.50.
2. `Milk.cost()` calls `self._coffee.cost()` (the `Espresso` instance) and adds 0.25.
3. `Espresso.cost()` returns 1.99.
4. Total: 1.99 + 0.25 + 0.50 = 2.74.

No class holds the combined logic, the chain of delegation assembles it at call time.

## Real-world examples

### Java I/O streams

The canonical example from the Java standard library. Every stream class implements the same `InputStream` / `Reader` interface; you compose capabilities by nesting:

```java
BufferedReader reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream("data.csv"), StandardCharsets.UTF_8
    )
);
```

`FileInputStream` reads raw bytes. `InputStreamReader` adds character decoding. `BufferedReader` adds line-buffering. Three orthogonal responsibilities, stacked at construction time, no `BufferedUTF8FileReader` class required.

### Python function decorators

Python’s `@decorator` syntax is the same idea applied to callables. A function decorator wraps a function in another callable that shares (or extends) the original signature:

```python
import functools
import time

def timed(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timed
def slow_query(n):
    return sum(range(n))
```

`@timed` wraps `slow_query` in `wrapper`, which adds timing and then delegates to the original. The caller sees the same interface. Multiple decorators can be stacked: `@retry`, `@cache`, `@timed` each adds one responsibility.

### Web middleware

HTTP middleware pipelines are decorators: each middleware adds one concern (authentication, logging, rate-limiting, CORS headers) and passes the request to the next handler. In frameworks like Django, Express, or ASP.NET Core the middleware stack is literally assembled by wrapping handlers at startup.

### UI components

The GoF motivating example: a `TextView` (bare text), wrapped in `BorderDecorator` (adds a border), wrapped in `ScrollDecorator` (adds a scrollbar). Three display capabilities composed from three classes instead of `ScrollableBorderedTextView`.

## Pros and cons

|  | Detail |
| --- | --- |
| **Pro, runtime flexibility** | Add or remove responsibilities at runtime by wrapping or unwrapping. No recompile, no new class. |
| **Pro, avoids subclass explosion** | _n_ orthogonal features need _n_ decorator classes, not _2^n^_ subclass combinations. |
| **Pro, Open/Closed Principle** | The base component never changes. New behavior is added by writing a new decorator, not modifying existing code. |
| **Pro, Single Responsibility** | Each decorator does exactly one thing and delegates the rest. |
| **Con, many small classes** | A codebase with heavy decorator use accumulates many thin wrapper classes that individually seem trivial to trace. |
| **Con, deep nesting is hard to debug** | A stack of five decorators produces a five-level delegation chain. Stack traces and step-through debugging are tedious. |
| **Con, order matters** | The behavior of `A(B(C()))` can differ from `B(A(C()))`. The correct stacking order is a runtime concern that is not enforced by the type system. |
| **Con, identity and type checks break** | `isinstance(Whip(Espresso()), Espresso)` is `False`. If any code checks the concrete type of the object rather than its interface, decorators are invisible to it. |

> [!tip]
> If you find yourself needing to unwrap decorators to access the inner object (e.g., to check its concrete type), that is a signal that callers are depending on implementation details rather than the interface. Fix the interface instead.

## Decorator vs similar structural patterns

All four patterns below involve wrapping an object and forwarding calls. The difference is **intent**.

| Pattern | Intent | Interface relative to wrapped object |
| --- | --- | --- |
| **Decorator** | Add responsibilities to an object at runtime. | Same interface, the decorator **is** substitutable for what it wraps. |
| **Proxy** | Control access to an object (lazy init, access control, remote stub, caching). | Same interface, the proxy **pretends to be** the real object. |
| **Adapter** | Make an incompatible interface compatible with what the caller expects. | Different interface, the adapter **translates** between two contracts. |
| **Composite** | Treat a tree of objects uniformly (a leaf and a branch respond to the same calls). | Same interface, used for **structure** (part/whole hierarchy), not added behavior. |

> [!note]
> Decorator and Proxy look identical in code. The distinction is intent: a Proxy controls **access**, a Decorator adds **behavior**. A caching proxy that also adds logging is blurring both, at that point, naming it clearly and documenting its role matters more than which pattern label you apply.

## Relation to other foundational concepts

* [[composition-over-inheritance|Composition over Inheritance]]: Decorator is the canonical structural example of why composition wins: three decorator classes replace seven subclasses, and the count never explodes again.
* [[strategy-pattern|Strategy Pattern]]: Strategy and Decorator are both composition-based alternatives to subclassing. Strategy swaps the **algorithm inside a context** (one pluggable behavior); Decorator stacks **responsibilities around a component** (additive wrapping). Use Strategy when behavior is mutually exclusive; use Decorator when responsibilities are cumulative.
* [[solid|SOLID (OCP / SRP)]]: Decorator is a direct implementation of OCP (add behavior without modifying the base) and SRP (each wrapper owns exactly one responsibility).
* [[coupling-and-cohesion|Coupling and Cohesion]]: Each decorator is coupled only to the component **interface**, not to any concrete class. This is the loosest coupling possible and keeps each wrapper highly cohesive.
* [[inversion-of-control|Inversion of Control]]: In IoC/DI containers, decorator stacks are assembled by the container at startup rather than hardcoded at the call site, the canonical way to apply decorators at scale.
* [[observer-pattern|Observer Pattern]]: Often used alongside Decorator: a decorator can attach observers or emit events as part of its added responsibility without the base component knowing.
