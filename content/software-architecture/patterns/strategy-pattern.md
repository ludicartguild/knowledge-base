---
title: "Strategy Pattern"
tags: [architecture, patterns]
level: deep
type: reference
---


The Strategy pattern defines a family of interchangeable algorithms, encapsulates each in its own class, and lets the client swap them at runtime — without changing the code that uses them. Defined by the Gang of Four in _Design Patterns: Elements of Reusable Object-Oriented Software_ (Gamma, Helm, Johnson, Vlissides, 1994).

Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

## Intent

A **context** object holds a reference to a **strategy** interface. Callers inject whichever concrete strategy they need; the context calls the interface and is entirely ignorant of the implementation details. Algorithms become first-class objects that can be selected, stored, passed, and swapped.

The motivating principle:

Encapsulate what varies so you can change how something is done without changing the code that uses it.

## The if/elif anti-pattern it replaces

Before Strategy, variation is encoded as conditionals inside the context:

```python
class Checkout:
    def pay(self, amount, method):
        if method == "credit_card":
            # ... charge card ...
            print(f"Charged ${amount} to credit card")
        elif method == "paypal":
            # ... call PayPal API ...
            print(f"Sent ${amount} via PayPal")
        elif method == "crypto":
            # ... broadcast transaction ...
            print(f"Transferred ${amount} in crypto")
        else:
            raise ValueError(f"Unknown payment method: {method}")
```

Problems: every new payment method requires editing `Checkout`; the method string is an untyped magic value; each branch is untestable in isolation; `Checkout` accumulates knowledge about implementations it should not know about.

## Strategy: the pattern

### Structure

* **Strategy interface** — declares the common operation(s).
* **Concrete strategies** — implement the interface; each encapsulates one algorithm variant.
* **Context** — holds a strategy reference; delegates to it. Does not know the concrete type.

### Python example

```python
from abc import ABC, abstractmethod
from decimal import Decimal


# ── Strategy interface ────────────────────────────────────────────────────────

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount: Decimal) -> None: ...


# ── Concrete strategies ───────────────────────────────────────────────────────

class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number: str):
        self._card = card_number

    def pay(self, amount: Decimal) -> None:
        print(f"Charged ${amount} to card ending {self._card[-4:]}")


class PayPalPayment(PaymentStrategy):
    def __init__(self, email: str):
        self._email = email

    def pay(self, amount: Decimal) -> None:
        print(f"PayPal transfer of ${amount} to {self._email}")


class CryptoPayment(PaymentStrategy):
    def __init__(self, wallet_address: str):
        self._wallet = wallet_address

    def pay(self, amount: Decimal) -> None:
        print(f"Broadcast ${amount} BTC to {self._wallet}")


# ── Context ───────────────────────────────────────────────────────────────────

class Checkout:
    def __init__(self, strategy: PaymentStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: PaymentStrategy) -> None:
        """Swap the algorithm at runtime — e.g. user changes payment method."""
        self._strategy = strategy

    def complete_purchase(self, amount: Decimal) -> None:
        self._strategy.pay(amount)


# ── Usage ─────────────────────────────────────────────────────────────────────

cart = Checkout(CreditCardPayment("4111111111111234"))
cart.complete_purchase(Decimal("59.99"))

# User switches to PayPal at the last second — no Checkout code changes.
cart.set_strategy(PayPalPayment("user@example.com"))
cart.complete_purchase(Decimal("59.99"))
```

> [!note]
> `Checkout.complete_purchase` never branches on payment type. Adding a new payment method means adding one new class — `Checkout` is never touched. This is the Open/Closed Principle in practice.

## Real-world examples

| Domain | Varying algorithm | How Strategy applies |
| --- | --- | --- |
| **Sorting** | Comparison key | Python’s `sorted(items, key=fn)` and `list.sort(key=fn)` pass a comparison function as a strategy. Java’s `Comparator<T>` is the same idea as a typed object. |
| **Compression** | Compression algorithm (zlib, bz2, lzma) | A file archiver holds a `CompressorStrategy`; the user picks the algorithm; the archiver compresses without caring which one. |
| **Route planning** | Optimisation criterion (fastest, shortest, fewest tolls) | A navigation engine holds a `RoutingStrategy`; swapping it changes what "best route" means without touching the graph-search code. |
| **Validation** | Validation rules (form field, credit card, IBAN) | A validator holds a set of `ValidationStrategy` objects; rules are assembled per-context and applied uniformly. |
| **Pricing / discounts** | Pricing rule (standard, bulk, loyalty, promotional) | An `Order` delegates `calculate_price` to a `PricingStrategy`; campaigns inject a different strategy without touching `Order`. |

## Pros and cons

|  | Detail |
| --- | --- |
| **Pro — kills conditionals** | Removes the if/elif/switch that grows with every new variant. The context never needs to know about new algorithms. |
| **Pro — runtime swap** | The active algorithm can change during a single object’s lifetime (`set_strategy`). Impossible with hard-coded logic or inheritance. |
| **Pro — Open/Closed** | New algorithms extend the system by adding a class, not by modifying the context. Context source stays closed to modification. |
| **Pro — isolated testability** | Each concrete strategy can be unit-tested independently, without constructing the full context. The context can be tested with a trivially simple stub strategy. |
| **Pro — explicit dependency** | The strategy is a visible constructor argument — the context’s variation point is self-documenting. |
| **Con — class proliferation** | Each algorithm variant becomes a class. Simple cases with two or three variants may not justify the scaffolding; a plain function may suffice. |
| **Con — caller must choose** | The client is responsible for selecting and constructing the correct strategy. In complex cases a Factory or configuration layer must be added to centralise that decision. |
| **Con — shared state is awkward** | If concrete strategies need data from the context, it must be passed explicitly on each call or the strategies must receive a reference back to the context — which increases coupling. |

## Strategy vs. related patterns

| Pattern | Core concern | Key difference from Strategy |
| --- | --- | --- |
| **State** | An object changes its own behaviour as internal state changes. | The context (or the state objects themselves) drives transitions. Strategies are passive and do not know about each other; states actively trigger moves to the next state. |
| **Template Method** | A base class defines the algorithm skeleton; subclasses fill in steps. | Uses **inheritance** — the variant is baked in at class-definition time. Strategy uses **composition** — the variant is injected at runtime. Same intent, different mechanism; GoF explicitly notes this contrast. |
| **Command** | Encapsulates a **request** (with receiver, parameters, and optional undo) as an object. | A Command encapsulates **what to do and to whom**; a Strategy encapsulates **how to compute something**. Commands are often queued, logged, or undone; strategies are rarely stored beyond current use. |
| **Decorator** | Adds responsibilities to an object dynamically by wrapping it. | Decorators stack — each layer adds behaviour on top of the previous one. Strategies replace — one algorithm is active at a time and there is no layering. |

> [!tip]
> A useful mnemonic: **Strategy** = **State** minus self-transitions; **Strategy** = **Template Method** done with composition instead of inheritance.

## Strategy as formalised dependency injection

Injecting a `PaymentStrategy` into `Checkout` is dependency injection. The strategy pattern is the canonical expression of two principles working together:

1. **Favor composition over inheritance** — the algorithm is a **has-a** relationship, not baked into a subclass.
2. **Inversion of Control** — `Checkout` does not choose or construct its collaborator; the collaborator is handed in from outside.

This means Strategy, composition-over-inheritance, and IoC/DI are not separate ideas — they are three framings of the same move.

## Relation to other foundational concepts

* [[composition-over-inheritance|Composition over Inheritance]] — Strategy is the canonical behavioral instantiation of this principle: behavior is assembled from injected objects, not inherited from a superclass.
* [[inversion-of-control|Inversion of Control]] — injecting a strategy into a context **is** IoC/DI; the context delegates rather than instantiates.
* [[solid|SOLID (OCP / DIP)]] — OCP: adding a strategy never modifies the context. DIP: the context depends on the abstract `PaymentStrategy`, not any concrete implementation.
* [[command-pattern|Command Pattern]] — sibling behavioral pattern; encapsulates requests rather than algorithms. Often confused with Strategy; the difference is intent and lifecycle.
* [[decorator-pattern|Decorator Pattern]] — sibling structural pattern; also uses composition but stacks behaviors rather than replacing one at a time.
* [[encapsulation|Encapsulation]] — each concrete strategy hides its implementation details behind the interface; the context cannot reach inside a strategy.
