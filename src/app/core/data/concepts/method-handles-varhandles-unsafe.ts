import { ConceptContent } from '../../models/content.model';

export const METHOD_HANDLES_VARHANDLES_UNSAFE: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "method-handles-varhandles-unsafe",
  title: "Method Handles / VarHandles / Unsafe",
  topicType: "runtime-internals",
  simpleIntuition: "A high-performance library needs to read a private field a billion times a second, and plain reflection (`Field.get()`) is too slow for that scale. Reflection is already \"the escape hatch\" - what do you reach for when even THAT is not fast enough?",
  formalMeaning: "These are progressively lower-level, higher-performance tools than reflection for the exact same \"act on code as data\" problem - trading safety and portability for raw speed.",
  whyItExists: "Reflection is flexible but its per-call overhead (security checks, boxing, no JIT inlining) is real. For performance-critical library code (serialization frameworks, concurrency primitives, low-level data structures), that overhead is unacceptable at scale - which is exactly the gap MethodHandles, VarHandles, and (historically) sun.misc.Unsafe fill.",
  howItWorksInternally: [
    "MethodHandle: a typed, directly-invokable reference to a method/constructor/field accessor, resolved once and then invoked with much less per-call overhead than Reflection's Method.invoke() - the JIT can often inline through a MethodHandle, which it generally cannot do through reflection.",
    "VarHandle (introduced in Java 9, alongside the modern Java Memory Model APIs): a typed reference to a variable (field, array element) supporting fine-grained atomic and memory-ordering operations (compareAndSet, getVolatile, getAcquire/setRelease) - the modern, safe, standard replacement for most legitimate uses of sun.misc.Unsafe.",
    "sun.misc.Unsafe: an internal, explicitly UNSUPPORTED class historically used by high-performance libraries (Netty, older versions of many concurrency libraries) for direct memory access, bypassing normal safety checks entirely - it was never meant for public/application use and has been progressively locked down and is being phased out in modern JDKs.",
    "The general performance/safety ladder, from safest+slowest to fastest+most dangerous: normal method calls -> Reflection -> MethodHandles -> VarHandles -> Unsafe.",
    "Modern JDKs have been actively closing off Unsafe (via the module system's strong encapsulation) specifically to push library authors toward VarHandles, which provide equivalent capability with actual safety guarantees and official support."
  ],
  mainComponents: [
    "If reflection is asking a translator to interpret every single sentence for you in real time, a MethodHandle is more like memorizing the translation once and repeating it directly from memory afterward - much faster, because you skip the interpretation step on every repeated use."
  ],
  realWorldExamples: [
    "High-performance serialization/concurrency libraries (Netty, parts of the JDK's own java.util.concurrent internals) using VarHandles internally to implement lock-free, high-throughput data structures.",
    "Legacy libraries built years ago on sun.misc.Unsafe running into compatibility issues on modern JDKs, forcing a migration to VarHandles as the module system's encapsulation tightens further each release.",
    "Interview question (mostly for very senior/infrastructure-focused roles): \"Why did the JDK team push Unsafe out in favor of VarHandles?\" - because Unsafe bypassed the JVM's own safety guarantees entirely and was never an officially supported public API, creating long-term platform risk."
  ],
  complexityAndTradeoffs: [
    "Before: A hot loop paying reflection's per-call overhead a million times over.",
    "After: The same loop using a pre-resolved VarHandle with dramatically less per-access overhead.",
    "For genuinely hot paths, replacing repeated reflective field access with a resolved MethodHandle/VarHandle commonly closes most of the performance gap to direct field access.",
    "Reflection: use it when infrequent, non-hot-path generic access (typical framework startup/configuration code) where simplicity matters more than raw per-call speed. Avoid it when hot loops calling the same field/method access millions of times - the per-call overhead becomes measurable.",
    "MethodHandle / VarHandle: use it when performance-sensitive library code needing repeated, low-overhead access to fields/methods discovered dynamically, or fine-grained atomic memory operations. Avoid it when regular application code - this is squarely library/framework-author territory, not typical business logic.",
    "sun.misc.Unsafe: use it when essentially never in new code - it is unsupported, actively being locked down, and VarHandles now cover its legitimate use cases with actual safety guarantees. Avoid it when any new code at all in a modern JDK."
  ],
  commonMistakes: [
    "Reaching for MethodHandles/VarHandles (or worse, Unsafe) in ordinary application code \"for performance,\" without first profiling to confirm reflection is actually a bottleneck. This is squarely premature optimization - for the vast majority of application code (framework startup, occasional dynamic dispatch), reflection's overhead is completely negligible, and reaching for a lower-level, harder-to-maintain, less-portable tool adds real complexity for no measurable benefit. Fix: Profile first. Reserve MethodHandles/VarHandles for genuinely hot paths in library/infrastructure code where measurements show reflection overhead actually matters."
  ],
  interviewPerspective: "A common way this gets tested: \"Why is sun.misc.Unsafe being progressively removed/locked down in modern JDKs, when VarHandles largely provide the same low-level capability?\" Because Unsafe was never an officially supported public API and bypassed the JVM's own safety guarantees entirely - VarHandles provide equivalent low-level capability (atomic operations, memory ordering) through a properly designed, safe, officially supported API instead.",
  triggerSentence: "When even reflection is too slow, MethodHandles and VarHandles trade a bit more complexity for a bit more speed - and Unsafe trades away safety entirely, which is exactly why it is disappearing."
};
