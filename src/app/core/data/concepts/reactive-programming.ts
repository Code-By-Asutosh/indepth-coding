import { ConceptContent } from '../../models/content.model';

export const REACTIVE_PROGRAMMING: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "reactive-programming",
  title: "Reactive Programming",
  topicType: "framework",
  simpleIntuition: "A service needs to handle 50,000 simultaneous slow, long lived connections, think chat, live sports scores, stock tickers. A traditional one thread per request server would need 50,000 threads sitting there, most of them just waiting. That does not scale.",
  formalMeaning: "Reactive programming describes work as a stream of events over time, and processes it with a small, fixed number of threads that are never blocked waiting, letting one thread juggle thousands of in flight operations instead of one thread getting stuck per operation.",
  whyItExists: "The traditional model, one thread blocked per in flight request, works fine at modest scale but falls apart under a huge number of concurrent, mostly idle connections, since threads are relatively expensive, memory hungry operating system resources, and you simply cannot spin up tens of thousands of them.",
  howItWorksInternally: [
    "Reactive Streams is the underlying specification (Publisher, Subscriber, Subscription, Processor) that Project Reactor, the library behind Spring WebFlux, implements, along with RxJava and other reactive libraries.",
    "Mono<T> represents a stream of zero or one result. Flux<T> represents a stream of zero to many results, arriving over time. Both are declarative, lazy pipelines, nothing actually runs until something subscribes to them.",
    "Operators like map, filter, flatMap chain together to describe a processing pipeline, but the ACTUAL work only happens when a subscriber attaches and starts pulling or receiving events, driven by backpressure, the subscriber signaling how much data it is actually ready to handle right now.",
    "Backpressure is the mechanism that prevents a slow consumer from being overwhelmed by a fast producer, the consumer can explicitly request \"give me 10 more items\" rather than being flooded with everything at once.",
    "Spring WebFlux runs on a small, fixed size event loop (by default, roughly one thread per CPU core), instead of Spring MVC's traditional one thread per request model, which is exactly what lets it handle a huge number of concurrent connections without a huge number of threads.",
    "The catch: reactive code requires the ENTIRE call chain, controller, service, repository, all the way down to the database driver, to be genuinely non blocking. A single blocking call (a traditional JDBC call, for instance) anywhere in that chain can stall one of the few precious event loop threads and hurt the throughput of every other in flight request sharing that thread."
  ],
  diagrams: [
    {
      mermaid: "flowchart TB\n  subgraph Traditional[\"Traditional (one thread per request)\"]\n    T1[\"Thread 1: blocked waiting\"] --- T2[\"Thread 2: blocked waiting\"] --- T3[\"Thread N: blocked waiting\"]\n  end\n  subgraph Reactive[\"Reactive (few threads, many in-flight tasks)\"]\n    E1[\"Event loop thread\"] -->|\"juggles\"| Task1[\"Task A\"]\n    E1 -->|\"juggles\"| Task2[\"Task B\"]\n    E1 -->|\"juggles\"| Task3[\"Task C ... thousands more\"]\n  end",
      caption: "Traditional servers dedicate one blocked thread per in-flight request. Reactive servers juggle thousands of tasks on a handful of never-blocked threads."
    }
  ],
  mainComponents: [
    "It is like a single, extremely efficient chef who never idly stands at one stove waiting for water to boil. Instead, they start water boiling on ten different stoves, and jump to whichever one is actually ready for the next step, the moment it is ready, rather than dedicating one full time cook to babysit each individual stove."
  ],
  realWorldExamples: [
    "A real time notification service handling tens of thousands of long lived WebSocket connections, using Spring WebFlux specifically because a thread per connection model would exhaust available threads long before it exhausted actual traffic capacity.",
    "A team switching an endpoint to WebFlux for scalability, then accidentally calling a traditional blocking JDBC repository from inside it, silently destroying most of the benefit because that one blocking call stalls a shared event loop thread.",
    "Interview question: \"Why does reactive programming scale better for many concurrent connections than a traditional thread per request model?\" Because threads are a limited, relatively expensive resource, and reactive programming lets a small, fixed number of threads handle a huge number of concurrent, mostly idle operations instead of dedicating one blocked thread to each one."
  ],
  complexityAndTradeoffs: [
    "Before: A thread per request model exhausts available threads long before it exhausts real traffic capacity, under a large number of concurrent, mostly idle connections.",
    "After: A small, fixed number of threads juggle a much larger number of concurrent in flight operations, scaling to far more simultaneous connections with the same hardware.",
    "Reactive architectures are specifically chosen for workloads dominated by a huge number of concurrent, long lived, mostly idle connections, where thread count, not raw CPU, is the real bottleneck.",
    "Reactive (Spring WebFlux, Project Reactor): use it when a huge number of concurrent, long lived, mostly I/O idle connections, like streaming, chat, or real time dashboards. Avoid it when typical CRUD applications with modest concurrent load, where the added complexity of fully non blocking code end to end is not worth the benefit.",
    "Virtual threads with traditional blocking code: use it when the same high concurrency, I/O bound scalability goal, but wanting to keep the simplicity of plain, straightforward blocking code. Avoid it when extremely latency sensitive streaming scenarios genuinely needing fine grained backpressure control, which virtual threads alone do not provide.",
    "Traditional thread per request (Spring MVC): use it when most everyday applications with moderate concurrency, where simplicity and easier debugging outweigh maximum scalability. Avoid it when workloads genuinely bottlenecked by the number of concurrent connections rather than CPU or memory."
  ],
  commonMistakes: [
    "Introducing a single traditional blocking call, like plain JDBC, a blocking HTTP client, or Thread.sleep(), somewhere inside an otherwise reactive pipeline. Reactive's entire performance advantage depends on the event loop threads never blocking. Even one blocking call anywhere in the chain ties up a shared thread for its full duration, degrading throughput for every other concurrent request sharing that same small thread pool, not just the one that made the blocking call. Fix: Ensure every step in a reactive chain, from the web layer down to the database driver, is genuinely non blocking, or explicitly offload the one blocking call to a separate, dedicated thread pool using something like Schedulers.boundedElastic()."
  ],
  interviewPerspective: "A common way this gets tested: \"A reactive Spring WebFlux endpoint calls a single traditional, blocking JDBC repository method inside its pipeline. What happens to overall throughput?\" It degrades significantly, not just for that one request. The blocking call ties up one of the small, fixed number of event loop threads for its entire duration, and since those same few threads are shared across all concurrent requests, every other in flight request competing for that thread pool suffers too.",
  triggerSentence: "Reactive programming trades a huge number of cheap idle threads for a tiny number of threads that must never, ever block."
};
