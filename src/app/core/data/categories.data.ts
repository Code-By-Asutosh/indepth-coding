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
    id: 'middleware',
    title: 'Middleware',
    tagline: 'Java Core, Enterprise Java, Spring, API design & microservices.',
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
      },
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
      },
      {
        id: 'spring-ecosystem',
        title: 'Spring Ecosystem',
        concepts: [
          c('Spring Core: BeanFactory vs ApplicationContext', 'core', 'high'),
          c('Spring Core: Bean Lifecycle', 'core', 'high'),
          c('Spring Boot: Auto-Configuration Internals', 'core', 'high'),
          c('Spring Boot: Actuator'),
          c('Spring Boot: Profiles'),
          c('Spring Boot: Custom Starters'),
          c('Spring MVC', 'core', 'high'),
          c('Spring Security', 'core', 'high'),
          c('Spring Data'),
          c('Spring Cloud'),
          c('Spring Batch'),
          c('Spring Integration', 'optional', 'low'),
          c('Spring AOP', 'core', 'high'),
          c('Spring WebFlux'),
          c('Spring Testing'),
          c('Spring Native / GraalVM', 'optional', 'low'),
          c('Spring AI', 'optional', 'low')
        ]
      },
      {
        id: 'api-design',
        title: 'API Design',
        concepts: [
          c('REST', 'core', 'high'),
          c('GraphQL'),
          c('gRPC'),
          c('API Versioning', 'core', 'high'),
          c('OpenAPI'),
          c('Swagger'),
          c('Pagination', 'core', 'high'),
          c('Filtering'),
          c('HATEOAS', 'optional', 'low'),
          c('Rate Limiting', 'core', 'high'),
          c('Authentication', 'core', 'high'),
          c('Authorization', 'core', 'high'),
          c('API Gateway', 'core', 'high'),
          c('Idempotency', 'core', 'high'),
          c('Error Handling', 'core', 'high'),
          c('Webhooks'),
          c('SSE (Server-Sent Events) / Long Polling'),
          c('CORS', 'core', 'high'),
          c('API-First / Design-First Workflow')
        ]
      },
      {
        id: 'microservices-architecture',
        title: 'Microservices Architecture',
        concepts: [
          c('Service Discovery', 'core', 'high'),
          c('Eureka'),
          c('Config Server'),
          c('API Gateway', 'core', 'high'),
          c('Circuit Breaker', 'core', 'high'),
          c('Resilience4j', 'core', 'high'),
          c('Distributed Transactions', 'core', 'high'),
          c('Saga', 'core', 'high'),
          c('CQRS', 'core', 'high'),
          c('Event Sourcing', 'core', 'high'),
          c('Service Mesh'),
          c('Observability'),
          c('Distributed Tracing'),
          c('Strangler Fig Pattern'),
          c('Anti-Corruption Layer'),
          c('Bulkhead Pattern'),
          c('Sidecar Pattern'),
          c('Outbox Pattern', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'frontend',
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
          c('PWA', 'optional', 'low'),
          c('Change Detection (Zone.js, OnPush)', 'core', 'high'),
          c('Directives'),
          c('Pipes'),
          c('Component Communication (@Input/@Output)', 'core', 'high'),
          c('Standalone Components', 'core', 'high'),
          c('Micro-Frontends / Module Federation', 'optional', 'low')
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
          c('Interfaces vs Types', 'core', 'high'),
          c('Modules & Namespaces')
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
          c('SQL Server', 'optional', 'low'),
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
          c('Views'),
          c('Stored Procedures'),
          c('Triggers'),
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
          c('Graph Databases (Neo4j)', 'optional', 'low'),
          c('CAP Theorem', 'core', 'high'),
          c('Consistency', 'core', 'high'),
          c('Partitioning'),
          c('TTL'),
          c('Document Database'),
          c('Key Value'),
          c('Search Engine'),
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
          c('Route53'),
          c('ELB', 'core', 'high'),
          c('Auto Scaling', 'core', 'high'),
          c('API Gateway'),
          c('Secrets Manager'),
          c('SQS', 'core', 'high'),
          c('SNS', 'core', 'high'),
          c('EventBridge'),
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
          c('GitHub', 'core', 'high'),
          c('CI/CD', 'core', 'high'),
          c('Jenkins'),
          c('GitHub Actions', 'core', 'high'),
          c('SonarQube'),
          c('Nexus'),
          c('Maven', 'core', 'high'),
          c('Gradle', 'core', 'high'),
          c('GitOps'),
          c('ArgoCD'),
          c('Blue-Green / Canary Deployments', 'core', 'high'),
          c('Feature Flags', 'core', 'high')
        ]
      },
      {
        id: 'build-tools-version-control',
        title: 'Build Tools & Version Control',
        concepts: [
          c('Maven Lifecycle', 'core', 'high'),
          c('Gradle Build Scripts'),
          c('Dependency Management', 'core', 'high'),
          c('BOM (Bill of Materials)'),
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
          c('Multi-Stage Builds'),
          c('Service Mesh (Istio)', 'optional', 'low'),
          c('CRDs / Operators', 'optional', 'low')
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
          c('ActiveMQ', 'optional', 'low'),
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
          c('SOLID', 'core', 'high'),
          c('GOF Patterns: Creational', 'core', 'high'),
          c('GOF Patterns: Structural', 'core', 'high'),
          c('GOF Patterns: Behavioral', 'core', 'high'),
          c('DDD', 'core', 'high'),
          c('Clean Architecture', 'core', 'high'),
          c('Hexagonal Architecture', 'core', 'high'),
          c('Onion Architecture'),
          c('Vertical Slice Architecture'),
          c('Repository Pattern', 'core', 'high'),
          c('Specification Pattern', 'optional', 'low'),
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
          c('Search System'),
          c('Logging'),
          c('Monitoring'),
          c('Security'),
          c('Back-of-Envelope Estimation / Capacity Planning', 'core', 'high'),
          c('Consensus Algorithms (Raft, Paxos)', 'optional', 'low'),
          c('Distributed Locks', 'core', 'high'),
          c('Leader Election', 'core', 'high')
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
          c('SSL'),
          c('TLS', 'core', 'high'),
          c('HTTPS', 'core', 'high'),
          c('CSRF', 'core', 'high'),
          c('XSS', 'core', 'high'),
          c('SQL Injection', 'core', 'high'),
          c('Encryption', 'core', 'high'),
          c('Hashing', 'core', 'high'),
          c('Secrets Management'),
          c('mTLS', 'optional', 'low'),
          c('Zero Trust Architecture', 'optional', 'low'),
          c('Security Headers'),
          c('Rate Limiting / DDoS Mitigation')
        ]
      }
    ]
  },
  {
    id: 'testing',
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
          c('Load Testing'),
          c('Contract Testing'),
          c('WireMock'),
          c('TDD', 'core', 'high'),
          c('BDD (Cucumber)', 'optional', 'low'),
          c('JaCoCo (Coverage)'),
          c('Mutation Testing', 'optional', 'low'),
          c('Test Pyramid', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'observability',
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
          c('Jaeger'),
          c('Zipkin'),
          c('Micrometer'),
          c('Distributed Logging'),
          c('SLI / SLO / SLA', 'core', 'high'),
          c('APM Tools (Datadog, New Relic, AppDynamics)'),
          c('Chaos Engineering', 'optional', 'low')
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
          c('HTTP/3'),
          c('DNS', 'core', 'high'),
          c('Load Balancer'),
          c('Reverse Proxy', 'core', 'high'),
          c('VPN'),
          c('NAT'),
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
          c('Bash'),
          c('Shell Scripting'),
          c('Cron'),
          c('systemd'),
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
        id: 'enterprise-architecture',
        title: 'Enterprise Architecture',
        concepts: [
          c('Monolith', 'core', 'high'),
          c('Modular Monolith', 'core', 'high'),
          c('Microservices', 'core', 'high'),
          c('Event Driven Architecture', 'core', 'high'),
          c('SOA'),
          c('CQRS'),
          c('DDD Deep Dive: Bounded Context', 'core', 'high'),
          c('DDD Deep Dive: Aggregates', 'core', 'high'),
          c('DDD Deep Dive: Value Objects'),
          c('DDD Deep Dive: Ubiquitous Language'),
          c('BFF', 'core', 'high'),
          c('API First'),
          c('Twelve-Factor App', 'core', 'high'),
          c('Cloud Native'),
          c('Multi-Tenant Architecture'),
          c('C4 Model (Architecture Diagramming)', 'core', 'high')
        ]
      },
      {
        id: 'software-engineering-practices',
        title: 'Software Engineering Practices',
        concepts: [
          c('Clean Code', 'core', 'high'),
          c('Refactoring', 'core', 'high'),
          c('Code Reviews', 'core', 'high'),
          c('Coding Standards'),
          c('Documentation'),
          c('Agile'),
          c('Scrum'),
          c('Estimation'),
          c('Technical Debt', 'core', 'high'),
          c('Postmortems / Incident Management', 'core', 'high'),
          c('RFC Process for Design Proposals')
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
          c('Trees', 'core', 'high'),
          c('Graphs', 'core', 'high'),
          c('Dynamic Programming', 'core', 'high'),
          c('Greedy', 'core', 'high'),
          c('Backtracking', 'core', 'high'),
          c('Trie'),
          c('Heap', 'core', 'high'),
          c('Sliding Window', 'core', 'high')
        ]
      }
    ]
  },
  {
    id: 'leadership-communication',
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
