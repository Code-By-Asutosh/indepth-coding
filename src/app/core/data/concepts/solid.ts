import { ConceptContent } from '../../models/content.model';

export const SOLID: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'solid',
  title: 'SOLID',

  hook:
    'You add one small feature to a class, and three unrelated tests break in a module you never touched. Nobody changed ' +
    'those tests. Nobody changed that module. What actually broke?',

  problem:
    'Most codebases do not become unmaintainable because of one dramatic bad decision - they rot from many small, ' +
    'reasonable-seeming decisions that each slightly increase how tangled classes are with each other. SOLID is not five ' +
    'abstract rules; it is five specific, recurring ways codebases actually rot, each with a name attached so you can ' +
    'recognize it happening in real time.',

  aha: {
    statement: 'SOLID is five separate answers to "why did changing THIS break THAT," each addressing a different kind of unwanted coupling.',
    analogy:
      "Think of a well-run restaurant kitchen: each station does ONE job (Single Responsibility), you can add a new dish " +
      "without rewriting the whole menu (Open/Closed), any trained chef can run any station (Liskov Substitution), the " +
      "grill station isn't handed the dessert menu it'll never use (Interface Segregation), and the head chef gives orders " +
      "through a ticket system, not by personally grabbing each cook (Dependency Inversion)."
  },

  underTheHood: [
    'Single Responsibility Principle (SRP): a class should have one reason to change. Not "one method" - one AXIS of change. ' +
      'An OrderService that also formats emails and writes CSV reports has three unrelated reasons to change, and a change to email formatting risks breaking order logic.',
    'Open/Closed Principle (OCP): a class should be open for extension but closed for modification. Adding a new payment ' +
      'method should mean writing a new class, not editing an existing, already-tested `if/else` chain inside PaymentProcessor.',
    'Liskov Substitution Principle (LSP): any subclass must be usable anywhere its parent is expected, without breaking ' +
      'the caller\'s assumptions. The classic violation: Square extends Rectangle but overrides setWidth() to also change ' +
      'height - code that works correctly for any Rectangle silently breaks for a Square.',
    'Interface Segregation Principle (ISP): clients should not be forced to depend on methods they do not use. A fat ' +
      '`Worker` interface with `work()` and `eat()` forces a `RobotWorker` to implement a meaningless `eat()` method.',
    'Dependency Inversion Principle (DIP): high-level modules should depend on abstractions, not concrete low-level ' +
      'modules. An OrderService should depend on a `PaymentGateway` interface, not directly on `StripeClient` - this is the ' +
      'principle Dependency Injection frameworks like Spring exist to make effortless.'
  ],

  inTheWild: [
    'A "God class" like `UserService` that handles authentication, email sending, report generation, and billing - every unrelated change risks breaking every other feature, and SRP is the direct fix.',
    'A payment system where adding a new provider means finding and editing a giant switch statement instead of writing one new class - a textbook OCP violation.',
    'Interview question: "Give a real example of a Liskov Substitution violation" - the Square/Rectangle example is the canonical answer, and being able to explain WHY it breaks (not just recite it) is what separates memorizing from understanding.'
  ],

  showMe: {
    caption: 'A class with three unrelated responsibilities, split according to SRP.',
    bad: {
      language: 'java',
      code:
        'class OrderService {\n' +
        '    void placeOrder(Order order) { /* business logic */ }\n\n' +
        '    void sendConfirmationEmail(Order order) {\n' +
        '        // SMTP details, HTML templating - nothing to do with placing an order\n' +
        '    }\n\n' +
        '    void writeOrderToCsvReport(Order order) {\n' +
        '        // File I/O, formatting - also nothing to do with placing an order\n' +
        '    }\n' +
        '}',
      explanation:
        'Three unrelated reasons to change this class: order rules changing, email templates changing, or report format ' +
        'changing - a bug fix in email formatting requires re-testing order placement logic too, because they live in the same class.'
    },
    good: {
      language: 'java',
      code:
        'class OrderService {\n' +
        '    private final NotificationService notifications;\n' +
        '    private final OrderReportWriter reportWriter;\n\n' +
        '    void placeOrder(Order order) {\n' +
        '        // business logic only\n' +
        '        notifications.sendOrderConfirmation(order);\n' +
        '        reportWriter.record(order);\n' +
        '    }\n' +
        '}\n\n' +
        'class NotificationService { void sendOrderConfirmation(Order order) { /* ... */ } }\n' +
        'class OrderReportWriter { void record(Order order) { /* ... */ } }',
      explanation:
        'Each class now has exactly one reason to change. A change to email templates touches only NotificationService - ' +
        'OrderService and its tests are completely unaffected.'
    }
  },

  impact: {
    before: 'A single bug fix in report formatting requires re-running and re-verifying all order-placement tests.',
    after: 'Each class changes independently - a report-formatting fix only touches the report-writing tests.',
    metric: 'Teams that consistently apply SRP report dramatically fewer "unrelated" test failures per change - often cited as the single highest-leverage SOLID principle in practice.'
  },

  alternatives: [
    {
      name: 'Strict SOLID adherence from day one',
      whenToUse: 'A codebase expected to live and grow for years with multiple contributors.',
      whenNotToUse: "A genuine one-off script or prototype you'll throw away - over-applying SOLID to disposable code is its own form of over-engineering."
    },
    {
      name: 'Pragmatic, incremental refactoring toward SOLID as pain appears',
      whenToUse: 'Most real production codebases - apply the principle that fixes the specific pain you\'re feeling right now (e.g. SRP when a class keeps breaking for unrelated reasons).',
      whenNotToUse: "Codebases with severe, systemic coupling - sometimes a deliberate, planned redesign beats incremental patching."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Treating SOLID as a checklist to apply uniformly everywhere, splitting every class into as many tiny pieces as theoretically possible.',
      why:
        "SOLID is a response to REAL pain (a class breaking for unrelated reasons, a hierarchy that doesn't substitute " +
        "cleanly). Applying it preemptively everywhere, before that pain exists, produces a maze of tiny classes and " +
        "interfaces that is arguably harder to navigate than the 'unclean' version would have been.",
      fix:
        "Apply each principle when you actually feel its corresponding pain (e.g. split a class when it genuinely has " +
        "multiple unrelated reasons to change), not preemptively on every class in the codebase."
    }
  ],

  proveIt: {
    question:
      'A `Bird` class has a `fly()` method. A `Penguin` class extends `Bird` and throws `UnsupportedOperationException` in ' +
      'its overridden `fly()`. Which SOLID principle does this violate, and why?',
    answer:
      'Liskov Substitution Principle - code written to work with any `Bird` (calling `fly()`) will crash if handed a ' +
      '`Penguin`, even though a `Penguin` is technically substitutable at compile time. The fix is usually to model ' +
      '"flying" as a separate interface that only flying birds implement, rather than assuming every Bird can fly.'
  },

  oneLiner: 'SOLID is not five rules to memorize - it is five specific, recurring shapes of pain, each with a name so you recognize it happening.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'oop',
      title: 'OOP',
      note: 'SOLID is the practical rulebook for using the four OOP pillars well - OOP gives you the tools, SOLID tells you how to not misuse them.'
    },
    {
      categoryId: 'software-design',
      topicId: 'design-patterns-clean-architecture',
      conceptId: 'solid',
      title: 'SOLID (Design Patterns & Clean Architecture)',
      note: 'SOLID reappears as the foundation for Clean/Hexagonal Architecture - the Dependency Inversion Principle in particular is the entire basis for those architectural styles.'
    }
  ]
};
