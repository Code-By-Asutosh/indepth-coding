import { ConceptContent } from '../../models/content.model';

export const ESCAPE_ANALYSIS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'escape-analysis',
  title: 'Escape Analysis',

  hook:
    'You create a `new Point(x, y)` object inside a hot loop, called a billion times, and brace for garbage collection ' +
    'pressure - except when you check GC logs, that object was never allocated on the heap at all. It just... didn\'t happen. Where did it go?',

  problem:
    "The textbook rule \"every `new` allocates an object on the heap\" is a simplification. Heap allocation has a real " +
    "cost (memory pressure, eventual GC work), and for objects that provably never leave the method they were created in, " +
    "the JIT compiler can prove that cost is completely unnecessary - and simply skip it.",

  aha: {
    statement: 'If the JIT can PROVE an object never "escapes" the method it was created in (no other thread or method can ever see it), it can skip heap allocation entirely and keep the object\'s fields as if they were plain local variables.',
    analogy:
      "It's like a chef who chops vegetables on a cutting board just to combine them immediately into a dish, never " +
      "actually serving the chopped pile separately to anyone. Since nobody outside the kitchen ever needs to see or hold " +
      "that intermediate pile, an efficient kitchen doesn't bother plating it at all - it goes straight into the dish, skipping an unnecessary step."
  },

  underTheHood: [
    'Escape analysis is performed by the C2 (server) JIT compiler on methods proven "hot" enough to receive aggressive optimization - it examines whether a newly created object\'s reference can possibly be observed outside the current method/thread.',
    "An object 'escapes' if it is returned from the method, stored in a field reachable from outside, passed to another method that might retain it, or shared across threads - any of these make the object's lifetime uncertain beyond the current method.",
    'If an object provably does NOT escape, the JIT can perform scalar replacement: instead of allocating the object on the heap, it decomposes the object into its individual fields and treats them as separate local variables/CPU registers - no heap allocation, no eventual GC work for that object at all.',
    'This optimization is entirely automatic and invisible from source code - you write completely normal `new SomeClass(...)` code, and whether it actually allocates on the heap depends on the JIT\'s proof, which can even change between runs based on how the method is used.',
    "This is one of the concrete reasons why 'reduce object creation to help GC' folk-wisdom is sometimes unnecessary - for genuinely short-lived, non-escaping objects, the JIT may already be eliminating the allocation cost entirely, making manual object-pooling a needless complexity for no real benefit.",
    'Escape analysis is a JIT-tier optimization, so it only applies to methods that have actually been JIT-compiled (see JIT Compiler) - a rarely-called, still-interpreted method gets no benefit from this at all.'
  ],

  inTheWild: [
    'A hot loop creating small, short-lived helper objects (like a Point or a Range) purely as intermediate values inside a single method - a strong candidate for escape analysis to eliminate the allocation entirely once the method is JIT-compiled.',
    'Developers manually building object pools to "avoid allocation overhead" for small, genuinely non-escaping objects, sometimes making performance WORSE by adding pool-management complexity for an allocation the JIT would have eliminated anyway.',
    'Interview question: "Does every `new` keyword in Java guarantee a heap allocation?" - no, and explaining escape analysis and scalar replacement is exactly the nuanced, correct answer that separates surface-level knowledge from deeper understanding.'
  ],

  showMe: {
    caption: 'An object that clearly escapes (returned/stored) vs one that provably cannot - the difference that makes escape analysis possible or impossible.',
    bad: {
      language: 'java',
      code:
        '// This Point ESCAPES - it is returned, so the JIT cannot prove\n' +
        '// nothing outside this method will ever reference it. Must be heap-allocated.\n' +
        'Point computeMidpoint(Point a, Point b) {\n' +
        '    Point midpoint = new Point((a.x + b.x) / 2, (a.y + b.y) / 2);\n' +
        '    return midpoint; // escapes via the return value\n' +
        '}',
      explanation:
        'Because midpoint is returned, the caller might store it, pass it elsewhere, or keep it alive indefinitely - the ' +
        'JIT cannot prove its lifetime is confined to this method, so it must be genuinely heap-allocated like any other object.'
    },
    good: {
      language: 'java',
      code:
        '// This Point does NOT escape - it is used only to compute a primitive\n' +
        '// result and then discarded. A prime candidate for scalar replacement.\n' +
        'double distanceBetween(int x1, int y1, int x2, int y2) {\n' +
        '    Point delta = new Point(x2 - x1, y2 - y1); // may never actually hit the heap\n' +
        '    return Math.sqrt(delta.x * delta.x + delta.y * delta.y);\n' +
        '}',
      explanation:
        'delta never leaves this method - it is only read from immediately and then discarded. Once this method is JIT-' +
        'compiled, the JIT can prove this and may skip heap allocation entirely, treating delta.x/delta.y as plain local values.'
    }
  },

  impact: {
    before: "Assuming every object allocation adds real GC pressure, potentially leading to unnecessary manual object-pooling complexity.",
    after: 'Recognizing that non-escaping, short-lived objects in hot methods may already be optimized away entirely by the JIT, at zero code cost.',
    metric: 'For methods where escape analysis successfully applies, the eliminated allocations translate directly into reduced GC pressure - without changing a single line of your source code.'
  },

  alternatives: [
    {
      name: 'Trust escape analysis for short-lived, non-escaping objects',
      whenToUse: "The default assumption for small helper objects used and discarded entirely within one hot method - let the JIT handle it.",
      whenNotToUse: "You have PROFILED and confirmed genuine, significant allocation pressure from objects that provably escape (and therefore cannot benefit from this optimization)."
    },
    {
      name: 'Manual object pooling',
      whenToUse: 'Confirmed-by-profiling, genuinely expensive-to-create objects that DO escape their creating method and are reused very frequently (e.g. certain buffer types in extremely high-throughput systems).',
      whenNotToUse: 'Small, cheap, non-escaping objects - pooling adds real complexity and can be actively worse than an allocation the JIT would have eliminated anyway.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Manually implementing an object pool "to reduce GC pressure" for small, short-lived objects without first profiling to confirm there is an actual problem.',
      why:
        'Escape analysis may already be eliminating the allocation cost for exactly this kind of object once the method ' +
        "is JIT-compiled - adding manual pooling on top adds real complexity (thread-safety concerns, pool sizing, subtle " +
        "reuse bugs) for a problem that, in many cases, does not actually exist by the time the code is running hot.",
      fix:
        'Profile first to confirm genuine, significant allocation pressure exists before introducing object pooling - for small, non-escaping objects, trust the JIT to already be handling it.'
    }
  ],

  proveIt: {
    question:
      'A method creates a `new StringBuilder()`, uses it locally to build a string, and returns only the final `.toString()` result (not the StringBuilder itself). Is the StringBuilder object a candidate for escape analysis elimination?',
    answer:
      "Yes - the StringBuilder instance itself never leaves the method (only the resulting String does), so if this " +
      "method is proven hot enough to be JIT-compiled, the JIT may prove the StringBuilder does not escape and eliminate its heap allocation via scalar replacement."
  },

  oneLiner: 'Not every `new` becomes a real heap object - if the JIT can prove it never leaves the method, it can skip the allocation entirely.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jit-compiler',
      title: 'JIT Compiler',
      note: 'Escape analysis is specifically a C2 (server compiler) optimization, applied only once a method is proven hot enough to be compiled by the JIT.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'memory-management',
      title: 'Memory Management',
      note: 'Escape analysis directly reduces the number of objects that ever reach the heap in the first place, complementing the reachability/garbage-collection concepts covered in Memory Management.'
    }
  ]
};
