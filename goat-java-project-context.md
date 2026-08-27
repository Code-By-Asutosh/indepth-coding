# GOAT Java — Project Context

Handoff document for building a learning website that teaches Java + full-stack
software architecture concepts in a compressed, story-driven, highly retentive way.

---

## 1. Vision

- Built by a developer with 4.5 years of Java/Angular full-stack experience aiming
  to become an expert-level ("GOAT") Java engineer/architect — and to help the wider
  Java community get there too, not just personally.
- The end product is a **website** that teaches every concept in the roadmap below.
- Core philosophy: **"Simple, but simple that covers a lot."** Never dumb a concept
  down — compress it. A concept page should be readable in ~3 minutes but leave the
  reader able to defend the concept in an interview or a design review.
- The site should build genuine **learning addiction** — through curiosity, payoff,
  visible mastery, and community, not dark patterns.
- Every concept page follows the **same fixed 10-stage flow** (below), no exceptions.
  The repetition of structure is itself part of the addiction: the brain stops
  spending effort on "where do I find X" and spends all of it on the concept itself.

---

## 2. The Concept Roadmap (content scope)

This is the full list of topics the site needs to eventually cover — one page per
leaf concept, grouped under these sections. Headers only — no definitions here,
each item becomes its own concept page using the flow in Section 3.

### 1. Java Core
JVM Internals · Memory Management · Java Memory Model (JMM — happens-before,
volatile semantics) · Garbage Collection (Serial, Parallel, CMS, G1, ZGC,
Shenandoah, Epsilon) · OOP · SOLID · Java Collections · Exception Handling ·
Multithreading · Concurrency (CountDownLatch, CyclicBarrier, Semaphore,
ThreadLocal, ForkJoinPool, CompletableFuture) · Java 8+ · Streams · Functional
Programming · Reflection · Generics · Serialization · Records · Sealed Classes ·
Pattern Matching (instanceof, switch expressions) · Virtual Threads · Structured
Concurrency · Method Handles / VarHandles / Unsafe · Module System (JPMS) ·
Optional · java.time · Text Blocks · Nested/Inner/Anonymous/Local Classes ·
String Pool & Interning · Autoboxing Pitfalls · Performance Optimization · JIT
Compiler · Escape Analysis · ClassLoader · Bytecode Basics / javap · JMH
(Microbenchmarking) · Java NIO · Networking · Security · Project Panama (FFM
API, future) · Project Valhalla (Value Types, future)

### 2. Enterprise Java (Advanced Java)
JDBC · Connection Pooling · HikariCP Tuning · JPA · Hibernate (N+1 Problem, Lazy
vs Eager Loading, Entity Lifecycle, Second-Level Cache, Multi-Tenancy) · Spring
Data · Bean Validation · Transactions · Caching · Scheduling · Async Programming
· Reactive Programming · File Processing (XML, JSON, Email, PDF, Excel) ·
Encryption · OAuth · JWT · Backend Development · DB Migrations (Flyway,
Liquibase) · Logging Frameworks (SLF4J, Logback, Log4j2)

### 3. Spring Ecosystem
Spring Core (BeanFactory vs ApplicationContext, Bean Lifecycle) · Spring Boot
(Auto-Configuration Internals, Actuator, Profiles, Custom Starters) · Spring MVC
· Spring Security · Spring Data · Spring Cloud · Spring Batch · Spring
Integration · Spring AOP · Spring WebFlux · Spring Testing · Spring Native /
GraalVM · Spring AI (future)

### 4. API Design
REST · GraphQL · gRPC · API Versioning · OpenAPI · Swagger · Pagination ·
Filtering · HATEOAS · Rate Limiting · Authentication · Authorization · API
Gateway · Idempotency · Error Handling · Webhooks · SSE / Long Polling · CORS ·
API-First / Design-First Workflow

### 5. Microservices Architecture
Service Discovery · Eureka · Config Server · API Gateway · Circuit Breaker ·
Resilience4j · Distributed Transactions · Saga · CQRS · Event Sourcing · Service
Mesh · Observability · Distributed Tracing · Strangler Fig Pattern ·
Anti-Corruption Layer · Bulkhead Pattern · Sidecar Pattern · Outbox Pattern

### 6. Angular
Signals · RxJS · Routing · Forms · State Management · NgRx · Performance · Lazy
Loading · SSR · Authentication · Testing · PWA · Change Detection (Zone.js,
OnPush) · Directives · Pipes · Component Communication (@Input/@Output) ·
Standalone Components · Micro-Frontends / Module Federation

### 7. TypeScript
Type System Basics · Generics · Decorators · Type Narrowing · Utility Types ·
Interfaces vs Types · Modules & Namespaces

### 8. SQL Databases
MySQL · PostgreSQL · SQL Server (optional) · Normalization · Indexing · Query
Optimization · Execution Plan · Locking · Transactions · Isolation Levels ·
Replication · Partitioning · Sharding · ACID Properties · Views · Stored
Procedures · Triggers · Window Functions · CTEs · Backup & Recovery

### 9. NoSQL Databases
MongoDB · Redis · Cassandra · Elasticsearch · DynamoDB · Graph Databases (Neo4j)
· CAP Theorem · Consistency · Partitioning · TTL · Document Database · Key
Value · Search Engine · BASE vs ACID

### 10. Cloud Computing (AWS)
Cloud Concepts (foundational) · IAM · EC2 · ECS · EKS · Lambda · S3 · RDS ·
DynamoDB · VPC · CloudWatch · CloudFormation · Route53 · ELB · Auto Scaling ·
API Gateway · Secrets Manager · SQS · SNS · EventBridge · Well-Architected
Framework · Cost Optimization

### 11. DevOps
Git · GitHub · CI/CD · Jenkins · GitHub Actions · SonarQube · Nexus · Maven ·
Gradle · GitOps · ArgoCD · Blue-Green / Canary Deployments · Feature Flags

### 12. Build Tools & Version Control
Maven Lifecycle · Gradle Build Scripts · Dependency Management · BOM · Git
Internals (objects, refs, rebase vs merge) · Branching Strategies (GitFlow,
Trunk-Based Development)

### 13. Docker & Kubernetes
Helm · Ingress · StatefulSets · ConfigMap · Secret · Autoscaling · Rolling
Updates · Kubernetes Networking · Docker Compose · Multi-Stage Builds · Service
Mesh (Istio) · CRDs / Operators

### 14. Message Brokers & Event Streaming
Kafka · RabbitMQ · ActiveMQ · SQS · SNS · EventBridge · Pub/Sub · Retry · Dead
Letter Queue · Ordering · Exactly Once · Consumer Groups

### 15. Design Patterns & Clean Architecture
SOLID · GOF Patterns (Creational, Structural, Behavioral) · DDD · Clean
Architecture · Hexagonal Architecture · Onion Architecture · Vertical Slice
Architecture · Repository Pattern · Specification Pattern · Anti-Patterns

### 16. System Design
Scalability · Availability · Reliability · Load Balancer · CDN · Cache · Queue
· Database Scaling · CAP Theorem · Consistent Hashing · Bloom Filter · Rate
Limiter · URL Shortener · Notification System · Search System · Logging ·
Monitoring · Security · Back-of-Envelope Estimation / Capacity Planning ·
Consensus Algorithms (Raft, Paxos) · Distributed Locks · Leader Election

### 17. Security Engineering
OWASP Top 10 · JWT · OAuth2 · OpenID Connect · SSL · TLS · HTTPS · CSRF · XSS ·
SQL Injection · Encryption · Hashing · Secrets Management · mTLS · Zero Trust
Architecture · Security Headers · Rate Limiting / DDoS Mitigation

### 18. Testing & Quality Engineering
JUnit · Mockito · Integration Testing · Testcontainers · Performance Testing ·
Load Testing · Contract Testing · WireMock · TDD · BDD (Cucumber) · JaCoCo ·
Mutation Testing · Test Pyramid

### 19. Observability & Monitoring
Prometheus · Grafana · ELK Stack · OpenTelemetry · Jaeger · Zipkin · Micrometer
· Distributed Logging · SLI/SLO/SLA · APM Tools (Datadog, New Relic,
AppDynamics) · Chaos Engineering

### 20. Computer Networking
TCP · UDP · HTTP · HTTPS · HTTP/2 · HTTP/3 · DNS · Load Balancer · Reverse
Proxy · VPN · NAT · CDN · WebSocket

### 21. Linux & Operating Systems
Linux Commands · Processes · Threads · Scheduling · Memory · File System ·
Permissions · Bash · Shell Scripting · Cron · systemd · System Calls

### 22. Software Engineering Practices
Clean Code · Refactoring · Code Reviews · Coding Standards · Documentation ·
Agile · Scrum · Estimation · Technical Debt · Postmortems / Incident Management
· RFC Process for Design Proposals

### 23. Enterprise Architecture
Monolith · Modular Monolith · Microservices · Event Driven Architecture · SOA ·
CQRS · DDD deep dive (Bounded Context, Aggregates, Value Objects, Ubiquitous
Language) · BFF · API First · Twelve-Factor App · Cloud Native · Multi-Tenant
Architecture · C4 Model (Architecture Diagramming)

### 24. Data Structures & Algorithms
Arrays · Trees · Graphs · DP · Greedy · Backtracking · Trie · Heap · Sliding
Window

### 25. Communication & Leadership
Review Designs · Mentor Developers · Present Architecture · Estimate Projects ·
Handle Stakeholders · Make Trade-offs · Write ADRs · Conduct Technical
Interviews

### 26. AI for Software Engineering
LLM Fundamentals · Prompt Engineering · AI Coding Assistants · Retrieval-
Augmented Generation (RAG) · AI Agents · Model Context Protocol (MCP) · Vector
Databases · AI Integration in Java Applications · Responsible AI and Security
Considerations

---

## 3. The Concept Page Flow (Story Narration Doctrine)

> **Master Guide**: See [`STORY_NARRATION_STYLE_GUIDE.md`](STORY_NARRATION_STYLE_GUIDE.md) for full rules, character arcs, and complete Medium article reference templates.

### The Philosophy & Psychology
- **Curiosity gap (Loewenstein):** A definition is homework; an unfolding engineering dilemma is a hook. Every page opens with where the ShopSphere team stands and the immediate bug/need.
- **Cognitive load (Sweller):** Working memory holds ~4 items; concrete scenario before abstraction.
- **Schema theory:** New knowledge attaches to an existing mental model. Every concept uses one strong everyday analogy.
- **Story structure:** Setup → Tension → Resolution → New Equilibrium. Payoff makes the reader eager for the next chapter.
- **Unified Universe (ShopSphere):** Asutosh & Sushil building an e-commerce platform that grows from a laptop monolith to Docker/ECS on AWS.

### The Lesson Chapter Flow
1. **Continuation Opening (`Picking up where we left off`)**: Relatable scene/dilemma in ShopSphere. Never open cold.
2. **Story Chapters (`h2.ch`)**: Numbered narrative headings (e.g. `01 The gift-card bug`, `02 Walking from both ends`).
3. **Embedded Code Snippets**: Small runnable snippets (2–6 lines) woven right into the story.
4. **Memory Hook (`.hook`)**: 1 punchy invariant line with `⌘` icon.
5. **Visual Simulation (`▶ Watch it run`)**: Embedded interactive step-player animation at the moment watching beats reading.
6. **Honest Trade-offs**: Spoken frankly within prose (*"One honest cost worth knowing..."*), not in an isolated box.
7. **Synthesis Finale ("Put Together" Recap)**: Terminal summary box resolving the story + next-up teaser.
8. **War Room Appendix (After the story)**: `rapidFire` (1-breath spoken definitions) + `scenarioDrills` (interview war games).

> **Master Authoring Guides**:
> - [`STORY_NARRATION_STYLE_GUIDE.md`](STORY_NARRATION_STYLE_GUIDE.md) — Universe bible, character arcs, and 10 golden rules.
> - [`ARTICLE_AUTHORING_CONTEXT.md`](ARTICLE_AUTHORING_CONTEXT.md) — Technical standard, code snippet requirements (4–6 per lesson), 4-diagram visual model, and Step-Player animation specs.

### Worked example — N+1 Problem
1. **Hook** — Your API endpoint that fetches 20 orders is somehow running 21
   database queries. You didn't write 21 queries.
2. **Problem** — Lazy-loaded relationships mean each order's items get fetched in
   a separate query, invisible in your code, brutal in production at scale.
3. **Aha** — It's like asking a waiter for 20 tables' orders one table at a time
   instead of once for the whole restaurant.
4. **Under the hood** — Hibernate lazy loading → each `.getItems()` call triggers
   a fresh SELECT → 1 query becomes N+1.
5. **In the wild** — A production API degrading under load; a classic "why is
   this endpoint slow" interview question.
6. **Show me** — 3-line entity snippet with lazy `@OneToMany`, then the fix with
   `JOIN FETCH`.
7. **Impact** — 21 queries → 1 query; concrete p99 latency drop.
8. **Alternatives** — Eager fetching (risk: over-fetching), DataLoader/batching
   pattern, projection queries.
9. **The trap** — "Fixing" it by turning on eager loading everywhere, silently
   loading the entire database on every request.
10. **Prove it** — "Given this entity mapping, how many queries does this loop
    trigger?"

---

## 4. Open Decisions (not yet locked — worth resolving before building the schema)

- Should **Alternatives (stage 8)** stay right before **The Trap (stage 9)**, or
  move closer to **Under the Hood (stage 4)**, nearer where the mistake actually
  happens?
- Should **Prove It (stage 10)** stay a single question, or become a short
  3-question retrieval burst? Tradeoff: speed-of-consumption vs.
  depth-of-retention.
- Addiction layer beyond structure (not yet designed in depth): streaks, a
  visible concept-graph/map that unlocks as the learner progresses, progress
  badges per section, a community "explain this back in your own words" layer
  where the community itself becomes part of the retention loop — this directly
  supports the "not just me, the whole community becomes GOAT" part of the
  vision.

---

## 5. Design Principle to Repeat to Every Contributor

If a concept explanation takes more than one screen to say "what it is," it
hasn't been compressed enough — simplicity here doesn't mean less coverage, it
means the same coverage said with zero wasted words. That's the site's
competitive edge.
