---
title: "Tool Calling & the Model Context Protocol (MCP)"
tags: [ai]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

A language model is a text-in, text-out function. It cannot read a database, hit an
[[glossary#a|API]], or write a file on its own. **Tool calling** (also called function calling) is the
mechanism that lets a model request an action: it is handed a set of tool schemas, and
instead of answering in prose it emits a structured call naming a tool and its
arguments. The surrounding **agent runtime** executes that call and feeds the result
back, looping until the task is done. The **Model Context Protocol ([[glossary#m|MCP]])** is an open
standard that takes this pattern and makes the tools themselves pluggable: instead of
hand-wiring every integration into every application, an application speaks one protocol
to any number of servers that expose tools, data, and prompt templates. Tool calling is
how a model acts; MCP is how you connect it to what it acts on without bespoke glue.

## Why it exists

A model on its own is frozen and sealed off. Its knowledge stops at its training cutoff,
it has no access to your systems, and it cannot cause any effect in the world beyond
producing text. To be useful for real work it needs to fetch fresh data, query systems
of record, and trigger operations. That requires a way to hand control out to code and
take it back.

Tool calling solved the first half of the problem: give the model a vocabulary of
callable functions and a disciplined format for invoking them. But the second half,
connecting the model to the actual tools, was chaos. Every application invented its own
way to register tools, every data source needed a custom adapter, and an integration
built for one host could not be reused by another. The result was an N-times-M problem:
every application had to be wired by hand to every tool and data source. MCP exists to
collapse that into N-plus-M. Its own documentation frames it as a "USB-C port for AI
applications": one standardized connector, so a server built once works with any client
that speaks the protocol, and a client gains an entire ecosystem of servers for free.
It draws explicit inspiration from the Language Server Protocol, which did the same for
editors and programming languages.

## How it works

### Function/tool calling, the underlying loop

The base pattern does not require MCP at all. It works like this:

1. The application gives the model a list of **tool schemas**. Each schema is a name, a
   natural-language description of what the tool does and when to use it, and a typed
   parameter definition (commonly [[glossary#j|JSON]] Schema).
2. The user asks for something. The model decides whether it can answer directly or
   needs a tool. If it needs one, it does not reply in prose; it emits a **structured
   tool call**: the tool name plus arguments that conform to the schema.
3. The runtime intercepts that call, executes the real function (a database query, an
   [[glossary#h|HTTP]] request, a calculation), and captures the result.
4. The result is appended to the conversation and sent back to the model.
5. The model reads the result and either calls another tool or produces a final answer.

Steps 2 through 5 repeat. This loop is the heart of every agent: the model plans, the
runtime executes, the result grounds the next step. The model never runs code itself; it
only ever proposes calls, and trusted code outside the model decides whether and how to
run them.

### MCP, standardizing the connection

MCP keeps that loop but standardizes where the tools come from and how they are
described. It defines three roles:

- **Host**: the application the user interacts with, which holds the model and initiates
  connections.
- **Client**: a connector living inside the host. Each client maintains a one-to-one
  connection to a single server.
- **Server**: a separate service that exposes capabilities. Servers are typically small,
  focused programs (a filesystem server, a database server, a ticketing server).

Communication uses **JSON-RPC 2.0** messages over stateful connections, with the client
and server negotiating capabilities when they connect. A server can expose three kinds
of primitive:

- **Tools**: functions the model can execute (the same idea as function calling, now
  discovered dynamically from the server rather than hard-coded into the host).
- **Resources**: context and data for the user or model to read, such as file contents,
  database rows, or documents, addressed by URI.
- **Prompts**: templated messages and workflows, typically surfaced to the user as
  reusable commands.

Clients can also offer features back to servers, including **sampling** (letting a server
ask the host's model to generate something), **roots** (telling a server which files or
URIs it may operate within), and **elicitation** (letting a server ask the user for more
information mid-task).

The protocol defines two standard **transports**. **stdio** launches the server as a
local subprocess and exchanges newline-delimited JSON-RPC over standard input and output;
it is the default for local tools. **Streamable HTTP** runs the server as an independent
process reachable over HTTP POST and GET, optionally using Server-Sent Events to stream
messages back, which suits remote and multi-client servers. The transport is
interchangeable: the same tool logic works over either, and custom transports are
allowed as long as they preserve the JSON-RPC message format.

The payoff is that a host no longer bakes in its integrations. It discovers tools,
resources, and prompts at runtime by asking each connected server what it offers. Add a
new server and the model gains new abilities without changing the host's code, and that
same server works in any other MCP-compatible host.

### Security and authorization

Handing a model the ability to invoke tools means handing it access to real systems, so
authorization is central, not an afterthought. The MCP specification is explicit that the
protocol "enables powerful capabilities through arbitrary data access and code execution
paths" and lays out principles implementors must uphold: users must **explicitly consent**
to and understand data access and operations; hosts must get consent before exposing user
data to a server or invoking any tool; and tool descriptions, including annotations,
should be treated as **untrusted** unless they come from a trusted server, because a tool
represents arbitrary code execution.

For the HTTP transport, MCP defines an authorization framework built on **OAuth 2.1**, so
a remote server can require the client to present a properly scoped access token before
it will act. The Streamable HTTP transport additionally requires servers to validate the
`Origin` header to prevent [[glossary#d|DNS]]-rebinding attacks and recommends binding local servers to
loopback only. The protocol cannot enforce these guarantees by itself; it states that
implementors are responsible for building robust consent flows, access controls, and
authentication into their applications.

## Trade-offs & when to use

Use plain function calling when the set of tools is small, fixed, and owned by the same
codebase as the host. Defining a handful of functions inline is simpler than standing up
servers and a protocol, and it keeps everything in one process.

Reach for MCP when integrations need to be reusable, shared across applications, or
maintained independently of the host. Its strengths are decoupling (a server team ships
tools without touching every consumer), dynamic discovery (hosts pick up new capabilities
without redeploying), and a growing ecosystem of prebuilt servers you can adopt instead
of writing adapters. The costs are real: an extra process and transport to run and
secure, capability negotiation and versioning to manage, and a larger attack surface once
a model can reach external systems. For a throwaway script or a single tightly coupled
tool, that overhead is not worth it. For a platform meant to integrate with many systems
over time, it usually is.

A cross-cutting trade-off applies to tool calling in general: every tool you expose adds
to the model's decision space. Too many tools, or vague descriptions, degrade the model's
ability to pick the right one. Curate the tool set for the task rather than exposing
everything available.

## Pitfalls / done-right checklist

- **Prompt injection through tool output.** Data returned by a tool (a web page, an
  email, a database field) can contain text engineered to look like instructions. If the
  model treats that content as commands, an attacker who controls the data controls the
  agent. Treat all tool output as untrusted data, not as instructions, and never let it
  silently escalate what the agent is allowed to do.
- **Over-broad tool permissions.** A tool scoped to "run any query" or "delete any file"
  hands the model far more authority than any single task needs. Give each tool the
  narrowest capability that works, scope credentials tightly (this is where OAuth 2.1
  scopes on remote servers earn their keep), and require explicit user consent for
  destructive or high-impact actions.
- **Trusting tool descriptions blindly.** The spec warns that tool descriptions and
  annotations are untrusted unless the server is trusted. A malicious or compromised
  server can describe a tool deceptively to lure the model into calling it. Vet the
  servers you connect, and pin trusted sources.
- **Not validating tool inputs.** The model's proposed arguments are a suggestion, not a
  guarantee. Validate every argument against the schema and against your own business
  rules before executing, exactly as you would validate input from any untrusted client.
- **Not validating or bounding tool outputs.** Guard against oversized, malformed, or
  hostile results before feeding them back to the model or downstream systems. Cap sizes,
  check types, and sanitize.
- **No human in the loop for consequential actions.** For anything irreversible or
  sensitive, require explicit confirmation rather than letting the loop act
  autonomously.
- **Silent failures.** When a tool errors, return a clear, structured error the model can
  reason about and recover from, rather than an empty or misleading result that sends it
  down the wrong path.

## Mental model

Think of the model as a capable analyst locked in a room with only a slot in the door.
The analyst can read and write notes but cannot leave or touch anything outside. **Tool
calling** is the analyst passing a precisely written request slip through the slot ("run
this query, fetch this record"). A trusted clerk outside reads the slip, does the work,
and passes the result back through the slot. The analyst never leaves the room and never
acts directly; every effect on the outside world goes through the slot and the clerk, who
can refuse a request.

**MCP** is the standard shape of the slot and the request slips, plus a directory of
clerks. Because every clerk accepts the same slip format, you can add new clerks (a
database clerk, a calendar clerk, a filing clerk) without retraining the analyst or
rebuilding the door, and a clerk you hire works for any room built to the same standard.
Authorization is the clerk checking credentials and the analyst's permissions before
acting, and refusing anything out of scope.

## Cross-links

- [[ai-llms-and-mcps]]
- [[llm-agent-architecture]]
- [[oauth2-and-oidc-flows]]

## Sources

- Model Context Protocol, "What is the Model Context Protocol (MCP)?" (introduction and
  the USB-C analogy): https://modelcontextprotocol.io/docs/getting-started/intro
- MCP Specification 2025-06-18 (overview: JSON-RPC 2.0, hosts/clients/servers, server
  features of resources/prompts/tools, client features of sampling/roots/elicitation,
  and the Security and Trust & Safety principles):
  https://modelcontextprotocol.io/specification/2025-06-18
- MCP Specification 2025-06-18, Transports (stdio and Streamable HTTP, Origin-header
  validation, localhost binding):
  https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- MCP Specification 2025-06-18, Authorization (OAuth 2.1 framework for HTTP transport):
  https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
- MCP core concepts and architecture (host/client/server roles, capability negotiation):
  https://modelcontextprotocol.io/docs/learn/architecture
