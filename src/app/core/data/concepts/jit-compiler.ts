import { ConceptContent } from '../../models/content.model';

export const JIT_COMPILER: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'jit-compiler',
  title: 'JIT Compiler',

  hook:
    'You run the exact same method a million times in a loop. The first thousand calls average 500 nanoseconds each. The ' +
    'last thousand calls average 5 nanoseconds each - a 100x speedup, with not a single line of your code changing mid-run. What sped it up?',

  problem:
    "Bytecode interpretation (reading and executing one instruction at a time) is inherently slower than running real, " +
    "native machine code. But compiling EVERY method to native code the instant a program starts would make startup very " +
    "slow for code that only runs once or twice - the JIT compiler exists specifically to get the best of both worlds.",

  aha: {
    statement: 'The JVM starts by interpreting bytecode (slow but instant), and only compiles a method to fast native machine code once it proves that method is actually called often enough to be worth the compilation cost.',
    analogy:
      "Think of a translator at a conference. For a phrase said once, they just translate it live, word by word - slower, " +
      "but there's no point memorizing a one-off phrase. But if the SAME exact phrase gets repeated hundreds of times " +
      "throughout the day, at some point the translator just memorizes the whole phrase and its translation, and " +
      "afterward repeats it instantly from memory, without re-translating word by word each time."
  },

  underTheHood: [
    'Every method starts running through the interpreter, executing bytecode instructions one at a time - this has essentially zero startup cost but real per-instruction overhead on every execution.',
    'The JVM maintains an invocation counter per method. Once a method\'s call count crosses a threshold, it is flagged as "hot" and queued for JIT compilation to real, native machine code.',
    'C1 (client compiler, aka "tier 1-3"): compiles quickly with lighter optimization, prioritizing fast startup - good for methods that are moderately hot but not yet proven to be the application\'s true bottleneck.',
    'C2 (server compiler, aka "tier 4"): performs much more aggressive optimization (inlining, loop unrolling, escape analysis) but takes longer to compile - reserved for methods proven to be genuinely, heavily hot, where the extra compilation cost clearly pays off.',
    'Modern JVMs use "tiered compilation" by default: a method progresses from interpreted -> C1-compiled -> C2-compiled as it proves itself hotter and hotter, balancing fast startup against eventual peak performance.',
    'Because the JIT decides which methods to optimize based on ACTUAL runtime call counts (not static code analysis), the exact same source code can end up compiled very differently across two different runs, depending on real usage patterns - this is exactly why "warm-up" matters so much for accurate benchmarking.'
  ],

  inTheWild: [
    'A service that is measurably slower for its first few seconds/minutes after deployment/restart, before settling into its normal steady-state speed - a direct, visible consequence of JIT warm-up, and the reason load-testing tools explicitly warm up before measuring.',
    'A method that looked "hot" in a code review is actually barely called in production, so it stays interpreted and never gets the JIT\'s attention - while a seemingly boring utility method called constantly gets heavily optimized.',
    'Interview question: "Why can the exact same Java bytecode run at dramatically different speeds at different points in the same program\'s execution?" - the JIT progressively compiles hot methods to native code as it observes real call patterns, so early calls are always slower than later ones.'
  ],

  showMe: {
    caption: 'A naive benchmark measuring cold, interpreted code vs correctly measuring steady-state, JIT-warmed performance.',
    bad: {
      language: 'java',
      code:
        'long start = System.nanoTime();\n' +
        'int result = computeSomething(); // called ONCE - still fully interpreted, JIT hasn\'t kicked in yet\n' +
        'long elapsed = System.nanoTime() - start;\n' +
        'System.out.println(elapsed); // measures interpreted speed, NOT the method\'s real steady-state performance',
      explanation:
        'A single call almost never triggers JIT compilation - this measurement captures the slow, interpreted execution ' +
        'path, which is not representative of how the method performs after real, sustained use.'
    },
    good: {
      language: 'java',
      code:
        '// Warm up first - call it enough times to trigger JIT compilation\n' +
        'for (int i = 0; i < 20_000; i++) { computeSomething(); }\n\n' +
        '// NOW measure - the method is likely JIT-compiled by this point\n' +
        'long start = System.nanoTime();\n' +
        'int result = computeSomething();\n' +
        'long elapsed = System.nanoTime() - start;\n' +
        '// (In practice, use JMH instead of hand-rolled warm-up loops - see JMH concept)',
      explanation:
        'Running the method enough times first gives the JIT a chance to actually compile it to native code, so the ' +
        'subsequent measurement reflects real, steady-state performance instead of one-off interpreted execution.'
    }
  },

  impact: {
    before: 'A misleading benchmark measuring slow, interpreted, cold-start performance.',
    after: 'A benchmark measuring genuine, steady-state, JIT-optimized performance representative of production behavior.',
    metric: "The gap between interpreted and fully JIT-optimized execution for the same code is commonly one to two orders of magnitude - which is exactly why 'measure without warming up' produces numbers with little relevance to real production performance."
  },

  alternatives: [
    {
      name: 'Tiered compilation (default in modern JVMs: interpreter -> C1 -> C2)',
      whenToUse: 'The default, sensible choice for almost all applications - balances fast startup with eventual peak performance.',
      whenNotToUse: 'Extremely short-lived processes (a CLI tool that exits in milliseconds) where JIT compilation never gets a chance to pay off - consider GraalVM Native Image instead.'
    },
    {
      name: 'Ahead-of-Time (AOT) compilation (e.g. GraalVM Native Image)',
      whenToUse: 'Fast-startup-critical workloads (serverless functions, CLI tools) where paying compilation cost upfront (at build time) beats paying it at runtime.',
      whenNotToUse: 'Long-running server applications where the JIT\'s ability to optimize based on ACTUAL runtime behavior typically yields better peak throughput than AOT\'s static, build-time decisions.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Benchmarking or drawing performance conclusions from code run only a handful of times, without any warm-up.',
      why:
        "The JIT has not had a chance to compile the method yet, so the measurement reflects slow interpreted execution " +
        "- a conclusion like 'approach A is faster than approach B' drawn this way can be, and often is, completely wrong once both are actually warmed up and JIT-compiled in real production use.",
      fix:
        'Always warm up code (call it thousands of times) before measuring, or better, use a dedicated benchmarking tool like JMH that handles this correctly and automatically.'
    }
  ],

  proveIt: {
    question:
      'A method is called exactly 3 times total during a program\'s entire run. Is it likely to be JIT-compiled to native code, or does it stay interpreted?',
    answer:
      "It almost certainly stays interpreted - the JIT only compiles methods once their invocation count crosses a " +
      "'hot' threshold (typically thousands of calls by default), and 3 calls falls nowhere near that threshold, so the small overhead of interpretation for such a rarely-called method is simply accepted."
  },

  oneLiner: 'The JIT compiler only pays the cost of optimization for code that proves, through real usage, that it deserves it.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jvm-internals',
      title: 'JVM Internals',
      note: 'The JIT compiler is one core piece of the Execution Engine introduced at a high level in JVM Internals - this concept is the deep dive into exactly how it decides what to optimize and when.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'escape-analysis',
      title: 'Escape Analysis',
      note: 'Escape analysis is one of the specific, powerful optimizations the C2 compiler performs once a method is proven hot enough to receive aggressive optimization.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'performance-optimization',
      title: 'Performance Optimization',
      note: 'Understanding JIT warm-up is essential background for why "measure first, never guess" is the golden rule of Performance Optimization.'
    }
  ]
};
