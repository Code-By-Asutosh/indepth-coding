import { ConceptContent } from '../../models/content.model';

export const BYTECODE_BASICS_JAVAP: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'bytecode-basics-javap',
  title: 'Bytecode Basics / javap',

  hook:
    'You write `a + b` for two Strings, and everyone says "String concatenation with + creates a new StringBuilder under ' +
    'the hood." How would you actually PROVE that claim yourself, without just trusting a blog post?',

  problem:
    'Most developers treat compiled .class files as an opaque black box between "my source code" and "it runs." But the ' +
    "compiler's output (bytecode) is entirely inspectable, plain text once decompiled - and being able to look at it " +
    "directly is how you verify claims about what your code ACTUALLY does, instead of trusting folklore.",

  aha: {
    statement: '`javap` (bundled with every JDK) lets you disassemble a compiled .class file back into readable bytecode instructions - you can literally read what javac actually produced from your source.',
    analogy:
      "Trusting a claim about what your code compiles to without checking is like trusting a rumor about what's in a " +
      "sealed envelope. javap is opening the envelope yourself and reading the letter directly - no more relying on " +
      "secondhand claims about what the compiler 'probably' did."
  },

  underTheHood: [
    'javac compiles .java source into .class files containing bytecode - a stack-based instruction set (push values onto an operand stack, operate on them, store results) that the JVM interprets or JIT-compiles.',
    '`javap -c MyClass.class` disassembles the compiled class, printing each method\'s bytecode instructions in a readable, textual form (e.g. `aload_0`, `invokevirtual`, `areturn`).',
    'Common instructions worth recognizing: `aload`/`iload` (push a reference/int local variable onto the stack), `invokevirtual`/`invokestatic`/`invokespecial` (call a method), `new` (allocate an object), `areturn`/`ireturn` (return a value).',
    'This is exactly how you can verify the classic claim that `String a = "x" + variable;` compiles to bytecode using a `StringBuilder` (`new StringBuilder().append(...).append(...).toString()`) instead of naive repeated concatenation.',
    '`javap -v` (verbose) additionally shows the constant pool - a table of literals, class/method/field references the bytecode refers to by index - giving a complete picture of everything a compiled class depends on.',
    'Being able to read bytecode is invaluable for understanding what the compiler REALLY does with syntactic sugar (enhanced for-loops, try-with-resources, lambdas, records) - all of these compile down to plain bytecode using older, more primitive constructs.'
  ],

  inTheWild: [
    'Verifying, instead of assuming, whether a for-each loop over a List compiles to using an Iterator internally (it does - javap on a compiled for-each loop shows explicit `invokeinterface` calls to `hasNext()`/`next()`).',
    'Confirming that string concatenation with `+` inside a loop really does create a NEW StringBuilder on every iteration (a classic performance gotcha) by disassembling the loop and counting `new` instructions.',
    'Interview question (senior/infra roles): "How would you verify what a lambda expression actually compiles to?" - javap combined with knowledge that lambdas use `invokedynamic` (a different mechanism from anonymous classes) is the concrete, correct answer.'
  ],

  showMe: {
    caption: 'Trusting a claim about String concatenation vs verifying it directly with javap.',
    bad: {
      language: 'text',
      code:
        '// "I read online that + concatenation is slow in a loop because of StringBuilder\n' +
        '// overhead" - repeated as folklore, never actually verified.\n' +
        'String result = "";\n' +
        'for (String s : items) {\n' +
        '    result += s; // "probably" creates a new StringBuilder each time... right?\n' +
        '}',
      explanation:
        'Without checking, this is just trusting secondhand claims about compiler behavior - which may be outdated, ' +
        'JDK-version-specific, or simply wrong for the exact code you actually wrote.'
    },
    good: {
      language: 'bash',
      code:
        'javac Loop.java\n' +
        'javap -c Loop.class\n' +
        '# Output shows, inside the loop body:\n' +
        '#   new           #7   // class java/lang/StringBuilder\n' +
        '#   invokespecial #9   // StringBuilder.<init>\n' +
        '#   ... append calls ...\n' +
        '#   invokevirtual #12  // StringBuilder.toString\n' +
        '# CONFIRMED: a new StringBuilder really is allocated on every single iteration.',
      explanation:
        'javap shows the ACTUAL compiled instructions - you can directly confirm (or refute) the claim by counting how ' +
        'many times `new #StringBuilder` appears inside the loop\'s bytecode, instead of relying on secondhand claims.'
    }
  },

  impact: {
    before: 'Performance and correctness decisions based on unverified folklore about what code "probably" compiles to.',
    after: 'Decisions grounded in directly-verified compiled output, specific to your actual JDK version and code.',
    metric: 'This is less about a number and more about epistemics: javap converts "I heard that..." into "I checked, and confirmed..." - a meaningfully more reliable basis for both learning and debugging.'
  },

  alternatives: [
    {
      name: 'javap (bytecode disassembly)',
      whenToUse: 'Verifying exactly what the compiler produced for a specific piece of source code - the ground truth.',
      whenNotToUse: 'Day-to-day application development - this is a diagnostic/learning tool, not something you read regularly in normal workflows.'
    },
    {
      name: 'JFR (JDK Flight Recorder) / async-profiler',
      whenToUse: 'Understanding RUNTIME behavior (where time is actually spent, what is allocated) rather than static compiled structure.',
      whenNotToUse: "You specifically need to see the exact compiled instructions of a method, independent of runtime behavior - that is javap's specific job."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming bytecode behavior is identical across JDK versions or compiler settings, without re-checking after an upgrade.',
      why:
        'javac and the JIT both evolve - optimizations, intrinsics, and even how certain language features are compiled ' +
        '(e.g. string concatenation strategies changed between older and newer JDKs, from StringBuilder chains to `invokedynamic`-based indification) can genuinely change between versions.',
      fix:
        'Treat a javap finding as specific to the JDK version you tested - re-verify with javap again after any major JDK upgrade if the exact compiled behavior matters to your reasoning.'
    }
  ],

  proveIt: {
    question:
      'You want to confirm whether a `try-with-resources` block really calls `close()` even when an exception is thrown ' +
      'inside the try. What specific tool and command would let you verify this directly, instead of trusting documentation alone?',
    answer:
      '`javap -c` on the compiled .class file - it would show the bytecode\'s exception table and the explicit calls to ' +
      'close() present in both the normal path and the exception-handling path, directly confirming the guarantee at the instruction level.'
  },

  oneLiner: 'javap turns "I heard the compiler does X" into "I looked, and it really does X" - verification instead of folklore.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jvm-internals',
      title: 'JVM Internals',
      note: 'Bytecode is exactly what the Class Loader Subsystem loads and the Execution Engine runs - this concept lets you directly inspect the artifact those subsystems described in JVM Internals actually operate on.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jit-compiler',
      title: 'JIT Compiler',
      note: 'Bytecode is the INPUT the JIT compiler eventually translates into native machine code - javap shows you the starting point of that whole process.'
    }
  ]
};
