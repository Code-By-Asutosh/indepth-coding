import { ConceptContent } from '../../models/content.model';

export const JMH_MICROBENCHMARKING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'jmh-microbenchmarking',
  title: 'JMH (Microbenchmarking)',

  hook:
    'You write a `for` loop timing two implementations with `System.nanoTime()`, and Implementation A wins by 40%. You ' +
    'ship the "optimization." A colleague reruns your exact benchmark using JMH and finds Implementation A is actually SLOWER. Same code, opposite conclusion.',

  problem:
    "Hand-rolled Java benchmarks are notoriously unreliable: the JIT hasn't warmed up, the compiler can eliminate " +
    "\"dead code\" whose result is never used, and the JVM's own background work (other JIT compilation, GC) can pollute " +
    "measurements — all invisibly, all without throwing any error to warn you the number is wrong.",

  aha: {
    statement: 'JMH exists specifically because benchmarking on the JVM is a genuinely hard, easy-to-get-wrong problem — it automates the warm-up, isolation, and dead-code-elimination-avoidance that hand-rolled benchmarks routinely get wrong.',
    analogy:
      "Hand-timing your own code with a stopwatch is like a runner timing their own 100m sprint by glancing at their " +
      "phone mid-stride — plausible-looking, but the methodology itself introduces error. JMH is like an official race " +
      "timing system: calibrated equipment, a standardized process (warm-up laps required before the real race counts), " +
      "and rules specifically designed to prevent the exact ways a casual measurement gets fooled."
  },

  underTheHood: [
    'A `@Benchmark`-annotated method is the code JMH measures. JMH automatically runs multiple WARM-UP iterations first (letting the JIT fully optimize the code) before starting the actual measured iterations — solving the warm-up problem hand-rolled benchmarks routinely ignore.',
    'JMH runs each benchmark in a FRESH JVM process (a "fork") by default, avoiding cross-contamination between different benchmarks in the same run (e.g. one benchmark\'s JIT state or GC pressure skewing another\'s results).',
    'Dead Code Elimination avoidance: JMH requires you to either RETURN a value from your @Benchmark method, or explicitly consume it via a `Blackhole` parameter — this stops the JIT from noticing your "work" result is never used and silently optimizing the entire computation away.',
    'Constant Folding avoidance: JMH encourages reading benchmark inputs from `@Param` fields or `@State` objects rather than hard-coded literals, so the JIT cannot precompute a fixed-input result at compile time and skip the "work" during the benchmark entirely.',
    'JMH reports results with statistical rigor (average time, throughput, percentiles across multiple iterations) instead of a single noisy number, making it possible to judge whether a difference between two implementations is real or just measurement noise.',
    'Different benchmark modes (Throughput, AverageTime, SampleTime, SingleShotTime) let you measure the specific dimension that actually matters for your use case — "how many ops per second" is a different question from "what is the worst-case single-call latency."'
  ],

  inTheWild: [
    'Comparing two candidate implementations of a hot method (e.g. two different ways to parse a string) before committing to one, with statistically defensible confidence instead of a hand-timed guess.',
    'JDK and major library maintainers themselves use JMH extensively to validate that a proposed optimization actually helps before merging it — this is the industry-standard tool, not a niche one.',
    'Interview question (for senior/performance-focused roles): "Why can\'t you just time a loop with System.nanoTime() to compare two implementations?" — JIT warm-up, dead code elimination, and single-run noise are the three concrete, correct reasons.'
  ],

  showMe: {
    caption: 'A naive hand-timed comparison vs the same comparison expressed properly as a JMH benchmark.',
    bad: {
      language: 'java',
      code:
        'long start = System.nanoTime();\n' +
        'for (int i = 0; i < 100_000; i++) {\n' +
        '    concatenateWithPlus(); // result is never used anywhere!\n' +
        '}\n' +
        'System.out.println(System.nanoTime() - start);\n' +
        '// The JIT may notice the result is never used and eliminate the loop body\n' +
        '// entirely — you could be measuring almost nothing at all.',
      explanation:
        'Because the result of concatenateWithPlus() is never consumed, the JIT is legally permitted to eliminate the ' +
        'entire computation as dead code — this hand-rolled benchmark can end up measuring close to nothing, while looking like a real number.'
    },
    good: {
      language: 'java',
      code:
        '@Benchmark\n' +
        '@BenchmarkMode(Mode.AverageTime)\n' +
        '@OutputTimeUnit(TimeUnit.NANOSECONDS)\n' +
        'public String concatenateWithPlus() {\n' +
        '    return "a" + "b" + "c"; // returned — JMH consumes it, preventing dead-code elimination\n' +
        '}\n' +
        '// JMH runs proper warm-up iterations, isolates the process, and reports\n' +
        '// statistically meaningful average time per call.',
      explanation:
        'Returning the result from the @Benchmark method gives JMH the value to consume, preventing the JIT from ' +
        'eliminating the computation — combined with proper warm-up and process isolation, this produces a trustworthy measurement.'
    }
  },

  impact: {
    before: 'A confident-looking but potentially meaningless number, possibly measuring dead-code-eliminated "nothing."',
    after: 'A statistically defensible measurement of real, steady-state, JIT-optimized performance.',
    metric: "The gap between a naive hand-rolled benchmark's number and JMH's number for the SAME code can be enormous — sometimes off by orders of magnitude — precisely because of what the naive version accidentally measures instead of real work."
  },

  alternatives: [
    {
      name: 'JMH',
      whenToUse: 'Any time you need to make a real performance decision between two implementations, or verify a claimed optimization actually helps.',
      whenNotToUse: 'Measuring whole-application, end-to-end behavior under realistic load — that is the job of proper load-testing tools, not a microbenchmark harness.'
    },
    {
      name: 'Hand-rolled timing loop (System.nanoTime())',
      whenToUse: 'Extremely rough, "is this obviously way slower" sanity checks during early exploration, never as the basis for a real decision.',
      whenNotToUse: 'Any decision you plan to actually act on — the well-documented pitfalls (warm-up, dead code elimination) make it unreliable for real conclusions.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Writing a @Benchmark method that computes a value but never returns it or passes it to a Blackhole.',
      why:
        'Without consuming the result, the JIT can (and often does) prove the entire computation has no observable effect ' +
        'and eliminates it entirely — you end up benchmarking how fast the JIT can optimize away your code, not the code itself.',
      fix:
        'Always return the computed value from a @Benchmark method, or explicitly consume it via a `Blackhole.consume(value)` parameter if you cannot return it directly.'
    }
  ],

  proveIt: {
    question:
      'A @Benchmark method computes a result but does not return it or pass it to a Blackhole. Why might this produce a suspiciously, unrealistically fast measurement?',
    answer:
      'Because the JIT can prove the computed value is never used anywhere, it is legally allowed to eliminate the ' +
      "entire computation as dead code — the benchmark may end up measuring almost nothing, producing a number far faster than the real, actually-used computation would ever achieve."
  },

  oneLiner: 'JMH exists because benchmarking the JVM correctly is genuinely hard — it automates away the exact mistakes a hand-rolled timer makes silently.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jit-compiler',
      title: 'JIT Compiler',
      note: "Every pitfall JMH is designed to avoid (warm-up, dead code elimination) is a direct consequence of how the JIT compiler actually behaves — understanding one deepens the other."
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'performance-optimization',
      title: 'Performance Optimization',
      note: 'JMH is the concrete tool that makes the "measure, don\'t guess" discipline from Performance Optimization actually practical and trustworthy.'
    }
  ]
};
