---
title: "Cloud and DevOps Security"
tags: [lesson-plan, security, platform]
level: deep
type: moc
reviewed: 2026-09-22
---

Security treated as a property of the platform and the pipeline rather than a review at
the end. Most of what follows is not a tool, it is a decision you make earlier than feels
necessary.

This path assumes the cloud and delivery material. It goes deeper on the same ground from
the attacker's side, which is why several sections will feel familiar and then turn.

## Objectives

By the end of this path you can:

* Reason about risk rather than enumerating vulnerabilities.
* Apply defence in depth, least privilege, and zero trust to a concrete design.
* Design IAM that survives an audit, and replace static keys with workload identity.
* Build network controls that assume the perimeter is already breached.
* Choose correctly between encryption, key management, secret management, and tokenization.
* Threat model an application and name the OWASP risks that apply to it.
* Harden a build pipeline against supply chain attack, with SBOM and provenance.
* Design detections that map to real adversary behaviour rather than to noise.

## Prerequisites

Working knowledge of cloud infrastructure and CI/CD. A sandbox project you can break.

> [!tip]
> Every control here is worth building once in your sandbox. Reading about VPC Service
> Controls teaches you the words; configuring one teaches you what it refuses.

## How to use this path

Work in order. Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** build or break something.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

## 1. Security fundamentals

The vocabulary, and the distinction that matters most.

**Focus:** What does the CIA triad cover and what does it miss? How does risk differ from
vulnerability?

**Learn:**
* [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework): the standard organising structure.
* [[glossary|Glossary]]: for any term that is new.

**Practice:** Take one system you run. List five vulnerabilities in it. Then rank them by
risk rather than by severity score, and write down why the order changed.

**Self-check:** you can define the triad and its extensions, and explain why not every
vulnerability is a risk.

> [!question]- Answer
> **The triad.** Confidentiality is that only authorised parties can read it. Integrity is
> that it has not been altered. Availability is that it is there when needed. Most
> security work is confidentiality, most outages are availability, and integrity is the
> one people forget until it bites.
> **AAA.** Authentication is who you are, authorisation is what you may do, accounting is
> what you did. The third is the one that gets deferred and then matters enormously during
> an incident.
> **Non-repudiation.** Proving a specific party took an action, usually through
> cryptographic signing. Distinct from authentication because it has to convince a third
> party later.
> **Privacy against security.** Privacy is what data you collect and how you use it.
> Security is protecting whatever data exists. A perfectly secure system can be a privacy
> disaster, and conflating them lets organisations claim one while failing the other.
> **Risk.** Threat times vulnerability times impact. The arithmetic is fuzzy, but the
> framing is what stops you treating a critical CVE in an unreachable component as more
> urgent than a medium one on your public login page. Prioritise by risk; severity scores
> do not know your architecture.

**Ask yourself:**
* Which of my open findings is high severity and low risk, and am I treating it that way?
* If someone altered my data silently, how long before I noticed?

## 2. Security doctrines

The principles that decide architectures.

**Focus:** What does defence in depth look like in a cloud stack? What does zero trust
replace? What should fail closed?

**Learn:**
* [Google BeyondCorp](https://cloud.google.com/beyondcorp): the zero trust implementation that popularised it.
* [[iam-and-workload-identity|IAM and workload identity]]: least privilege in practice.

**Practice:** Draw one of your services and mark every independent security layer between
the internet and its data. Count them. Then pick one and assume it has failed; work out
what the next layer actually stops.

**Self-check:** you can enumerate the layers in a cloud stack, explain zero trust against
perimeter security, and choose fail-secure or fail-open deliberately.

> [!question]- Answer
> **Defence in depth.** Multiple independent layers, none of which is expected to be
> perfect. A cloud stack has roughly eight: WAF, load balancer, service mesh
> authentication, application authorisation, database access control, encryption at rest,
> network policy, and audit logging. The test of a real layer is whether it still stops
> something when the one above it has failed.
> **Least privilege.** Every identity holds only the permissions it needs, only for as
> long as it needs them. This is the most violated principle in practice, and IAM sprawl
> is the universal cloud anti-pattern. It sprawls because granting is fast and revoking
> requires knowing what would break.
> **Zero trust.** No implicit trust from network position. Authenticate the user, the
> device, and the workload, authorise the specific action, and log it. It replaces the
> perimeter model where being inside the network implied trust, which failed because
> attackers get inside and because there is no longer an inside.
> **Separation of duties.** No one person or process completes a sensitive action alone.
> Authors do not approve their own deploys; production access needs break-glass and audit.
> **Fail secure or fail open.** When the policy engine is unreachable, does the system
> deny or allow? Fail secure is safer and causes outages. Fail open is available and
> unsafe. The failure is choosing by accident, which usually means fail open, discovered
> during an incident.

**Ask yourself:**
* If my authentication service were down right now, would my system deny or allow?
* Which permission grant in my project could nobody justify if asked today?

## 3. Identity, access, and authentication

The control plane everything else depends on.

**Focus:** Which authentication protocol fits which caller? What replaces a service
account key? What counts as phishing-resistant?

**Learn:**
* [[oauth2-and-oidc-flows|OAuth2 and OIDC flows]]: grants, PKCE, and on-behalf-of.
* [[jwt-validation|JWT validation done right]]: signatures, JWKS, and algorithm pinning.
* [[web-session-and-token-handling|Web session and token handling]]: keeping tokens off the browser.

**Practice:** Implement JWT validation that fetches JWKS, resolves by `kid`, pins the
algorithm, and checks issuer, audience, and expiry. Feed it a tampered token, a
wrong-audience token, and one with `alg: none`, and confirm all three are rejected.

**Self-check:** you can name the grant for each caller type, validate a token correctly,
and rank MFA methods by resistance to phishing.

> [!question]- Answer
> **Authentication against authorisation.** Authentication establishes identity.
> Authorisation decides what that identity may do. Most real breaches are authorisation
> failures, because authentication is the part people remember to test.
> **Grants.** Authorization code with PKCE for user sign-in, including for native and
> single-page apps. Client credentials for service to service. On-behalf-of, or token
> exchange, when a service acts as a user downstream. Implicit and password grants are
> deprecated and should not appear in new work.
> **Validation.** Fetch JWKS, resolve by `kid`, verify against a pinned algorithm, reject
> `alg: none` and anything unexpected. Then check `iss`, `aud`, `exp`, and `nbf`. Skipping
> the audience check is what lets a token minted for one service be replayed against
> another.
> **MFA ranking.** Phishing-resistant methods, meaning hardware tokens, passkeys, and
> WebAuthn, are the only acceptable option for privileged access. Push-based is next and
> is vulnerable to fatigue attacks. TOTP is weaker. SMS is broken and should be abandoned.
> **Workload identity.** Federation lets a workload prove what it is and exchange that for
> short-lived credentials, with no key at rest. A service account key is a long-lived
> secret that will eventually be committed, logged, or copied. Replacing keys with
> federation is the highest-value change available in most cloud estates.

**Ask yourself:**
* How many long-lived credentials exist in my estate, and who would notice if one leaked?
* Does anything I own check the signature but not the audience?

## 4. Network security

Controls that assume the attacker is already inside.

**Focus:** How do you design for containment rather than prevention? What is egress
control for? What does a service perimeter add over IAM?

**Learn:**
* [[cloud-networking|Cloud networking]]: VPC design and connectivity.
* [VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs/overview): perimeter-based exfiltration prevention.

**Practice:** Build a VPC with deny-by-default ingress and explicit egress rules. Route
outbound traffic through Cloud NAT. Then configure a service perimeter and try to reach a
protected service from outside it with valid credentials.

**Self-check:** you can design segmented networks, justify egress filtering, and explain
what a service perimeter stops that IAM does not.

> [!question]- Answer
> **Segmentation.** Separate subnets by trust level and workload, so a compromise in one
> does not reach the rest. The design question is not whether someone gets in, it is what
> they can reach afterwards.
> **Firewall design.** Deny by default on ingress, and target rules by service account
> rather than by network tag where possible, since a tag is a label anyone with edit
> access can apply and a service account is an identity.
> **Egress control.** Usually neglected, because outbound traffic feels benign. It is how
> data leaves and how implants call home. Explicit egress rules plus NAT with logging turn
> exfiltration from invisible into noticeable.
> **Private connectivity.** Private Google Access lets private instances reach provider
> APIs without public addresses. Private Service Connect exposes a service privately.
> Peering, VPN, and Interconnect join networks. Using public endpoints from private
> subnets because it was easier is a very common gap.
> **VPC Service Controls.** A perimeter around services, so that even valid IAM
> credentials cannot reach protected resources from outside it. This is the strongest data
> exfiltration control available in GCP, and it matters precisely because IAM alone cannot
> stop a legitimate credential used from an illegitimate place.

**Ask yourself:**
* If an attacker had valid credentials, what would stop them copying the data out?
* Do I know what my workloads talk to outbound, or only what talks to them?

## 5. Data protection

Encryption, keys, and the difference between them.

**Focus:** When does encryption at rest actually help? What does a KMS buy you? When is
tokenization the right answer?

**Learn:**
* [Cloud KMS documentation](https://cloud.google.com/kms/docs): key hierarchy and customer-managed keys.
* [[secrets-and-supply-chain-security|Secrets and supply chain security]]: where secrets live.

**Practice:** Encrypt a bucket with a customer-managed key, then revoke the key and watch
access fail. Move an application secret from an environment variable into Secret Manager
with an access policy.

**Self-check:** you can explain what encryption at rest protects against, describe key
rotation, and choose between encryption and tokenization.

> [!question]- Answer
> **At rest.** Protects against physical media theft and against a provider-level
> disclosure. It does not protect against an attacker with valid application credentials,
> because the application decrypts transparently. Default encryption is table stakes and
> is not a control against your actual threat model.
> **Customer-managed keys.** Move control of the key to you, so revoking the key revokes
> access even to the provider's copy. The cost is that you can now lock yourself out
> permanently, which is a real operational risk rather than a theoretical one.
> **In transit.** TLS everywhere, including between internal services. The internal
> network being trusted is exactly the assumption zero trust removes.
> **KMS against Secret Manager.** KMS manages keys and performs cryptographic operations
> without releasing the key. Secret Manager stores and serves secret values with access
> control, versioning, and audit. Using KMS to store a password, or Secret Manager to hold
> a key you then use locally, is a common confusion.
> **Tokenization.** Replaces sensitive data with a meaningless token, with the mapping
> held in a separate vault. Unlike encryption there is no key that reverses it in place,
> so systems handling tokens fall out of scope for compliance entirely. This is why it is
> the standard answer for card data rather than encryption.

**Ask yourself:**
* Does my encryption at rest stop anything in my actual threat model?
* If I lost a key today, what would become permanently unreadable?

## 6. Application security

The layer where most real breaches happen.

**Focus:** What is in the current OWASP Top 10? What does threat modelling produce that a
scanner does not?

**Learn:**
* [OWASP Top 10](https://owasp.org/www-project-top-ten/): the common web application risks.
* [OWASP API Security Top 10](https://owasp.org/www-project-api-security/): the API-specific list.
* [[anti-corruption-layer|Anti-corruption layer]] and [[testing-strategy|Testing strategy]] for the structural side.

**Practice:** Threat model one of your own services with STRIDE. For each OWASP category,
write one sentence on whether it applies and why. Then find one broken object level
authorization bug in something you own, because there probably is one.

**Self-check:** you can threat model a service, name the OWASP risks that apply, and
explain why broken object level authorization dominates API breaches.

> [!question]- Answer
> **Threat modelling.** Ask what you are building, what can go wrong, what you will do
> about it, and whether you did a good job. STRIDE enumerates spoofing, tampering,
> repudiation, information disclosure, denial of service, and elevation of privilege. The
> output a scanner cannot give you is the list of things that are wrong by design rather
> than wrong in an implementation.
> **The dominant API risk.** Broken object level authorization: the endpoint checks that
> you are authenticated and then trusts the object id you supplied. Changing `/orders/123`
> to `/orders/124` returns someone else's order. It dominates because authentication is
> centralised and easy to test, while per-object authorisation is scattered across every
> handler and invisible to scanners that do not know who should own what.
> **Injection.** Still present because string concatenation into an interpreter is still
> easy. Parameterised queries and context-aware output encoding are the answer, and no
> amount of input validation substitutes for them.
> **Secure defaults.** Deny by default, validate on the server regardless of client
> validation, fail closed, and never trust anything from the client including fields your
> own form sent.
> **Where authorisation belongs.** In the service, not the gateway and not the client. A
> gateway can authenticate; only the service knows whether this principal may act on this
> object.

**Ask yourself:**
* Could a logged-in user of my system read another user's record by changing an id?
* Which of my authorisation checks exist only in the frontend?

## 7. Supply chain security

Everything between your source and your running artifact.

**Focus:** What is actually in your supply chain? What does SLSA prescribe? What is an
SBOM for?

**Learn:**
* [SLSA framework](https://slsa.dev/): build integrity levels.
* [[secrets-and-supply-chain-security|Secrets and supply chain security]]: pipeline hardening.
* [Sigstore](https://www.sigstore.dev/): signing and verification without key management.

**Practice:** Generate an SBOM for one of your artifacts. Sign a container image and
verify the signature in a separate job. Then pin every third-party action in one pipeline
to a commit SHA and enable Dependabot.

**Self-check:** you can enumerate your supply chain, describe the SLSA levels, and explain
what provenance proves.

> [!question]- Answer
> **What is in it.** Source, dependencies, the build environment, the pipeline itself,
> container base images, deployment tooling, and the runtime. People secure the first two
> and forget that the build machine has credentials to production.
> **Attack categories.** Compromising a dependency, typosquatting a package name,
> compromising the build system, and tampering with an artifact after build. The build
> system is the highest-value target because it is trusted by everything downstream.
> **SBOM.** A machine-readable list of every component and version in an artifact. Its
> value shows up on the day a critical vulnerability lands in a transitive dependency and
> the question is which of your hundred services contain it. Without one, that question
> takes days.
> **SLSA.** Four levels of build integrity, from documented process up to hermetic,
> reproducible builds with verified provenance. The useful part is that it gives you a
> ladder rather than a binary, so you can name where you are.
> **Provenance.** A signed claim about where an artifact was built, from what source, with
> what dependencies. It converts "this image came from our pipeline" from an assumption
> into something verifiable at deploy time, which is what lets you refuse unsigned images
> in production.

**Ask yourself:**
* If a transitive dependency had a critical CVE today, how long to list every affected service?
* What could my build system reach if it were compromised right now?

## 8. Security in the pipeline

Making the controls run automatically.

**Focus:** What belongs in CI rather than in a pre-launch audit? What is policy as code?

**Learn:**
* [[iac-testing-and-security|IaC testing and security]]: validating infrastructure before it exists.
* [Open Policy Agent](https://www.openpolicyagent.org/): policy as code.
* [[cicd-and-github-actions|CI/CD and GitHub Actions]]: where the gates live.

**Practice:** Add secret scanning, dependency scanning, IaC scanning, and container
scanning to one pipeline. Make exactly one of them blocking and justify which. Then write
one OPA policy that rejects a public bucket.

**Self-check:** you can build a pipeline with layered security gates and explain which
should block and which should report.

> [!question]- Answer
> **Shifting left.** Catching a vulnerability in review costs minutes; catching it in
> production costs days and an incident. Security tests belong in CI alongside unit tests,
> running on every change rather than before a launch.
> **What to scan.** Secrets in commits, dependencies for known CVEs, infrastructure code
> for misconfiguration, and container images for vulnerable packages. Each catches a
> different class and none substitutes for another.
> **What should block.** Secret detection, always, because a committed credential is
> already compromised and the cost of a false positive is a minute. Dependency and image
> scanning usually should not block on their own, because the noise rate is high enough
> that a blocking gate gets bypassed and then ignored. A gate everyone routes around is
> worse than no gate, because it produces false confidence.
> **Policy as code.** Rules expressed as executable policy, evaluated in the pipeline and
> at admission. "No public buckets", "no unencrypted disks", "only these regions". It beats
> documentation because it is enforced rather than read.
> **Shifting right.** The complement, and section 9. Prevention is incomplete, so runtime
> detection and response are not optional extras.

**Ask yourself:**
* Which of my gates do people routinely bypass, and what does that tell me?
* Is any of my policy enforced only by a document nobody reads?

## 9. Detection and response

Assuming prevention failed.

**Focus:** What should you log and keep? What makes a detection valuable rather than
noisy? What does the incident lifecycle require before an incident?

**Learn:**
* [MITRE ATT&CK](https://attack.mitre.org/): the catalogue of adversary techniques.
* [NIST incident response guide](https://csrc.nist.gov/pubs/sp/800/61/r2/final): the lifecycle.
* [[observability-with-opentelemetry|Observability with OpenTelemetry]]: the instrumentation side.

**Practice:** Enable admin activity and data access audit logs and route them somewhere
with retention. Write one detection for a real technique, such as a service account key
being created. Then run a tabletop exercise on a credential compromise.

**Self-check:** you can describe the incident lifecycle, explain the pyramid of pain, and
write a detection that maps to a technique rather than an indicator.

> [!question]- Answer
> **The lifecycle.** Preparation, detection and analysis, containment, eradication and
> recovery, then post-incident activity. Preparation is the phase that determines how the
> others go, and it is entirely work done before anything happens.
> **The pyramid of pain.** Hash values are trivial for an attacker to change, then IP
> addresses, then domain names, then network artifacts, then tools, then tactics and
> techniques. Detections higher up the pyramid cost the attacker more to evade, which is
> why a detection on behaviour outlives a detection on an indicator.
> **MITRE ATT&CK.** The catalogue of what attackers actually do. Mapping your detections
> onto it shows coverage gaps you would otherwise not know you had.
> **What to log.** Admin activity, data access, authentication events, network flows, and
> application audit events. Retain long enough to investigate, which is longer than you
> think, because the median time to discover a breach is measured in months rather than
> days.
> **Detection quality.** A detection nobody acts on is worse than none, because it trains
> people to ignore the channel. Every alert should have a documented response, and one
> that does not is a candidate for deletion rather than tuning.

**Ask yourself:**
* If a credential were stolen today, which log would show it and is that log retained?
* Which of my alerts has never resulted in an action?

## 10. Governance and where this goes

The organisational layer.

**Focus:** Which compliance frameworks matter and what do they demand? What can org-level
policy prevent that per-project controls cannot?

**Learn:**
* [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks): configuration baselines per platform.
* [GCP Organization Policy](https://cloud.google.com/resource-manager/docs/organization-policy/overview): preventive org-level constraints.

**Practice:** Apply the CIS benchmark to your sandbox and fix the top three findings. Set
one organisation policy constraint, such as disallowing external IPs, and confirm it
blocks a violation.

**Self-check:** you can describe the major compliance frameworks, apply a CIS benchmark,
and explain why preventive org policy beats detective controls.

> [!question]- Answer
> **The frameworks.** SOC 2 attests to controls over time and is what enterprise customers
> ask for. ISO 27001 certifies an information security management system. PCI DSS applies
> if you touch card data, and is why tokenization exists. GDPR and similar are privacy
> law rather than security frameworks, though they drive security requirements.
> **What they actually demand.** Evidence. Most of the work is not implementing a control,
> it is being able to demonstrate the control operated continuously. Designing for
> evidence from the start is far cheaper than reconstructing it during an audit.
> **CIS Benchmarks.** Concrete configuration baselines per platform. The right starting
> point for hardening, because it is specific where frameworks are abstract.
> **Organisation policy.** Preventive constraints at the org or folder level: no public
> IPs here, only these regions, no service account key creation. Preventive beats
> detective because a violation that cannot be created needs no detection, no ticket, and
> no remediation.
> **Security as code.** Policies, detections, and infrastructure all in version control,
> reviewed and tested like anything else. The alternative is a configuration nobody can
> reconstruct and a control nobody can prove was in place last March.

**Ask yourself:**
* Could I prove a control was operating three months ago, or only that it is now?
* What should be impossible in my org that is currently merely discouraged?

## Capstone

One sandbox environment demonstrating the full stack: workload identity with no static
keys, a segmented VPC with egress control and a service perimeter, customer-managed
encryption, secrets in a manager with access policies, a pipeline with layered scanning
and policy as code, signed images with provenance verified at deploy, audit logging routed
with retention, and one working detection mapped to an ATT&CK technique.

Then write the threat model it answers, including what it does not defend against.

## Self-assessment checklist

- [ ] I can prioritise by risk rather than by severity score.
- [ ] I can enumerate defence layers and choose fail-secure or fail-open deliberately.
- [ ] I can name the right grant per caller and validate a token correctly.
- [ ] I can design segmented networks with egress control and explain a service perimeter.
- [ ] I can choose between encryption, KMS, Secret Manager, and tokenization.
- [ ] I can threat model a service and explain broken object level authorization.
- [ ] I can enumerate my supply chain and explain SLSA and provenance.
- [ ] I can build layered pipeline gates and justify which block.
- [ ] I can describe the incident lifecycle and write a behaviour-based detection.
- [ ] I can apply a CIS benchmark and explain why preventive org policy wins.
