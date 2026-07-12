---
title: "Keeping Infrastructure DRY: Orchestration & Layered Config"
tags: [platform, devops]
level: deep
type: concept
reviewed: 2026-07-12
---

## TL;DR

As an infrastructure codebase grows to cover many environments and accounts, plain
Terraform forces you to copy the same backend blocks, provider blocks, and module
calls into every directory. Orchestration tooling (Terragrunt is the best-known
example, and it works with both Terraform and OpenTofu) removes that repetition two
ways: it **generates** the boilerplate Terraform cannot express with variables
(backend and provider config), and it lets you compose small config files into a
**layered hierarchy** (root to environment to group to instance) where each layer
overrides the one above it. The result is a single library of reusable modules plus
a tree of thin, per-instance config files, instead of hundreds of near-identical
`.tf` files kept in sync by hand.

## Why it exists

Terraform's own configuration language has two structural gaps that bite at scale:

- **The `backend` block does not accept expressions, variables, or functions.** You
  cannot compute the state key or bucket name from where the module lives. In a
  raw setup this means each root module hard-codes its own backend block, and those
  blocks are copy-pasted and edited by hand. Miss one edit and two modules quietly
  share a state file.
- **Provider configuration is similarly static and repetitive.** Every root module
  that talks to the same cloud account repeats the same provider block, region,
  assumed role, and default tags.

Layer on top of that the reality of operating **many near-identical stacks**: the
same set of modules deployed to dev, staging, and prod, times several regions or
accounts, times several teams. With plain Terraform, "add a new environment" means
copying a directory tree and find-replacing values. That is the classic source of
**configuration drift**: the environments start identical and slowly diverge because
a change made in one place is forgotten in the others. Orchestration tooling exists
to make the shared parts genuinely shared (defined once) and the per-instance parts
small and explicit.

## How it works

### Generated backend and provider blocks

Because Terraform's `backend` block cannot use variables, the orchestrator
**generates** the file that contains it. You declare the backend once in a root
config; before each run the tool writes a `backend.tf` (and typically a
`provider.tf`) into the working directory, then invokes Terraform or OpenTofu
normally. The generated file can embed computed values that the native block could
not. Terragrunt exposes this as either a `generate` block (write an arbitrary file)
or a higher-level `remote_state` block that both configures the backend and, if
asked, bootstraps the underlying storage (for example creating the state bucket and
lock table on first use) so there is no manual click-ops step.

### DRY remote-state config with per-instance state keys

The backend is defined in exactly one place, but each instance still needs its **own
state file** so that applying one stack never touches another's resources. The trick
is to derive the state key from the instance's position in the tree. Terragrunt does
this with a function that returns the path of the current unit relative to the
included root config, and feeds that path into the key. So a `networking` instance
lands at `networking/terraform.tfstate` and a `database` instance at
`database/terraform.tfstate`, automatically, from one shared rule. No hard-coded keys,
no collisions, and adding an instance needs no backend edits at all.

### The layered config hierarchy and precedence merging

This is the heart of the pattern. Instead of one big config per stack, you keep a
**hierarchy of small config files** and let each deployment inherit and refine them:

- a **root** layer with organization-wide defaults (backend, provider, common tags),
- an **environment** layer (dev vs prod: account IDs, sizing, feature flags),
- an optional **group / component** layer (shared settings for a family of related
  stacks),
- an **instance** (leaf) layer that says only what makes this one deployment unique.

An instance pulls the layers above it in via include-style references, and values
merge with **increasing precedence toward the leaf**: the closer a layer is to the
specific instance, the more it wins. Root sets a default, environment can override it,
and the instance has the final say. Common inputs are written once at the level where
they are common; only genuine differences appear at the leaves. Adding an environment
becomes "create one thin file that overrides the handful of things that differ,"
not "clone a directory."

![[iac-layered-config.drawio.svg]]

### Deep vs shallow merge (the caveat that bites)

How layers combine is not one behavior, and getting it wrong causes silent surprises.
Terragrunt's default when a child includes a parent is a **shallow merge**: scalars
in the child replace the parent, and crucially **lists and maps are replaced
wholesale, not combined**. If a parent sets a map of tags and the child sets its own
tags map, the child's map replaces the parent's entirely rather than adding to it.

A **deep merge** strategy changes that: lists are concatenated, maps are merged
recursively key-by-key (child wins on overlapping keys), and nested blocks with
matching labels combine instead of replacing. Deep merge is usually what people
*expect* layered config to do, but it is opt-in, and some blocks deliberately do not
deep-merge at all (for example generation and remote-state blocks, and `locals`).
The practical rule: **decide per attribute whether you want override or accumulation**,
and choose the merge strategy accordingly rather than assuming.

### Modules library vs live config

The pattern separates two kinds of code that get conflated in naive setups:

- A **module library**: reusable, versioned, parameterized building blocks (a [[glossary#v|VPC]]
  module, a database module) that contain no environment-specific values. These are
  referenced by version so a change rolls out deliberately, not implicitly.
- A **live config tree**: the layered hierarchy above, which contains no resource
  definitions of its own. Each leaf just points at a module version and supplies that
  instance's inputs.

Often the live tree is a single monorepo so the whole estate is visible and diffable
in one place, while modules live in their own versioned repositories. The live tree
is where "what is actually deployed" lives; the module library is "how we build
things." Keeping them separate is what makes both DRY: one module definition serves
many instances, and one config layer serves many leaves.

## Trade-offs & when to use

**What you gain:** one definition per shared concern, per-instance state isolation for
free, trivial addition of new environments and instances, and a config tree that is
diffable and reviewable as a whole.

**What you pay:** a layer of tooling and indirection on top of Terraform. Someone
reading a leaf config has to understand the include and merge rules to know the
*effective* configuration, because what runs is assembled from several files plus
generated ones. Debugging means reasoning about precedence and merge strategy, not
just reading a single `.tf`. There is also a dependency on the orchestrator itself
and its version.

**When it is overkill:** a single environment, or two or three that rarely change, do
not justify the indirection. Plain Terraform with modules and workspaces (or just a
couple of hand-maintained root modules) is easier to read and onboard onto. Reach for
orchestration when the *number of near-identical instances* is what is hurting you,
i.e. when the copy-paste-and-drift problem is real and growing, not before.

## Pitfalls / done-right checklist

- **Do not assume merges combine.** Confirm whether each layered attribute is
  shallow-replaced or deep-merged; test with a real dump of the effective config.
- **Derive state keys, never hard-code them.** Compute the key from the instance's
  path so new instances cannot collide with existing state.
- **Keep resources out of the live config tree.** Leaves should carry inputs and a
  module reference only; resource definitions belong in versioned modules.
- **Pin module versions.** Reference modules by version tag so upgrades are explicit
  and reviewable, not accidental.
- **Put each value at the lowest layer where it is still shared.** A value common to
  all of prod goes in the prod layer, not repeated in every prod leaf.
- **Beware blocks that never deep-merge** (generation, remote-state, locals). Do not
  design a hierarchy that relies on merging them.
- **Make the effective config inspectable.** Have a routine way to render what a leaf
  actually resolves to, so reviewers are not tracing includes by hand.
- **Version the orchestrator itself** and treat its upgrades like any other dependency.

## Mental model

Think of it as **cascading style sheets for infrastructure**. A leaf stack does not
restate everything it needs; it inherits a cascade of rules from broad to specific,
and the most specific rule wins. Two things get generated for it because the native
language cannot express them (the backend and provider blocks), and its identity in
the tree determines where its state lives. The module library is the set of components;
the layered live tree is the stylesheet that says how to render each page. You edit
one rule in one place and every page that inherits it updates, while any page can
still override just the one property it needs.

## Cross-links

- [[infrastructure-as-code]]
- [[terraform-module-and-state-design]]
- [[environments-and-promotion]]

## Sources

- Terragrunt docs, Units: <https://docs.terragrunt.com/features/units/>
- Terragrunt docs, State Backend (DRY backend, `remote_state`, `path_relative_to_include`, per-unit state keys): <https://docs.terragrunt.com/features/units/state-backend/>
- Terragrunt docs, Includes (layered includes, `expose`, static merge at parse time): <https://docs.terragrunt.com/features/includes/>
- Terragrunt docs, HCL blocks reference (`merge_strategy`: `no_merge` / `shallow` default / `deep`, list and map behavior, blocks excluded from deep merge): <https://docs.terragrunt.com/reference/hcl/blocks/>
- Terraform docs, Backend configuration (backend block cannot use variables or expressions): <https://developer.hashicorp.com/terraform/language/backend>
- OpenTofu docs, State and backends (equivalent backend/state model): <https://opentofu.org/docs/language/settings/backends/configuration/>
