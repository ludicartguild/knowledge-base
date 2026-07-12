---
title: "Cloud IAM: Identities, Roles & Least Privilege"
tags: [platform, security]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Cloud [[glossary#i|IAM]] (Identity and Access Management) is the system that decides
**who can do what to which resource**. Every request to a cloud [[glossary#a|API]] is authenticated
(which identity is this) and then authorized (is this identity allowed to perform this
action on this resource). Identities are either **humans** or **workloads** (machines,
services, and automation). Permissions are grouped into **roles** and attached to
identities through **policies**. The guiding discipline is **least privilege**: grant
only the permissions actually needed, and nothing more. The single biggest source of
cloud breaches is long-lived static credentials (access keys, service account key files)
that leak. The modern fix is **short-lived credentials**: an identity proves who it is
and receives a temporary token that expires in minutes to an hour. **Workload Identity
Federation** extends this so an external workload authenticates with a short-lived [[glossary#o|OIDC]]
token from its own environment instead of holding a stored cloud key at all. The
CI-to-cloud version of that pattern is covered in [[secrets-and-supply-chain-security]];
this note is the broader [[glossary#i|IAM]] picture.

## Why it exists

A cloud account is a control panel for real infrastructure: databases, storage,
networks, virtual machines, and the ability to create and destroy all of it through an
[[glossary#a|API]]. Without a gatekeeper, anyone with the account credentials could do
anything. IAM is that gatekeeper. It answers one question on every single API call:
**should this identity be allowed to perform this action on this resource right now?**

Two forces make IAM the center of cloud security.

- **Blast radius.** In the cloud, an over-permissioned identity is not a small mistake.
  A single credential with broad rights can read every bucket, delete every database, or
  spin up expensive resources across an entire account. The damage an identity can do is
  bounded only by the permissions it holds, which is why constraining those permissions
  is the whole game.
- **Static keys leak.** A long-lived credential is a secret that never changes. It ends
  up committed to a repository, pasted into a chat, baked into a container image, or
  copied onto a laptop that is later lost. Because it does not expire, a leaked static
  key is useful to an attacker indefinitely, and its use is hard to distinguish from
  legitimate traffic. The overwhelming majority of cloud intrusions trace back to a
  credential that should never have existed in a stored, long-lived form. Reducing the
  number of standing secrets, and the lifetime of the ones that must exist, is the
  highest-leverage thing IAM does.

## How it works

### Principals: humans versus workloads

An **identity** (also called a **principal**) is anything that can be authenticated and
make a request. There are two broad kinds, and keeping them separate matters.

- **Human users.** Real people who sign in interactively. They are backed by an identity
  provider ([[glossary#i|IdP]]), authenticate with credentials plus multi-factor
  authentication, and typically get access through group membership. Humans should almost
  never hold long-lived API keys; they should sign in and receive a session.
- **Workload identities.** Non-human identities used by code: services, jobs, functions,
  containers, and automation. Different clouds name them differently (service accounts,
  managed identities, IAM roles for services), but the concept is the same, an identity
  that a piece of software runs as. Workloads authenticate without a human present, so
  how they get credentials is the crux of the security problem, addressed below.

A useful rule: humans get **roles through groups**, workloads get **roles through the
identity they run as**, and neither should carry a permanent secret if a short-lived one
will do.

### Permissions, roles, and policies

Three layers turn "this identity exists" into "this identity may do X."

- A **permission** is the atomic unit: the right to perform one action on one kind of
  resource, for example "read an object from a storage bucket" or "start a virtual
  machine."
- A **role** is a named bundle of permissions, for example a "viewer" role that can read
  but not modify, or an "admin" role that can do everything in a service. Roles exist so
  you assign a coherent job function rather than hundreds of individual permissions.
- A **policy** is the binding that says **this principal has this role on this resource
  (optionally under these conditions)**. The policy is where authorization actually
  lives: it connects a principal to a role and scopes it to a resource boundary (an
  account, a project, a folder, a single bucket).

Different clouds arrange these pieces differently. Some attach policy documents directly
to identities and resources; others bind predefined or custom roles to principals at a
point in a resource hierarchy. The vocabulary varies, but every model reduces to
principal plus permission set plus resource scope plus optional condition.

### The principle of least privilege

**Least privilege** means every identity is granted the minimum permissions needed to do
its job, scoped to the narrowest resource boundary, for the shortest time. It is the load
bearing principle of IAM. In practice it means:

- Prefer narrow, purpose-built roles over broad predefined ones like account-wide
  administrator.
- Scope a grant to a specific resource or project, not the whole organization, whenever
  the work allows it.
- Separate duties so no single identity both deploys code and, say, manages billing or
  security policy, limiting what one compromised identity can reach.
- Start from zero and add permissions as they prove necessary, rather than starting broad
  and trying to trim later (trimming rarely happens, so broad grants become permanent).

Least privilege is a direct answer to blast radius: if an identity can only touch one
bucket, compromising it only exposes one bucket.

### RBAC versus ABAC

There are two dominant models for expressing authorization, and mature systems blend
them.

- **[[glossary#r|RBAC]] (Role-Based Access Control)** grants permissions by assigning principals to
  **roles**. It is standardized (ANSI INCITS 359) and is the default mental model in
  every major cloud: define roles like viewer, editor, and admin, attach permissions to
  the role, and assign principals to it. RBAC is simple to reason about and audit because
  access is a function of a small set of named roles. Its weakness is **role explosion**:
  when access needs to depend on many contextual factors, you end up minting a
  combinatorial number of narrow roles.
- **ABAC (Attribute-Based Access Control)** grants access by evaluating **attributes** of
  the principal, the resource, the action, and the environment against a policy, as
  described in NIST SP 800-162. Instead of "has the editor role," a rule might read "may
  write if the principal's team attribute equals the resource's team tag and the request
  comes from a corporate network." ABAC is far more expressive and scales to fine-grained,
  context-dependent access without role explosion, at the cost of being harder to audit
  ("who can access this?" becomes a policy evaluation rather than a lookup). NIST notes
  that RBAC is effectively a one-dimensional special case of ABAC where the only attribute
  is "role."

In real cloud IAM you use both: RBAC for the coarse job-function grants, plus
attribute-style **conditions** (resource tags, request context, network origin) layered
on top to tighten them.

### Role assumption and short-lived credentials

The safest credential is one that did not have to be stored, and the mechanism that makes
that possible is **role assumption**. Instead of holding a permanent key, an identity
**assumes a role** and receives **temporary security credentials** from a token service
(for example a cloud Security Token Service, [[glossary#s|STS]]). Those credentials carry
the role's permissions and expire automatically, from a few minutes up to a small number
of hours.

This changes the security math completely. A leaked long-lived key is useful forever; a
leaked short-lived credential is useless once it expires, often within the hour. Role
assumption also produces a clean audit trail (who assumed which role, when) and lets you
grant a human or workload elevated rights **only for the duration of a task** rather than
permanently. The guidance across clouds is consistent: set the session lifetime to the
shortest that fits the work, minutes for an automated job rather than the maximum the
service allows.

### Workload Identity Federation via OIDC

Role assumption still leaves one question: how does an **external** workload, one running
outside the cloud, prove who it is without a stored key? The answer is **Workload
Identity Federation**. The cloud is configured to **trust an external OIDC issuer**. A
workload running in that external environment is handed a short-lived, signed OIDC token
(a [[glossary#j|JWT]]) describing its identity through **claims**. It presents that token
to the cloud's token service, which validates the signature against the issuer's
published keys, checks the claims against a **trust policy**, and, if they match,
exchanges the token for a short-lived cloud credential. This follows the OAuth 2.0 token
exchange pattern; the cloud never stores a secret for the workload, and the workload never
holds a standing cloud key.

The canonical example is a CI job that needs to deploy to the cloud. Rather than storing a
long-lived cloud key as a CI secret, the CI platform's OIDC provider mints a per-job token
whose claims identify the exact repository, branch, or environment, and the cloud
exchanges that token for a short-lived credential scoped to a specific role. Because that
CI-to-cloud flow is the most common and most security-sensitive instance of this pattern,
it is covered in depth (including the trust-policy claim pinning that stops other
repositories from impersonating yours) in [[secrets-and-supply-chain-security]]. The
general lesson here is broader than CI: any workload with its own trustworthy identity
token, in any environment, can federate into the cloud and skip stored keys entirely. See
also [[oauth2-and-oidc-flows]] for how OIDC issues and signs the tokens this depends on.

### Auditing and access reviews

Least privilege is not a one-time setup; permissions accrete. Two ongoing practices keep
it honest.

- **Audit logging.** Every authentication and every meaningful authorization decision is
  logged (who, what action, which resource, when, allowed or denied). These logs are the
  raw material for incident response and for detecting anomalous use of a credential.
  Token-service calls in particular (who assumed what role) should always be logged.
- **Access reviews.** On a recurring cadence, someone verifies that each identity still
  needs the access it has, and revokes what it does not. Cloud tooling helps by surfacing
  **unused permissions** and recommending tighter roles based on what an identity has
  actually used. The goal is to converge granted permissions toward used permissions over
  time, closing the gap that over-broad initial grants create.

## Trade-offs & when to use

- **Security versus friction.** Tighter, shorter-lived, more granular access is safer but
  imposes more setup and more moments where someone has to request or assume access.
  Calibrate to blast radius: a production account managing customer data warrants strict
  least privilege and federation; a throwaway sandbox does not need the same ceremony.
- **RBAC versus ABAC.** Start with RBAC for its simplicity and auditability. Reach for
  attribute-based conditions when role explosion appears, that is, when you find yourself
  creating many near-identical roles that differ only by a resource boundary or a
  contextual factor. Do not adopt full ABAC prematurely; its expressiveness is also its
  audit cost.
- **Short-lived credentials versus operational simplicity.** Federation and role
  assumption remove standing secrets but add trust configuration and a dependency on a
  token service. This is almost always worth it. The rare exception is a constrained
  environment with no OIDC issuer and no federation support, where a tightly scoped,
  frequently rotated key stored in a secrets manager may be the pragmatic floor. Treat
  that as a fallback, not a default.
- **Central versus team-owned policy.** Centralizing IAM gives consistency and control but
  can bottleneck delivery; letting teams self-serve is faster but drifts toward
  over-grants. The common resolution is central **guardrails** (organization-wide policies
  that cap what anyone can grant) plus delegated day-to-day management within those rails.

## Pitfalls / done-right checklist

- [ ] No human user holds a long-lived API key; humans sign in interactively and get
      access through groups, with multi-factor authentication enforced.
- [ ] Workloads use federated short-lived credentials (Workload Identity Federation or
      role assumption); no service account key files are downloaded and stored.
- [ ] Where a static key is genuinely unavoidable, it lives in a secrets manager, is
      tightly scoped, and is rotated on a schedule, never committed to source or an image.
- [ ] Roles grant the minimum permissions for the job. Account-wide administrator and
      owner are reserved for break-glass use, not day-to-day work.
- [ ] Avoid **wildcard permissions** (grants like `*:*` or "all actions on all
      resources"); enumerate the specific actions and resources instead.
- [ ] Grants are scoped to the narrowest resource boundary that fits the work, not the
      whole organization by default.
- [ ] Token/session lifetimes are set to the shortest duration that fits the task, not the
      maximum the service permits.
- [ ] Duties are separated: no single identity both ships code and controls security,
      billing, or the audit trail.
- [ ] Audit logging is on for authentication and token-service calls, and the logs are
      retained and monitored.
- [ ] Access reviews run on a cadence, unused permissions are surfaced and revoked, and
      granted access is driven toward actually-used access.
- [ ] Federation trust policies pin specific claims (issuer, subject, and context) so
      only the intended workloads can exchange a token, never a whole issuer wildcard.

## Mental model

Think of a cloud account as a **building with electronic badge access**. A **permission**
is the right to open one specific door. A **role** is a badge preloaded with a coherent
set of doors for a job (a "cleaner" badge, a "manager" badge). A **policy** is the record
that says this person carries this badge in this wing of the building. **Least privilege**
means nobody carries the master key just because it is convenient; you get exactly the
doors your job needs and no others.

**Static keys** are like a physical key you cut once and never change: if it is copied,
the copy works forever and you may never know. **Short-lived credentials** are like a
badge that goes dead an hour after you check in, so a copied badge is quickly worthless.
**Workload Identity Federation** is the building agreeing to honor the badges issued by a
trusted neighboring building's badge machine: a visiting worker shows the badge their own
employer minted, the front desk verifies it against the agreed trust rules, and issues a
temporary building badge on the spot, so no permanent key ever has to be handed out or
stored.

The whole discipline is a steady push in one direction: fewer standing secrets, shorter
lifetimes, narrower scopes, and a written record of who can reach what.

## Cross-links

- [[secrets-and-supply-chain-security]]
- [[oauth2-and-oidc-flows]]
- [[cloud-and-gcp]]

## Sources

- NIST SP 800-162, Guide to Attribute Based Access Control (ABAC) Definition and
  Considerations (attributes of subject, object, operation, environment; RBAC as a
  special case of ABAC): https://csrc.nist.gov/pubs/sp/800/162/upd2/final
- ANSI INCITS 359, Information Technology, Role Based Access Control (the RBAC standard),
  overview: https://csrc.nist.gov/projects/role-based-access-control
- [[glossary#a|AWS]], Temporary security credentials in IAM ([[glossary#s|STS]], short lifetime from minutes to hours,
  credentials stop working after expiry):
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html
- AWS STS AssumeRole API (returns temporary credentials consisting of an access key,
  secret, and session token; roles have no long-term secret):
  https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html
- Google Cloud, Workload Identity Federation (OAuth 2.0 token exchange with an STS,
  one-hour federated tokens, any OIDC or SAML provider, eliminates service account keys):
  https://docs.cloud.google.com/iam/docs/workload-identity-federation
- GitHub Docs, OpenID Connect (short-lived tokens valid for a single job, no long-lived
  cloud secrets stored, trust conditions on claims):
  https://docs.github.com/en/actions/concepts/security/openid-connect
- GitHub Docs, Configuring OpenID Connect in cloud providers (establishing the OIDC trust
  relationship and defining claim conditions):
  https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers
