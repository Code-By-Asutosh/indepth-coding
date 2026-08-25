import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> HashMap Internals.
 * The single most-asked collections question: what happens on put(), why
 * capacity is a power of two, when buckets become trees, and how resizing
 * works - explained through ShopSphere's SKU lookup.
 */
export const HASHMAP_INTERNALS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'hashmap-internals',
  title: 'HashMap Internals',
  topicType: 'data-structure',

  simpleIntuition:
    'The ShopSphere product page has one hard requirement: type a SKU, see the product - instantly - with a million products in the catalog. A linear scan is a million comparisons; even sorting does not help because nobody browses alphabetically by SKU. What Riya needs is teleportation: hand the SKU to some function that jumps STRAIGHT to the one shelf where that product lives. HashMap is exactly that trick - an array of shelves plus a function that turns any key into a shelf number - and every interview question about it is really asking: "do you know what happens inside the teleporter, including when two keys land on the same shelf?"',

  formalMeaning:
    'HashMap stores entries in a bucket table - an array of Node<K,V> whose length is always a power of two (default 16). For each key it computes hash(key) = h ^ (h >>> 16) to mix high bits downward, then derives the bucket index as (table.length - 1) & hash - a bitmask that is equivalent to modulo but cheaper. Keys colliding in one bucket form a linked list appended at the tail; since Java 8, a bucket holding 8+ nodes in a table of 64+ slots treeifies into a red-black tree, bounding worst-case operations at O(log n). When size exceeds capacity x load factor (default 0.75), the table resizes to double length and redistributes every node.',

  whyItExists:
    'Without hashing, "find by identifier" forces a choice between scanning O(n) or keeping data sorted for O(log n) binary search - both too slow when lookups are THE hot path (product pages, session caches, config maps). Hashing buys O(1) average by spending memory on spare bucket space and CPU on computing hashes. The design questions HashMap answers - how much spare space (load factor), how to handle collisions (lists then trees), when to reorganize (resize at threshold) - are not trivia; they are the same engineering trade-offs you will later make designing sharded caches and partitioned databases. That is WHY interviewers camp here: your answers reveal whether you reason about trade-offs or memorize outcomes.',

  howItWorksInternally: [
    'put(key, value) step 1 - hash mixing: key.hashCode() gives h (a 32-bit int). HashMap spreads it: hash = h ^ (h >>> 16). XOR-ing the high half into the low half matters because the next step only LOOKS at low bits - without mixing, keys differing only in high bits would pile into the same bucket.',
    'Step 2 - bucket index: index = (n - 1) & hash, where n is table length. Because n is always a power of two, n-1 is a run of 1-bits in binary, so AND behaves like modulo but is a single CPU instruction. This is the answer to "why must capacity be a power of two?".',
    'Step 3 - empty bucket? Place a new Node(key, hash, value, next = null) directly. Done - best case, one write.',
    'Step 4 - occupied bucket (collision): walk the bin comparing stored hash first (cheap int check), then == (same object), then equals() (logically equal). Match found → replace the value, return old value. No match → append a new node at the TAIL (Java 8 changed this from head-insertion specifically to fix the corruption/infinite-loop hazard during concurrent resizes in older versions).',
    'Step 5 - treeify check: if this bin just grew to TREEIFY_THRESHOLD (8) nodes AND table.length >= MIN_TREEIFY_CAPACITY (64), convert the list to a red-black tree - lookups in that bin drop from O(k) to O(log k). If the table is still small (< 64), resize instead of treeifying - growing is the better medicine for young tables.',
    'Step 6 - bookkeeping: ++size; if size > threshold (capacity x 0.75) → resize(): allocate double-length table; for each old node recompute placement with ONE bit - nodes go to same index or same index + oldCap depending on whether (hash & oldCap) is zero - splitting each old bin into "low" and "high" lists without re-running the full hash function. This elegant bit-trick split is Java 8\'s upgrade over Java 7\'s full rehash-and-reverse.',
    'get(key): identical routing - spread, mask, then walk/tree-search the bin matching hash, ==, equals. All the cost lives in step 4\'s walk, which load-factor tuning keeps short on average.',
    'Special cases worth volunteering: ONE null key is allowed and always lives in bucket 0 (null hash cannot be spread, so it bypasses hashing); null VALUES are unrestricted; iteration order is unspecified and may change after any resize - code relying on HashMap ordering is broken by design.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    K["put sku-42, product"] --> H["hash = h xor (h >>> 16)<br/>spread high bits into low"]\n    H --> I["index = (n-1) &amp; hash<br/>bitmask = cheap modulo"]\n    I --> B{"bucket[index]?"}\n    B -->|"empty"| N1["place new Node"]\n    B -->|"occupied"| W{"walk bin:<br/>hash equal, == , equals"}\n    W -->|"match"| R["replace value"]\n    W -->|"no match"| AP["append at tail"]\n    AP --> T{"bin size = 8<br/>and table >= 64?"}\n    T -->|yes| TR["treeify - red-black tree"]\n    T -->|no, table small| RS["resize instead"]\n    N1 --> SZ["size > capacity * 0.75?"]\n    R --> SZ\n    SZ -->|yes| GR["double capacity,<br/>split bins by hash &amp; oldCap"]',
      caption: 'The complete put() decision path - recite THIS and you own the flagship question.'
    },
    {
      mermaid: 'flowchart LR\n    subgraph TABLE["Node[] table - length 16"]\n    B0["0"] --- B1["1"] --- B2["2"] --- B3["3"] --- B14["14"] --- B15["15"]\n    end\n    E1["sku-07"] --> B7["bucket 7"]\n    E2["sku-23"] --> B7\n    E3["sku-39"] --> B7\n    B7 --- L["list: 07 -> 23 -> 39<br/>treeifies at 8 if table >= 64"]',
      caption: 'Collision in the wild: three SKUs masked into bucket 7 form a short chain - the everyday case the load factor keeps rare.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - the coat-check wall: thousands of coats, hundreds of numbered hooks, and an attendant (the hash function) who reads your ticket and sends you to exactly one hook number. Two coats on one hook = a small chain on the same hook (collision). The wall getting too crowded triggers moving to a wall twice as large (resize) - the attendant\'s formula changes by one digit, most coats stay near their old hooks.',
    'THE CONSTANT PANEL - capacity 16 default, load factor 0.75, treeify at bin size 8, min table size for treeing 64, untreeify at bin size 6. Know what each TRADES: 0.75 balances probe-cost vs wasted space; 8 reflects bin-length statistics under decent hashing (Poisson-ish expectation says bins of 8 are vanishingly rare unless hashing is bad); 6 avoids flip-flopping a borderline bin between list and tree on removals.',
    'Node<K,V> - int hash, K key, V value, Node next. Four fields; the whole structure hangs off them. TreeNode extends it for treeified bins.',
    'hashCode caching insight - String caches its hashCode in a field after first computation, which is partly WHY String is the ideal map key: repeated lookups never recompute, and immutability guarantees the cached value never goes stale. Wrapper types (Integer, Long) have immutable, well-spread hashes too.',
    'The equals/hashCode contract lives here - HashMap routes by hashCode and confirms by equals. Break the contract and entries vanish from lookups; this gets its own lesson because it is the #1 production bug in the Map family.'
  ],

  realWorldExamples: [
    'ShopSphere catalog: HashMap<String, Product> keyed by SKU - the O(1) average lookup is the difference between a snappy product page and a linear scan over a million rows per request.',
    'Spring internals: Spring itself is a giant HashMap user - bean definitions, singleton pool, request-scoped attribute maps. "How does applicationContext.getBean(name) find beans fast?" - same machinery.',
    'Interview reality: HashMap internals is arguably THE most-asked Core Java question in Indian service-company and product interviews alike - put flow, power-of-two capacity, treeify thresholds, and resize mechanics are each follow-up bait.'
  ],

  complexityAndTradeoffs: [
    'Average put/get/remove: O(1) - assuming a sane hashCode distributing keys across buckets.',
    'Worst case: pre-Java 8 a poisoned bin degraded to O(n); Java 8+ treeification caps it at O(log n) - relevant when keys cluster (bad hashCodes) or under adversarial input.',
    'Space trade-off: default settings keep ~25% of buckets empty on average at resize time - that waste IS the speed. Load factor 1.0 saves memory but lengthens chains; 0.5 wastes memory to shorten them.',
    'Iteration cost scales with CAPACITY, not size: iterating a huge, mostly-empty HashMap walks the whole table. Choosing initial capacity wisely (expectedSize / 0.75, rounded up to power of two) tunes both memory and iteration cost.',
    'Use HashMap when: key-based access dominates, order irrelevant, concurrent mutation absent. Avoid it when: order matters (LinkedHashMap/TreeMap), threads mutate concurrently (ConcurrentHashMap), or keys are arrays/objects with identity-based equals (lookups silently miss).'
  ],

  commonMistakes: [
    'Using a MUTABLE object as a key, then changing its fields after insertion. Looks harmless - the map.put succeeds normally. Hurts badly: the entry\'s bucket was chosen from the OLD hashCode; mutate the key and future get() computes a NEW hash, lands in a different bucket, and returns null forever while the orphaned entry still occupies memory and shows in iteration. Fix: immutable keys only (String, wrappers, records), or remove-before-mutate-reinsert discipline.',
    'Assuming new HashMap<>(1000) gives capacity 1000. It does not - the constructor stores tableSizeFor(1000) = 1024 as threshold and allocates 1024-wide table only on first insert; resize fires at 1024 * 0.75 = 768 entries anyway. Fix: for n expected entries pass roughly n/0.75 + 1 (or just say "capacity is rounded up to the next power of two and resize still respects 0.75").',
    'Relying on HashMap iteration order - in tests, in JSON serialization, anywhere. It works until a resize reshuffles everything, then production "randomly" reorders output. Fix: need order? LinkedHashMap explicitly; need sorted? TreeMap deliberately.',
    'Saying "HashMap allows null" without precision. One null KEY (bucket 0), unlimited null VALUES - and ConcurrentHashMap allows NEITHER, a contrast interviewers love as a bridge question.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere builds a flash-sale feature: ProductId -> DiscountRule map assembled at deploy time, then read millions of times daily. A teammate suggests TreeMap "because discounts are configured in price-order".',
      question: '"Which Map implementation do you choose and why - defend it against the alternative."',
      answer:
        'Access pattern decides: pure point-lookups by id, no range queries, no ordering requirement at read time - that is HashMap territory: O(1) average versus TreeMap\'s guaranteed O(log n) red-black cost on EVERY lookup, plus no rebalancing bookkeeping. The teammate\'s price-order argument dissolves on inspection: nothing in the flash-sale path iterates discounts in price order; if the ADMIN screen wants sorted display, sort once there (or keep a separate ordered view) rather than taxing the hot path millions of times a day. I would also pre-size it - new HashMap<>(expectedRules / 0.75 + 1) - since contents are known at deploy time, guaranteeing zero resizes. If requirements later add "find all discounts above price X", THAT is the moment TreeMap (ceilingKey/tailMap) earns its log-n tax - structures follow requirements, not aesthetics.'
    },
    {
      situation:
        'A cache built on HashMap<String, UserSession> intermittently serves null even though logs show the session was definitely put() minutes earlier. Sessions are mutable POJOs whose lastSeenAt field gets updated by a heartbeat thread.',
      question: '"Hypotheses before fixes - what do you suspect and how would you prove it?"',
      answer:
        'Top suspect: the KEY mutates, not the value. If UserSession is used as key and its hashCode depends on mutable fields (say sessionId is rebuilt or normalized in place), then after mutation, get() hashes differently, masks into another bucket, and misses - while the original entry sits orphaned in its old bucket. Proof is cheap: iterate map.keySet() and check containsKey() against a fresh equal copy; or log key.hashCode() at put time versus miss time - divergence confirms it. Fix: immutable keys (String id as key rather than the whole session object). Second hypothesis worth naming: plain HashMap under concurrent put/get can also corrupt state in principle - if multiple threads write sessions, ConcurrentHashMap is the correct home, and its refusal of null values would surface other bugs loudly. Order matters in my answer: correctness bug first (contract violation), concurrency second (structural choice) - fixing concurrency around a broken contract just makes failures rarer, not correct.'
    }
  ],

  rapidFire: [
    {
      question: 'What is the internal structure of HashMap?',
      answer:
        'An array of buckets (Node tables) where each slot holds either null, a linked list of collided nodes, or - since Java 8 - a red-black tree once a bin passes eight entries in a table of sixty-four-plus slots.'
    },
    {
      question: 'How is the bucket index calculated?',
      answer:
        'index = (table.length - 1) & hash - a bitwise AND that works as modulo because capacity is always a power of two.'
    },
    {
      question: 'Why is HashMap capacity always a power of two?',
      answer:
        'So the index calculation can use a cheap bitmask instead of division, and so resize simply doubles while redistributing nodes via a single extra hash bit.'
    },
    {
      question: 'What does the load factor control?',
      answer:
        'When the table resizes - default 0.75 means at 12 entries in a 16-slot table it doubles. Lower wastes memory for shorter chains; higher saves memory but slows lookups.'
    },
    {
      question: 'What happens when more than 7 keys land in one bucket?',
      answer:
        'Nothing yet - at the eighth insertion, if the table has at least 64 slots, that bin treeifies into a red-black tree giving O(log n) within-bin operations; below 64 the table resizes instead.'
    },
    {
      question: 'Does HashMap allow null keys and values?',
      answer:
        'Exactly one null key, which always lives in bucket zero bypassing hashing, and any number of null values - ConcurrentHashMap permits neither.'
    },
    {
      question: 'Is HashMap thread-safe?',
      answer:
        'No - concurrent structural writes can lose entries and historically could loop the CPU during resize; use ConcurrentHashMap, or Collections.synchronizedMap only when write contention is negligible.'
    },
    {
      question: 'How does resize work internally?',
      answer:
        'Capacity doubles; each existing node moves by testing ONE new hash bit (hash & oldCap): zero stays at the same index, one goes to index plus oldCap - no full rehash needed.'
    },
    {
      question: 'Why is String a good HashMap key?',
      answer:
        'Immutability keeps its hashCode stable for life, and String caches the computed hash in a field so repeated lookups skip recomputation.'
    }
  ],

  interviewPerspective:
    'Expect the question in escalating waves: "internal working of HashMap" → put flow with collision handling → why power-of-two → load factor meaning → treeify conditions → resize mechanics → thread-safety bridge into ConcurrentHashMap. Each precise answer invites a harder wave - that is a GOOD sign, they only climb ladders for candidates standing on rungs. The seniority tell is volunteering trade-offs unprompted ("0.75 balances probe length against wasted space") instead of waiting to be interrogated.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'equals-hashcode-in-practice',
      title: 'equals & hashCode in Practice',
      note: 'Next lesson - the contract HashMap silently depends on, and the bugs born when it breaks.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'concurrenthashmap-fail-fast',
      title: 'ConcurrentHashMap & Fail-Fast',
      note: 'What replaces this machinery when threads enter the picture.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'string-pool-interning',
      title: 'String Pool & Interning',
      note: 'Why String keys behave so reliably - immutability and caching from the source side.'
    }
  ],

  triggerSentence:
    'Spread the bits, mask the bucket, chain the clash, tree the crowd, double the table - five beats and the teleporter is yours.'
};
