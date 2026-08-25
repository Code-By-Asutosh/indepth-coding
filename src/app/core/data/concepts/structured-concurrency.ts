import { ConceptContent } from '../../models/content.model';

export const STRUCTURED_CONCURRENCY: ConceptContent = {
  categoryId: "java-core",
  topicId: "java-core",
  conceptId: "structured-concurrency",
  title: "Structured Concurrency",
  topicType: "concept",
  simpleIntuition: "You fire off two parallel calls - fetch the user, fetch their order history - using raw threads or futures. The order history call throws an exception. The user-fetch thread is still running, completely unaware, and nothing tells it to stop.",
  formalMeaning: "Structured concurrency treats a group of related concurrent subtasks as ONE unit that lives and dies together - like a block of code that cannot exit until every thread it spawned has finished, succeeded, or been cancelled.",
  whyItExists: "Manually spawning threads or CompletableFutures for concurrent subtasks makes it easy to lose track of them: if one fails, the others do not automatically know to cancel; if the parent method returns early, orphaned background threads can keep running with no owner; and error handling across several independent async chains is genuinely awkward to get right by hand.",
  howItWorksInternally: [
    "A `StructuredTaskScope` defines a clear block of code where child tasks (each running on its own virtual thread) are forked, and the scope will not exit that block until all children have completed, one way or another.",
    "With `ShutdownOnFailure` (the most common policy), if ANY forked subtask fails, the scope automatically cancels all the OTHER still-running subtasks and propagates the failure - you no longer need to manually track and cancel siblings yourself.",
    "Because every subtask is guaranteed to have finished (successfully, failed, or been cancelled) by the time the scope block exits, there is no possibility of an \"orphaned\" background thread silently outliving the logical operation that spawned it.",
    "This directly fixes the biggest practical danger of raw thread/CompletableFuture-based concurrency: a parent method returning while a child task it spawned is still silently running in the background, with nothing supervising it or handling its eventual result/failure.",
    "Structured concurrency is built specifically to pair with Virtual Threads - since virtual threads are cheap, spawning several per logical operation (e.g. one per parallel downstream call) is completely reasonable, and structured concurrency is what keeps that fan-out safe and supervised."
  ],
  mainComponents: [
    "Unstructured concurrency is like a manager sending three employees out on separate errands with no check-in system - if one calls in sick, the other two keep going independently, and nobody is really \"in charge\" of the whole errand as a unit. Structured concurrency is like a manager who says \"we all leave together, and if any one of you calls in with a problem, everyone else stops immediately too\" - the whole group succeeds or fails as one unit, with a single person accountable for all of them."
  ],
  realWorldExamples: [
    "An endpoint that needs to call both a user service and an order-history service in parallel and combine the results - if either call fails, you want the other cancelled immediately, not silently continuing to burn resources.",
    "A \"fan-out to N downstream services, wait for all, combine results\" pattern - exactly the shape structured concurrency was designed to make safe by default instead of something you have to carefully hand-build with CompletableFuture.allOf() plus manual cancellation logic.",
    "Interview question: \"What real problem does structured concurrency solve that CompletableFuture does not?\" - automatic propagation of cancellation/failure across sibling subtasks, and a guarantee that no subtask can outlive its parent scope."
  ],
  complexityAndTradeoffs: [
    "Before: A failed subtask leaves its sibling subtasks running independently, with no automatic cancellation.",
    "After: A failed subtask automatically cancels every sibling in the same logical operation, guaranteed by the scope.",
    "This eliminates an entire class of \"orphaned background work\" bugs that are notoriously hard to notice in testing and only show up as mysterious resource usage in production.",
    "StructuredTaskScope (structured concurrency): use it when fanning out a fixed, known set of related concurrent subtasks that logically belong together and should succeed/fail/cancel as one unit. Avoid it when you're an independent, long-running background task genuinely meant to outlive its creator (e.g. a scheduled job) - structured concurrency's whole model assumes the children are scoped to the parent's lifetime.",
    "CompletableFuture composition: use it when complex, non-uniform async pipelines with chained transformations (thenApply/thenCompose) rather than a simple \"run these N things together\" shape. Avoid it when simple fan-out/fan-in of a known set of subtasks - structured concurrency expresses that shape more safely and directly."
  ],
  commonMistakes: [
    "Forking background work inside a StructuredTaskScope purely for \"fire and forget\" side effects, expecting it to keep running after the scope block exits. Structured concurrency deliberately guarantees the OPPOSITE - nothing forked inside a scope can outlive that scope's block. Code relying on a forked task continuing after the enclosing try-block ends is relying on behavior structured concurrency is specifically designed to prevent. Fix: For genuinely independent, longer-lived background work, use a separate, explicitly managed executor/thread - do not fork it inside a structured scope meant to close when the logical operation completes."
  ],
  interviewPerspective: "A common way this gets tested: \"Inside a `StructuredTaskScope.ShutdownOnFailure()`, one of two forked subtasks throws an exception. What happens to the OTHER subtask, and do you need to write any code to make that happen?\" The other subtask is automatically cancelled by the scope's ShutdownOnFailure policy - no manual cancellation code is required; this automatic propagation is the entire point of the policy.",
  triggerSentence: "Structured concurrency makes a group of related tasks behave like one unit - they succeed together, fail together, and none can outlive the block that spawned them."
};
