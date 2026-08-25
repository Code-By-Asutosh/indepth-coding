import { ConceptContent } from '../../models/content.model';

export const NESTED_INNER_ANONYMOUS_LOCAL_CLASSES: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "nested-inner-anonymous-local-classes",
  title: "Nested / Inner / Anonymous / Local Classes",
  topicType: "concept",
  simpleIntuition: "You create an `Iterator` object from inside a `List`, store it, and later the original list is eligible for garbage collection based on your understanding of scope - except it is not collected. The iterator is somehow keeping the whole list alive.",
  formalMeaning: "The critical dividing line is whether a nested class holds a hidden reference back to the OUTER instance that created it - that hidden reference is invisible in the code but very real in memory.",
  whyItExists: "Java has FOUR distinct kinds of classes you can nest inside another class, and they are not interchangeable - each has a different relationship to the enclosing instance, different memory-lifetime implications, and different rules about what it can access. Treating them as \"basically the same thing\" leads to real memory-leak bugs and confusing scoping mistakes.",
  howItWorksInternally: [
    "Static nested class: declared `static` inside another class, it does NOT hold a reference to an instance of the outer class - it behaves like a top-level class that just happens to be namespaced inside another one, with no hidden coupling.",
    "Inner class (non-static nested class): every instance implicitly holds a hidden reference to the specific outer instance that created it (accessible via `Outer.this`). This means an inner class instance can keep its entire outer instance alive in memory for as long as the inner instance itself is reachable.",
    "Local class: a class defined INSIDE a method body - scoped to that method, can access effectively-final local variables of the enclosing method (captured by value at creation time), and (if non-static) also holds the same hidden outer-instance reference as a regular inner class.",
    "Anonymous class: a local class with no name, declared and instantiated in a single expression (`new Runnable() { ... }`) - used for one-off implementations, and follows all the same capturing/reference rules as a named local class.",
    "\"Effectively final\" capture: a local/anonymous class can only use a local variable from its enclosing method if that variable is never reassigned after initialization - the class captures a COPY of the variable's value at creation time, not a live reference to the variable itself.",
    "This is exactly the classic bug: an Iterator (an inner class of the collection) keeps the ENTIRE outer collection instance reachable through its hidden reference, for as long as the iterator itself is reachable - even if nothing else in the program still refers to the collection directly."
  ],
  mainComponents: [
    "A static nested class is like a separate department in the same building with no special access to the CEO's office - just organizationally grouped together. A (non-static) INNER class is like an executive assistant who always carries a direct phone line back to a SPECIFIC CEO they were hired by - wherever the assistant goes, that phone line (and therefore the CEO) stays reachable through them, whether anyone remembers that connection exists or not."
  ],
  realWorldExamples: [
    "A cache or listener list holding onto an inner-class instance (e.g. an event handler) far longer than intended, silently keeping the entire outer object (and everything IT references) alive - a genuine, real-world memory leak pattern.",
    "Modern lambdas have effectively replaced most everyday uses of anonymous classes for single-method interfaces (`Runnable`, `Comparator`) - anonymous classes are still needed when you must implement an interface with MULTIPLE abstract methods, which a lambda cannot do.",
    "Interview question: \"Why can a local/anonymous class only capture effectively final local variables?\" - because the local variable might go out of scope (the method returns) long before the class instance itself is garbage collected, so the class must capture a COPY, and allowing reassignment after capture would create ambiguity about which value was \"really\" captured."
  ],
  complexityAndTradeoffs: [
    "Before: A seemingly-collected object stays reachable and alive in memory purely because of a hidden reference from a nested class instance.",
    "After: The nested class holds no reference to the outer instance, so it does not keep it alive.",
    "This exact pattern (inner class outliving its logical purpose) is a real, documented source of memory leaks - \"make nested classes static unless they genuinely need the outer instance\" is common, sound advice for this reason.",
    "Static nested class: use it when default choice whenever the nested class does not need direct access to the outer instance's fields/methods. Avoid it when the nested class genuinely needs to interact with the specific outer instance that created it.",
    "Inner (non-static) class: use it when the nested class genuinely needs a live connection back to a specific outer instance (e.g. an Iterator needing access to its collection's internals). Avoid it when long-lived instances of the nested class that might outlive the outer instance's intended lifetime - the hidden reference risks a memory leak.",
    "Lambda expression: use it when implementing a functional interface (single abstract method) for a short-lived, simple behavior. Avoid it when implementing an interface with multiple abstract methods, or needing your own named instance fields - those require an anonymous or named class."
  ],
  commonMistakes: [
    "Declaring every nested helper class as a regular (non-static) inner class by default, out of habit, without considering whether it needs the outer reference. It compiles and works identically in casual testing - the hidden reference only becomes a real problem when an instance of the nested class is held somewhere long-lived (a cache, a listener registry, a static collection), at which point it silently prevents the entire outer object from ever being garbage collected. Fix: Default to `static` for nested classes unless they specifically need to access the outer instance's state - this is a simple, mechanical rule that avoids the whole class of bug."
  ],
  interviewPerspective: "A common way this gets tested: \"A method declares `int count = 0;` and later, in the same method, defines an anonymous Runnable that tries to increment `count` inside its run() method. Does this compile?\" No - count is captured by the anonymous class and must be effectively final (never reassigned after initialization). Attempting to modify it inside the anonymous class's method body fails to compile, since the class only ever sees a COPY of count's value at creation time, not the live variable.",
  triggerSentence: "A nested class that is not `static` carries a hidden reference back to its creator - invisible in your code, very real in your heap."
};
