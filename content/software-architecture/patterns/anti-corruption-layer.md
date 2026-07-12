---
title: "Anti-Corruption Layer"
tags: [architecture, patterns]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

An Anti-Corruption Layer (ACL) is a translation boundary you put between your
own domain model and an external, legacy, or third-party model that you do not
control. Instead of letting the foreign model's shapes, names, and quirks flow
into your code, the ACL validates and maps everything at the edge onto your own
domain types. The result: contract drift and bad data fail at the boundary,
loudly and early, rather than silently corrupting logic deep inside your system.
The term comes from Eric Evans' *Domain-Driven Design*; it is also cataloged as
a cloud design pattern.

## Why it exists

Almost every non-trivial system depends on something it did not design: a legacy
platform being decommissioned in stages, a partner [[glossary#a|API]], a vendor [[glossary#s|SDK]], a shared
database owned by another team, a message feed with its own conventions. Those
external systems carry their own model of the world, often a messy one, with
awkward schemas, obsolete field names, overloaded enums, null-where-you-expect-values, and semantics that do not match yours.

The danger is not the dependency itself. It is that the foreign model tends to
leak inward. If your code passes the external payload around directly, its field
names appear in your business logic, its optionality becomes your optionality,
and its assumptions quietly become yours. Over time your clean domain model gets
reshaped by an outside model you never chose and cannot change. Evans described
this as the outside model "corrupting" your own. The ACL exists to stop that
leak: it is a deliberate firewall so that a poor or unstable external contract
cannot dictate the design of your core.

## How it works

An ACL sits between two bounded contexts, or between your system and an external
one, and mediates all communication across that seam. Traffic on your side always
speaks your domain model; traffic on the other side always speaks theirs. The
layer holds every bit of translation logic in between, and nothing else.

Concretely, at an inbound boundary the flow is usually two steps:

1. **Validate the wire shape.** Parse the raw external payload and assert that it
   matches the contract you expect: required fields present, types correct,
   enums within a known set, ranges sane. A schema-validation step does this. In
   practice teams use a schema or validation library for it (public examples in
   the JavaScript and TypeScript world include Zod, and equivalents exist in
   every ecosystem), but the idea is language-agnostic: describe the expected
   external shape once and reject anything that does not conform.

2. **Map onto your domain types.** A mapper function takes the now-validated
   external shape and constructs your internal domain objects, renaming fields,
   converting units, collapsing the vendor's five overlapping status codes into
   your two meaningful states, filling defaults, and dropping what you do not
   need. Downstream code only ever sees your types.

Outbound calls run the mirror image: your domain object goes through a mapper
into the external request shape, and the response comes back through validation
and mapping again before you trust it.

The key behavioral property is **fail-closed at the boundary**. When the external
contract drifts (a field disappears, a type changes, a new enum value shows up),
validation rejects the payload right at the edge. You get a clear error located
at the seam, instead of a corrupted value that surfaces as a mysterious bug three
layers deep an hour later. Because two systems with different trust levels meet
here, the ACL is also the natural place to enforce input sanitization, and to add
observability such as correlation IDs and structured logging so translation
failures are diagnosable.

You can build the ACL as an in-process component (a module, a set of mappers) or
as a standalone service. It can be synchronous request/response, or event-driven
with a queue when you need to decouple from the external system's throughput.

## Trade-offs & when to use

Reach for an ACL when:

- You integrate with a legacy, third-party, or otherwise unowned system whose
  model differs from yours and whose quality or stability you distrust.
- You are migrating in stages and new code must keep talking to old code without
  inheriting its shape.
- Two bounded contexts must communicate but have genuinely different semantics
  for the same concepts.

The costs are real and worth naming:

- **Added latency and indirection.** Every call pays for translation.
- **Another thing to build, run, and monitor**, especially if the ACL is its own
  service. It needs its own scaling, release, and observability story.
- **Maintenance coupling.** When the external contract changes, the ACL is what
  you update, which is the point, but it is still ongoing work.

The pattern is a poor fit when the two models are essentially the same. Forcing a
translation layer between systems that already agree on semantics adds cost and
buys nothing. It is also a smell to let the ACL grow beyond translation: business
rules and orchestration belong in your domain, not in the boundary.

If the ACL exists to support a migration, decide up front whether it is permanent
or a scaffold you will retire once the legacy system is gone. Un-owned "temporary"
layers have a way of becoming load-bearing forever.

## Pitfalls / done-right checklist

- [ ] The layer translates only. No business rules, no orchestration hiding in
      the mappers.
- [ ] External types never escape the ACL. Downstream code imports your domain
      types, never the vendor's DTOs or generated client models.
- [ ] Validation runs before mapping, and rejects unknown or malformed input
      (fail-closed), rather than best-effort coercing it.
- [ ] The mapping is explicit and total: every field is deliberately mapped,
      defaulted, or dropped. Avoid blind pass-through / spread of the whole
      external object.
- [ ] Contract drift produces a clear, boundary-located error, not a silent bad
      value flowing inward.
- [ ] Both directions are covered. Outbound requests are mapped from your model,
      and responses are validated on the way back in.
- [ ] The boundary handles untrusted input safely (sanitization) since it spans a
      trust difference.
- [ ] Failures are observable: structured logs, correlation IDs, and metrics on
      translation success and latency.
- [ ] For a migration ACL, its lifecycle (permanent vs. retire-on-completion) is
      decided and written down.

## Mental model

Think of the ACL as a **customs checkpoint and translator** at a border. Nothing
crosses without inspection. Goods (data) are checked against a declared manifest
(the schema), and anything that does not match the declaration is turned away at
the gate, not waved through to cause trouble inland. Everything that passes is
relabeled into the local language and units (your domain model) before it is
allowed to circulate. Your interior never has to speak the neighbor's language,
and the neighbor's problems stop at the border.

An equivalent one-liner: it is the place where "their [[glossary#j|JSON]]" becomes "your
objects," and where a broken contract turns into a caught error instead of a
quiet corruption.

## Cross-links

- [[software-architecture-map]]
- [[hexagonal-architecture]]: the ACL often lives behind a port, with the
  adapter doing the translation into the domain.
- [[coupling-and-cohesion]]: the ACL exists to prevent inappropriate coupling of
  your model to an external one.
- [[backends-bff-and-apis]]: a [[glossary#b|BFF]] or API boundary is a common home for
  anti-corruption translation.

## Sources

- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of
  Software* (Addison-Wesley, 2003). Origin of the Anti-Corruption Layer and of
  bounded contexts / context mapping.
- Microsoft, "Anti-Corruption Layer pattern," Azure Architecture Center /
  Cloud Design Patterns.
  https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer
- Martin Fowler, "Bounded Context."
  https://martinfowler.com/bliki/BoundedContext.html
- Vaughn Vernon, *Implementing Domain-Driven Design* (Addison-Wesley, 2013),
  Ch. 3 on context mapping, for further detail on inter-context relationships.
