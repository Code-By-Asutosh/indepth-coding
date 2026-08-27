import { Category, Frequency, Importance, ConceptSummary } from '../models/content.model';
import { slugify } from '../utils/slugify';

/** Shorthand for building a ConceptSummary with a slugified id. */
function c(title: string, importance: Importance = 'important', frequency: Frequency = 'medium'): ConceptSummary {
  return { id: slugify(title), title, importance, frequency };
}

/**
 * The full site content map: Category -> Topic -> Concept.
 *
 * NOTE: this is navigation/tracking metadata only (titles + importance +
 * interview frequency). The actual 10-stage written content for a concept is
 * added separately in `core/data/concepts/*` and looked up by id - most
 * concepts below intentionally have no written page yet ("coming soon").
 * `importance`/`frequency` are placeholder defaults to be curated later.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'interview-prep',
    title: 'Interview Prep',
    tagline: 'The guided war-room: one story-driven path from Core Java to AWS, tuned for real interview rounds.',
    icon: '🎯',
    topics: [
      {
        id: 'strategy',
        title: 'Start Here',
        concepts: [
          c('Prep Strategy', 'core', 'high'),
          c('ShopSphere Case Study', 'core', 'medium'),
          c('Project War Stories', 'core', 'high')
        ]
      },
      {
        id: 'collections-mastery',
        title: 'Collections Mastery',
        concepts: [
          c('Collections Big Picture', 'core', 'high'),
          c('ArrayList & LinkedList Internals', 'core', 'high'),
          c('HashMap Internals', 'core', 'high'),
          c('equals & hashCode in Practice', 'core', 'high'),
          c('HashSet, LinkedHashSet & TreeSet', 'important', 'high'),
          c('ConcurrentHashMap & Fail-Fast', 'core', 'high'),
          c('LinkedHashMap LRU, TreeMap & PriorityQueue', 'important', 'medium'),
          c('Collections Scenario Drill', 'core', 'high')
        ]
      },
      {
        id: 'core-java-rapid',
        title: 'Core Java Rapid Fire',
        concepts: [
          c('OOP & SOLID Rapid Fire', 'core', 'high'),
          c('String Immutability & Pool', 'important', 'high'),
          c('Immutability Everywhere: Objects, Collections, Records', 'important', 'medium'),
          c('Exception Handling Drill', 'core', 'high'),
          c('Generics & Wildcards Drill', 'important', 'medium'),
          c('Java 8+ Essentials: Lambdas, Functional Interfaces, Streams, Optional', 'core', 'high'),
          c('Java for DSA Essentials', 'optional', 'medium')
        ]
      },
      {
        id: 'concurrency-drill',
        title: 'Concurrency Drill',
        concepts: [
          c('Threads to ThreadPoolExecutor', 'core', 'high'),
          c('CompletableFuture & Parallel Streams', 'core', 'high'),
          c('synchronized, volatile, Atomics & Locks', 'core', 'high'),
          c('Race Conditions & Deadlocks', 'core', 'high'),
          c('Concurrency Scenario Drill', 'core', 'high')
        ]
      },
      {
        id: 'spring-boot-drill',
        title: 'Spring Boot Drill',
        concepts: [
          c('Spring DI & Bean Lifecycle Rapid Fire', 'core', 'high'),
          c('Auto-Configuration Demystified', 'important', 'medium'),
          c('Profiles, External Config & Actuator', 'important', 'medium'),
          c('REST Principles & Resource Design', 'core', 'high'),
          c('Production REST: Validation, Pagination, Versioning, Idempotency & Error Design', 'core', 'high'),
          c('@Transactional Deep Dive', 'core', 'high')
        ]
      },
      {
        id: 'security-drill',
        title: 'Security Drill',
        concepts: [
          c('Spring Security Spine: FilterChain, Authentication vs Authorization', 'core', 'high'),
          c('JWT End-to-End Drill', 'core', 'high'),
          c('OAuth2 Basics, CORS, CSRF & Method Security', 'important', 'high')
        ]
      },
      {
        id: 'jpa-hibernate-drill',
        title: 'JPA & Hibernate Drill',
        concepts: [
          c('JPA/Hibernate Interview Spine', 'core', 'high'),
          c('JPQL, Native Queries & Pagination', 'important', 'high'),
          c('N+1, Lazy vs Eager, Fetch Joins & EntityGraph', 'core', 'high'),
          c('Optimistic vs Pessimistic Locking', 'important', 'high')
        ]
      },
      {
        id: 'sql-databases-drill',
        title: 'SQL & Databases Drill',
        concepts: [
          c('SQL Joins & Aggregations Drill', 'core', 'high'),
          c('Subqueries, CTEs & Window Functions', 'important', 'high'),
          c('Indexes, EXPLAIN & Query Optimization', 'core', 'high'),
          c('Normalization & Schema Design', 'important', 'high'),
          c('Database Transactions, Locks & Deadlocks', 'important', 'high'),
          c('Connection Pooling & HikariCP', 'important', 'medium')
        ]
      },
      {
        id: 'microservices-drill',
        title: 'Microservices Drill',
        concepts: [
          c('Microservices Interview Spine', 'core', 'high'),
          c('Sync vs Async Communication & Messaging Patterns', 'core', 'high'),
          c('Service Discovery, API Gateway & Config Management', 'core', 'high'),
          c('Resilience: Timeouts, Retry, Circuit Breaker, Bulkhead & Rate Limiting', 'core', 'high'),
          c('Saga Pattern & Data Consistency', 'core', 'high'),
          c('Distributed Tracing & Centralized Logging', 'important', 'high')
        ]
      },
      {
        id: 'system-design-studio',
        title: 'System Design Studio',
        concepts: [
          c('System Design Framework: Requirements to Trade-offs', 'core', 'high'),
          c('Design: Order Management System', 'core', 'high'),
          c('Design: Payment System', 'core', 'high'),
          c('Design: Notification System', 'important', 'high'),
          c('Design: Inventory System', 'important', 'high'),
          c('Design: Shipment Tracking System', 'core', 'high')
        ]
      },
      {
        id: 'aws-drill',
        title: 'AWS for Java Devs',
        concepts: [
          c('IAM, Regions, VPC & Networking Spine', 'core', 'high'),
          c('EC2, Auto Scaling & the Compute Choice Drill', 'core', 'high'),
          c('Docker + ECS Deployment Story', 'core', 'high'),
          c('ALB, API Gateway, Route 53, CloudFront & S3', 'core', 'high'),
          c('RDS Deep Dive: Multi-AZ, Read Replicas & Backups', 'core', 'high'),
          c('DynamoDB Fundamentals', 'important', 'medium'),
          c('Secrets Manager, Parameter Store, Cognito & Least Privilege', 'core', 'high'),
          c('CloudWatch Observability & Alarms', 'core', 'high'),
          c('Draw the Architecture Drill', 'core', 'high')
        ]
      },
      {
        id: 'delivery-drill',
        title: 'Docker, CI/CD & Delivery',
        concepts: [
          c('Docker for Java Developers', 'core', 'high'),
          c('CI/CD Pipeline End-to-End: GitHub Actions to ECS Deployment Strategies', 'core', 'high'),
          c('Kubernetes/EKS Concepts', 'important', 'medium'),
          c('Observability & Production Debugging', 'core', 'high')
        ]
      },
      {
        id: 'extras-messaging-cache',
        title: 'Messaging & Caching Extras',
        concepts: [
          c('Kafka Essentials Drill', 'core', 'medium'),
          c('Redis & Caching Patterns', 'important', 'medium'),
          c('SQS, SNS & Event-Driven Architecture', 'important', 'medium')
        ]
      },
      {
        id: 'capstone',
        title: 'Capstone & Mock Rounds',
        concepts: [
          c('Agile & Collaboration Drill', 'core', 'high'),
          c('Deloitte Scenario Rehearsal', 'core', 'high'),
          c('Final Readiness Check & Mock Plan', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'java-core',
    title: 'Java Core',
    tagline: 'The language itself, from OOP foundations to JVM internals.',
    icon: '☕',
    topics: [
      {
        id: 'java-core',
        title: 'Java Core',
        concepts: [
          // Core language foundations
          c('OOP', 'core', 'high'),
          c('SOLID', 'core', 'high'),
          c('Java Collections', 'core', 'high'),
          c('Generics', 'core', 'high'),
          c('Exception Handling', 'core', 'high'),
          c('String Pool & Interning'),
          c('Autoboxing Pitfalls'),
          c('Nested / Inner / Anonymous / Local Classes'),

          // Modern Java (8+)
          c('Java 8+'),
          c('Functional Programming'),
          c('Streams', 'core', 'high'),
          c('Optional'),
          c('Records'),
          c('Sealed Classes'),
          c('Pattern Matching (instanceof, switch expressions)'),
          c('java.time (Date/Time API)'),
          c('Text Blocks'),

          // Concurrency
          c('Multithreading', 'core', 'high'),
          c('Java Memory Model (JMM)', 'core', 'high'),
          c('Concurrency (CountDownLatch, CyclicBarrier, Semaphore, ThreadLocal, ForkJoinPool, CompletableFuture)', 'core', 'high'),
          c('Virtual Threads', 'core', 'high'),
          c('Structured Concurrency'),

          // JVM internals & performance
          c('JVM Internals', 'core', 'high'),
          c('ClassLoader'),
          c('Memory Management', 'core', 'high'),
          c('Garbage Collection (Serial, Parallel, CMS, G1, ZGC, Shenandoah, Epsilon)', 'core', 'high'),
          c('JIT Compiler'),
          c('Escape Analysis'),
          c('Bytecode Basics / javap'),
          c('Performance Optimization'),
          c('JMH (Microbenchmarking)'),

          // Advanced / systems-level
          c('Reflection'),
          c('Method Handles / VarHandles / Unsafe', 'optional', 'low'),
          c('Module System (JPMS)'),
          c('Serialization'),
          c('Java NIO'),
          c('Networking'),
          c('Security'),

          // Future / preview
          c('Project Panama (FFM API)', 'optional', 'low'),
          c('Project Valhalla (Value Types)', 'optional', 'low')
        ]
      }
    ]
  },
  {
    id: 'enterprise-java',
    title: 'Enterprise Java',
    tagline: 'Data access, persistence, and production-safe backend patterns.',
    icon: '🏢',
    topics: [
      {
        id: 'enterprise-java',
        title: 'Enterprise Java (Advanced Java)',
        concepts: [
          // Data access foundations
          c('JDBC', 'core', 'high'),
          c('Connection Pooling', 'core', 'high'),
          c('HikariCP Tuning'),
          c('JPA', 'core', 'high'),

          // Hibernate in depth
          c('Hibernate Entity Lifecycle'),
          c('Hibernate Lazy vs Eager Loading', 'core', 'high'),
          c('Hibernate N+1 Problem', 'core', 'high'),
          c('Hibernate Second-Level Cache'),
          c('Hibernate Multi-Tenancy Patterns', 'optional', 'low'),

          // Data integrity and access patterns
          c('Transactions', 'core', 'high'),
          c('Spring Data', 'core', 'high'),
          c('Bean Validation'),
          c('Caching', 'core', 'high'),
          c('DB Migrations (Flyway, Liquibase)'),

          // Concurrency and reactive styles
          c('Scheduling'),
          c('Async Programming'),
          c('Reactive Programming'),

          // File processing
          c('File Processing: JSON'),
          c('File Processing: XML'),
          c('File Processing: PDF'),
          c('File Processing: Excel'),
          c('File Processing: Email'),

          // Security
          c('Encryption'),
          c('JWT', 'core', 'high'),
          c('OAuth', 'core', 'high'),

          // Operations and wrap-up
          c('Logging Frameworks (SLF4J, Logback, Log4j2)'),
          c('Backend Development')
        ]
      }
    ]
  },
  {
    id: 'spring-ecosystem',
    title: 'Spring Ecosystem',
    tagline: 'Dependency injection, auto-configuration, and the Spring stack.',
    icon: '🌱',
    topics: [
      {
        id: 'spring-ecosystem',
        title: 'Spring Ecosystem',
        concepts: [
          c('Spring Core: BeanFactory vs ApplicationContext', 'core', 'high'),
          c('Spring Core: Bean Lifecycle', 'core', 'high'),
          c('Spring Boot: Auto-Configuration Internals', 'core', 'high'),
          c('Spring Boot: Actuator'),
          c('Spring Boot: Profiles'),
          c('Spring MVC', 'core', 'high'),
          c('Spring Security', 'core', 'high'),
          c('Spring Cloud'),
          c('Spring AOP', 'core', 'high'),
          c('Spring WebFlux'),
          c('Spring Testing')
        ]
      }
    ]
  },
  {
    id: 'api-design',
    title: 'API Design',
    tagline: 'Contracts, versioning, and client compatibility.',
    icon: '🔌',
    topics: [
      {
        id: 'api-design',
        title: 'API Design',
        concepts: [
          c('REST', 'core', 'high'),
          c('GraphQL'),
          c('gRPC'),
          c('API Versioning', 'core', 'high'),
          c('OpenAPI'),
          c('Pagination', 'core', 'high'),
          c('Rate Limiting', 'core', 'high'),
          c('Authentication', 'core', 'high'),
          c('Authorization', 'core', 'high'),
          c('API Gateway', 'core', 'high'),
          c('Idempotency', 'core', 'high'),
          c('Error Handling', 'core', 'high'),
          c('Webhooks'),
          c('SSE (Server-Sent Events) / Long Polling'),
          c('CORS', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'microservices-architecture',
    title: 'Microservices Architecture',
    tagline: 'Service boundaries, resilience, and distributed data consistency.',
    icon: '🧬',
    topics: [
      {
        id: 'microservices-architecture',
        title: 'Microservices Architecture',
        concepts: [
          c('Service Discovery', 'core', 'high'),
          c('Config Server'),
          c('API Gateway', 'core', 'high'),
          c('Circuit Breaker', 'core', 'high'),
          c('Resilience4j', 'core', 'high'),
          c('Distributed Transactions', 'core', 'high'),
          c('Saga', 'core', 'high'),
          c('CQRS', 'core', 'high'),
          c('Event Sourcing', 'core', 'high'),
          c('Service Mesh'),
          c('Strangler Fig Pattern'),
          c('Outbox Pattern', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'frontend',
    hidden: true,
    title: 'Frontend',
    tagline: 'Angular and TypeScript, from fundamentals to enterprise patterns.',
    icon: '🅰️',
    topics: [
      {
        id: 'angular',
        title: 'Angular',
        concepts: [
          c('Signals', 'core', 'high'),
          c('RxJS', 'core', 'high'),
          c('Routing', 'core', 'high'),
          c('Forms', 'core', 'high'),
          c('State Management'),
          c('NgRx'),
          c('Performance'),
          c('Lazy Loading', 'core', 'high'),
          c('SSR'),
          c('Authentication', 'core', 'high'),
          c('Testing'),
          c('Change Detection (Zone.js, OnPush)', 'core', 'high'),
          c('Directives'),
          c('Pipes'),
          c('Component Communication (@Input/@Output)', 'core', 'high'),
          c('Standalone Components', 'core', 'high')
        ]
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        concepts: [
          c('Type System Basics', 'core', 'high'),
          c('Generics', 'core', 'high'),
          c('Decorators'),
          c('Type Narrowing'),
          c('Utility Types'),
          c('Interfaces vs Types', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'database',
    title: 'Database',
    tagline: 'SQL fundamentals to distributed NoSQL trade-offs.',
    icon: '🗄️',
    topics: [
      {
        id: 'sql-databases',
        title: 'SQL Databases',
        concepts: [
          c('MySQL'),
          c('PostgreSQL'),
          c('Normalization', 'core', 'high'),
          c('Indexing', 'core', 'high'),
          c('Query Optimization', 'core', 'high'),
          c('Execution Plan', 'core', 'high'),
          c('Locking', 'core', 'high'),
          c('Transactions', 'core', 'high'),
          c('Isolation Levels', 'core', 'high'),
          c('Replication'),
          c('Partitioning'),
          c('Sharding', 'core', 'high'),
          c('ACID Properties', 'core', 'high'),
          c('Stored Procedures'),
          c('Window Functions', 'core', 'high'),
          c('CTEs', 'core', 'high'),
          c('Backup & Recovery')
        ]
      },
      {
        id: 'nosql-databases',
        title: 'NoSQL Databases',
        concepts: [
          c('MongoDB', 'core', 'high'),
          c('Redis', 'core', 'high'),
          c('Cassandra'),
          c('Elasticsearch'),
          c('DynamoDB'),
          c('CAP Theorem', 'core', 'high'),
          c('Consistency', 'core', 'high'),
          c('BASE vs ACID', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud',
    tagline: 'AWS building blocks and when to reach for each one.',
    icon: '☁️',
    topics: [
      {
        id: 'aws',
        title: 'Cloud Computing (AWS)',
        concepts: [
          c('Cloud Concepts (foundational)', 'core', 'high'),
          c('IAM', 'core', 'high'),
          c('EC2', 'core', 'high'),
          c('ECS', 'core', 'high'),
          c('EKS', 'core', 'high'),
          c('Lambda', 'core', 'high'),
          c('S3', 'core', 'high'),
          c('RDS', 'core', 'high'),
          c('DynamoDB'),
          c('VPC', 'core', 'high'),
          c('CloudWatch', 'core', 'high'),
          c('CloudFormation'),
          c('ELB', 'core', 'high'),
          c('Auto Scaling', 'core', 'high'),
          c('Secrets Manager'),
          c('SQS', 'core', 'high'),
          c('SNS', 'core', 'high'),
          c('Well-Architected Framework', 'core', 'high'),
          c('Cost Optimization')
        ]
      }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    tagline: 'CI/CD, build tooling, version control, containers & orchestration.',
    icon: '🔧',
    topics: [
      {
        id: 'devops',
        title: 'DevOps',
        concepts: [
          c('Git', 'core', 'high'),
          c('CI/CD', 'core', 'high'),
          c('Jenkins'),
          c('GitHub Actions', 'core', 'high'),
          c('Maven', 'core', 'high'),
          c('Gradle', 'core', 'high'),
          c('GitOps'),
          c('Blue-Green / Canary Deployments', 'core', 'high'),
          c('Feature Flags', 'core', 'high')
        ]
      },
      {
        id: 'build-tools-version-control',
        title: 'Build Tools & Version Control',
        concepts: [
          c('Dependency Management', 'core', 'high'),
          c('Git Internals (objects, refs, rebase vs merge)', 'core', 'high'),
          c('Branching Strategies (GitFlow, Trunk-Based Development)', 'core', 'high')
        ]
      },
      {
        id: 'docker-kubernetes',
        title: 'Docker & Kubernetes',
        concepts: [
          c('Helm', 'core', 'high'),
          c('Ingress', 'core', 'high'),
          c('StatefulSets'),
          c('ConfigMap', 'core', 'high'),
          c('Secret', 'core', 'high'),
          c('Autoscaling', 'core', 'high'),
          c('Rolling Updates', 'core', 'high'),
          c('Kubernetes Networking'),
          c('Docker Compose', 'core', 'high'),
          c('Multi-Stage Builds')
        ]
      }
    ]
  },
  {
    id: 'messaging',
    title: 'Messaging',
    tagline: 'Brokers, event streaming and delivery guarantees.',
    icon: '📨',
    topics: [
      {
        id: 'message-brokers',
        title: 'Message Brokers & Event Streaming',
        concepts: [
          c('Kafka', 'core', 'high'),
          c('RabbitMQ', 'core', 'high'),
          c('SQS'),
          c('SNS'),
          c('EventBridge'),
          c('Pub/Sub', 'core', 'high'),
          c('Retry', 'core', 'high'),
          c('Dead Letter Queue', 'core', 'high'),
          c('Ordering', 'core', 'high'),
          c('Exactly Once', 'core', 'high'),
          c('Consumer Groups', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'software-design',
    title: 'Software Design',
    tagline: 'Patterns and clean architecture that hold up under real change.',
    icon: '🧩',
    topics: [
      {
        id: 'design-patterns-clean-architecture',
        title: 'Design Patterns & Clean Architecture',
        concepts: [
          c('GOF Patterns: Creational', 'core', 'high'),
          c('GOF Patterns: Structural', 'core', 'high'),
          c('GOF Patterns: Behavioral', 'core', 'high'),
          c('DDD', 'core', 'high'),
          c('Clean Architecture', 'core', 'high'),
          c('Hexagonal Architecture', 'core', 'high'),
          c('Repository Pattern', 'core', 'high'),
          c('Anti-Patterns', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design',
    tagline: 'Scale, reliability, and the security engineering behind them.',
    icon: '🏗️',
    topics: [
      {
        id: 'system-design',
        title: 'System Design',
        concepts: [
          c('Scalability', 'core', 'high'),
          c('Availability', 'core', 'high'),
          c('Reliability', 'core', 'high'),
          c('Load Balancer', 'core', 'high'),
          c('CDN', 'core', 'high'),
          c('Cache', 'core', 'high'),
          c('Queue', 'core', 'high'),
          c('Database Scaling', 'core', 'high'),
          c('CAP Theorem', 'core', 'high'),
          c('Consistent Hashing', 'core', 'high'),
          c('Bloom Filter'),
          c('Rate Limiter', 'core', 'high'),
          c('URL Shortener', 'core', 'high'),
          c('Notification System'),
          c('Back-of-Envelope Estimation / Capacity Planning', 'core', 'high'),
          c('Distributed Locks', 'core', 'high')
        ]
      },
      {
        id: 'security-engineering',
        title: 'Security Engineering',
        concepts: [
          c('OWASP Top 10', 'core', 'high'),
          c('JWT', 'core', 'high'),
          c('OAuth2', 'core', 'high'),
          c('OpenID Connect'),
          c('TLS', 'core', 'high'),
          c('HTTPS', 'core', 'high'),
          c('CSRF', 'core', 'high'),
          c('XSS', 'core', 'high'),
          c('SQL Injection', 'core', 'high'),
          c('Encryption', 'core', 'high'),
          c('Hashing', 'core', 'high'),
          c('Secrets Management'),
          c('Security Headers'),
          c('Rate Limiting / DDoS Mitigation')
        ]
      }
    ]
  },
  {
    id: 'testing',
    hidden: true,
    title: 'Testing',
    tagline: 'Quality engineering from unit tests to mutation testing.',
    icon: '🧪',
    topics: [
      {
        id: 'testing-quality-engineering',
        title: 'Testing & Quality Engineering',
        concepts: [
          c('JUnit', 'core', 'high'),
          c('Mockito', 'core', 'high'),
          c('Integration Testing', 'core', 'high'),
          c('Testcontainers', 'core', 'high'),
          c('Performance Testing'),
          c('Contract Testing'),
          c('TDD', 'core', 'high'),
          c('Test Pyramid', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'observability',
    hidden: true,
    title: 'Observability',
    tagline: 'Metrics, logs, traces, and the SLOs that tie them together.',
    icon: '📈',
    topics: [
      {
        id: 'observability-monitoring',
        title: 'Observability & Monitoring',
        concepts: [
          c('Prometheus', 'core', 'high'),
          c('Grafana', 'core', 'high'),
          c('ELK Stack', 'core', 'high'),
          c('OpenTelemetry', 'core', 'high'),
          c('Micrometer'),
          c('SLI / SLO / SLA', 'core', 'high'),
          c('APM Tools (Datadog, New Relic, AppDynamics)')
        ]
      }
    ]
  },
  {
    id: 'networking',
    title: 'Networking',
    tagline: 'The protocols every backend engineer should truly understand.',
    icon: '🌐',
    topics: [
      {
        id: 'computer-networking',
        title: 'Computer Networking',
        concepts: [
          c('TCP', 'core', 'high'),
          c('UDP', 'core', 'high'),
          c('HTTP', 'core', 'high'),
          c('HTTPS', 'core', 'high'),
          c('HTTP/2', 'core', 'high'),
          c('DNS', 'core', 'high'),
          c('Load Balancer'),
          c('Reverse Proxy', 'core', 'high'),
          c('CDN'),
          c('WebSocket', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'operating-systems',
    title: 'Operating Systems',
    tagline: 'Linux internals every engineer eventually needs.',
    icon: '🐧',
    topics: [
      {
        id: 'linux-operating-systems',
        title: 'Linux & Operating Systems',
        concepts: [
          c('Linux Commands', 'core', 'high'),
          c('Processes', 'core', 'high'),
          c('Threads', 'core', 'high'),
          c('Scheduling'),
          c('Memory', 'core', 'high'),
          c('File System'),
          c('Permissions', 'core', 'high'),
          c('Shell Scripting'),
          c('Cron'),
          c('System Calls')
        ]
      }
    ]
  },
  {
    id: 'architecture-practices',
    title: 'Architecture & Practices',
    tagline: 'Enterprise architecture patterns and day-to-day engineering craft.',
    icon: '📐',
    topics: [
      {
        id: 'software-engineering-practices',
        title: 'Software Engineering Practices',
        concepts: [
          c('Clean Code', 'core', 'high'),
          c('Refactoring', 'core', 'high'),
          c('Code Reviews', 'core', 'high'),
          c('Documentation'),
          c('Agile'),
          c('Estimation'),
          c('Technical Debt', 'core', 'high'),
          c('Postmortems / Incident Management', 'core', 'high')
        ]
      },
      {
        id: 'enterprise-architecture',
        title: 'Enterprise Architecture',
        concepts: [
          c('Monolith', 'core', 'high'),
          c('Modular Monolith', 'core', 'high'),
          c('Microservices', 'core', 'high'),
          c('Event Driven Architecture', 'core', 'high'),
          c('CQRS'),
          c('DDD Deep Dive: Bounded Context', 'core', 'high'),
          c('DDD Deep Dive: Aggregates', 'core', 'high'),
          c('BFF', 'core', 'high'),
          c('Twelve-Factor App', 'core', 'high'),
          c('Multi-Tenant Architecture'),
          c('C4 Model (Architecture Diagramming)', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    tagline: 'The practice ground: patterns that show up in every interview.',
    icon: '🧮',
    topics: [
      {
        id: 'dsa-patterns',
        title: 'DSA Patterns',
        concepts: [
          c('Arrays', 'core', 'high'),
          c('HashMap / HashSet', 'core', 'high'),
          c('Stack', 'core', 'high'),
          c('Queue / Deque', 'core', 'high'),
          c('Linked List', 'core', 'high'),
          c('Sliding Window', 'core', 'high'),
          c('Tree', 'core', 'high'),
          c('Heap / Priority Queue', 'core', 'high'),
          c('Graph', 'core', 'high'),
          c('Trie'),
          c('Union-Find', 'core', 'high'),
          c('Segment Tree / Fenwick Tree', 'optional', 'low'),
          c('Sorting', 'core', 'high'),
          c('Binary Search', 'core', 'high'),
          c('Dynamic Programming', 'core', 'high'),
          c('Greedy', 'core', 'high'),
          c('Backtracking', 'core', 'high'),
          c('Bit Manipulation')
        ]
      }
    ]
  },
  {
    id: 'leadership-communication',
    hidden: true,
    title: 'Leadership & Communication',
    tagline: 'The soft skills that turn a senior engineer into an architect.',
    icon: '🗣️',
    topics: [
      {
        id: 'communication-leadership',
        title: 'Communication & Leadership',
        concepts: [
          c('Review Designs', 'core', 'high'),
          c('Mentor Developers', 'core', 'high'),
          c('Present Architecture', 'core', 'high'),
          c('Estimate Projects'),
          c('Handle Stakeholders', 'core', 'high'),
          c('Make Trade-offs', 'core', 'high'),
          c('Write ADRs', 'core', 'high'),
          c('Conduct Technical Interviews')
        ]
      }
    ]
  },
  {
    id: 'ai-engineering',
    title: 'AI Engineering',
    tagline: 'Applying AI/LLMs responsibly inside real Java applications.',
    icon: '🤖',
    topics: [
      {
        id: 'ai-for-software-engineering',
        title: 'AI for Software Engineering',
        concepts: [
          c('LLM Fundamentals', 'core', 'high'),
          c('Prompt Engineering', 'core', 'high'),
          c('AI Coding Assistants'),
          c('Retrieval-Augmented Generation (RAG)', 'core', 'high'),
          c('AI Agents', 'core', 'high'),
          c('Model Context Protocol (MCP)'),
          c('Vector Databases', 'core', 'high'),
          c('AI Integration in Java Applications', 'core', 'high'),
          c('Responsible AI and Security Considerations', 'core', 'high')
        ]
      }
    ]
  }
];

/** Categories shown anywhere on the site - hidden ones stay in this file for later. */
export const VISIBLE_CATEGORIES: Category[] = CATEGORIES.filter((category) => !category.hidden);

export function findCategory(categoryId: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === categoryId);
}

export function findTopic(categoryId: string, topicId: string) {
  return findCategory(categoryId)?.topics.find((topic) => topic.id === topicId);
}

export function findConcept(categoryId: string, topicId: string, conceptId: string) {
  return findTopic(categoryId, topicId)?.concepts.find((concept) => concept.id === conceptId);
}

/** Flattened, ordered list of every concept in a category, across all its topics. */
export function flattenCategoryConcepts(categoryId: string): { topicId: string; concept: ConceptSummary }[] {
  const category = findCategory(categoryId);
  if (!category) return [];
  return category.topics.flatMap((topic) => topic.concepts.map((concept) => ({ topicId: topic.id, concept })));
}
