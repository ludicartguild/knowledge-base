---
title: "Retrieval-Augmented Generation (RAG) & Grounding"
tags: [ai]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Retrieval-Augmented Generation ([[glossary#r|RAG]]) pairs a generative model with an external
knowledge store. Instead of relying only on what the model learned during
training, the system retrieves relevant text at query time and feeds it into the
prompt so the model answers from that supplied evidence. Grounding is the
practice of tying each answer back to the retrieved sources, ideally with
citations, so claims can be checked. RAG lowers hallucination and lets you update
knowledge by updating an index rather than retraining a model, but it does not
eliminate errors: the quality of retrieval sets the ceiling on the quality of the
answer.

## Why it exists

A generative model has two structural weaknesses. First, its knowledge is frozen
at training time, so anything created, changed, or corrected afterward is invisible
to it. Second, it stores knowledge as diffuse statistical patterns rather than
retrievable facts, so it can produce fluent, confident text that is simply wrong.
This failure mode is usually called hallucination.

Retraining or fine-tuning to fix either problem is slow and expensive, and it does
not give you a way to point at where an answer came from. RAG addresses this by
keeping the model fixed and attaching a separate, updatable memory. When the model
needs to answer, the system first fetches passages that are likely relevant and
places them in front of the model as context. The model then answers from that
supplied material rather than purely from its internal weights. The original RAG
work framed this as combining the model's own parametric memory with a
non-parametric memory made of an external document index, so factual knowledge can
be inspected and revised independently of the model.

## How it works

RAG has two phases: an offline indexing phase that prepares the knowledge store,
and an online query phase that runs on every request.

![[rag-flow.drawio.svg]]

### Index time

You start from a corpus of source documents. Because a whole document is usually
too large and too coarse to retrieve against, you split each document into smaller
pieces called chunks. Each chunk is passed through an embedding model, which turns
text into a vector, a list of numbers positioned so that texts with similar meaning
sit close together in the vector space. The resulting vectors are stored in a
vector database along with metadata about where each chunk came from, such as the
source document, section heading, and position. This index is built once and then
refreshed whenever the underlying documents change.

### Query time

When a request arrives, the system embeds the query using the same embedding
model, so the query and the chunks live in the same vector space. It then runs a
similarity search over the index to find the chunks whose vectors are nearest to
the query vector, keeping the top-k most similar. Those chunks are inserted into
the prompt as context, typically wrapped with an instruction telling the model to
answer using the provided passages. The model generates its answer grounded in that
supplied context rather than from memory alone.

### Grounding and citations

Because each retrieved chunk carries source metadata, the system can attach that
provenance to the answer and surface it as a citation. This is the concrete meaning
of grounding: every claim in the answer should be traceable to a specific retrieved
passage. Citations serve two purposes. They let a reader verify a claim, and they
give you a signal for evaluation, since you can check whether the model actually
used the retrieved evidence or invented a reference to a passage that was never
retrieved.

### Chunking strategies and trade-offs

Chunking is one of the highest-leverage decisions in a RAG system, and it is a
genuine trade-off rather than a solved problem. Chunks that are too large dilute
the vector, mix several topics together, and waste context budget on irrelevant
text. Chunks that are too small fragment an idea across several pieces, so no single
chunk contains a complete answer and retrieval misses the point. Common approaches
include fixed-size chunks with a small overlap between neighbors to avoid cutting
sentences mid-thought, and structure-aware chunking that splits on natural
boundaries such as headings or paragraphs. Semantic chunking goes further by
starting a new chunk where the meaning shifts, measured by a drop in similarity
between adjacent sentences. Keeping section and document metadata on each chunk
supports both citation and filtered retrieval.

### Hybrid keyword and vector search

Vector search captures meaning, so it matches paraphrases and related concepts even
when no words overlap. It is weaker at exact matches such as identifiers, rare
terms, product codes, and proper names, where the precise string matters more than
its meaning. Classic keyword search, based on term-frequency scoring, is strong
exactly where vector search is weak. Hybrid search runs both and fuses the two
ranked lists into one, often with a rank-fusion method that rewards results ranked
highly by either approach. A reranking step can then reorder the fused candidates
using a more expensive, more accurate relevance model before the top few are placed
in the prompt.

### Why retrieval reduces but does not eliminate hallucination

Supplying real evidence gives the model something correct to copy from, which
substantially reduces fabrication. It does not make the system truthful by
construction. If retrieval returns irrelevant or subtly wrong passages, the model
will ground its answer in bad evidence and confidently repeat it. The model can
also ignore the context, blend it with its own priors, or over-generalize beyond
what the passages actually support. Retrieval changes where errors come from more
than it removes them, which is why grounding checks and citation verification
remain necessary even in a well-built system.

## Trade-offs and when to use

RAG is one of three overlapping ways to give a model knowledge it did not have at
training time, and they are best understood together.

Fine-tuning bakes new behavior or style into the model's weights. It is well suited
to teaching a consistent format, tone, or task pattern, and it is poorly suited to
facts that change, because every update means another training run and the result
still cannot cite a source. RAG is the opposite: it is ideal for large, changing,
or proprietary knowledge because you update an index instead of a model, and it can
attribute answers to sources. The two are complementary rather than competing. You
can fine-tune for behavior and use RAG for knowledge.

Long context is the third option: place the relevant documents directly into a
large context window and skip retrieval. This is simpler and avoids retrieval
mistakes, and it is attractive when the relevant material is small enough to fit.
It becomes impractical as the corpus grows, because you cannot fit an entire
knowledge base into a single prompt, and stuffing large amounts of loosely relevant
text raises cost and latency and can bury the useful passages. RAG scales to large
corpora by fetching only what each query needs.

The recurring theme across all of this is that retrieval quality is the ceiling.
The model can only be as good as the evidence it receives. If the right chunk is
never retrieved, no amount of prompt engineering or model capability will recover
the correct answer. Investment in chunking, retrieval, and reranking usually pays
off more than swapping the generative model.

## Pitfalls / done-right checklist

- Bad chunking. Chunks that are too large, too small, or that cut across ideas
  quietly cap retrieval quality. Tune chunk size and overlap, and prefer natural
  boundaries. Evaluate this before blaming the model.
- Irrelevant retrieval. Measure whether the retrieved chunks actually contain the
  answer, and add hybrid search and reranking when semantic-only retrieval misses
  exact terms. Treat retrieval as its own component with its own metrics.
- No citations or grounding checks. Carry source metadata through to the answer,
  show citations, and verify that cited passages were genuinely retrieved and
  genuinely support the claim. An answer you cannot trace is an answer you cannot
  trust.
- Stale index. An index only reflects the documents as of the last build. Set up a
  refresh process when sources change, and track index freshness, or the system
  will confidently answer from outdated material.
- Assuming retrieval means truth. Retrieved evidence can be wrong or off-topic, and
  the model can still stray from it. Keep evaluating groundedness end to end rather
  than assuming RAG has removed the problem.

## Mental model

Think of the model as a capable writer taking an open-book exam. Its own memory is
broad but frozen and occasionally unreliable. The retriever is a research assistant
who, for each question, runs to the shelves and hands the writer the few passages
most likely to matter, each with a page reference. The writer answers from those
passages and cites them. The system is only as good as the assistant's fetching: if
the wrong pages come back, the writer still produces a confident, well-written, and
wrong answer. Improving the assistant, meaning better chunking, better search, and
better ranking, usually helps more than hiring a smarter writer.

## Cross-links

- [[ai-llms-and-mcps]]
- [[llm-agent-architecture]]
- [[agent-memory-and-context]]

## Sources

- Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP
  Tasks," NeurIPS 2020. https://arxiv.org/abs/2005.11401
- "Searching for Best Practices in Retrieval-Augmented Generation," arXiv 2024.
  https://arxiv.org/pdf/2407.01219
- Gradient Flow, "Best Practices in Retrieval Augmented Generation."
  https://gradientflow.substack.com/p/best-practices-in-retrieval-augmented
