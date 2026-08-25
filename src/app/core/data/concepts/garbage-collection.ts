import { ConceptContent } from '../../models/content.model';

export const GARBAGE_COLLECTION: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "garbage-collection-serial-parallel-cms-g1-zgc-shenandoah-epsilon",
  title: "Garbage Collection",
  topicType: "runtime-internals",
  simpleIntuition: "Your service freezes for 4 full seconds, seemingly at random, every few minutes - no deploys, no traffic spike, nothing in your code changed. Then it resumes like nothing happened. What just paused your entire application?",
  formalMeaning: "Garbage collectors trade off between pause time, throughput, and memory overhead - no single collector wins at all three.",
  whyItExists: "Garbage collection is not free - reclaiming memory takes real CPU time, and depending on which collector you use, it can mean pausing every single application thread ('stop-the-world') while it works. Pick the wrong collector or leave it on default settings for the wrong workload, and those pauses become your biggest latency problem - one that won't show up in any of your business logic code.",
  howItWorksInternally: [
    "Serial GC: single-threaded, stop-the-world for both young and old generations. Simplest, lowest overhead, but pauses scale with heap size - fine for small heaps/single-core environments (e.g. small CLI tools), terrible for large production heaps.",
    "Parallel GC: like Serial but uses multiple threads to collect, shrinking pause time by parallelizing the work. Optimizes for throughput (total work done), not for minimizing individual pause length - batch jobs love this.",
    "CMS (Concurrent Mark Sweep, deprecated/removed in modern JDKs): did most marking concurrently with the application, reducing pauses, but suffered memory fragmentation over time and was eventually replaced by G1.",
    "G1 (Garbage First, the modern default): splits the heap into many small regions and collects the regions with the most garbage first, giving you a configurable target pause time (-XX:MaxGCPauseMillis) that it tries to meet, instead of a fixed, unpredictable one.",
    "ZGC / Shenandoah: designed for very large heaps (multi-GB to TB) with sub-millisecond pause targets, by doing almost all work concurrently with the application threads, at the cost of somewhat more CPU overhead and memory bookkeeping.",
    "Epsilon: a \"no-op\" collector that never collects anything at all - used to measure the raw allocation cost of an application, or for extremely short-lived processes that will exit before ever needing to collect."
  ],
  mainComponents: [
    "Think of it like cleaning a busy restaurant kitchen. You can (a) stop cooking entirely, deep-clean everything fast, then resume (short total time, but a very noticeable full stop), or (b) have a dedicated cleaner tidy continuously in the background while cooking never stops (no big stoppage, but it costs you a cook's worth of capacity all the time). Different collectors are just different versions of that trade-off."
  ],
  realWorldExamples: [
    "A batch data pipeline that processes millions of records overnight cares about total throughput, not pause time - Parallel GC is often the right, boring, correct choice.",
    "A latency-sensitive trading or checkout API cares intensely about pause time, even at the cost of some throughput - G1 (or ZGC for very large heaps) is the usual choice.",
    "Interview question: \"Your p99 latency has a periodic spike every few minutes that correlates with nothing in your logs\" - this is the single most common root cause, and interviewers use it to see if you think to check GC logs at all."
  ],
  complexityAndTradeoffs: [
    "Before: Unexplained multi-second latency spikes with no clear root cause in application logs.",
    "After: Pause times bounded to a known target, with GC logs available to prove or disprove GC as the cause of any future spike.",
    "Switching a large-heap latency-sensitive service from Parallel to a well-tuned G1/ZGC configuration commonly takes worst-case pauses from multiple seconds down to tens of milliseconds.",
    "Serial GC: use it when very small heaps, single-core environments, short-lived CLI tools where simplicity beats everything. Avoid it when any multi-core production server with a heap larger than a few hundred MB.",
    "Parallel GC: use it when batch/offline jobs where total throughput matters far more than individual pause length. Avoid it when latency-sensitive request/response services - Parallel's pauses scale with heap size and can be seconds long.",
    "G1 GC (modern default): use it when the default sensible choice for most server applications - balances throughput and pause time with a configurable target. Avoid it when extremely large heaps (many tens of GB) where even G1's pauses become too long - consider ZGC/Shenandoah.",
    "ZGC / Shenandoah: use it when very large heaps with strict sub-millisecond to low-single-digit-millisecond pause requirements. Avoid it when small heaps or throughput-first batch workloads - the extra concurrent bookkeeping isn't worth it there."
  ],
  commonMistakes: [
    "Tuning JVM heap flags aggressively without ever looking at an actual GC log first. It feels productive to change -Xmx or switch collectors when latency is bad, but without GC logs you don't even know if GC is the cause - you might spend a week tuning a collector for a problem that is actually a slow downstream database call. Fix: Always enable GC logging (`-Xlog:gc*`) FIRST and confirm GC pauses correlate with the latency spikes in your monitoring before changing any collector settings."
  ],
  interviewPerspective: "A common way this gets tested: \"A service using Parallel GC has an 8-second stop-the-world pause under heavy load. Switching to G1 with the same heap size reduces the worst pause to 150ms. Did you get this improvement \"for free\"?\" No - G1 achieves shorter, more predictable pauses generally at the cost of somewhat lower raw throughput and higher CPU/memory bookkeeping overhead compared to Parallel. You traded some total throughput for predictability, which is usually the right trade for a request/response service, but it is a trade, not a free upgrade.",
  triggerSentence: "Every garbage collector picks a side in the pause-time vs throughput trade-off - the mistake is not knowing which side you need."
};
