import { ConceptContent } from '../../models/content.model';

export const JVM_INTERNALS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'jvm-internals',
  title: 'JVM Internals',

  hook:
    'You hand the exact same .class file to a colleague running a different OS, and it just runs — no recompiling, no ' +
    '"works on my machine." Meanwhile your C++ friend has to recompile for every target. What is actually standing between your code and the machine?',

  problem:
    "Most developers write Java for years without ever picturing what actually happens between `java Main` and their program running. " +
    "That's fine until something goes wrong — an OutOfMemoryError, a mysteriously slow startup, a class that refuses to load — and " +
    "every one of those errors is a JVM-internals problem wearing a Java-code costume.",

  aha: {
    statement: 'The JVM is a translator and a manager rolled into one: it turns your portable bytecode into real machine instructions, and manages every resource (memory, threads, classes) your program touches.',
    analogy:
      "Think of the JVM like a universal remote control's translator chip. Your .class file is a signal in one universal " +
      "format. Every device (OS + CPU combo) speaks a different native language. The JVM sits in between, translating that " +
      "one universal signal into whatever the local device understands — that's why the same .class file runs unchanged " +
      'on Windows, Linux, and macOS.'
  },

  underTheHood: [
    'javac compiles your .java source into .class files containing bytecode — a portable instruction set, not native machine code.',
    'The Class Loader Subsystem loads .class files into memory on demand (lazily, the first time a class is actually referenced), verifies the bytecode is well-formed and safe, then prepares and initializes static state.',
    'The Runtime Data Areas are set up: Heap (objects), Stack (one per thread, holding local variables and call frames), Metaspace (class metadata), and the PC Register (per-thread instruction pointer).',
    'The Execution Engine runs the bytecode. Early on, it interprets bytecode instruction-by-instruction (slow but starts instantly). ' +
      'The JIT (Just-In-Time) compiler watches for "hot" methods called repeatedly and compiles those specific methods to real machine code, swapping the interpreter out for that method going forward.',
    'The Garbage Collector, running inside the same engine, periodically reclaims heap memory for objects nothing references anymore, so you never call free() yourself.',
    'Native Method Interfaces (JNI) let bytecode call out to platform-specific native libraries (used internally for things like file I/O) — this is the one place the "pure portability" story has an escape hatch.'
  ],

  inTheWild: [
    'Diagnosing "why does my app take 8 seconds to reach full speed" — the answer is almost always the JIT hasn\'t warmed up yet, which is why load-testing tools "warm up" before measuring.',
    'A production OutOfMemoryError that says "Metaspace" instead of "Heap space" — that\'s a class-loading leak (often from dynamically-generated classes/frameworks), not an object-leak, and needs a completely different fix.',
    'Interview question: "Why is Java considered platform-independent but not the JVM itself?" — the JVM is native code compiled per-platform; only your bytecode is portable.'
  ],

  showMe: {
    caption: 'Same bytecode file, two very different runs — until you understand where the JVM actually spends its time.',
    bad: {
      language: 'bash',
      code:
        '# Default flags, no thought given to what the JVM is doing under load\n' +
        'java -jar order-service.jar',
      explanation:
        'This works, but you have handed the JVM zero information about your expected heap size, GC strategy, or thread ' +
        'stack size — it guesses based on the host machine, which is exactly why the same jar behaves differently on ' +
        'your laptop versus a small production container.'
    },
    good: {
      language: 'bash',
      code:
        '# Tell the JVM what it is actually running on and what you expect from it\n' +
        'java -Xms512m -Xmx512m \\\n' +
        '     -XX:+UseG1GC \\\n' +
        '     -XX:MaxMetaspaceSize=256m \\\n' +
        '     -jar order-service.jar',
      explanation:
        'Fixed min/max heap avoids the JVM resizing the heap under load (a pause-inducing operation), an explicit GC ' +
        'algorithm removes guesswork, and a Metaspace cap turns a silent slow leak into an early, loud, obvious failure.'
    }
  },

  impact: {
    before: 'Unpredictable pause times and startup behavior that differs between dev laptop and production container.',
    after: 'Predictable memory ceiling, a known GC strategy, and a fast-fail signal if something leaks classes.',
    metric: 'Explicitly sizing heap/metaspace commonly cuts GC-pause variance by more than half in containerized production deployments.'
  },

  alternatives: [
    {
      name: 'HotSpot JVM (the default, from Oracle/OpenJDK)',
      whenToUse: 'The overwhelming default choice — mature, huge ecosystem, excellent tooling (JFR, VisualVM, async-profiler).',
      whenNotToUse: "You need extremely fast, tiny-footprint startup for serverless/CLI tools — consider GraalVM Native Image instead."
    },
    {
      name: 'GraalVM Native Image (ahead-of-time compiled, no JVM at runtime)',
      whenToUse: 'Serverless functions, CLI tools, or anywhere startup time and memory footprint matter more than peak throughput.',
      whenNotToUse: 'You rely heavily on reflection-heavy frameworks or need every JIT optimization available at peak load.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming "portable bytecode" means "portable performance" — treating every JVM/host as identical.',
      why:
        'The JVM itself is native, platform-specific code; its GC behavior, default heap sizing, and thread scheduling all ' +
        'depend on the host OS and available cores. A container with 2 CPUs visible to Linux cgroups but no explicit JVM flags ' +
        'can still have the JVM guess based on the full host machine, over-allocating threads it will never get CPU time for.',
      fix:
        'Always set explicit heap and GC flags in containers, and use a JVM version aware of container CPU/memory limits ' +
        '(modern JDKs are cgroup-aware by default, but verify with -XX:+PrintFlagsFinal).'
    }
  ],

  proveIt: {
    question:
      'Two developers run the exact same .class file — one on Windows, one on Linux — and get identical output. What, ' +
      'specifically, made that possible, and what is NOT portable between those two runs?',
    answer:
      'The bytecode itself is portable and identical on both. What is NOT portable is the JVM binary that interprets/executes ' +
      "it — that's a separate, platform-specific native program (one for Windows, one for Linux) that both happen to implement the same bytecode spec."
  },

  oneLiner: 'Your code never talks to the machine directly — it talks to the JVM, and the JVM talks to the machine.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'memory-management',
      title: 'Memory Management',
      note: 'The Runtime Data Areas introduced here (heap, stack, metaspace) are exactly what Memory Management digs into in detail.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jit-compiler',
      title: 'JIT Compiler',
      note: 'The Execution Engine mentioned here is mostly the JIT compiler — this concept goes deep on how "hot" methods actually get optimized.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'classloader',
      title: 'ClassLoader',
      note: 'The Class Loader Subsystem summarized here has its own hierarchy, delegation model, and set of classic interview gotchas.'
    }
  ]
};
