---
title: "Git & GitHub"
tags: [git, tooling]
level: fundamentals
type: how-to
---


Git is a **version control system**: a tool that tracks changes to files over time so a team can work on the same codebase without overwriting each other’s work. GitHub is a **hosting service** built around Git, it stores repositories in the cloud and adds collaboration features like Pull Requests, code review, and Issues. Git is the tool; GitHub is where teams use it together.

Without version control, "collaboration" usually means emailing zip files or working in one shared folder and hoping nobody overwrites anyone else’s changes. Git solves this by letting every change be tracked, attributed, and reversed if needed.

## Core concepts

* **Repository (repo)**: a project folder tracked by Git. It contains the full history of every change ever committed.
* **Commit**: a saved snapshot of changes, with a message describing what changed and why. Commits form the project’s history.
* **Branch**: an independent line of development. Branching lets someone work on a new feature or fix without touching the stable code on the main branch.
* **Merge**: combining the changes from one branch into another, usually bringing finished work from a feature branch back into the main branch.

A useful mental model is three "zones" a change passes through:

* **Working directory**: the files on disk, as currently edited. Uncommitted and untracked.
* **Staging area (the index)**: changes marked with `git add`, queued up to be included in the next commit.
* **Repository (committed history)**: changes saved with `git commit`, now part of the permanent history.

A change moves left to right: edit in the working directory -> stage it -> commit it.

## Everyday commands

```sh
git clone <url>          # copy a remote repo to the local machine
git status                # see what's changed, staged, or untracked
git add <file>            # stage changes for the next commit
git commit -m "message"   # save staged changes as a commit
git push                  # upload local commits to the remote (e.g. GitHub)
git pull                  # download and merge remote changes into the local branch
git branch                # list branches
git switch <branch>       # move to a different branch (or: git checkout <branch>)
git switch -c <branch>    # create a new branch and move to it
```

> [!tip]
> Commit often, and write commit messages that explain **why** a change was made, not just what changed, the diff already shows the "what."

## The GitHub workflow (branch -> PR -> merge)

Most teams follow some version of this flow for every change:

1. **Branch**, create a new branch off the main branch so the change is isolated: `git switch -c feature/add-login-form`.
2. **Commit**, make changes and commit them in small, logical steps.
3. **Push**, push the branch to GitHub with `git push`.
4. **Open a Pull Request (PR)**, propose merging the branch into main. A PR shows the full diff and gives teammates a place to leave comments.
5. **Review**, teammates read the code, ask questions, request changes, or approve it. This is where most feedback and learning happens.
6. **Merge**, once approved (and once any automated checks pass, see [[cicd-and-github-actions|CI/CD and GitHub Actions]]), the PR is merged into main and the feature becomes part of the shared codebase.

**Issues** are a separate but related feature: a tracked to-do item, bug report, or feature request. Issues describe **what** needs to happen; PRs are **how** it gets done. A PR often references and closes an Issue when merged.

## Merge conflicts

A merge conflict happens when Git can’t automatically combine two changes, usually because two branches edited the same lines of the same file in different ways. Git pauses the merge and marks the conflicting sections in the file for a person to resolve by hand, choosing which change to keep (or combining both).

Conflicts are a normal, expected part of collaborative development, not a sign that something went wrong. They come up more often on long-lived branches or when many people touch the same files, and resolving them is a routine skill, not an emergency.

## How to talk about this in an interview

Junior candidates aren’t expected to know every Git command or how to resolve a gnarly conflict from memory. It’s fine to say something like: "I’m comfortable with the everyday workflow, branch, commit, push, PR, and I know how to look up anything more advanced, like rebasing or resolving a tricky conflict, when I hit it." Being clear and calm about **how** you’d figure something out matters more than reciting commands. See [[communication|Communication]] for more on framing gaps in knowledge honestly.

## Key terms

| Term | Definition |
| --- | --- |
| Repository | A project’s tracked files and full change history. |
| Commit | A saved snapshot of changes with a message. |
| Branch | An independent line of development. |
| Merge | Combining changes from one branch into another. |
| Pull Request (PR) | A proposal to merge one branch into another, with room for review. |
| Merge conflict | A case Git can’t auto-resolve, requiring manual reconciliation. |

See [[glossary|the glossary]] for more terms across all foundational notes.

## Watch

![](https://www.youtube.com/watch?v=tRZGeaHPoaw)

## Related notes

* [[cicd-and-github-actions|CI/CD and GitHub Actions]]: what happens automatically when a PR is opened or merged.
* [[communication|Communication]]: how to talk about knowledge gaps and workflow in an interview.
* [[glossary|Glossary]]: definitions for terms used across these notes.
