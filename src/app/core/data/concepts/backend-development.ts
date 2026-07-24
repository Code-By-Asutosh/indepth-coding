import { ConceptContent } from '../../models/content.model';

export const BACKEND_DEVELOPMENT: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'backend-development',
  title: 'Backend Development',

  hook:
    'A frontend button click travels through a router, a controller, a service layer, a repository, a database, and back, ' +
    'in under 200 milliseconds, and if any single one of those layers is designed sloppily, the whole chain becomes ' +
    'slow, fragile, or impossible to safely change six months later.',

  problem:
    'Every concept covered in this Enterprise Java topic, JDBC, connection pooling, JPA, transactions, caching, ' +
    'security, is a single piece. A real backend has to combine all of them into a coherent, layered system that ' +
    'is fast, correct, and can still be safely modified as requirements inevitably change.',

  aha: {
    statement: 'Backend development is not any single technology, it is the discipline of layering these pieces, data access, business logic, API surface, cross cutting concerns, so that each layer has one clear job and changes in one do not ripple uncontrollably into the others.',
    analogy:
      'It is like a well run kitchen during dinner service. The person taking orders, the person cooking, the person plating, and the person washing dishes each have one clear job. When one station gets backed up, it is immediately visible WHERE the problem is, instead of the whole kitchen dissolving into chaos with no idea what actually went wrong.'
  },

  underTheHood: [
    'A typical layered backend separates concerns cleanly: a controller layer (handling HTTP, request/response shape), a service layer (business logic, transaction boundaries), and a repository layer (data access), each depending only on the layer below it, never skipping levels or reaching sideways.',
    'Cross cutting concerns, logging, security, transactions, caching, validation, apply across many different parts of the application uniformly, and are best handled declaratively (annotations, AOP, filters) rather than being hand copied into every single method that needs them.',
    'Reliability under real load depends on the pieces working together correctly: a properly sized connection pool (HikariCP tuning) feeding correctly scoped transactions, which correctly interact with Hibernate\'s entity lifecycle, which is protected from the N+1 problem by deliberate fetch strategies. Getting any ONE of these wrong can undermine the others.',
    'Statelessness, not storing per user session state in the application\'s own memory, is what lets a backend service scale horizontally, adding more instances behind a load balancer, since any instance can then handle any request without needing to know about prior requests handled elsewhere.',
    'Observability, structured logging, metrics, tracing, is what turns a production incident from pure guesswork into an actual, evidence based investigation, and it needs to be designed in from the start, not bolted on after the first real outage.',
    'Backward compatible API evolution, versioning, careful field additions rather than breaking changes, is what lets a backend keep serving existing clients (mobile apps that cannot be instantly force-updated, other internal services) while still evolving underneath them.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart TB\n' +
        '  Client["Client"] --> Controller["Controller layer\\n(HTTP, request/response)"]\n' +
        '  Controller --> Service["Service layer\\n(business logic, @Transactional)"]\n' +
        '  Service --> Repo["Repository layer\\n(Spring Data, JPA)"]\n' +
        '  Repo --> DB[(Database)]\n' +
        '  Cross["Cross-cutting: logging, security,\\ncaching, validation"] -.-> Controller\n' +
        '  Cross -.-> Service\n' +
        '  Cross -.-> Repo',
      caption: 'A layered backend keeps each concern in its own layer, with cross-cutting concerns applied uniformly rather than duplicated everywhere.'
    }
  ],

  inTheWild: [
    'A well organized Spring Boot application where a controller never directly touches a repository, always going through a service layer that owns the transaction boundary and business rules.',
    'A production system that survived a traffic spike gracefully specifically because its connection pool, caching strategy, and query patterns had all been deliberately tuned together, rather than each piece being configured in isolation.',
    'Interview question: "What makes a backend system genuinely well designed, beyond just working?" It is well layered, each part has a single clear responsibility, it is stateless enough to scale horizontally, it is observable enough to debug quickly in production, and it can evolve without breaking existing clients.'
  ],

  showMe: {
    caption: 'A controller reaching directly into a repository versus one properly delegating through a service layer.',
    bad: {
      language: 'java',
      code:
        '@RestController\n' +
        'public class OrderController {\n' +
        '    @Autowired private OrderRepository orderRepository;\n\n' +
        '    @PostMapping("/orders")\n' +
        '    public Order createOrder(@RequestBody OrderRequest request) {\n' +
        '        Order order = new Order(request);\n' +
        '        return orderRepository.save(order); // business logic and transaction boundary both missing\n' +
        '    }\n' +
        '}',
      explanation:
        'Business rules (validation, inventory checks, pricing logic) have nowhere clear to live, and there is no explicit transaction boundary around what might soon become multiple related writes.'
    },
    good: {
      language: 'java',
      code:
        '@RestController\n' +
        'public class OrderController {\n' +
        '    private final OrderService orderService;\n' +
        '    @PostMapping("/orders")\n' +
        '    public Order createOrder(@Valid @RequestBody OrderRequest request) {\n' +
        '        return orderService.createOrder(request);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    @Transactional\n' +
        '    public Order createOrder(OrderRequest request) {\n' +
        '        // business rules, inventory checks, and the transaction boundary live here\n' +
        '        return orderRepository.save(new Order(request));\n' +
        '    }\n' +
        '}',
      explanation:
        'The controller only handles HTTP concerns, the service owns business logic and the transaction boundary, and each layer can now evolve independently without the others breaking.'
    }
  },

  impact: {
    before: 'Business logic scattered across controllers with no clear ownership, no explicit transaction boundaries, and no clean separation between HTTP handling and actual application behavior.',
    after: 'Each layer has one clear responsibility, changes in the data access layer do not ripple into the API surface, and vice versa.',
    metric: 'A well layered backend is measurably easier and safer to change over time, a new requirement typically touches one layer deliberately, instead of forcing a hunt through tangled logic spread across the entire codebase.'
  },

  alternatives: [
    {
      name: 'Layered architecture (controller / service / repository)',
      whenToUse: 'The default, sensible starting point for the large majority of backend applications.',
      whenNotToUse: 'Extremely simple CRUD services where a full layered structure might be more ceremony than the actual complexity warrants.'
    },
    {
      name: 'Hexagonal / Clean Architecture',
      whenToUse: 'Systems needing strong isolation of core business logic from specific frameworks or infrastructure choices, for long term flexibility and testability.',
      whenNotToUse: 'Small applications where the additional abstraction layers add more overhead than the benefit justifies.'
    },
    {
      name: 'Modular monolith or microservices decomposition',
      whenToUse: 'A growing system where distinct business domains genuinely benefit from independent deployment, scaling, or team ownership.',
      whenNotToUse: 'A young, small, or still rapidly evolving system, where the operational overhead of distribution outweighs its benefits before real scale is reached.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Treating each Enterprise Java concept, connection pooling, caching, transactions, security, as an isolated setting to configure once and forget, rather than as pieces that must work together coherently.',
      why:
        'A perfectly tuned connection pool cannot compensate for a transaction held open too long. A well designed cache is undermined by an entity update path that bypasses it entirely. These pieces interact, and optimizing one in isolation while ignoring the others often just moves the bottleneck somewhere else.',
      fix: 'Design and reason about the backend as one coherent system, understanding how connection pooling, transaction boundaries, caching, and data access patterns all affect each other under real, combined production load.'
    }
  ],

  proveIt: {
    question: 'Why is "backend development" itself worth thinking of as its own discipline, separate from the sum of its individual pieces like JDBC, JPA, or caching?',
    answer:
      'Because a real production backend\'s reliability depends on how these pieces interact under combined, real load, a correctly configured connection pool feeding correctly scoped transactions feeding a correctly designed caching strategy, not just on each individual piece being correct in isolation.'
  },

  oneLiner: 'Backend development is the art of making dozens of individually correct pieces behave as one coherent, reliable, changeable system.',

  connections: [
    {
      categoryId: 'software-design',
      topicId: 'design-patterns-clean-architecture',
      conceptId: 'clean-architecture',
      title: 'Clean Architecture',
      note: 'The layered separation discussed here is a practical, day to day instance of the broader architectural principles Clean Architecture formalizes.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'transactions',
      title: 'Transactions',
      note: 'Transaction boundaries are exactly where the service layer earns its keep, coordinating multiple data access operations into one coherent unit of work.'
    },
    {
      categoryId: 'observability',
      topicId: 'observability-monitoring',
      conceptId: 'sli-slo-sla',
      title: 'SLI / SLO / SLA',
      note: 'A well layered, observable backend is what actually makes it possible to define and meaningfully measure service level objectives in the first place.'
    }
  ]
};
