import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Concurrency Drill -> Race Conditions & Deadlocks.
 * The two classic concurrency failures: how races hide inside innocent code,
 * the four Coffman conditions that make deadlock possible, and the
 * detection/prevention playbook production teams actually use.
 */
export const RACE_CONDITIONS_DEADLOCKS: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'concurrency-drill',
  conceptId: 'race-conditions-deadlocks',
  title: 'Race Conditions & Deadlocks',
  topicType: 'concept',

  simpleIntuition:
    'Two bugs haunted ShopSphere\'s transfer feature - moving stock between warehouses. Bug one, once a week: transferring 5 units while a sale took 3 produced records claiming 8 units left BOTH warehouses - numbers that were never true at any instant. Bug two, twice in six months: the whole inventory module froze solid; every request hung forever; restart fixed it until it didn\'t. The first bug was a RACE - correct-looking code whose steps interleave wrongly under timing luck. The second was a DEADLOCK - two locks taken in opposite orders by two threads, each politely waiting forever for the other. Different diseases, one shared root: multiple threads touching shared state with uncoordinated timing.',

  formalMeaning:
    'A race condition occurs when program correctness depends on the relative timing of interleaved operations - typically compound actions (check-then-act, read-modify-write) executed non-atomically on shared state. A deadlock is a cycle of blocked threads where each holds a resource the next needs; it requires four simultaneous Coffman conditions - mutual exclusion, hold-and-wait, no preemption, and circular wait - which is why breaking ANY ONE of them prevents deadlock structurally. Related siblings: livelock (threads actively retry against each other forever without progress) and starvation (a thread perpetually denied scheduling).',

  whyItExists:
    'Races exist because "one line of Java" is many machine instructions, and the scheduler may swap threads BETWEEN any pair. Deadlock exists because locking solves races - but locks themselves can wait on each other, and waiting-while-holding is exactly the trap. Engineers must understand both because they fail DIFFERENTLY: races corrupt data silently (worst kind of bug - wrong answers with green dashboards), deadlocks freeze loudly (pagers fire, which is almost merciful). Interviews dwell here because diagnosing either from a code sample or a thread dump is THE practical test of concurrency maturity - memorized definitions cannot spot a missing lock ordering rule.',

  howItWorksInternally: [
    'Anatomy of the lost-update race: transfer() reads balanceA, computes new value, writes back. Between read and write, the sale thread runs its full read-compute-write. Both writers start from the same snapshot - one overwrite vanishes. No exception marks the moment; only later reconciliation finds impossible totals.',
    'The race taxonomy worth reciting: check-then-act (if (!exists) create - two creators pass together), read-modify-write (count++), and independent-write interleavings (composite updates torn mid-sequence). Each fixes differently: atomicity via CAS/locks, or design removal of shared mutable state.',
    'Deadlock mechanics in the ShopSphere freeze: thread T1 processing a transfer locks Warehouse-A then Warehouse-B; simultaneously T2 processing the reverse-direction transfer locks B then A. T1 holds A wants B; T2 holds B wants A. Circular wait complete - both sleep eternally. Neither did anything "wrong" locally.',
    'THE four Coffman conditions, checked against that story: mutual exclusion (warehouses lock), hold-and-wait (each holds first while requesting second), no preemption (nobody can confiscate a held lock), circular wait (A-waits-B-waits-A). Eliminating even ONE breaks the possibility class-wide.',
    'Prevention playbook mapped to conditions: break circular wait → GLOBAL LOCK ORDERING - always acquire warehouse locks sorted by id; every code path obeys one hierarchy, deadlock becomes impossible BY CONSTRUCTION (the industry-standard fix). Break hold-and-wait → acquire-all-or-nothing: tryLock(A, timeout) then tryLock(B, timeout); failing either, release everything and retry - waits become bounded. Break mutual-exclusion → stop using exclusive locks for this case: atomics, immutable snapshots, concurrent collections, or DB optimistic locking with version columns instead.',
    'Detection in production: jstack <pid> (or kill -3) dumps all threads with lock ownership; the JDK literally prints "Found one Java-level deadlock" naming the cycle when it exists. Programmatically ThreadMXBean.findDeadlockedThreads() powers monitoring alarms. For RACES there is no such detector - they need code review discipline plus tools like JCStress tests or stress environments with artificial timing jitter.',
    'Livelock vs deadlock distinction to keep sharp: deadlock = frozen politeness (nobody moves); livelock = frantic politeness (everyone keeps yielding/retrying and nobody progresses - two people side-stepping in a corridor forever). Fix for livelock: introduce asymmetry - random backoff, priority ordering.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    T1["T1: transfer A to B"] --> L1a["lock A - acquired"]\n    T1 --> L1b["wants lock B..."]\n    T2["T2: transfer B to A"] --> L2a["lock B - acquired"]\n    T2 --> L2b["wants lock A..."]\n    L1b -.->|"blocked, waits"| L2a\n    L2b -.->|"blocked, waits"| L1a\n    CYCLE(("circular wait:<br/>both freeze forever")):::dead\n    classDef dead fill:#7f1d1d,color:#fff\n    FIX["fix: global order<br/>always lock lower id first"] -.->|prevents| CYCLE',
      caption: 'The classic AB-BA deadlock - and the single global-order rule that makes it impossible.'
    },
    {
      mermaid: 'flowchart LR\n    R["read balanceA = 100"] --> C["compute 100 - 30 = 70"] --> W["write 70"]\n    S["sale thread: same window,<br/>reads 100 too, writes 85"] -.->|interleaves anywhere| R\n    LOST["final state depends on<br/>write order - one update LOST"]:::bad\n    W -.-> LOST\n    classDef bad fill:#7f1d1d,color:#fff',
      caption: 'Read-modify-write torn across threads: correctness became a coin flip on timing.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - a two-person kitchen with ONE knife block and ONE cutting board: race is both cooks reading the recipe step "add salt" simultaneously and each adding some (soup ruined politely, nobody to blame). Deadlock is cook-one holding the knife reaching for the board while cook-two holds the board reaching for the knife - permanent Mexican standoff. The kitchen rulebook that prevents both: numbered stations (global ordering - always claim station-1 before station-2) and a ten-second claim timer (tryLock - if you cannot get both, put back what you hold and restart the dish).',
    'Coffman checklist as a diagnostic instrument: any suspected freeze, ask four yes/no questions - exclusive resource? holding-while-waiting? no forced revocation? cycle? Four yeses = proven deadlock; the YES answers also tell you which condition your fix will sever.',
    'Lock-ordering discipline in practice: derive order from stable keys (warehouse id, account number), document the hierarchy, enforce in review - one violating PR reintroduces the entire bug class.',
    'Timeout-based escape: tryLock with budget converts eternal freezes into bounded failures + retries; pair with jitter so retriers do not synchronize into livelock waves.',
    'Design-level escapes ranked strongest-first: remove shared mutable state entirely (immutable objects, per-thread data, message queues serializing access through ONE consumer), then shrink-and-order what must remain.'
  ],

  realWorldExamples: [
    'ShopSphere transfer service: post-mortem introduced lock-by-sorted-id across ALL multi-warehouse operations plus tryLock budgets - zero freezes since, and the review checklist now rejects unordered nested locking on sight.',
    'Database world mirror: MySQL deadlocks are ordinary events - InnoDB detects cycles, rolls back the smaller victim, returns error 1213; apps retry. Same Coffman math, different engine - saying this in interviews connects JVM knowledge to the SQL rounds.',
    'Famous scale example: HashMap resize under concurrency (pre-Java 8) could loop linked lists into rings - infinite CPU spin LOOKING like deadlock but actually a corrupted structure race: knowing the difference (jstack shows RUNNING spinners vs BLOCKED waiters) is expert-level signal.',
    'Interview reality: "write code that deadlocks" is a beloved whiteboard prompt (two synchronized methods calling each other cross-wise); the follow-up "now fix it three ways" grades whether you own the Coffman ladder or just the word.'
  ],

  complexityAndTradeoffs: [
    'Global lock ordering cost: reasoning overhead and occasional lock-acquisition inefficiency (must grab lower-id first even if you mostly need the higher) - trivial price versus structural elimination of an outage class.',
    'tryLock-with-retry trade-off: bounded waits replace freezes with retry storms under sustained contention - add exponential backoff + jitter, and metrics on retry counts so storms are visible.',
    'Optimistic-vs-pessimistic spectrum: CAS/version-columns shine at low contention (no parking, no deadlock possible); locks win at high contention (retry loops waste CPU). Same choice reappears verbatim in JPA locking - learn it once here, reuse it there.',
    'Coarse-vs-fine locking: fewer big locks minimize deadlock surface but throttle throughput; many fine locks scale better but multiply ordering obligations - CHM\'s per-bucket design shows fine-grained done safely (single-bucket locks never nest).'
  ],

  commonMistakes: [
    'Believing small critical sections cannot deadlock. Size is irrelevant - ORDER is everything; two-line methods holding two locks in inconsistent orders freeze systems just as permanently. Fix: audit NESTED acquisitions, not durations; enforce one global hierarchy.',
    'Calling unknown code (callbacks, listeners, third-party SDK) while holding YOUR lock. Their internal locks join your hierarchy invisibly - the classic hidden-cycle factory. Fix: open calls outside lock scope; copy needed data out, release, THEN invoke.',
    'Treating a system freeze as performance trouble - adding threads, restarting pods nightly, raising timeouts everywhere. Deadlock ignores capacity: more threads just mean MORE frozen witnesses. Fix: thread dump FIRST on hangs (cheap, decisive: look for BLOCKED pairs or the JDK\'s printed deadlock notice), then diagnose.',
    'Confusing deadlock with livelock or simple starvation during incident calls - wrong label sends the fix the wrong direction (ordering rules cure deadlock; backoff/jitter cures livelock; fair queuing cures starvation). Fix: read the dump carefully - BLOCKED-in-cycle, RUNNING-spinning-no-progress, or WAITING-never-chosen.'
  ],

  scenarioDrills: [
    {
      situation:
        'Incident: ShopSphere inventory API froze completely at 09:40; pods show healthy CPU but zero successful requests; restart fixed it; logs before the freeze show a burst of reverse-direction warehouse transfers coinciding with normal ones.',
      question: '"Walk me through your live triage - what do you capture, what proves the cause, what is the permanent fix?"',
      answer:
        'Triage order: capture evidence BEFORE restarting next time - jstack on an affected pod (or CloudWatch agent thread-dump trigger), preserving the smoking gun: I expect paired threads BLOCKED, each holding one warehouse monitor and waiting on the other, possibly with the JDK\'s explicit "Found one Java-level deadlock" banner naming the cycle. That output proves mechanism AND culprits (exact lines). Immediate mitigation stays restart (only preemption available), but the permanent fix comes from the four Coffman conditions - my pick: break circular wait via global lock ordering (all multi-warehouse paths acquire locks sorted by warehouse id), PLUS break hold-and-wait defensively with tryLock budgets so any future violation degrades into logged failed-transfers-with-retry instead of a total freeze. Follow-through: unit-test simulating opposite transfers concurrently, a review rule banning nested acquisition outside the ordering utility, and an alarm on ThreadMXBean deadlock detection so recurrence pages us with proof attached. Structure of answer matters: evidence → mechanism → mitigation → structural fix → regression guard - that arc IS the seniority being graded.'
    },
    {
      situation:
        'Code review: a payment callback does synchronized(this){ verifySignature(payload); orderService.markPaid(order); } while markPaid internally does synchronized(order){ ... notifyWarehouse(order); } - and warehouse callbacks call synchronized(this) on their OWN controller then synchronized(order). Two engineers argue it is "small and safe".',
      question: '"Rule on the design and rewrite it defensibly."',
      answer:
        'Ruling: reject - this is a latent AB-BA machine regardless of critical-section size. Trace it: callback thread holds CONTROLLER-monitor wanting ORDER-monitor, while any path entering markPaid from warehouse context holds ORDER-monitor and reaches code contending controller-scoped locks (or vice versa through notify chains) - inconsistent acquisition order across two monitors is precisely the Coffman circular-wait setup; "small" changes nothing about cycles. Also flag synchronized(this) itself: public lock object lets ANY foreign code contend. Rewrite direction one - eliminate nesting: verify signature WITHOUT holding anything (pure function), then perform state change via ONE short synchronized section or better an atomic/DB-conditional update (UPDATE orders SET status=PAID WHERE id=? AND status=PENDING - idempotent, deadlock-immune, crash-safe), firing the warehouse notification AFTER commit outside all locks (transactional event queue). Direction two if in-JVM coordination must stay: dedicated private final locks per entity with strict documented order (order-lock before warehouse-lock, globally enforced). My preference is openly database-conditional-updates: it deletes the entire lock conversation rather than managing it - and states the principle that the safest synchronization is the one you removed.'
    }
  ],

  rapidFire: [
    {
      question: 'What is a race condition?',
      answer:
        'Correctness depending on thread timing - usually compound actions like check-then-act or increment interleaving on shared state without atomicity.'
    },
    {
      question: 'Define deadlock and its four required conditions.',
      answer:
        'A cyclic wait where threads hold resources the next needs - requiring mutual exclusion, hold-and-wait, no preemption, and circular wait simultaneously; breaking any one prevents it.'
    },
    {
      question: 'How do you prevent deadlock in practice?',
      answer:
        'Mostly global lock ordering - acquire multiple locks in one documented hierarchy everywhere - plus tryLock timeouts as defense, or removing shared mutable state outright.'
    },
    {
      question: 'How do you detect a deadlock in production?',
      answer:
        'Thread dump via jstack - the JDK reports Java-level deadlocks naming the cycle; programmatically ThreadMXBean.findDeadlockedThreads feeds monitoring alarms.'
    },
    {
      question: 'Deadlock vs livelock?',
      answer:
        'Deadlocked threads are blocked motionless; livelocked threads actively retry and yield forever without progressing - cured by backoff and asymmetry rather than ordering.'
    },
    {
      question: 'Can AtomicInteger participate in deadlock?',
      answer:
        'No - CAS loops never block holding resources; contention costs CPU retries, but circular waits cannot form without blocking.'
    },
    {
      question: 'Why is calling callbacks while holding a lock dangerous?',
      answer:
        'Foreign code acquires its own internal locks inside your critical section, joining an invisible lock hierarchy - a classic hidden route to circular wait.'
    },
    {
      question: 'What does a database deadlock error mean for your app?',
      answer:
        'The engine detected a lock cycle and rolled back a victim transaction - treat it as retryable: catch, brief backoff, replay the transaction.'
    }
  ],

  interviewPerspective:
    'Expect one hands-on moment: either spotting the race/deadlock in shown code, writing the AB-BA deadlock on demand, or narrating a hang incident from a thread dump. Grade yourself on vocabulary precision - Coffman conditions named unprompted, BLOCKED-versus-RUNNING dump literacy, ordering-versus-timeout-versus-design fixes ranked with trade-offs. The bonus tier links outward: MySQL deadlock victims and JPA optimistic versions prove the concept travels beyond java.util.concurrent - exactly the connected-knowledge signal Deloitte-style panels hunt for at SE II.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'concurrency-drill',
      conceptId: 'concurrency-scenario-drill',
      title: 'Concurrency Scenario Drill',
      note: 'Next lesson - mixed war-room cases putting every tool from this module together.'
    },
    {
      categoryId: 'interview-prep',
      topicId: 'jpa-hibernate-drill',
      conceptId: 'optimistic-vs-pessimistic-locking',
      title: 'Optimistic vs Pessimistic Locking (JPA)',
      note: 'The same CAS-versus-lock decision reborn at the database layer - coming later in the track.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading (full Learn page)',
      note: 'Full textbook treatment of coordination primitives behind these failure modes.'
    }
  ],

  triggerSentence:
    'Races corrupt quietly, deadlocks freeze loudly - order your locks, bound your waits, and prefer deleting the shared state altogether.'
};
