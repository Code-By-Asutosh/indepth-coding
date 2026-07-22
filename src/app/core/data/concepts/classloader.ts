import { ConceptContent } from '../../models/content.model';

export const CLASSLOADER: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'classloader',
  title: 'ClassLoader',

  hook:
    'You write your own class named `String` (yes, really, in package `java.lang`... except the JVM refuses to even let ' +
    'you put it there) to see if the JVM will accidentally run your version instead of the real one. It never does — no ' +
    'matter what you try. What is silently protecting `java.lang.String` from being hijacked?',

  problem:
    "A production server might load classes from your application JAR, from ten different library JARs, from a plugin " +
    "loaded dynamically at runtime, and from the JDK itself — all at once. Without a disciplined system for deciding " +
    "which class definition wins when names might collide, and for isolating plugins from each other, this would be chaos.",

  aha: {
    statement: 'ClassLoaders form a hierarchy that ALWAYS asks its parent to load a class first before trying itself — this "parent-first delegation" is exactly what stops your own accidental `java.lang.String` from ever hijacking the real one.',
    analogy:
      "Think of it like a strict corporate approval chain: before doing anything yourself, you must first ask your " +
      "manager if THEY can handle it, who asks THEIR manager, all the way up to the CEO. The CEO (Bootstrap ClassLoader) " +
      "gets first refusal on everything foundational (java.lang.*) — by the time a request trickles back down to you, " +
      "the most senior person who could handle it already has, so a junior employee's attempt to redefine String never even gets a chance."
  },

  underTheHood: [
    'Bootstrap ClassLoader: written in native code (not Java itself), loads the core JDK classes (java.lang.*, java.util.*) from the JDK\'s own modules — this is the "CEO" at the top with absolute first authority.',
    'Platform ClassLoader (formerly "Extension"): loads certain platform-specific JDK modules that are not part of the absolute core.',
    'Application ClassLoader (aka "System"): loads your application\'s own classes and its dependency JARs from the classpath — this is what loads YOUR code by default.',
    'Delegation model: when asked to load a class, a ClassLoader FIRST delegates to its parent, and only attempts to load it itself if the parent cannot find it — this is exactly why you cannot accidentally shadow java.lang.String with your own class of the same name; the Bootstrap loader (parent of everyone) already satisfies that request first.',
    'A class is uniquely identified at runtime by the COMBINATION of its fully-qualified name AND the ClassLoader that loaded it — the exact same .class file loaded by two DIFFERENT ClassLoaders produces two genuinely different, mutually-incompatible Class objects (a classic source of confusing `ClassCastException: X cannot be cast to X` errors).',
    'Application servers and plugin systems (Tomcat, OSGi) use custom ClassLoader hierarchies specifically to isolate different applications/plugins from each other — each can have its own version of the same library, loaded by its own ClassLoader, without conflicting with any other.'
  ],

  inTheWild: [
    'A baffling `ClassCastException: com.example.Foo cannot be cast to com.example.Foo` — the exact same class name, but loaded by two different ClassLoaders (e.g. once by a web app\'s loader, once by a shared/parent loader), making them incompatible types at runtime despite identical source code.',
    'An application server (like Tomcat) giving each deployed web application its own ClassLoader, so two apps on the same server can depend on two different, conflicting versions of the same library without interfering with each other.',
    'Interview question: "Why can\'t you override java.lang.String with your own class of the same name?" — parent-first delegation means the Bootstrap ClassLoader always resolves core JDK classes before any application-level ClassLoader gets a chance to try.'
  ],

  showMe: {
    caption: 'Conceptual illustration: two different ClassLoaders producing "the same" class as genuinely incompatible types.',
    bad: {
      language: 'java',
      code:
        '// Conceptual: Plugin A and Plugin B both bundle their OWN copy of the same\n' +
        '// "Utils" class, each loaded by a separate, isolated PluginClassLoader.\n' +
        'Object utilsFromPluginA = pluginAClassLoader.loadClass("com.shared.Utils").newInstance();\n' +
        'Object utilsFromPluginB = pluginBClassLoader.loadClass("com.shared.Utils").newInstance();\n\n' +
        '// Even though the source code is IDENTICAL, this fails:\n' +
        'Utils castAttempt = (Utils) utilsFromPluginB; // ClassCastException!',
      explanation:
        'Even with byte-for-byte identical source code, "com.shared.Utils" loaded by pluginAClassLoader and the SAME ' +
        'class loaded by pluginBClassLoader are two DIFFERENT, incompatible Class objects at runtime — a cast between them fails.'
    },
    good: {
      language: 'java',
      code:
        '// Correct plugin architecture: shared types live in a COMMON ClassLoader\n' +
        '// that both plugin loaders delegate to (parent-first), so there\'s only ONE\n' +
        '// "com.shared.Utils" Class object shared safely across every plugin.\n' +
        'ClassLoader sharedLoader = new URLClassLoader(sharedJarUrls, parentLoader);\n' +
        'ClassLoader pluginALoader = new URLClassLoader(pluginAJarUrls, sharedLoader);\n' +
        'ClassLoader pluginBLoader = new URLClassLoader(pluginBJarUrls, sharedLoader);\n' +
        '// Now both plugins delegate "com.shared.Utils" up to the SAME sharedLoader,\n' +
        '// getting the identical, castable Class object.',
      explanation:
        'By placing genuinely shared types in a common parent ClassLoader that both plugin loaders delegate to, every ' +
        'plugin resolves that shared class to the SAME Class object — eliminating the cross-ClassLoader ClassCastException entirely.'
    }
  },

  impact: {
    before: 'A baffling ClassCastException between two objects that appear, by every visible measure, to be the same type.',
    after: 'A deliberate ClassLoader hierarchy ensuring shared types resolve to a single, consistent Class object everywhere they are needed.',
    metric: "This is one of the more genuinely confusing production bugs in Java, precisely because the error message (\"X cannot be cast to X\") looks nonsensical without knowing about ClassLoader identity — understanding this concept turns an hours-long mystery into a five-minute diagnosis."
  },

  alternatives: [
    {
      name: 'Default classpath / single ClassLoader (most applications)',
      whenToUse: 'The vast majority of applications — simple, single-deployment services with one consistent set of dependencies.',
      whenNotToUse: 'Application servers hosting multiple independent apps, or plugin architectures needing runtime isolation between components.'
    },
    {
      name: 'Custom ClassLoader hierarchies (application servers, OSGi, plugin systems)',
      whenToUse: 'You need to isolate different components/plugins that might depend on conflicting versions of the same library, loaded and unloaded independently.',
      whenNotToUse: 'Simple applications — the added complexity of custom ClassLoaders is rarely worth it without a genuine multi-tenant/plugin requirement.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming a `ClassCastException` between two objects of "the same class" must be a typo or a build inconsistency, and spending hours checking the wrong things.',
      why:
        "The error message shows the same class name on both sides, which looks like it should be impossible — without " +
        "knowing that a class's true runtime identity includes WHICH ClassLoader loaded it, this specific failure mode is genuinely mystifying to debug from the error message alone.",
      fix:
        'When you see a same-name ClassCastException, immediately suspect multiple ClassLoaders — check whether the class was loaded from two different JARs/locations in a server, plugin, or dependency-shading context.'
    }
  ],

  proveIt: {
    question:
      'Two ClassLoaders each load the exact same .class file (byte-for-byte identical) for a class named `com.example.Widget`. Are the two resulting `Class<Widget>` objects `==` to each other?',
    answer:
      "No — a class's runtime identity is the combination of its fully-qualified name AND its defining ClassLoader. Two " +
      "different ClassLoaders loading identical bytecode produce two DIFFERENT Class objects, and instances from one cannot be cast to the type from the other."
  },

  oneLiner: 'A class is not just its name — it is its name PLUS the ClassLoader that loaded it, and that pairing is exactly what parent-first delegation exists to keep consistent.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jvm-internals',
      title: 'JVM Internals',
      note: 'The Class Loader Subsystem is one of the core pieces of the JVM introduced at a high level in JVM Internals — this concept is the detailed follow-up.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'module-system-jpms',
      title: 'Module System (JPMS)',
      note: 'The module system adds an additional layer of structure and verification on top of the class-loading and delegation model described here.'
    }
  ]
};
