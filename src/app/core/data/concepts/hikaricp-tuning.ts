import { ConceptContent } from '../../models/content.model';

export const HIKARICP_TUNING: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "hikaricp-tuning",
  title: "HikariCP Tuning",
  topicType: "framework",
  simpleIntuition: "A team doubles their connection pool size from 10 to 50 hoping to fix slow responses under load. Throughput gets worse, not better. More connections, same hardware, slower service. That is not supposed to happen.",
  formalMeaning: "The right pool size is not about how many requests you have, it is about how many queries the database can actually execute in parallel before it starts thrashing.",
  whyItExists: "It feels obvious that more database connections should mean more concurrent work getting done, but a database server has a fixed number of CPU cores and a fixed amount of disk I/O capacity. Past a certain point, adding more connections just means more queries fighting over the same limited resources, with more context switching overhead on top.",
  howItWorksInternally: [
    "HikariCP's own documentation, based on real world formulas from PostgreSQL contributors, suggests a formula close to connections = ((core_count * 2) + effective_spindle_count), meaning pool size should track available CPU cores, not expected request volume.",
    "maximumPoolSize caps how many connections this one pool will ever open. minimumIdle controls how many connections stay open and ready even when traffic is low, avoiding the cost of opening new ones during a sudden spike.",
    "connectionTimeout is how long a thread will wait for a connection to become available before giving up and throwing an exception, rather than hanging forever when the pool is exhausted.",
    "idleTimeout and maxLifetime control how long a connection can sit unused, or how long it can live in total, before Hikari proactively closes and replaces it, which protects against database side connection limits, stale network state, or a load balancer silently dropping old connections.",
    "leakDetectionThreshold logs a warning with a stack trace if a connection is checked out for longer than the configured time without being returned, which is one of the fastest ways to actually find a missing close() in a large codebase.",
    "HikariCP itself is famous for being extremely fast with a fairly minimal, opinionated configuration surface. Most of the actual \"tuning\" work is deciding the right numbers for YOUR database's hardware and traffic pattern, not fighting the pool's own internals."
  ],
  mainComponents: [
    "Adding more connections past that point is like adding more cashiers to a grocery store that only has four checkout lanes. Hiring a tenth cashier does not create a tenth lane, it just means more cashiers standing around waiting for a lane to open, and more chaos coordinating who goes next."
  ],
  realWorldExamples: [
    "A production incident where a database's CPU is pegged at 100 percent and the fix is REDUCING the app's pool size, freeing the database to make faster progress on fewer concurrent queries instead of context switching between too many.",
    "leakDetectionThreshold catching a repository method that opens a connection inside a loop and never returns it, something that would otherwise take hours of guesswork to track down from a generic \"pool exhausted\" error alone.",
    "Interview question: \"If increasing pool size makes things slower, what does that tell you about where the bottleneck actually is?\" The bottleneck is the database's own CPU or I/O capacity, not the number of application side connections."
  ],
  complexityAndTradeoffs: [
    "Before: A database thrashing under 200 competing connections, with slow queries and no visibility into why.",
    "After: A pool sized to the database's real capacity, with fast failure and automatic leak detection.",
    "Right sizing a pool down, counterintuitively, has measurably improved throughput in real production incidents by reducing database side context switching and lock contention.",
    "Formula based sizing (cores times two, plus disk spindles): use it when a reasonable, well documented starting point when you do not yet have production load data. Avoid it when once you have real traffic data, load testing and monitoring beats any formula.",
    "Load test driven sizing: use it when you have a staging environment that can approximate real production load and can measure actual throughput at different pool sizes. Avoid it when very early stage projects with no realistic load to test against yet, where the formula is a fine starting point."
  ],
  commonMistakes: [
    "Assuming a slow API under load needs a BIGGER connection pool, without first checking whether the database itself is the bottleneck. A larger pool lets MORE queries reach the database at once, which, if the database is already at its CPU or I/O limit, just adds more contention and can make average query time, and therefore overall throughput, worse. Fix: Check database side metrics, CPU, disk I/O, lock waits, before assuming the fix is a bigger application side pool. Often the fix is a smaller pool, a missing index, or a slow query, not more connections."
  ],
  interviewPerspective: "A common way this gets tested: \"A database server has 8 CPU cores. Would you expect a connection pool of 200 to generally perform better or worse than a pool of 20, for a CPU bound query workload?\" Generally worse. Past roughly 16 to 20 connections on an 8 core machine, additional connections mostly add contention and context switching rather than genuine additional parallelism, since the database physically cannot run more than a small multiple of its core count worth of CPU bound work at once.",
  triggerSentence: "A connection pool is not sized to your traffic, it is sized to how much work your database can actually do at once."
};
