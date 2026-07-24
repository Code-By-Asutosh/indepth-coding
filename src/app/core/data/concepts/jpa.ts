import { ConceptContent } from '../../models/content.model';

export const JPA: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'jpa',
  title: 'JPA',

  hook:
    'You call orderRepository.save(order) and never write a single line of SQL, yet an INSERT statement genuinely runs ' +
    'against your database. Somewhere between your method call and the database, Java objects turned into SQL. What is actually in between?',

  problem:
    'Writing raw JDBC for every entity in a real application means hand writing repetitive INSERT, UPDATE, SELECT ' +
    'statements and manually copying ResultSet columns into object fields, for every single table, over and over. JPA ' +
    'exists to describe that mapping once, declaratively, and let a provider generate the repetitive SQL for you.',

  aha: {
    statement:
      'JPA is a specification, a set of interfaces and annotations, describing how Java objects map to database tables. Hibernate is the most common actual implementation of that specification.',
    analogy:
      'JPA is like an electrical socket standard. It defines the shape of the plug and what voltage to expect, but does not build your specific appliance. Hibernate, EclipseLink, and other providers are the actual appliances that plug into that standard shape.'
  },

  underTheHood: [
    '@Entity marks a class as mapped to a database table, @Id marks its primary key field, and @Column optionally customizes how a field maps to a column name or constraint.',
    'The EntityManager (JPA\'s core API) is the object that actually talks to the persistence provider. Calling entityManager.persist(order) schedules an INSERT, and entityManager.find(Order.class, id) triggers a SELECT, translating your object graph to and from SQL.',
    'JPA tracks entities in a persistence context (roughly, a first level cache scoped to one unit of work). Changes to a managed entity\'s fields are automatically detected, this is called dirty checking, and turned into an UPDATE when the transaction commits, without you calling save() again.',
    'Relationships between entities (@OneToMany, @ManyToOne, @ManyToMany) map foreign keys and join tables to object references and collections, letting you navigate order.getItems() instead of writing a join query by hand.',
    'JPQL (Java Persistence Query Language) lets you write queries against your ENTITY model ("SELECT o FROM Order o WHERE o.status = :status") rather than raw table and column names, and the provider translates it to real SQL for whichever database is configured.',
    'In a typical Spring Boot application, you rarely touch EntityManager directly. Spring Data JPA repositories wrap it, generating implementations of interfaces like OrderRepository automatically from method names or annotated queries.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart LR\n' +
        '  App["Your Code"] --> Repo["Repository / EntityManager"]\n' +
        '  Repo --> PC["Persistence Context\\n(tracked entities, dirty checking)"]\n' +
        '  PC --> Provider["JPA Provider (Hibernate)"]\n' +
        '  Provider --> SQL["Generated SQL"]\n' +
        '  SQL --> DB[(Database)]',
      caption: 'JPA sits between your object model and generated SQL, with the persistence context tracking what has changed.'
    }
  ],

  inTheWild: [
    'A Spring Boot application defining a plain interface, OrderRepository extends JpaRepository<Order, Long>, and getting a full set of CRUD methods with zero hand written implementation.',
    'Modifying a managed entity\'s field inside a @Transactional method and seeing the change persisted automatically at commit time, with no explicit save() call, because of dirty checking.',
    'Interview question: "What is the difference between JPA and Hibernate?" JPA is the specification (interfaces and rules), Hibernate is one specific, very popular implementation of it. You could, in theory, swap providers without changing your entity annotations.'
  ],

  showMe: {
    caption: 'Hand written JDBC mapping versus a JPA entity doing the same job declaratively.',
    bad: {
      language: 'java',
      code:
        'public Order findOrder(long id) throws SQLException {\n' +
        '    String sql = "SELECT id, total, status FROM orders WHERE id = ?";\n' +
        '    try (PreparedStatement stmt = connection.prepareStatement(sql)) {\n' +
        '        stmt.setLong(1, id);\n' +
        '        try (ResultSet rs = stmt.executeQuery()) {\n' +
        '            if (rs.next()) {\n' +
        '                Order order = new Order();\n' +
        '                order.setId(rs.getLong("id"));\n' +
        '                order.setTotal(rs.getBigDecimal("total"));\n' +
        '                order.setStatus(rs.getString("status"));\n' +
        '                return order;\n' +
        '            }\n' +
        '        }\n' +
        '    }\n' +
        '    return null;\n' +
        '}',
      explanation:
        'This exact same hand written mapping code has to be repeated, with small variations, for every single entity and every single query in the application.'
    },
    good: {
      language: 'java',
      code:
        '@Entity\n' +
        'public class Order {\n' +
        '    @Id @GeneratedValue private Long id;\n' +
        '    private BigDecimal total;\n' +
        '    private String status;\n' +
        '    // getters and setters\n' +
        '}\n\n' +
        'public interface OrderRepository extends JpaRepository<Order, Long> {}\n\n' +
        '// Usage:\n' +
        'Order order = orderRepository.findById(id).orElseThrow();',
      explanation:
        'The mapping is declared once, as annotations on the class, and the provider generates the SQL, the ResultSet reading, and the object construction automatically for every query.'
    }
  },

  impact: {
    before: 'Hand written mapping code repeated for every entity and every query, a real maintenance burden as the schema evolves.',
    after: 'The mapping is declared once. Standard CRUD and simple queries need zero hand written SQL or ResultSet code.',
    metric: 'Teams adopting JPA over raw JDBC commonly report dramatically less boilerplate per entity, at the cost of needing to genuinely understand what the provider is generating underneath, which is exactly why concepts like the N+1 Problem matter.'
  },

  alternatives: [
    {
      name: 'JPA / Hibernate',
      whenToUse: 'The default choice for most applications with a real object model and evolving schema, where developer productivity on CRUD and relationships matters.',
      whenNotToUse: 'Extremely performance sensitive read paths where hand tuned SQL and a lightweight mapper give more predictable query plans.'
    },
    {
      name: 'MyBatis / jOOQ',
      whenToUse: 'You want to write real SQL yourself but still get typed results mapped to objects, without an ORM\'s automatic dirty checking and lazy loading behavior.',
      whenNotToUse: 'You want relationships and entity state managed for you automatically, which is exactly what a full ORM provides.'
    },
    {
      name: 'Raw JDBC',
      whenToUse: 'Very simple applications, libraries, or migration tools with a handful of queries total.',
      whenNotToUse: 'A real application with a meaningful, evolving domain model.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Treating JPA entities like plain data objects and being surprised when modifying a field outside a transaction does nothing, or modifying it inside one silently triggers an UPDATE you did not expect.',
      why:
        'A JPA entity is only "just data" when it is detached. While it is managed, inside an active persistence context, every field change is tracked and will be written to the database at commit time, whether or not you explicitly called save().',
      fix: 'Understand entity lifecycle states (see Hibernate Entity Lifecycle) so you know exactly when a change to an object will, or will not, reach the database.'
    }
  ],

  proveIt: {
    question: 'Inside a @Transactional method, you load an Order, change its status field, and never call save() or update(). Does the change reach the database?',
    answer:
      'Yes, assuming the Order is currently managed by the persistence context. JPA\'s dirty checking detects the field change and issues an UPDATE automatically when the transaction commits, with no explicit save call required.'
  },

  oneLiner: 'JPA is the standard, Hibernate is one very good implementation of it, and dirty checking is the reason your saved changes sometimes need no explicit save call at all.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jdbc',
      title: 'JDBC',
      note: 'Every query JPA runs eventually becomes a real JDBC call underneath, JPA just generates that JDBC code for you.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-entity-lifecycle',
      title: 'Hibernate Entity Lifecycle',
      note: 'Understanding transient, managed, and detached states explains exactly when dirty checking applies and when it does not.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-n-1-problem',
      title: 'The N+1 Problem',
      note: 'JPA\'s convenience of navigating relationships as plain object references is exactly what makes the N+1 Problem so easy to accidentally trigger.'
    }
  ]
};
