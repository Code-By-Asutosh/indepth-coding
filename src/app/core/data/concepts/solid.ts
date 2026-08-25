import { ConceptContent } from '../../models/content.model';

export const SOLID: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "solid",
  title: "SOLID",
  topicType: "concept",
  simpleIntuition: "You add one small feature to a class, and three unrelated tests break in a module you never touched. Nobody changed those tests. Nobody changed that module. What actually broke?",
  formalMeaning: "SOLID is five separate answers to \"why did changing THIS break THAT,\" each addressing a different kind of unwanted coupling.",
  whyItExists: "Most codebases do not become unmaintainable because of one dramatic bad decision - they rot from many small, reasonable-seeming decisions that each slightly increase how tangled classes are with each other. SOLID is not five abstract rules; it is five specific, recurring ways codebases actually rot, each with a name attached so you can recognize it happening in real time.",
  howItWorksInternally: [
    "Single Responsibility Principle (SRP): a class should have one reason to change. Not \"one method\" - one AXIS of change. An OrderService that also formats emails and writes CSV reports has three unrelated reasons to change, and a change to email formatting risks breaking order logic.",
    "Open/Closed Principle (OCP): a class should be open for extension but closed for modification. Adding a new payment method should mean writing a new class, not editing an existing, already-tested `if/else` chain inside PaymentProcessor.",
    "Liskov Substitution Principle (LSP): any subclass must be usable anywhere its parent is expected, without breaking the caller's assumptions. The classic violation: Square extends Rectangle but overrides setWidth() to also change height - code that works correctly for any Rectangle silently breaks for a Square.",
    "Interface Segregation Principle (ISP): clients should not be forced to depend on methods they do not use. A fat `Worker` interface with `work()` and `eat()` forces a `RobotWorker` to implement a meaningless `eat()` method.",
    "Dependency Inversion Principle (DIP): high-level modules should depend on abstractions, not concrete low-level modules. An OrderService should depend on a `PaymentGateway` interface, not directly on `StripeClient` - this is the principle Dependency Injection frameworks like Spring exist to make effortless."
  ],
  mainComponents: [
    "Think of a well-run restaurant kitchen: each station does ONE job (Single Responsibility), you can add a new dish without rewriting the whole menu (Open/Closed), any trained chef can run any station (Liskov Substitution), the grill station isn't handed the dessert menu it'll never use (Interface Segregation), and the head chef gives orders through a ticket system, not by personally grabbing each cook (Dependency Inversion)."
  ],
  realWorldExamples: [
    "A \"God class\" like `UserService` that handles authentication, email sending, report generation, and billing - every unrelated change risks breaking every other feature, and SRP is the direct fix.",
    "A payment system where adding a new provider means finding and editing a giant switch statement instead of writing one new class - a textbook OCP violation.",
    "Interview question: \"Give a real example of a Liskov Substitution violation\" - the Square/Rectangle example is the canonical answer, and being able to explain WHY it breaks (not just recite it) is what separates memorizing from understanding."
  ],
  complexityAndTradeoffs: [
    "Before: A single bug fix in report formatting requires re-running and re-verifying all order-placement tests.",
    "After: Each class changes independently - a report-formatting fix only touches the report-writing tests.",
    "Teams that consistently apply SRP report dramatically fewer \"unrelated\" test failures per change - often cited as the single highest-leverage SOLID principle in practice.",
    "Strict SOLID adherence from day one: use it when a codebase expected to live and grow for years with multiple contributors. Avoid it when a genuine one-off script or prototype you'll throw away - over-applying SOLID to disposable code is its own form of over-engineering.",
    "Pragmatic, incremental refactoring toward SOLID as pain appears: use it when most real production codebases - apply the principle that fixes the specific pain you're feeling right now (e.g. SRP when a class keeps breaking for unrelated reasons). Avoid it when codebases with severe, systemic coupling - sometimes a deliberate, planned redesign beats incremental patching."
  ],
  commonMistakes: [
    "Treating SOLID as a checklist to apply uniformly everywhere, splitting every class into as many tiny pieces as theoretically possible. SOLID is a response to REAL pain (a class breaking for unrelated reasons, a hierarchy that doesn't substitute cleanly). Applying it preemptively everywhere, before that pain exists, produces a maze of tiny classes and interfaces that is arguably harder to navigate than the 'unclean' version would have been. Fix: Apply each principle when you actually feel its corresponding pain (e.g. split a class when it genuinely has multiple unrelated reasons to change), not preemptively on every class in the codebase."
  ],
  interviewPerspective: "A common way this gets tested: \"A `Bird` class has a `fly()` method. A `Penguin` class extends `Bird` and throws `UnsupportedOperationException` in its overridden `fly()`. Which SOLID principle does this violate, and why?\" Liskov Substitution Principle - code written to work with any `Bird` (calling `fly()`) will crash if handed a `Penguin`, even though a `Penguin` is technically substitutable at compile time. The fix is usually to model \"flying\" as a separate interface that only flying birds implement, rather than assuming every Bird can fly.",
  triggerSentence: "SOLID is not five rules to memorize - it is five specific, recurring shapes of pain, each with a name so you recognize it happening."
};
