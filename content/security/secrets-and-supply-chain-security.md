---
title: "Secrets & Supply-Chain Security"
tags: [security, devops]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Two linked problems sit under every deployment pipeline: **secrets** (how a service proves who it is without that proof leaking) and the **supply chain** (whether the code, dependencies, and build steps that produced your artifact are what you think they are). The modern answers converge on one idea: **stop storing long-lived secrets at all**. Replace static keys with short-lived, federated credentials minted per job via OIDC, keep any unavoidable secrets in a manager rather than in code, and harden the pipeline itself (pinned build steps, least privilege, scanning) so an attacker cannot slip something in between commit and deploy.

## Why it exists

A leaked long-lived credential is a skeleton key: it does not expire, it is valid from anywhere, and its theft is often invisible. Historically these keys sat in config files, environment variables, or CI secret stores, each a place they could leak from (logs, a compromised dependency, an over-broad token).

At the same time, attackers learned that the cheapest way into production is not the running app but the **path that builds and deploys it**: a malicious dependency, a tampered build action, or an over-privileged CI token. Supply-chain frameworks like SLSA exist because that path became the target. Securing secrets without securing the pipeline that wields them just moves the break-in one step earlier.

## How it works

### The secret-handling hierarchy

From worst to best:

1. **Hardcoded in source**: never. It is in history forever and ships to everyone with the repo.
2. **Environment variable / config**: better (config is separated from code, per twelve-factor), but the value still exists in plaintext somewhere and leaks into logs and child processes.
3. **Secret manager**: the value lives in a dedicated vault; code references it by name/version and fetches it at runtime with an audited, access-controlled path. Rotation happens in one place.
4. **Short-lived, federated credentials**: the best case is **no stored secret at all**. The workload proves its identity and is handed a credential that expires in minutes.

### Workload Identity Federation (no static keys)

The highest rung deserves detail because it removes the secret entirely. In CI, the platform mints a short-lived **OIDC token** (a JWT, see [[jwt-validation]]) describing *this* job: which repository, branch, environment, and workflow. The cloud is **pre-configured to trust** that issuer and to accept only tokens whose claims match a policy (for example, this repo on this branch). The job presents its OIDC token; the cloud validates the claims and returns a **short-lived access token valid only for that job**, which then expires.

![[workload-identity-federation.drawio.svg]]

The payoff: no long-lived cloud key is ever stored as a CI secret, the credential cannot be replayed after the job, and access is scoped by verifiable job identity rather than possession of a static string.

### Hardening the pipeline

Even with no secrets to steal, the pipeline itself must be trustworthy:

- **Pin third-party build steps to a full-length commit SHA**, not a moving tag. A SHA is effectively immutable (forging one needs a hash collision), so a compromised upstream tag cannot silently change what runs. Verify the SHA belongs to the real repository, not a fork.
- **Least privilege for the pipeline token.** Default the automation token to read-only, and grant write or specific scopes only to the jobs that need them.
- **Verify downloaded tooling by checksum** before executing it, so a swapped binary is caught.
- **Mask secret values** in logs, and never treat structured data (JSON) as a single secret, since partial redaction fails.

### Catching problems before merge

- **Secret scanning** (in pre-commit hooks and in CI) blocks credentials from ever landing in history.
- **IaC scanning** flags insecure infrastructure definitions (open access, missing encryption) before apply.
- Findings are commonly emitted as **SARIF**, a standard format so results from different scanners surface uniformly in code review.

### Provenance and the bigger picture

**SLSA** (Supply-chain Levels for Software Artifacts) frames the whole problem: it guards against source tampering, unauthorized or compromised build platforms, and dependency compromise, and it introduces **build provenance**, a tamper-evident record of *which build system produced this artifact from which source*. The controls above are concrete steps up those levels.

Two companions complete the picture. A **software bill of materials (SBOM)** lists every dependency that went into an artifact, so when a vulnerability is disclosed you can tell exactly which builds are affected instead of guessing. **Artifact signing** (for example Sigstore/cosign) lets a consumer verify an artifact was published by who they expect and has not been swapped in transit. Together: provenance attests *how* it was built, the SBOM records *what* went into it, and the signature proves *who* released it.

## Trade-offs & when to use

- **Federated short-lived credentials**: strongly preferred wherever the platform supports OIDC federation (most CI-to-cloud paths). Setup cost is a one-time trust configuration.
- **Secret manager**: the right home for secrets that genuinely cannot be federated (third-party API keys, database passwords). Pair with rotation.
- **Plain environment variables**: acceptable only for non-sensitive config, or as a last resort with tight log hygiene.

Pipeline hardening (SHA pinning, least privilege, scanning) is close to free and has no real downside, so it is a baseline, not a tradeoff.

## Pitfalls / done-right checklist

- **No secrets in source or history**; scan pre-commit and in CI to enforce it.
- **Prefer OIDC federation** so no long-lived cloud key is stored at all.
- **Keep unavoidable secrets in a manager**, referenced by name/version, and **rotate** them.
- **Pin actions/build steps to full commit SHAs**; verify origin.
- **Least-privilege pipeline tokens**; elevate per job, not globally.
- **Checksum-verify** downloaded binaries; **mask** secrets in logs.
- **Scan IaC** and surface findings via SARIF in review.
- **Review and remove** stale secrets and trust grants periodically.

## Mental model

Two shifts capture it. First, **from keys to passports**: a static secret is a copied house key anyone can use forever; a federated credential is a passport checked at the border, tied to who you are, stamped for this trip only, and worthless afterward. Second, **the factory, not just the product**: securing the app but not its build pipeline is guarding the storefront while leaving the loading dock open. Provenance is the tamper-evident "made in this factory, from these parts" seal that lets you trust what came off the line.

## Cross-links

- [[cicd-and-github-actions]]: the pipeline where these controls are configured.
- [[infrastructure-as-code]]: what IaC scanning inspects, and where cloud trust is defined.
- [[jwt-validation]]: the OIDC token used in federation is a JWT validated the same way.
- [[environments-and-promotion]]: why secrets are per-environment and never shared from prod down to non-prod.

## Sources

- GitHub Actions, OpenID Connect (workload identity federation, short-lived tokens): https://docs.github.com/en/actions/concepts/security/openid-connect
- GitHub Actions, secure use (SHA pinning, least-privilege token, secrets): https://docs.github.com/en/actions/reference/security/secure-use
- The Twelve-Factor App, Config: https://12factor.net/config
- SLSA (Supply-chain Levels for Software Artifacts): https://slsa.dev/spec/v1.0/about
- OWASP Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
