import { ConceptContent } from '../../models/content.model';

export const FUNCTIONAL_PROGRAMMING: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "functional-programming",
  title: "Functional Programming",
  topicType: "concept",
  simpleIntuition: "A teammate reviews your PR and says \"this method has a side effect, it's not pure.\" You pass unit tests fine. Why does it matter whether a method is \"pure,\" if the output is correct?",
  formalMeaning: "A pure function's output depends ONLY on its inputs, and it changes nothing outside itself - which means you can reason about it in complete isolation, without knowing anything about the rest of the program.",
  whyItExists: "Java is fundamentally an object-oriented, imperative language, but Java 8+ borrowed core ideas from functional programming (immutability, pure functions, passing behavior as values). Without understanding WHY those ideas exist (what specific bugs they prevent), functional-style Java code just looks like unnecessary restriction for no reason.",
  howItWorksInternally: [
    "A pure function has no side effects (does not mutate shared state, does not do I/O) and is referentially transparent - calling it with the same arguments always produces the same result, so you can mentally replace the call with its result.",
    "Immutability means once created, an object's state never changes - instead of mutating, you create a new object with the updated value. This eliminates an entire class of concurrency bugs, because a truly immutable object can be safely shared across threads with zero synchronization.",
    "Higher-order functions either accept a function as an argument (like Stream.map(Function<T,R>)) or return one - this is what makes passing \"behavior\" around as a value practically useful, not just theoretically possible.",
    "First-class functions means functions (or in Java's case, lambdas/method references implementing functional interfaces) can be assigned to variables, passed as arguments, and returned from other functions, just like any other value.",
    "Java is NOT a purely functional language - it still has mutable state, loops, and side effects everywhere by default. \"Functional-style Java\" means deliberately choosing immutability and pure functions where it helps, not a language-enforced requirement."
  ],
  mainComponents: [
    "A pure function is like a vending machine: put in the same exact input (money + selection), get the same exact output (the same snack), every single time, and nothing about the machine changes elsewhere in the store. An impure function is more like asking a moody cashier for a snack - the answer might depend on their mood (hidden state), and asking might also change something else (a side effect), like their mood getting worse."
  ],
  realWorldExamples: [
    "A `record` (immutable by construction) used for a value object like `Money` or `Point` - once created, its fields can never change, eliminating \"who mutated this and when\" bugs entirely.",
    "A `Comparator` passed as a lambda into `.sorted(...)` - the sorting logic itself is treated as a value being handed to another function, the essence of functional-style code.",
    "Interview question: \"Why is immutability considered valuable for thread-safety?\" - because an object that can never change after construction cannot have a race condition on its own fields; there is nothing to race over."
  ],
  complexityAndTradeoffs: [
    "Before: A shared, mutable running total that produces different results depending on call history and needs synchronization to be thread-safe.",
    "After: A pure function that is trivially testable, trivially thread-safe, and needs no synchronization at all.",
    "Pure functions and immutable data are the primary reason well-written functional-style code needs dramatically less `synchronized`/locking than equivalent mutable, stateful code.",
    "Pure functions / immutable data (functional style): use it when value objects, transformation logic, anything shared across threads, or anywhere testability matters most. Avoid it when performance-critical code where allocating a new object per change is measurably too costly - controlled, well-encapsulated mutation can be faster.",
    "Mutable, stateful, imperative style: use it when genuinely stateful things by nature (a game character's health, a UI widget's current state) or hot loops where allocation overhead matters. Avoid it when anything shared across threads without explicit synchronization - mutable shared state is the root cause of most concurrency bugs."
  ],
  commonMistakes: [
    "Writing a lambda passed into a stream operation that mutates an external variable (e.g. incrementing a shared counter inside `.forEach(...)`). It looks harmless in a simple sequential stream, and often 'works' by coincidence. The moment that same lambda runs inside a parallelStream(), multiple threads mutate that shared variable concurrently with no synchronization - reintroducing the exact race-condition bug that functional style was supposed to help avoid. Fix: Avoid mutating external state from within stream lambdas entirely - use `.collect(...)`, `.reduce(...)`, or similar built-in accumulation instead of a hand-rolled external counter."
  ],
  interviewPerspective: "A common way this gets tested: \"A method has no parameters, reads a static mutable field, and returns a value based on it. Is this method pure? Why or why not?\" No - even with zero parameters, if the return value depends on external mutable state (the static field) that can change between calls, the same \"input\" (none) does not guarantee the same output every time, which violates referential transparency.",
  triggerSentence: "Functional programming is not about avoiding loops - it is about knowing exactly what a piece of code depends on and affects, with nothing hidden."
};
