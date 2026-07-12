---
title: "SOLID Principles"
tags: [architecture, principles, oop]
level: deep
type: reference
reviewed: 2026-07-12
---


Design patterns are the vocabulary. Principles are the grammar. Both are required.

SOLID is an acronym for five object-oriented design principles. They guide service decomposition, dependency direction, and the shape of abstractions.

## [S] Single Responsibility Principle (SRP)

The Single Responsibility Principle is the foundation of service decomposition.

A module should be responsible to one, and only one, actor.

An **actor** is a group of stakeholders who request changes for the same reason (e.g. the finance team, the HR team, the DBA). When two actors can both demand changes to the same class, their needs eventually conflict and changes for one accidentally break the other.

**SRP IS:** "One class = one audience that can demand changes to it".

**SRP IS NOT:**

* ~~One class = one method.~~ SRP isn’t about size; it’s about reasons to change.
* ~~One class = one thing it does.~~ Too vague: almost any class can be described as doing "one thing" at some level of abstraction.

SRP reduces **efferent coupling**.

### Heuristic test

Ask: "Who would ask me to change this class?" If the answer is more than one role/team, SRP is being violated.

Martin suggests that we define each responsibility of a class as a reason for change. If you can think of more than one motivation for changing a class, it probably has more than one responsibility.

### Responsibilities to consider separating

* Persistence
* Validation
* Notification
* Error Handling
* Logging
* Class Selection / Instantiation
* Formatting
* Parsing
* Mapping

### Example: SRP violation

One class answers to three actors. Finance owns `calculatePay`, HR owns `reportHours`, the DBA owns `save`. A change for any one of them can break the others.

```typescript
class Employee {
  constructor(public name: string, public hoursWorked: number) {}

  // Finance's concern
  calculatePay(): number {
    return this.hoursWorked * 20;
  }

  // HR's concern
  reportHours(): string {
    return `${this.name} worked ${this.hoursWorked} hours`;
  }

  // DBA's concern
  save(): void {
    console.log(`Saving ${this.name} to the database`);
  }
}
```

### Example: SRP applied

Each class answers to one actor. `Employee` just holds data; behaviors live in dedicated classes.

```typescript
class Employee {
  constructor(public name: string, public hoursWorked: number) {}
}

// Finance's concern
class PayCalculator {
  calculatePay(employee: Employee): number {
    return employee.hoursWorked * 20;
  }
}

// HR's concern
class HourReporter {
  reportHours(employee: Employee): string {
    return `${employee.name} worked ${employee.hoursWorked} hours`;
  }
}

// DBA's concern
class EmployeeRepository {
  save(employee: Employee): void {
    console.log(`Saving ${employee.name} to the database`);
  }
}
```

## [O] Open-Closed Principle (OCP)

Software entities (classes, modules, methods, etc.) should be open for extension, but closed for modification.

In practice, this means creating software entities whose behavior can be changed without the need to edit and recompile the code itself.

### Simple illustration

Consider a method that does one thing, say, it writes to a particular file whose name is hard-coded into the method. If the requirements change and the filename now needs to be different in certain situations, we must open up the method to change the filename. If, on the other hand, the filename had been passed in as a parameter, we would be able to modify the behavior of this method without changing its source, keeping it closed to modification.

### Ways to achieve OCP

* Parameterization
* Inheritance
* Compositional design patterns (e.g. the Strategy pattern)

## [L] Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types.

When this principle is violated, it tends to result in a lot of extra conditional logic scattered throughout the application, checking to see the specific type of an object. This duplicate, scattered code becomes a breeding ground for bugs as the application grows.

### The four behavioural rules

LSP isn’t just about types being compatible at compile time, it’s about **behaviour**. Liskov and Wing (1994) formalised this into four rules a subtype must respect:

1. **Preconditions cannot be strengthened**, the subtype can’t demand more of the caller than the supertype did.
2. **Postconditions cannot be weakened**, the subtype must deliver at least as much as the supertype promised.
3. **Invariants of the supertype must be preserved**, any property that’s always true of the supertype must also always be true of the subtype.
4. **History rule**, the subtype cannot allow state changes that the supertype’s contract didn’t allow (e.g. making an immutable type mutable).

A subtype that breaks any of these is **type-compatible but behaviourally incompatible**, exactly the situation LSP forbids.

### Canonical example: Rectangle and Square

A `Square` **is-a** `Rectangle` mathematically. But making `Square` inherit from `Rectangle` breaks LSP, `Rectangle` has an implicit invariant that width and height can be set independently. `Square` cannot honour that invariant.

```typescript
class Rectangle {
  constructor(public width: number, public height: number) {}

  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }
  area(): number { return this.width * this.height; }
}

// Violates LSP - Square cannot honour Rectangle's "width and height vary independently"
class Square extends Rectangle {
  setWidth(w: number): void {
    this.width = w;
    this.height = w;  // forced to mutate height too
  }
  setHeight(h: number): void {
    this.width = h;   // forced to mutate width too
    this.height = h;
  }
}

// Code that works on Rectangle breaks on Square
function resize(r: Rectangle): void {
  r.setWidth(5);
  r.setHeight(4);
  console.assert(r.area() === 20);  // holds for Rectangle, fails for Square (area === 16)
}
```

The fix: stop modelling `Square` as a **subtype** of `Rectangle`. They are different shapes that happen to share the term "rectangle" in informal English. Make them peers (both implement a `Shape` interface) or composed (`Square` **has-a** side length, not **is-a** `Rectangle`).

### Common LSP smells

* `if (obj instanceof Subtype)` checks scattered through the codebase: callers don’t trust substitution.
* Subclass methods that throw `UnsupportedOperationException` / `NotImplementedError`: the subclass can’t honour the supertype’s contract. (This is also an [ISP](#i-interface-segregation-principle-isp) smell.)
* Subclass methods that **silently** do less than the supertype did (weaker postcondition) or **demand** more setup (stronger precondition).

## [I] Interface Segregation Principle (ISP)

The Interface Segregation Principle states that **clients should not be forced to depend on methods that they do not use**.

* Interfaces should belong to **clients**, not to libraries or hierarchies.
* Thin interfaces with less functionality but more independence are preferable to fat interfaces with more features.
* "Thin" doesn’t mean one interface per method: it means a cohesive grouping of methods that logically belong together for a single client role.

### Relationship to LSP

A benefit of adhering to ISP is that it makes Liskov Substitution Principle violations less likely. Fat interfaces force implementers to provide methods they can’t honor (often by throwing), which is exactly the kind of substitutability break LSP warns against.

### Example: ISP violation

One fat `OfficeMachine` interface forces every implementer to support `print`, `scan`, and `fax`. A `SimplePrinter` isn’t a scanner or a fax, but it’s still forced to implement those methods, and ends up throwing at runtime. Clients that only want to print are coupled to scan/fax changes they don’t care about.

```typescript
interface OfficeMachine {
  print(document: string): void;
  scan(document: string): void;
  fax(document: string): void;
}

class SimplePrinter implements OfficeMachine {
  print(document: string): void {
    console.log(`Printing: ${document}`);
  }
  scan(_document: string): void {
    throw new Error("SimplePrinter cannot scan");
  }
  fax(_document: string): void {
    throw new Error("SimplePrinter cannot fax");
  }
}
```

### Example: ISP applied

Split the fat interface into focused, role-based interfaces. `SimplePrinter` only commits to `Printer`; `MultiFunctionPrinter` composes all three. Consumers depend on the narrow role they need, so misuse becomes a compile-time error instead of a runtime throw.

```typescript
// Focused interfaces - one role each.
interface Printer {
  print(document: string): void;
}

interface Scanner {
  scan(document: string): void;
}

interface Fax {
  fax(document: string): void;
}

class SimplePrinter implements Printer {
  print(document: string): void {
    console.log(`Printing: ${document}`);
  }
}

class MultiFunctionPrinter implements Printer, Scanner, Fax {
  print(document: string): void {
    console.log(`Printing: ${document}`);
  }
  scan(document: string): void {
    console.log(`Scanning: ${document}`);
  }
  fax(document: string): void {
    console.log(`Faxing: ${document}`);
  }
}

// Consumers depend only on the narrow interface they need.
function printDocument(p: Printer, document: string): void {
  p.print(document);
}

function archive(s: Scanner, document: string): void {
  s.scan(document);
}

const basic = new SimplePrinter();
printDocument(basic, "Memo.pdf");  // works - SimplePrinter is a Printer
// archive(basic, "Memo.pdf");     // compile error - SimplePrinter isn't a Scanner
```

## [D] Dependency Inversion Principle (DIP)

The Dependency Inversion Principle is the foundation of Clean Architecture. Robert Martin created this principle. It contains two rules:

1. High-level modules should not depend on low-level modules. Both depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

### The "inversion"

Normally, high-level policy code calls low-level utility code, so the dependency arrow points downward. DIP inverts this by putting an interface between them that both sides depend on. The arrow from the low-level module now points **up** toward the abstraction owned by the high-level module.

### Example: DIP violation

`OrderService` depends directly on a concrete class. You can’t swap the DB or test without MySQL.

```typescript
class MySQLOrderRepository {
  save(order: string): void {
    console.log(`Saving "${order}" to MySQL`);
  }
}

class OrderService {
  private repository = new MySQLOrderRepository(); // hard-coded dependency

  placeOrder(order: string): void {
    this.repository.save(order);
  }
}
```

### Example: DIP applied

`OrderService` depends on the `OrderRepository` interface. Implementations are injected, so they’re swappable and testable.

```typescript
// Abstraction
interface OrderRepository {
  save(order: string): void;
}

// Implementation
class MySQLOrderRepository implements OrderRepository {
  save(order: string): void {
    console.log(`Saving "${order}" to MySQL`);
  }
}

// High-level module - depends only on the interface
class OrderService {
  constructor(private repository: OrderRepository) {} // dependency injection

  placeOrder(order: string): void {
    this.repository.save(order);
  }
}

const service = new OrderService(new MySQLOrderRepository());
service.placeOrder("Book");
```

## Relation to other foundational concepts

* [[coupling-and-cohesion|Coupling & Cohesion]]: SRP and ISP are direct attacks on coupling; DIP redirects it; OCP and LSP make it survivable as the system grows.
* [[grasp|GRASP]]: High Cohesion is the GRASP-era precursor to SRP; Polymorphism precedes LSP and OCP; Protected Variations + Indirection precede DIP. GRASP guides the original assignment; SOLID audits the result.
* [[dry|DRY]]: duplication crossing actor boundaries is often an SRP violation in disguise.
* [[kiss|KISS]] / [[yagni|YAGNI]]: OCP wants extensibility points; KISS and YAGNI restrict you to **real** variation, not imagined variation.
* [[cqs|CQS]]: a method-level axis of separation orthogonal to SRP’s actor-level axis. Both reduce coupling.
