---
title: "Cloud Specialist Path (GCP)"
tags: [lesson-plan, platform, cloud]
level: deep
type: moc
reviewed: 2026-09-22
---

Cloud fundamentals through to specialist depth on Google Cloud, with app modernization as
the destination. The vocabulary is portable across providers; the specifics here are GCP,
because depth in one platform transfers better than breadth across three.

This is a long path. Plan a year alongside full-time work, and expect to revisit early
sections once the later ones have changed what you notice.

## Objectives

By the end of this path you can:

* Define the service and deployment models precisely, and place any service on them.
* Navigate the GCP resource hierarchy and explain why it is the platform's load-bearing idea.
* Build infrastructure in Terraform with remote state, and reconcile drift.
* Design a VPC with deny-by-default firewalling and least-privilege IAM.
* Run containers on both GKE and Cloud Run, and say which fits a given workload.
* Pick a migration strategy for a legacy application and defend the choice.
* Instrument a service against the four golden signals and set an SLO with an error budget.
* Talk about cloud cost as an operational practice rather than an architecture constraint.

## Prerequisites

A personal GCP account with billing enabled and the free tier available. Comfort on the
command line. Some programming. Prior infrastructure experience helps but is not assumed.

> [!tip]
> Everything you build here belongs in one sandbox project that grows across the path.
> By the end it is a defensible reference architecture rather than ten disconnected labs,
> and it doubles as a portfolio piece.

## How to use this path

Work in order; each section assumes the last. Each follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** build it in your sandbox.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

## 1. Cloud fundamentals

The vocabulary, used precisely.

**Focus:** What separates IaaS, PaaS, SaaS, and FaaS? Where does the shared
responsibility line move? What is the difference between availability and durability?

**Learn:**
* [[cloud-and-gcp|Cloud and GCP]]: the platform overview note.
* [Google Cloud: shared responsibility](https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate): where the line sits per service model.

**Practice:** Take five services you already use and place each on the service model
spectrum. For each, write one sentence on what you are responsible for securing and what
the provider is.

**Self-check:** you can define the service models, state where the responsibility line
sits for each, and distinguish elasticity, scalability, availability, and durability.

> [!question]- Answer
> **Service models.** IaaS gives raw compute, storage, and network while you own the OS
> upward. PaaS takes your code and manages the runtime. SaaS is finished software. FaaS
> is a single function invoked by an event, with no server concept at all. The line
> between them is how far up the stack the provider's responsibility stops.
> **Shared responsibility.** The provider secures the cloud; you secure what you put in
> it. The split moves with the service model, so IaaS leaves you patching kernels while
> SaaS leaves you managing only identity and data.
> **Regions and zones.** A region is a geographic location such as `us-central1`. A zone
> is an independent failure domain within it, such as `us-central1-a`. Most regions have
> three or more. The vocabulary is the same across providers; the physical reality behind
> it is not.
> **The four properties people conflate.** Elasticity is automatically adding and removing
> capacity with demand. Scalability is the ability to handle more load at all, whether or
> not it is automatic. Availability is the proportion of time the service answers.
> Durability is the probability your stored data still exists. A service can be highly
> durable and frequently unavailable.
> **Pricing primitives.** Pay-as-you-go, committed use, and spot or preemptible. These
> are not a billing detail. Spot instances change what architectures are viable, and
> committed use changes what you are willing to run continuously.

**Ask yourself:**
* For a service I run, which of those four properties does the business actually care about?
* Where exactly does my responsibility begin for each thing in my stack?

## 2. Core building blocks

The primitives every cloud offers under different names.

**Focus:** What are the compute, storage, network, database, and identity primitives, and
what is the GCP name for each?

**Learn:**
* [[cloud-and-gcp|Cloud and GCP]]: the GCP service map.
* [Google Cloud products](https://cloud.google.com/products): the full catalogue, skimmed for shape rather than read.

**Practice:** Draw the same three-tier web application twice: once in generic primitives,
once in named GCP services. Note where the mapping is not one to one.

**Self-check:** you can name the primitive categories and give the GCP service for each.

> [!question]- Answer
> **Compute.** Virtual machines (Compute Engine), containers (GKE, Cloud Run), functions
> (Cloud Functions), and batch. The trade is control against operational burden, and it
> runs in that order.
> **Storage.** Object storage (Cloud Storage), block storage attached to a VM (Persistent
> Disk), and file storage (Filestore). Object storage is the default for anything that is
> not a database, and the one people underuse.
> **Networking.** VPC, subnets, routes, firewall rules, load balancers, DNS, and CDN.
> **Database.** Relational (Cloud SQL, AlloyDB), horizontally scalable relational
> (Spanner), document (Firestore), wide-column (Bigtable), and analytical (BigQuery).
> BigQuery is not an application database, and treating it as one is a common and
> expensive mistake.
> **Identity.** Principals, roles, policies, service accounts, and federation. See
> [[iam-and-workload-identity|IAM and workload identity]].
> **Where mapping breaks.** GCP load balancing is global and anycast, so it has no direct
> AWS equivalent. Projects have no real AWS analogue either. Assuming a one-to-one
> mapping from another cloud is what produces awkward GCP architectures.

**Ask yourself:**
* Which primitive do I reach for by habit rather than by fit?
* Where in my current design am I using a database because it was familiar?

## 3. GCP orientation

The hierarchy everything else hangs from.

**Focus:** What is the resource hierarchy, and why does it matter more than any single
service? What is a project actually the unit of?

**Learn:**
* [Google Cloud: resource hierarchy](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy): organisations, folders, projects.
* [gcloud CLI overview](https://cloud.google.com/sdk/gcloud): the tool a specialist uses fluently.

**Practice:** Create your sandbox project. Set up `gcloud` with a named configuration so
it never collides with a work account. Enable the APIs you need and inspect the IAM
policy at the project level.

**Self-check:** you can explain the hierarchy and inheritance, and work fluently in
`gcloud` rather than the console.

> [!question]- Answer
> **The hierarchy.** Organisation, then folders, then projects, then resources. Policies
> set higher are inherited downward and cannot be revoked lower down. This is the single
> most important concept in GCP, because it is how you reason about blast radius and
> about who can do what where.
> **What a project is.** The unit of billing, of resource grouping, and of API
> enablement. Every resource lives in exactly one. Multi-project architectures are
> normal rather than advanced, and one project per environment per system is a reasonable
> default.
> **Billing accounts.** Separate from projects. One billing account funds many projects,
> which is what lets you delete a project cleanly without touching payment setup.
> **Console against CLI.** The console is good for exploring and for seeing what exists.
> It is bad for anything you will do twice, and it leaves no record. Fluency in `gcloud`
> is what separates someone who uses GCP from someone who operates it.
> **Practical note.** Use named `gcloud` configurations when you have both a personal and
> a work account. Mixing them is how people accidentally create resources on an employer's
> billing account.

**Ask yourself:**
* If I had to revoke one person's access everywhere, where would I do it?
* What in my setup would break if a policy were applied at the folder level?

## 4. Infrastructure as code

Describing what you want instead of clicking through it.

**Focus:** What does declarative actually mean here? Why is state the decision that
matters most? What is drift and how do you handle it?

**Learn:**
* [[infrastructure-as-code|Infrastructure as code]]: the foundations.
* [[terraform-module-and-state-design|Terraform module and state design]]: how to structure it.
* [[iac-orchestration-and-layered-config|IaC orchestration and layered config]]: running it at scale.
* [[iac-testing-and-security|IaC testing and security]]: validating before it runs.

**Practice:** Provision a Cloud Storage bucket in Terraform with remote state in another
bucket, with locking. Change it, read the plan, apply. Then change it in the console and
watch `plan` report the drift.

**Self-check:** you can explain plan against apply, justify remote state, and detect and
reconcile drift.

> [!question]- Answer
> **Declarative.** You describe the desired end state and Terraform computes the path.
> The imperative alternative describes the steps, which means every run has to know what
> state it is starting from. The difference is why the same config works on an empty
> project and an existing one.
> **The three abstractions.** Providers talk to an API, resources are the things, modules
> package a set of resources with an interface.
> **Why state is the big decision.** State is Terraform's record of what it created and
> how that maps to your config. Local state means nobody else can run it, two runs can
> race, and losing the file orphans every resource. It also holds secrets in plain text,
> so it needs encryption and access control wherever it lives. Remote state with locking
> is the only production answer.
> **plan and apply.** `plan` diffs desired against recorded state against reality and
> prints the result, changing nothing. `apply` executes it. Reading the plan is not
> ceremony; it is the only point at which a destructive change is visible before it
> happens.
> **Drift.** Reality diverging from state, usually because someone changed something in
> the console. `plan` surfaces it. You either import the change, revert it, or adjust the
> config to match. The specialist skill is deciding which, and then removing whatever
> made the manual change necessary.

**Ask yourself:**
* If I lost the state file right now, what would I actually do?
* What in my infrastructure is still changed by hand, and why has that not been fixed?

## 5. Networking, IAM, and security

The parts that are hard to retrofit.

**Focus:** How do you design a VPC? How does GCP load balancing differ from what you know?
What does least privilege mean concretely in IAM?

**Learn:**
* [[cloud-networking|Cloud networking]]: VPC design, subnets, and connectivity.
* [[iam-and-workload-identity|IAM and workload identity]]: principals, roles, and federation.
* [[secrets-and-supply-chain-security|Secrets and supply chain security]]: credentials that are short-lived.

**Practice:** Build a VPC with a public and a private subnet, deny-by-default firewall
rules, and Cloud NAT for outbound traffic from the private subnet. Create a service
account with exactly the roles one workload needs and nothing more.

**Self-check:** you can design a VPC with sane firewalling, explain the GCP load balancer
tiers, and apply least privilege in IAM.

> [!question]- Answer
> **VPC design.** Subnets are regional in GCP, not zonal, which surprises people arriving
> from AWS. Start deny-by-default on firewall rules and open only what a workload needs.
> Target rules by service account rather than by tag where you can, because a tag is a
> label anyone can apply and a service account is an identity.
> **Load balancing.** GCP load balancers are global with a single anycast IP, which is
> conceptually different from regional load balancers elsewhere. The tiers run frontend
> IP, then URL map, then backend service, then instance group or network endpoint group.
> Knowing that chain is how you debug a 502 that is nobody's application error.
> **Private connectivity.** VPC Peering joins two VPCs. Cloud VPN and Interconnect reach
> on-premises. Private Service Connect exposes a service privately. Private Google Access
> lets private instances reach Google APIs without public IPs. They solve different
> problems and get confused for each other constantly.
> **Least privilege.** Avoid basic roles (Owner, Editor, Viewer) outside of a sandbox.
> Prefer predefined roles, and custom roles when those are still too broad. Grant at the
> narrowest resource that works, not at the project, and prefer workload identity
> federation over service account keys, because a key is a long-lived secret that will
> eventually end up somewhere it should not.

**Ask yourself:**
* Which of my service accounts could do the most damage if compromised?
* If traffic is not reaching a backend, which tier of the load balancer do I check first?

## 6. Containers and Kubernetes

Packaging and orchestration.

**Focus:** What is in a container image and why does layering matter? What are the
Kubernetes primitives and the loop that drives them?

**Learn:**
* [[docker-and-compose|Docker and Compose]]: images, layers, and local multi-service stacks.
* [[kubernetes-workload-basics|Kubernetes workload basics]]: the objects and how they relate.

**Practice:** Write a multi-stage Dockerfile producing a distroless image, push it to
Artifact Registry, and read the vulnerability scan. Then deploy it to GKE by hand-writing
a Deployment, a Service, and an Ingress, with resource requests and limits set.

**Self-check:** you can build a lean image, write the core Kubernetes objects by hand, and
explain the reconciliation loop.

> [!question]- Answer
> **Images and layers.** An image is a stack of read-only layers plus metadata. Each
> Dockerfile instruction adds a layer, and layers are cached and shared. Ordering
> instructions so the rarely-changing ones come first is the difference between a
> ten-second and a ten-minute rebuild.
> **Multi-stage and distroless.** The build stage carries the toolchain; the final stage
> copies only the artifact onto a minimal base. Distroless has no shell and no package
> manager, which removes most of what an attacker would use after a compromise and most
> of what a scanner would flag.
> **The primitives.** Pod is the scheduling unit. ReplicaSet maintains a count of them.
> Deployment manages ReplicaSets and gives you rollouts. Service gives a stable address.
> Ingress routes external HTTP. ConfigMap and Secret inject configuration. Namespace
> partitions. PersistentVolumeClaim asks for storage.
> **The reconciliation loop.** You declare desired state; controllers continuously compare
> it against actual state and act to close the gap. Kubernetes is not executing your
> commands, it is converging toward your description. Once that clicks, behaviour that
> looked arbitrary becomes predictable.
> **Requests and limits.** The most common cause of cluster instability is workloads with
> neither. Without requests the scheduler cannot place pods sensibly; without limits one
> workload starves its neighbours. Always set both.

**Ask yourself:**
* When a rollout stalls, which controller do I inspect and what am I looking for?
* Would my image still be useful to an attacker who got code execution in it?

## 7. Serverless and cloud-native patterns

The services where you stop managing capacity.

**Focus:** When is Cloud Run the right default? What does Pub/Sub guarantee, and what does
it not?

**Learn:**
* [Cloud Run documentation](https://cloud.google.com/run/docs): the service and its constraints.
* [Pub/Sub documentation](https://cloud.google.com/pubsub/docs): delivery semantics and subscription types.

**Practice:** Deploy the same container to Cloud Run that you ran on GKE. Add a Pub/Sub
topic with a push subscription to a second service, and make the consumer idempotent.
Prove it by delivering the same message twice.

**Self-check:** you can choose between Cloud Run and GKE with reasons, and design a
consumer that survives at-least-once delivery.

> [!question]- Answer
> **Cloud Run.** Runs a container as a service, scales to zero, bills per request. It is
> the correct first choice for HTTP services without unusual networking or sidecar needs.
> You reach for GKE when you need daemonsets, complex networking, operators, or
> fine-grained scheduling, which is less often than people assume.
> **Cloud Functions second generation.** Now built on Cloud Run underneath, so the
> distinction is mostly packaging and event wiring rather than runtime.
> **Cloud Run Jobs.** Batch and scheduled work without pretending it is a long-running
> service.
> **Pub/Sub guarantees.** At-least-once delivery, which means duplicates are normal rather
> than exceptional. Ordering is available per key, not globally, and turning it on costs
> you throughput. Anything consuming from Pub/Sub must be idempotent, and see
> [[concurrency-and-idempotent-writes|concurrency and idempotent writes]].
> **Eventarc and Scheduler.** Eventarc routes events from GCP services to Cloud Run or
> Functions consumers. Cloud Scheduler is managed cron. Together they cover most of what
> people otherwise build with a VM and a crontab.

**Ask yourself:**
* What would my consumer do if it received the same message three times?
* Am I on GKE because I need it, or because I started there?

## 8. Application modernization

Moving something that already exists.

**Focus:** What are the six migration strategies and how do you choose? What do Strangler
Fig and the anti-corruption layer actually buy you?

**Learn:**
* [[anti-corruption-layer|Anti-corruption layer]]: keeping legacy models out of new code.
* [[database-migrations|Database migrations]]: the hardest part of any modernization.
* [The Twelve-Factor App](https://12factor.net/): the canonical cloud-native principles.

**Practice:** Pick a real legacy application, yours or one you know well. Write a
one-page assessment choosing one of the six Rs, with the reasoning and the risks. Then
sketch how you would apply Strangler Fig to its first extracted capability.

**Self-check:** you can choose and defend a migration strategy, and explain Strangler Fig
and the anti-corruption layer in terms of what they protect against.

> [!question]- Answer
> **The six Rs.** Rehost is lift and shift, unchanged. Replatform is lift and reshape,
> changing the runtime but not the code. Refactor is rewriting for cloud-native. Rearchitect
> changes the structure. Rebuild starts over. Retire turns it off, and is the one people
> forget to consider.
> **Choosing.** The trade is cost of modernization against business value against
> strategic alignment against risk. The honest version is that most applications should be
> rehosted or retired, and the interesting minority justify anything more.
> **Strangler Fig.** Route traffic through a façade, then progressively replace pieces of
> the legacy system behind it. It works because it lets you ship value before the
> migration finishes, and because you can stop halfway without having wasted the effort.
> The big-bang rewrite has neither property.
> **Anti-corruption layer.** A translation boundary between the legacy model and your new
> one. Without it, legacy data shapes and quirks leak into the new code and the new system
> inherits the old system's design by accident.
> **Database modernization.** The genuinely hard part, because the data cannot be paused.
> Dual writes, change-data-capture synchronisation, schema versioning, and blue-green
> schema changes are the available tools, and each trades consistency against downtime
> differently.
> **Twelve-factor.** Worth actually knowing the twelve. Most cloud-native failures trace
> back to violating config-in-environment, stateless processes, or disposability.

**Ask yourself:**
* For the system I have in mind, what is the honest business case for touching it at all?
* Which legacy quirk would leak into a new service first?

## 9. Observability and delivery

Knowing what is happening and shipping changes safely.

**Focus:** What are the three pillars and the four golden signals? What is an error budget
for? What should page a human?

**Learn:**
* [[observability-with-opentelemetry|Observability with OpenTelemetry]]: vendor-neutral instrumentation.
* [[cicd-and-github-actions|CI/CD and GitHub Actions]]: the delivery pipeline.
* [[environments-and-promotion|Environments and promotion]]: moving one artifact through stages.
* [[release-automation|Release automation]] and [[gitops|GitOps]].

**Practice:** Instrument a service with OpenTelemetry so one request produces a trace
across two hops. Define an SLI and an SLO in Cloud Monitoring with an error budget. Then
write one alert and justify why it deserves to wake someone.

**Self-check:** you can instrument against the golden signals, define an SLO with an error
budget, and distinguish an alert from a ticket.

> [!question]- Answer
> **Three pillars.** Logs are discrete events. Metrics are aggregates over time. Traces
> follow one request across services. Metrics tell you something is wrong, traces tell you
> where, logs tell you what.
> **Four golden signals.** Latency, traffic, errors, saturation. Every service needs all
> four, and most services have only the first two.
> **OpenTelemetry.** Vendor-neutral instrumentation that works across providers. Worth
> betting on precisely because it means your instrumentation survives a backend change.
> **SLI, SLO, error budget.** The SLI is what you measure, the SLO is the target, and the
> error budget is the difference between the target and perfection. The budget is the
> useful part: it converts reliability from an argument into a number, and it gives you a
> principled answer to "can we ship this risky change" which is yes while budget remains.
> **Alerting discipline.** Alert on symptoms rather than causes, because causes are
> numerous and symptoms are what users feel. Page only on conditions that are both urgent
> and actionable. Everything else is a ticket, and treating it otherwise is how teams
> learn to ignore alerts.
> **Delivery.** Build the artifact once, test that artifact, promote the same bytes
> through environments. Rebuilding per environment means production runs something you
> never tested.

**Ask yourself:**
* When something breaks, what do I look at first, and is it actually instrumented?
* Which of my current alerts has never once led to an action?

## 10. Cost, reliability, and where this goes

Operating the thing over years.

**Focus:** What is FinOps as a practice? What does SRE actually prescribe? What is worth
certifying?

**Learn:**
* [[reliability-patterns|Reliability patterns]]: retries, timeouts, circuit breakers, bulkheads.
* [Google SRE Book](https://sre.google/books/): the canonical text, free online.
* [Google Cloud certifications](https://cloud.google.com/learn/certification): the formal path.

**Practice:** Put a budget and alert on your sandbox project. Find the three largest line
items and write down what you would change if the budget halved. Then pick one
certification and map its exam guide against this path to find your gaps.

**Self-check:** you can treat cost as an operational practice, apply reliability patterns
deliberately, and place your own gaps against a certification syllabus.

> [!question]- Answer
> **FinOps.** Cost as a continuous operational practice with visibility, accountability,
> and optimisation, rather than a quarterly cleanup. The core move is attributing spend to
> the team that causes it, because unattributed cost is nobody's problem.
> **The anti-pattern.** Designing for cost first. Design for fitness, then optimise the
> bill. Architectures chosen to be cheap tend to become expensive in engineering time,
> which is the more scarce resource.
> **Reliability patterns.** Timeouts on every call, retries with backoff and jitter,
> circuit breakers to stop hammering a failing dependency, and bulkheads to stop one
> failure consuming all capacity. Retries without backoff turn a blip into an outage.
> **SRE.** Error budgets, toil reduction, blameless postmortems, and the discipline that
> reliability beyond the SLO has a cost and is not automatically worth paying.
> **Certification.** Professional Cloud Architect is the broadest, then the specialist
> tracks in networking, security, and data. They are useful for the gap they reveal
> rather than the credential, so read the exam guide even if you never sit the exam.
> **After this.** Depth in one practice area, networking, security, data, or platform
> engineering, each of which is its own multi-year curriculum. And one real engagement
> led end to end and written up, which is worth more than any certificate.

**Ask yourself:**
* If my cloud bill doubled, could I say why within an hour?
* Which reliability pattern am I missing in the place it would matter most?

## Capstone

One sandbox project, built up across the path, containing a VPC with least-privilege IAM,
a containerised service deployed through a pipeline, infrastructure entirely in Terraform
with remote state, observability against the golden signals, an SLO with an error budget,
and a budget alert.

Then write the architecture decision record you would hand a colleague: what you chose,
what you rejected, and what you would do differently at ten times the scale.

## Self-assessment checklist

- [ ] I can define the service models and locate the shared responsibility line for each.
- [ ] I can name the primitive categories and the GCP service behind each.
- [ ] I can explain the resource hierarchy and work fluently in gcloud.
- [ ] I can run Terraform with remote state and reconcile drift.
- [ ] I can design a VPC with deny-by-default rules and least-privilege IAM.
- [ ] I can write the core Kubernetes objects by hand and explain reconciliation.
- [ ] I can choose between Cloud Run and GKE with reasons, and build an idempotent consumer.
- [ ] I can choose and defend a migration strategy for a real application.
- [ ] I can instrument against the golden signals and set an SLO with an error budget.
- [ ] I can explain FinOps and apply reliability patterns deliberately.
