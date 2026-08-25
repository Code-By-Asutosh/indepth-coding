import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Concurrency Drill -> CompletableFuture & Parallel Streams.
 * Why Future.get() blocks your designs, how CompletableFuture composes async
 * pipelines, and when parallel streams help versus quietly hurt.
 */
export const COMPLETABLEFUTURE_PARALLEL_STREAMS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'concurrency-drill',
  conceptId: 'completablefuture-parallel-streams',
  title: 'CompletableFuture & Parallel Streams',
  topicType: 'runtime-internals',

  simpleIntuition:
    'The ShopSphere product page needs three things before rendering: product details, live pricing, and the review summary. Version one calls them sequentially - 200ms + 150ms + 300ms = 650ms of pure waiting. Version two uses Future: fire three tasks, collect results. But there is a catch Asutosh finds immediately - future.get() BLOCKS, so his "concurrent" code still sits frozen waiting on each task in turn, and composing logic ("pricing AND reviews, then blend") means nesting gets inside timeouts with no clean way to say "when both finish, THEN do this". CompletableFuture is Java\'s answer to that complaint: futures you can CHAIN like sentences - do this, then that, when both are ready combine them, if anything fails recover gracefully - without any thread sitting still.',

  formalMeaning:
    'CompletableFuture implements Future AND CompletionStage: it represents a value that will exist later, and lets you attach continuations (thenApply, thenCompose, thenCombine, thenAccept) that run when it completes - either on the completing thread, a supplied executor, or ForkJoinPool.commonPool() by default. Multiple futures combine via allOf/anyOf. Completion can also be triggered manually (complete, completeExceptionally), making it a promise as well as a future. Parallel streams are the sibling feature: parallel() splits a stream across ForkJoinPool.commonPool workers for data-parallel computation - ideal for CPU-bound bulk transforms, counterproductive for IO-bound or tiny workloads.',

  whyItExists:
    'Future alone solves "run this elsewhere" but not "coordinate several of those elegantly": get() blocks the calling thread, there is no callback on completion, no combining, no error pipeline, no timeouts on composition - so real async code degenerated into thread + wait-notify spaghetti before Java 8. CompletableFuture exists to express DEPENDENCY GRAPHS of async work declaratively: fan-out three service calls, fan-in their results, recover from any failure, all without blocking a thread per step - which is precisely the shape of every aggregation endpoint and every saga step ever written. Parallel streams exist for the narrower case: one large CPU-bound dataset, split-and-conquer with zero boilerplate. Knowing which problem each solves - orchestration versus bulk computation - is the interview answer hiding in this lesson.',

  howItWorksInternally: [
    'Supply stage: supplyAsync(() -> fetchProduct(id)) runs the lambda on commonPool (or your executor) and hands back a CompletableFuture<Product> immediately - the calling thread is FREE.',
    'Transform without blocking: thenApply(product -> toDto(product)) registers a continuation - WHEN the source completes, the function runs with its result. Contrast with map on Future: none exists; you would have to get() and block. This callback-registration model is the entire mental shift.',
    'Choosing the execution thread: thenApply runs on the thread that COMPLETED the previous stage (fine for quick transforms); thenApplyAsync(supplier, executor) hops to a named pool - mandatory for heavy work, because hijacking the completing thread (possibly a Tomcat request thread or a shared pool worker) is how async code accidentally blocks servers.',
    'Chaining types matter in interviews: thenApply transforms VALUE→VALUE; thenCompose flattens VALUE→CompletableFuture<VALUE> (the flatMap of async - prevents CompletableFuture<CompletableFuture<T>>); thenCombine merges two independent futures; thenAccept consumes without returning; allOf waits for a set (returning Void, so collect results from the individual futures afterward); anyOf races them.',
    'Error flow: exceptions travel DOWN the chain and skip normal continuations until caught - exceptionally(ex -> fallback) recovers with a value, handle((result, ex) -> ...) sees both, whenComplete observes without altering. No try/catch gymnastics across threads; the pipeline IS the error path.',
    'Timeouts (Java 9+): orTimeout(200, MILLISECONDS) fails the stage if late; completeOnTimeout(fallback, ...) substitutes a default - production APIs always carry one of these, because a hung dependency should degrade, not hang the caller.',
    'Parallel streams mechanics: parallel() marks the pipeline; ForkJoin splits the source (arrays/ArrayList split well, LinkedList barely splits, iterate()-generated streams split terribly), computes chunks on commonPool workers, merges via the combiner. The spliterator\'s ability to split evenly IS the performance model.',
    'THE SHARED-POOL TRAP binding both topics: parallel streams AND default supplyAsync share ONE ForkJoinPool.commonPool sized at cores-1. Block those threads on IO (a slow HTTP call inside a parallel stream) and EVERY parallel stream and async task in the JVM starves - one feature\'s latency becomes the whole process\'s latency.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    REQ["GET product page"] --> F1["supplyAsync: product details<br/>~200ms"]\n    REQ --> F2["supplyAsync: live pricing<br/>~150ms"]\n    REQ --> F3["supplyAsync: review summary<br/>~300ms"]\n    F1 --> ALL["allOf waits for all three"]\n    F2 --> ALL\n    F3 --> ALL\n    ALL --> BLEND["thenCombine / build DTO<br/>~10ms"]\n    BLEND --> RES["respond in ~310ms<br/>not 650ms sequential"]\n    F3 -.->|"fails?"| REC["exceptionally:<br/>serve cached summary"]',
      caption: 'Fan-out, fan-in, recover - the aggregation pattern CompletableFuture was born for.'
    },
    {
      mermaid: 'flowchart LR\n    SRC["10M-item list<br/>parallel()"] --> SPL["ForkJoin splits chunks"]\n    SPL --> CP["ForkJoinPool.commonPool<br/>cores-1 threads - SHARED!"]\n    CP --> MERGE["combine partial results"]\n    WARN["slow HTTP call inside<br/>a parallel stream"] -.->|"blocks workers"| CP\n    CP -.->|"starves"| OTHER["every parallel stream<br/>+ default supplyAsync JVM-wide"]',
      caption: 'One shared pool under everything - the reason IO inside parallel streams is a landmine.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a restaurant kitchen: Future is ordering at the counter and STANDING THERE staring at the kitchen until your dish arrives (get() blocks). CompletableFuture is the buzzer: order, sit down, and the kitchen triggers your NEXT course automatically when the current one lands - sides combine when both buzz, a burnt dish triggers the "comp the dessert" recovery path automatically. Parallel streams are a buffet assembly line: one giant tray split across six chefs - brilliant for chopping 10k vegetables, absurd for asking six chefs to each wait on one phone call.',
    'thenApply vs thenCompose vs thenCombine - recite as: map, flatMap, zip. The middle one exists to prevent nested futures; mixing them up is the #1 written-test trap.',
    'commonPool discipline: default pools are for SHORT CPU work; every IO-flavored async task gets a dedicated executor - say this sentence unprompted and you sound production-scarred.',
    'Manual completion - CompletableFuture as a promise: complete(value) / completeExceptionally(t) let framework code settle a future later (message listeners completing request-scoped futures is the canonical pattern in gateway designs).',
    'Parallel stream prerequisites checklist: large N, CPU-bound per-element work, cheap-to-split source (ArrayList/array yes, LinkedList/iterate no), stateless non-interfering lambdas, combinable accumulator/combiner. Any check failing → sequential stream or explicit executor pool instead.'
  ],

  realWorldExamples: [
    'ShopSphere product page aggregation: three supplyAsync calls on a dedicated ioPool + allOf + orTimeout + exceptionally-cached-fallback - page latency = slowest dependency, not their sum; one dependency down degrades gracefully.',
    'Spring reality: @Async returns CompletableFuture; WebFlux/Reactor is the same continuation philosophy industrialized - interviewers often probe CF precisely to bridge into reactive understanding.',
    'Report generation: parallel stream over an in-memory million-row list for a CPU-only transform (normalize strings, compute stats) - legitimate 4-6x win on 8 cores; same code with a DB call per row would have melted the shared pool.',
    'Interview reality: "Why is CompletableFuture better than Future?" opens the round; "what pool runs thenApply by default?" and "what happens if you block inside a parallel stream?" separate the rehearsed from the understanding.'
  ],

  complexityAndTradeoffs: [
    'Latency model: sequential N calls cost their SUM; fanned-out async costs the MAX - the single most quotable number-shape of this lesson (650ms → 310ms).',
    'Complexity tax: async pipelines are harder to debug (stack traces hop stages) - mitigate with stage names, structured logging of correlation ids, and not building cathedral chains where three sequential calls would read fine.',
    'commonPool sizing: cores-1 workers for the WHOLE JVM - generous for transforms, catastrophic for IO; dedicated pools cost thread memory but buy isolation.',
    'Parallel stream speedup is workload-shaped: ideal split + CPU-heavy elements → near-linear; poor spliterator or tiny N → slower than sequential (coordination overhead). Measure, never assume.',
    'Use CompletableFuture when: composing multiple IO operations or building non-blocking endpoints. Use parallel streams when: one big in-memory CPU-bound transform. Use neither when: work is trivially fast - async ceremony around 5ms of work is negative value.'
  ],

  commonMistakes: [
    'Calling get() immediately after every supplyAsync - recreating sequential blocking with extra threads ("I used CompletableFuture" does not change that three blocking gets in sequence still sum latencies). Fix: compose first (allOf/thenCombine), join ONCE at the end; the pipeline structure IS the performance.',
    'Blocking calls inside thenApply without an executor - the completing thread (often commonPool or worse, your Tomcat thread) executes your slow HTTP call. Fix: any stage doing IO gets thenApplyAsync(fn, ioPool). Rule: quick pure transforms ride inherited threads; anything network/db hops pools.',
    'Parallel streaming over a source that cannot split (LinkedList, infinite generate()) or with lambdas holding shared mutable state - results range from no speedup to wrong answers via data races. Fix: stateless lambdas only, splittable sources only; if you need to mutate a shared map during parallel processing you have designed a race, not a pipeline.',
    'Ignoring timeouts on composed futures - one hung dependency hangs the whole allOf forever, and the request thread with it. Fix: orTimeout/completeOnTimeout per dependency, plus a total-budget timeout at the endpoint.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere checkout must call three services before confirming an order: inventory-reserve (200ms), fraud-screen (400ms), loyalty-accrual (150ms). Current code runs them sequentially on the request thread; p99 latency is 750ms+ and Black Friday timeouts cascade.',
      question: '"Redesign the flow - what runs concurrently, what stays sequential, and how do failures degrade?"',
      answer:
        'Dependency analysis first: fraud-screen and inventory-reserve are independent of each other, but CONFIRMING the order must wait for both; loyalty-accrual does not gate confirmation at all - it can run after confirmation, asynchronously. So: fan out fraud+inventory via supplyAsync on a dedicated ioPool, combine with allOf, orTimeout at ~600ms with completeOnTimeout semantics decided by business (fraud-timeout = reject-and-review, safer default; inventory-timeout = retry queue). Confirm synchronously after the combine - p99 drops toward max(400,200)+overhead, not the sum. Loyalty fires post-confirmation as fire-and-forget with its own retry queue - its failure must never roll back a paid order. State the principle: concurrency follows the dependency graph, timeouts encode business risk, and post-commit side-effects never block the critical path. That sentence structure - graph, risk, side-effects - is what the interviewer is really grading.'
    },
    {
      situation:
        'A nightly job normalizes 2 million product titles in memory: titles.parallelStream().map(this::enrich).collect(toList()) - where enrich() calls a translation HTTP API per title. Since "parallelizing", the job got slower AND unrelated async features across the service started timing out.',
      question: '"Explain both symptoms with one root cause, then fix properly."',
      answer:
        'Root cause: IO blocking inside parallel streams on the shared ForkJoinPool.commonPool. Symptom one - slower job: two million network calls cannot go faster by adding 7 waiting workers; you added coordination overhead to pure waiting. Symptom two - JVM-wide timeouts: those same blocked workers starve commonPool, so every OTHER parallel stream and default supplyAsync task in the process queues behind them - one feature\'s IO became everyone\'s latency. Proper fix: this is a batch-IO problem, not a parallel-CPU problem - bounded dedicated pool (say 50 workers matching the translation API\'s rate limits) running CompletableFuture pipelines with per-call timeouts and retry-with-backoff, or chunked batches via the API\'s bulk endpoint if it has one. If the transform were CPU-only (string normalization, no network), THEN parallelStream over the ArrayList would be the right tool and near-linear speedup. The lesson to articulate: parallelism multiplies CPU; concurrency manages waiting - choosing the wrong one of the two is the bug.'
    }
  ],

  rapidFire: [
    {
      question: 'What does CompletableFuture add over Future?',
      answer:
        'Non-blocking composition - callbacks, chaining, combining multiple futures, error recovery paths, and manual completion - instead of blocking get() calls.'
    },
    {
      question: 'thenApply vs thenCompose?',
      answer:
        'thenApply transforms a value to another value; thenCompose flattens a value into another CompletableFuture - the async flatMap preventing nested futures.'
    },
    {
      question: 'Which thread runs thenApply by default?',
      answer:
        'Whichever thread completed the previous stage; only thenApplyAsync with an explicit executor guarantees a specific pool - default async variants use ForkJoinPool.commonPool.'
    },
    {
      question: 'How do you wait for several futures together?',
      answer:
        'CompletableFuture.allOf(...).join for all, anyOf for first - then read each future\'s result; allOf itself completes with Void.'
    },
    {
      question: 'How does error handling work in a CF chain?',
      answer:
        'Exceptions flow down the chain skipping normal stages until exceptionally supplies a fallback, handle sees result-or-exception, whenComplete observes without changing the outcome.'
    },
    {
      question: 'Which pool executes parallel streams?',
      answer:
        'ForkJoinPool.commonPool - sized cores minus one, shared JVM-wide, which is why blocking IO inside a parallel stream starves unrelated features.'
    },
    {
      question: 'When is a parallel stream actually faster?',
      answer:
        'Large datasets, CPU-bound per-element work, cheap-to-split sources like arrays or ArrayList, and stateless lambdas - otherwise coordination overhead makes sequential faster.'
    },
    {
      question: 'How do you add a timeout to a CompletableFuture?',
      answer:
        'orTimeout fails the stage after the duration; completeOnTimeout completes it with a fallback value instead - both Java 9+.'
    }
  ],

  interviewPerspective:
    'The entry question is always "Future vs CompletableFuture" - answer with the blocking problem, not a feature list. Then expect composition drills on a whiteboard: design the three-service aggregation, choose where thenCompose fits, place the timeouts. The parallel-stream follow-up is a trap-check: candidates who say "just add parallel()" fail; candidates who ask "CPU-bound or IO-bound?" pass. Finishing with the shared-commonPool starvation story signals real production scar tissue - the strongest possible close at this level.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'concurrency-drill',
      conceptId: 'synchronized-volatile-atomics-locks',
      title: 'synchronized, volatile, Atomics & Locks',
      note: 'Next lesson - the memory-visibility and mutual-exclusion toolkit underneath all async work.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams (full Learn page)',
      note: 'The sequential pipeline mechanics that parallel() switches on - know the base before the turbo.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading (full Learn page)',
      note: 'Futures and pools in full textbook depth.'
    }
  ],

  triggerSentence:
    'Fan out the waiting, chain the dependencies, never block the shared pool - orchestration is a graph, not a queue of frozen threads.'
};
