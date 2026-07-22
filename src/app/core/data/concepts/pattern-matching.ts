import { ConceptContent } from '../../models/content.model';

export const PATTERN_MATCHING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'pattern-matching-instanceof-switch-expressions',
  title: 'Pattern Matching',

  hook:
    'You write `if (obj instanceof String)`, and then, on the very next line, cast `obj` to `String` anyway — a cast the ' +
    'compiler could have already proven safe for you, from information you gave it one line earlier. Why did Java make you type that twice?',

  problem:
    'Classic Java forced you to check a type with `instanceof`, then separately (and redundantly) cast to that same type ' +
    'before you could actually use it as that type — an extra, error-prone step (a typo in the cast type would only be ' +
    'caught by luck) for information the compiler had already verified for you.',

  aha: {
    statement: "Pattern matching lets you check a type AND bind it to a variable of that type in one single step — you never write a redundant cast again.",
    analogy:
      "Classic instanceof + cast is like a bouncer confirming you're on the guest list, and then, right at the same door, " +
      "asking you to show your ID again just to prove your own name to yourself. Pattern matching is the bouncer just " +
      "handing you a wristband labeled with your name the moment they confirm you're on the list — you never re-prove what was just established."
  },

  underTheHood: [
    'Pattern matching for instanceof: `if (obj instanceof String s)` checks the type AND, if true, binds `s` as a String directly usable inside that block — no separate cast line needed.',
    'The bound variable\'s scope follows normal flow analysis: `if (!(obj instanceof String s)) return; // s is usable below this point` — Java is smart enough to know that if you did not return, obj must be a String.',
    'Pattern matching for switch (a newer, more general feature): `switch (shape) { case Circle c -> ...; case Square sq -> ...; }` combines the type check, the cast, AND the branching into one construct.',
    'Record patterns let you destructure a record directly in a case: `case Point(int x, int y) -> ...` binds x and y straight out of the record\'s components, without a separate `.x()`/`.y()` call.',
    'Guarded patterns add an extra condition to a case: `case Circle c when c.radius() > 100 -> "big circle"` — the case only matches if both the type AND the guard condition hold.',
    'Combined with sealed interfaces (see Sealed Classes), a switch pattern-matching over every permitted subtype can be checked for exhaustiveness by the compiler — no default branch needed, and a missing case is a compile error.'
  ],

  inTheWild: [
    'Simplifying `equals()` implementations: `if (o instanceof Point p) return x == p.x && y == p.y;` — the single most common, everyday use of pattern matching in real code.',
    'Processing a sealed `ApiResult` hierarchy with a switch expression that destructures `Success(var data)` and `Failure(var errorCode)` directly, instead of separate instanceof checks and manual field access.',
    'Interview question: "What is the difference between `switch` statements and `switch` EXPRESSIONS in modern Java?" — expressions return a value directly (using `->` arrows, no fall-through) and support pattern matching, while classic switch statements do neither by default.'
  ],

  showMe: {
    caption: 'Classic instanceof + manual cast vs pattern-matching instanceof.',
    bad: {
      language: 'java',
      code:
        'if (obj instanceof String) {\n' +
        '    String s = (String) obj; // redundant cast — the compiler already proved this\n' +
        '    System.out.println(s.length());\n' +
        '}',
      explanation:
        'The instanceof check already proves obj is a String — the cast on the next line is purely repeated, ' +
        'error-prone boilerplate for information the compiler already established one line above.'
    },
    good: {
      language: 'java',
      code:
        'if (obj instanceof String s) {\n' +
        '    System.out.println(s.length()); // s is already a String, no cast needed\n' +
        '}',
      explanation:
        'The type check and the binding happen in one step — s is directly usable as a String inside the block, with ' +
        'the redundant cast eliminated entirely and no possibility of a mismatched cast typo.'
    }
  },

  impact: {
    before: 'Every type-check-then-use pattern needs two lines: one to check, one to redundantly cast.',
    after: 'The same logic in one line, with the compiler guaranteeing the cast is correct.',
    metric: 'Across a large codebase with hundreds of instanceof checks (very common in equals() methods and visitor-style code), this can meaningfully shrink both line count and the surface area for cast-related typos.'
  },

  alternatives: [
    {
      name: 'Pattern-matching instanceof / switch',
      whenToUse: 'The default modern choice for any type-check-then-use logic — always safer and shorter than the classic form.',
      whenNotToUse: 'You are constrained to an older Java version (pre-16 for instanceof patterns, pre-21 for full switch pattern matching / record patterns).'
    },
    {
      name: 'Classic instanceof + manual cast',
      whenToUse: 'Only when stuck on an older Java version.',
      whenNotToUse: 'Any modern Java codebase — pattern matching is strictly safer and more concise.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Adding a broad `default` case to a switch over a sealed hierarchy purely to silence a compiler warning, instead of handling the new pattern deliberately.',
      why:
        "It makes the compiler stop complaining immediately, but it silently defeats the exhaustiveness guarantee that " +
        "sealed types + pattern matching are specifically designed to provide — the whole point was to be FORCED to " +
        "consider new cases explicitly, and a catch-all default removes that safety net.",
      fix:
        'When a new sealed subtype breaks an exhaustive switch, add a genuine, considered case for it rather than a catch-all default.'
    }
  ],

  proveIt: {
    question:
      'Inside `if (!(obj instanceof String s)) { return; }`, is `s` usable as a String AFTER this if-block, on the lines that follow it?',
    answer:
      "Yes — Java's flow analysis understands that the only way execution reaches the code after the if-block is if the " +
      'negated condition was false, meaning obj WAS a String, so s remains bound and usable as a String for the rest of that method scope.'
  },

  oneLiner: 'Pattern matching collapses "check the type" and "use the type" into a single step the compiler can verify for you.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'sealed-classes',
      title: 'Sealed Classes',
      note: 'Pattern matching becomes dramatically safer when combined with sealed types, because the compiler can then verify every possible case is actually handled.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'records',
      title: 'Records',
      note: 'Record patterns let a switch destructure a record\'s components directly in the case label — this only works this cleanly because records expose their data transparently.'
    }
  ]
};
