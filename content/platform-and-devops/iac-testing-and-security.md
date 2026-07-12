---
title: "Testing & Securing Infrastructure as Code"
tags: [platform, devops, security]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Infrastructure as code ([[glossary#i|IaC]]) is real code that provisions real systems, so it
deserves the same quality gates as application code plus a security layer of its
own. The industry-standard approach is a **validation ladder** that runs cheap,
fast checks first and expensive checks last: format, validate, lint, unit and
contract tests, policy-as-code, security/misconfiguration scanning, and finally
human plan review. Each rung catches a different class of defect before anything
reaches a live environment. Findings from many of these tools share a common
[[glossary#j|JSON]] format ([[glossary#s|SARIF]]) so results aggregate in one place, and the whole ladder runs
in both pre-commit hooks (fast feedback) and CI (the enforcing gate).

## Why it exists

An IaC mistake is not a crashed request you can retry. It is a security group
opened to the world, a storage bucket made public, a deleted stateful resource,
or a blast radius that spans an entire environment. These defects are cheap to
fix while they are still text in a pull request and extremely expensive to fix
after `apply` has touched production. The economics are lopsided enough that
teams invest in layered automated checks specifically so that misconfigurations
and logic bugs are caught **before** the plan is applied, not discovered during
an incident.

Two failure modes drive the tooling:

- **Correctness bugs.** Syntax errors, invalid references, broken module
  contracts, unintended resource replacement or destruction. These are "does the
  code do what the author meant."
- **Security and compliance misconfigurations.** Overly permissive access,
  unencrypted storage, missing logging, hardcoded secrets, violations of an
  organization's guardrails. These are "even if the code works, is it safe and
  allowed."

No single tool covers both classes well, which is why the practice is a ladder
of complementary tools rather than one scanner.

## How it works

The validation ladder, cheapest and fastest at the top:

![[iac-validation-ladder.drawio.svg]]

### 1. Format

`terraform fmt` rewrites configuration to a canonical style. In CI you run it in
check mode so a diff fails the build. This is purely cosmetic but it removes
style noise from review and keeps diffs meaningful.

### 2. Validate

`terraform validate` checks that a configuration is internally consistent:
syntax is well-formed, references resolve, argument types match, required
arguments are present. It runs without contacting any provider or remote state,
so it is fast, but it only knows what the schema can tell it. It cannot know
that an instance type does not exist or that a rule is insecure.

### 3. Lint

A linter such as **TFLint** goes beyond what `validate` can see. It is a
pluggable linter with a bundled ruleset plus provider-specific rulesets (for the
major clouds) that catch **provider-specific errors** like invalid instance
types, flag **deprecated syntax** and unused declarations, and enforce **naming
conventions** and other best practices. TFLint can emit results in several
formats including **SARIF**, so its findings can feed the same aggregation as
security scanners.

### 4. Unit and contract tests

Terraform has a **native test framework** (generally available since Terraform
v1.6). Tests live in `.tftest.hcl` (or `.tftest.json`) files and are made of
`run` blocks that execute Terraform commands in sequence, each containing
`assert` blocks with a `condition` and an `error_message`. The `command`
attribute chooses the style of test:

- `command = plan` performs logical validation without creating infrastructure,
  which behaves like a **unit test** (fast, checks that inputs produce the
  intended planned outputs and that module contracts hold).
- `command = apply` (the default) provisions short-lived, temporary resources
  and asserts against the real result, behaving like an **integration test**.
  These temporary resources are torn down and do not touch existing state.

Terraform v1.7 added **mocking** so providers and resources can be simulated,
making pure unit testing of module logic practical without any real [[glossary#a|API]] calls.
The common goal is to prove that changes to a reusable module do not introduce
breaking changes to its interface.

### 5. Policy-as-code

Policy-as-code expresses organizational guardrails as machine-checked rules so
that "you may not create a public database" is enforced automatically rather
than by review vigilance. Two widely used engines:

- **OPA (Open Policy Agent)**, a CNCF graduated, general-purpose, domain-agnostic
  policy engine. Policies are written in its declarative language **Rego** and
  evaluated against structured JSON input. For infrastructure this typically
  means exporting a plan as JSON and asking OPA whether the planned changes
  satisfy policy. Because OPA is general-purpose, the same engine can govern
  many layers ([[glossary#c|CI/CD]], Kubernetes, API gateways), not just IaC.
- **Sentinel**, a policy-as-code framework used within the HashiCorp ecosystem
  and integrated into its platform's run pipeline.

The distinction from a linter: a linter encodes universal best practices; policy-as-code encodes **your** organization's specific rules, and can hard-block a
run when they are violated.

### 6. IaC security scanning (misconfiguration and secrets)

Dedicated **IaC security scanners** statically analyze configuration for
security and compliance problems. **Checkov** is a representative open-source
example: a static analysis tool that scans many IaC frameworks (Terraform,
CloudFormation, Kubernetes, Helm, Docker, and more) against a large library of
predefined policies (over 750), maps findings to compliance benchmarks such as
CIS, detects **hardcoded secrets/credentials**, and builds a resource
**connection graph** to reason about misconfigurations that span related
resources. Other tools in this category include tfsec and commercial platform
scanners of the Wiz style. Like the linter, these scanners commonly output
**SARIF** so their findings land in the same reporting surface.

The scanner answers "is this configuration insecure or non-compliant"; it
overlaps with policy-as-code but ships with a curated, maintained rule library
so you get broad coverage without authoring every rule yourself.

### SARIF as the common findings format

**SARIF (Static Analysis Results Interchange Format)** is a JSON-based, OASIS-standard format for the output of static analysis tools (current version 2.1.0).
Because linters and scanners can all emit SARIF, findings from heterogeneous
tools can be merged, deduplicated, and viewed in one place. In practice, CI
uploads SARIF to a code-scanning surface: GitHub, for example, parses SARIF
2.1.0 from third-party tools and renders them as code-scanning alerts in the
Security tab, via the `upload-sarif` action or the code-scanning [[glossary#r|REST]] endpoint.
SARIF is what turns a pile of separate tool outputs into a single reviewable
list.

### 7. Plan review

The final rung is human judgment over a generated `terraform plan`. Automation
cannot always tell an intended destructive change from a mistake. A reviewer
reads the plan, pays special attention to resource replacement and destruction,
and approves. Presenting the plan (often as a saved plan artifact or a [[glossary#p|PR]]
comment) is a standard gate before `apply`.

### Where the ladder runs

- **Pre-commit hooks** run the fast rungs (fmt, validate, lint, sometimes a
  quick scan) locally so authors get feedback in seconds and never push obvious
  problems.
- **CI** runs the full ladder as the **enforcing** gate. Pre-commit is advisory
  and can be skipped; CI is the wall that a change must pass. The same commands
  belong in both so local and CI behavior match, but CI is the source of truth.

## Trade-offs & when to use

- **Speed versus depth.** The ladder is ordered so the common case fails fast and
  cheap. Fail on `fmt` in a second rather than after a multi-minute apply-based
  test. Put the slow, apply-style tests behind the fast gates.
- **Real resources cost time and money.** `command = apply` tests and any test
  that touches a real provider need credentials, incur cost, and are slower and
  flakier. Use `command = plan` and mocking for the bulk of module logic; reserve
  real applies for a smaller set of integration tests.
- **Linter versus policy-as-code versus scanner overlap.** They overlap but are
  not redundant: linters catch universal mistakes and style, scanners provide a
  broad maintained security rule library, and policy-as-code encodes rules
  unique to your organization and can hard-block. Most mature setups run all
  three.
- **Guardrails versus friction.** Every added gate slows delivery slightly and
  can produce false positives. Tune rule severity, suppress with justification
  rather than by disabling wholesale, and make sure a failing check tells the
  author exactly what to fix.
- **When to invest.** The more environments, contributors, and blast radius a
  configuration has, the more the ladder pays off. A throwaway experiment may
  only need fmt and validate; anything that provisions shared or production
  systems warrants the full ladder.

## Pitfalls / done-right checklist

- [ ] `terraform fmt -check` and `terraform validate` run in CI and block on
      failure.
- [ ] A linter (e.g. TFLint) with the relevant provider ruleset runs in CI.
- [ ] Reusable modules have native `terraform test` coverage; module-logic tests
      use `command = plan` and/or mocking so they are fast and free.
- [ ] At least one IaC security scanner runs on every change, covering both
      misconfigurations and hardcoded secrets.
- [ ] Organization-specific rules are expressed as policy-as-code (OPA/Rego or
      Sentinel), not left to reviewer memory.
- [ ] Scanner and linter findings are emitted as SARIF and aggregated in one
      surface rather than scattered across job logs.
- [ ] A human reviews the `terraform plan` before apply, with explicit attention
      to resource replacement and destruction.
- [ ] Fast checks run in pre-commit for local feedback; CI is the enforcing gate,
      and the two run the same commands.
- [ ] Suppressions are justified inline and reviewed, never applied by silently
      disabling a whole rule set.
- [ ] Secrets never live in configuration or state; scanners are a backstop, not
      the primary control.
- [ ] Don't confuse `terraform validate` (schema-level) with real testing; it
      cannot catch insecure or logically wrong but syntactically valid code.

## Mental model

Think of it as a **funnel with a widening lens**. Each rung looks at the same
change through a lens that sees more but costs more to use:

1. `fmt`: does it look right (style).
2. `validate`: is it internally consistent (schema).
3. lint: does it follow provider rules and best practice.
4. `terraform test`: does it actually do what the author intended (behavior).
5. policy-as-code: is it allowed here (organization rules).
6. security scan: is it safe and compliant (security posture).
7. plan review: is this specific change what we really want (human judgment).

Cheap and narrow at the top, expensive and broad at the bottom. A change earns
its way down the funnel, and SARIF is the shared language that lets every lens
report into the same place.

## Cross-links

- [[infrastructure-as-code]]
- [[terraform-module-and-state-design]]
- [[secrets-and-supply-chain-security]]
- [[cicd-and-github-actions]]

## Sources

- Terraform tests (native test framework, `.tftest.hcl`, `run`/`assert`,
  `command = plan|apply`, GA in v1.6, mocking in v1.7):
  https://developer.hashicorp.com/terraform/language/tests
- `terraform fmt`: https://developer.hashicorp.com/terraform/cli/commands/fmt
- `terraform validate`:
  https://developer.hashicorp.com/terraform/cli/commands/validate
- TFLint (pluggable linter, provider rulesets, deprecated syntax, naming
  conventions, SARIF output): https://github.com/terraform-linters/tflint
- Checkov (static IaC misconfiguration scanner, frameworks, 750+ policies,
  secrets, resource graph, SARIF output):
  https://www.checkov.io/1.Welcome/What%20is%20Checkov.html
- Open Policy Agent and Rego (general-purpose policy engine, CNCF graduated):
  https://www.openpolicyagent.org/docs
- HashiCorp Sentinel (policy-as-code framework):
  https://developer.hashicorp.com/sentinel
- SARIF (Static Analysis Results Interchange Format, OASIS standard v2.1.0):
  https://sarifweb.azurewebsites.net/
- GitHub code scanning SARIF support (parses SARIF 2.1.0 from third-party tools):
  https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning
