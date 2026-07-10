---
title: "Repository Pattern"
tags: [architecture, patterns]
level: deep
type: reference
---


A **Repository** mediates between the domain layer and the data-mapping layer, exposing a collection-like interface for accessing domain objects. Popularised by **Eric Evans** in _Domain-Driven Design_ (2003) and catalogued by **Martin Fowler** in _Patterns of Enterprise Application Architecture_ (PoEAA, 2002).

A Repository represents all objects of a certain type as a conceptual set. It acts like a collection, except with more elaborate querying capability.

## Core idea

Your domain code asks a repository for objects as if reaching into an in-memory collection. The repository hides **how** and **where** those objects are stored, whether that is a relational database, a REST API, a flat file, a cache, or a combination.

| Without Repository | With Repository |
| --- | --- |
| SQL, connection strings, column indexes, and ORM calls scattered through service classes. | Service classes speak in domain terms: `get`, `save`, `find_by_email`. |
| Business logic coupled to Postgres (or whichever storage engine is currently in use). | Storage is an implementation detail behind an interface the domain owns. |
| Tests require a running database, slow, brittle, hard to isolate. | Tests swap in an in-memory implementation, fast and deterministic. |

> [!note]
> The key shift is **who owns the abstraction**. The domain defines the interface; the infrastructure implements it. This is a direct application of the Dependency Inversion Principle.

## The interface

Define the repository as an abstract class (or Protocol) in your domain layer. It speaks domain language, domain objects in, domain objects out. No SQL, no HTTP, no file paths.

```python
from abc import ABC, abstractmethod
from typing import Optional
from domain.order import Order


class OrderRepository(ABC):
    """Collection-like abstraction for Order persistence.
    Belongs to the domain layer - infrastructure implements it."""

    @abstractmethod
    def get(self, order_id: int) -> Optional[Order]:
        """Return the Order with this id, or None if not found."""
        ...

    @abstractmethod
    def save(self, order: Order) -> None:
        """Persist a new or updated Order."""
        ...

    @abstractmethod
    def find_by_customer_email(self, email: str) -> list[Order]:
        """Return all Orders placed by this customer."""
        ...

    @abstractmethod
    def remove(self, order_id: int) -> None:
        """Delete the Order with this id."""
        ...
```

## The service (dependency injection)

The service receives the repository via constructor injection. It never imports a concrete storage class, it depends only on the abstract interface.

```python
from domain.order import Order
from domain.repositories import OrderRepository


class OrderService:
    """Pure domain logic. Has no knowledge of databases, files, or HTTP."""

    def __init__(self, orders: OrderRepository) -> None:
        self._orders = orders

    def place_order(self, order: Order) -> None:
        if not order.line_items:
            raise ValueError("Cannot place an empty order.")
        self._orders.save(order)

    def cancel_order(self, order_id: int) -> None:
        order = self._orders.get(order_id)
        if order is None:
            raise LookupError(f"Order {order_id} not found.")
        order.cancel()
        self._orders.save(order)

    def orders_for_customer(self, email: str) -> list[Order]:
        return self._orders.find_by_customer_email(email)
```

## Concrete implementations

### PostgresOrderRepository

```python
import psycopg2
from typing import Optional
from domain.order import Order
from domain.repositories import OrderRepository


class PostgresOrderRepository(OrderRepository):
    def __init__(self, connection) -> None:
        self._conn = connection

    def get(self, order_id: int) -> Optional[Order]:
        cur = self._conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()
        return _row_to_order(row) if row else None

    def save(self, order: Order) -> None:
        cur = self._conn.cursor()
        cur.execute(
            """INSERT INTO orders (id, customer_email, status)
               VALUES (%s, %s, %s)
               ON CONFLICT (id) DO UPDATE
               SET status = EXCLUDED.status""",
            (order.id, order.customer_email, order.status),
        )
        self._conn.commit()

    def find_by_customer_email(self, email: str) -> list[Order]:
        cur = self._conn.cursor()
        cur.execute("SELECT * FROM orders WHERE customer_email = %s", (email,))
        return [_row_to_order(row) for row in cur.fetchall()]

    def remove(self, order_id: int) -> None:
        cur = self._conn.cursor()
        cur.execute("DELETE FROM orders WHERE id = %s", (order_id,))
        self._conn.commit()
```

### InMemoryOrderRepository (for tests)

```python
from typing import Optional
from domain.order import Order
from domain.repositories import OrderRepository


class InMemoryOrderRepository(OrderRepository):
    """Fast, zero-dependency implementation for unit tests."""

    def __init__(self) -> None:
        self._store: dict[int, Order] = {}

    def get(self, order_id: int) -> Optional[Order]:
        return self._store.get(order_id)

    def save(self, order: Order) -> None:
        self._store[order.id] = order

    def find_by_customer_email(self, email: str) -> list[Order]:
        return [o for o in self._store.values() if o.customer_email == email]

    def remove(self, order_id: int) -> None:
        self._store.pop(order_id, None)
```

```python
# Test - no database required
def test_cancel_order_marks_it_cancelled():
    repo = InMemoryOrderRepository()
    order = Order(id=1, customer_email="a@b.com", line_items=["widget"])
    repo.save(order)

    service = OrderService(orders=repo)
    service.cancel_order(1)

    assert repo.get(1).status == "cancelled"
```

## Benefits

* **Testability**: swap the concrete implementation for `InMemoryOrderRepository`; no database, no network, no setup fixtures.
* **Swappable storage**: change from Postgres to DynamoDB by writing one new class; the domain and all its tests remain untouched.
* **Centralised data logic**: queries, caching strategy, and mapping all live in one place instead of scattered across services.
* **Separation of concerns**: the domain layer knows nothing about infrastructure; the infrastructure knows nothing about business rules.
* **Domain language**: the interface speaks in terms the business understands (`find_by_customer_email`), not in database terms (`SELECT ... WHERE email = ?`).

## Nuances and criticisms

### Don’t add a Repository on top of Active Record

Active Record (used by Django ORM, Rails ActiveRecord) **is already a repository-flavoured abstraction**. Wrapping it in another Repository layer usually produces pointless indirection with no additional isolation benefit. Apply the pattern when you own the mapping layer or when you need to swap storage.

### Repository vs. DAO

|  | Repository | DAO (Data Access Object) |
| --- | --- | --- |
| **Granularity** | Domain-level, may aggregate multiple tables or sources into one rich object. | Table-level, one DAO per table, exposes CRUD for that table only. |
| **Language** | Speaks domain concepts: `find_active_subscriptions`. | Speaks storage concepts: `select_by_status("active")`. |
| **Origin** | Evans DDD, Fowler PoEAA. | J2EE patterns (Core J2EE Patterns, 2001). |

> [!tip]
> If your "repository" method names look like column names and SQL clauses, you have a DAO. That is not wrong, it is just a different pattern with a different purpose.

### Leaky abstractions, avoid returning `IQueryable`

Some ORM-backed repositories return a raw queryable/lazy collection (`IQueryable<T>` in C#, or an unexecuted SQLAlchemy `Query` object in Python). This leaks the query mechanism through the interface: callers can append arbitrary filter conditions, and the abstraction no longer hides anything. Return materialised collections (`list`, `Optional`) or typed query methods.

### Repository as a Port

In **Hexagonal Architecture** (Ports and Adapters, Alistair Cockburn), the abstract `OrderRepository` is the **port** and `PostgresOrderRepository` is the **adapter**. The terms differ; the structural idea is identical: the domain defines a boundary, the infrastructure plugs into it.

```
Domain (core)
  └── OrderRepository (port / abstract interface)

Infrastructure (adapters)
  ├── PostgresOrderRepository
  ├── DynamoOrderRepository
  └── InMemoryOrderRepository
```

## Relation to other foundational concepts

* [[inversion-of-control|Inversion of Control / Dependency Injection]]: the Repository is injected into services; the domain owns the interface, the infrastructure owns the implementation. This is the Dependency Inversion Principle in concrete form.
* [[solid|SOLID]]: DIP (D) motivates the abstract interface; SRP (S) keeps the repository focused on access, not business rules.
* [[coupling-and-cohesion|Coupling and Cohesion]]: the Repository reduces efferent coupling of the domain to the storage engine, and raises cohesion by grouping all data-access logic for an aggregate in one place.
* [[specification-pattern|Specification Pattern]]: a natural companion for complex querying: encode filter criteria as a `Specification` object and pass it to `repository.find(spec)` instead of proliferating `find_by_*` methods.
* [[cqs|CQS]]: repository methods are cleanly separable into commands (`save`, `remove`) and queries (`get`, `find_by_*`); applying CQS discipline here prevents methods that mutate and return data simultaneously.
* [[strategy-pattern|Strategy Pattern]]: the concrete repository implementation (Postgres, in-memory, S3) is a strategy: a family of interchangeable algorithms behind a common interface.
