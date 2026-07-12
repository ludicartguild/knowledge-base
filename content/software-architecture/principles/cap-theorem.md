---
title: "CAP Theorem"
tags: [architecture, principles]
level: deep
type: reference
reviewed: 2026-07-12
---


**CAP Theorem**, coined by **Eric Brewer** (2000) and formally proved by Gilbert & Lynch (2002), states that in a distributed data system you can guarantee **at most two** of the following three properties at the same time.

## The three properties

| Letter | Property | Meaning |
| --- | --- | --- |
| **C** | Consistency | Every read sees the most recent write (linearizability). All nodes return the same data. |
| **A** | Availability | Every request gets a non-error response. No node refuses to answer. |
| **P** | Partition Tolerance | The system keeps operating despite network partitions (messages between nodes being lost or delayed). |

## Partition tolerance is not optional

In any real distributed system, network partitions **will** happen, links flap, switches die, cloud zones isolate. **P is non-negotiable.**

So the real choice is:

When a partition occurs, do I sacrifice Consistency or Availability?

### CP systems

Refuse to answer (or block) on the side that can’t confirm the latest write. Returns errors but never stale data.

* HBase
* ZooKeeper
* etcd
* MongoDB (default)
* Traditional RDBMS with synchronous replication

### AP systems

Every node keeps answering, but some may return stale data until it reconciles.

* Cassandra
* DynamoDB
* Riak
* CouchDB

## Important nuances

* CAP is about behavior **during a partition**, not at all times. A CP system can absolutely be available when there is no partition.
* "Consistency" in CAP means **linearizability**: not the **C** in ACID (which means "preserves invariants"). They are different concepts that share a letter.
* Real systems aren’t strictly binary. Cassandra lets you tune consistency level (`ONE`, `QUORUM`, `ALL`) per query. DynamoDB offers "eventually consistent" vs. "strongly consistent" reads.

## PACELC, the more useful refinement

Daniel Abadi’s extension is what most architects actually reason with:

If there is a **P**artition, choose **A** or **C**. Else, choose **L**atency or **C**onsistency.

PACELC captures the **everyday** tradeoff (latency vs. consistency on the happy path), not just the partition-time one.

Systems describe themselves with two pairs, one per regime:

| Classification | Example |
| --- | --- |
| PA / EL | Cassandra, chooses availability during partitions and latency the rest of the time. |
| PC / EC | HBase, chooses consistency during partitions and consistency the rest of the time. |

## Relation to other foundational concepts

* [[solid|DIP / Clean Architecture]] says high-level policy shouldn’t depend on storage details: but CAP forces architectural decisions that **leak** into the domain (e.g. "an order may be created twice during a partition; the domain must be idempotent"). You can’t fully hide CAP behind an abstraction.
* [[coupling-and-cohesion|Coupling]]: choosing AP often means weaker **temporal** coupling between services (they can run independently during partitions) at the cost of stronger **semantic** coupling (every consumer must handle stale or conflicting data).
* [[cqs|CQS / CQRS]]: in AP systems, separating the read model from the write model (CQRS) is often the only sane way to expose eventually-consistent reads without poisoning command semantics.
