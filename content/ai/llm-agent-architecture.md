---
title: "LLM Agent Architecture & Orchestration"
tags: [ai]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

An [[glossary#l|LLM]] "agent" is a language model placed inside a loop, where the model can call
tools, observe the results, and decide what to do next until a task is done. The
architecture matters because a single prompt returns text but cannot take actions,
gather fresh information, or work through a multi-step task on its own. The core
building blocks are a model, a set of tools, some memory, and a control loop that
drives the perceive, reason, act cycle. Everything else (planning, multi-agent
orchestration, human review, lifecycle hooks) is layered on top of that loop. The
main design tension is autonomy versus predictability: agents handle open-ended
problems well but trade away the determinism, low cost, and low latency of a plain
scripted workflow.

## Why it exists

A raw language model does one thing: given text in, it produces text out. That is
enough for tasks that fit in a single turn, such as summarizing a passage or
drafting an email. It breaks down as soon as a task needs actions in the world or
more than one step of reasoning that depends on new information.

Consider a request like "find the current status of order 12345 and, if it has
shipped, draft a notification." A single prompt cannot do this. The model has no way
to look up the order, and it cannot condition its next step on what it finds, because
there is no next step. It can only guess, and a guess about live data is a
hallucination waiting to happen.

Agents exist to close this gap. By wrapping the model in a loop that lets it call
tools, read the results, and then decide what to do with them, the system gains the
ability to act, to gather ground truth from its environment, and to break a large
task into a sequence of smaller reasoned steps. The model supplies the reasoning and
the decisions; the surrounding loop supplies the ability to actually do things and to
keep going.

## How it works

### A model in a loop with tools and memory

The minimal agent has four parts. First, a model that reads context and produces the
next decision. Second, a set of tools, which are functions the model can invoke, such
as a search call, a database query, or a code executor, each described to the model so
it knows when and how to use them. Third, memory, which spans the immediate working
context (the running conversation and intermediate results) and any longer-term store
the agent can read from and write to. Fourth, a control loop that ties these together
and decides when to stop.

The loop is the heart of the architecture. On each turn it assembles the current
context, sends it to the model, receives the model's decision, and acts on that
decision. If the model asks to use a tool, the loop runs the tool, captures the
result, appends it to the context, and iterates. If the model produces a final answer,
or a stopping condition is hit, the loop ends. This is what turns a stateless text
generator into something that can carry out a task over many steps.

### The perceive, reason, act cycle

Each pass through the loop follows the same rhythm. The agent perceives by taking in
its current context, including the goal, the history so far, and any new observations
from the last action. It reasons by having the model interpret that context and choose
what to do next. It acts by executing that choice, which is usually a tool call or a
final response. The result of the action becomes a new observation, feeding the next
round of perception. This cycle repeats until the task is complete.

![[agent-loop.drawio.svg]]

A crucial property is that the agent should get ground truth from its environment on
each step rather than assuming its actions succeeded. Reading the real result of a
tool call, including errors, is what lets the agent correct course instead of
compounding a wrong assumption.

### Reason and act interleaving (ReAct-style)

An influential and now standard pattern interleaves reasoning and acting in the same
loop rather than treating them as separate phases. Instead of planning everything up
front and then executing blindly, the model alternates between short reasoning steps
("what do I know, what should I check next") and actions ("call this tool"), using the
observation from each action to inform the next thought.

This interleaving, introduced in the ReAct paper, has two practical benefits. The
reasoning traces help the model track and update its plan as it learns new facts, and
the actions let it pull in external information so its reasoning is grounded in real
data rather than only its prior knowledge. This directly reduces the hallucination and
error propagation that pure reasoning-without-acting tends to produce, because the
agent keeps checking its thinking against what the environment actually returns.

### Planning

For harder tasks, agents often add an explicit planning step. Rather than deciding
only the very next action, the model first sketches a sequence of subgoals, then works
through them. Planning can be done once at the start, or revisited as the agent
learns more and finds its original plan no longer fits.

Planning helps on tasks with many dependent steps or where the order matters, because
it gives the agent a structure to follow and a way to check progress. It also adds
cost and can go wrong: a bad plan followed faithfully wastes effort, so plans are most
useful when the agent can revise them against ground truth rather than committing to
them blindly.

### Single-agent versus multi-agent orchestration

The simplest architecture is a single agent: one model, one loop, one set of tools.
This should be the default. It is easier to reason about, cheaper, and easier to
debug, and it is sufficient for the large majority of tasks.

Multi-agent orchestration introduces several agents that collaborate, often with a
coordinator that decomposes a task and delegates subtasks to specialized workers, then
combines their results. A common shape is an orchestrator that farms out independent
pieces of work to worker agents and synthesizes what comes back.

Multi-agent designs help when a task has genuinely separable subtasks that benefit
from parallel work or from distinct specializations, when a single context window
cannot hold everything at once, or when isolating a subtask keeps one agent's
distractions out of another's context. They add real cost in return: more model calls,
more latency, harder debugging, and the new problem of coordinating agents that can
disagree or duplicate work. The guiding rule is to add this complexity only when it
demonstrably improves outcomes, not by default.

### Agent-to-agent interoperability

As multi-agent systems and agents built by different teams become common, there is
growing interest in letting agents discover and talk to one another through shared
conventions, rather than every integration being bespoke. This is an emerging and
still-standardizing area: the general idea is a common way for one agent to describe
its capabilities, accept a task from another agent, and return results, so that
independently built agents can cooperate. Treat any specific mechanism here as young
and evolving, and design so that an agent's collaborators can be swapped without
rewriting its core loop.

### Keeping a human in the loop

Because agents act autonomously, a well-designed system decides deliberately where a
person must be involved. Human-in-the-loop means inserting review or approval at
chosen points, especially before actions that are costly, irreversible, or sensitive,
such as sending money, deleting data, or contacting a customer. The agent pauses,
surfaces what it intends to do and why, and waits for a human decision before
proceeding.

This is both a safety mechanism and a trust mechanism. It bounds the damage a
mistaken agent can do, and it gives people a way to supervise and correct the system
without blocking the routine, low-risk steps that the agent can safely handle on its
own. The design question is where to place the checkpoints, not whether to have any.

### Lifecycle and callback hooks

A recurring cross-cutting mechanism is the lifecycle hook, or callback: a way to run
your own code at defined points in the agent's execution, such as before a tool runs,
after a tool returns, before the model is called, or when the loop finishes. Hooks are
generic infrastructure, independent of any particular tool or model.

They are where much of the practical engineering lives. Hooks let you add logging and
tracing so you can see what the agent did, enforce guardrails such as blocking or
sanitizing a dangerous tool call, inject or trim context, collect metrics on cost and
latency, and implement the human-in-the-loop pauses described above. Because they are
cross-cutting, they keep this operational logic out of the core loop and out of the
individual tools.

## Trade-offs and when to use

The central decision is agents versus a plain workflow. A workflow orchestrates the
model and tools through predefined code paths that you write and control. An agent lets
the model dynamically direct its own process and tool use. Workflows are predictable,
cheaper, faster, and easier to test, because the path is fixed. Agents are flexible and
handle open-ended problems, at the cost of that predictability.

Prefer a workflow when the task is well understood and you can lay out the steps in
advance. If you can draw the flowchart, code the flowchart. Reach for an agent when the
number of steps or the path cannot be predicted ahead of time, when the task is
genuinely open-ended, and when the flexibility earns its keep.

The costs of agents are concrete. They are nondeterministic: the same input can take
different paths and give different results, which makes testing and reproducibility
harder. They cost more, because a single task can trigger many model calls across the
loop. They add latency, since each loop turn is another round trip to the model. And
they are harder to debug, because a failure can come from the model's reasoning, a
tool, the context assembly, or the interaction among them. Weigh these against the
value of autonomy before choosing an agent.

## Pitfalls and done-right checklist

Common pitfalls:

- Reaching for an agent when a simple prompt or a fixed workflow would do. Added
  autonomy is added cost and unpredictability; spend it only when it pays off.
- Jumping to multi-agent orchestration before a single agent has been tried and found
  insufficient. Extra agents multiply cost, latency, and coordination bugs.
- Letting the agent assume its actions succeeded instead of reading real results, which
  lets a wrong assumption compound over many steps.
- Giving the agent too many or poorly described tools, so it picks the wrong one or
  gets confused about when to use each.
- No stopping condition or step and cost budget, so a stuck agent loops indefinitely or
  runs up unbounded expense.
- No human checkpoint before costly or irreversible actions.
- No observability, so when the agent misbehaves you cannot see why.

Done-right checklist:

- Start with the simplest thing that works, a plain prompt or a fixed workflow, and add
  agentic autonomy only when simpler approaches fall short.
- Give the model a clear goal, a small set of well-described tools, and honest
  observations from the environment on every step.
- Set explicit stopping conditions and budgets for steps, cost, and time.
- Place human-in-the-loop checkpoints before sensitive or irreversible actions.
- Instrument the loop with hooks for logging, tracing, guardrails, and metrics so its
  behavior is visible and controllable.
- Justify any move to multiple agents by a demonstrated improvement, not by default.
- Test against the nondeterminism: evaluate on many runs and cases, not a single happy
  path.

## Mental model

Picture a capable but literal assistant working at a desk. The assistant can think and
decide, but cannot leave the desk. Around the desk are tools: a phone to look things
up, a filing cabinet for memory, a calculator. A supervisor hands over a goal and then
repeats one instruction: look at what you have, decide the single next thing to do, do
it, and tell me the result, then we go again.

Each round the assistant reasons and takes one action, sees what really happened, and
uses that to decide the next action. That repeating loop is the agent. Planning is the
assistant sketching the steps before diving in. Multi-agent orchestration is bringing
in more assistants at more desks, coordinated by one who hands out and collects the
work, worth it only when the job truly splits into parallel or specialized parts.
Human-in-the-loop is the rule that certain actions, like anything expensive or
irreversible, need a signature before the assistant proceeds. Hooks are the standing
procedures the supervisor attaches to every step, such as write it in the logbook and
stop if this looks dangerous. The model is the mind at the desk; the architecture is
everything that turns that mind into a system that can reliably get work done.

## Cross-links

- [[ai-llms-and-mcps]]
- [[tool-calling-and-mcp]]
- [[rag-and-grounding]]
- [[agent-memory-and-context]]

## Sources

- Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models," 2022,
  arXiv:2210.03629 (ICLR 2023). The interleaved reason-and-act pattern and its effect
  on grounding and reducing hallucination. https://arxiv.org/abs/2210.03629
- Anthropic, "Building Effective Agents," 2024. Definitions of agents versus workflows,
  the agent loop and the importance of environmental ground truth, the guidance to add
  complexity only when it improves outcomes, and the orchestrator-workers pattern.
  https://www.anthropic.com/engineering/building-effective-agents
