---
title: "Database Migrations & Schema Evolution"
tags: [data, backend]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

A database migration is a versioned, ordered change to a database schema (or its
data) that lives in source control alongside application code. Migration tools
apply pending changes in a deterministic order and record what has already run,
so every environment reaches the same schema from the same starting point. The
hard part is not adding a column, it is changing a schema that a running
application still depends on. The **expand/contract** (also called **parallel
change**) pattern solves that by making every change backward compatible: add
the new shape, move to it gradually, then remove the old shape, with each step
safe to deploy on its own.

## Why it exists

Schemas are never finished. Features get added, columns get renamed, tables get
split, indexes get introduced to fix a slow query. The data already stored under
the old schema still has to be readable and correct after each change. Doing this
by hand, one person running [[glossary#s|SQL]] directly against a database, has three problems
that compound quickly:

- **Not repeatable.** A change applied to one environment by memory or by a
  pasted snippet is easy to apply differently, or not at all, to the next
  environment. Drift between development, staging, and production is how
  "works on my machine" becomes "breaks in production."
- **Not reviewable or auditable.** Ad hoc SQL leaves no record of what changed,
  when, in what order, or why. There is nothing to code review and nothing to
  roll back to.
- **Not coordinated with the code.** A schema the code expects and a schema the
  database actually has must agree at every moment, including the seconds during
  a deploy when both old and new application code may be running at once.

Migrations exist to make schema change **repeatable, versioned, reviewable, and
ordered**, the same properties source control gives to application code.

## How it works

![[expand-contract-migration.drawio.svg]]

### Migrations as versioned files in source control

Each schema change is a discrete unit, a file, checked into the repository next
to the code. Tools differ in surface detail but share the same model:

- **Alembic** (Python/SQLAlchemy) generates revision files, each with an
  `upgrade()` function and a `downgrade()` function. Every revision carries a
  unique `revision` id and a `down_revision` pointer to its parent, so the
  revisions form an ordered chain. Running `alembic upgrade head` walks from the
  current revision to the target and runs each `upgrade()` in sequence. The
  current position is stored in an `alembic_version` table in the database
  itself. Alembic can also **autogenerate** a candidate migration by diffing the
  models against the live schema, though the output should always be reviewed.
- **Flyway** uses SQL (or Java) files named with a version prefix, for example
  `V2__add_email_index.sql`. Versioned migrations run once, in version order,
  and Flyway records each one in its schema history table so it is never applied
  twice. Flyway also has **repeatable** migrations (prefixed `R`) that re-run
  whenever their checksum changes, useful for things like view or stored
  procedure definitions.
- **Liquibase** describes changes as **changesets** in a changelog (XML, YAML,
  [[glossary#j|JSON]], or SQL). A changeset is uniquely identified by its `id`, its `author`,
  and the changelog file path, and changesets run in the order they appear.
  Applied changesets are tracked in a `DATABASECHANGELOG` table, and each
  changeset can declare its own rollback.

The common thread: **ordered units, applied once, tracked in the database, kept
in version control.**

### Up and down: forward and rollback

Most tools let a migration define both a forward direction (apply the change)
and a reverse direction (undo it). Alembic's `upgrade`/`downgrade`, Liquibase's
per-changeset rollback, and Flyway's undo migrations all express the same idea.
A clean `down` is valuable in development for iterating quickly. In production,
though, treat rollback with suspicion: many real changes are not cleanly
reversible (see Pitfalls), and the safer production strategy is usually to roll
**forward** with a new corrective migration rather than to run a `down` that may
discard data.

### Data migrations vs schema migrations

Two different things travel through the same pipeline:

- **Schema migration**, a change to structure: add a table, add or drop a
  column, add an index, change a constraint.
- **Data migration**, a change to the contents: backfill a new column from an
  old one, normalize values, split a `full_name` string into `first_name` and
  `last_name`.

They have different risk profiles. Schema changes can take locks and block
writes; data changes can be slow and touch enormous row counts. A single logical
change often needs both, and separating them into distinct steps (structure
first, backfill second) is what makes each step safe.

### The expand/contract (parallel change) pattern

This is the core technique for changing a schema **without downtime** while a
live application depends on it. The pattern, documented by Danilo Sato as
"parallel change" and widely known as expand/contract, has three phases:

1. **Expand.** Add the new schema alongside the old one, additively and
   backward compatibly. The old shape still works; the new shape now also
   exists. Example: to rename `full_name` to `display_name`, first add a new
   `display_name` column. Nothing reads it yet.
2. **Migrate (the long middle).** Move over gradually:
   - **Backfill** existing rows into the new column, in batches, so the new
     shape has correct historical data.
   - **Dual write.** Deploy application code that writes to both the old and the
     new column, so new rows stay consistent in both.
   - **Switch reads.** Once the new column is fully populated and kept current,
     move readers to the new column.
3. **Contract.** When nothing reads or writes the old shape anymore, remove it:
   drop the old column (and the dual-write code). Cleanup only, and safe because
   nothing depends on the old shape by now.

Each phase is independently deployable and each intermediate state is valid, so
the change can pause, be verified, or be released at any phase. This matters
because during a rolling deploy, old and new application code run
**simultaneously** for a window. Every schema state must be compatible with both
the code before the deploy and the code after it. Expand/contract guarantees
exactly that.

### Separating schema change from code deploy

The practical rule that falls out of the above: **decouple the schema change
from the code that uses it, and order them so the schema is always ahead of, or
compatible with, whatever code is running.**

- **Additive changes go first.** Add the column, table, or index in a deploy
  before any code reads it. Adding an unused column breaks nothing.
- **Destructive changes go last.** Drop a column only after every running
  version of the code has stopped referencing it, which usually means a full
  deploy cycle later, not in the same release.

A rename is never one atomic step in a zero-downtime system, it is an add, a
backfill, a dual-write window, a read switch, and a much later drop, spread
across multiple deploys.

## Trade-offs & when to use

- **Always use a migration tool for any shared or production database.** The
  repeatability and audit trail are not optional at that point. The cost is
  discipline (every change is a reviewed file) in exchange for environments that
  stay in sync.
- **Autogeneration is a draft, not an answer.** Alembic autogenerate and similar
  features save typing but miss things (server defaults, some constraint and
  type changes, data backfills entirely). Always read and edit generated
  migrations.
- **Expand/contract costs more steps for safety.** A rename that could be one
  line becomes five deploys. Use the full dance when downtime or a locked table
  is unacceptable (most production systems). For a small table on a system that
  can tolerate a brief maintenance window, a simpler single-step change may be a
  reasonable, deliberate trade.
- **Framework-bundled vs standalone tools.** Framework-native migration systems
  (for example those shipped with an [[glossary#o|ORM]]) integrate tightly with the models;
  standalone, SQL-first tools like Flyway and Liquibase are language agnostic and
  fit polyglot or multi-service estates better. Choose for your environment, not
  for novelty.

## Pitfalls / done-right checklist

- **Irreversible migrations.** Dropping a column or table destroys data; a
  `downgrade` cannot conjure it back. Know before you run it whether a change is
  reversible, and prefer roll-forward corrections in production over destructive
  rollbacks.
- **Long locks.** Some schema operations take locks that block reads or writes
  for the duration. On a large table an "add column with a default" or an index
  build can stall the application. Prefer non-blocking variants where the
  database offers them (for example, creating indexes concurrently), and know
  your engine's locking behavior before shipping.
- **Big backfills in one transaction.** Updating millions of rows in a single
  statement holds locks, bloats transaction logs, and can time out. **Batch**
  backfills into chunks with pauses, and run them as their own step separate
  from the structural change.
- **Coupling schema and code in the same instant.** Deploying a column drop in
  the same release that stops using it means the still-running old code hits a
  missing column mid-deploy. Additive-first, destructive-last, across separate
  deploys.
- **Ordering and branching.** Migrations must apply in a deterministic order.
  When two people create migrations on separate branches, tools can end up with
  divergent heads (Alembic) or out-of-order versions (Flyway). Merge and
  linearize migration history deliberately, and never edit a migration that has
  already run in any shared environment, add a new one instead.
- **No backup / no rehearsal.** Rehearse risky migrations against a copy of
  production-scale data, and have a restore path before running the real thing.
- **Untracked manual edits.** One person running SQL by hand reintroduces every
  problem migrations were meant to solve. All schema change goes through the
  pipeline, with no exceptions.

## Mental model

Think of the schema as an interface between two independent parties: the data
already at rest, and the code currently running (in more than one version at
once during a deploy). You are never allowed to break that interface for anyone
who is still using it. So you never **change** a schema in place, you **grow** a
new shape beside the old one, move everyone over while both work, and only then
prune the old shape once no one is holding it. Migrations are the version control
for that interface, and expand/contract is how you evolve it without ever asking
everyone to stop at the same moment.

## Cross-links

- [[databases]]
- [[environments-and-promotion]]
- [[cicd-and-github-actions]]

## Sources

- Danilo Sato, "ParallelChange" (expand/contract pattern), martinfowler.com:
  https://martinfowler.com/bliki/ParallelChange.html
- Alembic tutorial (revisions, `upgrade`/`downgrade`, `down_revision` chain,
  `alembic_version`, autogenerate):
  https://alembic.sqlalchemy.org/en/latest/tutorial.html
- Flyway documentation (versioned and repeatable migrations, version ordering,
  schema history): https://documentation.red-gate.com/flyway
- Liquibase changelog concepts (changesets, id/author identity, ordering,
  `DATABASECHANGELOG` tracking, rollback, formats):
  https://docs.liquibase.com/concepts/changelogs/home.html
- Martin Fowler, "Evolutionary Database Design" (schema evolution and migrations
  as first-class, versioned artifacts):
  https://martinfowler.com/articles/evodb.html
