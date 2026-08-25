import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> LinkedHashMap LRU, TreeMap & PriorityQueue.
 * The ordered structures: access-order LinkedHashMap as a 15-line LRU cache,
 * TreeMap's range powers, and the heap behind PriorityQueue - plus the
 * iteration-order trap that catches out most candidates.
 */
export const MAP_FAMILY_EXTRAS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'linkedhashmap-lru-treemap-priorityqueue',
  title: 'LinkedHashMap LRU, TreeMap & PriorityQueue',
  topicType: 'data-structure',

  simpleIntuition:
    'Three more ShopSphere problems, three different "orders" to respect. Product images must be cached but memory is finite - evict the LEAST RECENTLY USED, which means remembering access order, not insertion order. The analytics page needs "all products priced between ₹500 and ₹1,000" answered instantly - that is not lookup, that is RANGE. And customer support wants the angriest ticket served first regardless of arrival - priority beats sequence. Three problems, three structures built for exactly one shape of order each: LinkedHashMap remembers history, TreeMap keeps things sorted live, PriorityQueue always hands you the next-most-important.',

  formalMeaning:
    'LinkedHashMap extends HashMap by threading every entry into a doubly-linked list recording order: insertion-order by default, or ACCESS-order when constructed with accessOrder=true - in which case each get/compute re-links the touched entry to the tail, and overriding removeEldestEntry turns the class into an LRU cache in a few lines. TreeMap implements NavigableMap over a red-black tree (a self-balancing BST), keeping keys sorted by Comparable/Comparator with O(log n) operations and range navigation methods (ceilingKey, floorKey, headMap, subMap). PriorityQueue implements a binary min-heap inside a plain array: peek is O(1) at the least element per comparator, offer/poll are O(log n) sift operations - iteration is NOT sorted, only retrieval order is.',

  whyItExists:
    'HashMap answers "where is this?" brilliantly but is amnesiac about everything else. Real systems constantly need one more memory dimension: recency (caches evicting cold entries), position-in-sequence (sorted data windows), or importance (work scheduling). Building these atop plain maps means re-sorting on every read - O(n log n) repeatedly for what maintained-order structures deliver incrementally. Each structure exists because its ordering question is FREQUENT enough to deserve dedicated machinery: LRU caching appears in literally every serious backend; range queries power dashboards and filters; priority queues drive schedulers, retries-with-backoff, Dijkstra, and top-K analytics. Knowing which order-question maps to which structure is systems vocabulary, not trivia.',

  howItWorksInternally: [
    'LinkedHashMap\'s extra wiring: each Node inherits HashMap\'s hash/key/value/next PLUS before/after pointers. Every insertion appends to the chain; with accessOrder=true every READ also moves that node to the chain tail - afterHead.after... the head of the chain is always the least recently accessed entry. All of this rides free on top of normal HashMap bucket mechanics.',
    'The LRU recipe: extend LinkedHashMap<K,V> with accessOrder=true, override removeEldestEntry to return size() > maxEntries - done. Java even ships the modern alternative: LinkedHashMap.removeEldestEntry semantics inside caches, or Guava CacheBuilder/Caffeine for production (mentioning those earns maturity points - hand-rolled LRU is interview currency, production code uses battle-tested libraries with TTLs and eviction stats).',
    'TreeMap mechanics: standard BST invariant - smaller keys left, larger right - with red-black rebalancing (rotations + color flips) guaranteeing height stays O(log n) so worst cases never degrade to linked-list scans. Finding ceilingKey(x): descend once, tracking the last node where the path turned "x was smaller". Every Navigable method is a guided descent.',
    'PriorityQueue mechanics: array-backed complete binary tree - children of index i live at 2i+1 and 2i+2. Offer appends then sifts UP while parent-comparison fails; poll removes root, moves last element to root, sifts DOWN. Both walks cost tree-height time: O(log n). The root is ALWAYS the extremum - that is the entire contract.',
    'THE ITERATION TRAP (most-missed question): iterating a PriorityQueue yields ARRAY storage order, not sorted order. Sorted output requires repeated polling. If asked "print elements in priority order", the answer is a poll-loop, never a for-each.',
    'Default ordering: natural ascending - so PriorityQueue<Integer> is a MIN-heap (smallest first). Max-heap? Pass Comparator.reverseOrder(). This asymmetry surprises everyone exactly once.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    G["get(cold-item)"] --> AO{"accessOrder=true?"}\n    AO -->|yes| REL["unlink node from chain,<br/>re-link at TAIL<br/>= most recently used"]\n    PUT["put(newItem)"] --> FULL{"size > max?"}\n    FULL -->|yes| EV["removeEldestEntry fires:<br/>evict chain HEAD<br/>= least recently used"]\n    FULL -->|no| APP["append at tail"]\n    subgraph Chain["the invisible order-chain"]\n    direction LR\n    H["HEAD<br/>LRU victim"] --- M["middle"] --- T["TAIL<br/>just touched"]\n    end',
      caption: 'LRU in one image: reads push to the tail, overflow evicts from the head - history management via pointers.'
    },
    {
      mermaid: 'flowchart TD\n    A["array: [4, 9, 6, 14, 12, 8]"] --> T["as complete binary tree:<br/>4 root; 9,6 children; ..."]\n    P["poll()"] --> R["return root 4 (min)"]\n    R --> F["move last to root, sift down<br/>children swap until order holds"]\n    I["for-each iteration"] --> W["walks the ARRAY:<br/>4, 9, 6, 14, 12, 8<br/>NOT sorted - classic trap!"]',
      caption: 'PriorityQueue: a hidden tree inside an array; only poll/peek honor priority, iteration does not.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a parking valet stand: LinkedHashMap(accessOrder) arranges cars by last-driven - newest trip at the entrance, and when the stand overflows, the car untouched longest gets the boot (LRU). TreeMap is a continuously-sorted display shelf by price - any price-window is visible instantly without rescanning. PriorityQueue is the hospital triage nurse: patients queue by severity, not arrival - and she only ever hands you the CURRENT most urgent (poll), not a sorted list.',
    'removeEldestEntry(eldest) - the single override point; eldest is the chain head candidate BEFORE insertion completes. Return true to authorize eviction.',
    'NavigableMap toolkit: ceilingKey/floorKey (nearest >= / <=), higher/lowerKey (strict), firstKey/lastKey, pollFirstEntry/pollLastEntry, headMap/tailMap/subMap views, descendingMap - the whole "range questions on sorted data" arsenal.',
    'Comparator composition for Tree structures: Comparator.comparing(Product::getPrice).thenComparing(Product::getName) - chained comparators are the idiomatic answer whenever "sort by X then Y" appears.',
    'When heaps meet streams: top-K pattern - maintain a K-sized min-heap scanning N items: O(N log K) instead of full sort O(N log N). Volunteering this in interviews links collections to algorithm rounds nicely.'
  ],

  realWorldExamples: [
    'ShopSphere product-image cache: LinkedHashMap<String, Bitmap>(16, 0.75f, true) capped at N entries - hot product pages stay snappy within fixed memory.',
    'Price-filter dashboard backed by TreeMap<BigDecimal, List<Product>> - slider queries become subMap(from, to) calls, no full scans.',
    'Retry scheduler: PriorityQueue<RetryTask> ordered by nextAttemptAt - the scheduler polls whichever task is due soonest; RabbitMQ/Kafka retry logic conceptually identical.',
    'Interview reality: "Design an LRU cache" is among the TOP-3 hand-code prompts across service and product companies; LinkedHashMap answers it in minutes while proving you understand access-order mechanics underneath.'
  ],

  complexityAndTradeoffs: [
    'LinkedHashMap: all HashMap costs plus two pointer writes per structural change and two extra references per entry - trivial memory tax for guaranteed iteration order or LRU behavior.',
    'TreeMap: guaranteed O(log n) put/get/remove - WORSE than HashMap average but immune to pathological hash distributions; wins outright when sorted iteration/range queries dominate.',
    'PriorityQueue: offer/poll O(log n), peek O(1), contains/remove-arbitrary O(n) (linear search through the array) - it is a retrieval-of-extremum machine, nothing else.',
    'Memory: TreeMap nodes heaviest (color + two children + key/value); PQ is the leanest - a bare array, no per-element wrappers.',
    'Choose by order-question: remember-recency → LinkedHashMap(accessOrder); query-ranges → TreeMap; serve-by-importance → PriorityQueue; none of these → stay with plain HashMap.'
  ],

  commonMistakes: [
    'Iterating a PriorityQueue expecting sorted output. Looks harmless in tiny tests where array layout can accidentally resemble order. Hurts in reviews and interviews alike - it signals the heap model never landed. Fix: poll in a loop for sorted consumption; say WHY (only sifting guarantees the root, nothing sorts the body).',
    'Hand-rolling an LRU cache with a HashMap + timestamps + periodic sweeps. Works-ish, then degrades under bursts: sweeps are O(n) stalls, timestamp ties misbehave, and the "cache" leaks between sweeps. Fix: access-order LinkedHashMap for interviews; Caffeine/Guava (size bounds + TTL + stats) for production - name them.',
    'Using TreeMap with a key whose compareTo ignores a field equals includes (or vice versa) - inconsistent contracts make the map accept/reject differently than expected. Fix: keep compareTo-zero <=> equals-true; comparator fields must be the identity definition.',
    'Mutating a key\'s comparable field AFTER insertion into TreeMap. The tree positioned it by old value; new value belongs elsewhere but no reposition happens - lookups miss silently, same landmine family as mutable HashMap keys. Fix: immutable keys, always.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere support center: tickets arrive faster than agents resolve them. Business rules: paying customers first, then ticket age, then tier within same age. Current code sorts an ArrayList of tickets at every agent poll - CPU spikes with queue depth.',
      question: '"Restructure this - which collection, what comparator, what complexity win?"',
      answer:
        'The poll-pattern is serve-highest-priority-repeatedly: PriorityQueue<Ticket> with a composed comparator - comparing(SupportTicket::isPaid).reversed().thenComparing(SupportTicket::createdAt).thenComparing(SupportTicket::tier) - turns each agent poll into O(log n) sift instead of O(n log n) full sort per request; arrival is one O(log n) offer. Trade-offs to volunteer: PQ cannot answer "show me the whole queue ranked" cheaply (that needs a poll-drain or keeping a parallel TreeSet if supervisors want live ranked views - O(log n) inserts there buy sorted iteration); PQ also lacks thread safety - concurrent producers need PriorityBlockingQueue, or better, hand queuing to the broker (RabbitMQ with priorities) since durability across restarts matters for support tickets anyway. Ending on that note shows judgment: in-process structures for transient state, infrastructure for durable state.'
    },
    {
      situation:
        'Analytics asks: "for any given product, show its five nearest competitors by price." Products change prices intraday. Current implementation re-sorts a 200k-row list per request.',
      question: '"Design the data layer for instant neighbor queries."',
      answer:
        'Neighbor-by-value is a RANGE problem - sorted structure territory: TreeMap<BigDecimal, List<String>> keyed by price (list handles price collisions). Neighbors of price P: headMap/tailMap slices around P, take nearest two-and-two via descendingKeySet iterations - O(log n) descent plus constant slicing, versus 200k x log(200k) comparisons per request today. Intraday updates fit perfectly: remove old price bucket entry (O(log n)), insert new - trees rebalance themselves, no rebuild. Scale honesty worth adding: at 200k rows this runs comfortably in-heap refreshed from DB, but if multi-service consistency matters, the same shape lives in Redis sorted sets (ZADD/ZRANGEBYSCORE are literally TreeMap thinking distributed) - naming that equivalence demonstrates the concept transferred beyond Java collections, which is exactly what senior interviews fish for.'
    }
  ],

  rapidFire: [
    {
      question: 'How do you build an LRU cache with LinkedHashMap?',
      answer:
        'Extend it with accessOrder=true, cap entries, and override removeEldestEntry to return size() > capacity - reads re-link entries to the tail, overflow evicts the head.'
    },
    {
      question: 'What is the difference between insertion-order and access-order in LinkedHashMap?',
      answer:
        'Insertion-order iterates by when entries were added; access-order re-links on every get/compute so iteration follows recency of use - the LRU switch.'
    },
    {
      question: 'What backs TreeMap and what complexity does it guarantee?',
      answer:
        'A red-black tree - self-balancing BST - giving guaranteed O(log n) put/get/remove and sorted iteration with NavigableMap range methods.'
    },
    {
      question: 'Name four NavigableMap methods.',
      answer:
        'ceilingKey (least >=), floorKey (greatest <=), higherKey (strictly greater), and subMap for ranged views - plus firstKey, lastKey, descendingMap.'
    },
    {
      question: 'What is the underlying structure of PriorityQueue?',
      answer:
        'A binary min-heap stored in a plain array - root is the least element per comparator; offer/poll sift in O(log n), peek is O(1).'
    },
    {
      question: 'Is iterating a PriorityQueue sorted?',
      answer:
        'No - iteration follows internal array layout; only repeated polling yields priority order. Classic trap question.'
    },
    {
      question: 'How do you make a max-heap in Java?',
      answer:
        'new PriorityQueue<>(Comparator.reverseOrder()) - default construction is a MIN-heap on natural order.'
    },
    {
      question: 'Top-K largest of N items - which structure and what complexity?',
      answer:
        'A K-sized min-heap: scan all N offering each, evicting above size K - O(N log K) versus sorting\'s O(N log N).'
    }
  ],

  interviewPerspective:
    '"Design an LRU cache" opens this topic 80% of the time - answer in layers: access-order LinkedHashMap one-liner first, THEN describe the manual version (HashMap + doubly-linked list, O(1) everywhere) to prove you know what the library hides. TreeMap rounds test NavigableMap fluency and comparator design. PriorityQueue rounds almost always bait the iteration trap - dodging it explicitly ("note: for-each would NOT give sorted order") is the cheapest seniority signal available anywhere in collections.'

  ,

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'collections-scenario-drill',
      title: 'Collections Scenario Drill',
      note: 'The module finale - mixed war-room cases drawing on every lesson so far.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams (full Learn page)',
      note: 'sorted()/comparators flow straight into stream pipelines - the natural next skill.'
    }
  ],

  triggerSentence:
    'Recency lives in the chain, ranges live in the tree, importance lives in the heap - pick the memory your question actually needs.'
};
