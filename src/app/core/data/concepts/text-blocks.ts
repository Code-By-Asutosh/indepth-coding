import { ConceptContent } from '../../models/content.model';

export const TEXT_BLOCKS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'text-blocks',
  title: 'Text Blocks',

  hook:
    'You paste a multi-line SQL query or JSON payload into a Java string constant, and it turns into an unreadable wall ' +
    'of `"..." + "\\n" +` on every single line. The actual content — the thing you care about — is buried under escaping ceremony.',

  problem:
    'Before text blocks, embedding any genuinely multi-line text (SQL, JSON, HTML) in Java source meant either ' +
    'concatenating many quoted lines with explicit `\\n` characters, or escaping every embedded quote — both approaches ' +
    'obscure the actual content behind a wall of Java-specific escaping noise.',

  aha: {
    statement: 'A text block lets you write multi-line text that looks in your source code exactly like it looks in the real world — no escaping, no line-by-line concatenation.',
    analogy:
      "Writing a multi-line string the old way is like trying to write a formatted letter where every single line has to " +
      "end with an explicit \"(continued on next line)\" stamp, and every quotation mark inside has to be crossed out and " +
      "rewritten specially. A text block is just... writing the letter normally, on the page, the way you'd actually write it."
  },

  underTheHood: [
    'A text block starts and ends with three double-quotes (`\"\"\"`), and the opening `\"\"\"` must be followed immediately by a newline — content begins on the line after.',
    'Text blocks handle embedded double quotes without any escaping at all — you can write JSON or HTML full of `"` characters directly, verbatim.',
    'Incidental whitespace (leading indentation matching the CLOSING `\"\"\"` delimiter\'s position) is automatically stripped by the compiler — this lets you indent the text block naturally to match your code\'s indentation without that indentation becoming part of the actual string content.',
    'Line terminators inside a text block are normalized to `\\n` regardless of the source file\'s actual line-ending style (which can differ between Windows and Unix checkouts of the same file) — this avoids a subtle cross-platform inconsistency that plain concatenated strings did not protect against.',
    'You can still use standard escape sequences (`\\n`, `\\"`, `\\\\`) inside a text block when you genuinely need them, and a trailing `\\` at the end of a line suppresses that line\'s newline, letting you wrap long lines in the source without adding a line break to the actual string value.'
  ],

  inTheWild: [
    'Embedding a multi-line SQL query directly in code for readability during development/debugging, without the noise of string concatenation obscuring the actual query.',
    'Writing example JSON payloads in tests or OpenAPI documentation annotations, where the JSON\'s own quotation marks previously needed constant escaping.',
    'Interview question: "How does a text block decide how much leading whitespace to strip?" — it is based on the indentation of the LEAST-indented line, including the closing delimiter\'s own position, which is why the closing `\"\"\"` placement actually matters for the resulting string content.'
  ],

  showMe: {
    caption: 'A multi-line SQL query the old way vs as a text block.',
    bad: {
      language: 'java',
      code:
        'String query = "SELECT id, name, email\\n" +\n' +
        '               "FROM users\\n" +\n' +
        '               "WHERE status = \'ACTIVE\'\\n" +\n' +
        '               "ORDER BY name";',
      explanation:
        'Every line needs its own quotes, its own explicit \\n, and its own trailing + — the actual SQL is buried under ' +
        'Java string-concatenation ceremony that has nothing to do with the query itself.'
    },
    good: {
      language: 'java',
      code:
        'String query = """\n' +
        '    SELECT id, name, email\n' +
        '    FROM users\n' +
        '    WHERE status = \'ACTIVE\'\n' +
        '    ORDER BY name\n' +
        '    """;',
      explanation:
        'The SQL reads exactly as it would in a .sql file — no per-line quoting, no manual newline characters, and the ' +
        'indentation is automatically normalized by the compiler based on the closing delimiter\'s position.'
    }
  },

  impact: {
    before: 'Multi-line content buried under per-line quoting and concatenation, hard to read and easy to introduce a typo in.',
    after: 'The content reads exactly as it would in its native format, with the compiler handling normalization automatically.',
    metric: 'This is purely a readability/maintainability win — text blocks compile down to the same String type with no runtime performance difference from the old concatenation style.'
  },

  alternatives: [
    {
      name: 'Text blocks ("""..."""))',
      whenToUse: 'Any genuinely multi-line string literal embedded directly in source (SQL, JSON, HTML snippets).',
      whenNotToUse: 'Simple single-line strings — a normal double-quoted string is still the right, simpler choice.'
    },
    {
      name: 'External resource files (.sql, .json templates loaded at runtime)',
      whenToUse: 'Larger, genuinely reusable, or frequently-edited content that benefits from proper syntax highlighting/tooling for its native format, or needs to be changed without recompiling.',
      whenNotToUse: 'Small, code-adjacent snippets where keeping the content directly next to the code that uses it aids readability.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Placing the closing `"""` at an unexpected indentation level, not realizing it determines how much leading whitespace gets stripped from every line.',
      why:
        "The compiler strips leading whitespace based on the LEAST-indented line (which includes the closing delimiter's " +
        "own position) — if the closing delimiter is placed further left or right than intended, every line's actual content silently gains or loses leading spaces compared to what the author expected.",
      fix:
        'Deliberately align the closing `"""` with the indentation level you want stripped, and verify the resulting ' +
        'string content (e.g. in a quick test) rather than assuming the visual source layout matches the runtime value exactly.'
    }
  ],

  proveIt: {
    question:
      'A text block\'s closing `"""` is indented 4 spaces less than the content lines above it. What effect does that have on the resulting string\'s content?',
    answer:
      "The content lines will retain 4 extra leading spaces each, because the compiler only strips whitespace up to the " +
      "indentation level of the LEAST-indented line, which in this case is the closing delimiter itself — moving it further left preserves more leading whitespace in the actual string value."
  },

  oneLiner: 'Text blocks let multi-line text in your source code look like the actual text — no escaping, no concatenation ceremony.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'records',
      title: 'Records',
      note: 'Text blocks and records were both introduced in the same era of Java as small, deliberate quality-of-life features aimed at reducing boilerplate and visual noise.'
    }
  ]
};
