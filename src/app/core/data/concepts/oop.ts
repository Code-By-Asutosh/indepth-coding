import { ConceptContent } from '../../models/content.model';

export const OOP: ConceptContent = {
  categoryId: 'java-core',
  topicId: 'java-core',
  conceptId: 'oop',
  title: 'OOP',
  topicType: 'concept',

  prerequisites: [],

  simpleIntuition:
    'Imagine describing a car to someone who has never seen one. You would not start by explaining the wiring diagram, ' +
    'you would say "it has a steering wheel that turns the front tires, pedals that speed it up or stop it, and a ' +
    'dashboard that shows you what matters." Object-Oriented Programming is that same idea applied to code: instead of ' +
    'a pile of loose functions and data floating around independently, you group related data and the actions that ' +
    'make sense on that data into one self-contained "thing", an object, that exposes a simple interface and hides the ' +
    'messy details behind it.',

  formalMeaning:
    'Object-Oriented Programming is a programming paradigm organized around objects, bundles of state (fields) and ' +
    'behavior (methods), built from four foundational ideas: encapsulation (hiding internal state behind a controlled ' +
    'interface), inheritance (a class reusing and specializing another class), polymorphism (the same call behaving ' +
    'differently depending on the actual runtime type), and abstraction (exposing only what a caller needs, hiding ' +
    'the rest). A fifth idea, composition, is not one of the four pillars but is the tool most real designs actually ' +
    'lean on to avoid inheritance\'s pitfalls.',

  whyItExists:
    'Before OOP became dominant, large programs were often organized as functions operating on loosely related data ' +
    'structures passed around everywhere. As programs grew, it became difficult to know which function was allowed to ' +
    'touch which data, so any function anywhere could accidentally leave shared data in an invalid state, and adding a ' +
    'new variant of something (a new payment type, a new shape) meant hunting down and editing every place that ' +
    'switched behavior based on type. OOP exists specifically to solve those two problems: it gives data an owner that ' +
    'can guard its own validity, and it gives you a way to add new behavior by writing new code instead of editing old code.',

  howItWorksInternally: [
    'Encapsulation: a class bundles fields with the methods that operate on them, and marks fields private so nothing outside the class can set them directly. The class\'s own methods become the only gatekeeper, letting it enforce invariants like "balance can never go negative" simply by refusing to write an invalid value.',
    'Inheritance: a subclass automatically gets a superclass\'s fields and methods, and can override specific methods to specialize behavior. The compiler enforces the "is-a" relationship at compile time, a Dog reference can be used anywhere an Animal is expected, because the compiler has verified Dog really does provide everything Animal promises.',
    'Polymorphism, specifically dynamic dispatch: when you call a method on a reference typed as a supertype, the JVM does not decide which method body to run based on the reference\'s declared compile-time type. It looks up the ACTUAL object\'s runtime class in a per-class virtual method table (vtable) built at class-loading time, and calls whichever override that specific object\'s class provides. This is why `Animal a = new Dog(); a.makeSound();` runs Dog\'s makeSound, not Animal\'s.',
    'Abstraction: an interface or abstract class defines WHAT a caller can do without saying HOW it is done. Callers write code against `PaymentGateway`, never against `StripeGatewayImpl` directly, so the concrete implementation behind that interface can be swapped or added to without ever touching the calling code.',
    'Composition: instead of a class extending another to reuse its code, it simply holds a reference to an instance of it as a field, and delegates to it. This avoids permanently locking two classes into a rigid, compile-time "is-a" relationship, letting behavior be swapped or combined far more flexibly at runtime.'
  ],

  codeExamples: [
    {
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
        '// Caller never branches on type - dynamic dispatch does the work.\n' +
        'double total = shapes.stream().mapToDouble(Shape::area).sum();',
      explanation:
        'Adding a new shape means writing one new class that implements area(). No existing call-site changes, and the ' +
        'compiler forces every Shape to provide the method, so a missing implementation is caught at compile time, not runtime.'
    }
  ],

  mainComponents: [
    'Encapsulation - private fields, public methods, self-enforced invariants.',
    'Inheritance - a subclass reuses and specializes a superclass, enforced as "is-a" by the compiler.',
    'Polymorphism - the same call, different behavior, resolved by the object\'s actual runtime class via dynamic dispatch.',
    'Abstraction - callers depend on an interface/contract, never on a concrete implementation.',
    'Composition (the practical fifth pillar) - reuse behavior by holding a reference to another object instead of extending it.'
  ],

  realWorldExamples: [
    'A payment system defining a `PaymentGateway` interface, with Stripe, PayPal, and an internal wallet as three interchangeable implementations, so the checkout code never has to change when a fourth provider is added.',
    'A `Shape` hierarchy in a graphics engine where `Circle`, `Square`, and `Triangle` each implement `area()` differently, but the rendering loop simply calls `shape.area()` on every shape, with no per-type if/else branch anywhere.',
    'A logging framework exposing a single `Logger` interface, while the actual implementation writing to console, a file, or a remote server is swapped purely through configuration, with zero changes to any code that calls `log.info(...)`.'
  ],

  complexityAndTradeoffs: [
    'Encapsulation costs a small amount of ceremony (getters/setters, constructors) in exchange for guaranteed object validity, worth it almost everywhere except pure data-transfer objects.',
    'Inheritance: use it only for a genuinely stable "is-a" relationship that will not need to change shape later; a Dog will always be an Animal. Avoid it purely for code reuse, since deep hierarchies (`Manager extends Employee extends Person`) become rigid and break the moment a new requirement, like a Contractor that is 90% Employee but not really one, does not cleanly fit the existing shape.',
    'Composition: use it when you want to reuse behavior without locking into a rigid hierarchy, or need to swap behavior at runtime (a `PaymentCalculator` field instead of `extends BasePaymentEmployee`). It costs a small amount of extra delegation boilerplate in exchange for far more flexibility.',
    'Interfaces: use them to define a contract multiple unrelated classes can implement across module boundaries. They cannot share actual field state or a default implementation the way an abstract class can, so reach for an abstract class when real shared implementation, not just a shared contract, is needed.',
    'Dynamic dispatch itself has a tiny, usually irrelevant runtime cost (a vtable lookup instead of a direct call), which is overwhelmingly worth paying for the maintainability it buys, and modern JIT compilers frequently eliminate it entirely through inlining when the actual type is predictable at a call site.'
  ],

  commonMistakes: [
    'Using inheritance purely to reuse code rather than to model a genuine "is-a" relationship. It looks perfectly reasonable early on, when the hierarchy is shallow, `Manager extends Employee` feels natural. The problem only shows up months later when a new requirement, like a Contractor that shares 90% of Employee\'s code but is not really an Employee, does not fit the existing shape, and by then dozens of call sites already depend on that exact hierarchy. Fix: default to composition for code reuse ("has-a PaymentCalculator" instead of "extends BasePaymentEmployee"), and reserve inheritance strictly for stable, narrow is-a relationships.',
    'Treating encapsulation as "just add getters and setters for every field." Auto-generating a public getter and setter for every private field recreates the exact same problem encapsulation was meant to solve, any outside code can still set the field to any value, the class just added ceremony without adding any actual protection. Fix: only expose what callers genuinely need, and put real validation inside setters (or better, avoid setters entirely and validate fully in the constructor) rather than treating them as a rubber stamp.',
    'Confusing method overloading with method overriding, and assuming both are "polymorphism." Overloading (multiple methods with the same name but different parameters) is resolved entirely at compile time based on the declared argument types, it has nothing to do with runtime object types. Only overriding, where a subclass replaces a superclass method with the same signature, is resolved at runtime via dynamic dispatch, which is what people actually mean by polymorphism.'
  ],

  interviewPerspective:
    'OOP questions rarely ask you to define the four pillars from memory, interviewers assume you already know the words. ' +
    'What they actually probe is whether you understand the MECHANISM underneath each one. A very common question: ' +
    '"A method takes a parameter of type Animal and calls animal.makeSound(). At runtime it is actually passed a Dog ' +
    'object. Which makeSound() runs, and what mechanism decides that?" The expected answer is that Dog\'s makeSound() ' +
    'runs, decided by dynamic dispatch, the JVM looks at the object\'s actual runtime class, not the reference\'s ' +
    'declared compile-time type, to choose which overridden method to invoke via that class\'s vtable. A second common ' +
    'angle is asking you to critique a deep inheritance hierarchy and explain why composition would have aged better, ' +
    'which tests whether you have actually felt the pain of a rigid hierarchy, not just memorized that "composition ' +
    'over inheritance" is a good sound bite.',

  triggerSentence:
    'The four pillars are not vocabulary to memorize, they are four specific answers to "how do I stop this codebase from becoming unmaintainable."',

  relatedConcepts: [
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'solid',
      title: 'SOLID',
      note: 'SOLID is essentially "OOP done well" - five concrete rules for how to actually structure the classes OOP gives you the tools to build.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'generics',
      title: 'Generics',
      note: 'Generics extend polymorphism to types themselves - a List<T> is polymorphic over what T is, using the same substitution idea at the type level.'
    }
  ]
};

