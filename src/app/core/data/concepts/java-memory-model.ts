import { ConceptContent } from '../../models/content.model';

export const JAVA_MEMORY_MODEL: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'java-memory-model-jmm',
  title: 'Java Memory Model (JMM)',

  hook:
    'One thread sets `ready = true`. Another thread is spinning in `while (!ready) {}` waiting for it — and never stops, ' +
    'even though `ready` was set to `true` seconds ago. Both threads are "correct" by normal single-threaded logic. So why does this hang forever?',

  problem:
    'Modern CPUs and the JVM aggressively cache values and reorder instructions for performance, as long as it does not ' +
    'change the outcome for a SINGLE thread. The moment a SECOND thread is watching, those optimizations can make one ' +
    "thread's writes invisible to another thread for an unbounded amount of time — and this bug is invisible in code review, " +
    "invisible on your dev laptop, and only shows up under real concurrent load.",

  aha: {
    statement: 'Without an explicit happens-before rule, one thread has no guarantee it will ever see another thread\'s write — not "eventually," not ever.',
    analogy:
      "Imagine two coworkers with their own private whiteboards that only sync to the shared master whiteboard when they " +
      "explicitly hit \"sync.\" One coworker writes \"done!\" on their private board and assumes the other can see it — but " +
      "without hitting sync, the other coworker is still staring at the OLD version of the shared board forever, even " +
      "though the update genuinely happened."
  },

  underTheHood: [
    'Each CPU core has its own cache; a write from one thread may sit in that core\'s cache/store-buffer without being flushed to main memory (or another core\'s cache) for an unpredictable amount of time.',
    'The JVM and CPU are both allowed to reorder instructions that don\'t affect single-threaded correctness — "x = 1; y = 2;" might genuinely execute as "y = 2; x = 1;" from another thread\'s point of view.',
    'The Java Memory Model (JMM) defines "happens-before" — a set of rules guaranteeing that if action A happens-before action B, every thread is guaranteed to see A\'s effects when it observes B.',
    '`volatile` establishes happens-before on that single field: every write is flushed immediately, every read fetches the current value, and the JIT/CPU are forbidden from reordering around it.',
    'Entering/exiting a `synchronized` block also establishes happens-before: releasing a lock happens-before a later thread acquiring that same lock, so everything the first thread did before releasing is visible to the second thread after acquiring.',
    '`final` fields get a special guarantee: as long as the constructor doesn\'t leak "this" before finishing, any thread that gets a reference to the fully-constructed object is guaranteed to see the correct final field values, with no synchronization needed.'
  ],

  inTheWild: [
    'A "double-checked locking" singleton that occasionally returns a half-constructed object to another thread — the classic reason `volatile` is required on the singleton field.',
    'A worker thread that never notices a `shutdown` flag flip to true, because the flag is a plain boolean the JIT cached in a register instead of re-reading from memory.',
    'Interview question: "Why does adding `volatile` fix a thread that never sees an update, when the value clearly changed?" — this concept is the entire answer.'
  ],

  showMe: {
    caption: 'A shutdown flag that may never be observed by a worker thread, and the volatile fix.',
    bad: {
      language: 'java',
      code:
        'public class Worker extends Thread {\n' +
        '    private boolean running = true; // plain field — no visibility guarantee\n\n' +
        '    public void run() {\n' +
        '        while (running) {\n' +
        '            doWork();\n' +
        '        }\n' +
        '    }\n\n' +
        '    public void shutdown() { running = false; } // called from another thread\n' +
        '}',
      explanation:
        'Nothing here forces the JIT to re-read "running" from main memory on every loop iteration — it is legal for the ' +
        'JIT to cache it once and spin forever, because from a single-thread\'s perspective the value never changes.'
    },
    good: {
      language: 'java',
      code:
        'public class Worker extends Thread {\n' +
        '    private volatile boolean running = true; // guarantees visibility across threads\n\n' +
        '    public void run() {\n' +
        '        while (running) {\n' +
        '            doWork();\n' +
        '        }\n' +
        '    }\n\n' +
        '    public void shutdown() { running = false; }\n' +
        '}',
      explanation:
        '`volatile` forces every write to be flushed immediately and every read to check main memory, establishing a ' +
        'happens-before relationship — the worker thread is now guaranteed to observe shutdown() eventually.'
    }
  },

  impact: {
    before: 'A worker thread that may spin forever, invisible in testing, appearing only under production JIT optimization levels.',
    after: 'A worker thread guaranteed to observe the shutdown signal within a bounded, short time.',
    metric: 'This class of bug typically manifests as "it only hangs in production, never in dev" — fixing visibility eliminates an entire category of unreproducible incidents.'
  },

  alternatives: [
    {
      name: 'volatile field',
      whenToUse: "A single flag/reference where you need visibility but don't need compound atomic operations (like increment).",
      whenNotToUse: 'You need "read-modify-write" to be atomic (e.g. a counter) — volatile alone does not make ++ atomic.'
    },
    {
      name: 'synchronized block/method',
      whenToUse: 'You need both visibility AND mutual exclusion (only one thread executing a critical section at a time).',
      whenNotToUse: 'High-contention hot paths where lock overhead matters — consider java.util.concurrent.atomic classes instead.'
    },
    {
      name: 'java.util.concurrent.atomic (AtomicBoolean, AtomicInteger, ...)',
      whenToUse: 'Simple atomic counters/flags with compound operations (compareAndSet, incrementAndGet) without needing a full lock.',
      whenNotToUse: 'You need to atomically update multiple related fields together — a single Atomic* type only covers one value.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming `volatile` makes `count++` thread-safe.',
      why:
        '`volatile` guarantees visibility of each individual read and write, but `count++` is actually three separate ' +
        'operations (read, add one, write) — two threads can both read the same value before either writes back, losing an update, ' +
        'even though every individual read/write was perfectly visible.',
      fix:
        'Use `AtomicInteger.incrementAndGet()` (a true atomic compound operation) or a `synchronized` block around the whole read-modify-write sequence.'
    }
  ],

  proveIt: {
    question:
      'Thread A writes to a plain (non-volatile, non-synchronized) field. Thread B reads that same field in a loop. Is ' +
      'Thread B GUARANTEED to eventually see the new value?',
    answer:
      'No — without an established happens-before relationship (volatile, synchronized, final-field-after-construction, etc.), ' +
      'there is no guarantee Thread B ever observes the write, no matter how long it waits.'
  },

  oneLiner: 'No happens-before, no guarantee — visibility across threads is opt-in, not automatic.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading',
      note: 'Multithreading covers how to create and run threads; the JMM covers the much harder question of what those threads can safely see about each other.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'concurrency-countdownlatch-cyclicbarrier-semaphore-threadlocal-forkjoinpool-completablefuture',
      title: 'Concurrency Utilities',
      note: 'Every one of these utility classes is internally built on the exact happens-before guarantees described here — they exist so you rarely need to reason about the JMM directly.'
    }
  ]
};
