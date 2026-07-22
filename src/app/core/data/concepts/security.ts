import { ConceptContent } from '../../models/content.model';

export const SECURITY: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'security',
  title: 'Security',

  hook:
    'A library reads a file path directly from user input and opens it with `new File(userInput)`. A user submits ' +
    '`../../etc/passwd` instead of a filename. Nothing in that one line of code looks dangerous — so what actually goes wrong?',

  problem:
    "Java the LANGUAGE gives you no automatic protection against a huge class of real vulnerabilities — path traversal, " +
    "insecure deserialization, weak randomness, injection — because these are logic errors, not memory-safety errors. " +
    "Java protects you from buffer overflows and use-after-free; it does nothing to stop you from trusting attacker-controlled input by mistake.",

  aha: {
    statement: "Java's memory safety (no manual pointers, no buffer overflows) protects you from an entire CLASS of C/C++-style vulnerabilities — but it provides zero protection against trusting untrusted input, which is where most real Java application vulnerabilities actually live.",
    analogy:
      "Java memory safety is like a car with an excellent, unbreakable frame that simply cannot crumple in a low-speed " +
      "collision — genuinely valuable, but it does nothing to stop the driver from driving straight into a wall at full " +
      "speed because they trusted a broken GPS. The frame protects against one class of danger; it has no opinion about where you choose to drive."
  },

  underTheHood: [
    'Path traversal: constructing a file path directly from user input (e.g. `new File(baseDir, userInput)`) lets an attacker supply `../../../etc/passwd`-style input to escape the intended directory entirely — the fix is always validating/normalizing the resolved path stays within the intended base directory.',
    'Insecure deserialization: deserializing untrusted bytes (via Java\'s built-in Serializable mechanism) can trigger arbitrary code execution through carefully crafted "gadget chains" that exploit classes already present on the classpath — this is a genuinely serious, well-documented, real-world vulnerability class (see Serialization).',
    'Weak randomness: `java.util.Random` is a fast, statistically decent PSEUDO-random generator, but it is NOT cryptographically secure — its output is predictable if an attacker can observe enough of it, making it unsafe for tokens, session IDs, or password reset codes. `SecureRandom` exists specifically for security-sensitive randomness.',
    'Injection (SQL, command, LDAP): building a query/command string by directly concatenating untrusted input lets an attacker inject their own logic into what your code executes — parameterized queries (PreparedStatement) and proper escaping are the standard, correct defense.',
    'Sensitive data exposure: logging or including sensitive values (passwords, tokens, full card numbers) in exception messages, logs, or error responses is a routine, avoidable source of real incidents — treat anything reaching a log line or API response as potentially visible to more people than intended.',
    "The historical SecurityManager/sandboxing model (used for untrusted applets/code long ago) has been formally deprecated for removal in modern JDKs — it is largely irrelevant for typical modern server-side application security, which instead relies on OS-level isolation, careful input validation, and dependency hygiene."
  ],

  inTheWild: [
    'A file-download endpoint accepting a filename parameter directly, letting an attacker request `../../../../etc/passwd` or similar to read files well outside the intended directory — a very common real vulnerability class in file-serving code.',
    'A "remember me" or password-reset token generated with `new Random(System.currentTimeMillis())` instead of `SecureRandom` — predictable enough for an attacker to guess or brute-force in a realistic timeframe.',
    'Interview question: "Does using Java instead of C++ automatically make your application secure?" — no; Java eliminates memory-corruption bugs (buffer overflows, use-after-free) but does nothing about logic-level vulnerabilities like injection, path traversal, or insecure deserialization.'
  ],

  showMe: {
    caption: 'A file path built directly from user input (path traversal risk) vs one that validates the resolved path.',
    bad: {
      language: 'java',
      code:
        'File file = new File("/app/uploads/" + userSuppliedFilename);\n' +
        'byte[] content = Files.readAllBytes(file.toPath());\n' +
        '// userSuppliedFilename = "../../../../etc/passwd" escapes the uploads\n' +
        '// directory entirely, reading a completely unintended system file.',
      explanation:
        'Directly concatenating user input into a file path lets an attacker use ".." segments to walk out of the ' +
        'intended directory entirely — nothing here validates that the resolved path is actually still inside /app/uploads/.'
    },
    good: {
      language: 'java',
      code:
        'Path baseDir = Paths.get("/app/uploads").toRealPath();\n' +
        'Path resolved = baseDir.resolve(userSuppliedFilename).normalize();\n\n' +
        'if (!resolved.startsWith(baseDir)) {\n' +
        '    throw new SecurityException("Invalid file path");\n' +
        '}\n' +
        'byte[] content = Files.readAllBytes(resolved);',
      explanation:
        'Resolving and NORMALIZING the path, then explicitly verifying it is still contained within the intended base ' +
        'directory, blocks any ".." traversal attempt before the file is ever read.'
    }
  },

  impact: {
    before: 'An attacker can read arbitrary files on the server by manipulating a filename parameter.',
    after: 'Any attempt to escape the intended directory is explicitly detected and rejected before file access occurs.',
    metric: 'Path traversal and injection vulnerabilities consistently rank among the most common real-world web application vulnerabilities (see OWASP Top 10) — this single validation pattern closes an entire well-known vulnerability class.'
  },

  alternatives: [
    {
      name: 'Path resolution + explicit containment check',
      whenToUse: 'Any code that builds a file path from user-controllable input.',
      whenNotToUse: 'The path is entirely derived from trusted, application-internal values with no user input involved at all.'
    },
    {
      name: 'SecureRandom',
      whenToUse: 'Any security-sensitive random value — tokens, session IDs, password reset codes, cryptographic keys/nonces.',
      whenNotToUse: 'Non-security randomness (shuffling a game board, sampling test data) where predictability has no security consequence — plain Random is fine and faster there.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Using `java.util.Random` (or worse, a fixed seed) to generate a security-sensitive value like a password reset token.',
      why:
        "java.util.Random is a fast, statistically well-distributed but fully DETERMINISTIC and PREDICTABLE generator " +
        "given enough observed output or knowledge of its seed — it was never designed to resist an attacker actively " +
        "trying to predict future values, which is exactly the threat model security tokens need to survive.",
      fix:
        'Use `java.security.SecureRandom` for any value where predictability would have a security consequence — it is specifically designed to resist that exact threat model.'
    }
  ],

  proveIt: {
    question:
      'A web application reads a filename from a query parameter and opens `new File(baseDir + filename)` directly. What ' +
      'specific attack does this enable, and what is the concrete defense?',
    answer:
      'Path traversal — supplying `../../../../etc/passwd` (or similar) as the filename lets an attacker escape the ' +
      'intended base directory and read arbitrary files. The defense is resolving and normalizing the full path, then explicitly verifying it still starts with the intended base directory before use.'
  },

  oneLiner: "Java's memory safety protects you from one class of bug entirely — it has no opinion at all about whether you trusted the wrong input.",

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'serialization',
      title: 'Serialization',
      note: 'Insecure deserialization is one of the most serious, well-documented real-world Java security vulnerabilities, and Serialization covers the exact mechanism that makes it possible.'
    },
    {
      categoryId: 'system-design',
      topicId: 'security-engineering',
      conceptId: 'owasp-top-10',
      title: 'OWASP Top 10',
      note: 'The vulnerability classes introduced here (injection, path traversal, insecure deserialization) map directly onto entries in the OWASP Top 10, covered in much greater depth in the Security Engineering topic.'
    }
  ]
};
