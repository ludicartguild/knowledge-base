---
title: "Async Data Access, Pooling & ORMs"
tags: [data, backend]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Talking to a database is the slowest thing most backends do. Three techniques
make that fast and safe: **async drivers** let a single thread handle many
in-flight queries instead of parking a thread per query; **connection pools**
reuse a small set of expensive database connections instead of opening one per
request; and **ORMs** (with sessions and a unit-of-work) turn rows into objects
and generate parameterized [[glossary#s|SQL]] so you write less repetitive, injection-prone
code. Each layer trades some control for convenience, and each has a signature
failure mode: forgetting to await I/O, exhausting the pool, and the N+1 query
problem.

## Why it exists

**Blocking database calls waste threads.** In a classic synchronous server, a
request handler that runs a query blocks its thread until the database answers.
That thread does nothing useful while it waits on the network. Under load you
either run out of threads or pay for a huge thread pool, most of which sits idle
mid-query. Database round trips are dominated by waiting, not by CPU work, so
this is exactly the workload where blocking a thread per request is wasteful.

**Connection setup is expensive.** Opening a new database connection is not
free: it means a TCP handshake, often a [[glossary#t|TLS]] negotiation, authentication, and
server-side setup. On the server, each connection also costs real resources.
PostgreSQL, for example, sizes shared memory and other resources directly off
`max_connections` and spawns a backend process per connection, which is why the
default cap is deliberately conservative (around 100). Opening a fresh
connection for every request would add latency to every request and quickly
exhaust the server.

**Raw SQL is repetitive and unsafe when done by hand.** Hand-writing the same
select/insert/update statements, wiring result columns back into objects, and
tracking which objects changed is tedious boilerplate. Worse, building SQL by
concatenating user input is the classic path to SQL injection. Both problems
push teams toward a layer that generates SQL and maps results for them.

## How it works

### Async DB drivers and the event loop

An async application runs on an **event loop**: a single-threaded scheduler that
juggles many concurrent tasks. When a task hits an I/O operation it `await`s,
the loop suspends that task and runs another until the I/O completes. This only
works if every step that waits on I/O actually yields to the loop. A blocking
driver defeats the whole model, so async code needs a driver written for it (for
example an async PostgreSQL driver that speaks the wire protocol without
blocking). One event-loop thread can then have hundreds of queries in flight,
each parked at its `await` until the database responds.

The critical discipline: **any operation that touches the network must be
awaited.** A function that silently does hidden I/O without an `await` point
breaks the loop's assumptions. This is the root cause behind the most confusing
async data bugs (see lazy loading below).

### Connection pooling and why pools exist

A **connection pool** keeps a small set of already-open connections and hands
them out for the duration of a query or transaction, then takes them back. The
expensive setup happens once; requests borrow and return a warm connection in
microseconds. The pool also acts as a throttle: if it holds at most N
connections, the database never sees more than N concurrent clients from that
service, protecting the server's connection cap.

Key pool parameters you will tune:

- **Pool size:** how many connections to keep open steadily.
- **Max overflow / burst:** how many extra connections may open temporarily
  under load before requests must wait.
- **Timeout:** how long a caller waits for a free connection before erroring.
- **Recycle / max lifetime:** proactively close and reopen connections after a
  set age so you do not hold stale ones the database or a network device may
  have silently dropped.

Pools interact with async in one sharp way: a pool is tied to the event loop it
was created on. Sharing one engine or pool across multiple event loops (or
across a `fork()`) leads to corruption; the standard fixes are to dispose the
engine before reuse or to disable pooling for that scenario. Async ORMs
typically back their pool with an async-aware queue rather than a threaded one.

In many deployments a separate **external pooler** (a proxy that sits between the
application and the database) is added on top of the in-process pool, especially
when many service instances each hold their own pool and their combined
connections would otherwise blow past the server cap.

### ORMs and query builders vs raw SQL

Three broad styles sit on top of the driver:

- **Raw SQL:** you write the SQL string and read back rows. Maximum control,
  maximum boilerplate, and you own safety and mapping yourself.
- **Query builder:** a fluent [[glossary#a|API]] composes SQL for you (`select(...).where(...)`)
  and returns rows or lightweight records. It removes string-building and
  injection risk but does not map to a rich object graph.
- **[[glossary#o|ORM]] (object-relational mapper):** you define classes that map to tables; the
  ORM generates SQL, maps rows to objects, tracks changes, and manages
  relationships. Most control is traded away for a big drop in boilerplate.

An ORM is not all-or-nothing: mature ORMs let you drop to a query builder or a
raw statement for the queries that need it while keeping object mapping for the
rest.

### Sessions and the unit-of-work

An ORM **session** is the boundary that implements the **unit-of-work** pattern.
Within a session the ORM tracks every object you load or create, remembers which
ones changed, and on **commit** flushes exactly the needed inserts, updates, and
deletes as one transaction. Benefits: you mutate plain objects and let the
session figure out the SQL; related writes commit atomically; and an
**identity map** ensures a given row loaded twice is the same in-memory object,
avoiding conflicting copies.

Session lifetime should track a unit of work, typically one per request. Sessions
are usually not safe to share across concurrent tasks: in async code each
concurrent task needs its own session, and each session should be scoped, used,
and closed rather than kept as a long-lived global.

### The N+1 query problem

The classic ORM performance trap. You load a list of N parent rows, then in a
loop touch a related attribute on each one. If that relationship is
**lazy-loaded**, each access fires its own query: one query for the parents plus
N queries for the children, hence "N+1." With N in the hundreds this turns one
logical read into hundreds of round trips.

The fix is **eager loading**: tell the ORM to fetch the related rows up front,
either with a join or with a single follow-up `IN (...)` query keyed on the
parents. Reducing N+1 to two queries (or one join) is one of the highest-leverage
data optimizations there is.

Async raises the stakes. Lazy loading works by doing hidden I/O the moment you
touch an attribute, but async forbids hidden un-awaited I/O. So in async ORMs
lazy loading is disallowed or dangerous by default, and eager loading (or an
explicitly awaitable attribute API) is not just faster, it is required. The N+1
smell becomes a hard error, which is arguably a good thing.

### Parameterized queries to prevent SQL injection

Never build SQL by concatenating values into the string. Instead send the SQL
with **placeholders** and pass the values separately, so the database treats them
strictly as data, never as executable SQL:

```
# unsafe: value is spliced into the SQL text
"SELECT * FROM widgets WHERE name = '" + user_input + "'"

# safe: placeholder, value bound separately
"SELECT * FROM widgets WHERE name = :name", {"name": user_input}
```

Query builders and ORMs parameterize automatically, which is a major safety
reason to prefer them over hand-built strings. When you do drop to raw SQL, use
the driver's bind parameters; do not fall back to string formatting. (Note that
identifiers such as table and column names usually cannot be parameterized, so
those must be validated against an allowlist, not interpolated from user input.)

### When to drop to raw SQL

An ORM earns its keep on ordinary create/read/update/delete work. Reach for raw
SQL (or a hand-tuned builder query) when:

- The query is complex enough that the ORM generates inefficient SQL: heavy
  aggregations, window functions, recursive CTEs, or intricate joins.
- You need database-specific features the ORM does not expose.
- A hot path needs a precise execution plan and you want to control the exact
  SQL.
- You are doing bulk operations where per-object change tracking is pure
  overhead.

Even then, keep the raw statement parameterized and, where possible, run it
through the same session/connection so it participates in the surrounding
transaction.

## Trade-offs & when to use

**ORM convenience vs control.** ORMs remove boilerplate, prevent injection by
default, and give you atomic units of work, at the cost of generating SQL you did
not write and hiding cost behind attribute access (the N+1 trap). The pragmatic
stance: ORM for the bulk of routine access, raw SQL for the few queries that
genuinely need it. Avoid the extremes of "hand-write every query" and "never
look at the generated SQL."

**Async complexity.** Async pays off for I/O-bound services with many concurrent
requests waiting on the database or other services; it lets one thread serve high
concurrency cheaply. It costs you a more demanding programming model: every I/O
must be awaited, sessions and connections are not shareable across tasks, one
accidental blocking call stalls the whole loop, and the toolchain (driver, pool,
ORM) must all be async-aware. For a simple, low-concurrency, or CPU-bound
service, a synchronous stack with a modest thread pool is often simpler and fast
enough. Do not adopt async for its own sake.

## Pitfalls / done-right checklist

- **Do** use an async driver end to end; a single blocking call inside the event
  loop stalls every concurrent request.
- **Do** size the pool deliberately and account for every service instance: total
  connections across instances must stay under the database's cap. Add an
  external pooler when many instances would otherwise overwhelm it.
- **Do** set a pool acquire timeout so a saturated pool fails fast instead of
  hanging forever.
- **Do** recycle connections by max lifetime to avoid stale/dropped connections.
- **Do** scope one session/unit-of-work per request and give each concurrent
  task its own session; never share a session across tasks.
- **Do** eager-load relationships you will iterate; treat an N+1 pattern as a bug.
- **Do** parameterize every query, including raw SQL; validate identifiers
  against an allowlist since they cannot be bound as parameters.
- **Don't** hold a database connection while doing unrelated slow work; borrow
  late, return early.
- **Don't** share one engine/pool across event loops or across a process fork;
  dispose or disable pooling in those cases.
- **Don't** let sessions or transactions live longer than the work they cover;
  long-open transactions hold locks and pool slots.

## Mental model

Picture three nested loops of reuse and safety. The **event loop** reuses one
thread across many waiting queries so no thread sits idle on the network. The
**connection pool** reuses a few expensive connections across many requests so no
request pays setup cost and the database is never swamped. The **session** reuses
one transaction boundary across many object changes so a unit of work commits
atomically and safely. The ORM sits on top translating objects to parameterized
SQL. Every one of these layers is fundamentally about not paying a cost more than
once, and every one has a signature failure when you break its contract: an
un-awaited call stalls the event loop, an oversized fan-out exhausts the pool,
and a lazy attribute access in a loop detonates as N+1.

## Cross-links

- [[databases]]
- [[backends-bff-and-apis]]
- [[reliability-patterns]]

## Sources

- SQLAlchemy, "Asynchronous I/O (asyncio)" documentation: async engine/session
  model, greenlet adapter, asyncio queue pooling, one-loop-per-engine guidance,
  sessions not safe across concurrent tasks, and lazy-loading restrictions with
  eager-loading (`selectinload`) as the remedy.
  https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- SQLAlchemy, "Relationship Loading Techniques": lazy vs eager loading and the
  N+1 query problem. https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html
- SQLAlchemy, "Connection Pooling": pool size, max overflow, timeout, and
  connection recycling. https://docs.sqlalchemy.org/en/20/core/pooling.html
- SQLAlchemy, "Session Basics" / unit-of-work and identity map concepts.
  https://docs.sqlalchemy.org/en/20/orm/session_basics.html
- PostgreSQL, "Connection Settings": `max_connections`, per-connection resource
  and shared-memory sizing, and the conservative default cap.
  https://www.postgresql.org/docs/current/runtime-config-connection.html
- asyncpg documentation: a non-blocking PostgreSQL driver for asyncio and its
  use of bind parameters. https://magicstack.github.io/asyncpg/current/
- Martin Fowler, "Patterns of Enterprise Application Architecture": Unit of Work
  and Identity Map patterns. https://martinfowler.com/eaaCatalog/unitOfWork.html
- OWASP, "SQL Injection Prevention Cheat Sheet": parameterized queries as the
  primary defense. https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
