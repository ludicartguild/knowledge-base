---
title: "Agent Memory & Context Management"
tags: [ai]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

A language model reads and writes within a fixed token budget called the context window. Everything the model can "see" on a given turn, the system instructions, the running conversation, tool outputs, and any retrieved facts, has to fit inside that budget. Long conversations and multi step tasks quickly outgrow it, and every token costs money and can dilute the model's attention. Agent memory is the set of techniques that keep the working context small and relevant while preserving the ability to recall older information. The two core moves are compaction (summarize older turns once they cross a threshold) and retrieval based memory (store facts outside the window and pull back only what is relevant). The model itself is stateless; all durable state lives in the surrounding runtime.

## Why it exists

Every model has a maximum context length, a hard ceiling on how many tokens it can process in a single call. That ceiling is finite, and it is shared. System instructions, tool and function schemas, the conversation so far, retrieved documents, and the model's own reasoning all draw from the same budget. Admitting one more token of retrieved data effectively evicts a token of something else.

Three forces make this a problem worth engineering around:

- **Overflow.** A long chat or a long running task accumulates history. Left unmanaged, the transcript eventually exceeds the window and older content must be dropped or the call fails.
- **Cost.** Providers bill per input token. A full window re read on every turn of a multi step task multiplies quickly; the same task run over many turns can cost several times what a single call would.
- **Attention dilution.** Accuracy tends to degrade as the window fills, and the loss is gradual rather than a cliff at the limit. A window that is technically within budget but stuffed with low value tokens can still produce worse answers than a lean, focused one.

## How it works

**The context window as a finite budget.** Think of the window as working memory: fast, in reach, and strictly capacity limited. It is not storage. Anything you want the model to reason over right now has to be placed inside it, and the total must stay under the limit. Good context management is essentially budgeting: deciding what earns a place in the window on this turn.

**Short term vs long term memory.** Short term memory is simply the in context material: the recent conversation, usually held as the last N messages or the last T tokens. Long term memory is everything kept outside the window in an external store (a database, a file, a vector index) and pulled back on demand. The distinction matters because short term memory is bounded by the window while long term memory is effectively unbounded; the cost of long term memory is the work of deciding what to retrieve.

**Conversation history growth.** The most common form of short term memory is the raw transcript. It grows monotonically with the interaction, so any long lived agent needs a policy for what happens when the transcript approaches the budget. The two dominant policies are compaction and retrieval.

**Compaction and summarization.** Once accumulated history crosses a token threshold, older turns are replaced by a shorter summary produced by the model. A common shape:

- Keep the most recent turns verbatim, because recency carries the most relevant detail (a frequent heuristic is to retain a large fraction of the budget as recent text and condense only the older prefix).
- Summarize the older prefix into a compact structured note.
- Carry a small overlap so the summary and the retained turns share some boundary context and nothing important falls through the seam.
- Optionally summarize recursively, folding new summaries into the running one as the conversation continues.

The goal is to bound the per turn token cost so it stops growing linearly with conversation length, while retaining the gist of what came before.

**Retrieval based memory.** Instead of (or alongside) summarizing, durable facts are written to an external store, typically embedded as vectors and indexed. At each turn the current situation is used as a query to fetch the few most relevant memories, which are injected into the window. This is the same machinery as retrieval augmented generation applied to the agent's own history rather than to a document corpus: embed, index, query, inject. It lets an agent "remember" across sessions without ever holding the full history in context.

**What to keep vs what to drop.** Retention decisions blend a few signals: recency (recent turns usually matter most), relevance (does this bear on the current task), and salience (durable facts like a user's stated preferences or a decision reached earlier). Priority based eviction demotes or removes entries whose relevance has decayed. Detailed procedural material can be staged, loaded only when a matching task pattern appears, rather than kept resident.

**Token budgeting.** In practice you partition the window: a reserve for system instructions and tool schemas, a slice for retrieved memory, a slice for recent conversation, and headroom for the model's response. Each component is capped so no single source can crowd out the rest, and compaction or retrieval limits are tuned to keep the total under budget.

**Statelessness and where state actually lives.** The model is stateless between calls. It does not remember the previous turn; it only ever sees what is placed in the context window for the current call. Every appearance of continuity is manufactured by the runtime, which reassembles the relevant state (recent messages, summaries, retrieved memories) into the prompt each turn. The durable state lives in the agent runtime and its stores, never in the model weights.

## Trade-offs & when to use

- **Summarization loses detail.** Compression is lossy by definition. A summary can drop a specific value, a caveat, or a nuance that later turns out to matter. Aggressive summarization saves tokens but risks the model confidently acting on a lossy picture.
- **More memory means more tokens and cost.** Retrieval can inject stale or only loosely relevant material, and every retrieved token spends budget and attention. Larger memory footprints raise cost and can dilute the signal.
- **Bigger windows are not a free fix.** Even when a model supports a very large window, filling it raises cost and tends to lower accuracy. Capacity is not the same as effective use.
- **When to use which.** Prefer verbatim short term memory while the conversation is small and cheap. Reach for compaction when a single session runs long. Reach for retrieval based long term memory when facts must survive across sessions or when the corpus of potentially relevant history is far larger than any window. Most production agents combine all three.

## Pitfalls / done-right checklist

- Do not let conversation history grow unbounded; set an explicit threshold that triggers compaction.
- Keep recent turns verbatim and summarize only the older prefix; never summarize the turn you are currently reasoning about.
- Carry overlap across the summary boundary so context does not fall through the seam.
- Budget the window by component (instructions, tools, retrieved memory, recent turns, response headroom) and cap each so none starves the others.
- Bound retrieval to the few most relevant items; more retrieved context is not automatically better.
- Treat summaries as lossy and preserve high value specifics (identifiers, decisions, constraints) explicitly rather than trusting them to survive compression.
- Persist durable state in an external store, not in the transcript alone; assume the model remembers nothing between calls.
- Measure both cost (tokens per turn) and quality; a leaner window often outperforms a fuller one.

## Mental model

The context window is RAM, not disk. It is fast and always in reach, but small and volatile: whatever is not loaded this turn is invisible to the model. Long term memory is the disk, large and durable but only useful once you load the right pages into RAM. The agent runtime is the operating system that decides, on every turn, which pages to load, which to summarize, and which to evict, so the working set stays under budget while the important things remain reachable.

## Cross-links

- [[ai-llms-and-mcps]]
- [[llm-agent-architecture]]
- [[rag-and-grounding]]

## Sources

- [AI Agent Context Window: Management, Limits, and Security (OpenLegion)](https://www.openlegion.ai/en/learn/ai-agent-context-window)
- [LLM Context Window Token Budget: Why Your Window Fills Up Fast (DEV Community)](https://dev.to/swapnanilsaha/llm-context-window-token-budget-why-your-window-fills-up-fast-4c05)
- [Working Memory in LLMs: Context Window Deep Dive (Atlan)](https://atlan.com/know/working-memory-llms/)
- [Top techniques to Manage Context Lengths in LLMs (Agenta)](https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms)
- [Memory vs Context Window for LLM and AI Agents (Mem0)](https://mem0.ai/blog/context-window-is-ram-not-storage-why-most-agent-failures-happen-how-to-fix-them-in-2026)
- [MemGPT: Towards LLMs as Operating Systems (Packer et al., arXiv:2310.08560)](https://arxiv.org/abs/2310.08560)
- [Lost in the Middle: How Language Models Use Long Contexts (Liu et al., arXiv:2307.03172)](https://arxiv.org/abs/2307.03172)
- [Build smarter AI agents: manage short-term and long-term memory (Redis)](https://redis.io/blog/build-smarter-ai-agents-manage-short-term-and-long-term-memory-with-redis/)
- [Agent Memory: Types, Techniques, and Implementation (Mastra)](https://mastra.ai/articles/agent-memory)
