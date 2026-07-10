---
title: "Favor Composition over Inheritance"
tags: [architecture, oop]
level: deep
type: reference
---


When you want to reuse behavior or build complex objects, prefer assembling objects out of smaller, interchangeable parts (**composition**, "has-a") rather than extending a base class (**inheritance**, "is-a"). Coined and popularized by the Gang of Four in _Design Patterns: Elements of Reusable Object-Oriented Software_ (Gamma, Helm, Johnson, Vlissides, 1994).

Favor object composition over class inheritance.

## Why inheritance tends to fail at scale

### 1. Inheritance is rigid, decided at compile time

A subclass’s behavior is fixed by its parent for its entire lifetime. You cannot swap out the parent’s behavior at runtime without redesigning the class hierarchy. Composition lets you swap collaborating objects at runtime, making behavior change cheap.

### 2. The Fragile Base Class Problem

A change to the parent can silently break every subclass, because subclasses often depend on **internal implementation details** of the parent, not just its public interface. This is tight coupling disguised as reuse. A well-meaning refactor in `Animal` can corrupt behavior in `Dog`, `Cat`, and `Parrot` simultaneously, none of which were touched.

### 3. Combinatorial explosion of subclasses

A class hierarchy that must support multiple orthogonal axes of variation produces a class-per-combination explosion. The canonical example: a `Coffee` class with optional milk, sugar, and whipped cream produces `CoffeeWithMilk`, `CoffeeWithSugar`, `CoffeeWithMilkAndSugar`, `CoffeeWithMilkAndWhip`, etc., a new class per combination. Composition (the Decorator pattern) wraps behaviors and mixes them freely without a new class per combination.

### 4. Inheritance mismodels reality

A `Car` is not a kind of `Engine`, it **has** one. Forcing "is-a" where the relationship is really "has-a" produces awkward hierarchies that have to be untangled later.

## The classic anti-example: Stack extends ArrayList

Java’s early `java.util.Stack` class inherits from `Vector` (essentially `ArrayList`). The result is an inheritance **leak**: every method from `Vector` is publicly accessible on `Stack`, so callers can `add(0, element)` directly (bypassing LIFO order), `remove(index)` from the middle, and `set(index, value)` at will. The "is-a" claim (`Stack` is-a `Vector`) is wrong, a stack is not a random-access list. Composition would have hidden the internal list and exposed only `push`, `pop`, `peek`, and `isEmpty`.

```python
# Inheritance leak: callers can break the invariant
from collections import UserList

class BadStack(UserList):
    def push(self, item):
        self.append(item)

    def pop_top(self):
        return self.pop()

s = BadStack()
s.push(1)
s.push(2)
s.insert(0, 99)   # exposed from the parent - LIFO invariant broken silently
print(s)          # [99, 1, 2] - not a stack anymore

# Composition: the internal list is hidden; only stack operations are exposed
class GoodStack:
    def __init__(self):
        self._data = []

    def push(self, item):
        self._data.append(item)

    def pop(self):
        return self._data.pop()

    def peek(self):
        return self._data[-1]

    def is_empty(self):
        return not self._data
```

## Before / After: swappable behavior via composition

The following example models animals with different movement and sound behaviors. Each behavior is an independent object that can be swapped at runtime. This is the **Strategy** pattern, and it is precisely what composition over inheritance looks like in practice.

```python
# ── BEFORE: inheritance ──────────────────────────────────────────────────────
#
# Every new combination (FlyingDog? SwimmingParrot?) requires a new class.
# Behavior is locked in at class-definition time.

class Animal:
    def move(self): raise NotImplementedError
    def speak(self): raise NotImplementedError

class Dog(Animal):
    def move(self): return "runs"
    def speak(self): return "woof"

class Duck(Animal):
    def move(self): return "swims"
    def speak(self): return "quack"

class FlyingDuck(Duck):
    def move(self): return "flies"   # had to subclass again just to change movement


# ── AFTER: composition (Strategy pattern) ────────────────────────────────────
#
# Behaviors are objects. Animals assemble them at construction time
# and can swap them at runtime. No new class needed per combination.

class WalkBehavior:
    def move(self): return "walks"

class SwimBehavior:
    def move(self): return "swims"

class FlyBehavior:
    def move(self): return "flies"

class BarkBehavior:
    def speak(self): return "woof"

class QuackBehavior:
    def speak(self): return "quack"

class SilentBehavior:
    def speak(self): return "..."


class Animal:
    def __init__(self, movement, sound):
        self._movement = movement
        self._sound = sound

    def set_movement(self, movement):   # swap at runtime - impossible with inheritance
        self._movement = movement

    def move(self):  return self._movement.move()
    def speak(self): return self._sound.speak()


dog  = Animal(WalkBehavior(), BarkBehavior())
duck = Animal(SwimBehavior(), QuackBehavior())

# A rubber duck: swims, silent - no new class required
rubber_duck = Animal(SwimBehavior(), SilentBehavior())

# Duck gets injured and can no longer fly - behavior changed at runtime
duck.set_movement(WalkBehavior())
```

> [!note]
> The `Animal` + swappable behavior pattern above **is** the Strategy pattern. Composition over inheritance and Strategy are not separate ideas, Strategy is the canonical implementation of the principle in the behavioral domain.

## Pros and cons

|  | Composition |
| --- | --- |
| **Pro** | Behaviors are interchangeable at runtime. |
| **Pro** | Changes to one collaborator cannot silently break others, collaborators are only coupled through their interface. |
| **Pro** | Avoids the fragile base class problem: callers depend on a stable interface, not internal implementation details. |
| **Pro** | Eliminates combinatorial class explosion, mix and match behavior objects freely. |
| **Pro** | Each behavior class can be tested in isolation. |
| **Con** | More objects, more wiring. A simple `Dog` that always runs and always barks carries unnecessary scaffolding. |
| **Con** | Indirection through collaborator interfaces can make traces and stack dumps harder to read. |
| **Con** | No method sharing by default, shared logic must live in a helper, base behavior, or mixin rather than a parent class. |

|  | Inheritance |
| --- | --- |
| **Pro** | Simple and direct for genuine, stable is-a relationships. |
| **Pro** | Polymorphism through a shared type is built-in, no wiring required. |
| **Pro** | Shared implementation (hook methods, template methods) is concise and co-located. |
| **Con** | Behavior fixed at compile time, cannot swap the parent at runtime. |
| **Con** | Fragile base class: changing the parent risks breaking all subclasses. |
| **Con** | Encourages hierarchy-first design, which often outlives its intended use cases. |

## When inheritance is still correct

Inheritance is the right tool when **all** of the following hold:

1. **The is-a relationship is genuine and stable.** `Square` is-a `Shape`. `AdminUser` is-a `User`, only if they truly share a behavioral contract (LSP must hold).
2. **You need polymorphism through a shared type.** Collections of `Shape` objects dispatched through `area()` and `perimeter()`, inheritance (or interface implementation) is exactly right here.
3. **The base class is designed for extension.** The base explicitly documents its hook points (Template Method pattern), and subclasses are expected to fill them. If the base class is not documented for extension, don’t extend it.
4. **The hierarchy is shallow (one or two levels).** Deep hierarchies, three or more levels of concrete subclassing, are almost always a sign that composition should have been used earlier.

> [!tip]
> A quick field test: if you ever find yourself overriding a parent method **just to prevent it from doing something**, the is-a relationship is wrong. Use composition instead.

## Relation to other foundational concepts

* [[strategy-pattern|Strategy Pattern]]: the canonical behavioral implementation of this principle: a family of interchangeable algorithm objects injected into a context.
* [[decorator-pattern|Decorator Pattern]]: the canonical structural implementation: wrap behavior objects in layers to add responsibilities without subclassing (solves the combinatorial-subclass-explosion problem directly).
* [[solid|SOLID (OCP / LSP)]]: OCP says extend behavior without modifying source; composition is the primary mechanism. LSP defines the contract a subtype must honor, when it can’t, composition is the fix.
* [[coupling-and-cohesion|Coupling and Cohesion]]: inheritance couples subclasses to parent internals (content-level coupling); composition couples only through a public interface (data/message coupling), which is strictly looser.
* [[inversion-of-control|Inversion of Control]]: IoC and dependency injection are how composed behavior objects get wired together; composition at scale depends on IoC to remain manageable.
* [[grasp|GRASP]]: Polymorphism and Protected Variations both push toward interface-based design, reinforcing composition as the default tool for handling variation.
