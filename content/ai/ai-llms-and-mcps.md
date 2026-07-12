---
title: "AI, LLMs & MCPs"
tags: [ai]
level: fundamentals
type: concept
reviewed: 2026-07-12
---


AI now shows up inside ordinary full-stack apps, not just in dedicated chatbots, a backend calls a model the same way it might call any other third-party service. A junior developer doesn’t need to know how these models are built, but should be able to talk fluently about what an [[glossary#l|LLM]] is, how an app calls one, and how tools like [[glossary#r|RAG]] and [[glossary#m|MCP]] fit around it.

## What an LLM is

An LLM (Large Language Model) is a model trained on huge amounts of text to predict the next most likely piece of text given what came before. It generates fluent, plausible language, it is not a database and does not "look up" facts, so it can produce confident, wrong answers (a **hallucination**).

Core vocabulary:

* **Prompt**: the input text sent to a model, including instructions and any data it needs.
* **Token**: a chunk of text (roughly a word or part of a word) that a model reads and generates one piece at a time. Usage and cost are typically measured in tokens.
* **Context window**: the maximum amount of text (in tokens) a model can consider at once, including the prompt, conversation history, and its response.
* **Temperature**: a setting that controls how random or predictable the output is. Low temperature gives more focused, repeatable answers; high temperature gives more varied, creative ones.
* **Hallucination**: a confident-sounding but incorrect or fabricated answer, the main reason LLM output needs verification rather than blind trust.

> [!note]
> Because an LLM predicts plausible text rather than retrieving verified facts, it can be wrong in a way that reads as completely confident. Treating LLM output the way you’d treat an answer from a knowledgeable but occasionally unreliable colleague, useful, but worth checking, is the right instinct.

## Using AI in an app

Most apps don’t train their own model. Instead, a backend calls a hosted model through an [[glossary#s|SDK]] (Software Development Kit), a client library that wraps the underlying [[glossary#a|API]] call.

```javascript
// pseudo-code: backend route calling a hosted LLM
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function summarize(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize this in one sentence:\n\n${text}`,
  });
  return response.text;
}
```

The pattern is the same as calling any other external service: send a request, get a response, handle errors and timeouts. The [[glossary#b|BFF]] or service layer is usually where this call lives, not the frontend, so the API key stays on the server.

## Embeddings, vector search & RAG

An **embedding** turns a piece of text into a vector, a long list of numbers that captures its meaning. Text with similar meaning ends up as vectors that are mathematically close together, even if the wording is completely different. **Vector search** means comparing embeddings to find the most similar content, which is how semantic search works: searching by meaning instead of exact keyword matches.

**RAG (Retrieval-Augmented Generation)** builds on this: instead of asking an LLM a question and hoping it remembers the right facts from training, the app first retrieves the most relevant documents (usually via vector search over embeddings of a company’s own data), then feeds those documents into the model’s context along with the question. The model answers using that specific, current information instead of relying only on what it memorized, reducing hallucination and letting it answer questions about private or recent data it was never trained on.

## Prompting vs RAG vs fine-tuning

Three different ways to get an LLM to behave the way an app needs, roughly in order of increasing effort:

| Approach | What it does | When to reach for it |
| --- | --- | --- |
| Prompting | Give instructions and context directly in the request each time. | Default first choice, fast, cheap, no setup. |
| RAG | Retrieve relevant data at request time and add it to the prompt. | The model needs facts it wasn’t trained on, or private/current data. |
| Fine-tuning | Further train an existing model on a smaller, task-specific dataset so its behavior changes. | The model needs a consistent style, format, or specialized skill that prompting alone can’t reliably produce. |

> [!tip]
> In practice, most teams reach for prompting first, add RAG when answers need to be grounded in real data, and only consider fine-tuning once both of those have been tried and still fall short, fine-tuning is the most expensive and least flexible option of the three.

## MCP (Model Context Protocol)

MCP (Model Context Protocol) is an open standard that lets an AI assistant connect to external tools and data through a common interface, instead of every integration being custom-built. An app exposes an "MCP server" that advertises a set of **tools** (actions the model can call, like "search issues" or "read a file") and **resources** (data the model can read). Any AI assistant that speaks MCP can then use those tools without the app needing to write a bespoke integration for each assistant.

The practical value is standard plumbing: before MCP, connecting a model to a database, a ticketing system, and a file store meant three separate custom integrations. With MCP, each system exposes one server, and any compliant assistant can plug into all three the same way, similar to how a [[glossary#r|REST]] API lets many different clients talk to one backend without custom code per client.

## How to talk about this in an interview

It’s fine, and expected at a junior level, to not have deep hands-on experience with model internals or RAG pipelines. A strong answer names the pieces correctly, explains what problem each one solves in plain language, and is honest about the boundary of personal experience rather than bluffing: "I haven’t built a RAG pipeline myself, but I understand it’s about grounding a model’s answers in retrieved data, and I’d look at the vector search and prompt-assembly steps first if I had to build one." See [[communication|Communication]] for more on framing gaps like this well.

## Key terms

| Term | Quick definition |
| --- | --- |
| LLM | A model trained to predict and generate language from patterns in text. |
| Token | A chunk of text a model processes as one unit; usage is measured in tokens. |
| Context window | The maximum amount of text a model can consider at once. |
| Embedding | A numeric vector representing the meaning of a piece of text. |
| RAG | Retrieval-Augmented Generation, grounding a model’s answer in retrieved data. |
| MCP | Model Context Protocol, a standard way for AI assistants to connect to external tools and data. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* Explain in plain language what an LLM is and why it can produce a confident, wrong answer.
* Walk through how RAG answers a question, from embedding and vector search over a company's own data to feeding the retrieved documents into the prompt.
* Pick a feature and decide between prompting, RAG, and fine-tuning, then justify the choice in one sentence.

**Check yourself** (you should be able to answer these from this note):

* What is a hallucination, and why does an LLM produce one rather than looking a fact up?
* What problem does RAG solve, and what are its rough steps?
* When would you reach for fine-tuning instead of prompting or RAG?
* What does MCP standardize, and what is the difference between a "tool" and a "resource" in that context?

## Official documentation

Authoritative references (verified against Google’s developer docs):

* Gemini API: [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
* Generative AI on Vertex AI: [cloud.google.com/vertex-ai/docs/generative-ai](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview)
* Vertex AI Vector Search (formerly Matching Engine): [vector-search overview](https://cloud.google.com/vertex-ai/docs/vector-search/overview)
* Model Context Protocol (spec): [modelcontextprotocol.io](https://modelcontextprotocol.io)
* Google Cloud MCP servers: [docs.cloud.google.com/mcp](https://docs.cloud.google.com/mcp/overview)

## Watch

![](https://www.youtube.com/watch?v=AO_9TIF9KPM)

## Related notes

* [[cloud-and-gcp|Cloud & GCP]]: where hosted models and vector search infrastructure typically run.
* [[backends-bff-and-apis|Backends, BFF & APIs]]: the layer that usually owns the call to an LLM.
* [[communication|Communication]]: framing what you do and don’t know in an interview.
* [[glossary|Glossary]]: definitions for terms introduced here.
