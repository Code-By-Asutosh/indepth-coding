import { ConceptContent } from '../../models/content.model';

export const OOP: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'oop',
  title: 'OOP',

  hook:
    'You can recite "encapsulation, inheritance, polymorphism, abstraction" in an interview without hesitation — and still ' +
    'write a class with 40 public fields and a 300-line method. Knowing the four words is not the same as knowing why they exist.',

  problem:
    'Object-Oriented Programming is usually taught as four vocabulary words to memorize, not four problems to actually ' +
    'feel. Without feeling the pain each one solves, you end up "using" OOP syntactically (classes, public fields, extends) ' +
    "while still writing code that has all the maintenance problems OOP was invented to prevent.",

  aha: {
    statement: 'Each OOP pillar exists to solve one specific, real maintenance pain — they are not abstract virtues, they are bug-prevention tools.',
    analogy:
      "Think of a car. You don't need to understand the engine to drive it (encapsulation — the dashboard hides the mess). " +
      "A hybrid and a gas car both respond to the same pedals (polymorphism — same interface, different internals). Every " +
      "car model builds on a shared chassis platform instead of starting from scratch (inheritance — reuse a base, specialize " +
      "the rest). And you think in terms of \"car\" and \"steering wheel,\" not silicon and torque curves (abstraction — hide " +
      "irrelevant detail behind a simpler mental model)."
  },

  underTheHood: [
    'Encapsulation: bundling data with the methods that operate on it, and hiding the data behind a controlled interface (private fields + public methods) so the object can enforce its own invariants — a BankAccount can guarantee balance never goes negative only if nothing outside can set balance directly.',
    'Inheritance: a subclass reuses a superclass\'s fields/methods and can override behavior. The compiler enforces "is-a" at compile time — a Dog IS-A Animal everywhere an Animal is expected (this is the Liskov Substitution Principle, formalized).',
    'Polymorphism (the mechanism, not just the word): at runtime, the JVM looks up the ACTUAL object\'s class to decide which overridden method to call (dynamic dispatch) — the same line of calling code behaves differently depending on what object is actually behind the reference.',
    'Abstraction: exposing only what a caller needs (an interface/abstract class) and hiding implementation detail — callers depend on "PaymentGateway" the concept, not "StripeGatewayImpl" the concrete class, so the implementation can change without touching every caller.',
    "Composition (technically not one of the four, but the tool that fixes inheritance's biggest failure mode): building behavior by HOLDING a reference to another object instead of extending it, avoiding rigid, fragile class hierarchies."
  ],

  inTheWild: [
    'A payment system where `PaymentGateway` is an interface, and Stripe/PayPal/internal-wallet are three interchangeable implementations — the checkout code never changes when you add a fourth provider.',
    'A `Shape` hierarchy in a graphics engine where `Circle`, `Square`, and `Triangle` all implement `area()` differently, but the rendering loop just calls `shape.area()` without an if/else per type.',
    'Interview question: "What is the difference between overloading and overriding, and which one is polymorphism?" — overriding is runtime polymorphism; overloading is resolved at compile time and is a different mechanism entirely.'
  ],

  showMe: {
    caption: "Type-checking if/else chains (procedural code wearing an OOP costume) vs actual polymorphism.",
    bad: {
      language: 'java',
      code:
        'double calculateArea(Object shape) {\n' +
        '    if (shape instanceof Circle c) {\n' +
        '        return Math.PI * c.radius() * c.radius();\n' +
        '    } else if (shape instanceof Square s) {\n' +
        '        return s.side() * s.side();\n' +
        '    }\n' +
        '    throw new IllegalArgumentException("Unknown shape");\n' +
        '}',
      explanation:
        'Every time a new shape type is added, this method must be found and edited — the logic for "what is a shape\'s ' +
        'area" is scattered across call-sites instead of living with each shape, and the compiler cannot help you catch a missed case.'
    },
    good: {
      language: 'java',
      code:
        'interface Shape {\n' +
        '    double area();\n' +
        '}\n\n' +
        'record Circle(double radius) implements Shape {\n' +
        '    public double area() { return Math.PI * radius * radius; }\n' +
        '}\n\n' +
        'record Square(double side) implements Shape {\n' +
        '    public double area() { return side * side; }\n' +
        '}\n\n' +
        '// Caller never branches on type — dynamic dispatch does the work\n' +
        'double totalArea = shapes.stream().mapToDouble(Shape::area).sum();',
      explanation:
        'Adding a new shape means writing one new class that implements area() — no existing code changes, and the ' +
        'compiler forces every Shape to provide the method, so a missing implementation is caught at compile time, not runtime.'
    }
  },

  impact: {
    before: 'Adding a new type requires hunting down and editing every if/else chain that switches on type across the codebase.',
    after: 'Adding a new type means writing one new class — every existing call-site works unchanged.',
    metric: 'In large codebases, this difference is the entire reason a new feature takes an hour versus a week of "find every place that needs updating."'
  },

  alternatives: [
    {
      name: 'Inheritance (extends)',
      whenToUse: 'A true, stable "is-a" relationship where the subclass really is a more specific version of the parent, and that relationship will not need to change at runtime.',
      whenNotToUse: 'You just want to reuse some code — use composition instead, or you will end up with deep, fragile hierarchies (the classic "Square extends Rectangle" trap).'
    },
    {
      name: 'Composition (has-a, delegate to a held object)',
      whenToUse: 'You want to reuse behavior without committing to a rigid hierarchy, or you need to swap behavior at runtime.',
      whenNotToUse: "You genuinely need polymorphic substitution (callers treating many types uniformly through a common supertype) — that still needs an interface/abstract class."
    },
    {
      name: 'Interfaces (pure abstraction, no shared state)',
      whenToUse: 'Defining a contract multiple unrelated classes can implement, especially across module/package boundaries.',
      whenNotToUse: 'You need to share actual field state or a common implementation across the family — an abstract class fits better there.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Using inheritance purely to reuse code, resulting in deep hierarchies like "Manager extends Employee extends Person" that eventually need a "Contractor" that is 90% Employee but not really an Employee.',
      why:
        "Inheritance looks like the obvious tool for reuse early on, when the hierarchy is shallow and clean. The problem " +
        "only appears months later when a new requirement doesn't fit the existing 'is-a' shape, and by then dozens of places depend on the exact hierarchy.",
      fix:
        'Default to composition for code reuse ("has-a PaymentCalculator" instead of "extends BasePaymentEmployee"), and reserve inheritance for genuinely stable, narrow is-a relationships.'
    }
  ],

  proveIt: {
    question:
      'A method takes a parameter of type `Animal` and calls `animal.makeSound()`. At runtime, it is actually passed a ' +
      '`Dog` object. Which makeSound() implementation runs, and what mechanism decides that?',
    answer:
      "Dog's makeSound() runs, decided by dynamic dispatch — the JVM looks at the object's ACTUAL runtime class (Dog), not " +
      "the reference's declared compile-time type (Animal), to choose which overridden method to invoke."
  },

  oneLiner: 'The four pillars are not vocabulary to memorize — they are four specific answers to "how do I stop this codebase from becoming unmaintainable."',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'solid',
      title: 'SOLID',
      note: 'SOLID is essentially "OOP done well" — five concrete rules for how to actually structure the classes OOP gives you the tools to build.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'generics',
      title: 'Generics',
      note: 'Generics extend polymorphism to types themselves — a List<T> is polymorphic over what T is, using the same substitution idea at the type level.'
    }
  ]
};
