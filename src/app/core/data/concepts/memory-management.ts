import { ConceptContent } from '../../models/content.model';

export const MEMORY_MANAGEMENT: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "memory-management",
  title: "Memory Management",
  topicType: "runtime-internals",
  simpleIntuition: "You never call `free()` or `delete` in Java, yet your production service still crashes with OutOfMemoryError. If Java manages memory for you, how did it run out?",
  formalMeaning: "Java doesn't free memory when you're done with an object - it frees memory when NOTHING can reach that object anymore.",
  whyItExists: "Automatic memory management removes ONE class of bugs (manually forgetting to free memory) but replaces it with a subtler one: accidentally keeping a reference alive longer than you meant to. The garbage collector is honest and mechanical - it only frees what is truly unreachable. If your code still holds a reference, it will never be freed, no matter how obviously \"done\" that object is to a human reading the code.",
  howItWorksInternally: [
    "The Heap is split (conceptually) into generations: Young Generation (Eden + two Survivor spaces) for new objects, and Old Generation for objects that have survived several collections.",
    "Nearly every object is born in Eden. Most objects die young (classic request-scoped objects), so Minor GC on Eden is fast and frequent.",
    "An object that survives a few Minor GCs gets \"promoted\" to the Old Generation, which is collected less often but with a more expensive Major/Full GC.",
    "\"Reachability\" is computed from a set of GC Roots - local variables on any thread's stack, static fields, and a few JVM-internal references. Anything reachable by following references from a GC Root is alive; everything else is garbage, no matter how recently it was used.",
    "The Stack (one per thread) holds primitive locals and object references, not objects themselves - objects always live on the Heap. When a method returns, its stack frame (and the references on it) disappear immediately, which is often what finally makes an object unreachable.",
    "Metaspace holds class metadata (not your objects) - dynamically generated classes (common in some frameworks/proxies) that are never unloaded are a completely separate leak from an object leak on the Heap."
  ],
  diagrams: [
    {
      mermaid: "flowchart LR\n  subgraph Young[\"Young Generation\"]\n    Eden --> S0[\"Survivor 0\"]\n    S0 --> S1[\"Survivor 1\"]\n  end\n  S1 -->|\"survives a few GCs\"| Old[\"Old Generation\"]\n  Old -->|\"Major/Full GC\"| Old",
      caption: "Almost every object is born in Eden; only the long-lived ones ever make it to Old Generation."
    }
  ],
  mainComponents: [
    "It's like a library that never throws away a book as long as even one person still has a library card checked out against it - even if that person forgot they ever borrowed it. The librarian (garbage collector) isn't reading your mind about whether you're \"really\" still using the book; they only check whether any card is still linked to it."
  ],
  realWorldExamples: [
    "A long-lived static Map used as a manual \"cache\" that nothing ever removes entries from - the classic, most common real-world Java memory leak.",
    "Listener/observer registration (e.g. adding \"this\" to a global event bus in a constructor) without ever unregistering - every listener keeps its whole object graph alive.",
    "Interview question: \"If Java has a garbage collector, how can Java code still have a memory leak?\" - because reachable-but-unused is still reachable."
  ],
  complexityAndTradeoffs: [
    "Before: Heap usage climbs steadily over days until an OutOfMemoryError forces a restart.",
    "After: Heap usage plateaus at a predictable ceiling regardless of how long the service runs.",
    "Bounded caches with eviction typically turn a \"restart every 3 days\" production workaround into a service that runs for months uninterrupted.",
    "Bounded cache library (Caffeine, Guava Cache): use it when you genuinely want to keep recently-used data in memory for performance, with automatic eviction. Avoid it when you need the data to survive a restart or be shared across instances - that's a job for Redis, not an in-process cache.",
    "WeakReference / WeakHashMap: use it when you want the JVM itself to decide when an entry can be reclaimed, tied to whether anything ELSE still references the key. Avoid it when you need predictable eviction timing - weak references are collected whenever GC happens to run, not on a schedule.",
    "Explicit manual removal (unregister/remove calls): use it when simple, short-lived registrations where you fully control both the add and remove call-sites. Avoid it when anything registered from many different places - it is too easy to add a new registration path and forget to add the matching removal."
  ],
  commonMistakes: [
    "Registering \"this\" as a listener on a long-lived object (event bus, static list) from inside a constructor, and never unregistering. It looks completely normal - most tutorials show this exact pattern for wiring up event handling, and it works perfectly in every manual test because the process is short-lived enough that the leak never becomes visible. Fix: Pair every registration with a corresponding unregister call in a well-defined lifecycle hook (e.g. a `close()`/`@PreDestroy` method), or use weak listener references so the registration itself does not keep the object alive."
  ],
  interviewPerspective: "A common way this gets tested: \"A local variable holding a 1GB byte array goes out of scope at the end of a method, but the array is NOT collected for several more seconds. Is this a memory leak?\" Not necessarily - the array becomes unreachable the moment the method returns, but the garbage collector runs on its own schedule (not the instant something becomes unreachable). A delay before collection is normal; it's only a leak if something is still reachable and holding a reference (e.g. it's stuck on another thread's stack, or referenced from a static field).",
  triggerSentence: "Java doesn't leak memory on its own - your code leaks memory by accidentally keeping a reference alive."
};
