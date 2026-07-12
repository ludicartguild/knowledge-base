---
title: "Terraform Module & State Design"
tags: [platform, devops]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

Terraform (and its fork OpenTofu) describes infrastructure as declarative configuration and reconciles it against real resources. Two design decisions dominate every serious Terraform codebase: how you factor configuration into **modules** (reusable units with typed inputs and outputs), and how you manage **state** (the file that records which real objects belong to which configuration). Get modules right and you compose infrastructure from small, versioned, testable building blocks. Get state right and multiple people can safely operate the same infrastructure without corrupting it, thanks to remote backends and state locking. This note covers root vs child modules, composition, remote backends, locking, why state exists, workspaces vs directory-per-environment, provider and version pinning, `for_each` vs `count`, and the plan/apply workflow.

## Why it exists

A single Terraform file that provisions everything for everything does not scale. It becomes impossible to review, impossible to reuse, and dangerous to change, because one careless edit touches unrelated resources. Modules exist so that a proven pattern (a network, a database, a service deployment) can be **codified once and instantiated many times** with different inputs, rather than copy-pasted.

State exists for a more fundamental reason. Terraform configuration says what you *want*; the cloud provider holds what actually *exists*. Terraform needs a durable record that maps one to the other, because most real APIs cannot reliably answer "which of these objects did this specific configuration create?" from the config alone. Terraform's official documentation states that "the primary purpose of Terraform state is to store bindings between objects in a remote system and resource instances declared in your configuration." Without state, Terraform could not tell the difference between "create a new resource" and "update the one I already made."

## How it works

### Modules as reusable units

A module is, in Terraform's words, "a collection of resources that Terraform manages together." Any directory containing `.tf` files is a module. Modules let teams standardize by codifying frequently provisioned patterns instead of hand-writing them each time.

### Root vs child modules

Every Terraform run has exactly one **root module**: the directory Terraform is invoked in. The documentation calls this "the root module." Modules invoked from it via `module` blocks are **child modules**: "Modules you configure using `module` blocks are called child modules. When you apply a configuration, the root module calls the child module." Child modules can themselves call further nested child modules, giving you a composition tree.

A minimal call looks like this:

```hcl
module "network" {
  source = "./modules/network"

  cidr_block   = "10.0.0.0/16"
  subnet_count = 3
}
```

### Inputs and outputs

Modules communicate through a typed interface, which is what makes them reusable rather than just folders of code.

- **Input variables** (`variable` blocks) are the module's parameters. Callers set them in the `module` block. Give them types and, where sensible, defaults and validation.
- **Output values** (`output` blocks) are the module's return values. A parent reads a child's output as `module.<name>.<output>`, and a root module can re-expose outputs to the outside.

```hcl
# inside the child module
variable "subnet_count" {
  type    = number
  default = 2
}

output "subnet_ids" {
  value = [for s in local.subnets : s.id]
}
```

```hcl
# in the caller
resource "example_service" "app" {
  subnet_ids = module.network.subnet_ids
}
```

Treat the input/output surface as a public contract. Keep it small and stable, and hide internal implementation details behind it.

### Composition

Prefer many small, single-purpose modules wired together over one large module with dozens of toggles. Composition means a root module orchestrates several child modules, passing one module's outputs into another's inputs. This keeps each unit independently understandable, testable, and versionable. Publish shared modules with a version constraint (from a registry or a pinned Git ref) so consumers upgrade deliberately.

### Why state exists (recap of the mechanics)

Terraform's documentation lists three purposes for state: mapping configuration to real infrastructure, tracking metadata (such as resource dependencies), and improving performance for large configurations by caching attribute values. State is the source of truth Terraform diffs your configuration against on every run.

### Remote state backends

A **backend** "defines where Terraform stores its state data files." The default is the `local` backend, a file on disk, which does not support team collaboration. A **remote backend** stores state in shared storage (object storage buckets, a managed Terraform service, and similar) so that multiple people work against one authoritative state.

Key constraints and facts from the docs:

- A configuration "can only provide one backend block." You cannot mix backends in one configuration.
- Backend settings cannot reference variables, locals, or data sources; they take static values or values supplied at `init` time.
- The official guidance warns you to "avoid storing your state in a version control system or other storage solution that does not support Terraform state locking and secure access control," because state can contain sensitive values and because concurrent writes can corrupt it.

```hcl
terraform {
  backend "example_remote" {
    bucket = "my-tf-state"
    key    = "app/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### State locking

When two people (or two CI jobs) run Terraform against the same state at once, they can corrupt it. **State locking** prevents that. Per the docs, "Terraform will lock your state for all operations that could write state," and this "happens automatically on all operations that could write state. You do not see any message that it happens."

Important caveats:

- "Not all backends support locking." Check the specific backend's capabilities before relying on it.
- A `terraform force-unlock` command exists for stuck locks, but the docs warn to "be very careful with this command," because unlocking while someone else holds the lock can produce multiple concurrent writers.
- A `-lock=false` flag exists but is discouraged.

### Workspaces vs directory-per-environment

Terraform **workspaces** let a single configuration and backend hold "multiple states." They are handy for short-lived parallel copies of the same infrastructure.

They are, however, the wrong tool for separating production from staging. The documentation is explicit: workspaces "are not appropriate for system decomposition or deployments requiring separate credentials and access controls." The failure mode is that all workspaces share one backend, one set of credentials, and one blast radius, so an operator error in the wrong workspace can hit production.

The widely used alternative is **directory-per-environment**: a separate root module directory (and separate state, often separate backend keys and credentials) for each environment such as dev, staging, and prod. Shared logic lives in child modules that each environment's root module calls with environment-specific inputs. This gives genuine isolation of state, permissions, and blast radius, at the cost of some duplicated root-level wiring.

### Provider and version pinning

Reproducibility depends on pinning two things: providers and Terraform itself.

- Declare providers in a `required_providers` block. The docs state "each Terraform root module should declare which providers it requires, so that Terraform can install and use them." Each entry has a `source` (a global address like `namespace/type`) and a `version` constraint.
- Recommended constraint style: reusable modules should declare a **minimum** version with `>=` and avoid strict upper bounds (a strict maximum "forces users of the module to update many modules simultaneously"). Root modules can pin more tightly with the pessimistic `~>` operator to allow patch updates while blocking risky major jumps.
- The **dependency lock file** `.terraform.lock.hcl` records the exact provider versions selected by `terraform init`, so every machine and CI run resolves the same versions. Commit it to version control.

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    example = {
      source  = "example-namespace/example"
      version = "~> 5.0"
    }
  }
}
```

### for_each vs count

Both meta-arguments create multiple instances of a resource or module, but they differ in how instances are identified, and that difference matters for stability.

- `count` creates instances indexed by integer (`[0]`, `[1]`, ...). The docs advise using `count` "when you want to create nearly identical instances."
- `for_each` creates instances keyed by the keys of a map or set of strings. Use `for_each` "when some instance arguments must have distinct values that can't be directly derived from an integer."

The practical reason to prefer `for_each` for collections that can change: with `count` over a list, removing an item in the middle shifts every later index, so Terraform sees those instances as changed and may destroy and recreate them. With `for_each`, each instance is tied to a stable key, so removing one element leaves the others untouched. Note that `for_each` values must be known at plan time (you cannot key on values a provider assigns during apply), and you cannot use `count` and `for_each` on the same block.

```hcl
resource "example_bucket" "data" {
  for_each = toset(["logs", "assets", "backups"])
  name     = each.key
}
```

### Plan vs apply

Terraform separates deciding from doing.

- `terraform plan` "creates an execution plan, which lets you preview the changes that Terraform plans to make to your infrastructure." It is a dry run: "the plan command alone does not actually carry out the proposed changes." It refreshes state against real objects, compares configuration to prior state, and proposes the actions needed.
- `terraform apply` executes changes. Run interactively, it shows a plan and asks for confirmation.

For automation and review, you can save a plan with `terraform plan -out=FILE` and later feed that exact file to `terraform apply`, guaranteeing that what was reviewed is what gets applied. This two-step workflow is the backbone of Terraform in CI pipelines: propose on a change request, apply after approval.

## Trade-offs & when to use

- **Small composed modules vs one big module.** Many small modules maximize reuse and testability but add wiring and indirection. One large module is simpler to read at first but calcifies into an unmaintainable monolith. Favor composition once a pattern is used more than once.
- **Workspaces vs directory-per-environment.** Workspaces are low-ceremony but share credentials and blast radius, so they suit ephemeral or per-developer copies, not prod/staging separation. Directory-per-environment costs duplication but buys real isolation; it is the safer default for environments that differ in risk.
- **Tight vs loose version constraints.** Tight pins (and a committed lock file) maximize reproducibility; loose ranges ease upgrades. Pin tightly in root modules, constrain loosely (minimum only) in shared modules.
- **Remote state everywhere vs simplicity.** Remote backends with locking are essential for any shared or production infrastructure. Local state is acceptable only for throwaway experiments by a single person.
- **`for_each` vs `count`.** `for_each` is the safer default for anything that grows or shrinks; `count` is fine for a fixed number of truly identical instances or for a simple on/off (`count = var.enabled ? 1 : 0`).

## Pitfalls / done-right checklist

- [ ] State lives in a **remote backend that supports locking and access control**, never in version control or on a single laptop.
- [ ] **Never hand-edit the state file.** Use `terraform state` subcommands (`mv`, `rm`, `import`) for surgery.
- [ ] Providers are declared in `required_providers` with sensible version constraints, and **`.terraform.lock.hcl` is committed**.
- [ ] Production and staging are **separated by directory/state/credentials**, not by workspace.
- [ ] Module input/output surfaces are small and stable; internals are not leaked as outputs.
- [ ] Collections use **`for_each` with stable keys**, not `count` over mutable lists, to avoid accidental destroy/recreate.
- [ ] CI runs `plan` for review and `apply` from a **saved plan file**, so reviewed changes equal applied changes.
- [ ] Secrets are not assumed safe just because they are in state; state is treated as sensitive and access is restricted.
- [ ] `force-unlock` and `-lock=false` are treated as emergency tools, used only when you know no one else is running.
- [ ] Static analysis (for example TFLint) and formatting (`terraform fmt`) run in CI to catch issues before apply.

## Mental model

Think of Terraform as a **reconciliation loop with a ledger**. The configuration is the intent ("this is what should exist"). State is the ledger ("this is what I made, and which real object each entry points to"). Every `plan` is the loop reading the ledger, looking at reality, and computing the diff between intent and actual; every `apply` is the loop closing that diff and updating the ledger. Modules are the **functions** of this system: typed inputs, typed outputs, reusable, composable, with internals hidden. Backends and locking are what let many hands share one ledger without tearing it. Once you see modules as functions and state as a carefully guarded shared ledger, most Terraform design decisions follow directly.

## Cross-links

- [[infrastructure-as-code]]
- [[environments-and-promotion]]
- [[cicd-and-github-actions]]

## Sources

- Terraform docs, Modules overview: https://developer.hashicorp.com/terraform/language/modules
- Terraform docs, State (purpose and mapping): https://developer.hashicorp.com/terraform/language/state
- Terraform docs, Remote state: https://developer.hashicorp.com/terraform/language/state/remote
- Terraform docs, Backends: https://developer.hashicorp.com/terraform/language/backend
- Terraform docs, State locking: https://developer.hashicorp.com/terraform/language/state/locking
- Terraform docs, Workspaces: https://developer.hashicorp.com/terraform/language/state/workspaces
- Terraform docs, Provider requirements and version constraints: https://developer.hashicorp.com/terraform/language/providers/requirements
- Terraform docs, `for_each` meta-argument: https://developer.hashicorp.com/terraform/language/meta-arguments/for_each
- Terraform docs, `terraform plan` command: https://developer.hashicorp.com/terraform/cli/commands/plan
