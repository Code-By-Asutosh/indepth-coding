import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Concurrency Drill -> synchronized, volatile, Atomics & Locks.
 * The thread-safety toolkit: what visibility means under the JMM, why volatile
 * is not atomicity, how CAS powers atomics, and when ReentrantLock beats
 * synchronized.
 */
export const SYNCHRONIZED_VOLATILE_ATOMICS_LOCKS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'concurrency-drill',
  conceptId: 'synchronized-volatile-atomics-locks',
  title: 'synchronized, volatile, Atomics & Locks',
  topicType: 'concept',

  simpleIntuition:
    'ShopSphere\'s flash sale has one job: never sell the last mug twice. Asutosh\'s first counter - a boolean "sold" flag checked by every checkout thread - fails in testing with exactly ONE duplicate order, unreproducibly. Riya explains the unsettling truth: on modern hardware there is no single "the value" - each CPU core may hold its own cached copy, so Thread A\'s write to `sold` can float invisibly for microseconds while Thread B keeps reading a stale false from its local cache. Everything in this lesson exists to answer that one horror story: WHO sees WHICH write, WHEN - and what "count + 1" really costs when two threads do it simultaneously.',

  formalMeaning:
    'The Java Memory Model (JMM) defines when writes by one thread become visible to others, via happens-before relationships. synchronized provides BOTH mutual exclusion (one thread per monitor) AND memory visibility (entering a block invalidates local caches; exiting flushes writes). volatile guarantees ONLY visibility and ordering for that variable\'s reads/writes - never atomicity of compound operations. Atomic classes (AtomicInteger et al) achieve lock-free atomic read-modify-write through hardware CAS (compare-and-swap) instructions. ReentrantLock is an explicit lock offering tryLock-with-timeout, fairness queuing, interruptibility, and Condition variables - capabilities synchronized cannot express.',

  whyItExists:
    'Compilers reorder instructions, CPUs execute out-of-order, and each core caches memory locally - all legitimate optimizations that silently break multi-thread logic built on naive intuition ("I wrote it, so the next reader sees it"). Without language-level tools, correct sharing would require assembly fences per platform. synchronized/volatile/atomics are portable contracts telling compiler AND CPU: here, correctness outranks cleverness. They exist at different granularities because the costs differ wildly: uncontended CAS is nanoseconds, uncontended synchronized is nearly free post-JDK-15-bias-locking-removal but contended locking parks threads (microseconds + context switches), so choosing correctly IS performance engineering. Interviews probe this ladder because it reveals whether you understand WHAT problem each tool solves - visibility, atomicity, or orchestration - or just pattern-match keywords.',

  howItWorksInternally: [
    'The visibility failure mode: thread A sets sold=true inside its core cache; main memory still holds false; thread B on another core reads false. No exception, no warning - just wrong decisions from stale data, the worst bug class in software.',
    'volatile fixes exactly that: writes go straight to main memory coherence domain and invalidate other cores\' cached copies; reads always fetch fresh values. It also forbids reordering ACROSS the volatile access (acquire/release semantics). What it does NOT do: make count++ safe - that operation is READ, ADD, WRITE three steps; two threads can both read 5, both write 6, losing one increment forever.',
    'synchronized(obj): only one thread may hold obj\'s monitor at a time. Entering establishes a memory fence - you SEE all writes from the previous holder; exiting flushes yours. It is REENTRANT (same thread may re-enter nested synchronized blocks on the same monitor without deadlocking itself). Guard BOTH the check AND the mutation with the SAME lock object - synchronizing only the write leaves the race intact.',
    'CAS mechanics underneath atomics: compareAndSet(expect, update) is ONE hardware instruction - if the memory location still holds expect, swap in update and return true, else return false. AtomicInteger.incrementAndGet loops: read current value v, CAS(v, v+1); if another thread won meanwhile, retry. No locks, no parking - contention becomes retry loops instead of queue waits.',
    'The ABA corner (name-drop level): CAS checks value equality, not history - value changed A→B→A slips through. java.util.concurrent solves it where needed with versioned references (AtomicStampedReference); databases call the identical trick optimistic locking with version columns - a beautiful cross-topic bridge to say out loud.',
    'LongAdder vs AtomicLong: under heavy write contention AtomicLong\'s CAS retries thrash one memory cell; LongAdder stripes counts across cells and sums lazily on read - trading exact-instant totals for write scalability. Same philosophy as ConcurrentHashMap\'s CounterCells.',
    'ReentrantLock\'s exclusive powers: tryLock(100ms) - back off instead of blocking forever (deadlock escape hatch!); fair mode - FIFO handoff fighting starvation; lockInterruptibly() - cancellable waits for shutdown scenarios; multiple Condition queues for fine-grained wait/notify (bounded-buffer producers and consumers waking SEPARATELY).',
    'Choosing ladder in practice: plain volatile for flags/config visibility → Atomic* for single counters/references → LongAdder for hot counters → concurrent collections for shared structures → synchronized for short multi-variable invariants → ReentrantLock only when its special powers are actually needed.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    INC["two threads run count++"] --> R1["Thread A reads 5"]\n    INC --> R2["Thread B reads 5<br/>before A writes"]\n    R1 --> W1["A writes 6"]\n    R2 --> W2["B writes 6<br/>LOST UPDATE - should be 7"]\n    FIX1["volatile? NO - visibility only"] --> INC\n    FIX2["synchronized? YES -<br/>exclusion across whole op"] --> INC\n    FIX3["AtomicInteger? YES -<br/>CAS retries the whole op"] --> INC',
      caption: 'The lost update - why volatile alone never fixes count++; atomicity needs exclusion or CAS.'
    },
    {
      mermaid: 'flowchart LR\n    subgraph CAS["AtomicInteger.incrementAndGet loop"]\n    RD["read current v=5"] --> TRY["CAS: if still 5, write 6"]\n    TRY -->|"success"| DONE["done - no lock ever held"]\n    TRY -->|"someone changed it"| RD2["re-read v=6, retry"]\n    RD2 --> TRY\n    end',
      caption: 'Lock-free concurrency: contention becomes optimistic retries, not parked threads.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a shared office whiteboard: volatile is everyone agreeing to look UP from their notebooks before every read (always current, but two people can still erase-and-rewrite simultaneously). synchronized is the whiteboard PASS - one holder writes undisturbed while others wait, and handing over the pass includes seeing everything the last person wrote. Atomics are pre-printed sticky notes with checkboxes - "+1", "swap if unchanged" - tiny guaranteed-complete actions nobody can interrupt halfway.',
    'Happens-before - the JMM\'s one rule worth memorizing: unlock happens-before subsequent lock of the same monitor; volatile write happens-before subsequent volatile read of that variable; thread start/join carry visibility too. If your shared data lacks ANY happens-before path, you are gambling on caches.',
    'Monitor facts interviewers love: every Java object HAS a monitor; synchronized(this) on widely-known objects lets foreign code contend - prefer private final lock objects; static synchronized locks the CLASS object, instance synchronized locks the instance - they do NOT exclude each other.',
    'wait/notify trio lives on monitors: must hold the lock to call them (IllegalMonitorStateException otherwise), ALWAYS await inside a while-loop re-checking the condition (spurious wakeups), notifyAll over notify unless proven otherwise.',
    'ReadWriteLock sketch: many readers OR one writer - helps read-heavy shared structures, disappoints when reads mutate caches anyway (mention StampedLock\'s optimistic reads as the modern upgrade, then move on).'
  ],

  realWorldExamples: [
    'ShopSphere stock decrement: AtomicInteger.decrementAndGet() compared against zero makes oversell structurally impossible without locking the whole catalog - and the DB-side UPDATE ... WHERE qty > 0 guard backs it as source of truth.',
    'Config refresh: volatile Map reference swapped atomically by a refresher thread - readers always see a complete immutable snapshot; this publish-one-reference pattern avoids locking entirely.',
    'Spring reality: singleton bean creation is synchronized-guarded by the framework; your @Controller fields shared across request threads are where YOU bring the discipline - stateless controllers are the default for a reason.',
    'Interview reality: "volatile vs synchronized" is asked in virtually every Java round; the follow-up "can volatile make ++ safe?" eliminates half the field instantly.'
  ],

  complexityAndTradeoffs: [
    'Cost ladder under CONTENTION: uncontended CAS ~ tens of cycles; uncontended synchronized cheap since biased locking removal made it a straight monitor enter; contended monitors park threads - microseconds plus context switch; CAS under high contention burns CPU retrying. Contention profile decides the winner, never benchmarks of empty loops.',
    'Granularity trade-off: coarse locks simplify reasoning but serialize throughput (one global lock = single-threaded system under load); fine-grained/striped locks scale (per-key, per-bucket) but invite ordering bugs between them - CHM chose striping-by-bucket for exactly this reason.',
    'Lock scope rule: hold across the INVARIANT, not the whole method - long IO inside synchronized converts every competitor into a parked thread; shrink critical sections, move network calls OUT.',
    'Use volatile when: one writer / many readers of a flag or published reference, no compound invariants. Avoid volatile when: correctness needs read-modify-write atomicity - that is atomics or locks territory.'
  ],

  commonMistakes: [
    'Using volatile on a counter and shipping it ("visibility fixed, done"). Both threads still interleave inside ++ and updates vanish - intermittently, under load, unreproducible in QA. Fix: AtomicInteger (or LongAdder at scale) for counters; volatile reserved for flags and published references.',
    'Synchronizing the WRITE but reading the field unlocked elsewhere. The writing thread\'s monitor gives readers nothing - they never enter the same monitor, so stale reads persist. Fix: EVERY access path (read and write) crosses the same lock, or the field is volatile/atomic.',
    'Locking on mutable or shared objects: synchronized(someFieldThatGetsReassigned) - two different lock objects over time = zero mutual exclusion; synchronized(String literal) - literals are interned GLOBALS, foreign code can deadlock you. Fix: private static final Object LOCK = new Object(), or dedicated lock instances per guarded resource.',
    'Assuming synchronized methods on the same class serialize across INSTANCES - instance methods lock per-object; ten service instances = ten independent monitors. Static data guarded by instance locks stays racy. Fix: match lock scope to data scope (static data → class-level or explicit static lock).'
  ],

  scenarioDrills: [
    {
      situation:
        'Flash-sale counter again, now in production: stock stored as plain int in a singleton service; two endpoints - one decrements stock, one displays remaining stock on the storefront. Under load tests: occasional negative stock AND the display sometimes shows stale numbers minutes old.',
      question: '"Two symptoms - propose the minimal correct design, naming which tool fixes which symptom."',
      answer:
        'Symptom one (negative stock) is ATOMICITY: decrementAndGet-style compound logic on a plain int races - two threads pass the qty>0 check together. Symptom two (stale display) is VISIBILITY: plain int has no happens-before path to reader threads, so cores serve cached values. Minimal fix names both tools: AtomicInteger stock - decrementAndGet() returns the post-decrement value, and callers treat anything below zero as sold-out with compensation (increment back), making oversell structurally impossible; AtomicInteger\'s internal volatile semantics simultaneously cure staleness for readers - get() always sees current. Then the production-grade caveat I would volunteer unprompted: in-memory stock is a CACHE of database truth - the authoritative guard belongs in SQL (UPDATE inventory SET qty = qty-1 WHERE sku=? AND qty >= 1, check affected rows) because pods restart, replicas diverge, and ECS tasks die mid-request. In-memory atomics win the speed round; the conditional update wins the correctness round; mature systems use both layered.'
    },
    {
      situation:
        'A senior teammate reviews this snippet: private volatile boolean initialized; if (!initialized) { loadHeavyConfig(); initialized = true; } called from many threads - and complains about "duplicate config loads in logs".',
      question: '"Why does volatile fail here, and give two correct alternatives."',
      answer:
        'Volatile delivered visibility but not atomicity of CHECK-THEN-ACT: several threads simultaneously read false (all legally, all freshly), all proceed to loadHeavyConfig - duplicate work, wasted startup time, and if loading had side effects (metrics, connections) worse. Alternative one - express intent as one atomic operation: initialize via computeIfAbsent on a ConcurrentHashMap or AtomicBoolean.compareAndSet(false,true) gate where only the CAS winner loads and losers spin-wait until a volatile ready-flag flips. Alternative two - synchronize the whole lazy-init block (double-checked locking ONLY with the holder field volatile - without volatile, DCL publishes a partially-constructed object due to reordering; if asked about DCL, THAT subtlety is the follow-up gold). Best practical answer: initialization-on-demand holder idiom - private static class Holder { static final Config C = new Config(); } - JVM class-loading semantics guarantee thread-safe lazy init with zero explicit locking. Ranking aloud: holder idiom > CAS gate > DCL, because the best lock is the one the platform holds for you.'
    }
  ],

  rapidFire: [
    {
      question: 'What does volatile guarantee?',
      answer:
        'Visibility and ordering for that variable - reads see the latest write, reordering cannot cross it - but NOT atomicity of compound operations like increment.'
    },
    {
      question: 'Why does count++ break even with volatile?',
      answer:
        'It is three steps - read, add, write - and two threads interleave inside them, losing updates; volatile only ensures each step sees fresh data, not that the sequence is indivisible.'
    },
    {
      question: 'What guarantees does synchronized provide?',
      answer:
        'Mutual exclusion - one thread per monitor - plus memory visibility: entering sees the previous holder\'s writes, exiting publishes yours.'
    },
    {
      question: 'How do atomic classes work?',
      answer:
        'Hardware compare-and-swap instructions in optimistic loops - read a value, attempt to swap only if unchanged, retry on failure; no locks, no thread parking.'
    },
    {
      question: 'When would you pick ReentrantLock over synchronized?',
      answer:
        'Only for its extra powers - tryLock with timeout, interruptible acquisition, fairness, multiple Condition queues - otherwise synchronized is simpler and cannot be forgotten-unreleased.'
    },
    {
      question: 'What is the ABA problem?',
      answer:
        'CAS validates value equality, not change history - A to B back to A passes the check; solved with stamped/versioned references, the same idea as optimistic locking version columns.'
    },
    {
      question: 'LongAdder vs AtomicLong?',
      answer:
        'LongAdder stripes the count across cells so writers rarely collide, summing on read - better under heavy write contention; AtomicLong gives exact single-cell totals with more CAS retries.'
    },
    {
      question: 'Can two threads deadlock using only AtomicInteger?',
      answer:
        'No - CAS loops never block or hold resources while waiting; they burn CPU under contention but cannot form circular waits.'
    }
  ],

  interviewPerspective:
    '"volatile vs synchronized" is the canonical opener; your entire round trajectory depends on answering with VISIBILITY-versus-MUTUAL-EXCLUSION framing rather than usage habits. Expect escalations: why ++ fails, CAS mechanics, ABA, LongAdder, ReentrantLock\'s differentiators, double-checked locking with its volatile requirement. The strongest candidates frame every answer as which GUARANTEE the problem needs - visibility, atomicity, ordering, or coordination - then pick the cheapest tool providing it. That vocabulary is what "senior understanding of JMM" means in practice.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'concurrency-drill',
      conceptId: 'race-conditions-deadlocks',
      title: 'Race Conditions & Deadlocks',
      note: 'Next lesson - what these tools prevent, and the failures born from misusing them.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'java-memory-model-jmm',
      title: 'Java Memory Model (JMM)',
      note: 'Happens-before in full formal depth - the theory under today\'s practice.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'concurrenthashmap-fail-fast',
      title: 'ConcurrentHashMap & Fail-Fast',
      note: 'These primitives industrialized: CAS bins, volatile reads, striped counters at collection scale.'
    }
  ],

  triggerSentence:
    'Visibility is seeing truth, atomicity is acting indivisibly - volatile buys the first, CAS and locks buy the second.'
};
