import { ConceptContent } from '../../models/content.model';

export const PROJECT_VALHALLA: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'project-valhalla-value-types',
  title: 'Project Valhalla (Value Types)',

  hook:
    'You have an array of 10 million `Point` objects, each holding just two `int` fields. In memory, this takes up ' +
    'dramatically more space than 10 million pairs of raw ints would - and every single access involves an extra hop through a pointer. Why does Java pay that cost, and what is being done about it?',

  problem:
    "Every object in Java, no matter how small or simple, is a heap-allocated thing accessed through a reference (a " +
    "pointer) - even a tiny two-field Point. This means an array of a million Points is really an array of a million " +
    "POINTERS to a million separately-allocated objects scattered across the heap, with real memory overhead per object " +
    "and poor CPU cache locality (because the actual data is not stored contiguously).",

  aha: {
    statement: 'Project Valhalla aims to let simple data-carrying classes be stored INLINE (their fields packed directly next to each other in memory) instead of as separate heap objects accessed through a pointer - trading object identity for raw memory efficiency, for the cases that never needed identity anyway.',
    analogy:
      "A normal Java object array today is like a phone book full of addresses, where you have to drive to a different " +
      "house for every single entry to actually see what's inside. A value type array is like the phone book printing " +
      "each entry's full details directly on the page itself - no driving anywhere, everything you need is right there, laid out contiguously."
  },

  underTheHood: [
    'Every current Java object has "identity" - even two objects with identical field values are still distinguishable via `==` (are these the SAME object) and can be synchronized on, used as a `WeakReference` target, etc.',
    'For simple data carriers (a Point, a Complex number, a Money amount) identity is usually irrelevant - nobody cares WHICH specific Point object you have, only what x and y actually ARE, which is exactly the profile records already formalized at the language level.',
    'Value classes (Valhalla\'s proposed feature) would let the JVM store such objects "flattened" - their fields laid out directly inline in an array or in a containing object\'s memory, with no separate heap allocation or pointer indirection needed at all.',
    'This directly attacks the exact cost the Hook example describes: an array of a million value-type Points could be stored as one contiguous block of 2 million ints, instead of a million separate heap objects each accessed through a pointer - better memory density and dramatically better CPU cache locality.',
    "This is a genuinely deep, multi-year JVM engineering effort (still evolving as of this writing) because it must preserve backward compatibility with decades of existing code that assumes every object has identity - it is not a simple, drop-in feature.",
    'Records (already shipped) are a strong hint at the eventual direction - a class that is purely, transparently its data is exactly the kind of type Valhalla\'s value classes are aimed at optimizing at the JVM/memory-layout level.'
  ],

  inTheWild: [
    'Large-scale data processing and scientific/numeric computing workloads (holding millions of simple coordinate/vector/complex-number values) that currently pay real memory and cache-locality overhead for using "proper" objects instead of parallel primitive arrays as a workaround.',
    'Developers today manually working around this exact problem by using parallel primitive arrays (e.g. separate `int[] xs` and `int[] ys` instead of `Point[] points`) purely for performance, at the cost of much worse code readability - precisely the trade-off Valhalla aims to eliminate.',
    'Interview/discussion question (forward-looking): "Why can\'t the JVM just automatically inline every small immutable object today?" - because ALL current objects have identity semantics (==, synchronization, WeakReference) baked into the object model, and changing that for existing types would break decades of code that implicitly relies on it.'
  ],

  showMe: {
    caption: 'The current, real-world workaround (parallel primitive arrays for performance) vs the future value-type-array vision Valhalla targets.',
    bad: {
      language: 'java',
      code:
        '// Current-day workaround for memory/cache-locality: give up readable\n' +
        '// Point objects entirely, in favor of raw parallel primitive arrays.\n' +
        'int[] xs = new int[10_000_000];\n' +
        'int[] ys = new int[10_000_000];\n' +
        '// Readable code would be: Point[] points = new Point[10_000_000];\n' +
        '// but today, that array is 10 million separate heap objects and pointers.',
      explanation:
        'Developers today often sacrifice the readability of a proper `Point[]` array specifically to avoid the real ' +
        'memory overhead and cache-locality cost of an array of pointers to separately-allocated objects.'
    },
    good: {
      language: 'text',
      code:
        '// Conceptual future direction (Project Valhalla, still evolving):\n' +
        'value record Point(int x, int y) {} // hypothetical "value class" of a record\n\n' +
        'Point[] points = new Point[10_000_000];\n' +
        '// If Point is a value class, this array could be laid out as one\n' +
        '// contiguous block of 20 million ints - no separate heap objects,\n' +
        '// no pointer indirection, while keeping the readable Point[] API.',
      explanation:
        'The GOAL is to let code stay readable (a genuine Point[] array) while the JVM stores it as efficiently as the ' +
        'hand-rolled parallel-array workaround - eliminating the trade-off between readability and performance for this class of type.'
    }
  },

  impact: {
    before: 'Choosing between readable object-oriented code (Point[]) and memory/cache-efficient code (parallel primitive arrays) - you cannot fully have both today.',
    after: '(Future/in-progress) The same readable Point[] code achieving memory layout and cache-locality close to the hand-optimized primitive-array version.',
    metric: 'This is a forward-looking, still-evolving JVM feature - the concrete performance numbers will depend on the final delivered design, but the underlying motivation (closing the readability-vs-performance gap for simple data types) is well-established and worth understanding now.'
  },

  alternatives: [
    {
      name: 'Records (available today)',
      whenToUse: 'Immutable, transparent data carriers where you want reduced boilerplate NOW - records are the closest thing currently available to the eventual value-type story.',
      whenNotToUse: "You specifically need Valhalla's memory-layout benefits (flattened, pointer-free storage) - that part of the vision is not yet delivered by records alone."
    },
    {
      name: 'Manual parallel primitive arrays (today\'s workaround)',
      whenToUse: 'Extremely performance-critical numeric/data-processing code today, where the memory/cache-locality cost of object arrays is measured and confirmed to matter.',
      whenNotToUse: 'Most application code - the readability cost is usually not worth it unless profiling has specifically confirmed the object-array overhead is a real bottleneck.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming Project Valhalla and value types are already fully available and production-ready in current JDK releases.',
      why:
        "This is a long-running, still-evolving JDK feature effort - different preview/early-access builds have exposed " +
        "partial pieces of it over time, but as of this writing it has not fully landed as a stable, generally available language feature the way records or pattern matching have.",
      fix:
        'Check the specific JDK version and its release notes/JEP status before relying on value-type features in production code - treat this concept as important CONTEXT for where the JVM is heading, not a guaranteed-available tool today.'
    }
  ],

  proveIt: {
    question:
      'Why can\'t the JVM simply treat every existing small, immutable class as a flattened value type automatically, without any new syntax or opt-in?',
    answer:
      'Because every current Java object has "identity" semantics baked in by default (== compares object identity, ' +
      'objects can be synchronized on, referenced weakly, etc.) - silently changing that behavior for existing classes ' +
      'would break decades of code that implicitly relies on identity semantics, which is exactly why this requires a deliberate, opt-in new kind of class rather than an automatic, transparent optimization.'
  },

  oneLiner: 'Project Valhalla aims to let simple data types skip the pointer entirely - trading the object identity most data never needed for real memory and cache-locality gains.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'records',
      title: 'Records',
      note: 'Records are the language-level formalization of "this class is just its data" - exactly the profile of type Valhalla\'s value classes are designed to store more efficiently at the JVM level.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'memory-management',
      title: 'Memory Management',
      note: 'Understanding how objects are normally allocated and referenced on the heap (covered in Memory Management) is essential background for appreciating what "flattened, pointer-free storage" actually changes.'
    }
  ]
};
