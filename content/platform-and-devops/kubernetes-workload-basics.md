---
title: "Kubernetes Workload Basics"
tags: [platform, containers]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Kubernetes runs containers across a cluster of machines and keeps them running.
You describe the desired state (which container image, how many copies, how much
CPU and memory), and Kubernetes continuously works to make the actual state match.
The core building blocks are the Pod (the smallest deployable unit), the Deployment
(manages replicas and rolling updates), and the Service (stable network address and
load balancing). Getting the details right on resource requests and limits, health
probes, and security context is what separates a demo cluster from a production one.

## Why it exists

Once an application is packaged as a container image, someone still has to run it:
place it on a machine that has room, restart it when it crashes, run several copies
for capacity and redundancy, replace copies during a new release without downtime,
and give clients a stable address even though individual copies come and go.

Doing this by hand across many machines does not scale. Kubernetes is a container
orchestrator that automates it. You hand it a declarative description of what you
want, and a set of controllers reconcile reality toward that description. If a
machine dies, the affected copies are rescheduled elsewhere. If a copy crashes, it
is restarted. This continuous reconciliation is what people mean by self-healing:
the system is always driving actual state toward desired state rather than executing
a one-time script.

## How it works

### Pods

A Pod is the smallest unit Kubernetes schedules. It wraps one or more containers
that share a network namespace (same IP and port space) and can share storage
volumes. Most Pods hold a single application container, sometimes accompanied by a
helper (sidecar) container. Pods are intentionally disposable: they are created,
they die, and they are never resurrected in place. A new Pod with a new IP takes the
place of an old one. Because of this you almost never create bare Pods directly; you
let a higher-level controller manage them.

### Deployments

A Deployment provides declarative updates for Pods. You describe a desired state,
and the Deployment controller changes the actual state to the desired state at a
controlled rate. In practice you set `spec.replicas` to the number of identical Pod
copies you want, along with a Pod template (the container image, ports, and so on).

Under the hood a Deployment manages a ReplicaSet, and the ReplicaSet keeps the
requested number of Pods running. If a Pod disappears, the ReplicaSet creates a
replacement to restore the count. That is the self-healing behavior in concrete
terms.

When you change the Pod template (for example, a new image tag), the Deployment
performs a rolling update: it creates a new ReplicaSet and gradually scales it up
while scaling the old one down, replacing Pods at a controlled rate so the
application stays available throughout. If the new version is unhealthy you can roll
back to a previous revision.

A minimal Deployment looks like this:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: example-app
  template:
    metadata:
      labels:
        app: example-app
    spec:
      containers:
        - name: web
          image: registry.example.com/example-app:1.0.0
          ports:
            - containerPort: 8080
```

### Services

Pods come and go and each gets a new IP, so you cannot point clients at a Pod IP. A
Service gives a stable identity in front of a changing set of Pods, selected by
label. It provides both service discovery (a stable [[glossary#d|DNS]] name) and load balancing
across the healthy Pods behind it.

The default type is `ClusterIP`. It exposes the Service on a cluster-internal virtual
IP, reachable only from inside the cluster, and load-balances requests across the
matching Pods. This is how one service inside the cluster talks to another: it
resolves a name like `example-app.default.svc.cluster.local` and the traffic is
spread across the backing Pods.

External traffic needs a different entry point:

- `LoadBalancer` exposes the Service externally using a cloud provider's load
  balancer, which provisions an external IP address that forwards into the Service.
- `NodePort` opens a static port on every node, which is lower-level and less common
  for production [[glossary#h|HTTP]].
- An Ingress is not a Service type; it is a separate resource that acts as the
  cluster's HTTP entry point. It operates at the application layer (Layer 7) and lets
  you consolidate host- and path-based routing rules for several backend Services
  behind a single listener, typically fronted by one LoadBalancer. A common pattern
  is Ingress to route by hostname and path, forwarding to internal ClusterIP
  Services.

A rough picture: external client, then LoadBalancer or Ingress, then a ClusterIP
Service, then the Pods.

### Namespaces

A Namespace is a virtual partition inside a single cluster. It scopes resource names
(two namespaces can each have a Service named `example-app` without colliding) and
gives you a boundary to attach access control, resource quotas, and network policy.
Namespaces are how teams or environments share one cluster without stepping on each
other. They are an isolation and organization boundary, not a hard security sandbox
on their own.

### Resource requests and limits

Every container should declare how much CPU and memory it needs. There are two
numbers per resource:

- A request is the amount the scheduler reserves. The kube-scheduler uses requests
  to decide which node has room for the Pod; a Pod is only placed on a node that can
  satisfy the sum of its containers' requests. Requests are effectively the minimum
  guaranteed allocation.
- A limit is the ceiling the kubelet enforces at runtime; a container is not allowed
  to exceed it.

CPU and memory behave differently when a container pushes against its limit. CPU is
compressible: exceeding the CPU limit results in throttling, where the kernel
restricts how much CPU time the container gets, but the container keeps running.
Memory is not compressible: a container that exceeds its memory limit may be
terminated by the kernel with an out-of-memory (OOM) kill.

These numbers matter for two reasons. Scheduling: without requests the scheduler
cannot reason about capacity and can overpack a node. Stability: without limits a
single runaway container can starve its neighbors on the same node (the noisy
neighbor problem). Requests and limits also determine a Pod's Quality of Service
class, which influences which Pods get evicted first when a node is under pressure.

### Liveness and readiness probes

Kubernetes cannot tell whether your process is actually healthy just because it is
running, so you give it probes: small checks (an HTTP GET, a TCP connection, or a
command) it runs against each container.

- A liveness probe answers "is this container still working, or is it wedged?" If it
  fails, the kubelet kills the container and restarts it. Use this to recover from
  deadlocks or unrecoverable internal states that a restart would clear.
- A readiness probe answers "is this container ready to serve requests right now?" If
  it fails, the Pod is marked unready and removed from its Services' endpoints, so it
  stops receiving traffic, but it is not restarted. Use this for warm-up periods or
  temporary dependency outages where the Pod should be pulled from rotation without
  being killed.
- A startup probe protects slow-starting containers: while it is still succeeding,
  the liveness and readiness probes are held off, so a slow boot is not mistaken for
  a failure and restarted prematurely.

The distinction matters: a failing liveness probe restarts, a failing readiness
probe removes from load balancing. Confusing the two (for example, using a liveness
probe that fails during a transient dependency blip) causes restart loops.

### Hardened security context

By default a container can run with more privileges than it needs. A `securityContext`
tightens this, following least privilege. The common hardening settings:

- `runAsNonRoot: true` (with a non-zero `runAsUser`) forces the process to run as an
  ordinary user instead of root, so a container breakout does not immediately hand
  over root.
- `allowPrivilegeEscalation: false` sets the kernel's `no_new_privs` flag so a process
  cannot gain more privileges than its parent (for example, via setuid binaries).
- Drop Linux capabilities with `capabilities.drop: ["ALL"]`, then add back only the
  few a workload genuinely needs. Capabilities slice up root's powers, and most
  applications need none of them.
- `readOnlyRootFilesystem: true` mounts the container root filesystem read-only, so
  an attacker cannot modify binaries or drop files; anything that must be writable is
  mounted as an explicit volume.

A hardened baseline:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

These layer into defense in depth: each one alone helps, and together they shrink
the blast radius if a container is compromised.

## Trade-offs and when to use

Kubernetes buys you self-healing, rolling updates, horizontal scaling, service
discovery, and a uniform declarative model across many machines. The cost is
substantial operational complexity: a control plane to run or pay for, a large
surface area of concepts and YAML, networking and storage abstractions to learn, and
real effort to secure and upgrade.

That trade is worth it when you run many services, need to scale across multiple
machines, want zero-downtime deploys and automatic recovery, or already operate at a
scale where manual placement is painful. It is often overkill for a single small
service, a low-traffic internal tool, or an early prototype. Simpler runtimes such as
a single-host container engine with a lightweight orchestrator, a managed
container-as-a-service platform, or a serverless option deliver most of the value
with a fraction of the operational burden. Reach for Kubernetes when the scale and
reliability requirements actually justify its weight, not by default.

## Pitfalls and done-right checklist

Common mistakes:

- No resource requests or limits set. The scheduler cannot place Pods sensibly and
  one container can starve a whole node. Set both on every container.
- Running as root. The default is too permissive; a breakout inherits root. Apply a
  non-root, hardened security context.
- Missing or misused probes. No liveness probe means wedged Pods never recover; no
  readiness probe means traffic is sent to Pods that are not ready; a liveness probe
  that trips on transient issues causes restart loops. Define both, and use a startup
  probe for slow boots.
- Creating bare Pods instead of a Deployment, so nothing reschedules them when a node
  fails.
- Treating a Namespace as a security boundary without also adding network policy,
  [[glossary#r|RBAC]], and quotas.
- Using a single replica for anything that needs to survive a node failure or a
  rolling update.

Done-right checklist:

- Every container declares CPU and memory requests and limits.
- Every workload runs under a Deployment (or another controller), not as a bare Pod.
- Liveness and readiness probes are defined, with a startup probe where boot is slow.
- A hardened security context: non-root, no privilege escalation, all capabilities
  dropped, read-only root filesystem.
- At least two replicas for anything that must stay available.
- Internal traffic goes through a ClusterIP Service; external traffic enters through
  a deliberate LoadBalancer or Ingress.
- Workloads live in namespaces with appropriate access control and quotas.

## Mental model

Think of Kubernetes as a thermostat, not a switch. You do not tell it "start these
containers"; you tell it "the temperature should be 72," which here means "three
healthy copies of this image should be running, reachable at this address, within
these resource bounds." Controllers watch the gap between that desired state and
reality and keep nudging reality back toward it: crashed Pod restarted, dead node's
Pods rescheduled, new version rolled out one Pod at a time. Pods are cattle, not
pets, disposable and interchangeable, and the Service is the stable front door in
front of the herd. Requests, limits, probes, and security context are the guardrails
that keep this automated system safe and predictable rather than merely convenient.

## Cross-links

- [[docker-and-compose]]
- [[cloud-networking]]
- [[cloud-and-gcp]]

## Sources

- Kubernetes documentation, Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Kubernetes documentation, Pods: https://kubernetes.io/docs/concepts/workloads/pods/
- Kubernetes documentation, Service: https://kubernetes.io/docs/concepts/services-networking/service/
- Kubernetes documentation, Ingress: https://kubernetes.io/docs/concepts/services-networking/ingress/
- Kubernetes documentation, Namespaces: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
- Kubernetes documentation, Resource Management for Pods and Containers: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
- Kubernetes documentation, Configure Liveness, Readiness and Startup Probes: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Kubernetes documentation, Configure a Security Context for a Pod or Container: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
