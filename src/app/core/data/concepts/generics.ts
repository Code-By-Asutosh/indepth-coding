import { ConceptContent } from '../../models/content.model';

export const GENERICS: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "generics",
  title: "Generics",
  topicType: "concept",
  simpleIntuition: "At runtime, you call `list.getClass()` on both a `List<String>` and a `List<Integer>` - and get back the exact same class, `java.util.ArrayList`. If generics are real types, where did `<String>` and `<Integer>` go?",
  formalMeaning: "Generics are a compile-time-only safety net - the type information is checked by the compiler and then thrown away before the program ever runs.",
  whyItExists: "Before generics, collections held plain `Object` - you could put anything in an `ArrayList` and get back an `Object` you had to manually cast, with zero compile-time protection against putting the wrong type in by mistake. Generics fixed that at compile time, but the mechanism they use (erasure) creates its own set of gotchas that trip up almost everyone eventually.",
  howItWorksInternally: [
    "Generics let you parameterize a class/method over a type: `List<T>` means \"a List of some type T,\" decided by whoever uses it - `List<String>`, `List<Order>`, etc.",
    "The compiler uses the generic type parameter to catch type errors at COMPILE time - `list.add(5)` on a `List<String>` fails to compile, long before the program ever runs.",
    "Type erasure: after compilation, the JVM has NO idea what T was - `List<String>` and `List<Integer>` both become plain `List` (with Object internally) in the compiled bytecode. This is why `list.getClass()` looks identical regardless of the generic type.",
    "Bounded type parameters (`<T extends Number>`) restrict what T can be, letting you call Number's methods on values of type T inside the generic class/method, while still being generic over exactly which Number subtype is used.",
    "Wildcards (`List<? extends Number>`, `List<? super Integer>`) express variance: \"a list of SOME unknown subtype of Number\" (you can read Numbers out, but cannot safely add to it) versus \"a list of some unknown supertype of Integer\" (you can safely add Integers, but reading gives you only Object).",
    "Because of erasure, you cannot create a generic array (`new T[10]`), cannot check `instanceof List<String>` at runtime (only `instanceof List` is legal), and cannot have two overloaded methods that only differ by generic type parameter."
  ],
  mainComponents: [
    "Think of generics like a color-coded label on a moving box during packing - the label (String, Integer) tells the movers (the compiler) exactly what SHOULD go in and come out of that specific box, and they'll refuse to load the wrong item. But once the boxes arrive at the new house (runtime), the labels have literally been peeled off - every box is just \"a box\" now."
  ],
  realWorldExamples: [
    "A method signature like `<T extends Comparable<T>> T max(List<T> list)` - this is how generic utility methods (like Collections.max) guarantee at compile time that whatever type you pass in can actually be compared.",
    "The classic `PECS` mnemonic (Producer Extends, Consumer Super) that comes up when deciding whether to use `? extends T` or `? super T` in an API - a genuinely famous piece of Java generics folklore.",
    "Interview question: \"Why can't you create a `new T[10]` inside a generic class?\" - because of type erasure, the JVM would not know what actual array type to allocate at runtime; this is a direct, testable consequence of erasure."
  ],
  complexityAndTradeoffs: [
    "Before: A type mismatch caught as a ClassCastException at runtime, potentially in production, far from where the wrong value was actually inserted.",
    "After: The exact same mistake caught by the compiler, at the exact line where it happens, before the code ever runs.",
    "This is the core reason generics exist - moving an entire category of bug from \"discovered in production\" to \"cannot compile\" is the single biggest quality-of-life improvement Java collections ever received.",
    "Generic type parameters (List<T>, <T extends Comparable<T>>): use it when the default, standard way to write reusable, type-safe collections and utility methods in modern Java. Avoid it when extremely rare cases needing runtime reflection over the exact parameterized type - erasure makes true runtime generic type-checking impossible without extra machinery (like passing Class<T> explicitly).",
    "Raw types (List instead of List<T>): use it when essentially never in new code - exists only for backward compatibility with pre-Java-5 code. Avoid it when any new code at all - raw types disable all compile-time type checking that generics exist to provide."
  ],
  commonMistakes: [
    "Trying to check `if (list instanceof List<String>)` at runtime, expecting it to work like any other instanceof check. Due to type erasure, the JVM has no idea what generic type parameter a List was created with at runtime - only `instanceof List` (without the type parameter) is legal; the compiler will actually reject `instanceof List<String>` outright as an \"unchecked\" operation. Fix: If you genuinely need to know the element type at runtime, you must pass it explicitly (e.g. a `Class<T>` parameter) - erasure means the generic type itself is never recoverable from the object alone."
  ],
  interviewPerspective: "A common way this gets tested: \"At runtime, does `new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass()` evaluate to true or false, and why?\" True - due to type erasure, both are compiled down to the same raw `ArrayList` class with no memory of the generic type parameter at all; the distinction between `<String>` and `<Integer>` exists only for the compiler, never at runtime.",
  triggerSentence: "Generics protect you at compile time and then vanish completely - the type safety is real, but it is a compiler-only illusion by the time your code actually runs."
};
