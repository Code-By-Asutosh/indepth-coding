import { ConceptContent } from '../../models/content.model';

export const EXCEPTION_HANDLING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'exception-handling',
  title: 'Exception Handling',

  hook:
    'A `finally` block has a `return` statement in it. So does the `try` block above it. Which value actually gets returned ' +
    '— and did the exception that was about to propagate just silently disappear?',

  problem:
    "Most developers learn try/catch/finally as \"the thing you wrap risky code in\" without ever learning the precise " +
    "rules the JVM follows — which exceptions must be declared, what finally is actually guaranteed to do, and what " +
    "happens when things go wrong INSIDE your error handling itself. Those precise rules are exactly what interviewers " +
    "and production incidents both probe.",

  aha: {
    statement: 'An exception is not an error message — it is an object carrying the exact type and context of what went wrong, propagating up the call stack until something catches it.',
    analogy:
      "Think of exceptions like a fire alarm system with floor-specific alarms. When something goes wrong on floor 5, an " +
      "alarm object (carrying exactly what triggered it — smoke, heat, both) travels UP through each floor until someone " +
      "responsible for that specific alarm type intercepts it and handles it. If nobody on any floor handles it, it " +
      "reaches the roof (the JVM) and the whole building shuts down (the program crashes with a stack trace)."
  },

  underTheHood: [
    'Throwable is the root of everything throwable, splitting into Error (serious JVM-level problems like OutOfMemoryError — not meant to be caught/recovered from) and Exception.',
    'Exception splits further into checked exceptions (must be declared with `throws` or caught — the compiler enforces this, e.g. IOException) and RuntimeException / unchecked exceptions (not enforced by the compiler, e.g. NullPointerException, IllegalArgumentException).',
    'When an exception is thrown, the JVM immediately stops normal execution and unwinds the call stack, frame by frame, looking for the nearest enclosing try block with a matching catch clause.',
    'A `finally` block ALWAYS runs before control leaves the try/catch — even if the try or catch block returns, even if a new exception is thrown inside the catch. The only real exceptions are System.exit() or the JVM crashing.',
    'If both the try (or catch) block AND the finally block return a value, the finally block\'s return silently WINS and discards the other one — this is legal, deliberate Java behavior and a classic gotcha.',
    'try-with-resources (any object implementing AutoCloseable) guarantees close() is called automatically, in reverse declaration order, even if an exception is thrown — equivalent to a very carefully hand-written finally block, minus the manual bookkeeping.'
  ],

  inTheWild: [
    'A `catch (Exception e) {}` block that silently swallows every error — the single most common Java anti-pattern, and the reason a system quietly does nothing instead of crashing loudly when it should.',
    'A `finally` block that closes a database connection but ALSO has a `return` statement, silently discarding the actual result or exception from the try block above it — a genuinely infamous gotcha.',
    'Interview question: "What is the difference between a checked and unchecked exception, and why does that distinction exist?" — checked exceptions force the caller to consciously decide how to handle recoverable, expected failure modes (like a missing file); unchecked exceptions represent programmer errors that usually shouldn\'t be caught at every call-site.'
  ],

  showMe: {
    caption: 'Manual resource cleanup that can leak on exception, vs try-with-resources that cannot.',
    bad: {
      language: 'java',
      code:
        'FileInputStream in = new FileInputStream(file);\n' +
        'try {\n' +
        '    process(in); // if this throws, close() below is SKIPPED\n' +
        '} finally {\n' +
        '    in.close(); // only reached if the code above did NOT throw before this line\n' +
        '}\n' +
        '// Actually this specific finally-form is correct — the real bug is\n' +
        '// forgetting the finally entirely, or opening a SECOND resource that leaks\n' +
        '// if opening it throws before its own try block starts.',
      explanation:
        'This pattern is easy to get subtly wrong: if you open a second resource for the same operation, and opening the ' +
        'second one throws, the first resource never gets a chance to close, because its close() call has not been reached yet.'
    },
    good: {
      language: 'java',
      code:
        'try (FileInputStream in = new FileInputStream(file);\n' +
        '     BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {\n' +
        '    process(reader);\n' +
        '} // both resources are closed automatically, in reverse order, even if process() throws',
      explanation:
        'try-with-resources guarantees every declared resource is closed, in reverse declaration order, regardless of ' +
        'whether an exception is thrown — including correctly handling the case where opening the SECOND resource fails after the first one succeeded.'
    }
  },

  impact: {
    before: 'A resource leak (unclosed file handle/connection) that only appears after hours of sustained traffic exhausts the OS file descriptor limit.',
    after: 'Resources guaranteed closed on every code path, eliminating this entire class of leak.',
    metric: 'try-with-resources turns "remember to close this in every possible exit path" (a human memory problem) into "the compiler-enforced structure guarantees it" (not a problem at all).'
  },

  alternatives: [
    {
      name: 'Checked exceptions (throws / must catch)',
      whenToUse: 'Expected, recoverable failure conditions the caller genuinely needs to consciously decide how to handle (e.g. a file that might not exist).',
      whenNotToUse: 'Programmer errors (invalid arguments, null where not allowed) — forcing every caller to catch these adds noise without adding safety.'
    },
    {
      name: 'Unchecked/RuntimeException',
      whenToUse: 'Programmer errors and unexpected failures where forcing every caller up the chain to handle them would just add boilerplate.',
      whenNotToUse: 'Expected business failures a caller genuinely needs to branch on (though modern Spring-style codebases increasingly prefer unchecked business exceptions handled centrally — see Exception Handling in the Enterprise Java topic).'
    },
    {
      name: 'try-with-resources',
      whenToUse: 'Any object implementing AutoCloseable (streams, connections, locks) — this should be the default over manual try/finally.',
      whenNotToUse: "Cleanup logic that isn't simply 'closing a resource' — a real finally block is still the right tool for arbitrary cleanup code."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Putting a `return` statement inside a `finally` block.',
      why:
        "It looks harmless — 'finally always runs, so returning here guarantees a result.' In reality, a return (or throw) " +
        "inside finally SILENTLY DISCARDS whatever the try or catch block was about to return or throw, including a real " +
        "exception that was already in flight — this can hide serious bugs by swallowing errors without a trace.",
      fix:
        'Never put a return, break, continue, or throw inside a finally block — use finally only for cleanup side effects (closing resources, releasing locks), never for control flow.'
    },
    {
      mistake: 'Catching `Exception` (or worse, `Throwable`) broadly and doing nothing or just logging, to "make the error go away."',
      why:
        'It makes a scary stack trace disappear from the logs immediately, which feels like progress — but it also ' +
        'silently swallows genuine, unrelated bugs that happen to throw the same broad exception type, hiding them until they cause a much worse failure downstream.',
      fix:
        'Catch the most specific exception type you can actually handle meaningfully, and let anything else propagate to a centralized handler that logs it properly.'
    }
  ],

  proveIt: {
    question:
      'A try block executes `return 1;`. Its finally block executes `return 2;`. What value does the method actually return, and why?',
    answer:
      "2 — a return inside finally always wins and discards the try block's return value entirely, without any warning at compile time."
  },

  oneLiner: 'Exceptions are objects that travel up the call stack looking for a handler — finally always runs, but a return inside it silently steals the outcome.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hibernate-n-1-problem',
      title: 'The N+1 Problem',
      note: "Unrelated on the surface, but the same theme applies: something that looks completely fine in code review (here, exception handling; there, a getter call) can hide a serious, invisible cost."
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading',
      note: 'Uncaught exceptions on a background thread behave very differently from the main thread — they do not crash the whole JVM by default, which is its own common source of silently "disappearing" errors.'
    }
  ]
};
