import { ConceptContent } from '../../models/content.model';

export const FUNCTIONAL_PROGRAMMING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'functional-programming',
  title: 'Functional Programming',

  hook:
    'A teammate reviews your PR and says "this method has a side effect, it\'s not pure." You pass unit tests fine. Why ' +
    'does it matter whether a method is "pure," if the output is correct?',

  problem:
    "Java is fundamentally an object-oriented, imperative language, but Java 8+ borrowed core ideas from functional " +
    "programming (immutability, pure functions, passing behavior as values). Without understanding WHY those ideas exist " +
    "(what specific bugs they prevent), functional-style Java code just looks like unnecessary restriction for no reason.",

  aha: {
    statement: "A pure function's output depends ONLY on its inputs, and it changes nothing outside itself — which means you can reason about it in complete isolation, without knowing anything about the rest of the program.",
    analogy:
      "A pure function is like a vending machine: put in the same exact input (money + selection), get the same exact " +
      "output (the same snack), every single time, and nothing about the machine changes elsewhere in the store. An " +
      "impure function is more like asking a moody cashier for a snack — the answer might depend on their mood (hidden " +
      "state), and asking might also change something else (a side effect), like their mood getting worse."
  },

  underTheHood: [
    'A pure function has no side effects (does not mutate shared state, does not do I/O) and is referentially transparent — calling it with the same arguments always produces the same result, so you can mentally replace the call with its result.',
    'Immutability means once created, an object\'s state never changes — instead of mutating, you create a new object with the updated value. This eliminates an entire class of concurrency bugs, because a truly immutable object can be safely shared across threads with zero synchronization.',
    'Higher-order functions either accept a function as an argument (like Stream.map(Function<T,R>)) or return one — this is what makes passing "behavior" around as a value practically useful, not just theoretically possible.',
    'First-class functions means functions (or in Java\'s case, lambdas/method references implementing functional interfaces) can be assigned to variables, passed as arguments, and returned from other functions, just like any other value.',
    'Java is NOT a purely functional language — it still has mutable state, loops, and side effects everywhere by default. "Functional-style Java" means deliberately choosing immutability and pure functions where it helps, not a language-enforced requirement.'
  ],

  inTheWild: [
    'A `record` (immutable by construction) used for a value object like `Money` or `Point` — once created, its fields can never change, eliminating "who mutated this and when" bugs entirely.',
    'A `Comparator` passed as a lambda into `.sorted(...)` — the sorting logic itself is treated as a value being handed to another function, the essence of functional-style code.',
    'Interview question: "Why is immutability considered valuable for thread-safety?" — because an object that can never change after construction cannot have a race condition on its own fields; there is nothing to race over.'
  ],

  showMe: {
    caption: 'A mutable, side-effecting "pure-looking" method vs an actually pure one.',
    bad: {
      language: 'java',
      code:
        'private int runningTotal = 0; // shared, mutable state\n\n' +
        'int addToTotal(int amount) {\n' +
        '    runningTotal += amount; // side effect: mutates shared state\n' +
        '    return runningTotal;\n' +
        '}\n' +
        '// Calling addToTotal(5) twice gives DIFFERENT results each time —\n' +
        '// not because of a different input, but because of hidden shared state.',
      explanation:
        'This function is impure: its result depends on hidden state (runningTotal) that changes with every call, so ' +
        'you cannot reason about it just by looking at its arguments — you also have to track every prior call.'
    },
    good: {
      language: 'java',
      code:
        'int add(int a, int b) {\n' +
        '    return a + b; // depends ONLY on inputs, changes nothing outside itself\n' +
        '}\n' +
        '// add(2, 3) is ALWAYS 5, no matter how many times or in what order it\'s called,\n' +
        '// and it is trivially safe to call from any number of threads at once.',
      explanation:
        'This function is pure: given the same inputs, it always produces the same output, and it has zero effect on ' +
        'anything outside itself — you can test it, reason about it, and call it concurrently with total confidence.'
    }
  },

  impact: {
    before: 'A shared, mutable running total that produces different results depending on call history and needs synchronization to be thread-safe.',
    after: 'A pure function that is trivially testable, trivially thread-safe, and needs no synchronization at all.',
    metric: 'Pure functions and immutable data are the primary reason well-written functional-style code needs dramatically less `synchronized`/locking than equivalent mutable, stateful code.'
  },

  alternatives: [
    {
      name: 'Pure functions / immutable data (functional style)',
      whenToUse: 'Value objects, transformation logic, anything shared across threads, or anywhere testability matters most.',
      whenNotToUse: 'Performance-critical code where allocating a new object per change is measurably too costly — controlled, well-encapsulated mutation can be faster.'
    },
    {
      name: 'Mutable, stateful, imperative style',
      whenToUse: 'Genuinely stateful things by nature (a game character\'s health, a UI widget\'s current state) or hot loops where allocation overhead matters.',
      whenNotToUse: "Anything shared across threads without explicit synchronization — mutable shared state is the root cause of most concurrency bugs."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Writing a lambda passed into a stream operation that mutates an external variable (e.g. incrementing a shared counter inside `.forEach(...)`).',
      why:
        "It looks harmless in a simple sequential stream, and often 'works' by coincidence. The moment that same lambda " +
        "runs inside a parallelStream(), multiple threads mutate that shared variable concurrently with no synchronization " +
        "— reintroducing the exact race-condition bug that functional style was supposed to help avoid.",
      fix:
        'Avoid mutating external state from within stream lambdas entirely — use `.collect(...)`, `.reduce(...)`, or ' +
        'similar built-in accumulation instead of a hand-rolled external counter.'
    }
  ],

  proveIt: {
    question:
      'A method has no parameters, reads a static mutable field, and returns a value based on it. Is this method pure? Why or why not?',
    answer:
      'No — even with zero parameters, if the return value depends on external mutable state (the static field) that can ' +
      'change between calls, the same "input" (none) does not guarantee the same output every time, which violates referential transparency.'
  },

  oneLiner: 'Functional programming is not about avoiding loops — it is about knowing exactly what a piece of code depends on and affects, with nothing hidden.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams',
      note: 'Streams are the most concrete, widely-used expression of functional-style thinking in everyday Java code.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'records',
      title: 'Records',
      note: 'Records are Java\'s built-in tool for creating the immutable value objects that functional-style code relies on.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading',
      note: 'Immutability (a core functional programming idea) is one of the simplest, most effective ways to eliminate the race conditions covered in Multithreading — an immutable object literally cannot race with itself.'
    }
  ]
};
