import { ConceptContent } from '../../models/content.model';

export const HIBERNATE_SECOND_LEVEL_CACHE: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "hibernate-second-level-cache",
  title: "Hibernate Second-Level Cache",
  topicType: "framework",
  simpleIntuition: "The exact same lookup table of 50 countries gets queried from the database thousands of times a minute across thousands of unrelated requests, even though that data has not changed in months. Every one of those queries is a completely avoidable round trip.",
  formalMeaning: "The second level cache is shared across transactions and even across requests, so data that rarely changes can be read from memory instead of the database, over and over, for as long as it stays valid.",
  whyItExists: "Hibernate's built in first level cache (the persistence context) only lives for the duration of one transaction. The moment that transaction ends, its cached data is gone, and the very next request starts from zero, hitting the database again for data that has not changed at all.",
  howItWorksInternally: [
    "The first level cache (persistence context) is automatic, per transaction, and cannot be disabled. The second level cache is optional, configured explicitly, and shared across the whole application.",
    "Enabling it requires a caching provider like Ehcache, Caffeine, or Infinispan plugged in underneath Hibernate, since Hibernate itself does not implement the actual cache storage.",
    "@Cacheable on an entity opts that entity type into second level caching. A read that would normally hit the database instead first checks the shared cache, and only queries the database on a cache miss.",
    "A query cache (a separate, related feature) can cache the RESULT of a specific query, not just individual entities, which matters because caching entities alone does not automatically cache \"which rows matched this WHERE clause.\"",
    "Cache invalidation is the hard, genuinely tricky part. When an entity is updated anywhere, the cache entry for it must be evicted or refreshed, or every other request reading from the cache will keep seeing stale data.",
    "This is exactly why second level caching is best suited to data that changes rarely and can tolerate being slightly stale for a short window, like reference data, product catalogs, or configuration, and is a much riskier fit for data that must always be perfectly current, like account balances."
  ],
  diagrams: [
    {
      mermaid: "flowchart LR\n  Req1[\"Request 1\"] --> L1a[\"1st level cache\\n(this transaction only)\"]\n  Req2[\"Request 2\"] --> L1b[\"1st level cache\\n(this transaction only)\"]\n  L1a --> L2[\"2nd level cache\\n(shared across requests)\"]\n  L1b --> L2\n  L2 -->|\"miss\"| DB[(Database)]",
      caption: "The first level cache resets every transaction. The second level cache is what actually survives between requests."
    }
  ],
  mainComponents: [
    "The first level cache is like remembering something for the length of one phone call, useful only during that call. The second level cache is like a sticky note on the office fridge that everyone in the building can read, it survives long after any individual phone call ends, until someone updates or removes it."
  ],
  realWorldExamples: [
    "A product catalog service second level caching Category and Country lookup tables, cutting database load dramatically for data that changes maybe once a week through an admin panel.",
    "A subtle production bug where an entity is updated directly via a native SQL query, bypassing Hibernate entirely, and the second level cache never finds out, so every subsequent read through Hibernate keeps returning the old, now stale, cached value.",
    "Interview question: \"Why can't Hibernate's first level cache alone solve the repeated lookup table query problem?\" Because it only lives for one transaction, and a new transaction, a new request, starts with a completely empty first level cache."
  ],
  complexityAndTradeoffs: [
    "Before: Thousands of identical, avoidable database round trips per minute for data that barely ever changes.",
    "After: Most reads served from an in memory cache shared across the whole application, with the database only consulted on genuine cache misses.",
    "For genuinely static or slow changing lookup data, second level caching can eliminate the vast majority of database traffic for that data with a small, well scoped configuration change.",
    "Hibernate second level cache: use it when data read through JPA/Hibernate entities that changes rarely and can tolerate brief staleness, where you want caching integrated at the ORM layer. Avoid it when data updated through paths that bypass Hibernate, like native SQL or another service, where the cache would never learn about the change.",
    "Application level cache (Caffeine, Redis) used explicitly in service code: use it when you want full, explicit control over what gets cached, for how long, and want it to work identically regardless of how the underlying data was written. Avoid it when you want caching to be automatic and transparent to every JPA query without touching service code, which is exactly what the second level cache provides.",
    "No caching, always hit the database: use it when data that must always be perfectly current, like real time account balances or inventory counts in a high contention checkout flow. Avoid it when rarely changing reference data, where always hitting the database is pure, avoidable overhead."
  ],
  commonMistakes: [
    "Enabling second level caching on an entity that gets updated through a path Hibernate does not know about, like a native SQL UPDATE or a separate microservice writing to the same table. The cache has no way to know the underlying row changed if the update never went through Hibernate. Every request reading through the cache keeps returning the old value until the cache entry happens to expire or be evicted for an unrelated reason. Fix: Only cache entities whose writes always go through the same Hibernate session factory, or explicitly evict the relevant cache entries whenever an out of band update happens."
  ],
  interviewPerspective: "A common way this gets tested: \"A Country row is updated directly via a raw SQL UPDATE statement that bypasses Hibernate entirely. The entity is second level cached. What does the next request that reads that Country through Hibernate see?\" The old, stale cached value. Hibernate's second level cache only knows about changes made through Hibernate itself, so an out of band SQL update leaves the cache entry unaware that anything changed at all.",
  triggerSentence: "The first level cache forgets everything at the end of each transaction. The second level cache is what actually remembers across requests, and what actually needs careful invalidation."
};
