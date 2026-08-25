import { ConceptContent } from '../../models/content.model';

export const MULTITHREADING: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "multithreading",
  title: "Multithreading",
  topicType: "concept",
  simpleIntuition: "Two threads increment the exact same counter 100,000 times each. You expect 200,000 at the end. You get 187,342. Nothing crashed, no exception was thrown - the number is just quietly, confidently wrong.",
  formalMeaning: "A thread is an independent path of execution sharing the same memory as every other thread in the process - that sharing is both the entire benefit and the entire danger.",
  whyItExists: "Threads let multiple parts of your program run at the same time on multiple CPU cores, which is exactly why a single-threaded mental model of \"line 1 happens, then line 2 happens\" completely breaks down. Two threads can interleave their individual instructions in ways that are impossible to fully predict, and the bugs this creates often don't show up until real concurrent load in production.",
  howItWorksInternally: [
    "Every Java process starts with at least one thread (the \"main\" thread). Creating a `new Thread(...)` and calling `.start()` asks the OS to schedule a genuinely separate path of execution, sharing the same heap.",
    "The OS scheduler decides which thread runs on which core at which moment - you do not control the exact interleaving, and it can differ between runs, machines, and even JVM warm-up state.",
    "A \"race condition\" happens when the correctness of your program depends on the exact timing/order of thread execution - `count++` is actually read-modify-write, three separate steps, and two threads can interleave those steps to lose an update.",
    "A `synchronized` block/method uses an intrinsic lock (monitor) tied to an object - only one thread can hold that lock at a time, forcing other threads to wait their turn before entering.",
    "Deadlock occurs when two threads each hold a lock the other one needs, and neither will ever release theirs - classic case: Thread A locks Object 1 then wants Object 2, Thread B locks Object 2 then wants Object 1.",
    "Creating raw `Thread` objects directly does not scale - each OS thread has real memory/scheduling overhead, which is exactly why `ExecutorService` thread pools (and later, virtual threads) exist."
  ],
  diagrams: [
    {
      mermaid: "flowchart TB\n  T1[\"Thread 1\"] --> Heap[(\"Shared Heap\\n(same objects, visible to all)\")]\n  T2[\"Thread 2\"] --> Heap\n  T3[\"Thread 3\"] --> Heap\n  T1 -. own stack .-> S1[\"Stack 1\"]\n  T2 -. own stack .-> S2[\"Stack 2\"]\n  T3 -. own stack .-> S3[\"Stack 3\"]",
      caption: "Threads have their own private stacks, but ALL of them share the same heap - that sharing is the whole danger."
    }
  ],
  mainComponents: [
    "Picture several cashiers sharing one physical cash drawer instead of each having their own. It's faster (everyone works in parallel) but if two cashiers grab the drawer at the exact same moment to make change, the drawer ends up in an inconsistent state - not because either cashier made a mistake, but because nobody agreed on taking turns."
  ],
  realWorldExamples: [
    "A \"hit counter\" or in-memory metrics counter that slowly drifts from the true count under real concurrent traffic - a race condition invisible in single-user testing.",
    "A production deadlock that only appears under peak load, where two services (or two code paths) acquire the same two locks in different orders.",
    "Interview question: \"Why did `count++` produce the wrong answer even though nothing threw an exception?\" - this is the single most common concurrency interview question, and understanding read-modify-write is the entire answer."
  ],
  complexityAndTradeoffs: [
    "Before: A shared counter under concurrent load silently undercounts, with no exception or warning.",
    "After: The exact same workload produces the mathematically correct total every time.",
    "Race conditions like this are notoriously \"probabilistic\" - they might pass 999 test runs and fail the 1000th under real production concurrency, which is why this bug class is so expensive to catch late.",
    "synchronized block/method: use it when you need to protect a critical section involving multiple related operations/fields together, not just a single counter. Avoid it when a single primitive counter/flag - an Atomic* class is simpler and usually faster under contention.",
    "java.util.concurrent.atomic classes: use it when single-value atomic operations (counters, flags, compare-and-swap on one reference). Avoid it when you need to atomically coordinate MULTIPLE related fields together - a single Atomic* only covers one value at a time.",
    "ExecutorService / thread pools: use it when running many short-lived tasks without paying the overhead of creating a raw OS thread per task. Avoid it when extremely high volumes of blocking I/O-bound tasks where even a pool cannot scale far enough - consider virtual threads instead."
  ],
  commonMistakes: [
    "Assuming that because a race condition did not show up in testing, the code is thread-safe. Race conditions are inherently timing-dependent - your dev machine, low request volume, and JIT warm-up state may simply never trigger the exact interleaving that causes the bug. Production traffic, with real concurrency and different hardware, frequently does. Fix: Reason about thread-safety explicitly (what is shared, is it mutable, is access synchronized) rather than relying on tests to \"catch\" a race condition, which they are structurally bad at doing reliably."
  ],
  interviewPerspective: "A common way this gets tested: \"Two threads both call `count++` on a shared, non-atomic `int count` field, 100,000 times each, with no synchronization. Is the final value GUARANTEED to be less than, equal to, or possibly equal to 200,000?\" It is possibly equal to 200,000 (if by luck no interleavings caused a lost update) but NOT guaranteed - it can be anywhere from a bit less than 200,000 up to exactly 200,000, and the exact number is non-deterministic across runs.",
  triggerSentence: "Threads share memory to go fast together - and that same sharing is exactly what makes them dangerous together."
};
