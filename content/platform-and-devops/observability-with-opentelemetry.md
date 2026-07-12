---
title: "Observability with OpenTelemetry"
tags: [platform, observability]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Observability is the practice of understanding what a running system is doing from
the telemetry it emits, so you can answer questions you did not anticipate in
advance. OpenTelemetry (often shortened to OTel) is a vendor-neutral, open source
standard and set of SDKs for generating, collecting, and exporting three kinds of
telemetry: traces, metrics, and logs. It gives you one instrumentation layer that
works with many backends, so the choice of where to store and visualize data stays
separate from the code that produces it. The core moving parts are the signals
themselves, distributed tracing built from spans and propagated context, the OTel
Collector as a pipeline, and OTLP as the wire protocol that carries the data out.

## Why it exists

You cannot debug what you cannot see. A single user request in a distributed system
may touch a gateway, several services, a cache, a queue, and a database. When it is
slow or fails, logs from one service in isolation rarely tell you where the time went
or which hop broke. You need a way to follow that one request across every process it
visited and to measure the health of the system as a whole.

Before a common standard existed, each observability vendor shipped its own agent,
its own [[glossary#s|SDK]], and its own data format. Instrumenting your code meant coupling it to a
specific vendor. Switching vendors, or sending the same data to two of them, meant
re-instrumenting everything. That is vendor lock-in at the telemetry layer, and it is
expensive and risky.

OpenTelemetry exists to break that coupling. It standardizes how telemetry is
generated and exported so that instrumentation lives in your code once, and the
backend becomes a swappable, configuration-level decision. It is explicitly not a
backend itself; it is the neutral instrumentation and transport layer that feeds
whatever backend you choose.

## How it works

### Monitoring versus observability

Monitoring answers questions you knew to ask ahead of time: is CPU above a threshold,
is the error rate over a limit, is the endpoint up. You predefine dashboards and
alerts for known failure modes. Observability is broader. It aims to let you ask new
questions after the fact, including ones you did not predict, by keeping enough
high-context, correlated telemetry that you can slice and explore an incident you
have never seen before. Monitoring is a subset of, and a consumer of, the data
observability produces.

### The three signals

OpenTelemetry organizes telemetry into three signals.

Traces record the path and timing of a single request as it flows through a system.
A trace shows you causality and latency across service boundaries.

Metrics are numeric measurements aggregated over time: request counts, error counts,
latency histograms, queue depth, memory use. They are cheap to store and ideal for
dashboards, trends, and alerting.

Logs are timestamped records of discrete events, typically text or structured
key-value data emitted at a point in code. They carry detail that metrics and traces
do not, such as a specific error message or the state of a variable.

The signals are complementary. Metrics tell you something is wrong and roughly where,
traces tell you which request and which hop, and logs tell you the fine-grained why.

### OpenTelemetry as a standard plus SDKs

OpenTelemetry has two parts that matter here. First, it is a specification: a
vendor-neutral definition of what telemetry data looks like and how it is transmitted.
Second, it provides language SDKs (for many languages) that implement that spec, so
your application produces conformant telemetry without you hand-rolling the format.
Because the format is standardized, any conformant backend can ingest it.

### Instrumentation: automatic versus manual

Instrumentation is the code that produces telemetry. There are two flavors.

Automatic (or zero-code) instrumentation uses language agents or libraries that hook
into common frameworks ([[glossary#h|HTTP]] servers and clients, database drivers, messaging
libraries) and emit spans and metrics for you with little or no code change. It gives
broad coverage quickly and is the usual starting point.

Manual instrumentation is code you write to create spans, record metrics, and add
attributes that describe your specific business operations. Automatic instrumentation
cannot know what a meaningful unit of work is inside your domain logic, so manual
spans and attributes are how you capture the parts that matter to you. Most mature
setups combine both: auto for breadth, manual for the important detail.

### Distributed tracing: spans and traces

A span is the fundamental unit of a trace. It represents one operation, for example
handling an HTTP request, running a database query, or executing a function. A span
has a name, a start and end time (so a duration), a status, and a set of attributes
(key-value metadata). Spans also carry a parent reference.

A trace is a tree of spans tied together by a shared trace ID. The first span (the
root) has no parent; every other span points to the span that caused it. Rendered on
a timeline this becomes a waterfall view where you can see which operation nested
inside which, how long each took, and where time was actually spent. Because every
span in the trace shares the same trace ID, you can follow one request end to end
even as it crosses many services.

### Context propagation via W3C Trace Context

For spans created in different processes to join the same trace, the trace context
must travel with the request across the network. OpenTelemetry uses the W3C Trace
Context standard, which defines two HTTP headers.

The traceparent header carries fixed-length, vendor-neutral identifiers: a version, a
16-byte trace ID for the whole trace, an 8-byte parent span ID for the current
operation, and trace flags (which include the sampled bit). A caller injects
traceparent into the outgoing request, and the callee extracts it, so the callee's
spans attach to the same trace under the same trace ID. An example value looks like
`00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`.

The tracestate header carries additional vendor-specific key-value data alongside
traceparent, so systems can preserve their own metadata while still interoperating.

This propagation is what turns per-process spans into a single coherent distributed
trace. The trace ID (and the related correlation ID concept) is the thread you pull to
follow one request across every service it touched.

### The OpenTelemetry Collector

The Collector is a standalone process that acts as a telemetry pipeline: it receives
telemetry, processes it, and exports it onward. A pipeline is built from receivers
(intake, for example over OTLP), processors (batching, filtering, sampling, dropping
or scrubbing sensitive attributes, adding resource metadata), and exporters (send to
one or more backends).

Running a Collector between your services and your backends is a common and
recommended pattern. It lets applications offload telemetry quickly and cheaply,
centralizes configuration (retries, batching, sampling policy) outside application
code, and decouples your services from any specific backend. You can fan the same data
out to multiple destinations or switch backends by editing Collector config rather
than redeploying every service.

### OTLP: the export protocol

OTLP (the OpenTelemetry Protocol) is the standard wire protocol for shipping telemetry.
It defines the shape of trace, metric, and log data on the wire and is spoken by SDKs,
the Collector, and a growing set of backends. Standardizing on OTLP is what lets any
conformant component talk to any other without custom adapters, and it is the default
export path in most OpenTelemetry deployments.

### Structured logging and linking logs to traces

Structured logs emit events as machine-parseable key-value data (commonly [[glossary#j|JSON]]) rather
than free-form strings, so they can be queried and filtered reliably. The high-value
move in an OpenTelemetry setup is to include the active trace ID and span ID on each
log line. That correlation lets you jump from a log entry straight to the full trace it
belongs to, and from a slow or failed span straight to the exact logs emitted during
it. Traces give you the shape of the request; correlated logs give you the detail at
any point on it.

### Cardinality caution on metrics and labels

Metrics are cheap only if you keep their dimensionality bounded. Every distinct
combination of label (attribute) values on a metric creates a separate time series.
Attaching high-cardinality labels, such as user IDs, request IDs, full URLs with
query strings, or raw timestamps, can multiply that into an explosion of time series
that inflates storage and cost and can overwhelm the metrics backend. Keep metric
labels to low-cardinality dimensions (status code, method, route template, region).
High-cardinality identifiers belong on spans and logs, where they are recorded per
event rather than turned into a persistent time series.

## Trade-offs and when to use

Instrumentation has a cost. Automatic instrumentation is cheap to enable but you still
need to understand what it produces; manual instrumentation is real engineering effort
and ongoing maintenance as code changes. Good telemetry is a deliberate investment,
not a free byproduct.

Data volume drives cost. Full-fidelity traces and verbose logs at scale can generate
enormous amounts of data, and most observability backends charge by ingestion or
retention. Storing everything forever is rarely justified.

Sampling is the main lever for controlling trace volume. Head-based sampling decides at
the start of a trace, before you know the outcome, keeping a fixed fraction; it is
simple and cheap but may discard the rare slow or failing traces you most want.
Tail-based sampling buffers spans and decides after the trace completes, so you can
keep all errors and slow requests and sample the boring successful ones; it is more
powerful but needs more infrastructure (typically in the Collector) and memory.

Reach for OpenTelemetry when you run anything beyond a single simple service,
especially distributed or microservice systems where requests cross process
boundaries, where you want freedom to change observability backends, or where you need
to correlate signals to debug problems you did not foresee. For a tiny single-process
app, plain logging plus a few metrics may be enough, though standardizing on OTel early
keeps the door open cheaply.

## Pitfalls and done-right checklist

- Do not attach high-cardinality values (user IDs, request IDs, raw URLs) as metric
  labels. Put them on spans and logs instead.
- Do not skip context propagation. If services do not pass and honor traceparent, your
  traces break into disconnected fragments and lose their whole value.
- Do not treat automatic instrumentation as sufficient on its own. Add manual spans and
  attributes for the operations that matter to your domain.
- Do not log unstructured strings when you can log structured events, and include the
  trace and span ID so logs and traces link together.
- Do not export straight to a backend from every service when a Collector would give
  you central control over batching, sampling, and scrubbing.
- Do not ship telemetry without a sampling strategy; decide deliberately what to keep,
  and prefer keeping all errors and slow traces.
- Do scrub or avoid emitting sensitive data (secrets, personal data) in span attributes
  and logs; the Collector is a good place to enforce this.
- Do standardize on OTLP and consistent attribute naming (semantic conventions) so data
  from different services is comparable.
- Do verify end to end that a single request produces one connected trace across all
  services before you rely on tracing in an incident.

## Mental model

Think of one user request as a package moving through a sorting network. Each facility
it passes through (a service, a database, a queue) stamps the package with a start and
end time and a note about what it did; that stamp is a span. Every stamp references the
same tracking number, the trace ID, and points back to the facility that handed it
over. The traceparent header is the tracking label that travels on the package so the
next facility knows which shipment this is. At the end, you can lay all the stamps on a
timeline and see exactly where the package waited and where it went wrong. Metrics are
the aggregate stats the whole network keeps (how many packages per hour, how many were
late), and logs are the detailed notes a facility writes about a specific package. The
Collector is the mail room that gathers all the stamps and notes, tidies them, and
forwards them to whichever tracking system you have chosen, all in one standard format,
OTLP.

## Cross-links

- [[cicd-and-github-actions]]
- [[reliability-patterns]]
- [[backends-bff-and-apis]]

## Sources

- OpenTelemetry, What is OpenTelemetry? https://opentelemetry.io/docs/what-is-opentelemetry/
- OpenTelemetry, Observability primer (signals, traces, metrics, logs, instrumentation): https://opentelemetry.io/docs/concepts/observability-primer/
- OpenTelemetry, Signals overview: https://opentelemetry.io/docs/concepts/signals/
- OpenTelemetry, Traces and spans: https://opentelemetry.io/docs/concepts/signals/traces/
- OpenTelemetry, Context propagation: https://opentelemetry.io/docs/concepts/context-propagation/
- OpenTelemetry, Collector: https://opentelemetry.io/docs/collector/
- OpenTelemetry, OTLP specification: https://opentelemetry.io/docs/specs/otlp/
- OpenTelemetry, Sampling: https://opentelemetry.io/docs/concepts/sampling/
- W3C, Trace Context Recommendation (traceparent and tracestate headers): https://www.w3.org/TR/trace-context/
