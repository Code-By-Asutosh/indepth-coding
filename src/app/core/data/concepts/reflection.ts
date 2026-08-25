import { ConceptContent } from '../../models/content.model';

export const REFLECTION: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "reflection",
  title: "Reflection",
  topicType: "concept",
  simpleIntuition: "A JSON library turns your plain Java object into JSON without you writing a single line of serialization code for that class. It has never seen your class before, and you never told it what fields exist. How does it know?",
  formalMeaning: "Reflection lets code inspect and manipulate classes, fields, and methods AT RUNTIME, as data - instead of the compiler needing to know about them ahead of time.",
  whyItExists: "Normally, your code has to know the exact shape of a class at compile time to use it (call its methods, read its fields). But frameworks like Jackson, Spring, and Hibernate work with classes they have NEVER seen before, written by you, years after the framework itself was compiled. Reflection is how that is possible - and understanding it explains a huge amount of \"framework magic\" that otherwise looks unexplainable.",
  howItWorksInternally: [
    "Every loaded class has a corresponding `Class<T>` object at runtime - `obj.getClass()` or `MyClass.class` gives you a handle to inspect that class's structure.",
    "From a `Class` object, you can enumerate its fields (`getDeclaredFields()`), methods (`getDeclaredMethods()`), constructors, and annotations - all as data you can inspect and iterate at runtime.",
    "You can read/write a field's value via `Field.get(obj)`/`Field.set(obj, value)`, and invoke a method via `Method.invoke(obj, args)` - even on private members, by first calling `setAccessible(true)` to bypass normal access checks.",
    "This is exactly how a JSON library like Jackson works: given an object instance, it reflects over its fields/getters to figure out what to serialize, without the library author ever having seen your specific class.",
    "It is also how Spring finds and wires up your `@Component`/`@Service` classes, and how JUnit finds and runs your `@Test`-annotated methods - annotations are readable at runtime specifically so frameworks can act on them via reflection.",
    "The cost: reflective calls are meaningfully slower than direct calls (no JIT inlining, extra security checks, boxing for primitive args), and reflection defeats some compile-time safety since typos in field/method names only fail at runtime, not compile time."
  ],
  mainComponents: [
    "Normal code is like calling someone by name because you already know them personally. Reflection is like being handed a stranger's ID card at runtime and being able to read their full profile (name, address, capabilities) and even act on their behalf, despite never having met them before you were handed that card."
  ],
  realWorldExamples: [
    "Any JSON/XML serialization library (Jackson, Gson) reading your class's fields to convert an object to/from JSON without you writing custom serialization code.",
    "Spring's dependency injection scanning your classpath for `@Component`-annotated classes and wiring their constructors, all discovered and invoked via reflection.",
    "Interview question: \"How does a framework call methods on a class it was compiled before you even wrote?\" - reflection, discovered via annotations, is almost always the correct answer."
  ],
  complexityAndTradeoffs: [
    "Before: One hand-written conversion method per class, duplicated across every domain type in the codebase.",
    "After: One generic method that works for any class, at the cost of slightly slower execution and losing compile-time typo detection.",
    "This trade-off (write it once, generically, vs. faster-but-duplicated-per-type) is exactly why nearly every serialization/DI framework in the Java ecosystem is reflection-based.",
    "Reflection: use it when framework/library code that must work generically with types it has never seen before (serialization, dependency injection, testing frameworks). Avoid it when regular application/business code - direct method calls are faster, type-safe at compile time, and far easier to refactor with IDE tooling.",
    "Annotation processors (compile-time code generation, e.g. Lombok, MapStruct): use it when you want reflection-like generic behavior but resolved at COMPILE time instead of runtime, for better performance and earlier error detection. Avoid it when you need truly dynamic behavior based on data only known at runtime (e.g. class names loaded from a config file) - that genuinely needs real reflection."
  ],
  commonMistakes: [
    "Using reflection in regular application/business logic to \"avoid writing a getter\" or bypass encapsulation, instead of using it only where genuinely necessary. It feels clever and saves a few lines in the moment, but it silently breaks compile-time type safety (a typo in a field name compiles fine and fails at runtime), is measurably slower, and makes the code far harder for an IDE to refactor safely (rename a field and every reflective string reference to it silently breaks). Fix: Reserve reflection for genuine framework/library-style generic code. In regular business logic, always prefer direct method/field access."
  ],
  interviewPerspective: "A common way this gets tested: \"A field is declared `private`. Using plain Java code, you cannot access it from outside the class. Using reflection, can you read its value anyway - and if so, what specific call makes that possible?\" Yes - calling `field.setAccessible(true)` before `field.get(obj)` bypasses the normal private-access compiler check, which is exactly how many serialization/mocking libraries read private fields without needing a public getter.",
  triggerSentence: "Reflection turns \"code\" into \"data you can inspect and act on\" - the price is speed and compile-time safety, the payoff is writing something once that works for types you have never seen."
};
