import { ConceptContent } from '../../models/content.model';

export const METHOD_HANDLES_VARHANDLES_UNSAFE: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'method-handles-varhandles-unsafe',
  title: 'Method Handles / VarHandles / Unsafe',

  hook:
    'A high-performance library needs to read a private field a billion times a second, and plain reflection (`Field.get()`) ' +
    'is too slow for that scale. Reflection is already "the escape hatch" - what do you reach for when even THAT is not fast enough?',

  problem:
    "Reflection is flexible but its per-call overhead (security checks, boxing, no JIT inlining) is real. For " +
    "performance-critical library code (serialization frameworks, concurrency primitives, low-level data structures), " +
    "that overhead is unacceptable at scale - which is exactly the gap MethodHandles, VarHandles, and (historically) sun.misc.Unsafe fill.",

  aha: {
    statement: 'These are progressively lower-level, higher-performance tools than reflection for the exact same "act on code as data" problem - trading safety and portability for raw speed.',
    analogy:
      "If reflection is asking a translator to interpret every single sentence for you in real time, a MethodHandle is " +
      "more like memorizing the translation once and repeating it directly from memory afterward - much faster, because " +
      "you skip the interpretation step on every repeated use."
  },

  underTheHood: [
    'MethodHandle: a typed, directly-invokable reference to a method/constructor/field accessor, resolved once and then invoked with much less per-call overhead than Reflection\'s Method.invoke() - the JIT can often inline through a MethodHandle, which it generally cannot do through reflection.',
    'VarHandle (introduced in Java 9, alongside the modern Java Memory Model APIs): a typed reference to a variable (field, array element) supporting fine-grained atomic and memory-ordering operations (compareAndSet, getVolatile, getAcquire/setRelease) - the modern, safe, standard replacement for most legitimate uses of sun.misc.Unsafe.',
    'sun.misc.Unsafe: an internal, explicitly UNSUPPORTED class historically used by high-performance libraries (Netty, older versions of many concurrency libraries) for direct memory access, bypassing normal safety checks entirely - it was never meant for public/application use and has been progressively locked down and is being phased out in modern JDKs.',
    'The general performance/safety ladder, from safest+slowest to fastest+most dangerous: normal method calls -> Reflection -> MethodHandles -> VarHandles -> Unsafe.',
    'Modern JDKs have been actively closing off Unsafe (via the module system\'s strong encapsulation) specifically to push library authors toward VarHandles, which provide equivalent capability with actual safety guarantees and official support.'
  ],

  inTheWild: [
    'High-performance serialization/concurrency libraries (Netty, parts of the JDK\'s own java.util.concurrent internals) using VarHandles internally to implement lock-free, high-throughput data structures.',
    'Legacy libraries built years ago on sun.misc.Unsafe running into compatibility issues on modern JDKs, forcing a migration to VarHandles as the module system\'s encapsulation tightens further each release.',
    'Interview question (mostly for very senior/infrastructure-focused roles): "Why did the JDK team push Unsafe out in favor of VarHandles?" - because Unsafe bypassed the JVM\'s own safety guarantees entirely and was never an officially supported public API, creating long-term platform risk.'
  ],

  showMe: {
    caption: 'A repeated reflective field access (real overhead per call) vs a VarHandle resolved once.',
    bad: {
      language: 'java',
      code:
        'Field field = MyClass.class.getDeclaredField("value");\n' +
        'field.setAccessible(true);\n' +
        'for (int i = 0; i < 1_000_000; i++) {\n' +
        '    int v = (int) field.get(obj); // reflective call - real per-call overhead, every iteration\n' +
        '}',
      explanation:
        'Every call to field.get() re-pays reflection\'s overhead (security checks, boxing an int into an Integer and ' +
        'back) - for a hot loop like this, that overhead adds up meaningfully.'
    },
    good: {
      language: 'java',
      code:
        'VarHandle handle = MethodHandles.lookup()\n' +
        '    .findVarHandle(MyClass.class, "value", int.class);\n' +
        'for (int i = 0; i < 1_000_000; i++) {\n' +
        '    int v = (int) handle.get(obj); // resolved once, no boxing, JIT can optimize aggressively\n' +
        '}',
      explanation:
        'The VarHandle is resolved once, outside the loop, and each access avoids boxing and much of reflection\'s ' +
        'per-call overhead - the JIT can also optimize repeated VarHandle access far more aggressively than repeated reflective calls.'
    }
  },

  impact: {
    before: 'A hot loop paying reflection\'s per-call overhead a million times over.',
    after: 'The same loop using a pre-resolved VarHandle with dramatically less per-access overhead.',
    metric: 'For genuinely hot paths, replacing repeated reflective field access with a resolved MethodHandle/VarHandle commonly closes most of the performance gap to direct field access.'
  },

  alternatives: [
    {
      name: 'Reflection',
      whenToUse: 'Infrequent, non-hot-path generic access (typical framework startup/configuration code) where simplicity matters more than raw per-call speed.',
      whenNotToUse: 'Hot loops calling the same field/method access millions of times - the per-call overhead becomes measurable.'
    },
    {
      name: 'MethodHandle / VarHandle',
      whenToUse: 'Performance-sensitive library code needing repeated, low-overhead access to fields/methods discovered dynamically, or fine-grained atomic memory operations.',
      whenNotToUse: 'Regular application code - this is squarely library/framework-author territory, not typical business logic.'
    },
    {
      name: 'sun.misc.Unsafe',
      whenToUse: 'Essentially never in new code - it is unsupported, actively being locked down, and VarHandles now cover its legitimate use cases with actual safety guarantees.',
      whenNotToUse: 'Any new code at all in a modern JDK.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Reaching for MethodHandles/VarHandles (or worse, Unsafe) in ordinary application code "for performance," without first profiling to confirm reflection is actually a bottleneck.',
      why:
        "This is squarely premature optimization - for the vast majority of application code (framework startup, " +
        "occasional dynamic dispatch), reflection's overhead is completely negligible, and reaching for a lower-level, " +
        "harder-to-maintain, less-portable tool adds real complexity for no measurable benefit.",
      fix:
        'Profile first. Reserve MethodHandles/VarHandles for genuinely hot paths in library/infrastructure code where measurements show reflection overhead actually matters.'
    }
  ],

  proveIt: {
    question:
      'Why is sun.misc.Unsafe being progressively removed/locked down in modern JDKs, when VarHandles largely provide the same low-level capability?',
    answer:
      'Because Unsafe was never an officially supported public API and bypassed the JVM\'s own safety guarantees entirely ' +
      '- VarHandles provide equivalent low-level capability (atomic operations, memory ordering) through a properly designed, safe, officially supported API instead.'
  },

  oneLiner: 'When even reflection is too slow, MethodHandles and VarHandles trade a bit more complexity for a bit more speed - and Unsafe trades away safety entirely, which is exactly why it is disappearing.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'reflection',
      title: 'Reflection',
      note: 'MethodHandles and VarHandles exist specifically to solve the same "act on code as data" problem as reflection, at a different point on the safety/speed trade-off curve.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'java-memory-model-jmm',
      title: 'Java Memory Model (JMM)',
      note: "VarHandle's getVolatile/getAcquire/setRelease operations are direct, fine-grained expressions of the exact happens-before guarantees defined by the JMM."
    }
  ]
};
