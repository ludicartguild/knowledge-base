---
title: "Infrastructure as Code & Terraform"
tags: [platform, devops]
level: fundamentals
type: concept
reviewed: 2026-07-12
---


Every app needs somewhere to run: servers, databases, networks, load balancers. Infrastructure as Code (IaC) means describing that "somewhere" in text files instead of clicking buttons in a cloud console. The files are checked into version control just like application code, which means infrastructure changes get the same review, history, and repeatability that code already gets.

## What Infrastructure as Code is

* **Infrastructure described in files.** A config file states "I want a database, a network, and a server with these settings": a tool reads it and creates (or updates) the real thing to match.
* **Versioned like any other code.** Changes go through a diff, a pull request, and a commit history. It’s possible to see exactly who changed a firewall rule and when, the same way you’d trace a code change.
* **Repeatable.** The same file can build an identical staging environment, a new region, or a disaster-recovery copy, without anyone remembering the exact sequence of console clicks that built the original.
* **The opposite: "click-ops."** Manually clicking through a cloud console to create resources. It works, but nothing is recorded: the setup lives only in one person’s memory (or nowhere at all) and can’t easily be reproduced or reviewed.

## Why it matters

* **Reproducibility.** Spin up a new environment (a test copy, a second region) from the same source files, with confidence it will match what already exists.
* **Teardown and rebuild.** Because the definition lives in code, an entire environment can be destroyed and rebuilt on demand: useful for temporary test environments or recovering from a bad manual change.
* **Code review for infrastructure.** A proposed infrastructure change goes through a pull request like any other code, so a teammate can catch a mistake (an open firewall, an oversized server) before it’s applied.
* **No tribal knowledge.** New team members can read the files to understand what exists, instead of needing someone to walk them through a console.

## Terraform basics

Terraform is the most widely used IaC tool. It works with most major cloud providers (GCP, AWS, Azure) and many other services, using the same workflow and syntax regardless of provider.

* **Provider**: a plugin that tells Terraform how to talk to a specific platform, such as GCP or AWS. A file declares which provider(s) it needs.
* **Resource**: a single piece of infrastructure to manage: a virtual machine, a storage bucket, a database instance, a DNS record.
* **HCL (HashiCorp Configuration Language)**: the declarative syntax Terraform files are written in. It reads like structured configuration, not a programming language with loops and conditionals as the default style.

A minimal resource block:

```hcl
resource "google_storage_bucket" "assets" {
  name     = "my-app-static-assets"
  location = "US"

  uniform_bucket_level_access = true
}
```

This declares one storage bucket, named and located as specified. It does not say **how** to create it, Terraform works that out.

### The workflow: init, plan, apply

1. `terraform init`, downloads the providers a project needs and sets up the working directory. Run once per project (and again after adding a new provider).
2. `terraform plan`, compares the code against what actually exists (via the **state file**, below) and prints exactly what would change: what gets created, updated, or destroyed. Nothing changes yet, this is a preview.
3. `terraform apply`, executes the plan, making real changes against the actual cloud account. Usually asks for confirmation before proceeding.

> [!tip]
> `terraform plan` is the safety net of the whole workflow. Reading the plan output carefully, especially any line that says a resource will be **destroyed**, is the single most useful habit for avoiding an accidental outage.

### The state file

Terraform keeps a **state file** that records what it believes currently exists and how it maps to the code. Every `plan` and `apply` reads and updates this state. In a team setting, the state file is normally stored remotely (e.g., in a cloud storage bucket) rather than on one person’s laptop, so everyone plans and applies against the same source of truth.

### Declarative vs. imperative, and idempotency

Terraform is **declarative**: the file describes the desired end state ("there should be one bucket named X"), and the tool figures out the steps to get there, unlike **imperative** scripting, which spells out each step in order ("create a bucket, then set its location, then set access"). A useful one-line summary of the practical benefit: applying the same Terraform code twice produces the same result both times (**idempotency**), nothing breaks or duplicates on a second run, because Terraform only changes what’s different from the desired state.

## How to talk about this in an interview

It’s fine to not have hands-on production Terraform experience as a junior candidate. What matters is being able to explain the idea clearly and be honest about depth:

* "I understand IaC as describing infrastructure in version-controlled files instead of manually configuring it in a console: I’ve used Terraform for [a personal project / a tutorial], and I’d expect to pick up a team’s specific modules and conventions quickly."
* Be ready to explain `plan` before `apply` and why that two-step matters: it shows an understanding of **why** the tool is trusted with production changes, not just the commands.
* If asked about something more advanced (modules, remote state locking, multiple environments), it’s stronger to say "I haven’t worked with that specifically, but I understand the underlying problem it solves" than to bluff. See [[communication|Communication]] for more on framing knowledge gaps honestly.

## Key terms

| Term | Meaning |
| --- | --- |
| IaC | Managing infrastructure through versioned code instead of manual console changes. |
| Provider | A Terraform plugin that knows how to talk to a specific platform (GCP, AWS, etc.). |
| Resource | A single piece of infrastructure Terraform manages, such as a server or bucket. |
| HCL | HashiCorp Configuration Language, the syntax Terraform files are written in. |
| State file | Terraform’s record of what it believes currently exists, used to compute changes. |
| Idempotency | Applying the same operation repeatedly produces the same end result each time. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* Write a single Terraform resource block for one piece of infrastructure (for example a storage bucket, following the `google_storage_bucket` example in this note), declaring the provider it needs.
* Walk the `init` -> `plan` -> `apply` workflow on paper for that resource, saying what each command does and which one is only a preview.
* Read a sample `plan` output and point out the line that would tell you a resource is about to be destroyed.

**Check yourself** (you should be able to answer these from this note):

* What problem does Infrastructure as Code solve compared to "click-ops"?
* What do `terraform init`, `plan`, and `apply` each do, and why does the two-step plan-then-apply matter?
* What is the state file, and why is it stored remotely in a team setting?
* What does it mean that Terraform is declarative and idempotent?

## Watch

![](https://www.youtube.com/watch?v=7xngnjfIlK4)

## Related notes

* [[cloud-and-gcp|Cloud & GCP]]: the platform Terraform typically manages resources on.
* [[cicd-and-github-actions|CI/CD & GitHub Actions]]: how `terraform plan`/`apply` are often automated as part of a pipeline.
* [[communication|Communication]]: framing what you do and don’t know in an interview.
* [[glossary|Glossary]]: definitions for terms introduced here.
