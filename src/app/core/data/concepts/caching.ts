import { ConceptContent } from '../../models/content.model';

export const CACHING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'caching',
  title: 'Caching',

  hook:
    'One popular product page gets hit ten thousand times a minute during a flash sale, and every single hit runs the exact ' +
    'same expensive database query, computing the exact same answer, over and over, thousands of times a minute, for data ' +
    'that has not changed since the last request one millisecond ago.',

  problem:
    'Recomputing or refetching the exact same answer repeatedly wastes real resources, database load, CPU time, network ' +
    'calls, on work that has already been done and whose result has not changed. Caching exists to remember an answer ' +
    'instead of redoing the work every time.',

  aha: {
    statement: 'A cache trades a small amount of memory for skipping repeated, expensive work, as long as you can tolerate the cached answer being briefly, acceptably stale.',
    analogy:
      'It is like a barista writing down a regular customer\'s usual order on a sticky note instead of asking them their whole order again every single time, right up until the customer actually changes their order, at which point the note needs updating or it becomes actively wrong advice.'
  },

  underTheHood: [
    'A cache is fundamentally a key value store sitting in front of a more expensive source of truth. A read first checks the cache; on a hit, it returns instantly; on a miss, it fetches from the real source, then usually stores the result in the cache for next time.',
    'Time to live (TTL) and eviction policies (LRU, LFU) determine how long an entry stays cached and what gets removed when the cache is full, controlling the trade off between staleness and hit rate.',
    'Spring\'s @Cacheable annotation wraps a method: calling it with the same arguments a second time returns the cached result instead of re-executing the method body, as long as the cache entry has not expired or been evicted.',
    '@CacheEvict and @CachePut exist specifically to solve the cache invalidation problem, explicitly removing or updating a cache entry the moment the underlying data changes, so stale data does not linger indefinitely.',
    'Caching can happen at multiple layers simultaneously: in process (Caffeine, simplest, but not shared across multiple application instances), distributed (Redis, shared across every instance of a horizontally scaled application), and HTTP level (CDN or browser caching of entire responses).',
    'Cache invalidation is famously one of the two hardest problems in computer science for a reason, a stale cache entry does not throw an error, it just quietly returns a WRONG answer that looks completely normal.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart LR\n' +
        '  Req["Request"] --> Cache{"In cache?"}\n' +
        '  Cache -->|"hit"| Fast["Return instantly"]\n' +
        '  Cache -->|"miss"| Source["Fetch from DB / compute"]\n' +
        '  Source --> Store["Store in cache"]\n' +
        '  Store --> Fast',
      caption: 'A cache hit skips the expensive path entirely. A miss pays the cost once, then stores the result for the next request.'
    }
  ],

  inTheWild: [
    'A product catalog service caching individual product lookups with a short TTL, absorbing a flash sale traffic spike without the database itself needing to scale up.',
    'A distributed Redis cache shared across a fleet of application instances, so a cache warmed by one instance\'s request immediately benefits every other instance too, unlike an in process cache which would need to warm up separately per instance.',
    'Interview question: "What are the two hardest problems in caching?" Cache invalidation (knowing when a cached value is no longer valid) and naming things, a famous joke that is only half a joke, because invalidation really is where most real caching bugs live.'
  ],

  showMe: {
    caption: 'A method recomputing an expensive result every call, versus the same method with caching applied.',
    bad: {
      language: 'java',
      code:
        'public Product getProduct(long id) {\n' +
        '    return productRepository.findById(id)\n' +
        '        .orElseThrow(); // hits the database every single call, even for the same id repeatedly\n' +
        '}',
      explanation:
        'A popular product id gets looked up thousands of times a minute, and every single one is a full database round trip for data that has not changed.'
    },
    good: {
      language: 'java',
      code:
        '@Cacheable(value = "products", key = "#id")\n' +
        'public Product getProduct(long id) {\n' +
        '    return productRepository.findById(id).orElseThrow();\n' +
        '}\n\n' +
        '@CacheEvict(value = "products", key = "#product.id")\n' +
        'public void updateProduct(Product product) {\n' +
        '    productRepository.save(product);\n' +
        '}',
      explanation:
        '@Cacheable stores the result keyed by id, avoiding the repeated database hit. @CacheEvict guarantees the cache never keeps serving a now stale value after an update.'
    }
  },

  impact: {
    before: 'Every request for the same data pays the full cost of a database query or expensive computation, even when nothing has changed.',
    after: 'Repeat requests for the same data are served instantly from memory, with the expensive path only paid once per cache expiration window.',
    metric: 'For read heavy, slow changing data, caching can eliminate the vast majority of repeated database load, which is often the difference between a service surviving a traffic spike and falling over.'
  },

  alternatives: [
    {
      name: 'In process cache (Caffeine)',
      whenToUse: 'A single instance application, or data where slight per instance inconsistency in a scaled out deployment is acceptable.',
      whenNotToUse: 'A horizontally scaled application needing every instance to see a consistent, shared cache state.'
    },
    {
      name: 'Distributed cache (Redis)',
      whenToUse: 'Multiple application instances needing to share the exact same cached state, or caching data too large to comfortably fit in one process\'s memory.',
      whenNotToUse: 'A single small application where the network hop to an external cache adds unnecessary latency and complexity.'
    },
    {
      name: 'No caching, always hit the source',
      whenToUse: 'Data that must always be perfectly current, or data accessed too rarely to justify the added complexity.',
      whenNotToUse: 'Frequently read, slow changing, or expensive to compute data, where always recomputing is pure waste.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Caching a method\'s result with @Cacheable but forgetting to add a matching @CacheEvict (or @CachePut) on the corresponding update method.',
      why:
        'The read path keeps returning the old, now stale, cached value forever, because nothing ever told the cache the underlying data changed. This bug is silent, there is no exception, just consistently wrong answers.',
      fix: 'Every method that changes data a cache depends on needs a matching eviction or update annotation, treated as a required pair, not an optional afterthought.'
    }
  ],

  proveIt: {
    question: 'A method is annotated @Cacheable. A separate method updates the same underlying data but has no @CacheEvict or @CachePut. What do callers of the cached method see after the update?',
    answer:
      'The old, stale cached value, until the cache entry naturally expires via TTL or is evicted for some other reason. The cache has no way to know the underlying data changed unless something explicitly tells it to.'
  },

  oneLiner: 'A cache is only as correct as its invalidation strategy, a fast wrong answer is worse than a slow right one.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-second-level-cache',
      title: 'Hibernate Second-Level Cache',
      note: 'The second level cache is Hibernate\'s specific, ORM integrated version of exactly this same general caching concept.'
    },
    {
      categoryId: 'system-design',
      topicId: 'system-design',
      conceptId: 'cache',
      title: 'Cache',
      note: 'This concept covers caching applied at the application level. The system design view of caching covers the broader architectural patterns for caching at scale.'
    }
  ]
};
