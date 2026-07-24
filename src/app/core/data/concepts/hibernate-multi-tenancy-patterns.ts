import { ConceptContent } from '../../models/content.model';

export const HIBERNATE_MULTI_TENANCY_PATTERNS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'hibernate-multi-tenancy-patterns',
  title: 'Hibernate Multi-Tenancy Patterns',

  hook:
    'One buggy query accidentally omits a WHERE clause and, for a split second, one customer sees another customer\'s ' +
    'invoices. In a multi tenant SaaS product, that is not a small bug, it is the whole business\'s trust broken in a single request.',

  problem:
    'A single application instance often serves many different customers, tenants, from one codebase. If tenant ' +
    'isolation depends entirely on every developer remembering to add "WHERE tenant_id = ?" to every single query, ' +
    'forever, it is only a matter of time before someone forgets, and forgetting means a data leak between customers.',

  aha: {
    statement: 'Multi tenancy is a decision about WHERE tenant data physically lives, separate databases, separate schemas, or one shared table with a tenant column, and Hibernate can enforce that isolation structurally instead of relying on every query remembering to filter correctly.',
    analogy:
      'It is like choosing between giving each tenant their own locked office (separate database), their own locked drawer in a shared office (separate schema), or just a labeled folder in one shared filing cabinet (shared table with a tenant column). Each is more or less isolated, and more or less expensive to run.'
  },

  underTheHood: [
    'Database per tenant: each tenant gets a fully separate database. The strongest isolation, since there is no shared table a bug could accidentally query across, but the most operational overhead, since migrations and backups now happen per tenant, potentially across thousands of databases.',
    'Schema per tenant: one database, but each tenant gets its own schema (namespace) inside it. Strong isolation with less operational overhead than fully separate databases, since connections can be pooled at the database level.',
    'Shared table with a discriminator column: every tenant\'s rows live in the same tables, distinguished by a tenant_id column. Cheapest to run and easiest to migrate, but isolation now depends entirely on every query correctly filtering by tenant_id.',
    'Hibernate has built in support for the first two strategies via MultiTenantConnectionProvider (choosing which physical database or schema to connect to based on the current tenant) and CurrentTenantIdentifierResolver (determining which tenant the current request belongs to, usually from a request header, subdomain, or authenticated user).',
    'For the shared table approach, Hibernate filters (@FilterDef and @Filter) can be applied automatically to every query for a given entity, injecting the tenant_id condition centrally rather than trusting every hand written query to remember it.',
    'The tenant identifier itself typically needs to be resolved as early as possible in the request lifecycle, often in a filter or interceptor, and stored somewhere thread local or request scoped so it is available wherever Hibernate needs to check it during that request.'
  ],

  inTheWild: [
    'A B2B SaaS product using schema per tenant so that a large enterprise customer\'s data can be backed up, restored, or even migrated to a dedicated database later without touching any other customer\'s data.',
    'A smaller, cost sensitive SaaS product using a shared table with tenant_id, relying on a Hibernate filter applied globally so individual developers cannot accidentally forget the tenant condition in a new query.',
    'Interview question: "What is the main trade off between schema per tenant and a shared table with a tenant column?" Schema per tenant gives stronger structural isolation at higher operational cost. A shared table is cheaper and simpler to run but pushes isolation correctness onto application code and query discipline.'
  ],

  showMe: {
    caption: 'Isolation depending on every developer remembering a WHERE clause, versus a Hibernate filter enforcing it centrally.',
    bad: {
      language: 'java',
      code:
        '// Every repository method must remember to add this condition, everywhere, forever.\n' +
        '@Query("SELECT i FROM Invoice i WHERE i.tenantId = :tenantId")\n' +
        'List<Invoice> findAllForTenant(@Param("tenantId") String tenantId);\n' +
        '// One missed method, one missed query, and tenant isolation is silently broken.',
      explanation:
        'Isolation here depends entirely on human discipline across every current and future query on this entity, with no structural safety net if someone forgets.'
    },
    good: {
      language: 'java',
      code:
        '@Entity\n' +
        '@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = "string"))\n' +
        '@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")\n' +
        'public class Invoice { /* ... */ }\n\n' +
        '// Enabled once per session, applied to EVERY query on this entity automatically:\n' +
        'session.enableFilter("tenantFilter").setParameter("tenantId", currentTenantId());',
      explanation:
        'The tenant condition is applied centrally, to every query Hibernate generates for this entity, so a developer writing a new query cannot accidentally forget it.'
    }
  },

  impact: {
    before: 'Tenant isolation depends on every developer remembering to filter by tenant in every single query, forever.',
    after: 'Tenant isolation is enforced structurally, centrally, and cannot be silently forgotten in a new query.',
    metric: 'A cross tenant data leak in a multi tenant SaaS product is a severe trust and often legal incident, not just a bug, which is exactly why structural enforcement is worth the setup cost.'
  },

  alternatives: [
    {
      name: 'Database per tenant',
      whenToUse: 'Large enterprise customers needing strong isolation guarantees, or regulatory requirements demanding physically separate data storage.',
      whenNotToUse: 'A large number of small tenants, where per tenant database overhead becomes an operational and cost burden.'
    },
    {
      name: 'Schema per tenant',
      whenToUse: 'A middle ground, meaningful isolation with shared database infrastructure and connection pooling.',
      whenNotToUse: 'An extremely large number of tenants where even schema count becomes unwieldy to manage and migrate.'
    },
    {
      name: 'Shared table with tenant column plus enforced filters',
      whenToUse: 'Very large numbers of small tenants where per tenant infrastructure would be prohibitively expensive.',
      whenNotToUse: 'Tenants requiring the strongest possible isolation guarantees, like regulated industries with strict data separation requirements.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Relying entirely on developers remembering to add a tenant_id WHERE clause to every hand written query in a shared table multi tenant system, with no centrally enforced filter.',
      why:
        'It works perfectly in every query someone remembers to write correctly, which is most of the time, right up until one query, often a newly added report or an ad hoc admin tool, forgets, and quietly exposes cross tenant data with no error at all.',
      fix: 'Enforce the tenant condition centrally with a Hibernate filter, a database level row security policy, or a query interceptor, so isolation does not depend on every individual query being written correctly.'
    }
  ],

  proveIt: {
    question: 'In a shared table, tenant_id column design, what is the single biggest structural risk compared to schema per tenant or database per tenant?',
    answer:
      'Isolation depends entirely on application code correctly filtering by tenant_id on every query, with no structural database level boundary preventing a query from accidentally reading another tenant\'s rows if that filter is ever missed.'
  },

  oneLiner: 'Multi tenancy is a decision about how strongly isolation is enforced, by physical separation, by schema, or by hoping every query remembers a WHERE clause.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jpa',
      title: 'JPA',
      note: 'Multi tenancy strategies are implemented as extensions to the same JPA and Hibernate session mechanisms that handle every other query.'
    },
    {
      categoryId: 'system-design',
      topicId: 'security-engineering',
      conceptId: 'owasp-top-10',
      title: 'OWASP Top 10',
      note: 'A cross tenant data leak is a real world instance of broken access control, one of the most common and serious entries in the OWASP Top 10.'
    }
  ]
};
