import { ConceptContent } from '../../models/content.model';

export const GARBAGE_COLLECTION: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'garbage-collection-serial-parallel-cms-g1-zgc-shenandoah-epsilon',
  title: 'Garbage Collection',

  hook:
    'Your service freezes for 4 full seconds, seemingly at random, every few minutes - no deploys, no traffic spike, ' +
    'nothing in your code changed. Then it resumes like nothing happened. What just paused your entire application?',

  problem:
    'Garbage collection is not free - reclaiming memory takes real CPU time, and depending on which collector you use, ' +
    "it can mean pausing every single application thread ('stop-the-world') while it works. Pick the wrong collector or " +
    "leave it on default settings for the wrong workload, and those pauses become your biggest latency problem - one that " +
    "won't show up in any of your business logic code.",

  aha: {
    statement: 'Garbage collectors trade off between pause time, throughput, and memory overhead - no single collector wins at all three.',
    analogy:
      'Think of it like cleaning a busy restaurant kitchen. You can (a) stop cooking entirely, deep-clean everything fast, ' +
      'then resume (short total time, but a very noticeable full stop), or (b) have a dedicated cleaner tidy continuously ' +
      "in the background while cooking never stops (no big stoppage, but it costs you a cook's worth of capacity all the time). " +
      'Different collectors are just different versions of that trade-off.'
  },

  underTheHood: [
    'Serial GC: single-threaded, stop-the-world for both young and old generations. Simplest, lowest overhead, but pauses scale with heap size - fine for small heaps/single-core environments (e.g. small CLI tools), terrible for large production heaps.',
    'Parallel GC: like Serial but uses multiple threads to collect, shrinking pause time by parallelizing the work. Optimizes for throughput (total work done), not for minimizing individual pause length - batch jobs love this.',
    'CMS (Concurrent Mark Sweep, deprecated/removed in modern JDKs): did most marking concurrently with the application, reducing pauses, but suffered memory fragmentation over time and was eventually replaced by G1.',
    'G1 (Garbage First, the modern default): splits the heap into many small regions and collects the regions with the most garbage first, giving you a configurable target pause time (-XX:MaxGCPauseMillis) that it tries to meet, instead of a fixed, unpredictable one.',
    'ZGC / Shenandoah: designed for very large heaps (multi-GB to TB) with sub-millisecond pause targets, by doing almost all work concurrently with the application threads, at the cost of somewhat more CPU overhead and memory bookkeeping.',
    'Epsilon: a "no-op" collector that never collects anything at all - used to measure the raw allocation cost of an application, or for extremely short-lived processes that will exit before ever needing to collect.'
  ],

  inTheWild: [
    'A batch data pipeline that processes millions of records overnight cares about total throughput, not pause time - Parallel GC is often the right, boring, correct choice.',
    'A latency-sensitive trading or checkout API cares intensely about pause time, even at the cost of some throughput - G1 (or ZGC for very large heaps) is the usual choice.',
    'Interview question: "Your p99 latency has a periodic spike every few minutes that correlates with nothing in your logs" - this is the single most common root cause, and interviewers use it to see if you think to check GC logs at all.'
  ],

  showMe: {
    caption: 'Leaving GC on default vs explicitly choosing a collector and pause target for a latency-sensitive service.',
    bad: {
      language: 'bash',
      code:
        '# No GC choice made - relies entirely on JVM defaults, which vary by heap size and JDK version\n' +
        'java -Xmx8g -jar checkout-service.jar',
      explanation:
        'For an 8GB heap, whatever the default collector picks may not match your actual goal (low pause vs high throughput) ' +
        '- you are letting an implicit default decide a decision that should be explicit for a latency-sensitive service.'
    },
    good: {
      language: 'bash',
      code:
        '# Explicit: G1, with an explicit pause-time GOAL (not a guarantee, but a strong hint)\n' +
        'java -Xmx8g -XX:+UseG1GC -XX:MaxGCPauseMillis=100 \\\n' +
        '     -Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=50m \\\n' +
        '     -jar checkout-service.jar',
      explanation:
        'Explicitly choosing G1 with a 100ms pause target makes the trade-off intentional, and enabling GC logging means ' +
        "the next time there's a latency spike, you have the data to confirm or rule out GC as the cause in minutes, not days."
    }
  },

  impact: {
    before: 'Unexplained multi-second latency spikes with no clear root cause in application logs.',
    after: 'Pause times bounded to a known target, with GC logs available to prove or disprove GC as the cause of any future spike.',
    metric: 'Switching a large-heap latency-sensitive service from Parallel to a well-tuned G1/ZGC configuration commonly takes worst-case pauses from multiple seconds down to tens of milliseconds.'
  },

  alternatives: [
    {
      name: 'Serial GC',
      whenToUse: 'Very small heaps, single-core environments, short-lived CLI tools where simplicity beats everything.',
      whenNotToUse: 'Any multi-core production server with a heap larger than a few hundred MB.'
    },
    {
      name: 'Parallel GC',
      whenToUse: 'Batch/offline jobs where total throughput matters far more than individual pause length.',
      whenNotToUse: "Latency-sensitive request/response services - Parallel's pauses scale with heap size and can be seconds long."
    },
    {
      name: 'G1 GC (modern default)',
      whenToUse: 'The default sensible choice for most server applications - balances throughput and pause time with a configurable target.',
      whenNotToUse: 'Extremely large heaps (many tens of GB) where even G1\'s pauses become too long - consider ZGC/Shenandoah.'
    },
    {
      name: 'ZGC / Shenandoah',
      whenToUse: 'Very large heaps with strict sub-millisecond to low-single-digit-millisecond pause requirements.',
      whenNotToUse: "Small heaps or throughput-first batch workloads - the extra concurrent bookkeeping isn't worth it there."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Tuning JVM heap flags aggressively without ever looking at an actual GC log first.',
      why:
        "It feels productive to change -Xmx or switch collectors when latency is bad, but without GC logs you don't even " +
        'know if GC is the cause - you might spend a week tuning a collector for a problem that is actually a slow downstream ' +
        'database call.',
      fix:
        'Always enable GC logging (`-Xlog:gc*`) FIRST and confirm GC pauses correlate with the latency spikes in your ' +
        'monitoring before changing any collector settings.'
    }
  ],

  proveIt: {
    question:
      'A service using Parallel GC has an 8-second stop-the-world pause under heavy load. Switching to G1 with the same ' +
      'heap size reduces the worst pause to 150ms. Did you get this improvement "for free"?',
    answer:
      'No - G1 achieves shorter, more predictable pauses generally at the cost of somewhat lower raw throughput and higher ' +
      'CPU/memory bookkeeping overhead compared to Parallel. You traded some total throughput for predictability, which is ' +
      'usually the right trade for a request/response service, but it is a trade, not a free upgrade.'
  },

  oneLiner: 'Every garbage collector picks a side in the pause-time vs throughput trade-off - the mistake is not knowing which side you need.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'memory-management',
      title: 'Memory Management',
      note: 'Memory Management explains WHAT gets collected (reachability); this concept explains HOW and WHEN it gets collected, and at what pause cost.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'jvm-internals',
      title: 'JVM Internals',
      note: 'The generational heap layout (Eden, Survivor, Old Gen) referenced here is defined as part of the JVM\'s runtime data areas.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'performance-optimization',
      title: 'Performance Optimization',
      note: 'GC tuning is one specific, high-leverage lever inside the broader discipline of JVM performance optimization.'
    }
  ]
};
