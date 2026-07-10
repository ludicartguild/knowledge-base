---
title: "Observer Pattern"
tags: [architecture, patterns]
level: deep
type: reference
---


Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

The **Observer** pattern is a behavioral design pattern in which a **subject** (publisher) maintains a list of **observers** (subscribers) and notifies them automatically when its state changes — without knowing anything about who they are or what they do.

## Core Idea

When something happens, tell everyone who cares, without knowing who they are. The subject announces _"I changed!"_ into the void; each subscribed observer receives the notification and decides independently how to react.

This separates **state ownership** (the subject) from **state reaction** (the observers), enabling an open-ended set of dependents that can be added or removed at runtime.

## Structure

```
Subject                         Observer
────────────────────────        ──────────────────
+ subscribe(observer)     ───►  + update(event)
+ unsubscribe(observer)
+ _notify()
+ state
```

* **Subject** — owns state; drives the notification cycle.
* **Observer** — reacts to state changes; knows nothing about the subject’s internals (and ideally nothing about other observers).
* The relationship is **pull** (observer fetches state from subject) or **push** (subject sends state with the notification). Push is simpler; pull gives observers more control.

## Python Example

```python
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


class Observer(ABC):
    @abstractmethod
    def update(self, event: str, data: Any) -> None: ...


@dataclass
class WeatherStation:
    """Subject — maintains temperature state and a list of observers."""
    _temperature: float = 0.0
    _observers: list[Observer] = field(default_factory=list)

    def subscribe(self, observer: Observer) -> None:
        self._observers.append(observer)

    def unsubscribe(self, observer: Observer) -> None:
        self._observers.remove(observer)

    def _notify(self, event: str) -> None:
        for observer in list(self._observers):          # copy — safe for unsubscription mid-loop
            observer.update(event, self._temperature)

    @property
    def temperature(self) -> float:
        return self._temperature

    @temperature.setter
    def temperature(self, value: float) -> None:
        self._temperature = value
        self._notify("temperature_changed")


class PhoneDisplay(Observer):
    """Observer A — renders the temperature on a UI widget."""
    def update(self, event: str, data: Any) -> None:
        print(f"[PhoneDisplay] 🌡  Temperature: {data:.1f}°C")


class Logger(Observer):
    """Observer B — appends the reading to a log file."""
    def update(self, event: str, data: Any) -> None:
        print(f"[Logger] {event}: {data}")


# --- usage ---
station = WeatherStation()
display = PhoneDisplay()
log     = Logger()

station.subscribe(display)
station.subscribe(log)

station.temperature = 22.5  # notifies both
# [PhoneDisplay] 🌡  Temperature: 22.5°C
# [Logger] temperature_changed: 22.5

station.unsubscribe(log)
station.temperature = 19.0  # only display notified
```

The `list(self._observers)` copy inside `_notify` prevents `RuntimeError: list changed size during iteration` if an observer unsubscribes itself during its own `update` call.

## Real-World Occurrences

### UI event systems
Every DOM event listener (`addEventListener`) is an observer. The `EventTarget` (button, input) is the subject. Multiple handlers can react to a single `"click"` with no coupling between them.

### Reactive front-end frameworks
* **React** — `useEffect` / Redux `subscribe` wires component re-renders to store state changes.
* **Vue** — reactive data properties use a hidden dependency-tracking observer graph (via `Proxy`).
* **RxJS** — explicit `Observable` / `subscribe` / `unsubscribe` API; Observers are first-class objects.

### Pub/sub and message queues
Kafka, Redis Pub/Sub, and Google Pub/Sub extend the pattern across process boundaries. The broker decouples producer (subject) from consumer (observer) both in time and space — a pure push model where consumers decide their own filtering.

### Spreadsheet recalculation
A cell is the subject; all downstream formula cells that reference it are observers. Changing `A1` triggers a topological re-notification of every dependent cell.

### Model–View architectures (MVC / MVP / MVVM)
The **Model** is the subject; **Views** are observers. This is the original motivation in Smalltalk-80 and the direct ancestor of every front-end architecture since.

## Pros and Cons

| Pro | Detail |
| --- | --- |
| Loose coupling | Subject and observers depend only on a narrow interface (`Observer.update`). Neither needs to know the other’s concrete type. |
| Open/Closed Principle | New observer types can be added without modifying the subject. The subject is closed for modification, open for extension (see [[solid|SOLID]] — OCP). |
| Runtime composition | Observers can be added and removed while the system is running, enabling feature flags, A/B testing, and plugin systems. |
| Broadcast by default | One state change fans out to arbitrarily many observers with no additional logic in the subject. |

| Con | Detail |
| --- | --- |
| Undefined notification order | The order observers receive notifications is typically undefined. Observers that must see changes in a specific sequence require extra coordination. |
| Lapsed-listener / memory leak | If an observer holds a reference to the subject but never calls `unsubscribe`, neither can be garbage-collected. This is a classic source of memory leaks in long-running applications. |
| Cascading updates | An observer that modifies the subject inside `update` can trigger re-entrant notification cycles, sometimes causing infinite loops or hard-to-trace update storms. |
| Debugging difficulty | Control flow is implicit — reading the subject’s code does not reveal who reacts to a change. Tracing an unexpected side-effect requires knowing all registered observers at runtime. |

Always pair `subscribe` with a guaranteed `unsubscribe` (e.g. in a destructor, `dispose`, `useEffect` cleanup, or `WeakRef`-based registry). Forgetting this is the single most common Observer bug in production systems.

## Observer vs. Mediator

| Dimension | Observer | Mediator |
| --- | --- | --- |
| Communication shape | One-to-many broadcast; subject → observers | Many-to-many hub; components talk through a central mediator |
| Direction | Mostly one-way (subject pushes to observers) | Bidirectional; the mediator coordinates requests and responses |
| Coupling | Observers are decoupled from each other; loosely coupled to subject via interface | Components are decoupled from each other; each knows only the mediator |
| Transparency | Subjects do not know observer identities | Mediator knows all components and their relationships |
| Typical use | UI events, reactive state, pub/sub | Chat room, air-traffic control, workflow orchestration |
| Often combined? | Yes — a mediator commonly uses Observer internally to notify components of brokered events | Yes — see above |

Use **Observer** when you want open-ended fan-out with unknown consumers. Use **Mediator** when you need to coordinate specific interactions between a known set of colleagues. When components need both broadcast and coordination, compose both: the mediator is the subject, components are observers.

## Relation to other foundational concepts

* [[mediator-pattern|Mediator Pattern]] — the natural complement; Mediator replaces the web of observer-to-observer references with a central coordinator. Often implemented on top of Observer internally.
* [[inversion-of-control|Inversion of Control]] — Observer is a concrete instance of IoC via callbacks: the subject inverts control to its observers by calling back into them. Embodies the Hollywood Principle ("don’t call us, we’ll call you").
* [[coupling-and-cohesion|Coupling and Cohesion]] — Observer reduces **efferent coupling** on the subject side (it knows only the `Observer` interface) while raising **afferent coupling** on the observer side. Understanding this trade-off determines when the pattern pays off.
* [[solid|SOLID]] — OCP is the direct justification for the pattern: adding a new observer extends behavior without modifying the subject. SRP is served by keeping notification logic out of business logic.
* [[strategy-pattern|Strategy Pattern]] — both patterns use an interface to decouple behavior; Strategy selects one algorithm at a time, Observer fans out to all registered callbacks simultaneously.
* [[command-pattern|Command Pattern]] — observer callbacks can be modeled as Command objects, enabling queuing, logging, and undo of reactions.
