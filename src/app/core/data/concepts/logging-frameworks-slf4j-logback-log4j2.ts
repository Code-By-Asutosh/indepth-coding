import { ConceptContent } from '../../models/content.model';

export const LOGGING_FRAMEWORKS_SLF4J_LOGBACK_LOG4J2: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "logging-frameworks-slf4j-logback-log4j2",
  title: "Logging Frameworks (SLF4J, Logback, Log4j2)",
  topicType: "framework",
  simpleIntuition: "Production goes down at 3 AM. The only way anyone figures out what happened is by reading logs, there is no debugger attached to a live production server. Whatever was, or was not, logged in the minutes before the crash is genuinely the entire investigation.",
  formalMeaning: "A real logging framework separates WHAT you log (via a simple, stable API) from HOW it is actually processed and stored (via a configurable, swappable backend), so log verbosity, format, and destination can all change without touching a single line of application code.",
  whyItExists: "Printing debug information with System.out.println works fine on a laptop, but in production it cannot be turned off without a redeploy, has no severity levels, no structured format, and cannot be routed anywhere useful, like a centralized log aggregation system.",
  howItWorksInternally: [
    "SLF4J (Simple Logging Facade for Java) is not a logging implementation at all, it is a thin, stable API that application code writes against. Logback and Log4j2 are actual implementations that plug in underneath it, meaning application code never needs to change even if the underlying logging engine is swapped out.",
    "Log levels (TRACE, DEBUG, INFO, WARN, ERROR) let you tag a message's severity once, and control how much detail actually gets emitted purely through EXTERNAL configuration, without ever touching or redeploying application code, turning DEBUG logging on temporarily to investigate an issue, then back off once resolved.",
    "Logger.info(\"User {} logged in\", userId) uses parameterized logging rather than string concatenation. This matters because, if INFO level logging happens to be disabled, the (potentially expensive) string construction is skipped entirely, since the framework only builds the final message if that log level is actually active.",
    "MDC (Mapped Diagnostic Context) lets you attach contextual data, like a request id or user id, to a thread, so every single log line written during that request automatically includes it, without manually passing that context through every single method call and log statement.",
    "Appenders and layouts (configured in logback.xml or log4j2.xml) control WHERE log output actually goes (console, a file, a network log aggregator) and in WHAT format (plain text, JSON), entirely independent of the application code that calls logger.info(...).",
    "Log4j2's async loggers can write log entries on a separate thread from the calling code, meaningfully reducing the latency cost of logging in high throughput applications, since the calling thread does not have to wait for the actual I/O of writing the log line to complete."
  ],
  mainComponents: [
    "It is like a universal power outlet standard versus the actual power plant behind it. Your appliance (application code) just plugs into the standard socket (SLF4J's API), completely unaware of, and unaffected by, whether the electricity behind it comes from a coal plant or a solar farm (Logback or Log4j2 actually doing the work)."
  ],
  realWorldExamples: [
    "A production incident investigation relying entirely on structured JSON logs, including an MDC attached request id, to trace one specific failing request's exact path across multiple log lines and, in a microservices setup, across multiple services.",
    "A team temporarily raising the log level for one specific package to DEBUG in production, via external configuration, to investigate a live issue, with zero code changes or redeployment required.",
    "Interview question: \"Why use SLF4J instead of calling Log4j2 or Logback directly?\" SLF4J decouples application code from any specific logging implementation, letting the actual backend be swapped, or a library dependency's own logging framework be redirected, without ever touching the application's own logging calls."
  ],
  complexityAndTradeoffs: [
    "Before: Debug output has no severity levels, cannot be filtered or redirected without a redeploy, and always pays its full construction cost regardless of whether anyone is watching.",
    "After: Log verbosity, format, and destination are all controlled through external configuration, and expensive log message construction is skipped entirely when that level is disabled.",
    "The difference between having, versus not having, well structured production logs during an incident is often the difference between resolving an outage in minutes versus hours of pure guesswork.",
    "SLF4J + Logback (Spring Boot default): use it when the overwhelming majority of Spring applications, given Logback's deep, out of the box integration with Spring Boot. Avoid it when applications with extremely high throughput logging needs where Log4j2's async logging performance characteristics matter more.",
    "SLF4J + Log4j2: use it when high throughput applications needing async, low latency logging, or specific Log4j2 features not present in Logback. Avoid it when simpler applications where Logback's simplicity and default Spring Boot integration is already sufficient.",
    "System.out.println / plain console printing: use it when genuinely quick, throwaway local debugging that will never reach any shared or production environment. Avoid it when any real application, especially anything that will run in production, where the lack of levels, filtering, and structured output becomes a serious operational liability."
  ],
  commonMistakes: [
    "Building a log message via string concatenation, log.info(\"Order \" + order.getId() + \" processed\"), instead of using parameterized placeholders. String concatenation happens immediately, every single time that line executes, regardless of whether that log level is even currently enabled. Parameterized logging defers building the actual string until the framework confirms the level is active, avoiding wasted work when it is not. Fix: Always use parameterized placeholders, log.info(\"Order {} processed\", order.getId()), letting the framework skip message construction entirely when that level is disabled."
  ],
  interviewPerspective: "A common way this gets tested: \"Why does log.info(\"Order {} processed\", order.getId()) generally perform better than log.info(\"Order \" + order.getId() + \" processed\") when INFO level logging happens to be disabled?\" The parameterized version only builds the final formatted string if the framework confirms INFO level is actually enabled. The string concatenation version builds the full string immediately, unconditionally, every single time that line executes, regardless of whether the resulting message is ever actually used.",
  triggerSentence: "A logging framework is what turns \"we have no idea what happened\" into \"here is exactly what happened, in order, with context,\" and only if you set it up correctly ahead of time."
};
