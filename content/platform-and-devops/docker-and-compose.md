---
title: "Docker & Docker Compose"
tags: [docker, containers]
level: fundamentals
type: concept
---


A container packages an application together with everything it needs to run — code, runtime, libraries, config — so it behaves the same way on a laptop, a teammate’s machine, and a production server. Docker is the tool most teams use to build, ship, and run these containers, and Docker Compose is the companion tool for running several containers together as one local stack. A junior developer is not expected to author production Dockerfiles from scratch, but should be able to read one, run a project with `docker compose up`, and explain what a container is.

## Containers vs VMs

Both containers and virtual machines (VMs) let multiple isolated environments run on one physical machine, but they isolate at different levels.

* **Virtual machine** — virtualizes the hardware. Each VM includes its own full operating system kernel, so a host running three VMs is running three complete OS copies. This is heavier: slower to start (minutes), larger on disk (gigabytes), more memory overhead.
* **Container** — virtualizes at the operating system level. Containers share the host machine’s kernel and only package the application plus its own libraries and dependencies. This is lightweight: starts in seconds, images are typically megabytes, and many containers can run on the same host with less overhead than the equivalent number of VMs.

The tradeoff is isolation strength versus weight. A VM’s separate kernel gives stronger isolation, which is why VMs are still used for strict security boundaries or running a different OS entirely. A container’s shared kernel is why it’s fast and cheap to spin up, which is why containers are the default choice for packaging and running individual application services.

> [!tip]
> If asked to explain this in an interview, one sentence is usually enough: "A VM virtualizes a whole machine including the OS kernel; a container virtualizes just the application layer and shares the host’s kernel, which is why containers are faster and lighter."

## Images, containers, Dockerfiles

* **Image** — a read-only blueprint: a packaged snapshot of an application and its dependencies, built once from a set of instructions.
* **Container** — a running instance of an image. The same image can be started as a container many times, on many machines, and each instance is isolated from the others.
* **Registry** — a place images are stored and shared, so a machine doesn’t need to rebuild an image from scratch to run it. Docker Hub is the most common public registry; teams also run private registries for internal images.

An image is built from a `Dockerfile` — a plain-text list of instructions describing how to assemble it, executed top to bottom.

```dockerfile
# Start from a base image with Node.js already installed
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency manifests first, then install — this lets Docker cache
# the install step so it doesn't rerun on every code change
COPY package*.json ./
RUN npm install

# Copy the rest of the application source
COPY . .

# Command that runs when a container starts from this image
CMD ["npm", "start"]
```

* `FROM` picks a starting point instead of building an OS up from nothing.
* `COPY` brings files from the local project into the image.
* `RUN` executes a command while the image is being built (installing dependencies).
* `CMD` specifies the command that runs when a container is started, not while the image is built.

Once built, `docker build -t my-app .` produces an image, and `docker run my-app` starts a container from it.

## Docker Compose

A real application is rarely one container — a typical stack might need an app server, a database, and a cache running together. Docker Compose defines that whole stack in a single YAML file so it can be started, stopped, and networked with one command instead of several manual `docker run` invocations.

A `compose.yml` describes three main things: the **services** to run (each usually one container), the **networks** that let them talk to each other, and the **volumes** that persist data outside the container’s own filesystem.

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/appdb

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=appdb
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

Running `docker compose up` starts both services on a shared network Compose creates automatically, so `web` can reach `db` simply by using the service name (`db`) as a hostname — no manual IP configuration. The named volume `db-data` keeps the database’s files on disk between restarts, so stopping and restarting the stack doesn’t wipe the data.

![[docker-compose.drawio.svg]]

Why this matters day to day: it eliminates "works on my machine." If the app, database, and cache versions are all pinned inside the compose file, every developer and every environment runs the identical stack, instead of each machine having its own locally installed (and possibly mismatched) versions of Postgres or Redis.

## How to talk about this in an interview

* It’s fine to not have memorized every Dockerfile instruction or Compose key — what matters is understanding what a container is for and being able to read a Dockerfile or compose.yml when handed one.
* A reasonable answer to "have you deployed with Docker in production?" if the honest answer is no: describe local use (running a database in a container instead of installing it natively, or running a full stack with `docker compose up`) and say the production side is something to pick up quickly, since the core concepts transfer.
* If a question goes deeper than current knowledge — orchestration, networking internals, multi-stage builds — it’s better to say so plainly and describe how to find the answer than to guess. See [[communication|Communication]] for how to frame that kind of gap honestly.

## Key terms

| Term | Meaning |
| --- | --- |
| Image | Read-only blueprint an application is packaged into. |
| Container | A running instance of an image. |
| Dockerfile | Text file of instructions used to build an image. |
| Registry | Storage/distribution point for images, e.g. Docker Hub. |
| Docker Compose | Tool for defining and running multi-container stacks from one YAML file. |
| Volume | Persistent storage that survives a container being stopped or removed. |

See [[glossary|the glossary]] for the full list of terms used across these notes.

## Watch

![](https://www.youtube.com/watch?v=SXwC9fSwct8)

## Related notes

* [[glossary|Glossary]] — full term list referenced across all foundational notes.
* [[cloud-and-gcp|Cloud and GCP]] — containers are the common unit of deployment once an application moves to a cloud environment.
* [[cicd-and-github-actions|CI/CD and GitHub Actions]] — pipelines commonly build and push Docker images as part of automated deployment.
* [[communication|Communication]] — framing for being honest about the limits of hands-on production Docker experience.
