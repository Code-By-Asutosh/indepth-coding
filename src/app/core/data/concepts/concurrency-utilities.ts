import { ConceptContent } from '../../models/content.model';

export const CONCURRENCY_UTILITIES: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "concurrency-countdownlatch-cyclicbarrier-semaphore-threadlocal-forkjoinpool-completablefuture",
  title: "Concurrency Utilities",
  topicType: "concept",
  simpleIntuition: "You need five background jobs to ALL finish before a report can be generated. Your first instinct is a `while` loop polling five boolean flags every 10ms. It works, technically - and it burns CPU doing nothing useful and is one typo away from a subtle bug.",
  formalMeaning: "Each concurrency utility is a pre-built, battle-tested answer to one specific, recurring coordination problem - you rarely need to write raw wait()/notify() yourself again.",
  whyItExists: "Hand-rolling thread coordination with raw `wait()`/`notify()`, polling loops, or manual flags is notoriously easy to get subtly wrong - missed notifications, spurious wakeups, and busy-waiting that wastes CPU. java.util.concurrent exists specifically because these coordination patterns come up constantly and are too easy to get wrong by hand.",
  howItWorksInternally: [
    "CountDownLatch(n): starts at n, count down as work completes, and any thread calling await() blocks until the count hits zero. One-time use only - it cannot be reset.",
    "CyclicBarrier(n): n threads each call await() and all block until the nth one arrives, then all are released together - and unlike CountDownLatch, it automatically resets for reuse in the next round.",
    "Semaphore(n): maintains n \"permits.\" acquire() blocks if none are available; release() gives one back - the standard tool for capping concurrent access to a limited resource (e.g. a connection pool).",
    "ThreadLocal<T>: gives each thread its own independent copy of a variable - no synchronization needed because nothing is actually shared, at the cost of remembering to call remove() in pooled-thread environments to avoid leaking stale data to the next task on that thread.",
    "ForkJoinPool: a thread pool specialized for divide-and-conquer workloads (split a big task into smaller ones recursively, \"fork\" them, then \"join\" the results) - it also powers parallel streams under the hood.",
    "CompletableFuture: represents a value that will be available later, letting you chain async operations (thenApply, thenCompose) and combine multiple futures, without ever manually calling wait()/notify() yourself."
  ],
  mainComponents: [
    "Think of these like specialized tools at a construction site instead of one generic hammer for everything: a CountDownLatch is a checklist everyone waits on before the foreman says \"go\" (once, never resets); a CyclicBarrier is a meeting point where everyone waits for the whole group before proceeding together, then does it again next round; a Semaphore is a parking garage with a fixed number of spots - you wait if it's full; ThreadLocal is a personal locker per worker, invisible to everyone else."
  ],
  realWorldExamples: [
    "A service startup routine that must wait for 3 independent background caches to finish warming up before accepting traffic - a textbook CountDownLatch(3).",
    "A ThreadLocal storing the \"current request context\" (e.g. a trace ID) that must be explicitly cleared at the end of each request in a pooled thread environment, or the next unrelated request on that same pooled thread inherits stale data.",
    "Interview question: \"What is the difference between CountDownLatch and CyclicBarrier?\" - CountDownLatch is one-time and any thread can count down (not just the waiting ones); CyclicBarrier requires the SAME threads that are waiting to also be the ones that arrive, and it resets automatically for reuse."
  ],
  complexityAndTradeoffs: [
    "Before: A polling wait loop burning CPU and adding up to a fixed polling-interval of latency before reacting.",
    "After: An efficient blocking wait that reacts immediately when the condition is truly met, with zero wasted CPU.",
    "At scale (many concurrent instances each polling), busy-waiting can measurably show up as background CPU usage that a blocking primitive eliminates entirely.",
    "CountDownLatch: use it when a one-time \"wait for N things to finish\" signal - any thread can trigger a countdown, not just the waiting ones. Avoid it when you need to reuse the same coordination point across multiple rounds - use CyclicBarrier instead.",
    "CyclicBarrier: use it when a fixed group of threads needs to repeatedly wait for each other at the same point, round after round. Avoid it when the waiting threads and the \"signaling\" threads are different sets - CountDownLatch fits that shape better.",
    "Semaphore: use it when limiting concurrent access to a resource with a fixed capacity (e.g. max 10 concurrent DB connections from a pool). Avoid it when you just need mutual exclusion (only 1 at a time) - a plain lock/synchronized is simpler and clearer intent.",
    "CompletableFuture: use it when composing multiple asynchronous operations together (do A and B in parallel, then combine, then do C). Avoid it when simple fire-and-forget background work with no result to combine - a plain ExecutorService.submit() is simpler."
  ],
  commonMistakes: [
    "Using ThreadLocal to store per-request data in a pooled-thread environment (e.g. a web server thread pool) and forgetting to call remove() at the end of the request. Pooled threads are reused across many requests. If you never clear a ThreadLocal, the NEXT unrelated request handled by that same reused thread can silently see the PREVIOUS request's leftover data - a serious, hard-to-reproduce bug that only appears under real traffic patterns. Fix: Always clear a ThreadLocal in a finally block (or use a framework-managed request-scoped context that does this for you automatically)."
  ],
  interviewPerspective: "A common way this gets tested: \"You have a CyclicBarrier(4). Three threads call await() and are waiting. A completely different, fifth thread calls countDown()-style logic on it. Does the barrier release?\" Trick question - CyclicBarrier has no countDown()/external trigger at all; it only releases when the SAME threads that are part of the barrier call await() themselves. A fifth, uninvolved thread cannot release it - that capability belongs to CountDownLatch, not CyclicBarrier.",
  triggerSentence: "Before you hand-write wait()/notify() coordination logic, check if java.util.concurrent already has the exact tool you need - it almost always does."
};
