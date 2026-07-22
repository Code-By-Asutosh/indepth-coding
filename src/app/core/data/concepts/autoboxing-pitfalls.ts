import { ConceptContent } from '../../models/content.model';

export const AUTOBOXING_PITFALLS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'autoboxing-pitfalls',
  title: 'Autoboxing Pitfalls',

  hook:
    '`Integer a = 100; Integer b = 100; a == b` prints `true`. Change both numbers to `200`, and the EXACT same comparison ' +
    'prints `false`. You changed a number, not the logic. How did that flip the answer?',

  problem:
    'Autoboxing (automatically converting between primitives like `int` and their wrapper objects like `Integer`) makes ' +
    "wrapper types feel like primitives in everyday code — until you compare them with `==`, at which point they " +
    "silently behave like OBJECTS (identity comparison) instead of values, and a JVM caching optimization makes the bug invisible for small numbers.",

  aha: {
    statement: 'Integer (and other wrapper types) are objects, not primitives — `==` on them compares object identity, and only an internal caching optimization makes small numbers "accidentally" behave like value comparison.',
    analogy:
      "It's like a warehouse that keeps a small pre-made stock of common items (say, numbers -128 to 127) ready to hand " +
      "out the SAME physical unit to anyone who asks — so two orders for '100' happen to get handed the identical " +
      "physical item. But for less common numbers, the warehouse manufactures a brand new unit for every single order — " +
      "so two orders for '200' get two DIFFERENT physical items, even though they're functionally identical products."
  },

  underTheHood: [
    'Autoboxing automatically converts a primitive (`int`) to its wrapper object (`Integer`) when needed (e.g. adding to a `List<Integer>`, which cannot hold primitives directly) — and unboxing converts back the other way.',
    'The JVM caches `Integer` objects for values from -128 to 127 (the `Integer.valueOf()` cache) — any autoboxing of a value in that range returns the SAME cached object every time, which is why `==` "happens to" return true for small numbers.',
    'Outside that cached range (e.g. 200), autoboxing creates a genuinely NEW Integer object each time, so `==` correctly reports them as different objects — even though their actual numeric VALUE is identical.',
    'This means the exact same `==` comparison can silently flip between "working" and "broken" purely based on the numeric VALUE involved, which is what makes this bug so treacherous — it can pass every test that happens to use small numbers.',
    'Unboxing a `null` wrapper (e.g. `Integer count = null; int x = count;`) throws `NullPointerException` at the exact point of unboxing — this is a very common, easy-to-miss source of NPEs, especially when a wrapper field defaults to null and is used in arithmetic without a null check.',
    'Mixing primitives and wrapper objects in conditional expressions can also silently trigger unwanted unboxing and NPEs in surprising places, due to Java\'s type-unification rules for ternary expressions.'
  ],

  inTheWild: [
    'A subtle bug where `if (userIdWrapper == constantId)` works perfectly in development/testing (small IDs, within the cache range) and silently fails in production once real IDs exceed 127.',
    'A database column mapped to a nullable `Integer` field that is used directly in arithmetic (`total += count;`) without a null check — throwing NullPointerException the first time a row genuinely has a null value for that column.',
    'Interview question: "Why does `Integer.valueOf(100) == Integer.valueOf(100)` return true but `Integer.valueOf(200) == Integer.valueOf(200)` return false?" — one of the most classic Java interview questions, testing whether you know about the Integer cache, not just that == is "sometimes wrong" for objects.'
  ],

  showMe: {
    caption: 'Comparing boxed Integers with == (identity, breaks outside the cache range) vs .equals() or unboxed primitives.',
    bad: {
      language: 'java',
      code:
        'Integer discountThreshold = 200;\n' +
        'Integer customerOrderCount = getOrderCount(customerId); // e.g. also 200\n\n' +
        'if (customerOrderCount == discountThreshold) { // FALSE — outside the -128..127 cache range!\n' +
        '    applyLoyaltyDiscount();\n' +
        '}\n' +
        '// The discount is silently NOT applied, even though both values are genuinely 200.',
      explanation:
        'Both values are numerically 200, well outside the -128 to 127 cache range, so each autoboxing creates a ' +
        'separate object — == correctly (but unhelpfully) reports they are different objects, silently breaking business logic.'
    },
    good: {
      language: 'java',
      code:
        'Integer discountThreshold = 200;\n' +
        'Integer customerOrderCount = getOrderCount(customerId);\n\n' +
        'if (customerOrderCount.equals(discountThreshold)) { // TRUE — compares actual numeric value\n' +
        '    applyLoyaltyDiscount();\n' +
        '}\n' +
        '// Or, even simpler: compare as primitives to sidestep boxing entirely:\n' +
        'if (customerOrderCount.intValue() == discountThreshold.intValue()) { applyLoyaltyDiscount(); }',
      explanation:
        '.equals() (or explicitly unboxing to primitive int before comparing) compares actual numeric value, completely ' +
        'independent of whether the boxed values happened to fall inside the JVM\'s small-integer cache.'
    }
  },

  impact: {
    before: 'Business logic that silently works for small test values and silently fails for real production values above 127.',
    after: 'Correct, consistent numeric comparison regardless of value magnitude.',
    metric: 'This is a textbook case of a bug that passes every unit test using convenient small numbers, and only manifests once real production data exceeds the cache boundary — exactly the kind of bug that erodes trust in "it passed all our tests."'
  },

  alternatives: [
    {
      name: 'Primitive types (int, long, double) where nullability is not needed',
      whenToUse: 'Default choice whenever the value can never legitimately be "absent" — avoids boxing overhead and == pitfalls entirely.',
      whenNotToUse: "Fields/return values that genuinely need to represent 'no value' (e.g. a nullable database column) — primitives cannot represent null."
    },
    {
      name: 'Wrapper types (Integer, Long) compared with .equals()',
      whenToUse: 'You genuinely need nullability (an optional numeric field) or need to store values in generic collections.',
      whenNotToUse: 'Never compare them with == for value equality — that is the entire pitfall this concept exists to prevent.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Using == to compare two boxed wrapper objects (Integer, Long, etc.) for value equality.',
      why:
        'It "works" for small values (thanks to the JVM\'s -128..127 caching optimization), which is exactly what makes ' +
        "it dangerous — it passes casual testing and even a fair amount of real usage, then silently breaks the moment values exceed the cached range, with no exception thrown to reveal the mistake.",
      fix:
        'Always use .equals() to compare wrapper objects for value equality, or unbox to a primitive first if you specifically want a primitive numeric comparison.'
    }
  ],

  proveIt: {
    question:
      'Does `Integer.valueOf(127) == Integer.valueOf(127)` return true or false? What about `Integer.valueOf(128) == Integer.valueOf(128)`?',
    answer:
      'The first is true (127 is within the JVM\'s cached range of -128 to 127), and the second is false (128 is just ' +
      'outside that range, so two genuinely separate objects are created) — this exact boundary is why the bug can appear "randomly" depending on the specific values involved.'
  },

  oneLiner: 'Small numbers make == on wrapper objects lie to you — the JVM\'s caching optimization hides the bug exactly long enough for it to reach production.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'string-pool-interning',
      title: 'String Pool & Interning',
      note: 'This is the near-identical numeric sibling of the String pool trap — both are caused by an internal JVM sharing optimization making == "accidentally" appear correct for common/small values.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'exception-handling',
      title: 'Exception Handling',
      note: 'Unboxing a null wrapper throws NullPointerException at the exact unboxing point — understanding checked vs unchecked exceptions helps explain why this particular NPE can appear in unexpected places.'
    }
  ]
};
