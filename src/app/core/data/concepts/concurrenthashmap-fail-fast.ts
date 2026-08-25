import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Collections Mastery -> ConcurrentHashMap & Fail-Fast.
 * What breaks when threads share collections, why Hashtable died, how CHM
 * actually achieves its concurrency, and the iterator story on both sides.
 */
export const CONCURRENTHASHMAP_FAIL_FAST: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'collections-mastery',
  conceptId: 'concurrenthashmap-fail-fast',
  title: 'ConcurrentHashMap & Fail-Fast',
  topicType: 'data-structure',

  simpleIntuition:
    'Black Friday hits ShopSphere. One flash-sale product becomes a war zone: hundreds of threads per second read stock counts while dozens update them. Riya\'s first instinct - "wrap the HashMap in synchronized blocks" - works, until the traffic graph shows every thread queuing at one door like a metro station with a single gate. The fix is not more locking but smarter sharing: let threads touch DIFFERENT buckets simultaneously and only agree when they truly collide. ConcurrentHashMap is that idea industrialized - and explaining exactly HOW it differs from "just synchronize everything" is one of the most reliable seniority signals in a Java interview.',

  formalMeaning:
    'ConcurrentHashMap (java.util.concurrent) is a thread-safe hash table achieving high concurrent throughput without locking the whole map. Since Java 8 it dropped Java 7\'s segment-based lock striping for finer granularity: reads are effectively unsynchronized volatile reads; writes CAS (compare-and-swap) nodes directly into empty buckets and fall back to synchronized blocks scoped to a single bucket\'s head node only when a bin is occupied. Size counting is striped across CounterCells to avoid a global atomic counter bottleneck. Iterators are weakly consistent (never throw ConcurrentModificationException) reflecting state at some point in time. Null keys and null values are forbidden by design.',

  whyItExists:
    'The naive options all fail production: plain HashMap under concurrent writes can lose entries outright (and in old JDKs could spin CPUs during concurrent resize); Hashtable synchronizes EVERY method - safe but serializes all traffic through one mutex, scaling worse than no concurrency at all; Collections.synchronizedMap wraps the same single-mutex model with iteration still requiring manual external synchronization. ConcurrentHashMap exists because real systems are overwhelmingly READ-heavy with localized write collisions - so it optimizes the common case (lock-free reads), narrows the rare case (bucket-level writes), and provides honest compound operations (putIfAbsent, computeIfAbsent) instead of leaving check-then-act races to users.',

  howItWorksInternally: [
    'Reads (get): walk to bucket via spread-hash masking exactly like HashMap, then read node fields declared VOLATILE - the memory semantics make published writes visible without any lock. Most traffic pays zero synchronization cost.',
    'Writes into an EMPTY bucket: attempt casTabAt - a hardware compare-and-swap setting the bin\'s first node directly. Success means no lock was ever taken. This alone eliminates contention between writers hitting different empty bins.',
    'Writes into an OCCUPIED bucket: synchronized(lockHolder) where lockHolder is the bin\'s FIRST NODE - locks are per-bucket, transient, and different bins proceed in parallel. Treeified bins synchronize on their tree root instead.',
    'Resizing coordinates multithreaded expansion: threads claim transfer chunks via a control field (sizeCtl) and migrate bin-ranges together; readers traversing a forwarding node get routed to the next table mid-move. The elegance is worth one interview sentence: "even resize itself is cooperative".',
    'Size counting: tryIncCount first bumps baseCount via CAS; under contention it spills into striped CounterCell arrays (LongAdder-style) - size() later sums cells. Trading exact-real-time count (rarely needed) for uncontended increments.',
    'Fail-fast iterators - the OTHER half of this lesson: ArrayList/HashMap iterators snapshot modCount and throw ConcurrentModificationException on structural drift DURING iteration. Best-effort by specification: not thrown for same-thread value replacement, not guaranteed under actual concurrency - it is a bug detector, not a safety net.',
    'CHM iterators are WEAKLY CONSISTENT: created against a snapshot state, reflect updates made after creation MAY or MAY NOT appear, never throw. Same guarantee family as CopyOnWriteArrayList iteration.',
    'Why no nulls: under concurrency, map.get(key) returning null is ambiguous - absent, or present-with-null-value? Single-threaded code disambiguates with containsKey (a second, race-free call); concurrently that two-step check is itself a race. Banning nulls makes the ambiguity structurally impossible.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    W["write(key, value)"] --> E{"bucket empty?"}\n    E -->|yes| CAS["CAS set head node<br/>NO LOCK taken"]\n    E -->|occupied| SYN["synchronized<br/>on bin head node ONLY"]\n    SYN --> UPD["walk bin: replace or append<br/>treeify rules apply"]\n    R["get(key)"] --> V["volatile read of bin + fields<br/>no lock ever"]\n    subgraph Contrast["Hashtable / synchronizedMap"]\n    G["EVERY method queues on<br/>ONE object monitor"] --> S["correct but serial:<br/>throughput collapses"]\n    end',
      caption: 'CHM in one picture: free rides through empty bins, tiny locks only on true collisions, lock-free reads always.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a library with sectioned shelves: Hashtable is a library where ONE librarian handles everyone - polite chaos-free, painfully slow at rush hour. ConcurrentHashMap lets patrons take books straight off shelves (reads need nobody), and only when two people reach for the SAME shelf slot does a mini-lock on that slot arbitrate the write.',
    'Compound-operation arsenal - putIfAbsent, computeIfAbsent, compute, merge, replaceAll: each ATOMIC as a single call. The classic cache-population pattern computeIfAbsent(key, k -> expensiveLoad(k)) replaces the racy if-not-contains-then-put dance.',
    'The cross-call trap: two atomic calls back-to-back are NOT one atomic operation. check-then-act spanning separate calls needs external coordination or restructuring into a single compute/merge.',
    'Legacy corner for completeness: Java 7 CHM used Segment[16] lock striping - concurrency-level tunable, each segment a mini-Hashtable. Knowing WHY it was replaced (two-level indirection, fixed parallelism ceiling, double hashing cost) turns trivia into design narrative.',
    'Collections.synchronizedMap honest use-case: low-contention, rarely-iterated shared maps where wrapping beats migrating. Its iteration contract: MUST be manually synchronized on the map while iterating - a requirement almost everyone forgets, which is how CME bugs survive into production there.'
  ],

  realWorldExamples: [
    'ShopSphere flash-sale counters: ConcurrentHashMap<String, AtomicLong> or better compute()-based counters per SKU - thousands of concurrent increments without global locks.',
    'Spring framework reality: singleton bean caches and various internal registries run on ConcurrentHashMap - every @Autowired lookup rides those volatile reads.',
    'Local caching layer: computeIfAbsent(key, this::loadFromDb) is the poor-man\'s cache pattern - correct under stampede because only one thread computes per absent key.',
    'Interview reality: "HashMap vs Hashtable vs ConcurrentHashMap" is the canonical three-way; the follow-up ladder climbs: how does CHM work in Java 8 → why no nulls → what would you do for a concurrent counter → weakly consistent vs fail-fast iteration.'
  ],

  complexityAndTradeoffs: [
    'Operations remain O(1) average like HashMap - the concurrency machinery adds constants, not asymptotics.',
    'size() is ESTIMATED under contention (summed from striped cells) - needing exact live size usually signals a design smell anyway.',
    'Memory overhead: extra CAS bookkeeping, forwarding nodes during resize, CounterCells - the price of parallelism you only notice at scale, which is precisely where you need it.',
    'Weakly-consistent iteration costs nothing upfront (no copy) but reflects a moving target - audit/reporting over CHM may want snapshotting via toArray() first.',
    'Use CHM when threads genuinely share read-write access. Avoid it when: single-threaded (plain HashMap is leaner), read-only after publication (immutable Map.of copies are simplest), or when multi-key transactional consistency matters (external locking around BOTH operations - or rethink the design).'
  ],

  commonMistakes: [
    'Believing thread-safety makes compound logic safe. putIfAbsent is atomic; if(!map.containsKey(k)) map.put(k,v) is NOT - even on a CHM the gap between check and put admits another writer. Hurts worst in caches: duplicate expensive loads, double-inserted workflows. Fix: express intent as ONE atomic call - computeIfAbsent/compute/merge - or lock externally around the whole sequence.',
    'Iterating a plain HashMap while another thread mutates it and "fixing" the resulting ConcurrentModificationException by catching it. The exception is best-effort detection of ALREADY-corrupted iteration semantics - catching it leaves you iterating garbage. Fix: change structure (CHM/CopyOnWrite) or isolate mutation from traversal by design.',
    'Storing null values defensively ("null means not ready") inside CHM. It will throw NullPointerException on insertion - immediately in dev, humiliatingly in review. Fix: model absence explicitly - sentinel objects, Optional wrappers at API edges, or a dedicated PRESENT-style marker constant.',
    'Assuming CHM gives you a globally consistent view across multiple gets. Each get is individually valid; a read-of-reads can interleave writes between calls. Fix: snapshot what you must treat atomically, or move that consistency requirement into the database where it belongs.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere\'s rate limiter keeps per-client counters: map.computeIfAbsent(clientId, k -> new RateWindow()) followed by window.incrementAndCheck(). Under load test, some clients occasionally exceed limits marginally.',
      question: '"Where is the race, given everything shown is technically atomic?"',
      answer:
        'Each LINE is atomic; the SEQUENCE is not. Between computeIfAbsent returning a window and incrementAndCheck executing, other threads interleave freely - but wait, the marginal-overrun clue points subtler: RateWindow.incrementAndCheck is likely composed of non-atomic read-modify-write steps (count++ style) on a PLAIN long inside the window object. CHM protects key-to-window routing; it says NOTHING about mutations inside the VALUE. Fix: the window itself must own atomicity - AtomicLong.addAndGet(1) compared against threshold, or LongAdder if increments dwarf resets - plus volatile visibility on any plain fields consulted. The general principle I would articulate: thread-safety composes per-object, never transitively - a concurrent MAP of mutable, non-thread-safe VALUES is a race wearing armor on the wrong body part. Interview bonus point: mention LongAdder\'s striped cells mirroring CHM\'s own CounterCells - same idea at both layers.'
    },
    {
      situation:
        'An evening batch job iterates the shop-wide price map (plain HashMap, mutated by a pricing microservice via scheduled refresh) and crashes nightly with ConcurrentModificationException. A teammate proposes catching the exception and retrying the loop.',
      question: '"Evaluate the proposal and give the correct fix menu."',
      answer:
        'Reject catching-and-retrying as primary fix: CME is a best-effort alarm that iteration SEMANTICS already broke - the retry might loop over stale or skipped entries silently, converting a loud failure into quiet data corruption, the worst trade imaginable for a pricing report. Correct menu, cheapest first: (1) decouple - iterate over a snapshot: new ArrayList<>(priceMap.entrySet()) or priceMap.entrySet().toArray(); snapshotting is O(n) but batch jobs tolerate that fine. (2) restructure ownership - if the refresh REPLACES whole contents, publish immutable Map.copyOf snapshots and swap an AtomicReference<Map> pointer; readers grab one coherent generation, zero exceptions forever. (3) if live iteration is genuinely required, migrate to ConcurrentHashMap for weakly-consistent traversal - accepting "some point-in-time-ish" semantics rather than any-generation guarantees. My pick in THIS story: option 2 - replace-on-refresh is already the mental model, and immutable generations eliminate the entire class instead of managing symptoms. State the principle: choose structures expressing the concurrency model, never exception-handling expressing denial of it.'
    }
  ],

  rapidFire: [
    {
      question: 'How does ConcurrentHashMap achieve thread safety in Java 8?',
      answer:
        'Lock-free volatile reads; CAS writes into empty buckets; synchronized blocks scoped to individual bucket head nodes only on collision - plus cooperative multithreaded resizing and striped size counters.'
    },
    {
      question: 'What was the Java 7 approach?',
      answer:
        'Segment-based lock striping - sixteen default segments each acting as a small locked hash table, capping theoretical write parallelism at the segment count; replaced by per-bucket locking for finer granularity.'
    },
    {
      question: 'Why does ConcurrentHashMap not allow null keys or values?',
      answer:
        'Because get() returning null would be ambiguous - missing versus mapped-to-null - and under concurrency you cannot disambiguate with a second containsKey call without racing.'
    },
    {
      question: 'What does fail-fast mean?',
      answer:
        'Iterators detect unexpected structural modification via a modCount mismatch and throw ConcurrentModificationException immediately - a best-effort bug detector, not a concurrency guarantee.'
    },
    {
      question: 'What is weakly-consistent iteration?',
      answer:
        'CHM iterators traverse state existing at creation, may or may not reflect later changes, never throw - trading determinism for never blocking writers.'
    },
    {
      question: 'Difference between ConcurrentHashMap and Collections.synchronizedMap?',
      answer:
        'synchronizedMap serializes ALL operations through one mutex with manual locking required for iteration; CHM allows parallel reads and mostly-parallel writes with built-in safe iterators.'
    },
    {
      question: 'Is check-then-act safe on a ConcurrentHashMap?',
      answer:
        'Only within a single compound call like putIfAbsent or computeIfAbsent - two separate calls have a race gap between them regardless of the map being thread-safe.'
    },
    {
      question: 'How do you safely remove entries while iterating an ArrayList?',
      answer:
        'Iterator.remove(), or removeIf(predicate) - removing through the list directly mid-iteration corrupts indices and trips modCount.'
    }
  ],

  interviewPerspective:
    'This is where collections interviews escalate from memory-recall to design-sense. The entry question is the HashMap-vs-CHM contrast; the exit criteria is whether you can narrate CAS-versus-synchronized-bucket mechanics and articulate the null-ban rationale unprompted. Scenario follow-ups love the compound-operation trap - volunteer the computeIfAbsent pattern early and you often skip three easier questions. If asked about Hashtable, one sentence: legacy synchronized methods, superseded twice over - then steer back to modern ground.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'hashmap-internals',
      title: 'HashMap Internals',
      note: 'The foundation this builds on - buckets, treeify, resize all carry over.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading (full Learn page)',
      note: 'The thread fundamentals behind every term here - volatile, CAS, monitors.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'collections-scenario-drill',
      title: 'Collections Scenario Drill',
      note: 'Coming next in the module - mixed war-room cases including concurrency-flavored ones.'
    }
  ],

  triggerSentence:
    'Read free, write narrow, iterate fearlessly - and never trust a compound promise made across two calls.'
};
