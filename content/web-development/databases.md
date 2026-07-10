---
title: "Databases"
tags: [databases, sql, nosql]
level: fundamentals
type: concept
---


A database is where an application’s data lives between requests, user accounts, orders, messages, anything that needs to survive a restart. The two big families are **relational (SQL)** and **non-relational (NoSQL)**. Most full-stack roles expect comfort with at least one relational database and an awareness of when a NoSQL store is the better fit. Neither is "better" in general, the right choice depends on the shape of the data and how it will be queried.

## SQL vs NoSQL

|  | SQL (relational) | NoSQL (non-relational) |
| --- | --- | --- |
| Structure | Fixed schema, tables with defined columns and types | Flexible schema, documents or records can vary in shape |
| Data model | Rows and columns, related via keys | Documents, key-value pairs, wide columns, or graphs |
| Query language | SQL (standardized, declarative) | Varies by database, often a query API or JSON-based syntax |
| Relationships | First-class, enforced via foreign keys and joins | Usually handled in application code or by embedding related data |
| Scaling | Traditionally vertical (bigger server); harder to shard | Often designed to scale horizontally (more servers) |
| Good fit for | Structured data with clear relationships, orders, accounts, invoices | Rapidly changing or loosely structured data, logs, catalogs, sessions |
| Examples | PostgreSQL, MySQL, SQL Server | MongoDB, DynamoDB, Redis, Cassandra |

> [!tip]
> A practical rule of thumb: reach for SQL when the data has clear structure and the relationships between entities matter (an order belongs to a customer, a customer has many orders). Reach for NoSQL when the shape of the data varies a lot, when it is naturally a single self-contained document, or when the priority is horizontal scale over strict consistency.

## Relational fundamentals

A relational database organizes data into **tables**. Each table has:

* **Rows**: individual records (e.g. one row per user).
* **Columns**: named fields with a defined data type (e.g. `email` as text, `created_at` as a timestamp).
* A **primary key**: a column (or combination of columns) that uniquely identifies each row, most commonly an auto-incrementing `id`.
* **Foreign keys**: a column in one table that references the primary key of another, expressing a relationship between them (an `orders` table has a `user_id` column pointing at `users.id`).

The **schema** is the overall definition of the tables, columns, types, and constraints, it is decided up front and changes through explicit migrations, not on the fly.

**Joins** combine rows from two or more tables based on a related column, which is how relational databases answer questions like "show me each order along with the name of the customer who placed it":

```sql
SELECT orders.id, orders.total, users.name
FROM orders
JOIN users ON orders.user_id = users.id
WHERE orders.status = 'shipped';
```

PostgreSQL and MySQL are the two relational databases most commonly seen in job postings. Both speak standard SQL with minor dialect differences; Postgres is generally favored for its stricter standards compliance and richer feature set (JSON columns, full-text search, extensions), while MySQL remains extremely common, especially paired with PHP/WordPress-era stacks.

### CRUD

Almost every database interaction falls into one of four operations, **Create, Read, Update, Delete**, regardless of whether the backing store is SQL or NoSQL. In SQL these map to `INSERT`, `SELECT`, `UPDATE`, and `DELETE`.

### Indexes

An index is a separate data structure that lets the database find rows without scanning the entire table, similar to an index at the back of a book. Indexes make reads (especially `WHERE` and `JOIN` lookups) much faster, at the cost of extra storage and slightly slower writes, since the index has to be updated too. Primary keys are indexed automatically; other frequently-searched columns (like `email`) are often indexed manually.

### Normalization, briefly

Normalization is the practice of splitting data into separate tables to avoid storing the same fact in more than one place, a customer’s name lives once in `users`, and every order just references `user_id` rather than repeating the name on every row. This avoids update anomalies (changing a name in one place but not another) at the cost of needing joins to reassemble the full picture.

## NoSQL fundamentals

NoSQL is an umbrella term for several different data models, not one thing. The two most likely to come up:

* **Document stores** (MongoDB): store data as JSON-like documents. Related data is often embedded directly in a single document instead of split across tables.
* **Key-value stores** (Redis, DynamoDB): store a value retrievable by a single key, optimized for very fast lookups; commonly used for caching or session data rather than as the primary application database.

A document store lets each record have its own shape, one product document can have a `color` field and another can skip it entirely, with no schema migration required:

```json
{
  "_id": "64f1a2b3c9d4e5f6",
  "name": "Wireless Mouse",
  "price": 24.99,
  "tags": ["electronics", "accessories"],
  "reviews": [
    { "user": "alex", "rating": 5 },
    { "user": "jamie", "rating": 4 }
  ]
}
```

Notice the reviews are embedded directly in the product document rather than living in a separate table joined by a foreign key, a document store optimizes for reading one self-contained record in a single lookup.

## BigQuery (analytics, not app data)

BigQuery is Google Cloud’s serverless data warehouse, it is built for running SQL queries over **huge** analytical datasets (millions to billions of rows), not for powering the live request/response cycle of an application.

* It is **columnar**, meaning it stores and scans data column-by-column rather than row-by-row, which makes aggregate queries (`SUM`, `AVG`, `COUNT` over billions of rows) very fast.
* It is **serverless**: there is no database instance to size or manage; queries scale automatically and billing is largely based on data scanned.
* It speaks **SQL**, so the query syntax is familiar to anyone who knows relational databases.

The key distinction for an interview: **Cloud SQL** (GCP’s managed Postgres/MySQL) is a transactional database for an application, fast single-row reads and writes, used by the app to serve users in real time. **BigQuery** is an analytical warehouse, it answers questions like "what were total sales by region last quarter" by scanning huge volumes of historical data, and it is not designed for the frequent small read/write pattern of a live app.

## How to talk about this in an interview

* State the core tradeoff plainly: SQL for structured, related data with strong consistency needs; NoSQL for flexible or fast-scaling data. Avoid claiming one is universally better.
* If asked "which have you used," answer honestly. It is fine to say "I’ve mainly worked with Postgres, but I understand the tradeoffs NoSQL databases make" rather than overstating hands-on NoSQL experience.
* Be ready to explain **why** an index speeds up a query in plain language (it avoids scanning every row) without needing to describe the underlying tree structure.
* If BigQuery or a data warehouse comes up, the safe answer is knowing it exists for analytics at scale and is not a substitute for an application’s primary database: deeper BigQuery/pipeline detail is out of scope for a junior full-stack role. See [[cloud-and-gcp|Cloud and GCP]] for where it fits in the broader platform picture, and [[communication|Communication]] for how to frame a knowledge gap honestly instead of guessing.

## Key terms

| Term | Meaning |
| --- | --- |
| Primary key | Column (or columns) that uniquely identifies a row. |
| Foreign key | Column referencing another table’s primary key, expressing a relationship. |
| Schema | The defined structure of tables, columns, and types. |
| Join | Combining rows from two or more tables via a related column. |
| Index | A structure that speeds up lookups on a column at the cost of extra storage. |
| Normalization | Splitting data across tables to avoid duplicating the same fact. |
| ORM | Object-Relational Mapper, library that maps database rows to application objects (e.g. Prisma, Sequelize, ActiveRecord), so code reads/writes objects instead of raw SQL. |
| Document store | A NoSQL database that stores flexible, JSON-like records. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Watch

![](https://www.youtube.com/watch?v=Q5aTUc7c4jg)

## Related notes

* [[glossary|Glossary]]: full term list referenced across all foundational notes.
* [[backends-bff-and-apis|Backends, BFF, and APIs]]: the backend layer is what actually talks to the database on behalf of a request.
* [[cloud-and-gcp|Cloud and GCP]]: Cloud SQL and BigQuery are managed services within the broader GCP platform.
* [[communication|Communication]]: how to frame database knowledge gaps honestly instead of bluffing.
