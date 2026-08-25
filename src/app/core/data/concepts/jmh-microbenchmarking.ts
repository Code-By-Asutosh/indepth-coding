import { ConceptContent } from '../../models/content.model';

export const JMH_MICROBENCHMARKING: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "jmh-microbenchmarking",
  title: "JMH (Microbenchmarking)",
  topicType: "runtime-internals",
  simpleIntuition: "You write a `for` loop timing two implementations with `System.nanoTime()`, and Implementation A wins by 40%. You ship the \"optimization.\" A colleague reruns your exact benchmark using JMH and finds Implementation A is actually SLOWER. Same code, opposite conclusion.",
  formalMeaning: "JMH exists specifically because benchmarking on the JVM is a genuinely hard, easy-to-get-wrong problem - it automates the warm-up, isolation, and dead-code-elimination-avoidance that hand-rolled benchmarks routinely get wrong.",
  whyItExists: "Hand-rolled Java benchmarks are notoriously unreliable: the JIT hasn't warmed up, the compiler can eliminate \"dead code\" whose result is never used, and the JVM's own background work (other JIT compilation, GC) can pollute measurements - all invisibly, all without throwing any error to warn you the number is wrong.",
  howItWorksInternally: [
    "A `@Benchmark`-annotated method is the code JMH measures. JMH automatically runs multiple WARM-UP iterations first (letting the JIT fully optimize the code) before starting the actual measured iterations - solving the warm-up problem hand-rolled benchmarks routinely ignore.",
    "JMH runs each benchmark in a FRESH JVM process (a \"fork\") by default, avoiding cross-contamination between different benchmarks in the same run (e.g. one benchmark's JIT state or GC pressure skewing another's results).",
    "Dead Code Elimination avoidance: JMH requires you to either RETURN a value from your @Benchmark method, or explicitly consume it via a `Blackhole` parameter - this stops the JIT from noticing your \"work\" result is never used and silently optimizing the entire computation away.",
    "Constant Folding avoidance: JMH encourages reading benchmark inputs from `@Param` fields or `@State` objects rather than hard-coded literals, so the JIT cannot precompute a fixed-input result at compile time and skip the \"work\" during the benchmark entirely.",
    "JMH reports results with statistical rigor (average time, throughput, percentiles across multiple iterations) instead of a single noisy number, making it possible to judge whether a difference between two implementations is real or just measurement noise.",
    "Different benchmark modes (Throughput, AverageTime, SampleTime, SingleShotTime) let you measure the specific dimension that actually matters for your use case - \"how many ops per second\" is a different question from \"what is the worst-case single-call latency.\""
  ],
  mainComponents: [
    "Hand-timing your own code with a stopwatch is like a runner timing their own 100m sprint by glancing at their phone mid-stride - plausible-looking, but the methodology itself introduces error. JMH is like an official race timing system: calibrated equipment, a standardized process (warm-up laps required before the real race counts), and rules specifically designed to prevent the exact ways a casual measurement gets fooled."
  ],
  realWorldExamples: [
    "Comparing two candidate implementations of a hot method (e.g. two different ways to parse a string) before committing to one, with statistically defensible confidence instead of a hand-timed guess.",
    "JDK and major library maintainers themselves use JMH extensively to validate that a proposed optimization actually helps before merging it - this is the industry-standard tool, not a niche one.",
    "Interview question (for senior/performance-focused roles): \"Why can't you just time a loop with System.nanoTime() to compare two implementations?\" - JIT warm-up, dead code elimination, and single-run noise are the three concrete, correct reasons."
  ],
  complexityAndTradeoffs: [
    "Before: A confident-looking but potentially meaningless number, possibly measuring dead-code-eliminated \"nothing.\"",
    "After: A statistically defensible measurement of real, steady-state, JIT-optimized performance.",
    "The gap between a naive hand-rolled benchmark's number and JMH's number for the SAME code can be enormous - sometimes off by orders of magnitude - precisely because of what the naive version accidentally measures instead of real work.",
    "JMH: use it when any time you need to make a real performance decision between two implementations, or verify a claimed optimization actually helps. Avoid it when measuring whole-application, end-to-end behavior under realistic load - that is the job of proper load-testing tools, not a microbenchmark harness.",
    "Hand-rolled timing loop (System.nanoTime()): use it when extremely rough, \"is this obviously way slower\" sanity checks during early exploration, never as the basis for a real decision. Avoid it when any decision you plan to actually act on - the well-documented pitfalls (warm-up, dead code elimination) make it unreliable for real conclusions."
  ],
  commonMistakes: [
    "Writing a @Benchmark method that computes a value but never returns it or passes it to a Blackhole. Without consuming the result, the JIT can (and often does) prove the entire computation has no observable effect and eliminates it entirely - you end up benchmarking how fast the JIT can optimize away your code, not the code itself. Fix: Always return the computed value from a @Benchmark method, or explicitly consume it via a `Blackhole.consume(value)` parameter if you cannot return it directly."
  ],
  interviewPerspective: "A common way this gets tested: \"A @Benchmark method computes a result but does not return it or pass it to a Blackhole. Why might this produce a suspiciously, unrealistically fast measurement?\" Because the JIT can prove the computed value is never used anywhere, it is legally allowed to eliminate the entire computation as dead code - the benchmark may end up measuring almost nothing, producing a number far faster than the real, actually-used computation would ever achieve.",
  triggerSentence: "JMH exists because benchmarking the JVM correctly is genuinely hard - it automates away the exact mistakes a hand-rolled timer makes silently."
};
