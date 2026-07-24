import { ConceptContent } from '../../models/content.model';

export const HIKARICP_TUNING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'hikaricp-tuning',
  title: 'HikariCP Tuning',

  hook:
    'A team doubles their connection pool size from 10 to 50 hoping to fix slow responses under load. Throughput gets ' +
    'worse, not better. More connections, same hardware, slower service. That is not supposed to happen.',

  problem:
    'It feels obvious that more database connections should mean more concurrent work getting done, but a database ' +
    'server has a fixed number of CPU cores and a fixed amount of disk I/O capacity. Past a certain point, adding more ' +
    'connections just means more queries fighting over the same limited resources, with more context switching overhead ' +
    'on top.',

  aha: {
    statement:
      'The right pool size is not about how many requests you have, it is about how many queries the database can actually execute in parallel before it starts thrashing.',
    analogy:
      'Adding more connections past that point is like adding more cashiers to a grocery store that only has four checkout lanes. Hiring a tenth cashier does not create a tenth lane, it just means more cashiers standing around waiting for a lane to open, and more chaos coordinating who goes next.'
  },

  underTheHood: [
    'HikariCP\'s own documentation, based on real world formulas from PostgreSQL contributors, suggests a formula close to connections = ((core_count * 2) + effective_spindle_count), meaning pool size should track available CPU cores, not expected request volume.',
    'maximumPoolSize caps how many connections this one pool will ever open. minimumIdle controls how many connections stay open and ready even when traffic is low, avoiding the cost of opening new ones during a sudden spike.',
    'connectionTimeout is how long a thread will wait for a connection to become available before giving up and throwing an exception, rather than hanging forever when the pool is exhausted.',
    'idleTimeout and maxLifetime control how long a connection can sit unused, or how long it can live in total, before Hikari proactively closes and replaces it, which protects against database side connection limits, stale network state, or a load balancer silently dropping old connections.',
    'leakDetectionThreshold logs a warning with a stack trace if a connection is checked out for longer than the configured time without being returned, which is one of the fastest ways to actually find a missing close() in a large codebase.',
    'HikariCP itself is famous for being extremely fast with a fairly minimal, opinionated configuration surface. Most of the actual "tuning" work is deciding the right numbers for YOUR database\'s hardware and traffic pattern, not fighting the pool\'s own internals.'
  ],

  inTheWild: [
    'A production incident where a database\'s CPU is pegged at 100 percent and the fix is REDUCING the app\'s pool size, freeing the database to make faster progress on fewer concurrent queries instead of context switching between too many.',
    'leakDetectionThreshold catching a repository method that opens a connection inside a loop and never returns it, something that would otherwise take hours of guesswork to track down from a generic "pool exhausted" error alone.',
    'Interview question: "If increasing pool size makes things slower, what does that tell you about where the bottleneck actually is?" The bottleneck is the database\'s own CPU or I/O capacity, not the number of application side connections.'
  ],

  showMe: {
    caption: 'A dangerously unbounded, undocumented pool configuration versus one sized deliberately.',
    bad: {
      language: 'java',
      code:
        'HikariConfig config = new HikariConfig();\n' +
        'config.setJdbcUrl(url);\n' +
        'config.setMaximumPoolSize(200); // "bigger number, safer, right?"\n' +
        '// No minimumIdle, no timeouts, no leak detection configured at all.',
      explanation:
        'A pool this large against a database with, say, 8 CPU cores will happily let 200 queries fight for 8 cores worth of real capacity, and there is no leak detection to catch a connection that never gets returned.'
    },
    good: {
      language: 'java',
      code:
        'HikariConfig config = new HikariConfig();\n' +
        'config.setJdbcUrl(url);\n' +
        'config.setMaximumPoolSize(20);       // sized to the database\'s actual core count and headroom\n' +
        'config.setMinimumIdle(5);            // stay warm for sudden traffic\n' +
        'config.setConnectionTimeout(3000);   // fail fast instead of hanging\n' +
        'config.setLeakDetectionThreshold(30_000); // warn if a connection is held over 30s\n' +
        'DataSource pool = new HikariDataSource(config);',
      explanation:
        'Every number here answers a specific question: how many concurrent queries can the database handle, how fast should we fail if exhausted, and how do we detect a leak before it becomes an outage.'
    }
  },

  impact: {
    before: 'A database thrashing under 200 competing connections, with slow queries and no visibility into why.',
    after: 'A pool sized to the database\'s real capacity, with fast failure and automatic leak detection.',
    metric: 'Right sizing a pool down, counterintuitively, has measurably improved throughput in real production incidents by reducing database side context switching and lock contention.'
  },

  alternatives: [
    {
      name: 'Formula based sizing (cores times two, plus disk spindles)',
      whenToUse: 'A reasonable, well documented starting point when you do not yet have production load data.',
      whenNotToUse: 'Once you have real traffic data, load testing and monitoring beats any formula.'
    },
    {
      name: 'Load test driven sizing',
      whenToUse: 'You have a staging environment that can approximate real production load and can measure actual throughput at different pool sizes.',
      whenNotToUse: 'Very early stage projects with no realistic load to test against yet, where the formula is a fine starting point.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Assuming a slow API under load needs a BIGGER connection pool, without first checking whether the database itself is the bottleneck.',
      why:
        'A larger pool lets MORE queries reach the database at once, which, if the database is already at its CPU or I/O limit, just adds more contention and can make average query time, and therefore overall throughput, worse.',
      fix: 'Check database side metrics, CPU, disk I/O, lock waits, before assuming the fix is a bigger application side pool. Often the fix is a smaller pool, a missing index, or a slow query, not more connections.'
    }
  ],

  proveIt: {
    question: 'A database server has 8 CPU cores. Would you expect a connection pool of 200 to generally perform better or worse than a pool of 20, for a CPU bound query workload?',
    answer:
      'Generally worse. Past roughly 16 to 20 connections on an 8 core machine, additional connections mostly add contention and context switching rather than genuine additional parallelism, since the database physically cannot run more than a small multiple of its core count worth of CPU bound work at once.'
  },

  oneLiner: 'A connection pool is not sized to your traffic, it is sized to how much work your database can actually do at once.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'connection-pooling',
      title: 'Connection Pooling',
      note: 'This concept is the concrete numbers and knobs behind the general connection pooling idea.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'performance-optimization',
      title: 'Performance Optimization',
      note: 'Right sizing a pool is a direct application of the same measure first, do not guess discipline covered in Performance Optimization.'
    }
  ]
};
