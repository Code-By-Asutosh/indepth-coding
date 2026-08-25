import { ConceptContent } from '../../models/content.model';

export const PROJECT_PANAMA: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "project-panama-ffm-api",
  title: "Project Panama (FFM API)",
  topicType: "runtime-internals",
  simpleIntuition: "You need to call a native, high-performance image-processing library written in C. For decades, the only official way to do that from Java was JNI - widely regarded as one of the most painful, error-prone APIs in the entire platform. What changed?",
  formalMeaning: "The Foreign Function & Memory API lets Java code call native libraries and access off-heap memory DIRECTLY, from pure Java, without writing a single line of separate native glue code.",
  whyItExists: "JNI (Java Native Interface), the historical way to call native C/C++ code from Java, requires writing separate native glue code (compiled per-platform), manually managing memory across the Java/native boundary, and is notorious for being verbose, fragile, and a common source of crashes (a bug in native code can crash the whole JVM with no exception to catch).",
  howItWorksInternally: [
    "The Foreign Function API lets Java code look up and call functions in a native shared library (like a .so or .dll) directly, describing the function's signature (argument/return types) in Java, without writing any C glue code.",
    "The Foreign Memory API lets Java code allocate and access memory OUTSIDE the normal garbage-collected heap (\"off-heap\" memory) directly, via a `MemorySegment` - useful for interoperating with native code that expects a raw pointer, or for very large datasets you want to manage without GC involvement.",
    "This directly replaces the two historical mechanisms for this: JNI (writing separate native glue code, painful and fragile) and `sun.misc.Unsafe` (unsupported, unsafe, being phased out) - Panama provides a properly designed, safer, officially supported replacement for both use cases.",
    "Memory safety is still taken seriously: a `MemorySegment` has a defined lifetime (scope), and accessing it after that scope is closed throws a proper exception rather than crashing the JVM - a meaningfully safer failure mode than the historical alternatives.",
    "This unlocks scenarios that were previously painful or required Unsafe/JNI: calling existing native libraries (image processing, ML runtimes, system APIs) directly from Java, and working with very large off-heap datasets without adding GC pressure."
  ],
  mainComponents: [
    "Calling native code via JNI is like needing to hire a professional translator (write and compile separate native C code) every single time you want to have a conversation with a foreign colleague. The FFM API is like finally being fluent enough yourself to just talk to them directly - no separate translator to hire, compile, and maintain for every single interaction."
  ],
  realWorldExamples: [
    "A Java application calling into an existing, high-performance native library (e.g. a specialized math/ML library written in C) directly, without maintaining a separate JNI glue layer for it.",
    "Working with very large datasets in off-heap memory (outside the GC-managed heap) to avoid adding garbage collection pressure for data that does not need to be a normal Java object.",
    "Interview question (forward-looking/senior roles): \"Why did the JDK team build a whole new API instead of just improving JNI?\" - JNI's fundamental design (requiring separate compiled native glue code per platform) could not be fixed incrementally; Panama is a ground-up, pure-Java-callable replacement."
  ],
  complexityAndTradeoffs: [
    "Before: Calling any native function requires writing, compiling, and maintaining separate native glue code per platform.",
    "After: Native functions can be called directly from pure Java code, with no separate native compilation step.",
    "This removes an entire, historically painful category of build/maintenance complexity for any Java application needing to interoperate with native libraries.",
    "Foreign Function & Memory API (Project Panama): use it when new code needing to call native libraries or manage off-heap memory on a modern JDK. Avoid it when you're on an older JDK without this API available - JNI remains the only option there.",
    "JNI (Java Native Interface): use it when legacy codebases already built on it, or JDK versions that predate the FFM API. Avoid it when new projects on a modern JDK - Panama is a strictly safer, simpler replacement for the same use case."
  ],
  commonMistakes: [
    "Accessing a MemorySegment after its associated Arena (scope) has been closed. Off-heap memory managed through Panama has an explicit, bounded lifetime tied to its Arena - accessing it after that scope closes is analogous to a use-after-free bug in C, and while Panama is designed to fail safely (with a proper exception) rather than crash, it still represents a real logic error in how the memory's lifetime was managed. Fix: Be deliberate about Arena scope/lifetime - ensure no code retains or accesses a MemorySegment after its owning Arena has been closed."
  ],
  interviewPerspective: "A common way this gets tested: \"What is the single biggest structural difference between calling a native function via JNI versus via the Foreign Function API?\" JNI requires writing and separately compiling platform-specific native glue code (a .c file compiled to a shared library) before Java can call the native function. The Foreign Function API looks up and calls the native function directly from pure Java code, with no separate native compilation step required at all.",
  triggerSentence: "Project Panama lets Java talk directly to native code and native memory - no separate native glue code required, unlike JNI."
};
