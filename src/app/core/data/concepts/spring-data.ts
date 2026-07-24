import { ConceptContent } from '../../models/content.model';

export const SPRING_DATA: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'spring-data',
  title: 'Spring Data',

  hook:
    'You write a single line, an interface with one method called findByEmailAndStatus, and it just works, generating a ' +
    'real SQL query, with zero implementation code anywhere. Nobody wrote that query. So who did?',

  problem:
    'Even with JPA simplifying object to database mapping, every application still needs a repository layer, save, ' +
    'find by id, find by various fields, delete, paginate, and hand writing that layer for every single entity is repetitive boilerplate.',

  aha: {
    statement: 'Spring Data generates a working repository implementation for you, purely from an interface definition, either by parsing the method name itself or from an annotated query.',
    analogy:
      'It is like giving a very literal assistant an instruction written in plain English, "find by email and status," and having them correctly translate it into the exact database query needed, every single time, without you ever writing the translation yourself.'
  },

  underTheHood: [
    'Extending JpaRepository<Order, Long> immediately gives you save(), findById(), findAll(), delete(), and more, all fully implemented, with zero code written by you.',
    'Query derivation: a method named findByStatusAndCustomerId(String status, Long customerId) is parsed by Spring Data at startup, and a real JPQL query, "WHERE o.status = ?1 AND o.customerId = ?2", is generated and compiled behind the scenes.',
    '@Query lets you write JPQL or native SQL explicitly, for queries too complex or unusual for name derivation to express cleanly, while keeping the same clean repository interface.',
    'Paging and sorting are built in: a method can accept a Pageable parameter and return a Page<Order>, and Spring Data generates the LIMIT/OFFSET and total count logic automatically.',
    'Under the hood, Spring creates a dynamic proxy implementing your interface at application startup, this is the SAME kind of proxy mechanism @Transactional uses, which is why calling a repository method from within the same class as another repository method still behaves correctly (repositories are always called from outside, through injection).',
    'Derived query methods have real limits: they get unwieldy past three or four conditions, at which point @Query or the Criteria API becomes clearer and easier to maintain.'
  ],

  inTheWild: [
    'A UserRepository interface with findByEmail(String email) returning Optional<User>, with zero implementation code, used constantly for login lookups.',
    'A findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(...) style method name that technically works but has become unreadable, a sign it is time to switch to an explicit @Query or a Specification.',
    'Interview question: "How does Spring Data know what query to run for findByEmailAndStatus?" It parses the method name at startup, recognizing "By", "And", field names matching the entity, and builds the equivalent JPQL automatically.'
  ],

  showMe: {
    caption: 'A hand written repository implementation versus the same behavior derived automatically by Spring Data.',
    bad: {
      language: 'java',
      code:
        'public class UserRepositoryImpl {\n' +
        '    @PersistenceContext private EntityManager em;\n\n' +
        '    public Optional<User> findByEmail(String email) {\n' +
        '        try {\n' +
        '            User user = em.createQuery(\n' +
        '                "SELECT u FROM User u WHERE u.email = :email", User.class)\n' +
        '                .setParameter("email", email)\n' +
        '                .getSingleResult();\n' +
        '            return Optional.of(user);\n' +
        '        } catch (NoResultException e) {\n' +
        '            return Optional.empty();\n' +
        '        }\n' +
        '    }\n' +
        '}',
      explanation:
        'This exact pattern, JPQL string, parameter binding, and manual NoResultException handling, would need to be rewritten for every single query on every single entity.'
    },
    good: {
      language: 'java',
      code:
        'public interface UserRepository extends JpaRepository<User, Long> {\n' +
        '    Optional<User> findByEmail(String email);\n' +
        '}',
      explanation:
        'Spring Data parses the method name and generates the equivalent query, parameter binding, and empty result handling automatically, with zero implementation code.'
    }
  },

  impact: {
    before: 'A hand written implementation class per entity, repeating the same query, parameter binding, and result handling patterns everywhere.',
    after: 'A plain interface with method signatures. The implementation, and the SQL, is generated automatically.',
    metric: 'For a typical application with dozens of entities and simple lookup queries, Spring Data eliminates the vast majority of repository boilerplate that would otherwise need to be hand written and maintained.'
  },

  alternatives: [
    {
      name: 'Spring Data derived query methods',
      whenToUse: 'Simple to moderately complex lookups expressible cleanly by name, up to a handful of conditions.',
      whenNotToUse: 'Queries with many optional filters or complex conditional logic, where method names become unreadable.'
    },
    {
      name: '@Query with JPQL or native SQL',
      whenToUse: 'Queries too complex, or too performance sensitive, for clean name derivation, while still returning managed entities.',
      whenNotToUse: 'Simple lookups where a derived method name is already perfectly clear.'
    },
    {
      name: 'Specification API / Criteria API / QueryDSL',
      whenToUse: 'Dynamic queries built up from an arbitrary, runtime determined combination of optional filters, like a search screen with many optional fields.',
      whenNotToUse: 'Fixed, known queries, where the added abstraction is unnecessary complexity.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Building a derived query method name with five or six chained conditions because it "still compiles and works."',
      why:
        'It genuinely does work, Spring Data will happily parse a very long method name, but past a certain length it becomes nearly unreadable and error prone to modify, and a small mistake in the name silently changes which query gets generated.',
      fix: 'Switch to an explicit @Query, or a Specification, once a derived method name stops being instantly readable at a glance.'
    }
  ],

  proveIt: {
    question: 'You define findByStatusOrderByCreatedAtDesc(String status) on a JpaRepository interface with no method body. What actually runs when you call it?',
    answer:
      'Spring Data parses the method name at application startup, recognizes the "findBy", "Status" field match, and "OrderByCreatedAtDesc" clause, and generates the equivalent JPQL query, then implements the method on a dynamic proxy automatically, all without you writing any query code.'
  },

  oneLiner: 'Spring Data turns a method name into a real query, so most repository code never has to be written by hand at all.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jpa',
      title: 'JPA',
      note: 'Spring Data repositories are a convenience layer built directly on top of the EntityManager and JPQL that JPA defines.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'bean-validation',
      title: 'Bean Validation',
      note: 'Validating an entity before it reaches a Spring Data save() call is what stops invalid data from ever being persisted in the first place.'
    }
  ]
};
