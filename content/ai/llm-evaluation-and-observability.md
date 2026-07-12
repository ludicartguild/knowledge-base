---
title: "LLM & Agent Evaluation and Observability"
tags: [ai]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

A language model turns the same input into different outputs from one run to the
next, so you cannot trust "it looked fine when I tried it" as a sign that a system
works. Evaluation gives you repeatable, quantified judgments of output quality.
Observability gives you a per request record of what actually happened inside a
call or an agent run: which model and tools ran, how long each took, how many
tokens were spent, and what it cost. Guardrails sit on top so that when something
fails, the user sees a safe, useful message rather than an empty box or a raw stack
trace. Treat evaluation, observability, and guardrails as three parts of one
feedback loop: measure quality offline and online, trace every call so you can
explain a result, and fail closed toward safe behavior.

## Why it exists

Traditional software is mostly deterministic. Given the same input and state, a
function returns the same output, so a passing test today is a reasonable promise
about tomorrow. Generative models break that assumption. Sampling introduces
randomness, prompts are open ended, and small wording changes upstream can swing
results. The same question can yield a great answer, a mediocre one, and a wrong
one across three runs, and none of them throw an error.

That leaves teams with a measurement gap. "Looks fine" is a vibe, not a metric. It
does not survive a prompt change, a model upgrade, a new tool being added to an
agent, or simply a different sample of user inputs. Without numbers you cannot tell
whether a change helped or hurt, you cannot catch a regression before users do, and
you cannot compare two candidate prompts or models on anything but anecdote. The
governing principle is old and blunt: you cannot improve what you cannot measure,
and you cannot debug what you cannot see. Evaluation supplies the measurement.
Observability supplies the visibility.

## How it works

### Evaluation: reference based metrics and their limits

The oldest automatic metrics compare generated text against one or more human
written reference answers by counting overlapping word sequences. Two long standing
examples are a precision oriented n-gram overlap score originally designed for
machine translation, and a recall oriented family of overlap scores originally
designed for summarization. Both are cheap, fast, deterministic, and language
agnostic, which makes them useful as a coarse regression signal and for tasks with
tight reference answers.

Their limits matter. Because they reward surface level token overlap, they miss
meaning. A paraphrase that is entirely correct but shares few exact words scores
low, while a fluent answer that overlaps the reference but is subtly wrong can score
high. They do not capture coherence, factual accuracy, reasoning, or tone. For open
ended generation they correlate only loosely with human judgment. Embedding based
scores that compare meaning rather than exact tokens improve on this, but still
struggle with the open ended, subjective quality that most real systems care about.
Use overlap metrics where a reference answer is well defined and stable, and do not
mistake a high overlap score for correctness.

### LLM as a judge for open ended quality

When there is no single correct answer, a common approach is to use a capable model
itself as an evaluator. You give a judge model the input, the produced output, and
an explicit rubric, and ask it to score dimensions such as helpfulness, relevance,
faithfulness to provided context, coherence, and safety, or to pick the better of
two candidate answers. This scales far better than human review and captures
semantic qualities that overlap metrics cannot.

It also carries well documented biases that you must design around. Judges show
position bias, favoring whichever candidate appears first or second regardless of
quality. They show verbosity bias, preferring longer answers. They show self
preference or self enhancement bias, rating outputs from their own model family
higher. Alignment with human raters is imperfect and degrades on complex or
subjective tasks. Practical mitigations: write a concrete, example backed rubric
rather than asking for a vague overall score, ask for a short reason before the
score to force grounding, run each pairwise comparison in both orderings and average
to cancel position bias, calibrate the judge against a human labeled sample, and
never make a model the sole evaluator in a high stakes domain. Treat the judge as a
noisy but scalable instrument that you keep checking against ground truth.

### Response quality versus trajectory

For a single turn generation, you evaluate the response: is the final answer good.
For an agent that plans, calls tools, and takes multiple steps, the final answer is
not enough. Two runs can both produce a correct looking answer while one took the
right steps and the other guessed, called the wrong tool, or got lucky. Trajectory
evaluation asks whether the agent took the right path: did it select appropriate
tools, call them with valid arguments, in a sensible order, without unnecessary or
looping steps, and did it recover correctly from a tool error. You want both.
Response evaluation tells you whether the outcome was right. Trajectory evaluation
tells you whether it was right for the right reasons, which is what predicts
reliability on inputs you have not seen yet.

### Offline evaluation versus online evaluation

Offline evaluation runs the system against a fixed, curated dataset of inputs with
known good outputs or clear grading criteria. It is repeatable, comparable across
versions, and safe because no real user is affected. It is the natural home for a
regression suite. Its weakness is coverage: a static dataset drifts away from what
real users actually ask.

Online evaluation measures behavior in production against live traffic, using
signals such as judge scores on sampled real outputs, explicit user feedback, and
implicit signals like whether the user retried, abandoned, or accepted the result.
It captures real distribution and real failure modes but is noisier and only tells
you after the fact. Mature setups use both: offline suites gate changes before
release, online monitoring catches what the dataset missed and feeds new failing
cases back into the offline dataset.

### Evaluation suites in CI

Once you have a dataset and metrics, wire them into continuous integration so that
prompt changes, model swaps, and code changes run the eval suite automatically and
report scores as a pull request check. Set thresholds so a meaningful drop on key
metrics fails the build the way a broken unit test would. This turns quality from
something you eyeball into a gate. Because scores are noisy, compare against a
baseline with a tolerance band rather than demanding an exact number, and track the
trend over time rather than reacting to a single point. Grow the dataset by adding
every production failure you find, so the suite gets stricter as you learn.

### Observability: tracing every model and tool call

Observability records what actually happened at runtime. The core primitive is a
trace made of spans, where each span captures one unit of work: a model call, a tool
call, a retrieval step. For each span you record latency, the model or tool name,
token usage split into input and output, and the derived cost. Emitting these as
structured attributes rather than free text log lines lets a backend aggregate them,
so you can answer questions like which step dominates latency, where tokens and cost
concentrate, and how the error rate moves over time.

There is now an open, vendor neutral standard for these attributes under the
telemetry ecosystem's generative AI semantic conventions, which define a common
namespace and attribute names for the operation, the request and response model,
token usage, and related fields. Following a shared convention means your traces are
portable across tools and comparable across services instead of locked to one
vendor's schema.

### Correlation IDs across a turn

A single user turn can fan out into many model and tool calls, possibly across
several services. Attach one correlation or trace identifier at the start of the
turn and propagate it through every downstream call so all the resulting spans link
back to one parent. Without this you have a pile of disconnected events. With it you
can reconstruct the full story of one turn end to end, which is the difference
between "something is slow" and "the third tool call in this specific run timed out
and triggered two retries."

### Structured feedback logging

Close the loop by logging feedback in a structured, queryable form and linking it to
the trace it refers to. That includes explicit user signals such as thumbs up or
down and corrections, implicit signals such as retries and abandonment, and judge
scores from online evaluation. Because each feedback record points at a trace, you
can jump from a bad rating straight to exactly what the system did, and you can
harvest low rated turns into new evaluation cases. This is how observability feeds
evaluation rather than sitting beside it.

### Guardrails: failing toward safe behavior

Models and tools fail: they time out, return malformed output, hit rate limits, or
produce unsafe content. Guardrails decide what the user sees when that happens. The
baseline rule is to never return an empty or raw error. Catch model and tool errors
and convert them into a safe, honest, actionable user facing message, degrading
gracefully to a partial or fallback answer where possible. Apply bounded retries
with backoff for transient failures, and make retries idempotent so a repeated tool
call does not double an effect. Validate output against the expected schema or
policy before it reaches the user, and reject or repair anything that fails.
Guardrails belong to the same loop: every triggered guardrail is a logged event that
should show up in traces and feed back into evaluation.

## Trade-offs & when to use

Reference based overlap metrics are cheap and deterministic but shallow. Reach for
them when a reference answer is well defined and you want a fast regression signal,
not when you need a verdict on open ended quality. Judge based evaluation captures
nuance and scales, at the cost of bias, drift, and money per call, and it demands
calibration against humans. Human review is the most trustworthy and the least
scalable, so spend it on calibration sets and high stakes cases rather than routine
grading. Offline evaluation is repeatable and safe but drifts from reality. Online
evaluation is real but noisy and lagging. Observability is close to non negotiable
for anything in production, though full detail tracing has overhead and can capture
sensitive prompt content, so sample high volume traffic and redact where needed. In
general: the higher the stakes and the more open ended the task, the more you lean
on judges plus human calibration plus trajectory checks plus always on tracing,
rather than a single overlap number.

## Pitfalls / done-right checklist

- Do not treat "looks fine in a demo" as evidence. One good run says nothing about
  the distribution.
- Do not rely on a single overlap score for open ended quality. High overlap is not
  correctness, and correct paraphrases score low.
- Do not trust a judge model blind. Control for position, verbosity, and self
  preference bias, and calibrate against human labels.
- Do not evaluate only the final answer for agents. Check the trajectory, since a
  right answer from a wrong path will not generalize.
- Do not let the offline dataset go stale. Feed production failures back into it
  continuously.
- Do run the eval suite in CI with baseline relative thresholds and tolerance for
  noise, not brittle exact match gates.
- Do trace every model and tool call with latency, token usage, and cost as
  structured attributes, ideally following a shared semantic convention.
- Do propagate one correlation ID across a whole turn so spans link into one trace.
- Do log feedback in structured form linked to its trace, and mine low rated turns
  into new eval cases.
- Do make guardrails fail toward safety: never return empty or a raw error, degrade
  gracefully, retry transient failures with bounded idempotent backoff, and validate
  output before it reaches the user.
- Do watch cost and token usage as first class metrics, not an afterthought.
- Do mind privacy: sample and redact trace content so observability does not become
  a data leak.

## Mental model

Think of an air traffic control tower for a nondeterministic system. Evaluation is
the scheduled inspection program that certifies each aircraft against a written
standard before and after it flies, both on a test course you control and on real
routes. Observability is the radar and the black box recorder, one continuous track
per flight with a shared identifier so you can replay exactly what happened and where
time and fuel went. Guardrails are the automated safety systems that take over and
land the plane safely when an instrument fails, never leaving the cockpit with a
blank screen. The three feed each other in a loop: the recorders surface incidents,
the incidents become new inspection cases, and the safety systems keep every failure
survivable while you learn from it.

## Cross-links

- [[ai-llms-and-mcps]]
- [[llm-agent-architecture]]
- [[observability-with-opentelemetry]]

## Sources

- OpenTelemetry, "Semantic conventions for generative AI client spans," defines the
  gen_ai attribute namespace, operation and model attributes, and token usage
  fields. https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/
- OpenTelemetry, "Generative AI semantic conventions" overview.
  https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Zheng et al., "Judging [[glossary#l|LLM]]-as-a-Judge with MT-Bench and Chatbot Arena," documents
  judge use for open ended quality and biases including position, verbosity, and self
  enhancement. https://arxiv.org/abs/2306.05685
- Shi et al., "Judging the Judges: A Systematic Study of Position Bias in
  LLM-as-a-Judge." https://arxiv.org/html/2406.07791v7
- "LLMs-as-Judges: A Comprehensive Survey on LLM-based Evaluation Methods,"
  survey of judge methods, criteria, and limitations. https://arxiv.org/pdf/2412.05579
- Papineni et al., "BLEU: a Method for Automatic Evaluation of Machine Translation,"
  the original n-gram precision overlap metric. https://aclanthology.org/P02-1040/
- Lin, "ROUGE: A Package for Automatic Evaluation of Summaries," the recall oriented
  overlap metric family. https://aclanthology.org/W04-1013/
- Zhang et al., "BERTScore: Evaluating Text Generation with BERT," embedding based
  similarity as an alternative to surface overlap. https://arxiv.org/abs/1904.09675
