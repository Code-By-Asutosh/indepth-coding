import { ConceptContent } from '../../models/content.model';

export const JAVA_8_PLUS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'java-8',
  title: 'Java 8+',

  hook:
    'You inherit a 10-year-old Java codebase full of manual for-loops, anonymous inner classes implementing Comparator, ' +
    'and null-checks everywhere. Then you see modern Java code that does the same thing in a third of the lines. What actually changed?',

  problem:
    "Java from 1.0 through 7 was a strictly object-oriented, imperative language — no first-class functions, no concise " +
    "way to pass behavior around, and painfully verbose boilerplate for common patterns like iterating and transforming " +
    "collections. Java 8 (2014) was the single biggest shift in the language's history, and everything that came after builds directly on it.",

  aha: {
    statement: 'Java 8 gave the language a way to treat behavior itself as a value you can pass around — everything else (streams, method references) is built on that one shift.',
    analogy:
      "Before Java 8, if you wanted a worker to \"do something specific\" you had to write them a full instruction manual " +
      "(an anonymous class implementing an interface) every single time, even for a one-line instruction. Java 8's lambdas " +
      "let you just hand them a sticky note with the instruction directly — same result, without writing the manual's cover page every time."
  },

  underTheHood: [
    'Lambda expressions: `(a, b) -> a + b` is shorthand for implementing a "functional interface" (an interface with exactly one abstract method) inline, without the ceremony of a full anonymous class.',
    'Functional interfaces (Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T>) in java.util.function give you a standard vocabulary of "shapes" of behavior you can pass around as values.',
    'The Streams API lets you describe a pipeline of operations (filter, map, reduce) on a collection declaratively — you say WHAT transformation you want, not HOW to loop and accumulate it manually.',
    'Method references (`String::toUpperCase`, `System.out::println`) are shorthand for a lambda that just calls an existing method — pure syntactic sugar over a lambda, nothing more.',
    'The `Optional<T>` type gives a explicit, type-checked way to represent "a value that might be absent," as an alternative to returning null and hoping every caller remembers to check.',
    'Default methods on interfaces (a method body directly in an interface) let library authors add new methods to existing interfaces (like adding `forEach` to `Iterable`) without breaking every class that already implements them.'
  ],

  inTheWild: [
    'Refactoring a 15-line manual for-loop that filters, transforms, and collects a list into a 3-line stream pipeline — the most common, visible "Java 8 changed everything" moment for developers.',
    'Passing a `Comparator` as `(a, b) -> a.getAge() - b.getAge()` instead of a whole anonymous class implementing Comparator — a small but constant quality-of-life change across almost all Java code.',
    'Interview question: "What is a functional interface, and why does Java need one to support lambdas?" — Java lambdas are not truly anonymous functions like in JavaScript; they are syntactic sugar that MUST target an interface with exactly one abstract method.'
  ],

  showMe: {
    caption: 'Filtering and transforming a list the pre-Java-8 way vs the modern way.',
    bad: {
      language: 'java',
      code:
        'List<String> upperCaseLongNames = new ArrayList<>();\n' +
        'for (String name : names) {\n' +
        '    if (name.length() > 5) {\n' +
        '        upperCaseLongNames.add(name.toUpperCase());\n' +
        '    }\n' +
        '}',
      explanation:
        "This works fine, but it mixes the WHAT (filter long names, uppercase them) with the HOW (manual loop, manual " +
        "condition, manual accumulation), making the actual intent harder to spot at a glance."
    },
    good: {
      language: 'java',
      code:
        'List<String> upperCaseLongNames = names.stream()\n' +
        '    .filter(name -> name.length() > 5)\n' +
        '    .map(String::toUpperCase)\n' +
        '    .collect(Collectors.toList());',
      explanation:
        'The intent (filter, then transform, then collect) reads directly as three declarative steps — the looping ' +
        'mechanics are handled internally by the Streams implementation.'
    }
  },

  impact: {
    before: 'Common filter/transform/collect logic spread across many lines of manual loop bookkeeping.',
    after: 'The same logic expressed in a few declarative, self-documenting lines.',
    metric: 'Codebases that adopted Java 8 idioms commonly report noticeably shorter, more readable collection-processing code, though raw performance is roughly comparable (sometimes slightly slower due to lambda/boxing overhead) — the win is primarily readability, not speed.'
  },

  alternatives: [
    {
      name: 'Classic for-loops / imperative style',
      whenToUse: 'Performance-critical hot paths where stream overhead (boxing, pipeline setup) genuinely matters, or the logic has complex early-exit/multi-variable state that streams express awkwardly.',
      whenNotToUse: 'Standard filter/map/reduce style transformations — streams are clearer intent for these in almost every case.'
    },
    {
      name: 'Streams / functional style',
      whenToUse: 'The default modern choice for collection transformation pipelines — clearer intent, less boilerplate.',
      whenNotToUse: 'You need to break out of a loop early based on complex conditions, or heavily mutate external state — imperative code is often clearer there.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming "Java 8 style" (streams/lambdas) is always faster than a manual loop, and rewriting hot-path code purely for that reason.',
      why:
        "Streams have real overhead: boxing primitives, allocating intermediate pipeline objects, and (for parallel " +
        "streams) thread-pool coordination cost. For small collections or extremely hot loops, a manual for-loop can " +
        "actually be faster — the Java 8 features were designed primarily for readability and safety, not raw speed.",
      fix:
        'Profile before rewriting a genuinely hot loop for "modern style" — treat streams as a readability tool by ' +
        'default, and only fall back to manual loops in profiler-confirmed hot paths.'
    }
  ],

  proveIt: {
    question:
      'What single interface requirement makes a lambda expression like `(a, b) -> a + b` valid Java, and why can\'t you ' +
      'write a lambda for just any interface?',
    answer:
      'The target type must be a "functional interface" — an interface with exactly one abstract method. The lambda is ' +
      'compiled as an implementation of that one method; an interface with two or more abstract methods gives the ' +
      'compiler no way to know which method the lambda body is meant to implement.'
  },

  oneLiner: 'Java 8 didn\'t add new syntax for its own sake — it gave the language the ability to pass "what to do" around as a value, and everything else follows from that.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams',
      note: 'Streams are the single most visible, most-used feature built directly on top of the lambda/functional-interface foundation introduced here.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'functional-programming',
      title: 'Functional Programming',
      note: 'This concept covers WHAT Java 8 added; Functional Programming covers the deeper paradigm/mindset shift those additions were borrowed from.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'optional',
      title: 'Optional',
      note: 'Optional<T> was introduced in the same Java 8 release as a safer alternative to returning null.'
    }
  ]
};
