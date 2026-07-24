import { ConceptContent } from '../../models/content.model';

export const VIRTUAL_THREADS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'virtual-threads',
  title: 'Virtual Threads',

  hook:
    'You try to create one million `Thread` objects on a normal JVM and the process crashes with `OutOfMemoryError` long ' +
    'before it finishes. You try the exact same one million on a modern JDK using a one-word change, and it just works. What changed?',

  problem:
    'Traditional Java threads map 1-to-1 onto OS threads, which are expensive - each one reserves a chunk of memory for ' +
    "its stack (often 512KB-1MB) and costs real time for the OS scheduler to context-switch. This is exactly why " +
    "high-concurrency servers have historically needed carefully-sized thread pools instead of just spinning up a thread per request.",

  aha: {
    statement: 'A virtual thread is a lightweight thread MANAGED BY THE JVM, not the OS - thousands of them can share a small pool of real OS threads, so blocking one costs almost nothing.',
    analogy:
      "A platform (OS) thread is like giving every single customer their own permanent, dedicated waiter for their entire " +
      "visit, whether they're actively ordering or just sitting quietly - expensive if you have a million customers. A " +
      "virtual thread is like a shared pool of waiters who instantly hop to serve WHICHEVER customer currently needs " +
      "attention, and step away the instant a customer is just sitting there waiting (e.g. for food/a database call) - the same small staff can serve enormous numbers of customers."
  },

  underTheHood: [
    'A virtual thread is created with `Thread.ofVirtual().start(...)` (or `Executors.newVirtualThreadPerTaskExecutor()`) - it behaves like a normal Thread from your code\'s perspective, but the JVM manages it very differently underneath.',
    'Virtual threads run on top of a small pool of "carrier" platform threads (roughly one per CPU core by default). When a virtual thread performs a BLOCKING operation (I/O, waiting on a lock, etc.), the JVM unmounts it from its carrier thread, freeing that carrier to run a different virtual thread.',
    'When the blocking operation completes, the virtual thread is re-mounted onto SOME available carrier thread (not necessarily the same one) to continue - all of this happens transparently, without your code needing any special "async" syntax.',
    'This means you can write completely normal, blocking-style, sequential code (`String result = httpClient.send(request);`) and still get the scalability benefits usually associated with asynchronous/reactive programming - no callbacks, no CompletableFuture chains required.',
    'Virtual threads are cheap enough (a few hundred bytes, not megabytes) that "one virtual thread per request/task" becomes a completely reasonable default again, reversing decades of "always use a bounded thread pool" advice for I/O-bound workloads.',
    'Virtual threads do NOT help CPU-bound work - if a virtual thread is doing pure computation and never blocks, it monopolizes its carrier thread just like a platform thread would; the benefit is specifically for I/O-bound, blocking-heavy workloads.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart LR\n' +
        '  V1["Virtual Thread 1\\n(blocked on I/O)"] -.unmounted.-> Pool\n' +
        '  V2["Virtual Thread 2\\n(running)"] --> Carrier1["Carrier Thread"]\n' +
        '  V3["Virtual Thread 3\\n(running)"] --> Carrier2["Carrier Thread"]\n' +
        '  subgraph Pool["Small pool of OS carrier threads"]\n' +
        '    Carrier1\n' +
        '    Carrier2\n' +
        '  end',
      caption: 'Thousands of virtual threads share a handful of real OS carrier threads - blocked ones simply step aside.'
    }
  ],

  inTheWild: [
    'A web server handling 50,000 concurrent slow, blocking downstream API calls - previously requiring a very large, carefully-tuned platform thread pool (or a full rewrite to reactive/async style); with virtual threads, "one virtual thread per request" scales naturally.',
    'A batch job firing off tens of thousands of concurrent HTTP requests, previously requiring careful async/reactive orchestration, now expressible as a simple loop spawning one virtual thread per request.',
    'Interview question: "Do virtual threads replace the need for reactive programming (WebFlux, RxJava)?" - largely for I/O-bound scalability, yes; but reactive frameworks still offer additional features (backpressure, complex operator pipelines) virtual threads alone do not provide.'
  ],

  showMe: {
    caption: 'Spawning many concurrent blocking tasks with platform threads (expensive, limited) vs virtual threads.',
    bad: {
      language: 'java',
      code:
        '// Platform threads - each one costs real OS memory/scheduling overhead\n' +
        'ExecutorService pool = Executors.newFixedThreadPool(200); // capped - a deliberate limit\n' +
        'for (int i = 0; i < 100_000; i++) {\n' +
        '    pool.submit(() -> callSlowDownstreamApi()); // most requests QUEUE, waiting for a free thread\n' +
        '}',
      explanation:
        'The pool must stay small (a few hundred threads at most) because each platform thread genuinely costs real OS ' +
        'memory - with 100,000 slow tasks and only 200 threads, most requests sit queued, waiting their turn.'
    },
    good: {
      language: 'java',
      code:
        '// Virtual threads - cheap enough to spawn one per task\n' +
        'try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {\n' +
        '    for (int i = 0; i < 100_000; i++) {\n' +
        '        pool.submit(() -> callSlowDownstreamApi()); // each gets its OWN virtual thread\n' +
        '    }\n' +
        '} // all 100,000 tasks can genuinely run "concurrently" - blocked ones cost almost nothing',
      explanation:
        'Because a blocked virtual thread costs almost no resources (it unmounts from its carrier while waiting), ' +
        'spawning one per task is completely reasonable even at 100,000 concurrent blocking calls - no manual pool sizing tuning required.'
    }
  },

  impact: {
    before: 'A hard-capped thread pool where most concurrent I/O-bound requests wait in a queue for a free thread.',
    after: 'Effectively unlimited concurrent blocking tasks, each with its own lightweight virtual thread, with no queueing bottleneck from thread pool size.',
    metric: 'Workloads dominated by blocking I/O (typical of most web services calling databases/downstream APIs) commonly see order-of-magnitude increases in achievable concurrency with the same hardware.'
  },

  alternatives: [
    {
      name: 'Virtual threads (Thread.ofVirtual / newVirtualThreadPerTaskExecutor)',
      whenToUse: 'I/O-bound workloads (network calls, database queries, file I/O) where you want simple, sequential, blocking-style code that still scales to huge concurrency.',
      whenNotToUse: 'Pure CPU-bound computation (no blocking at all) - virtual threads provide no benefit there; a fixed platform thread pool sized to CPU core count is still correct.'
    },
    {
      name: 'Reactive programming (WebFlux, RxJava)',
      whenToUse: 'You need advanced stream operators, backpressure handling, or are already deeply invested in a reactive stack.',
      whenNotToUse: "You just wanted the scalability benefit and don't need the added operator complexity - virtual threads often achieve the same scalability with much simpler, sequential code."
    },
    {
      name: 'Fixed-size platform thread pool',
      whenToUse: 'CPU-bound work, where you deliberately want to cap parallelism to the number of physical cores.',
      whenNotToUse: 'I/O-bound work with high concurrency needs - platform threads are too expensive per-thread to scale to tens of thousands.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Using virtual threads for CPU-bound, non-blocking computation, expecting the same scalability benefit as I/O-bound code.',
      why:
        "Virtual threads only yield their carrier thread when they BLOCK. A virtual thread doing pure CPU work never " +
        "blocks, so it simply occupies its carrier thread the entire time, exactly like a platform thread would - spawning " +
        "a huge number of them for CPU-bound work just creates a huge number of threads all competing for the same limited CPU cores, with no benefit.",
      fix:
        "Reserve virtual threads for I/O-bound, blocking-heavy workloads. For CPU-bound parallel computation, a bounded " +
        "pool sized to the number of CPU cores (e.g. ForkJoinPool.commonPool()) is still the right tool."
    }
  ],

  proveIt: {
    question:
      'You spawn 10,000 virtual threads, each doing pure CPU-bound matrix multiplication with no blocking calls at all, ' +
      'on an 8-core machine. Does this scale the way it would for 10,000 virtual threads each making a slow network call?',
    answer:
      "No - since none of these virtual threads ever block, they never unmount from their carrier threads, so effectively " +
      'only 8 (roughly one per core) can make real progress at a time, just like 10,000 platform threads would behave on 8 cores. Virtual threads only help when the workload actually blocks.'
  },

  oneLiner: 'Virtual threads make blocking cheap again - you get the simplicity of sequential code with the scalability that used to require async/reactive rewrites.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading',
      note: 'Virtual threads are still threads, sharing the same memory model and race-condition risks covered in Multithreading - the JMM rules do not change, only the cost model of creating and blocking a thread does.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'structured-concurrency',
      title: 'Structured Concurrency',
      note: 'Structured Concurrency is the API designed specifically to make managing large numbers of virtual threads (spawned for one logical task) safe and easy to reason about.'
    }
  ]
};
