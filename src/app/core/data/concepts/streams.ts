import { ConceptContent } from '../../models/content.model';

export const STREAMS: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "streams",
  title: "Streams",
  topicType: "concept",
  simpleIntuition: "You write a beautiful, chained stream pipeline - filter, map, sorted, collect - and set a breakpoint inside the `filter()` lambda to debug it. The breakpoint never hits, even though you clearly call `.filter(...)` right there in the code. Did the stream just skip your logic?",
  formalMeaning: "A stream pipeline is a recipe, not a cake - nothing actually happens until a terminal operation \"orders\" the whole pipeline to run.",
  whyItExists: "Streams look like a sequence of operations executing top to bottom, but they are actually a LAZY, declarative description of a pipeline that does nothing at all until a terminal operation is invoked. Misunderstanding this laziness leads to real bugs: streams that appear to do nothing, streams reused a second time that mysteriously throw an exception, and confusion about when side effects inside a lambda actually run.",
  howItWorksInternally: [
    "Stream operations are either intermediate (filter, map, sorted, distinct - return a new Stream, are LAZY) or terminal (collect, forEach, reduce, count - trigger actual execution and produce a non-stream result).",
    "Nothing runs until a terminal operation is called - calling `.filter(...)` alone just builds up a description of the pipeline; the lambda inside filter never executes at that point.",
    "When a terminal operation IS called, the stream processes elements one at a time through the ENTIRE pipeline (filter, then map, then whatever's next) before moving to the next element - not \"filter everything, then map everything.\"",
    "A stream can only be consumed ONCE - calling a terminal operation \"closes\" it; trying to reuse the same stream object throws IllegalStateException, because a stream models a single pass over data, not a reusable collection.",
    "parallelStream() splits the source data across the ForkJoinPool's common pool and processes chunks concurrently - this only pays off for CPU-intensive work on large datasets; for small collections or I/O-bound work, the coordination overhead usually makes it SLOWER than a sequential stream.",
    "Short-circuiting operations (findFirst, anyMatch, limit) can stop processing early without walking the entire source - this is why `.filter(...).findFirst()` on an infinite stream can still terminate."
  ],
  mainComponents: [
    "It's like writing out a recipe card (filter these, then chop those, then bake) and handing it to a chef - writing the card itself doesn't cook anything. Only when someone says \"now go cook it\" (a terminal operation like collect() or forEach()) does the chef actually walk through every step, and only then, in one pass per ingredient."
  ],
  realWorldExamples: [
    "A stream pipeline built with `.filter(...)` but no terminal operation call afterward - the filter lambda genuinely never runs, and this is a very common beginner \"why isn't my log statement printing\" bug.",
    "Code that tries to iterate the same Stream object twice (e.g. once to check .count() and again to .collect()) and crashes with IllegalStateException at the second use.",
    "Interview question: \"Are streams lazy or eager, and why does that matter?\" - being able to explain that intermediate operations build a pipeline description while only a terminal operation executes it is what separates surface familiarity from real understanding."
  ],
  complexityAndTradeoffs: [
    "Before: A \"silently does nothing\" pipeline that looks correct in code review and produces no error.",
    "After: The pipeline correctly executes and returns the filtered/transformed result.",
    "This specific mistake is one of the most common Streams-related questions on forums precisely because the code compiles fine and throws no exception - it just quietly does nothing.",
    "Sequential stream (stream()): use it when the default choice for almost all collection processing - predictable, single-threaded, no coordination overhead. Avoid it when genuinely large datasets with CPU-heavy per-element work where parallelism would meaningfully help.",
    "Parallel stream (parallelStream()): use it when large collections (tens of thousands+ elements) with CPU-intensive per-element computation, where the source splits evenly. Avoid it when small collections, I/O-bound work, or anything relying on encounter order - the coordination overhead usually makes it slower, not faster, for these cases.",
    "Classic for-loop: use it when complex control flow (multiple early exits, mutating several external variables) that a stream pipeline would express awkwardly. Avoid it when standard filter/map/reduce transformations - a stream communicates that intent more directly."
  ],
  commonMistakes: [
    "Reaching for `parallelStream()` by default, assuming \"parallel\" always means \"faster.\" parallelStream() uses the shared, application-wide ForkJoinPool.commonPool() - for small collections, the cost of splitting work and coordinating threads is often larger than the work itself, making it slower than a plain stream() AND it can starve other unrelated parallel streams/CompletableFutures elsewhere in the app that share that same common pool. Fix: Default to stream() (sequential). Only switch to parallelStream() after profiling shows a genuinely large, CPU-bound workload where it measurably helps - and be aware it shares a pool with everything else in the JVM using the default ForkJoinPool."
  ],
  interviewPerspective: "A common way this gets tested: \"You call `.collect(Collectors.toList())` on a stream, then immediately try to call `.forEach(...)` on that SAME stream variable again. What happens, and why?\" It throws IllegalStateException (\"stream has already been operated upon or closed\") - a stream models a single pass over its source and cannot be reused after a terminal operation has consumed it; you would need to create a new stream from the source collection instead.",
  triggerSentence: "A stream does nothing until you tell it to actually run - intermediate operations describe, only a terminal operation executes."
};
