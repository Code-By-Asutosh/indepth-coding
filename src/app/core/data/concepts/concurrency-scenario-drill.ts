import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Concurrency Drill -> Concurrency Scenario Drill.
 * The war-room finale: mixed production cases forcing pools, futures,
 * visibility tools, and deadlock discipline to work as one system.
 */
export const CONCURRENCY_SCENARIO_DRILL: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'concurrency-drill',
  conceptId: 'concurrency-scenario-drill',
  title: 'Concurrency Scenario Drill',
  topicType: 'concept',

  simpleIntuition:
    'Collections had its war-room; concurrency gets two because timing bugs are where four-year engineers most often meet five-year questions. Nobody asks "define ExecutorService" at Round 2 - they describe ShopSphere\'s checkout slowing down under sale traffic, or a singleton misbehaving on launch morning, then watch which tool you reach for FIRST and whether you name the trade-off before being asked. This page is that pressure, rehearsed. Answer out loud, time yourself, THEN read the model answers - and notice every one follows the same skeleton: classify the problem (visibility? atomicity? capacity? ordering?), choose by guarantee needed, volunteer the escape hatch.',

  formalMeaning:
    'A rehearsal set of concurrency judgment: each drill pairs a realistic incident or design prompt with a model answer demonstrating the senior response shape - diagnose by failure class, select tools by the guarantee they provide (visibility, atomicity, exclusion, coordination), quantify with sizing math where relevant, and close with the production guardrail (metrics, alarms, tests) that keeps the fix honest.',

  whyItExists:
    'Concurrency knowledge fragments into disconnected trivia under study - volatile here, pools there - but incidents arrive ENTANGLED: a latency spike is really pool exhaustion caused by blocking calls caused by a shared-pool starvation. Drilling mixed cases welds the pieces into decision reflexes; it also rehearses the communication shape interviewers grade hardest: calm classification before solutioning. Skipping this page leaves you someone who knows the words; doing it makes you the candidate whose answers sound like they have carried a pager.',

  howItWorksInternally: [
    'Run drills cold: 60 seconds thinking, 2 minutes answering aloud per case - no pausing mid-answer, interviews do not allow it either.',
    'Grade against the four-beat shape: (1) classified the failure type explicitly, (2) chose tools naming the GUARANTEE each provides, (3) quantified something - sizes, latencies, ratios, (4) closed with a guardrail (test, metric, alarm).',
    'Star anything below three beats; re-drill starred items after 48 hours cold.',
    'Weekly interleave: mix these with Collections Scenario Drill cases randomly - real rounds switch domains mid-conversation without warning.',
    'After grading, reconstruct each model answer\'s SKELETON from memory - the transferable part is the arc, not the sentences.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    P["concurrency problem lands"] --> Q1{"Data wrong sometimes<br/>or system frozen/slow?"}\n    Q1 -->|wrong data silently| R1["race family:<br/>visibility? -> volatile<br/>atomicity? -> atomics / locks / DB-conditional"]\n    Q1 -->|frozen forever| R2["deadlock check:<br/>thread dump -> BLOCKED cycle?<br/>fix: lock order + tryLock"]\n    Q1 -->|slow under load only| R3["capacity family:<br/>pool sizing, unbounded queues,<br/>blocking IO in shared pools"]\n    R3 --> Q2{"CPU-bound or IO-bound?"}\n    Q2 -->|"IO"| R4["more workers OR async IO,<br/>dedicated pools per dependency"]\n    Q2 -->|"CPU"| R5["cores+1, parallel streams OK"]',
      caption: 'The triage reflex - classify first, then reach for tools by guarantee, never by familiarity.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - this page is the fire drill after equipment training: same extinguishers (the four prior lessons), but alarms sound, smoke hides exits, and the examiner watches whether you classify the fire before spraying. Electrical fire vs grease fire vs false alarm - wrong instinct makes small problems large.',
    'The guarantee vocabulary to keep loaded: VISIBILITY (who sees writes when) → volatile/publication patterns · ATOMICITY (indivisible compound actions) → CAS atomics, synchronized, conditional DB updates · EXCLUSION ORDERING (lock hierarchy safety) → global ordering, tryLock budgets · COORDINATION/CAPACITY (work meets workers safely) → bounded pools/queues, dedicated IO pools, backpressure.',
    'Sizing formulas to recite on demand: CPU-bound pool = cores+1; IO-bound pool = cores x (1 + wait/compute); queue depth from latency budget = arrival-rate x acceptable-wait.',
    'Guardrail menu closing every answer: stress test reproducing interleavings, queue-depth/thread metrics exported, ThreadMXBean deadlock alarm, retry-with-backoff budgets, idempotent consumers.'
  ],

  realWorldExamples: [
    'Every drill below maps to a genuine recurring production pattern: pool starvation cascades, double-submitted webhooks, singleton races at startup, executor shutdown losing orders - the actual greatest-hits of backend incidents.',
    'Interview reality: SE II panels increasingly replace "explain X" with "here is our situation, what do you change?" - these six cases are representative of that genre across Indian service and product companies.'
  ],

  complexityAndTradeoffs: [
    'Drilling mixed cases vs re-reading lessons: one evening of spoken drilling outperforms another reread - retrieval plus pressure is the exact test-day condition.',
    'Depth vs breadth in answers: classifying correctly and defending ONE design with trade-offs beats listing three designs shallowly; panels probe whichever you lead with.',
    'Use this page when: module lessons done, interview within weeks. Avoid when: fundamentals feel shaky - drills amplify whatever foundation exists.'
  ],

  commonMistakes: [
    'Answering design prompts with tools instead of diagnosis ("I would use Kafka" before stating what fails). Reads as pattern-matching, invites brutal follow-ups. Fix: one sentence classifying the failure BEFORE any technology word.',
    'Ignoring the money question "what if it happens again?" - fixes without guardrails score as luck. Fix: close every drill with the test/metric/alarm that catches recurrence.',
    'Rehearsing answers verbatim until they sound recited. Panels hear it instantly and dig somewhere unprepared. Fix: memorize the four-beat SHAPE and the numbers; improvise the wording fresh.'
  ],

  scenarioDrills: [
    {
      situation:
        'ShopSphere payment webhook receiver: PSPs retry deliveries aggressively. Current handler does check-if-processed-then-insert-record then fulfill-order. During network storms, duplicate fulfillment events fire - customer charged once, shipped twice.',
      question: '"Find every race in that flow and redesign for idempotency."',
      answer:
        'Two stacked races, one design gap. Race one: check-then-insert on processing state - two concurrent webhook retries both see not-processed, both insert, both trigger fulfillment. Race two sits deeper: even single-threaded receivers can double-process across pod restarts or multiple ECS tasks, so ANY in-memory-only dedup is theater. Correct design makes idempotency structural: unique constraint on PSP transaction-id at the database - INSERT ... ON DUPLICATE KEY IGNORE style; the winner proceeds, losers detect duplicate-key and return success immediately (PSPs treat 200 as delivered, stopping retries). Fulfillment itself consumes from an ordered queue keyed by order-id so downstream is single-threaded per order regardless of upstream fan-in. State the principle: under at-least-once delivery semantics - which ALL networks and queues actually provide - dedup belongs in durable storage keyed by business identity, never in memory, never in check-then-act code. That vocabulary (at-least-once, idempotency key, unique constraint as mutex) is exactly the seniority signal.'
    },
    {
      situation:
        'Order-service uses ONE cached ThreadPoolExecutor for everything: image resizing, PDF invoices, email sends. During month-end invoice bursts, email delivery stalls AND image jobs time out; CPU sits at 30%.',
      question: '"Diagnose the architecture flaw and prescribe the split."',
      answer:
        'Diagnosis: shared unbounded pool mixes workload classes - month-end floods it with queued invoices; cached-pool threads block waiting on SMTP/HTTP (IO), starving CPU-ready resize tasks behind them in queue; 30% CPU confirms threads are WAITING, not computing - capacity is not the issue, mixing is. Also worth naming: cached pool\'s unbounded thread creation under burst risks native-thread OOM on top. Prescription: classify then isolate - dedicated bounded pools per dependency profile: cpuPool(cores+1, bounded queue, CallerRuns) for resizing; ioPool sized cores*(1+wait/compute) per external dependency (email pool separate from PDF-storage pool since their SLAs differ); priority lane if invoices must beat emails. Add queue-depth gauges + saturation alerts per pool, and timeouts around every external call so waits stay bounded. Principle stated plainly: pools are isolation boundaries like database schemas - one shared pool couples unrelated SLAs, converting one feature\'s burst into everyone\'s outage.'
    },
    {
      situation:
        'A lazy singleton ConfigHolder.getInstance() uses double-checked locking WITHOUT volatile on the instance field. Staging works for months; production occasionally sees NPEs deep inside config consumers right after deploy, unreproducible afterward.',
      question: '"Explain the impossible-looking NPE and list fixes ranked."',
      answer:
        'Mechanism: DCL without volatile lets instruction reordering publish the reference BEFORE construction finishes - a second thread passes the null-check, receives the half-built object, reads not-yet-initialized fields → NPE far from the actual site, transient, unreproducible after warmup: exactly the reported signature. Fixes ranked: (1) initialization-on-demand holder idiom - inner static class leverages JVM class-init locking: lazy, thread-safe, zero explicit synchronization, nothing to get wrong; (2) enum singleton where applicable - same guarantees plus serialization safety; (3) keep DCL but declare the field volatile - valid, yet fragile under future edits, so I rank it last among correct options. Then zoom out: modern Spring singletons are container-managed and eager-by-default, making hand-rolled laziness rare - if asked why this survived, honest answer is legacy code meeting low traffic frequency; proposing holder-idiom migration during the NEXT touch is the pragmatic senior move rather than big-bang rewrites.'
    },
    {
      situation:
        'Graceful-deploy requirement: ECS deployments must finish in-flight order submissions before task drain, but current shutdown loses roughly the last second of orders every release.',
      question: '"Design the shutdown sequence end-to-end."',
      answer:
        'Sequence: on SIGTERM, stop INGESTION first (health endpoint flips to failing so ALB drains new requests - ECS awaits deregistration), then executor.shutdown() letting queued submissions complete, awaitTermination(budget aligned to ALB drain window, say 25s), then shutdownNow() interrupting stragglers with those tasks persisted to a retry store rather than dropped. Critical detail people miss: tasks must be INTERRUPTION-AWARE - blocking calls should honor interrupts (check Thread interrupted status, handle InterruptedException by saving state), otherwise shutdownNow cannot actually stop them. Second detail: submission ACK semantics - return 503/retry-later once ingestion stops so clients/PSPs replay instead of assuming success while we drain. Verify with a deploy test in staging counting lost orders (target zero) and alarm on drain-timeout metrics in prod. The shape to narrate: stop intake → finish work with a budget → persist the rest → prove it with a number. That is a deployment story any panel buys.'
    },
    {
      situation:
        'Metrics show inventory-service p99 spiking nightly 2-3am while DB CPU stays low. Thread dumps taken during spikes show ~180 of 200 Tomcat threads WAITING on connections from HikariCP; pool size 10; several endpoints make 4 sequential repository calls inside one request.',
      question: '"Connect these facts into one diagnosis and the fix set."',
      answer:
        'Diagnosis: connection-pool exhaustion via hold-time amplification - 200 request threads contending for 10 connections while chatty endpoints multiply hold duration (4 sequential queries x network latency each). Low DB CPU rules out database slowness; the dump shows waiters, proving capacity mismatch, not query pathology. Fix ladder, cheapest first: batch the sequential calls (single JPQL with join fetch or aggregate query - cuts holds ~4x), move non-DB work OUT of @Transactional scopes (email/rendering between calls, not inside them - the classic hidden holder: @Transactional on fat service methods), then raise pool size moderately toward formula (cores * 2 + spindle-ish heuristics aside: measure - pool ~= concurrent-active-query-threads target, watch acquire-time), and add HikariCP metrics (connection-timeout count, pending threads) with alerts so exhaustion pages before customers do. Explicitly NOT the primary fix: blindly maxing the pool - 200 held connections would just relocate contention into MySQL connection limits and memory. The narratable principle: tune HOLD TIME before POOL SIZE; amplification masquerades as scarcity.'
    },
    {
      situation:
        'A teammate proposes making the entire OrderService stateless-but-shared-nothing by moving ALL mutable state into ConcurrentHashMaps "since CHM is thread-safe anyway" - carts, sessions, idempotency records - inside each ECS task.',
      question: '"Evaluate honestly: which parts of that plan survive contact with distributed reality?"',
      answer:
        'Half-right instinct, wrong scope. Survives: local caching of READ-mostly reference data per task, in-flight request-scoped buffers keyed safely, atomic counters per instance. Does not survive: anything needing cross-request or cross-instance truth - carts and sessions break the moment ALB routes the next click to a DIFFERENT ECS task (state vanishes mid-journey); idempotency records in-memory cannot dedupe retries landing on replicas, recreating the double-fulfillment bug; and even within one task, CHM guards key-to-value routing only - multi-step workflows over VALUES still need their own atomicity, as earlier lessons showed. Correct home for shared state: durable stores - Redis/session store for carts, DB unique-constraint idempotency, sticky-free routing made safe BY externalized state. Frame the verdict generously: the teammate rediscovered that thread-safety and DISTRIBUTED-safety are different axes; CHM solves threads-inside-one-JVM, and horizontal scaling deletes the premise of JVM-local truth. That distinction - concurrency control versus consistency across instances - is precisely the bridge into microservices data-consistency rounds, which is where this track goes next.'
    }
  ],

  rapidFire: [
    {
      question: 'First question to ask when a system hangs?',
      answer:
        'Can I capture a thread dump - blocked cycles mean deadlock, spinning runners mean corruption or livelock, mass waiting on one resource means capacity exhaustion.'
    },
    {
      question: 'Webhook retries cause duplicates - first fix?',
      answer:
        'Durable idempotency keyed by the provider transaction id - unique constraint at the database, winners proceed, duplicates acknowledge success.'
    },
    {
      question: 'Why split executors by workload?',
      answer:
        'Because IO-blocking tasks starve CPU-ready ones behind shared queues - pools are isolation boundaries coupling otherwise unrelated SLAs.'
    },
    {
      question: 'What breaks double-checked locking without volatile?',
      answer:
        'Publication can outrun construction through reordering - another thread receives a half-built object; volatile restores the happens-before, though holder-idiom is the cleaner cure.'
    },
    {
      question: 'Graceful shutdown order?',
      answer:
        'Stop intake via health-flip and load-balancer drain, shutdown() and awaitTermination within a budget, shutdownNow with persistence for stragglers - tasks must honor interruption.'
    },
    {
      question: 'p99 spikes, DB idle, threads waiting on connections - tune what first?',
      answer:
        'Connection hold time - batch queries, shrink transaction scopes - before raising pool size; amplification masquerades as scarcity.'
    },
    {
      question: 'Is ConcurrentHashMap enough for session state across pods?',
      answer:
        'No - it is thread-safe within one JVM only; routing across instances needs externalized state like Redis or a database.'
    },
    {
      question: 'One-line summary of the whole module?',
      answer:
        'Classify the failure - visibility, atomicity, ordering, or capacity - pick the cheapest tool providing that guarantee, and ship a guardrail that detects its recurrence.'
    }
  ],

  interviewPerspective:
    'Rounds increasingly END here: one open-ended incident or design prompt, ten minutes, no rubric shown. The graders\' checklist matches the four beats - classification language, guarantee-based tool choice, a number somewhere, a guardrail closer. Practice until the skeleton fires automatically; improvisation lives INSIDE structure, not instead of it. Finish strong by bridging outward ("this is where microservices data-consistency takes over") - steering the conversation toward ground you have covered is legitimate interviewcraft.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'microservices-drill',
      conceptId: 'microservices-interview-spine',
      title: 'Microservices Interview Spine',
      note: 'Where distributed-state questions continue - the natural next module.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'collections-scenario-drill',
      title: 'Collections Scenario Drill',
      note: 'Interleave weekly with these - rounds switch domains without warning.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'sql-databases-drill',
      conceptId: 'database-transactions-locks-deadlocks',
      title: 'Database Transactions, Locks & Deadlocks',
      note: 'Where several of today\'s battles rerun at the engine level.'
    }
  ],

  triggerSentence:
    'Classify before curing - visibility, atomicity, ordering, capacity - then guard the fix or it was luck.'
};
