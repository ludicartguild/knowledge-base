---
title: "Cloud Networking Fundamentals"
tags: [platform, networking]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Cloud networking is how you carve out a private, software-defined slice of a
shared cloud, place workloads inside it, and control exactly what can talk to
what. The core building block is a virtual private cloud (a [[glossary#v|VPC]], called a
virtual network on some providers): a logically isolated address space you own.
Inside it you divide the space into subnets, mark some as public and some as
private, and use route tables to decide where traffic goes. Public subnets reach
the internet through an internet gateway; private subnets reach out (but are not
reachable inbound) through a NAT gateway. Load balancers spread inbound traffic
across instances and terminate [[glossary#t|TLS]]. [[glossary#d|DNS]] turns names into addresses. Firewall and
security-group rules act as allow-lists that permit only the flows you name.
Private connectivity keeps traffic between your services and managed services on
the provider backbone instead of the public internet. Done right, the network is
private by default and every open path is deliberate.

## Why it exists

In a public cloud you share physical infrastructure with countless other
tenants. Two problems follow. First, isolation: your workloads must not be
reachable by, or leak into, anyone else's, and different tiers of your own system
(a public web tier, a private data tier) must be separated from each other.
Second, controlled connectivity: those same workloads still need to reach the
internet, reach managed services, and be reached by legitimate clients, on
precisely the paths you intend and no others.

Cloud networking solves both by giving you a software-defined network you fully
own. Instead of racking physical routers, switches, and firewalls, you declare
address ranges, routing rules, and access policy as configuration. The provider
enforces that configuration in its virtualization layer. This is what lets you
build a network that is isolated from other tenants by default, segmented
internally, and open only where you explicitly say so.

## How it works

![[vpc-topology.drawio.svg]]

### VPC / virtual network

A VPC is a private, isolated network you define within a cloud region. You give
it a range of private IP addresses to work with (a CIDR block), and everything
you place inside draws addresses from that range. Nothing in one VPC can reach
another VPC by default; you have to connect them deliberately (peering, a transit
hub, or private links). Think of the VPC as the outer boundary that everything
else in this note lives inside.

### Subnets, public vs private

You slice the VPC address range into subnets, smaller ranges that usually map to
a placement zone. The public-versus-private distinction is not a checkbox on the
subnet itself; it is a consequence of routing. A subnet is public when its route
table sends internet-bound traffic to an internet gateway and its instances have
public addresses. A subnet is private when it has no such route, so its workloads
have no direct path to or from the internet. A common pattern puts internet-facing
load balancers in public subnets and application servers and databases in private
subnets.

### Route tables

A route table is the set of rules that decides, for a given destination address,
where a packet goes next. Each subnet is associated with one route table. Every
table has an implicit local route so anything inside the VPC can reach anything
else inside the VPC. Beyond that you add routes: send `0.0.0.0/0` (all IPv4
destinations, the default route) to an internet gateway to make a subnet public,
or to a NAT gateway to give a private subnet outbound-only access. Routing is the
lever that turns the same address space into public or private zones.

### Internet gateway vs NAT gateway for egress

An internet gateway is a two-way door. It lets resources with public addresses in
a public subnet both receive inbound connections from the internet and make
outbound ones. A NAT (network address translation) gateway is a one-way door for
egress: it lets instances in a private subnet initiate outbound connections to
the internet (to fetch updates or call an external [[glossary#a|API]]) while translating their
private addresses to a shared public one, so nothing on the internet can start a
connection back to them. The mental split is simple: internet gateway for
workloads that must be reachable, NAT gateway for workloads that must reach out
but stay hidden.

### Load balancers: L4 vs L7, and ingress

A load balancer accepts client traffic and distributes it across a pool of
healthy backends, which also gives you a stable front-end address while instances
come and go. They come in two flavors named for the OSI layer they operate at. A
Layer 4 load balancer routes on IP address and port only; it does not read the
payload, so it is fast and protocol-agnostic (major providers call this a network
load balancer). A Layer 7 load balancer understands the application protocol
(typically [[glossary#h|HTTP]]), so it can route on hostname, URL path, headers, or cookies, and
can do things like path-based routing and request rewriting (providers call this
an application load balancer). Ingress is the general term for how outside
traffic enters your network to reach a service; in container platforms an
ingress controller is usually a managed Layer 7 load balancer configured from
declarative rules.

### DNS resolution

DNS (the Domain Name System) maps human-readable names to IP addresses. When a
client resolves a name, a recursive resolver walks the hierarchy (root, top-level
domain, then the authoritative server for the zone) and returns address records.
In cloud networks DNS does double duty: it gives your services stable names
instead of brittle addresses, and it is the hinge for private connectivity.
Private DNS zones let the same public service name resolve to a private,
in-VPC address, so applications keep calling the familiar endpoint while traffic
quietly stays internal.

### TLS termination

TLS (Transport Layer Security, the protocol behind [[glossary#h|HTTPS]]) encrypts traffic in
transit and authenticates the server via a certificate. Terminating TLS means
decrypting the connection at a chosen point, commonly a Layer 7 load balancer, so
it can read the request and route intelligently. Terminating at the load balancer
centralizes certificate management (one place to install and rotate certificates)
and offloads the cost of the cryptographic handshake from backend instances. You
can then re-encrypt to the backend for defense in depth, or pass through
encrypted traffic to terminate on the backends themselves when policy or
per-tenant certificates require it.

### Firewall / security-group rules as allow-lists

Security groups and network firewall rules define which traffic is permitted, by
protocol, port, and source or destination. The important property is that they are
allow-lists: nothing is permitted unless a rule explicitly allows it, and there is
no way to write a rule that "denies" past an allow in a security group (they only
grant). Security groups typically attach to an instance or interface and are
stateful, meaning return traffic for an allowed connection is automatically
permitted. Network-level access-control lists sit at the subnet boundary, are
stateless, and evaluate rules in order. Together they let you say, precisely,
that only the load balancer may reach the app tier and only the app tier may
reach the database.

### Private connectivity / service endpoints

By default, calling a managed cloud service (object storage, a database service,
a message queue) resolves to a public endpoint and traffic leaves your network.
Private connectivity avoids that. A service endpoint (or private link) provisions
a private, in-VPC address for the managed service so requests travel over the
provider's internal backbone and never touch the public internet. This removes
the need for an internet gateway or NAT for those calls, shrinks the attack
surface, and is often required for data-residency or compliance reasons. Paired
with private DNS, the application code does not change; only the network path
does.

### Static egress IP when an upstream allow-lists you

Sometimes an external party will only accept connections from a known, fixed
source address (they allow-list you). Because instances are ephemeral and NAT can
use pooled addresses, you cannot rely on an instance's own address staying
constant. The fix is to route outbound traffic through a NAT gateway (or
equivalent) that owns a reserved, static public IP, so every request you make to
the upstream appears to come from that one stable address. You then give that
address to the upstream to add to their allow-list.

## Trade-offs & when to use

- Public subnet vs private subnet: public buys direct reachability at the cost of
  exposure. Default to private, and place only the components that genuinely must
  face the internet (typically just the load balancer) in public subnets.
- NAT gateway vs no egress: a NAT gateway enables outbound access but adds cost
  and a bandwidth chokepoint. If a private workload only needs to reach managed
  cloud services, a private service endpoint is cheaper and more secure than
  routing through NAT to the public internet.
- L4 vs L7 load balancer: choose L7 when you need HTTP-aware routing, centralized
  TLS, or host and path rules. Choose L4 for raw throughput, non-HTTP protocols,
  very low latency, or when TLS must terminate on the backends.
- TLS at the edge vs end to end: terminating at the load balancer simplifies
  certificate management and offloads CPU; re-encrypting or passing through costs
  more but keeps traffic encrypted all the way to the backend, which some
  compliance regimes demand.
- Security-group granularity: tighter rules are safer but more numerous to manage.
  Reference groups by identity (allow "from the app-tier group") rather than by
  raw address range so the policy survives instances being replaced.

## Pitfalls / done-right checklist

- Do not leave workloads public by default. Start everything in private subnets
  and expose only what must be exposed, through a load balancer.
- Avoid over-permissive security groups. Opening a wide port range, or allowing
  ingress from every address, is the most common serious misconfiguration. Allow
  the narrowest protocol, port, and source that works.
- Never expose data stores or admin ports to the internet. Databases, caches, and
  management interfaces belong in private subnets reachable only from the app
  tier.
- Reference sources by security group or service identity, not by hardcoded
  address ranges, so rules keep meaning as instances churn.
- Prefer private service endpoints over routing internal traffic through the
  public internet; it is both safer and often cheaper than NAT egress.
- Reserve a static egress address up front if any upstream will need to
  allow-list you; retrofitting it after addresses are already in use is painful.
- Automate certificate rotation on whatever terminates TLS; an expired
  certificate is a self-inflicted outage.
- Do not open broad VPC peering or overly wide routes for convenience. Connect
  networks deliberately and minimally.
- Turn on flow logs and review them; you cannot reason about what your allow-lists
  actually permit without seeing the traffic.

## Mental model

Picture a private office building you lease inside a large shared complex (the
VPC inside the cloud region). The building has floors (subnets). Some floors have
a street entrance (public subnets with an internet gateway); most do not (private
subnets). A one-way service exit lets staff on the private floors step out to run
errands but lets no stranger follow them back in (the NAT gateway). A staffed
reception desk out front greets every visitor, checks them, and directs them to
the right office, sometimes unwrapping sealed mail so it can read the address
(the Layer 7 load balancer terminating TLS). A building directory translates a
person's name to their office number (DNS). Every interior door has a badge
reader that opens only for the specific badges on its list, and everything not on
the list stays shut (security groups as allow-lists). And there is a private
internal corridor to the shared amenities so you never have to step outside onto
the public street to use them (private service endpoints). The whole design
starts locked and you open exactly the doors you mean to.

## Cross-links

- [[cloud-and-gcp]]
- [[secrets-and-supply-chain-security]]
- [[web-session-and-token-handling]]

## Sources

- [[glossary#a|AWS]], "Enable internet access for a VPC using an internet gateway":
  https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html
- AWS, "NAT gateways" (Amazon VPC User Guide):
  https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html
- AWS, "Configure route tables" (Amazon VPC User Guide):
  https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html
- AWS, "Example: VPC with servers in private subnets and NAT":
  https://docs.aws.amazon.com/vpc/latest/userguide/vpc-example-private-subnets-nat.html
- AWS, "AWS PrivateLink concepts":
  https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html
- Google Cloud, "VPC network overview":
  https://cloud.google.com/vpc/docs/vpc
- Google Cloud, "Cloud Load Balancing overview":
  https://cloud.google.com/load-balancing/docs/load-balancing-overview
- Microsoft Azure, "What is Azure Virtual Network?":
  https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview
- MDN Web Docs, "Transport Layer Security (TLS)":
  https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security
- MDN Web Docs, "What is a domain name?" (DNS overview):
  https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_domain_name
- RFC 1918, "Address Allocation for Private Internets":
  https://datatracker.ietf.org/doc/html/rfc1918
- RFC 8446, "The Transport Layer Security (TLS) Protocol Version 1.3":
  https://datatracker.ietf.org/doc/html/rfc8446
