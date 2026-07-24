import { ConceptContent } from '../../models/content.model';

export const RECORDS: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'records',
  title: 'Records',

  hook:
    'A simple `Point` class with two fields used to need a constructor, two getters, `equals()`, `hashCode()`, and ' +
    '`toString()` - roughly 30 lines of boilerplate that IDEs generate for you but every developer still has to read. ' +
    'Modern Java does the exact same thing in one line. What happened to the other 29?',

  problem:
    "Plain data-carrier classes (a Point, a Money amount, an immutable Coordinates pair) needed enormous amounts of " +
    "boilerplate before records - and worse, every hand-written or IDE-generated equals()/hashCode() was a place a subtle " +
    "bug could hide (forgetting to update hashCode() after adding a field, for example).",

  aha: {
    statement: "A record is Java's built-in way of saying \"this class is just a transparent, immutable carrier for this exact data\" - and the compiler writes all the boilerplate for you, correctly, every time.",
    analogy:
      "A regular class is like a custom-built container you have to hand-craft (choose the material, cut the shape, add a " +
      "label) every single time you need one. A record is like a standard, factory-made storage box: you just say what " +
      "goes in it (name, size), and it automatically comes with a lid that fits, a label, and a barcode - all correct, " +
      "every time, with zero manual assembly."
  },

  underTheHood: [
    'Declaring `record Point(int x, int y) {}` automatically generates: a canonical constructor, private final fields for x and y, public accessor methods `x()` and `y()` (not getX()/getY() - a deliberate naming difference), and correct `equals()`, `hashCode()`, and `toString()` implementations.',
    'Records are implicitly `final` (cannot be extended) and all their fields are implicitly `final` (cannot be reassigned after construction) - records are immutable by design, not by convention you have to remember to follow.',
    "The generated equals()/hashCode() are based on ALL the record's components - two Point records with the same x and y are always equal, and always hash identically, with zero risk of the classic \"forgot to update hashCode after adding a field\" bug.",
    'You can add a "compact constructor" (`Point { if (x < 0) throw new IllegalArgumentException(...); }`) to validate or normalize arguments without repeating the full parameter list - the normal field assignment still happens automatically afterward.',
    'Records can still have additional methods, static fields, and implement interfaces - they are not limited to pure data; they just cannot have additional INSTANCE fields beyond the declared components, and cannot extend another class (though they can implement interfaces).',
    'Records are a perfect match for DTOs (Data Transfer Objects), value objects (Money, Coordinates), and the "data" part of pattern matching with sealed interfaces.'
  ],

  inTheWild: [
    'API response/request DTOs in a Spring Boot controller - a record is now the idiomatic, boilerplate-free way to represent "this exact shape of JSON," replacing a hand-written class with getters/equals/hashCode.',
    'Value objects like `Money(BigDecimal amount, Currency currency)` where equality should always be based on both fields together, and a hand-written equals() risks becoming stale as fields are added over time.',
    'Interview question: "What is the difference between a record and a regular immutable class?" - the compiler-generated equals/hashCode/toString/constructor and the different accessor naming (x() not getX()) are the concrete, testable differences.'
  ],

  showMe: {
    caption: 'A hand-written immutable value class vs the same thing as a record.',
    bad: {
      language: 'java',
      code:
        'final class Point {\n' +
        '    private final int x;\n' +
        '    private final int y;\n' +
        '    Point(int x, int y) { this.x = x; this.y = y; }\n' +
        '    int getX() { return x; }\n' +
        '    int getY() { return y; }\n' +
        '    @Override public boolean equals(Object o) {\n' +
        '        if (!(o instanceof Point p)) return false;\n' +
        '        return x == p.x && y == p.y;\n' +
        '    }\n' +
        '    @Override public int hashCode() { return Objects.hash(x, y); }\n' +
        '    @Override public String toString() { return "Point[x=" + x + ", y=" + y + "]"; }\n' +
        '}',
      explanation:
        "Correct, but every one of these lines is boilerplate a human wrote (or an IDE generated and a human still has to " +
        "read) - and every future field added here means remembering to update equals(), hashCode(), AND toString() together."
    },
    good: {
      language: 'java',
      code:
        'record Point(int x, int y) {}\n' +
        '// equals(), hashCode(), toString(), the constructor, and x()/y() accessors\n' +
        '// are ALL generated automatically, correctly, and stay correct if a field is added.',
      explanation:
        'One line replaces roughly 20-30 lines of hand-written, error-prone boilerplate, and the generated ' +
        'equals()/hashCode() automatically stay consistent with each other and with every declared field, forever.'
    }
  },

  impact: {
    before: '~25 lines of hand-written, easy-to-desynchronize boilerplate per simple value class.',
    after: 'One line, with the compiler guaranteeing equals()/hashCode()/toString() are always correct and in sync.',
    metric: 'For a codebase with dozens of DTOs/value objects, this routinely eliminates hundreds of lines of boilerplate and an entire category of "forgot to update hashCode" bugs.'
  },

  alternatives: [
    {
      name: 'record',
      whenToUse: 'Immutable data carriers where the class\'s entire identity is its data (DTOs, value objects, pattern-matching data shapes).',
      whenNotToUse: 'You need mutable state, need to extend another class, or the "class" genuinely represents behavior/identity rather than just data.'
    },
    {
      name: 'Regular class with Lombok (@Data, @Value)',
      whenToUse: "Teams already using Lombok broadly, or needing mutable getters/setters that records deliberately don't support.",
      whenNotToUse: "New projects with no existing Lombok dependency - records give similar boilerplate reduction with zero extra dependencies, using a real language feature instead of annotation processing."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Trying to add a mutable setter to a record, or trying to make a record extend another class.',
      why:
        "It feels like a natural next step if you're used to regular classes - but records are deliberately, permanently " +
        'immutable and implicitly final specifically to guarantee the compiler-generated equals/hashCode remain correct ' +
        'forever; allowing mutation or subclassing would undermine that exact guarantee.',
      fix:
        "If you need mutability, use a regular class, not a record - records are the right tool specifically when immutability is what you want, not a limitation to work around."
    }
  ],

  proveIt: {
    question:
      'Two `record Point(int x, int y)` instances are created separately with the same x and y values. Does `point1.equals(point2)` return true, and does it need any code you wrote yourself?',
    answer:
      'Yes, it returns true, and no - the compiler automatically generates an equals() that compares all components ' +
      '(here, x and y) for you; you never write or maintain that logic yourself for a record.'
  },

  oneLiner: 'A record is Java telling the compiler "generate the correct boilerplate for me" instead of trusting a human to keep it correct by hand.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'functional-programming',
      title: 'Functional Programming',
      note: 'Records are Java\'s concrete, built-in tool for creating the immutable value objects that functional-style code depends on.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'sealed-classes',
      title: 'Sealed Classes',
      note: 'Records combined with sealed interfaces are the foundation of modern Java pattern matching - a sealed interface defines the closed set of shapes, and records define what data each shape carries.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'pattern-matching-instanceof-switch-expressions',
      title: 'Pattern Matching',
      note: 'Pattern matching can destructure a record directly in a switch/instanceof - a feature specifically designed around records\' transparent, fixed data shape.'
    }
  ]
};
