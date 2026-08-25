import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Concurrency Drill -> Threads to ThreadPoolExecutor.
 * Why raw threads hurt, what ExecutorService buys, and the ThreadPoolExecutor
 * submission-order surprise (core -> queue -> max -> reject) that separates
 * explainers from reciters.
 */
export const THREADS_TO_THREADPOOLEXECUTOR: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'concurrency-drill',
  conceptId: 'threads-to-threadpoolexecutor',
  title: 'Threads to ThreadPoolExecutor',
  topicType: 'runtime-internals',

  simpleIntuition:
    'ShopSphere\'s checkout sends a confirmation email after every order. Version one calls the email service inline - and customers stare at a spinner for three seconds because THEIR purchase is waiting for THEIR email. Asutosh\'s first fix: new Thread(() -> sendEmail(order)).start() per order. Works beautifully on demo day, dies on launch day - two thousand shoppers place orders in a minute, two thousand threads spawn, each costing real memory and OS setup, and the JVM spends more time birthing threads than selling mugs. The lesson every Java engineer learns here: threads are EXPENSIVE workers, so you hire a fixed TEAM of them once and hand them a queue of tasks. That team-with-a-queue is exactly what ThreadPoolExecutor is.',

  formalMeaning:
    'A Thread is an OS-scheduled execution path with its own stack; Runnable is a task returning nothing, Callable<V> a task returning a value and able to throw checked exceptions. Creating threads per-task wastes memory (roughly a megabyte stack each) and kernel time, so production code delegates to an ExecutorService - most concretely ThreadPoolExecutor, which manages a pool of worker threads plus a task queue: corePoolSize threads are kept always alive, extra demand queues up, overflow beyond maxPoolSize triggers rejection policies. Workers loop forever: take a task from the queue, run it, repeat.',

  whyItExists:
    'Without pooling, concurrency cost scales with REQUEST count instead of with CPU cores - thread creation latency lands on your critical path, unbounded memory growth meets OutOfMemoryError: unable to create native thread, and context-switch overhead quietly eats throughput. Without Callable/Future, spawning a thread that must RETURN something means hand-rolled shared-state plumbing. The Executor framework exists to invert control: you declare WHAT runs concurrently and HOW MANY workers exist; the framework handles lifecycle, queuing, and backpressure. Every web server you have ever used - Tomcat included - is this exact pattern underneath: a bounded pool accepting requests into a bounded queue.',

  howItWorksInternally: [
    'Thread basics in one breath: new Thread(runnable).start() forks an OS thread; start() (never run() - calling run() directly executes on the CURRENT thread, a classic trick question) begins scheduling; join() waits; setDaemon(true) marks background threads that will not keep the JVM alive.',
    'Runnable vs Callable: Runnable.run returns void and cannot throw checked exceptions; Callable.call returns V and can throw. submit(callable) hands you a Future<V> holding the eventual result; execute(runnable) is fire-and-forget.',
    'ThreadPoolExecutor anatomy - seven knobs: corePoolSize, maximumPoolSize, keepAliveTime (idle lifetime for threads ABOVE core), workQueue, threadFactory (naming! debugging!), RejectedExecutionHandler.',
    'THE SUBMISSION ORDER (memorize this sequence): a submitted task spawns a NEW thread only while poolSize < corePoolSize. After core is warm, tasks QUEUE. Only when the queue is FULL does the pool grow toward maxPoolSize. When max threads + full queue both hit, the REJECTION policy fires (AbortPolicy default throws, CallerRunsPolicy makes the SUBMITTER run it - natural backpressure, DiscardPolicy silently drops).',
    'The counterintuitive corollary everyone trips on: with an UNBOUNDED queue (Executors.newFixedThreadPool uses LinkedBlockingQueue with no cap), the queue never fills - so maxPoolSize is NEVER reached. Your "elastic" pool was a fixed-size pool all along, and a memory-hoarding queue besides.',
    'Why Executors factory shortcuts get banned in style guides: newCachedThreadPool allows Integer.MAX_VALUE threads (unbounded thread explosion under burst), newFixedThreadPool allows unbounded queued tasks (unbounded memory under burst). Production answer: construct ThreadPoolExecutor explicitly with BOUNDED queue + chosen rejection policy + named thread factory.',
    'Graceful shutdown ritual: shutdown() stops ACCEPTING new tasks but finishes queued ones; awaitTermination(timeout) bounds your patience; shutdownNow() interrupts running workers and drains the queue (tasks must handle interruption!). Spring apps get this near-free - @PreDestroy on executor beans or Boot\'s auto-configured TaskExecutor lifecycle.',
    'Sizing rule of thumb worth reciting: CPU-bound work → pool ≈ cores or cores+1 (more just adds context switches); IO-bound work (HTTP calls, DB) → threads mostly WAIT, so size ≈ cores x (1 + wait-time/compute-time) - a pool of 200 waiting-on-MySQL threads is fine, a pool of 200 crunching numbers is thrash.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    T["submit(task)"] --> C{"poolSize < corePoolSize?"}\n    C -->|yes| NW["spawn new worker thread"]\n    C -->|no| Q{"workQueue offer succeeds?"}\n    Q -->|yes| ENQ["task waits in queue<br/>idle workers pick it up"]\n    Q -->|no| M{"poolSize < maxPoolSize?"}\n    M -->|yes| NX["spawn EXTRA thread<br/>up to maximumPoolSize"]\n    M -->|no| REJ["rejection policy:<br/>Abort / CallerRuns / Discard"]',
      caption: 'Core threads first, THEN the queue, THEN extra threads, finally rejection - say this sequence and interviewers nod.'
    },
    {
      mermaid: 'flowchart LR\n    subgraph POOL["ThreadPoolExecutor - 4 workers"]\n    W1["worker-1"] --- W2["worker-2"] --- W3["worker-3"] --- W4["worker-4"]\n    end\n    ORDERS["order emails queue"] -->|"take()"| POOL\n    POOL --> E1["email sent 1"]\n    POOL --> E2["email sent 2"]\n    COST["new Thread per order:<br/>~1MB stack EACH,<br/>OS syscall EACH"] -.->|replaced by| POOL',
      caption: 'Fixed team + queue replaces per-request thread births - same idea as Tomcat\'s request handling.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a bank branch: ThreadPoolExecutor is the branch manager who keeps FOUR tellers on staff all day (core pool). Rush hour makes lines longer before management hires temporary tellers (max pool) - and only when even the waiting area is FULL do they start turning people away politely (rejection policy). Hiring a brand-new teller for every single customer would be absurd - that is new Thread() per task.',
    'Callable + Future pair - the "task with a receipt" pattern: submit returns Future immediately; future.get() collects later (blocking). Sets up next lesson\'s star: CompletableFuture removes the blocking part.',
    'RejectedExecutionHandler menu: AbortPolicy (throw - loud failure), CallerRunsPolicy (submitter executes - slows the producer naturally, elegant backpressure), DiscardPolicy (silent drop - rarely acceptable for orders/payments), custom handler (log + persist + retry).',
    'threadFactory - unsung hero: name threads ("order-mail-pool-3") so thread dumps read like stories instead of pool-7-thread-1 mysteries; also set daemon flag and uncaughtExceptionHandler there.',
    'BlockingQueue choices shape behavior: ArrayBlockingQueue(bounded - forces the max-pool path to actually engage), LinkedBlockingQueue(unbounded by default - disables it), SynchronousQueue (zero capacity - every handoff needs an immediate free thread, used by cached pools), PriorityBlockingQueue for priority jobs.'
  ],

  realWorldExamples: [
    'ShopSphere order pipeline: explicit ThreadPoolExecutor(8, 16, 60s, ArrayBlockingQueue(500), named factory, CallerRunsPolicy) - burst shoppers slow down gracefully instead of crashing the email integration.',
    'Tomcat reality: server.tomcat.threads.max (default 200) IS a bounded worker pool - your @RequestMapping methods run as its tasks; blocking one thread blocks CAPACITY, which is why slow DB calls exhaust whole servers.',
    '@Async in Spring: backed by a ThreadPoolTaskExecutor - misconfigured defaults caused the infamous "everything runs on ONE thread" bug when someone defined their own executor bean without enough capacity; knowing the knobs explains the mystery.',
    'Interview opener reality: "Runnable vs Callable" then "explain ThreadPoolExecutor parameters" then the submission-order question - this ladder appears in a large share of Indian backend interviews at 4+ years.'
  ],

  complexityAndTradeoffs: [
    'Thread cost baseline: roughly 1MB virtual stack reserved + native allocation + scheduler entry - thousands of idle threads waste GBs before doing any work.',
    'Context switching: each switch flushes CPU caches (~microseconds); oversubscribed pools spend more time switching than computing - the silent throughput killer behind "we added threads and got slower".',
    'Bounded queue trade-off: small queue engages max-pool elasticity sooner but rejects more under spikes; huge queue absorbs spikes but delays everything behind it and hides overload. Choose from latency tolerance, not vibes.',
    'CallerRuns vs Abort: CallerRuns protects data (nothing dropped) at the cost of slowing the submitting thread - wrong for latency-critical front doors, right for internal pipelines. Abort surfaces problems loudly - better when silence is worse than failure.',
    'Use explicit ThreadPoolExecutor when: load profile matters (it always does in production paths). Avoid Executors shortcuts when: bursts exist (they do), memory limits matter (they do).'
  ],

  commonMistakes: [
    'Calling run() instead of start(). Compiles, runs... sequentially on the caller\'s thread - zero concurrency, tests pass, nothing parallel ever happened. Hurts because the bug is invisible until someone profiles. Fix: start() spawns the OS thread; run() is just a method call. Say it verbatim if asked "how do you start a thread?".',
    'Using newCachedThreadPool for request-ish workloads because "it auto-scales". Under a traffic spike it happily creates thousands of threads → OOM: unable to create native thread, exactly when the business needed stability. Fix: bounded pool + bounded queue + deliberate rejection policy.',
    'Assuming maxPoolSize provides elasticity while using the default/unbounded queue. The queue fills FIRST (never, if unbounded) - extra threads never spawn; the knob silently does nothing. Fix: bounded queue, or explain the sequence when interviewed - this single point upgrades the whole answer.',
    'Forgetting shutdown on manually-managed executors in long-lived containers - threads linger, graceful deploys hang, thread dumps fill with zombies. Fix: shutdown() → awaitTermination → shutdownNow() chain, wired to application lifecycle (@PreDestroy / SmartLifecycle).'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere\'s notification service uses Executors.newFixedThreadPool(10) to push ~50k daily notifications. During Diwali sales, notifications lag hours behind orders; heap dumps show millions of queued tasks.',
      question: '"Diagnose from these facts alone, then redesign."',
      answer:
        'Diagnosis: fixed pool means exactly ten workers; the unbounded LinkedBlockingQueue absorbed unlimited backlog - so the system NEVER rejected work, it just fell behind silently, and heap growth mirrors queue growth. Two independent levers, applied after measuring WHY each task takes its time: if tasks are IO-bound (HTTP push calls waiting seconds), ten workers is simply undersized relative to wait ratio - raise workers substantially or make pushes async/non-blocking. If downstream providers throttle, more workers will not help - batch or rate-limit instead. Redesign I would propose: explicit ThreadPoolExecutor sized from measured wait/compute ratio, BOUNDED queue (say 5k) tuned from acceptable latency, rejection via CallerRunsPolicy or persist-and-retry handler so no notification is lost, named thread factory for dump readability, plus a queue-depth gauge exported to CloudWatch with an alarm - lag becomes visible BEFORE customers notice. The meta-point to state: unbounded queues convert overload from loud failure into quiet debt.'
    },
    {
      situation:
        'A teammate proposes processing uploaded bulk-inventory CSVs with "one thread per file since files are independent". Upload bursts reach 300 concurrent files, each parse-heavy (CPU-bound) taking ~4 seconds single-threaded on an 8-core ECS task.',
      question: '"Evaluate the proposal with numbers, give the pool design."',
      answer:
        'Numbers first: 300 simultaneous JVM threads on 8 cores means ~37 threads competing per core - massive context-switch overhead and ~300MB of stack reservation for ZERO extra compute throughput, because CPU-bound work cannot exceed core count anyway. Correct design: fixed pool of cores+1 (9) for parse tasks - throughput identical to 300 threads, resource footprint tiny; accept files quickly into a bounded queue (uploads return 202-Accepted immediately, status polled), rejection policy can be Abort since upstream can retry. If parsing were IO-bound instead - say each row triggered an API call - the math flips entirely toward many more threads or async IO. State the sizing formula explicitly (CPU-bound: N+1; IO-bound: N x (1 + W/C)) - quoting the reasoning matters more than the constants, and volunteering "the workload type decides, not intuition" is the senior move.'
    }
  ],

  rapidFire: [
    {
      question: 'Difference between Runnable and Callable?',
      answer:
        'Runnable returns void and cannot throw checked exceptions; Callable returns a value and may throw - retrieved through the Future returned by submit.'
    },
    {
      question: 'What happens if you call run() instead of start()?',
      answer:
        'Nothing concurrent - run() executes the task on the current thread like any method call; start() is what actually creates and schedules the new thread.'
    },
    {
      question: 'Name the seven ThreadPoolExecutor constructor parameters.',
      answer:
        'corePoolSize, maximumPoolSize, keepAliveTime with unit, workQueue, threadFactory, and rejected execution handler.'
    },
    {
      question: 'When does a ThreadPoolExecutor create threads beyond core size?',
      answer:
        'Only when the workQueue is FULL - after core threads are busy, tasks queue first; extra threads up to max spawn on queue overflow, then the rejection policy fires.'
    },
    {
      question: 'Why is Executors.newFixedThreadPool considered risky?',
      answer:
        'Its unbounded LinkedBlockingQueue means maxPoolSize never engages and task backlog grows without limit - memory pressure and hidden latency under bursts.'
    },
    {
      question: 'What does CallerRunsPolicy do?',
      answer:
        'On saturation, the SUBMITTING thread runs the task itself - natural backpressure that slows producers instead of dropping or throwing.'
    },
    {
      question: 'shutdown() vs shutdownNow()?',
      answer:
        'shutdown stops accepting new tasks but completes queued ones; shutdownNow interrupts running tasks and returns the drained queue - graceful deployments use shutdown, awaitTermination, then shutdownNow.'
    },
    {
      question: 'How do you size a pool for CPU-bound vs IO-bound work?',
      answer:
        'CPU-bound: about cores plus one - extra threads only add context switches; IO-bound: cores times (1 + wait-to-compute ratio) since threads spend time blocked rather than computing.'
    }
  ],

  interviewPerspective:
    'This lesson anchors the entire concurrency round. Expect the ladder: Runnable/Callable → why pools → the seven parameters → submission order → why not Executors factories → sizing. The submission-order question is the filter: candidates who say "max threads spawn when load rises" reveal they never traced put(); those who recite core→queue→max→reject get promoted to design discussions. Close strong by connecting to Tomcat\'s request pool or @Async defaults - showing the abstraction lives in YOUR production stack, not just java.util.concurrent.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'concurrency-drill',
      conceptId: 'completablefuture-parallel-streams',
      title: 'CompletableFuture & Parallel Streams',
      note: 'Next lesson - futures that compose without blocking the caller.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading (full Learn page)',
      note: 'The complete textbook foundation - thread states, lifecycle, coordination primitives.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'virtual-threads',
      title: 'Virtual Threads',
      note: 'Where cheap-thread economics changes the sizing rules - know it exists and when it applies.'
    }
  ],

  triggerSentence:
    'Hire a team, feed a queue, cap the line - threads are workers, not confetti.'
};
