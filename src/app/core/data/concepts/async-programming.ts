import { ConceptContent } from '../../models/content.model';

export const ASYNC_PROGRAMMING: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "async-programming",
  title: "Async Programming",
  topicType: "framework",
  simpleIntuition: "A request comes in that needs to send a confirmation email. Sending that email takes 800 milliseconds because of a slow third party mail provider. Does the user really need to sit there watching a spinner for 800 milliseconds just to see \"Order placed\"?",
  formalMeaning: "Async programming lets a piece of work run on a separate thread, returning control to the caller immediately, so slow, non essential work does not block the response the user actually cares about.",
  whyItExists: "Some work inside a request does not need to finish before you respond to the user, it just needs to happen eventually. Forcing every single step to run one after another, blocking the response until the slowest, least important step finishes, wastes the user's time for no real benefit.",
  howItWorksInternally: [
    "@EnableAsync plus @Async on a method tells Spring to run that method on a separate thread pool, returning control to the caller immediately rather than blocking until it completes.",
    "An @Async method returning void is genuinely fire and forget, the caller has no way to know if or when it finished, or whether it threw an exception. Returning a CompletableFuture<T> instead lets the caller attach a callback for when the result IS eventually needed, without blocking to wait for it right away.",
    "Like @Scheduled, @Async methods run on a configurable thread pool. Without an explicit executor configured, Spring falls back to a default pool that is often not sized appropriately for real production load, a lurking source of \"Async is not actually faster\" complaints.",
    "Calling an @Async method from WITHIN the same class it is defined in does not actually go through the proxy, and runs synchronously on the calling thread instead, the exact same self invocation trap that affects @Transactional.",
    "Exceptions thrown inside an @Async void method are swallowed silently by default unless an AsyncUncaughtExceptionHandler is explicitly configured, meaning a failing background task can fail completely invisibly.",
    "Virtual threads (Project Loom) change some of this calculus: for I/O bound work specifically, a virtual thread per task can make plain, simple blocking code scale nearly as well as complex async code, without the same self invocation and error handling pitfalls."
  ],
  mainComponents: [
    "It is like a waiter handing your order to the kitchen and immediately moving on to the next table, instead of standing at the kitchen window watching the food cook before doing anything else. The waiter (your main thread) stays free to keep serving other tables while the kitchen (a background thread) does its work."
  ],
  realWorldExamples: [
    "An order confirmation endpoint responding to the user immediately after saving the order, while a separate @Async method sends the confirmation email in the background, unrelated to how fast the user gets their response.",
    "A production incident where a background @Async task had been silently failing for weeks, because its exception was swallowed with no logging, no alert, nothing, until someone noticed confirmation emails had simply stopped arriving.",
    "Interview question: \"Why does calling an @Async method from another method in the same class not actually run it asynchronously?\" Because Spring's @Async, like @Transactional, relies on a proxy wrapping the bean, and a same class call bypasses that proxy entirely."
  ],
  complexityAndTradeoffs: [
    "Before: The response time for every request is bottlenecked by the slowest step in the request, even steps the user does not actually need to wait for.",
    "After: The response time reflects only the steps genuinely necessary before responding, with everything else happening independently in the background.",
    "Moving a single slow, non essential step to async execution can cut perceived response time dramatically, often reducing it to whatever the truly essential work actually costs.",
    "@Async (Spring): use it when fire and forget or eventually consistent background work triggered from within a Spring managed bean. Avoid it when work whose success genuinely must be confirmed before the caller proceeds, which defeats the purpose of running it in the background.",
    "Message queue (Kafka, RabbitMQ) for background work: use it when background work that must survive an application restart, be retried reliably, or be processed by a completely separate service. Avoid it when simple, low stakes background work where the added infrastructure of a message broker is unnecessary overhead.",
    "Virtual threads with plain blocking code: use it when i/O bound work where you want the simplicity of straightforward blocking code without sacrificing scalability. Avoid it when cPU bound work, where virtual threads offer no real advantage over a normal thread pool."
  ],
  commonMistakes: [
    "Making a background task @Async and void, with no exception handler configured, and assuming failures will be visible somehow. By default, an exception thrown inside a void @Async method is caught by Spring's default handler and simply logged at a level that is very easy to miss, or in some configurations swallowed almost entirely, with no exception propagated back to any caller since there is no caller waiting. Fix: Register an AsyncUncaughtExceptionHandler, or use a CompletableFuture return type with an explicit exceptionally() or whenComplete() handler, so background failures are never silent."
  ],
  interviewPerspective: "A common way this gets tested: \"An @Async void method throws an unchecked exception halfway through. Who finds out about that exception, and how?\" Nobody, by default, in any meaningful way. The caller already moved on and has no reference to wait on. The exception is routed to Spring's default AsyncUncaughtExceptionHandler, which typically just logs it, unless a custom handler is explicitly configured to do something more visible, like alerting.",
  triggerSentence: "Async code runs faster from the caller's perspective specifically because the caller stops waiting to find out what happened."
};
