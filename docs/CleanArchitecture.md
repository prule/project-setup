# Clean Architecture

Clean Architecture, also introduced by Robert C. Martin (Uncle Bob), is a software design philosophy that separates the elements of a design into ring levels. The primary goal is to create systems that are:

- **Independent of Frameworks:** The architecture does not depend on the existence of some library of feature-laden software. This allows you to use such frameworks as tools, rather than having to cram your system into their limited constraints.
- **Testable:** The business rules can be tested without the UI, Database, Web Server, or any other external element.
- **Independent of UI:** The UI can change easily, without changing the rest of the system. A Web UI could be replaced with a console UI, for example, without changing the business rules.
- **Independent of Database:** You can swap out PostgreSQL or MySQL for MongoDB, CouchDB, or something else. Your business rules are not bound to the database.
- **Independent of any external agency:** In fact, your business rules simply don't know anything at all about the outside world.

## The Dependency Rule

The overriding rule that makes this architecture work is **The Dependency Rule**:
> *Source code dependencies must point only inward, toward higher-level policies.*

Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle.

## The Layers (from innermost to outermost)

### 1. Entities (Enterprise Business Rules)
- Entities encapsulate the most general and high-level business rules.
- They can be objects with methods, or a set of data structures and functions.
- They are the least likely to change when something external changes (like a page navigation or security issue).
- In a Clean Architecture, they do not depend on *anything* else.

### 2. Use Cases (Application Business Rules)
- The software in this layer contains application-specific business rules.
- It encapsulates and implements all of the use cases of the system.
- These use cases orchestrate the flow of data to and from the entities, and direct those entities to use their enterprise-wide business rules to achieve the goals of the use case.
- Changes in this layer shouldn't affect the entities. Similarly, changes to externalities (like the database or UI) shouldn't affect this layer.

### 3. Interface Adapters (Controllers, Gateways, Presenters)
- The software in this layer is a set of adapters that convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web.
- It is this layer that will wholly contain the MVC architecture of a GUI. The Presenters, Views, and Controllers all belong in here.
- No code inward of this circle should know anything about the database. If the database is a SQL database, then all the SQL should be restricted to this layer.

### 4. Frameworks and Drivers (Web, DB, Devices)
- The outermost layer is generally composed of frameworks and tools such as the Database, the Web Framework, etc.
- Generally, you don't write much code in this layer other than glue code that communicates to the next circle inwards.
- This layer is where all the details go. The Web is a detail. The database is a detail. We keep these things on the outside where they can do little harm.

## Crossing Boundaries

How do layers communicate if dependencies only point inward? We use **Dependency Inversion**.

If a Use Case (Layer 2) needs to talk to the Database (Layer 4), it doesn't call the Database class directly (which would violate the Dependency Rule). Instead:
1. The Use Case defines an **Interface** (e.g., `UserRepository`) in its own layer.
2. The outer Interface Adapters layer provides a class (e.g., `PostgresUserRepository`) that implements this interface. 

This means at compile-time, the Use Case depends only on its own inner Interface, while at runtime, the Database adapter is injected to fulfill that interface.

## Summary

By separating the software into layers, and conforming to The Dependency Rule, you create an intrinsically testable system, with all the benefits that implies. When any of the external parts of the system become obsolete, like the database, or the web framework, you can replace those obsolete elements with a minimum of fuss.
