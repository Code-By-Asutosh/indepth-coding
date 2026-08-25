import { ConceptContent } from '../../models/content.model';

export const RECORDS: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "records",
  title: "Records",
  topicType: "concept",
  simpleIntuition: "A simple `Point` class with two fields used to need a constructor, two getters, `equals()`, `hashCode()`, and `toString()` - roughly 30 lines of boilerplate that IDEs generate for you but every developer still has to read. Modern Java does the exact same thing in one line. What happened to the other 29?",
  formalMeaning: "A record is Java's built-in way of saying \"this class is just a transparent, immutable carrier for this exact data\" - and the compiler writes all the boilerplate for you, correctly, every time.",
  whyItExists: "Plain data-carrier classes (a Point, a Money amount, an immutable Coordinates pair) needed enormous amounts of boilerplate before records - and worse, every hand-written or IDE-generated equals()/hashCode() was a place a subtle bug could hide (forgetting to update hashCode() after adding a field, for example).",
  howItWorksInternally: [
    "Declaring `record Point(int x, int y) {}` automatically generates: a canonical constructor, private final fields for x and y, public accessor methods `x()` and `y()` (not getX()/getY() - a deliberate naming difference), and correct `equals()`, `hashCode()`, and `toString()` implementations.",
    "Records are implicitly `final` (cannot be extended) and all their fields are implicitly `final` (cannot be reassigned after construction) - records are immutable by design, not by convention you have to remember to follow.",
    "The generated equals()/hashCode() are based on ALL the record's components - two Point records with the same x and y are always equal, and always hash identically, with zero risk of the classic \"forgot to update hashCode after adding a field\" bug.",
    "You can add a \"compact constructor\" (`Point { if (x < 0) throw new IllegalArgumentException(...); }`) to validate or normalize arguments without repeating the full parameter list - the normal field assignment still happens automatically afterward.",
    "Records can still have additional methods, static fields, and implement interfaces - they are not limited to pure data; they just cannot have additional INSTANCE fields beyond the declared components, and cannot extend another class (though they can implement interfaces).",
    "Records are a perfect match for DTOs (Data Transfer Objects), value objects (Money, Coordinates), and the \"data\" part of pattern matching with sealed interfaces."
  ],
  mainComponents: [
    "A regular class is like a custom-built container you have to hand-craft (choose the material, cut the shape, add a label) every single time you need one. A record is like a standard, factory-made storage box: you just say what goes in it (name, size), and it automatically comes with a lid that fits, a label, and a barcode - all correct, every time, with zero manual assembly."
  ],
  realWorldExamples: [
    "API response/request DTOs in a Spring Boot controller - a record is now the idiomatic, boilerplate-free way to represent \"this exact shape of JSON,\" replacing a hand-written class with getters/equals/hashCode.",
    "Value objects like `Money(BigDecimal amount, Currency currency)` where equality should always be based on both fields together, and a hand-written equals() risks becoming stale as fields are added over time.",
    "Interview question: \"What is the difference between a record and a regular immutable class?\" - the compiler-generated equals/hashCode/toString/constructor and the different accessor naming (x() not getX()) are the concrete, testable differences."
  ],
  complexityAndTradeoffs: [
    "Before: ~25 lines of hand-written, easy-to-desynchronize boilerplate per simple value class.",
    "After: One line, with the compiler guaranteeing equals()/hashCode()/toString() are always correct and in sync.",
    "For a codebase with dozens of DTOs/value objects, this routinely eliminates hundreds of lines of boilerplate and an entire category of \"forgot to update hashCode\" bugs.",
    "record: use it when immutable data carriers where the class's entire identity is its data (DTOs, value objects, pattern-matching data shapes). Avoid it when you need mutable state, need to extend another class, or the \"class\" genuinely represents behavior/identity rather than just data.",
    "Regular class with Lombok (@Data, @Value): use it when teams already using Lombok broadly, or needing mutable getters/setters that records deliberately don't support. Avoid it when new projects with no existing Lombok dependency - records give similar boilerplate reduction with zero extra dependencies, using a real language feature instead of annotation processing."
  ],
  commonMistakes: [
    "Trying to add a mutable setter to a record, or trying to make a record extend another class. It feels like a natural next step if you're used to regular classes - but records are deliberately, permanently immutable and implicitly final specifically to guarantee the compiler-generated equals/hashCode remain correct forever; allowing mutation or subclassing would undermine that exact guarantee. Fix: If you need mutability, use a regular class, not a record - records are the right tool specifically when immutability is what you want, not a limitation to work around."
  ],
  interviewPerspective: "A common way this gets tested: \"Two `record Point(int x, int y)` instances are created separately with the same x and y values. Does `point1.equals(point2)` return true, and does it need any code you wrote yourself?\" Yes, it returns true, and no - the compiler automatically generates an equals() that compares all components (here, x and y) for you; you never write or maintain that logic yourself for a record.",
  triggerSentence: "A record is Java telling the compiler \"generate the correct boilerplate for me\" instead of trusting a human to keep it correct by hand."
};
