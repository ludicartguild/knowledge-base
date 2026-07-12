---
title: "Specification Pattern"
tags: [architecture, patterns]
level: deep
type: reference
reviewed: 2026-07-12
---


A **Specification** encapsulates a single business rule, a yes/no predicate, as a named, reusable object so that rules can be tested in isolation, combined with boolean logic (AND, OR, NOT), and applied consistently across validation, selection, and querying. Popularised by **Eric Evans** in _Domain-Driven Design_ (2003) and detailed in Evans and **Martin Fowler**'s paper _Specifications_.

A Specification is a predicate that determines whether an object does or does not satisfy some criteria. It is a separate object, not a method hidden inside another class.

## Core idea

Turn a predicate (`is_satisfied_by(obj) -> bool`) into a first-class composable object. The pattern has two primary use cases:

1. **In-memory validation and selection**, filter a collection of domain objects already in memory.
2. **Querying**, translate the specification into a persistence query (SQL `WHERE` clause, ORM filter, Elasticsearch query) so only matching records are fetched from storage.

Because both use cases share the same specification object, a rule written once drives both runtime checks and database queries, no duplication between validation logic and query parameters.

## The anti-pattern: scattered conditionals

```python
# checkout_service.py
def apply_discount(customer):
    if customer.total_spend > 1000 and customer.years_as_member >= 2:
        customer.apply_discount(0.15)

# marketing_service.py
def send_vip_campaign(customers):
    # Same rule - copy-pasted and already drifting (uses > vs >=)
    return [c for c in customers if c.total_spend >= 1000 and c.years_as_member > 2]

# report_service.py
def premium_report():
    # Third copy - nobody knows which version is authoritative
    return db.query(
        "SELECT * FROM customers WHERE total_spend > 1000 AND years >= 2"
    )
```

The same business rule lives in three places with three slightly different thresholds. When the rule changes, all three must be found and updated in sync. The Specification pattern gives this rule one canonical home.

## Building blocks

### Base class and combinators

```python
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import TypeVar, Generic

T = TypeVar("T")


class Specification(ABC, Generic[T]):
    """A first-class, composable business rule predicate."""

    @abstractmethod
    def is_satisfied_by(self, candidate: T) -> bool:
        """Return True if the candidate meets the rule."""
        ...

    def __and__(self, other: Specification[T]) -> AndSpecification[T]:
        return AndSpecification(self, other)

    def __or__(self, other: Specification[T]) -> OrSpecification[T]:
        return OrSpecification(self, other)

    def __invert__(self) -> NotSpecification[T]:
        return NotSpecification(self)


class AndSpecification(Specification[T]):
    def __init__(self, left: Specification[T], right: Specification[T]) -> None:
        self._left = left
        self._right = right

    def is_satisfied_by(self, candidate: T) -> bool:
        return self._left.is_satisfied_by(candidate) and self._right.is_satisfied_by(candidate)


class OrSpecification(Specification[T]):
    def __init__(self, left: Specification[T], right: Specification[T]) -> None:
        self._left = left
        self._right = right

    def is_satisfied_by(self, candidate: T) -> bool:
        return self._left.is_satisfied_by(candidate) or self._right.is_satisfied_by(candidate)


class NotSpecification(Specification[T]):
    def __init__(self, spec: Specification[T]) -> None:
        self._spec = spec

    def is_satisfied_by(self, candidate: T) -> bool:
        return not self._spec.is_satisfied_by(candidate)
```

> [!note]
> The combinators (`AndSpecification`, `OrSpecification`, `NotSpecification`) are the **Composite** pattern applied to predicates: a composite specification satisfies the same interface as a leaf specification, so callers never distinguish between them.

### Concrete specifications

```python
from dataclasses import dataclass


@dataclass
class Customer:
    name: str
    total_spend: float
    years_as_member: int


class HighSpender(Specification[Customer]):
    """Customer whose lifetime spend exceeds a threshold."""

    def __init__(self, threshold: float) -> None:
        self._threshold = threshold

    def is_satisfied_by(self, candidate: Customer) -> bool:
        return candidate.total_spend > self._threshold


class LoyalCustomer(Specification[Customer]):
    """Customer who has been a member for at least N years."""

    def __init__(self, min_years: int) -> None:
        self._min_years = min_years

    def is_satisfied_by(self, candidate: Customer) -> bool:
        return candidate.years_as_member >= self._min_years
```

### Composing rules

```python
# One named rule, defined once, used everywhere.
is_premium = HighSpender(1000) & LoyalCustomer(2)

customers = [
    Customer("Alice", total_spend=1500.0, years_as_member=3),
    Customer("Bob",   total_spend=200.0,  years_as_member=5),
    Customer("Carol", total_spend=1200.0, years_as_member=1),
]

# In-memory selection
premium_customers = [c for c in customers if is_premium.is_satisfied_by(c)]
# → [Alice]

# Single-use negation and composition
at_risk = LoyalCustomer(5) & ~HighSpender(500)
at_risk_customers = [c for c in customers if at_risk.is_satisfied_by(c)]
# → [Bob] - long-term member but low spender
```

## Use case 1, in-memory validation and selection

The caller passes a specification to a service or filter function. The service has no knowledge of the rule’s internals.

```python
class CustomerService:
    def __init__(self, customers: list[Customer]) -> None:
        self._customers = customers

    def find_satisfying(self, spec: Specification[Customer]) -> list[Customer]:
        return [c for c in self._customers if spec.is_satisfied_by(c)]

    def is_eligible_for_discount(self, customer: Customer, spec: Specification[Customer]) -> bool:
        return spec.is_satisfied_by(customer)


service = CustomerService(customers)
print(service.find_satisfying(is_premium))          # [Alice]
print(service.is_eligible_for_discount(customers[0], is_premium))  # True
```

## Use case 2, querying via Repository

A **query specification** extends the base to also describe which records to **fetch** from storage. This is the natural pairing with the Repository pattern: instead of proliferating `find_by_spend_and_years()` methods, the repository accepts a specification and delegates translation to it.

> [!warning]
> The boolean combinators shown earlier (`__and__`/`__or__`) return the in-memory `AndSpecification`/`OrSpecification`, which implement `is_satisfied_by` but **not** `to_sql()`. So composing two query specifications with `&`/`|` yields a spec that can filter in memory but cannot translate to SQL. Making composition work at the query layer requires query-aware composite specifications (an `AndSpecification` that builds its own SQL by combining its children's `to_sql()`), or translating the composite tree to SQL at the repository boundary.

```python
from abc import abstractmethod


class QueryableSpecification(Specification[Customer]):
    """A specification that can also translate itself into a SQL predicate."""

    @abstractmethod
    def to_sql(self) -> tuple[str, list]:
        """Return (WHERE clause fragment, bind parameters)."""
        ...


class HighSpenderQuery(QueryableSpecification):
    def __init__(self, threshold: float) -> None:
        self._threshold = threshold

    def is_satisfied_by(self, candidate: Customer) -> bool:
        return candidate.total_spend > self._threshold

    def to_sql(self) -> tuple[str, list]:
        return "total_spend > ?", [self._threshold]


class LoyalCustomerQuery(QueryableSpecification):
    def __init__(self, min_years: int) -> None:
        self._min_years = min_years

    def is_satisfied_by(self, candidate: Customer) -> bool:
        return candidate.years_as_member >= self._min_years

    def to_sql(self) -> tuple[str, list]:
        return "years_as_member >= ?", [self._min_years]


# Repository uses the spec to build the query
class CustomerRepository:
    def __init__(self, connection) -> None:
        self._conn = connection

    def find(self, spec: QueryableSpecification) -> list[Customer]:
        clause, params = spec.to_sql()
        rows = self._conn.execute(f"SELECT * FROM customers WHERE {clause}", params)
        return [Customer(**row) for row in rows]
```

> [!tip]
> The `to_sql()` translation is the genuinely hard part. Composite specifications (`AndSpecification`, `OrSpecification`) must also implement `to_sql()`, recursively combining their children’s SQL fragments. In practice this is manageable for simple cases but grows complex quickly, see the pros/cons table.

## Pros and cons

|  | Detail |
| --- | --- |
| **Pro, single source of truth** | Each business rule has one canonical definition. Change `HighSpender(1000)` once and every caller, validation, selection, querying, picks it up. |
| **Pro, composable** | AND, OR, NOT combinators build complex rules from simple building blocks without writing new classes. |
| **Pro, isolated testability** | Each spec can be unit-tested against a handful of fixture objects; no database, no service wiring required. |
| **Pro, reusable across contexts** | The same `is_premium` spec can drive a checkout discount, a marketing filter, a scheduled report, and a database query. |
| **Pro, names rules explicitly** | `is_premium` is far more legible than `c.total_spend > 1000 and c.years_as_member >= 2` inline. |
| **Con, more classes** | Every distinct rule becomes a class. A module with twenty business rules produces twenty spec classes before any combinators are defined. |
| **Con, overkill for one-off simple rules** | If a rule is used in exactly one place and will never change, a plain `if` statement or a private method is less ceremony. |
| **Con, spec-to-SQL translation is genuinely complex** | Composite specs (`And`, `Or`, `Not`) must recursively produce valid SQL. Handling joins, subqueries, NULL semantics, and ORM-specific syntax is non-trivial. Some teams separate query and validation specs entirely rather than share a single hierarchy. |
| **Con, type constraints are awkward** | A generic `Specification[T]` works cleanly in Python, but composing specs of different types (customer spec AND order spec) is not naturally supported. |

## Design relationships

### Composite pattern

The AND/OR/NOT combinators are a direct application of the **Composite** pattern: a `Specification` node is either a leaf (concrete rule) or a composite (combinator wrapping two children). Callers interact with the root node identically regardless of depth.

### Strategy pattern

A single concrete specification behaves as a **Strategy**: it encapsulates a decision algorithm (`is_satisfied_by`) behind a stable interface and can be swapped for another without changing the caller. Composing specifications is Composite applied to Strategies.

### Repository pattern

The query specification variant is designed to pair with a **Repository**. The repository exposes a `find(spec)` method and delegates predicate evaluation (or SQL generation) to the specification, keeping the repository interface narrow and the filter logic co-located with the rule rather than buried in a query method.

## Practice & self-check

**Practice**

* Implement the `Specification` base with `__and__`/`__or__`/`__invert__` and two concrete rules (`HighSpender`, `LoyalCustomer`), then compose `is_premium = HighSpender(1000) & LoyalCustomer(2)` and use the one object for both in-memory filtering and an eligibility check.
* Take the three drifting copies of the premium-customer rule from the anti-pattern section and consolidate them into a single specification; confirm changing the threshold now happens in exactly one place.
* Reproduce the query-layer trap: compose two `QueryableSpecification` objects with `&` and observe that the resulting `AndSpecification` has no `to_sql()`. State when NOT to use the pattern (a one-off rule used in a single place that will never change).

**Check yourself** (you should be able to answer these from this note):

* What single method defines a specification, and what are the pattern's two primary use cases?
* Which pattern do the AND/OR/NOT combinators implement, and why can callers treat a leaf and a composite identically?
* Why is `to_sql()` translation the genuinely hard part, and what must composite specs do recursively?
* How does a single specification relate to the Strategy pattern, and how does it pair with a Repository's `find(spec)` method?

## Relation to other foundational concepts

* [[repository-pattern|Repository Pattern]]: the natural pairing: the repository exposes `find(spec)` and the specification handles both in-memory filtering and query translation, keeping the repository interface narrow.
* [[strategy-pattern|Strategy Pattern]]: a single specification is a strategy (interchangeable predicate algorithm); the Composite/AND/OR combinators stack strategies into trees.
* [[composition-over-inheritance|Composition over Inheritance]]: the AND/OR/NOT combinators compose specification objects rather than subclassing to add conditions; complex rules are built from simple parts.
* [[dry|DRY]]: the pattern’s primary motivation: consolidate a scattered predicate to a single, canonical specification class rather than copying `if` conditions across modules.
* [[solid|SOLID]]: SRP (each class encapsulates one rule), OCP (add new rules by writing new spec classes, not modifying existing ones), and DIP (services depend on the abstract `Specification` interface, not concrete rule implementations).
* [[encapsulation|Encapsulation]]: the specification hides the rule’s internal logic (threshold values, field access) behind `is_satisfied_by`, protecting callers from implementation details and preventing the rule from drifting in isolation.
