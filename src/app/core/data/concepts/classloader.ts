import { ConceptContent } from '../../models/content.model';

export const CLASSLOADER: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "classloader",
  title: "ClassLoader",
  topicType: "runtime-internals",
  simpleIntuition: "You write your own class named `String` (yes, really, in package `java.lang`... except the JVM refuses to even let you put it there) to see if the JVM will accidentally run your version instead of the real one. It never does - no matter what you try. What is silently protecting `java.lang.String` from being hijacked?",
  formalMeaning: "ClassLoaders form a hierarchy that ALWAYS asks its parent to load a class first before trying itself - this \"parent-first delegation\" is exactly what stops your own accidental `java.lang.String` from ever hijacking the real one.",
  whyItExists: "A production server might load classes from your application JAR, from ten different library JARs, from a plugin loaded dynamically at runtime, and from the JDK itself - all at once. Without a disciplined system for deciding which class definition wins when names might collide, and for isolating plugins from each other, this would be chaos.",
  howItWorksInternally: [
    "Bootstrap ClassLoader: written in native code (not Java itself), loads the core JDK classes (java.lang.*, java.util.*) from the JDK's own modules - this is the \"CEO\" at the top with absolute first authority.",
    "Platform ClassLoader (formerly \"Extension\"): loads certain platform-specific JDK modules that are not part of the absolute core.",
    "Application ClassLoader (aka \"System\"): loads your application's own classes and its dependency JARs from the classpath - this is what loads YOUR code by default.",
    "Delegation model: when asked to load a class, a ClassLoader FIRST delegates to its parent, and only attempts to load it itself if the parent cannot find it - this is exactly why you cannot accidentally shadow java.lang.String with your own class of the same name; the Bootstrap loader (parent of everyone) already satisfies that request first.",
    "A class is uniquely identified at runtime by the COMBINATION of its fully-qualified name AND the ClassLoader that loaded it - the exact same .class file loaded by two DIFFERENT ClassLoaders produces two genuinely different, mutually-incompatible Class objects (a classic source of confusing `ClassCastException: X cannot be cast to X` errors).",
    "Application servers and plugin systems (Tomcat, OSGi) use custom ClassLoader hierarchies specifically to isolate different applications/plugins from each other - each can have its own version of the same library, loaded by its own ClassLoader, without conflicting with any other."
  ],
  diagrams: [
    {
      mermaid: "flowchart BT\n  App[\"Application ClassLoader\\n(your code + dependency JARs)\"] --> Platform[\"Platform ClassLoader\"]\n  Platform --> Bootstrap[\"Bootstrap ClassLoader\\n(java.lang.*, java.util.*)\"]\n  Bootstrap -.->|\"asked first, always\"| Bootstrap",
      caption: "A request to load a class always asks the parent first - this is why you can never shadow java.lang.String."
    }
  ],
  mainComponents: [
    "Think of it like a strict corporate approval chain: before doing anything yourself, you must first ask your manager if THEY can handle it, who asks THEIR manager, all the way up to the CEO. The CEO (Bootstrap ClassLoader) gets first refusal on everything foundational (java.lang.*) - by the time a request trickles back down to you, the most senior person who could handle it already has, so a junior employee's attempt to redefine String never even gets a chance."
  ],
  realWorldExamples: [
    "A baffling `ClassCastException: com.example.Foo cannot be cast to com.example.Foo` - the exact same class name, but loaded by two different ClassLoaders (e.g. once by a web app's loader, once by a shared/parent loader), making them incompatible types at runtime despite identical source code.",
    "An application server (like Tomcat) giving each deployed web application its own ClassLoader, so two apps on the same server can depend on two different, conflicting versions of the same library without interfering with each other.",
    "Interview question: \"Why can't you override java.lang.String with your own class of the same name?\" - parent-first delegation means the Bootstrap ClassLoader always resolves core JDK classes before any application-level ClassLoader gets a chance to try."
  ],
  complexityAndTradeoffs: [
    "Before: A baffling ClassCastException between two objects that appear, by every visible measure, to be the same type.",
    "After: A deliberate ClassLoader hierarchy ensuring shared types resolve to a single, consistent Class object everywhere they are needed.",
    "This is one of the more genuinely confusing production bugs in Java, precisely because the error message (\"X cannot be cast to X\") looks nonsensical without knowing about ClassLoader identity - understanding this concept turns an hours-long mystery into a five-minute diagnosis.",
    "Default classpath / single ClassLoader (most applications): use it when the vast majority of applications - simple, single-deployment services with one consistent set of dependencies. Avoid it when application servers hosting multiple independent apps, or plugin architectures needing runtime isolation between components.",
    "Custom ClassLoader hierarchies (application servers, OSGi, plugin systems): use it when you need to isolate different components/plugins that might depend on conflicting versions of the same library, loaded and unloaded independently. Avoid it when simple applications - the added complexity of custom ClassLoaders is rarely worth it without a genuine multi-tenant/plugin requirement."
  ],
  commonMistakes: [
    "Assuming a `ClassCastException` between two objects of \"the same class\" must be a typo or a build inconsistency, and spending hours checking the wrong things. The error message shows the same class name on both sides, which looks like it should be impossible - without knowing that a class's true runtime identity includes WHICH ClassLoader loaded it, this specific failure mode is genuinely mystifying to debug from the error message alone. Fix: When you see a same-name ClassCastException, immediately suspect multiple ClassLoaders - check whether the class was loaded from two different JARs/locations in a server, plugin, or dependency-shading context."
  ],
  interviewPerspective: "A common way this gets tested: \"Two ClassLoaders each load the exact same .class file (byte-for-byte identical) for a class named `com.example.Widget`. Are the two resulting `Class<Widget>` objects `==` to each other?\" No - a class's runtime identity is the combination of its fully-qualified name AND its defining ClassLoader. Two different ClassLoaders loading identical bytecode produce two DIFFERENT Class objects, and instances from one cannot be cast to the type from the other.",
  triggerSentence: "A class is not just its name - it is its name PLUS the ClassLoader that loaded it, and that pairing is exactly what parent-first delegation exists to keep consistent."
};
