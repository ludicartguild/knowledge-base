---
title: "Concurrency Control & Idempotent Writes"
tags: [data, backend]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Two writers hitting the same row at the same time can quietly clobber each
other's work (the **lost update** problem), and one writer whose request got
retried can apply the same change twice (a **duplicate**). Both are correctness
bugs, and both are fixed at the data layer rather than by hoping the application
code times things right. The database gives you a small toolkit for this:
**optimistic concurrency** with a version column (detect a clash on write and
retry), **pessimistic locking** with `SELECT ... FOR UPDATE` (take a row lock so
nobody else can touch the row until you commit), **unique constraints** as a
hard correctness backstop, **`INSERT ... ON CONFLICT`** (UPSERT) for atomic
insert-or-update, an **idempotency-key table** to deduplicate retried
operations, and **transactions plus isolation levels** to make a multi-step
write behave as one atomic, all-or-nothing unit. This note is the data-layer
companion to [[reliability-patterns]], which covers idempotency and retries as a
general distributed-systems idea. Here the question is narrower: how does the
database itself enforce it.

## Why it exists

A database serves many connections at once, and by default their transactions
interleave. That concurrency is what makes a database fast, but it creates two
failure modes that naive read-modify-write code walks straight into.

The first is the **lost update**. Two transactions both read the same row, each
computes a new value from what it read, and each writes it back. The second
write overwrites the first, and the first update is simply gone with no error
raised. The classic shape is "read a balance of 100, add 10, write 110" running
concurrently with "read 100, add 20, write 120". One of the two increments
vanishes; the final value is 110 or 120 when it should be 130. Nothing crashed,
nothing logged an error, the data is just wrong.

The second is the **double-apply on retry**. A client sends a write, the server
performs it, and the acknowledgment is lost on the way back (a timeout, a
dropped connection). The client cannot tell "it did not happen" from "it happened
but I did not hear," so it retries, and now the effect is applied twice: two
orders, two charges, two rows. [[reliability-patterns]] explains why "no answer"
never means "no effect." This note is about the half of the fix that lives in the
database: the storage layer is where you actually make the second attempt a
harmless no-op.

Both problems share a root cause. Correctness under concurrency and retries
cannot be guaranteed by careful ordering in application code, because the
application does not control interleaving or delivery. It has to be enforced
where the data lives, by the engine that can see all writers at once and can
reject or serialize the ones that conflict.

## How it works

### The lost-update problem, concretely

Under the default isolation level in most engines (**Read Committed** in
PostgreSQL), each statement sees a snapshot of data committed before that
statement began. That is enough to prevent dirty reads, but it does **not**
prevent lost updates across a read-then-write sequence spanning two statements.
Between your `SELECT` and your `UPDATE`, another transaction can commit a change
to the same row, and your `UPDATE` writes over it. Everything below is a
different strategy for closing that gap.

### Optimistic concurrency with a version column

Optimistic concurrency assumes conflicts are rare, so it takes no locks up
front. Instead it detects a conflict at write time and forces a retry. Add a
`version` integer (or an `updated_at` timestamp) to the row. Read the row and
its current version, do your work in application memory, then write back with a
guard that the version has not changed since you read it, bumping it in the same
statement:

```sql
UPDATE accounts
SET balance = 130, version = version + 1
WHERE id = 42 AND version = 7;
```

If another writer got there first, the row's version is now 8, the `WHERE`
matches zero rows, and the update reports **0 rows affected**. That zero is the
signal: your read is stale, so you re-read and retry the whole read-modify-write
cycle. Because the compare-and-set is a single atomic statement, there is no
window between the check and the write for another transaction to slip through.
This is the same idea as a compare-and-swap loop, expressed in [[glossary#s|SQL]]. It is
cheap when contention is low (no locks, no blocking) and it is how most ORMs
implement their built-in optimistic locking.

### Pessimistic locking with SELECT FOR UPDATE

Pessimistic concurrency assumes conflicts are likely, so it takes the lock first
and does the work second. Inside a transaction, `SELECT ... FOR UPDATE` locks the
selected rows so that, per the PostgreSQL documentation, other transactions that
attempt to `UPDATE`, `DELETE`, or `SELECT FOR UPDATE` those same rows "will be
blocked until the current transaction ends":

```sql
BEGIN;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;  -- locks the row
-- compute new balance in application code
UPDATE accounts SET balance = 130 WHERE id = 42;
COMMIT;  -- releases the lock
```

A concurrent transaction that also runs `SELECT ... FOR UPDATE` on row 42 waits
until this transaction commits, then reads the freshly updated value and proceeds
from there. The lost update cannot happen because the two read-modify-write
sequences are serialized by the lock rather than racing. The cost is that
waiting transactions genuinely block, which reduces throughput under contention
and introduces the risk of **deadlock** if two transactions lock the same rows
in opposite order.

### Unique constraints as a correctness backstop

A `UNIQUE` constraint (or unique index) is the last line of defense, and it is
the one guarantee that holds even when application logic is racy. A common
anti-pattern is "check if a row exists, and if not, insert it," done as two
separate statements. Between the check and the insert, another transaction can
insert the same value, and both callers proceed to create a duplicate. The
database-level unique constraint makes that impossible: the second insert fails
with a violation regardless of timing, because uniqueness is enforced by the
index at write time, not by the application's earlier read. Put the constraint on
whatever column defines "the same thing" (an email, an external order id, an
idempotency key) and treat the violation error as a normal, expected outcome to
catch, not an exception that should crash the request.

### UPSERT: INSERT ON CONFLICT

`INSERT ... ON CONFLICT` (standard-SQL flavors call it UPSERT, "UPDATE or
INSERT") turns "insert if new, otherwise update" into a single atomic statement
built directly on a unique constraint. The PostgreSQL documentation states it
guarantees an atomic INSERT-or-UPDATE outcome, exactly one of the two, "even
under high concurrency." Two forms:

```sql
-- Do nothing if it already exists (idempotent insert):
INSERT INTO subscriptions (user_id, plan)
VALUES (42, 'pro')
ON CONFLICT (user_id) DO NOTHING;

-- Or update the existing row (true upsert):
INSERT INTO counters (name, count)
VALUES ('signups', 1)
ON CONFLICT (name) DO UPDATE
SET count = counters.count + 1;
```

`ON CONFLICT DO UPDATE` requires a conflict target (the column or constraint that
defines the conflict), and it must be backed by a unique or primary-key
constraint, that constraint is what the engine uses to detect the collision
atomically. `DO NOTHING` makes an insert idempotent: retrying it is harmless
because the second attempt hits the conflict and quietly does nothing. `DO
UPDATE` is how you fold a create-or-merge operation into one round trip without a
read-then-write race.

### Idempotency keys stored in the database

[[reliability-patterns]] describes the idempotency-key pattern in general; the
part that lives in the database is a table that records which logical operations
have already been performed, so a retried request is recognized and deduplicated.
The client generates a unique key once per logical intent (not per attempt) and
sends it with every retry. Server-side, you store that key with a unique
constraint and tie it to the work:

```sql
CREATE TABLE idempotency_keys (
  key         text PRIMARY KEY,
  response    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

On each request, attempt to insert the key. If the insert succeeds, this is the
first time you have seen it, so do the work and store the result, all in the same
transaction. If the insert fails on the unique constraint, you have seen this key
before, so return the stored result instead of doing the work again. The unique
constraint is doing the real deduplication; the surrounding transaction is what
makes "record the key" and "perform the side effect" commit together. The key
usually needs a defined retention window and a scope (per account, per endpoint)
so the table does not grow without bound and keys from different contexts cannot
collide.

### Transactions make a multi-step write atomic and idempotent

The reason all of the above composes is the **transaction**. A transaction groups
several statements so they commit as one unit or not at all (the "A" in ACID,
atomicity). This matters for idempotency specifically: recording the idempotency
key and performing the side effect must be in the **same** transaction, otherwise
a crash in the gap between them leaves the work done but the key unrecorded,
reopening the duplicate window on the next retry. Wrapping the whole operation
(check the key, do the writes, record the outcome) in one transaction means a
partial failure rolls everything back to a clean state, and the retry starts from
a consistent point. Atomicity is what lets you reason about a multi-step write as
if it were a single indivisible action.

### Isolation levels at a glance

Isolation level controls how much concurrent transactions are allowed to see of
each other, trading strictness against throughput. The three PostgreSQL offers:

| Level | Dirty read | Nonrepeatable read | Phantom read | Serialization anomaly |
| --- | --- | --- | --- | --- |
| Read Committed (default) | No | Possible | Possible | Possible |
| Repeatable Read | No | No | No (in PostgreSQL) | Possible |
| Serializable | No | No | No | No |

The practical upshot for writes: at **Repeatable Read** and above, if your
transaction tries to update a row that a concurrent transaction already modified
and committed, PostgreSQL does not silently lose the update, it aborts yours with
a serialization failure (`could not serialize access due to concurrent update`),
and the documentation is explicit that the application "should abort the current
transaction and retry the whole transaction from the beginning." **Serializable**
goes further and detects read/write dependency cycles among transactions,
guaranteeing the outcome is equivalent to some serial order, again by aborting
one participant with a serialization error to be retried. So higher isolation is
itself a form of optimistic concurrency: it converts silent corruption into a
loud, retryable error. Whichever level you pick, code that uses Repeatable Read
or Serializable **must** be prepared to catch serialization failures and retry.

## Trade-offs & when to use

**Optimistic vs pessimistic** is the central choice, and it turns on how often
writers actually collide.

- **Optimistic** (version column, or high isolation with retry) wins when
  conflicts are **rare**. It takes no locks, so readers and writers do not block
  each other, and throughput stays high. The cost is paid only on an actual
  clash: a wasted attempt and a retry. It degrades badly under **high
  contention**, where the same hot row is fought over constantly, retries pile up,
  and you can livelock re-reading and re-failing. It is the right default for most
  web workloads, where two users rarely edit the exact same row in the same
  instant.

- **Pessimistic** (`SELECT ... FOR UPDATE`) wins when conflicts are **likely** or
  the work between read and write is expensive enough that you do not want to
  redo it. Taking the lock up front means the winner does the work once with no
  retry. The cost is that other writers block and wait, throughput drops under
  contention, and you must lock rows in a consistent order to avoid **deadlock**.
  Reach for it on genuine hot spots (decrementing limited inventory, a shared
  counter under heavy write load) where optimistic retries would thrash.

The others are less either-or and more layered defenses. **Unique constraints**
cost almost nothing and should back anything that must be unique, they are the
guarantee that survives buggy application logic, so use them liberally. **UPSERT**
is the clean way to express insert-or-update and should be preferred over a
manual read-then-write whenever a suitable unique constraint exists. **Idempotency
keys** add a small storage cost and one extra insert on the write path; that cost
is well worth it for any operation with an externally visible side effect
(payments, sends, order creation) and usually unnecessary for a naturally
idempotent write. **Isolation level** trades throughput for safety: leave it at
Read Committed and enforce correctness explicitly with the tools above, or raise
it to Repeatable Read / Serializable and accept that you must retry serialization
failures.

## Pitfalls / done-right checklist

- [ ] **Read-then-write across two statements with no guard.** The textbook lost
      update. Close the gap with a version check, `FOR UPDATE`, or an atomic
      UPSERT, never assume your read is still current at write time.
- [ ] **"Check-then-insert" to enforce uniqueness in application code.** Two
      callers pass the check and both insert. Enforce uniqueness with a database
      `UNIQUE` constraint and handle the violation, do not rely on a prior
      `SELECT`.
- [ ] **Treating a constraint violation as a crash.** Under concurrency it is an
      expected outcome (someone beat you to it). Catch it and react, do not let it
      500 the request.
- [ ] **Recording the idempotency key in a separate transaction from the side
      effect.** A crash in between loses the association and lets the retry
      double-apply. Commit both together in one transaction.
- [ ] **Generating the idempotency key server-side or per attempt.** It must be
      generated once by the client per logical intent and reused on every retry,
      otherwise each retry mints a new key and dedup never triggers.
- [ ] **Using Repeatable Read / Serializable without a retry loop.** These levels
      surface conflicts as serialization errors you are expected to retry; if you
      do not catch them, you have converted silent corruption into visible request
      failures.
- [ ] **Locking rows in inconsistent order under pessimistic locking.** Two
      transactions locking the same rows in opposite order deadlock. Lock in a
      consistent, predictable order.
- [ ] **Optimistic concurrency on a hot row.** Under heavy contention the retries
      thrash and can livelock. On genuine hot spots switch to a lock or an atomic
      single-statement update.
- [ ] **A read-modify-write that could be a single atomic statement.** Prefer
      `UPDATE ... SET x = x + 1` or `ON CONFLICT DO UPDATE` over reading a value
      into the application and writing it back, the single statement has no race.
- [ ] **No retention policy on the idempotency-key table.** It grows forever.
      Define a window and prune, and scope keys so unrelated contexts cannot
      collide.

## Mental model

Picture the row as a shared whiteboard that many people can walk up to. The
**lost update** is two people reading the number, walking away to do arithmetic,
and walking back to overwrite it, the second eraser wins and the first person's
change never happened. **Optimistic concurrency** is writing down the number
*and a little revision tag* ("this was rev 7"); when you come back to write, you
only commit if the tag is still 7, and if someone bumped it to 8 you tear up your
work and start over from the current number. **Pessimistic locking** is grabbing
the marker before you start so nobody else can write until you set it down. A
**unique constraint** is a bouncer at the board who refuses to let the same name
be written twice no matter how the crowd jostles. **UPSERT** is a single motion
that writes the value if it is absent or updates it if present, with no gap for
anyone to squeeze into. An **idempotency key** is a claim ticket: the board keeps
a ledger of tickets it has already honored, so if your courier delivers the same
ticket twice, the second delivery just gets handed back the original result
instead of drawing on the board again. And the **transaction** is the rule that
your whole visit to the board, ticket check, arithmetic, and write, either all
counts or none of it does. Optimistic detects a clash and retries; pessimistic
prevents the clash by waiting; constraints and UPSERT make the write itself
race-free; the key deduplicates repeats; the transaction ties it into one atomic
act.

## Cross-links

- [[databases]]
- [[reliability-patterns]]
- [[async-data-access]]

## Sources

- PostgreSQL Documentation, "Transaction Isolation" (Read Committed / Repeatable
  Read / Serializable, the lost-update example, serialization failures and the
  instruction to retry the whole transaction).
  https://www.postgresql.org/docs/current/transaction-iso.html
- PostgreSQL Documentation, "INSERT" (`ON CONFLICT`, UPSERT, `DO NOTHING` vs `DO
  UPDATE`, conflict target requirements, atomic outcome under high concurrency).
  https://www.postgresql.org/docs/current/sql-insert.html
- PostgreSQL Documentation, "Explicit Locking" (row-level locking, `SELECT ...
  FOR UPDATE` blocking concurrent writers until the transaction ends).
  https://www.postgresql.org/docs/current/explicit-locking.html
- Martin Fowler, "Optimistic Offline Lock" and "Pessimistic Offline Lock"
  (patterns for detecting vs preventing concurrent modification with a version
  field or a lock). https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html
- RFC 9110, "[[glossary#h|HTTP]] Semantics," idempotent methods (the request-side counterpart to
  server-side deduplication). https://www.rfc-editor.org/rfc/rfc9110#name-idempotent-methods
