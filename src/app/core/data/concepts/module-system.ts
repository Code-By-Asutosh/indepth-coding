import { ConceptContent } from '../../models/content.model';

export const MODULE_SYSTEM: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'module-system-jpms',
  title: 'Module System (JPMS)',

  hook:
    'A library you depend on has an internal `com.example.internal.Helper` class marked `public`. Nothing stops you from ' +
    'importing and using it directly — until the next library update silently removes it, because "public" never meant "supported" to begin with.',

  problem:
    'Before Java 9, `public` was the ONLY real visibility boundary above the package level — if a class was public, ANY ' +
    "other code on the classpath could use it, whether or not the library author ever intended that. This made truly " +
    "hiding internal implementation details across package boundaries impossible, encouraging fragile dependence on things that were never meant to be a stable API.",

  aha: {
    statement: 'A module lets you say "this package is public API, but THIS other package, even though its classes are public, is internal and off-limits to everyone outside my module."',
    analogy:
      "Before modules, a company building had 'public' offices where anyone in the building could walk in, even the ones " +
      "not meant for visitors — a sign on the door was the only thing (a naming convention) telling you not to go in. A " +
      "module is an actual locked door with a keycard system: you explicitly declare which offices ('packages') are " +
      "open to outside visitors ('exports') even though every office inside still has an unlocked door for employees of THAT department."
  },

  underTheHood: [
    'A module is declared with a `module-info.java` file at the root of a module\'s source, naming the module and declaring what it `requires` (dependencies) and what it `exports` (packages visible to other modules).',
    'A class in a NON-exported package, even if declared `public`, is invisible to code outside the module — this is real, compiler-and-runtime-enforced encapsulation, not just a naming convention developers are expected to respect.',
    '`requires` declares a dependency on another module\'s exported API — `requires transitive` additionally passes that dependency along to anyone who depends on YOUR module (so they do not need to redeclare it themselves).',
    'The module system enables reliable configuration: at startup, the JVM verifies the entire module graph (all requires are satisfiable, no conflicting versions) BEFORE running any code — a whole class of "missing dependency discovered at runtime" errors becomes a startup-time failure instead.',
    '`jlink` uses module boundaries to build a custom, minimal JRE containing only the modules your application actually needs — meaningfully shrinking deployment size for containerized/cloud applications compared to shipping a full JRE.',
    'Most existing libraries still ship as the "unnamed module" (plain classpath JARs, not modularized) — JPMS adoption across the ecosystem has been notably slower than the feature itself, which is why many teams still primarily use the classpath rather than full module boundaries in practice.'
  ],

  inTheWild: [
    'A well-designed library exporting only its public API packages (`com.example.api`) while keeping `com.example.internal` completely inaccessible to consumers, even though its classes are technically `public`.',
    '`jlink` being used to build a minimal custom runtime image for a microservice container, shrinking the deployed JRE footprint compared to bundling a full JDK.',
    'Interview question: "How is JPMS encapsulation different from just making a package-private/public decision?" — module boundaries enforce real, compiler-and-runtime-checked hiding ACROSS packages within a module\'s non-exported parts, which plain public/package-private access modifiers alone cannot express.'
  ],

  showMe: {
    caption: 'A library with no module boundary (everything public is truly accessible) vs one exporting only its intended API.',
    bad: {
      language: 'java',
      code:
        '// No module-info.java — classic "unnamed module" / classpath behavior\n' +
        'package com.example.internal;\n' +
        'public class Helper { // public — but nothing stops external code from using it\n' +
        '    public static String doInternalThing() { return "not meant for you"; }\n' +
        '}\n' +
        '// Any consumer can write: com.example.internal.Helper.doInternalThing();',
      explanation:
        'Marking a class `public` is the ONLY boundary available on the classpath — there is no way to say "public, but ' +
        'only within my own library" without the module system, so truly internal classes remain fully accessible to anyone.'
    },
    good: {
      language: 'java',
      code:
        '// module-info.java\n' +
        'module com.example.mylib {\n' +
        '    exports com.example.api;    // consumers CAN use this package\n' +
        '    // com.example.internal is NOT exported — invisible outside this module,\n' +
        '    // even though Helper inside it is still declared public\n' +
        '}',
      explanation:
        'Consumers of this module simply cannot compile or run code referencing `com.example.internal.Helper` at all — ' +
        'the module system enforces the "public API vs internal detail" boundary the author actually intended, not just a naming convention.'
    }
  },

  impact: {
    before: 'Any public class anywhere in a library is fair game for external code to depend on, whether intended as API or not.',
    after: 'Only explicitly exported packages are usable by consumers — internal implementation details are genuinely hidden.',
    metric: 'This directly reduces the risk of "we changed an internal class and broke someone\'s production build," a real, common source of breaking changes in unmodularized Java libraries.'
  },

  alternatives: [
    {
      name: 'Full JPMS modules (module-info.java)',
      whenToUse: "Libraries/applications that want real, enforced API boundaries and/or want to use jlink for minimal custom runtime images.",
      whenNotToUse: 'Small applications/scripts where the ecosystem-adoption friction (many dependencies still unmodularized) outweighs the benefit.'
    },
    {
      name: 'Classic classpath ("unnamed module")',
      whenToUse: 'The overwhelmingly common default today — most of the Java ecosystem, including many popular frameworks, still primarily targets the classpath.',
      whenNotToUse: "You specifically need enforced internal-package encapsulation or a minimal custom runtime image — those genuinely require real modules."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming adding a `module-info.java` to an existing large project with many classpath dependencies will be a quick, drop-in change.',
      why:
        "Many popular libraries are still unmodularized or only partially modularized (the 'automatic module' mechanism " +
        "papers over this, but imperfectly) — retrofitting a real module system onto an existing dependency graph often " +
        "surfaces split packages, missing 'requires' declarations, and reflection-based frameworks (like some ORMs) that assume classpath-style unrestricted access.",
      fix:
        'Adopt JPMS incrementally, expect friction with reflection-heavy frameworks, and budget real time for dependency compatibility issues rather than treating it as a one-line change.'
    }
  ],

  proveIt: {
    question:
      'A class in package `com.example.internal` is declared `public`, but that package is NOT listed in the module\'s `exports` clause. Can code in a different module call that class\'s public methods?',
    answer:
      'No — without an `exports` declaration for that package, the class is invisible outside its own module regardless ' +
      'of its `public` access modifier; this is the entire point of JPMS strong encapsulation, going beyond what plain access modifiers alone can express.'
  },

  oneLiner: '`public` used to be the strongest boundary Java had — the module system finally lets you say "public, but only inside my own walls."',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'classloader',
      title: 'ClassLoader',
      note: 'The module system layers additional structure and verification on top of the class-loading process described in ClassLoader.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'reflection',
      title: 'Reflection',
      note: 'JPMS strong encapsulation directly restricts what reflection can access across module boundaries (e.g. setAccessible(true) can now fail) — a major, sometimes surprising interaction between the two features.'
    }
  ]
};
