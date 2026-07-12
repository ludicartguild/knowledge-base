---
title: "CI/CD & GitHub Actions"
tags: [platform, cicd]
level: fundamentals
type: concept
reviewed: 2026-07-12
---


Shipping code by hand, building it, testing it, copying files to a server, does not scale past a handful of changes before something gets skipped and breaks in production. [[glossary#c|CI/CD]] is the practice of automating that path from "code is written" to "code is running," so the same checks and steps happen the same way every single time.

## What CI/CD means

* **Continuous Integration (CI)**: every time code is pushed, an automated system builds it and runs the test suite. The goal is to catch a broken build or a failing test within minutes, while the change is still fresh, instead of days later.
* **Continuous Delivery**: CI plus automatically packaging the app so it is always in a deployable state. A human still clicks the button to release.
* **Continuous Deployment**: the same idea taken one step further: passing changes deploy to production automatically, with no manual approval step.

> [!note]
> "Delivery" and "Deployment" are often blurred together in casual conversation, and both get shortened to "CD." The distinction that matters in an interview: delivery still has a manual release gate, deployment does not.

Why this exists:

* **Catches problems early.** A test failure caught on a five-minute pipeline run is cheap. The same bug found by a user in production is expensive.
* **Removes manual, error-prone steps.** A script or workflow runs the same way every time; a person copying files by hand eventually forgets a step.
* **Makes shipping boring: in a good way.** Frequent, small, automated releases are lower-risk than rare, large, manual ones.

## The pipeline

![[cicd-pipeline.drawio.svg]]

A typical pipeline runs as a sequence of stages, each one gating the next, if a stage fails, the pipeline stops and the developer gets notified instead of a broken change moving forward.

1. **Build**, compile the code, install dependencies, produce an artifact (a binary, a container image, a bundled frontend).
2. **Test**, run automated tests (unit, integration, sometimes end-to-end) against the build.
3. **Lint/scan**, check code style, run static analysis, scan dependencies for known vulnerabilities.
4. **Deploy**, push the artifact to an environment (staging, then production), often behind a manual approval for the production step.

> [!tip]
> If asked to describe a pipeline in an interview, name the stages in order and say what each one is protecting against, a bad build, a regression, a style or security issue, a broken release. That framing matters more than naming a specific tool.

## GitHub Actions basics

GitHub Actions is GitHub’s built-in automation system for running CI/CD pipelines. Workflows are defined as YAML files committed to the repository under `.github/workflows/`, so the pipeline configuration lives alongside the code it builds.

Core vocabulary:

* **Workflow**: one automated process, defined in one YAML file (e.g. `.github/workflows/ci.yml`).
* **Trigger (`on:`)**: the event that starts the workflow, most commonly `push` (code lands on a branch) or `pull_request` (a [[glossary#p|PR]] is opened or updated).
* **Job**: a group of steps that runs on its own runner. A workflow can have multiple jobs, which run in parallel by default.
* **Step**: a single command or action inside a job. Steps in a job run in order, on the same runner.
* **Action (`uses:`)**: a reusable, packaged step someone else wrote (checking out code, setting up a language runtime, publishing an artifact) referenced by name and version.
* **Runner**: the virtual machine (`runs-on:`) that executes the job, commonly `ubuntu-latest`.
* **Secrets**: encrypted values ([[glossary#a|API]] keys, tokens, credentials) stored in the repository settings and referenced as `${{ secrets.NAME }}` instead of hardcoded in the YAML.

A minimal workflow that runs tests on every push and pull request:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

> [!note]
> `uses:` pulls in someone else’s packaged step (like checking out the repo or installing a language runtime); `run:` executes a plain shell command directly. Most workflows are a mix of both.

## How to talk about this in an interview

It is fine to not have hand-written a complex pipeline yet. What matters is fluency with the concepts and the honesty to say so plainly.

A strong answer:

* Explains CI and CD in plain language before naming any tool.
* Walks through the stages of a pipeline in order and what each one protects against.
* Can read a short workflow YAML file and say what triggers it and what it does.
* Is comfortable saying "I’ve read and modified workflow files more than authored complex ones from scratch, but I understand the pieces and can figure out the rest" rather than overstating experience.

See [[communication|the communication note]] for more on framing honest gaps in experience during an interview.

## Key terms

| Term | Quick definition |
| --- | --- |
| CI | Continuous Integration, automatically build and test every code change. |
| CD | Continuous Delivery/Deployment, automatically package (and optionally release) a passing build. |
| Workflow | A YAML file under `.github/workflows/` defining an automated pipeline. |
| Job | A group of steps in a workflow that runs on one runner. |
| Runner | The virtual machine that executes a job. |
| Action | A reusable, packaged step referenced with `uses:`. |
| Secret | An encrypted credential stored in repo settings and injected into a workflow at runtime. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* Sketch a pipeline as the four stages in this note (build, test, lint/scan, deploy) and, for each stage, write one line naming what it protects against.
* Write a minimal workflow YAML under `.github/workflows/` that triggers on `push` to main and on `pull_request`, checks out the code, sets up a runtime, and runs the test suite.
* Take that workflow and label each line as a trigger, job, step, action (`uses:`), or plain command (`run:`).

**Check yourself** (you should be able to answer these from this note):

* What is the difference between Continuous Delivery and Continuous Deployment?
* Name the four pipeline stages in order and what each one is protecting against.
* What is the difference between a `uses:` step and a `run:` step?
* Where do workflow files live, and how is a secret referenced inside one instead of being hardcoded?

## Watch

![](https://www.youtube.com/watch?v=R8_veQiYBjI)

## Related notes

* [[git-and-github|Git and GitHub]]: workflows trigger on the pushes and pull requests described there.
* [[docker-and-compose|Docker & Compose]]: the artifact a pipeline builds and deploys is often a container image.
* [[infrastructure-as-code|Infrastructure as Code]]: pipelines often deploy by applying [[glossary#i|IaC]] rather than copying files by hand.
* [[communication|Communication]]: how to talk about experience gaps honestly in an interview.
* [[glossary|Glossary]]: definitions for terms introduced here.
