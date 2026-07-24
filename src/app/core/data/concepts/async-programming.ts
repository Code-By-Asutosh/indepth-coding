import { ConceptContent } from '../../models/content.model';

export const ASYNC_PROGRAMMING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'async-programming',
  title: 'Async Programming',

  hook:
    'A request comes in that needs to send a confirmation email. Sending that email takes 800 milliseconds because of a ' +
    'slow third party mail provider. Does the user really need to sit there watching a spinner for 800 milliseconds just to see "Order placed"?',

  problem:
    'Some work inside a request does not need to finish before you respond to the user, it just needs to happen ' +
    'eventually. Forcing every single step to run one after another, blocking the response until the slowest, least ' +
    'important step finishes, wastes the user\'s time for no real benefit.',

  aha: {
    statement: 'Async programming lets a piece of work run on a separate thread, returning control to the caller immediately, so slow, non essential work does not block the response the user actually cares about.',
    analogy:
      'It is like a waiter handing your order to the kitchen and immediately moving on to the next table, instead of standing at the kitchen window watching the food cook before doing anything else. The waiter (your main thread) stays free to keep serving other tables while the kitchen (a background thread) does its work.'
  },

  underTheHood: [
    '@EnableAsync plus @Async on a method tells Spring to run that method on a separate thread pool, returning control to the caller immediately rather than blocking until it completes.',
    'An @Async method returning void is genuinely fire and forget, the caller has no way to know if or when it finished, or whether it threw an exception. Returning a CompletableFuture<T> instead lets the caller attach a callback for when the result IS eventually needed, without blocking to wait for it right away.',
    'Like @Scheduled, @Async methods run on a configurable thread pool. Without an explicit executor configured, Spring falls back to a default pool that is often not sized appropriately for real production load, a lurking source of "Async is not actually faster" complaints.',
    'Calling an @Async method from WITHIN the same class it is defined in does not actually go through the proxy, and runs synchronously on the calling thread instead, the exact same self invocation trap that affects @Transactional.',
    'Exceptions thrown inside an @Async void method are swallowed silently by default unless an AsyncUncaughtExceptionHandler is explicitly configured, meaning a failing background task can fail completely invisibly.',
    'Virtual threads (Project Loom) change some of this calculus: for I/O bound work specifically, a virtual thread per task can make plain, simple blocking code scale nearly as well as complex async code, without the same self invocation and error handling pitfalls.'
  ],

  inTheWild: [
    'An order confirmation endpoint responding to the user immediately after saving the order, while a separate @Async method sends the confirmation email in the background, unrelated to how fast the user gets their response.',
    'A production incident where a background @Async task had been silently failing for weeks, because its exception was swallowed with no logging, no alert, nothing, until someone noticed confirmation emails had simply stopped arriving.',
    'Interview question: "Why does calling an @Async method from another method in the same class not actually run it asynchronously?" Because Spring\'s @Async, like @Transactional, relies on a proxy wrapping the bean, and a same class call bypasses that proxy entirely.'
  ],

  showMe: {
    caption: 'A request blocked on a slow, non essential email send versus the same email sent asynchronously.',
    bad: {
      language: 'java',
      code:
        '@PostMapping("/orders")\n' +
        'public Order placeOrder(@RequestBody OrderRequest request) {\n' +
        '    Order order = orderService.create(request);\n' +
        '    emailService.sendConfirmation(order); // blocks the response for however long this takes\n' +
        '    return order;\n' +
        '}',
      explanation:
        'The user waits for the full duration of the email send before getting any response at all, even though the order itself was already successfully created.'
    },
    good: {
      language: 'java',
      code:
        '@Service\n' +
        'public class EmailService {\n' +
        '    @Async\n' +
        '    public void sendConfirmation(Order order) {\n' +
        '        // runs on a background thread, caller does not wait for this\n' +
        '    }\n' +
        '}\n\n' +
        '@PostMapping("/orders")\n' +
        'public Order placeOrder(@RequestBody OrderRequest request) {\n' +
        '    Order order = orderService.create(request);\n' +
        '    emailService.sendConfirmation(order); // returns immediately\n' +
        '    return order;\n' +
        '}',
      explanation:
        'The response returns to the user as soon as the order is created, while the email send happens independently on a background thread.'
    }
  },

  impact: {
    before: 'The response time for every request is bottlenecked by the slowest step in the request, even steps the user does not actually need to wait for.',
    after: 'The response time reflects only the steps genuinely necessary before responding, with everything else happening independently in the background.',
    metric: 'Moving a single slow, non essential step to async execution can cut perceived response time dramatically, often reducing it to whatever the truly essential work actually costs.'
  },

  alternatives: [
    {
      name: '@Async (Spring)',
      whenToUse: 'Fire and forget or eventually consistent background work triggered from within a Spring managed bean.',
      whenNotToUse: 'Work whose success genuinely must be confirmed before the caller proceeds, which defeats the purpose of running it in the background.'
    },
    {
      name: 'Message queue (Kafka, RabbitMQ) for background work',
      whenToUse: 'Background work that must survive an application restart, be retried reliably, or be processed by a completely separate service.',
      whenNotToUse: 'Simple, low stakes background work where the added infrastructure of a message broker is unnecessary overhead.'
    },
    {
      name: 'Virtual threads with plain blocking code',
      whenToUse: 'I/O bound work where you want the simplicity of straightforward blocking code without sacrificing scalability.',
      whenNotToUse: 'CPU bound work, where virtual threads offer no real advantage over a normal thread pool.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Making a background task @Async and void, with no exception handler configured, and assuming failures will be visible somehow.',
      why:
        'By default, an exception thrown inside a void @Async method is caught by Spring\'s default handler and simply logged at a level that is very easy to miss, or in some configurations swallowed almost entirely, with no exception propagated back to any caller since there is no caller waiting.',
      fix: 'Register an AsyncUncaughtExceptionHandler, or use a CompletableFuture return type with an explicit exceptionally() or whenComplete() handler, so background failures are never silent.'
    }
  ],

  proveIt: {
    question: 'An @Async void method throws an unchecked exception halfway through. Who finds out about that exception, and how?',
    answer:
      'Nobody, by default, in any meaningful way. The caller already moved on and has no reference to wait on. The exception is routed to Spring\'s default AsyncUncaughtExceptionHandler, which typically just logs it, unless a custom handler is explicitly configured to do something more visible, like alerting.'
  },

  oneLiner: 'Async code runs faster from the caller\'s perspective specifically because the caller stops waiting to find out what happened.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'scheduling',
      title: 'Scheduling',
      note: 'Scheduled jobs and async methods often work together, a scheduled trigger kicking off work that itself runs asynchronously.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'virtual-threads',
      title: 'Virtual Threads',
      note: 'Virtual threads offer an alternative path to the same scalability goal, using plain blocking code instead of explicit async annotations and callbacks.'
    }
  ]
};
