---
title: "Cloud Fundamentals & GCP"
tags: [platform, cloud]
level: fundamentals
type: reference
reviewed: 2026-07-12
---


"The cloud" is not a mysterious place, it is someone else’s data center, rented on demand through an API instead of bought and racked yourself. A developer requests a server, a database, or a place to run a container, and it exists within seconds instead of after a purchase order and a trip to a hardware closet. Google Cloud Platform (GCP) is one of the three major providers of this rented infrastructure, alongside AWS and Azure. A junior developer is not expected to be a cloud architect, but should recognize the core services, know roughly what each one is for, and be able to follow a conversation about deploying an app.

## What the cloud is

At its simplest, cloud computing means renting computing resources, servers, storage, databases, networking, from a provider instead of owning physical hardware. Billing is usually pay-for-what-you-use, and capacity can scale up or down without buying anything new. Providers package this in a few standard layers:

* **IaaS (Infrastructure as a Service)**: raw virtual machines, storage, and networking. The provider manages the physical hardware; the developer manages the operating system and everything above it. Example: a Compute Engine virtual machine.
* **PaaS (Platform as a Service)**: the provider also manages the operating system, runtime, and scaling; the developer just supplies code. Example: Cloud Run or App Engine.
* **SaaS (Software as a Service)**: a complete, ready-to-use application accessed over the internet, with no infrastructure exposed at all. Example: Gmail or Google Docs.

**Serverless** is a related idea, most visible in PaaS: the developer writes a function or a container image and the platform handles provisioning, scaling (including down to zero when idle), and patching. "Serverless" does not mean there is no server, it means the developer never has to think about one.

## Core GCP services

These are the GCP services most likely to come up in a full-stack role, at an awareness level rather than deep operational expertise.

| Service | What it’s for |
| --- | --- |
| Cloud Run | Runs a containerized app or API without managing servers; scales automatically, including down to zero. |
| GKE (Google Kubernetes Engine) | Managed Kubernetes for orchestrating many containers together; more control and complexity than Cloud Run, mostly relevant at larger scale. |
| Cloud SQL | A managed relational database (Postgres or MySQL), Google handles backups, patching, and replication. |
| BigQuery | A managed data warehouse built for running fast analytical queries over very large datasets. |
| Pub/Sub | A messaging service for passing events between systems asynchronously, decoupling the sender from the receiver. |
| Vertex AI / Gemini | Google’s platform for building with and deploying machine learning and generative AI models. |

A simple deployment might put a containerized API on Cloud Run, store its data in Cloud SQL, and publish events to Pub/Sub for other services to react to:

![[gcp-topology.drawio.svg]]

> [!note]
> Naming to know: what used to be **Cloud Functions** is now **Cloud Run functions**, the
> serverless-functions capability now sits under the Cloud Run umbrella. The old name
> still appears widely, so recognize both.

## How GCP is organized

* **Projects**: the top-level container for resources, billing, and permissions. Nearly everything created in GCP (a database, a Cloud Run service, a bucket) belongs to exactly one project.
* **Regions and zones**: a region is a geographic area (for example `us-central1`); a zone is an isolated location within that region. Resources are placed in a region or zone to control latency and to spread risk, if one zone has an outage, others in the region should stay up.
* **IAM (Identity and Access Management)**: controls who (a person or a service) can do what, on which resource. A role bundles a set of permissions (for example "can deploy to Cloud Run" or "can read from this database") and is granted to a user, group, or service account.

> [!tip]
> When a task description mentions "least privilege," it is talking about IAM: granting only the specific permissions a person or service actually needs, not broad admin access by default.

## GCP vs AWS vs Azure

The job posting for this role lists GCP, AWS, and Azure as acceptable, the underlying concepts are shared across all three, and the exact provider matters less than understanding what each category of service does.

| Category | GCP | AWS | Azure |
| --- | --- | --- | --- |
| Serverless containers | Cloud Run | App Runner / Fargate | Container Apps |
| Container orchestration | GKE | EKS | AKS |
| Managed relational database | Cloud SQL | RDS | Azure SQL Database |
| Data warehouse | BigQuery | Redshift | Synapse Analytics |
| Messaging/eventing | Pub/Sub | SNS / SQS | Service Bus / Event Grid |

## How to talk about this in an interview

* It is fine to say a specific provider hasn’t been used hands-on: "I’ve mostly worked with GCP, but I understand AWS and Azure cover the same concepts: compute, managed databases, messaging, under different names, and I’d expect to pick up the specifics quickly."
* Be able to name the layer a service sits at (IaaS/PaaS/SaaS) and why that matters for a project: it shows the concept is understood, not just the product name.
* Avoid overclaiming operational depth with Kubernetes/GKE specifically: recognizing what it is for and when a team would reach for it over something simpler like Cloud Run is enough at this level.
* See [[communication|the communication note]] for the broader pattern of being honest about tooling gaps without undermining confidence.

## Key terms

| Term | Meaning |
| --- | --- |
| IaaS | Rented raw compute/storage/networking; you manage the OS and up. |
| PaaS | Provider manages OS and runtime; you supply code. |
| Serverless | Platform handles provisioning and scaling; no server management required. |
| Project | The top-level GCP container for resources, billing, and permissions. |
| Region / zone | Geographic area / isolated location within it, used to place resources. |
| IAM | System controlling who or what can access which resources. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Practice & self-check

**Practice**

* For a simple app (a containerized API with a database and some events), sketch a GCP deployment that names which service handles each part: Cloud Run, Cloud SQL, and Pub/Sub.
* For each service in that sketch, label the layer it sits at (IaaS, PaaS, or SaaS) and say why that layer fits.
* Take the same design and map each GCP service to its AWS and Azure equivalent using the comparison table in this note.

**Check yourself** (you should be able to answer these from this note):

* What is the difference between IaaS, PaaS, and SaaS, and where does "serverless" fit?
* What does a GCP project contain, and how do regions and zones differ?
* What is IAM for, and what does "least privilege" mean in that context?
* When would a team reach for GKE over Cloud Run?

## Official documentation

Authoritative, always-current references for the services above (verified against Google Cloud docs):

* Cloud Run: [cloud.google.com/run/docs](https://cloud.google.com/run/docs)
* GKE: [Kubernetes Engine overview](https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview)
* Cloud SQL: [cloud.google.com/sql/docs](https://cloud.google.com/sql/docs)
* BigQuery: [cloud.google.com/bigquery/docs](https://cloud.google.com/bigquery/docs)
* Pub/Sub: [cloud.google.com/pubsub/docs](https://cloud.google.com/pubsub/docs)
* Vertex AI: [cloud.google.com/vertex-ai/docs](https://cloud.google.com/vertex-ai/docs)

## Watch

![](https://www.youtube.com/watch?v=-r4efSMztyI)

## Related notes

* [[docker-and-compose|Docker and Compose]]: the containers that services like Cloud Run and GKE actually run.
* [[infrastructure-as-code|Infrastructure as Code]]: how cloud resources like these are defined and provisioned repeatably instead of clicked together by hand.
* [[databases|Databases]]: the general concepts behind managed offerings like Cloud SQL.
* [[ai-llms-and-mcps|AI, LLMs & MCPs]]: more detail on the kind of AI work Vertex AI / Gemini support.
* [[communication|Communication]]: how to talk honestly about tooling and experience gaps in an interview.
* [[glossary|Glossary]]: full term list referenced across all foundational notes.
