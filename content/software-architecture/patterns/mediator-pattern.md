---
title: "Mediator Pattern"
tags: [architecture, patterns]
level: deep
type: reference
---


A **behavioral** design pattern from GoF (_Design Patterns_, Gamma/Helm/Johnson/Vlissides, 1994). It centralizes communication between objects into a single mediator so that components never reference each other directly, every peer talks only to the hub, and the hub coordinates the rest.

## Problem

When many objects interact, they accumulate direct references to one another. The result is a many-to-many dependency graph: changing one object requires touching all the others that know about it. The graph is hard to extend, hard to test, and impossible to reuse in isolation.

## Solution

Introduce one **Mediator** object. Each component (called a **Colleague**) knows only the mediator, it sends all requests there and reacts to events the mediator sends back. The many-to-many mesh collapses into many-to-one spokes.

The mediator holds every "when X then Y" rule that used to be scattered across Colleagues. The Colleagues themselves become ignorant of each other, and therefore reusable.

## Python Example

A signup form where three widgets must coordinate: enabling the submit button only when the checkbox is ticked and the text field is non-empty.

```python
from __future__ import annotations
from abc import ABC, abstractmethod


class Mediator(ABC):
    @abstractmethod
    def notify(self, sender: "Component", event: str) -> None: ...


class Component:
    def __init__(self, mediator: Mediator | None = None) -> None:
        self._mediator = mediator

    def set_mediator(self, mediator: Mediator) -> None:
        self._mediator = mediator


class Checkbox(Component):
    def __init__(self) -> None:
        super().__init__()
        self.checked = False

    def toggle(self) -> None:
        self.checked = not self.checked
        self._mediator.notify(self, "checkbox_toggled")


class TextField(Component):
    def __init__(self) -> None:
        super().__init__()
        self.text = ""

    def set_text(self, value: str) -> None:
        self.text = value
        self._mediator.notify(self, "text_changed")


class SubmitButton(Component):
    def __init__(self) -> None:
        super().__init__()
        self.enabled = False

    def set_enabled(self, value: bool) -> None:
        self.enabled = value
        print(f"Submit button {'enabled' if value else 'disabled'}")


class SignupDialog(Mediator):
    """Owns all inter-widget rules. Widgets own none of them."""

    def __init__(self) -> None:
        self.checkbox = Checkbox()
        self.name_field = TextField()
        self.submit = SubmitButton()
        for component in (self.checkbox, self.name_field, self.submit):
            component.set_mediator(self)

    def notify(self, sender: Component, event: str) -> None:
        ready = self.checkbox.checked and bool(self.name_field.text)
        self.submit.set_enabled(ready)


# Usage
dialog = SignupDialog()
dialog.name_field.set_text("Ada")   # → Submit button disabled (checkbox off)
dialog.checkbox.toggle()            # → Submit button enabled
dialog.name_field.set_text("")      # → Submit button disabled (empty name)
```

The `SignupDialog` is the only place that knows the "both checkbox AND non-empty text" rule. Adding a new widget means writing a new `Component` subclass and updating only `SignupDialog.notify`.

## Real-World Examples

| Example | Role of the mediator |
| --- | --- |
| GUI dialog / form controller | Holds all cross-widget enable/disable, show/hide, validation rules. |
| Air-traffic control tower | Aircraft never talk to each other; all coordination flows through the tower. |
| Chat room server | Users send messages to the room, which fans them out, users don’t address each other directly. |
| Message bus / event aggregator | Components publish events to a bus; the bus routes them to interested handlers. |
| MVC controller | The controller mediates between the Model and View, neither holds a direct reference to the other. |

## Pros and Cons

|  | Detail |
| --- | --- |
| **Pro** | Eliminates many-to-many coupling, Colleagues are decoupled from each other entirely. |
| **Pro** | Centralizes interaction logic. All coordination rules live in one class, making them easy to find and change. |
| **Pro** | Colleagues become reusable. A `Checkbox` that only knows `Mediator` can be dropped into any dialog. |
| **Pro** | Simplifies unit testing, test Colleagues with a stub mediator; test the mediator with stub Colleagues. |
| **Con** | The mediator can become a **god object**. When it absorbs every rule, it grows in complexity as Colleagues grow in number. |
| **Con** | Can become a bottleneck. All events funnel through one point; performance or availability issues in the mediator affect all Colleagues. |
| **Con** | Indirection cost. The flow of control is harder to follow at a glance, you must trace through the mediator to understand what happens after any event. |

## Mediator vs. Observer

|  | Mediator | Observer |
| --- | --- | --- |
| **Direction** | Multidirectional, the mediator coordinates mutually-dependent peers, and peers can trigger each other (through the mediator). | One-to-many broadcast, a subject notifies subscribers who have no knowledge of each other. |
| **Coupling** | Colleagues know the mediator; the mediator knows all Colleagues. | Subjects know the Observer interface; concrete observers are anonymous. |
| **Use when** | A set of peers must influence each other in complex, stateful ways. | A single source must push the same change to an open-ended list of listeners. |
| **Combined?** | Often. A mediator uses the Observer pattern internally to receive events from its Colleagues. |, |

A chat room is often cited as a Mediator example, but if messages simply fan out uniformly, it may be closer to Observer/pub-sub. It becomes a true Mediator when the room makes routing **decisions** based on the state of participants.

## Mediator vs. Facade

|  | Mediator | Facade |
| --- | --- | --- |
| **Direction** | Bidirectional. Colleagues call the mediator; the mediator calls Colleagues back. | Unidirectional. The caller talks to the facade; the subsystem never talks back through the facade. |
| **Knowledge** | Colleagues are aware of the mediator, they hold a reference. | Subsystem components are unaware of the facade. |
| **Purpose** | Coordinate peer interaction and shared state. | Simplify a complex subsystem behind a cleaner interface. |

Facade reduces **interface complexity** for a caller. Mediator reduces **coupling complexity** among peers. They solve different problems and are often used together.

## Relation to other foundational concepts

* [[observer-pattern|Observer Pattern]]: Observer is a one-to-many broadcast; Mediator uses it internally and adds multidirectional coordination logic on top.
* [[coupling-and-cohesion|Coupling and Cohesion]]: Mediator is a direct application of Low Coupling: Colleagues shed direct references to peers and depend only on the mediator interface.
* [[grasp|GRASP]]: embodies the **Indirection** and **Low Coupling** GRASP patterns; the mediator is the indirection controller that absorbs cross-component coupling.
* [[command-pattern|Command Pattern]]: Commands are often what Colleagues send to the mediator, allowing the mediator to queue, log, or undo interactions.
* [[solid|SRP / OCP]]: Centralizing rules in the mediator gives it one reason to change (interaction policy), but risks violating SRP as the system grows; each new Colleague interaction rule must be added to the mediator (OCP tension).
