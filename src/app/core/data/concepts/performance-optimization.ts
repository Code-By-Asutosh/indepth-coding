import { ConceptContent } from '../../models/content.model';

export const PERFORMANCE_OPTIMIZATION: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'performance-optimization',
  title: 'Performance Optimization',

  hook:
    'A developer spends two full days converting a for-loop into a highly "optimized" stream pipeline with parallel ' +
    'processing. The benchmark afterward shows it is actually 30% SLOWER than the original. What went wrong — and how would they have known beforehand?',

  problem:
    "Performance optimization done from intuition instead of measurement is one of the most reliable ways to waste " +
    "engineering time: modern JVMs, JIT compilation, and CPU caches behave in genuinely counter-intuitive ways, and " +
    "\"obviously faster\" code changes are frequently proven wrong (or immeasurably tiny) the moment they are actually profiled.",

  aha: {
    statement: 'You cannot reliably guess where a JVM program spends its time — you have to MEASURE it, because the JIT compiler, GC, and CPU caches all behave in ways that defy simple intuition.',
    analogy:
      "Optimizing based on intuition alone is like a doctor prescribing treatment for a patient without ever taking their " +
      "vitals — confident, well-meaning, and frequently wrong. Profiling first is like actually running the blood test " +
      "before deciding on treatment: it might reveal the real problem is somewhere completely different from where you assumed."
  },

  underTheHood: [
    'The JIT compiler only optimizes "hot" methods (called frequently) — a method run only a handful of times stays interpreted and slow, meaning micro-benchmarks that run code just once or twice measure the WRONG thing (interpreted speed, not real steady-state speed).',
    'JVM warm-up: the same code genuinely runs slower in its first hundreds/thousands of calls (interpreted, then progressively JIT-optimized) than after warm-up — any benchmark that does not account for warm-up produces misleading numbers.',
    'The JIT performs optimizations that can make "obviously slower" code disappear entirely, such as removing a whole computation whose result is never actually used (dead code elimination) — a naive micro-benchmark can accidentally measure "how fast the JIT optimizes away your test code" instead of real work.',
    'Premature optimization frequently targets the WRONG bottleneck — Amdahl\'s Law means optimizing a piece of code that only takes 2% of total execution time can never improve overall performance by more than that 2%, no matter how aggressively you optimize it.',
    'CPU cache locality matters enormously in practice — an ArrayList (contiguous memory, cache-friendly) frequently outperforms a LinkedList (scattered nodes) in real benchmarks even for operations where LinkedList\'s Big-O complexity looks theoretically better on paper.',
    'The correct process, in order: (1) define a measurable performance GOAL, (2) profile to find the actual bottleneck (not guess), (3) optimize specifically that bottleneck, (4) measure again to confirm the change actually helped.'
  ],

  inTheWild: [
    "A team spending a sprint 'optimizing' a service's business logic while the actual bottleneck (revealed later by profiling) was a single slow, unindexed database query outside the code they were optimizing entirely.",
    'A "micro-benchmark" run in a simple main() method, measuring code that runs once, producing numbers that bear no resemblance to how that same code performs after real JIT warm-up in a long-running production service.',
    'Interview question: "Why shouldn\'t you write your own quick benchmark loop to compare two implementations?" — because JIT warm-up, dead-code elimination, and JVM state make naive hand-rolled benchmarks notoriously unreliable; a proper tool like JMH exists specifically to avoid these traps.'
  ],

  showMe: {
    caption: 'Guessing at an optimization vs verifying it with an actual measurement (conceptually — see JMH for the real tool).',
    bad: {
      language: 'java',
      code:
        '// "This MUST be faster — fewer method calls, right?"\n' +
        'long start = System.currentTimeMillis();\n' +
        'for (int i = 0; i < 1000; i++) { doWork(); } // runs only 1000 times, JIT barely warmed up\n' +
        'long elapsed = System.currentTimeMillis() - start;\n' +
        'System.out.println(elapsed); // measures mostly INTERPRETED execution, not steady-state speed',
      explanation:
        'System.currentTimeMillis() has coarse resolution, the loop is far too short for the JIT to have fully optimized ' +
        'the method yet, and there is no confirmation the result of doWork() is even used — the JIT may have silently eliminated the "work" entirely.'
    },
    good: {
      language: 'java',
      code:
        '// Using JMH (Java Microbenchmark Harness) — handles warm-up, avoids dead-code\n' +
        '// elimination, and reports statistically meaningful results\n' +
        '@Benchmark\n' +
        'public int measureWork() {\n' +
        '    return doWork(); // returning the result prevents the JIT from discarding it as unused\n' +
        '}\n' +
        '// JMH runs many warm-up iterations before measuring, and reports\n' +
        '// throughput/latency with real statistical confidence.',
      explanation:
        'JMH is purpose-built to avoid exactly the traps a hand-rolled loop falls into: proper JIT warm-up, avoiding dead ' +
        'code elimination by using the result, and reporting statistically meaningful numbers instead of one noisy measurement.'
    }
  },

  impact: {
    before: 'Days spent optimizing code based on intuition, sometimes making performance WORSE, with no way to know until it is too late.',
    after: 'A measured, confirmed improvement targeting the actual bottleneck, verified before and after the change.',
    metric: 'Teams that adopt "profile first" discipline consistently report finding the real bottleneck is somewhere completely different from where intuition pointed — this is close to a universal experience among experienced performance engineers.'
  },

  alternatives: [
    {
      name: 'Profile-guided optimization (measure first, then optimize the confirmed bottleneck)',
      whenToUse: 'Always — this should be the default, non-negotiable process for any real performance work.',
      whenNotToUse: 'Never skip this step for anything beyond a truly trivial, obviously-correct micro-fix.'
    },
    {
      name: 'Intuition-based optimization ("this looks like it should be faster")',
      whenToUse: 'Essentially never as your primary approach — at best, use intuition to decide WHERE to look first, then verify with actual measurement.',
      whenNotToUse: 'As a substitute for measurement — JVM behavior (JIT, GC, caches) is genuinely too counter-intuitive to trust guesses alone.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Writing a simple hand-rolled `System.currentTimeMillis()` loop to "benchmark" two approaches and trusting the result.',
      why:
        "Naive benchmarks routinely fall victim to insufficient JIT warm-up (measuring slow interpreted code, not real " +
        "steady-state performance), dead-code elimination (the JIT silently skips work whose result is never used), and " +
        "coarse timer resolution — producing numbers that look confident and precise while being fundamentally misleading.",
      fix:
        'Use a proper microbenchmarking tool (JMH) that is specifically designed to account for JIT warm-up, prevent dead code elimination, and report statistically meaningful results.'
    }
  ],

  proveIt: {
    question:
      'A method takes 2% of your application\'s total execution time. You spend a week optimizing it to run twice as fast. ' +
      'What is the maximum possible improvement to your application\'s OVERALL performance?',
    answer:
      "1% (half of the 2% it originally consumed), per Amdahl's Law — no matter how much faster you make a piece of code " +
      "that represents a small fraction of total time, the overall improvement is capped by that fraction; this is exactly why profiling to find the ACTUAL bottleneck matters so much."
  },

  oneLiner: 'The JVM is too clever (and too counter-intuitive) to guess about — measure first, optimize the confirmed bottleneck, then measure again.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jit-compiler',
      title: 'JIT Compiler',
      note: 'JIT warm-up behavior is the exact reason naive benchmarks are misleading — understanding how the JIT decides what to optimize (and when) is essential background for this concept.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jmh-microbenchmarking',
      title: 'JMH (Microbenchmarking)',
      note: 'JMH is the concrete, correct tool for doing the measurement this concept insists on — it exists specifically to avoid the pitfalls of hand-rolled benchmarks.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'garbage-collection-serial-parallel-cms-g1-zgc-shenandoah-epsilon',
      title: 'Garbage Collection',
      note: 'GC tuning is one of the highest-leverage, most commonly mis-guessed areas of JVM performance work — a perfect example of "measure first."'
    }
  ]
};
