import { ConceptContent } from '../../models/content.model';

export const CONNECTION_POOLING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'connection-pooling',
  title: 'Connection Pooling',

  hook:
    'Your API opens a fresh database connection for every single request, and each request quietly costs an extra 20 to ' +
    '50 milliseconds before your query even runs. Multiply that by a thousand requests a minute and you have built a ' +
    'performance problem that never shows up as a single slow line of code.',

  problem:
    'Opening a new database connection means a TCP handshake, then authentication, then the database allocating memory ' +
    'and a session for you, then eventually tearing all of that down when you close it. Doing this per request is like ' +
    'hiring and training a brand new employee just to answer one phone call, then firing them immediately after.',

  aha: {
    statement:
      'A connection pool opens a batch of database connections once, keeps them alive, and hands them out to whichever request needs one, returning them to the pool instead of closing them.',
    analogy:
      'It is like a taxi rank instead of building a new car for every passenger. A fixed number of cars sit ready. A passenger takes one, uses it, and it goes right back into the rank for the next passenger, instead of being scrapped and rebuilt from scratch every trip.'
  },

  underTheHood: [
    'On startup, the pool eagerly opens a minimum number of real database connections and keeps them alive, often with periodic keep alive checks so the database or a firewall does not silently drop an idle connection.',
    'When your code calls dataSource.getConnection(), the pool hands you an already open, already authenticated connection from its idle set, instead of creating a new one.',
    'When you call connection.close(), the pool intercepts that call. It does not actually close the underlying TCP connection, it just returns the connection to the idle set so the next request can reuse it.',
    'If every connection is currently checked out and a new request needs one, it waits up to a configured connection timeout for one to free up, then fails loudly if none becomes available in time, instead of hanging forever.',
    'Pool size is a real trade off. Too small and requests queue up waiting for a free connection under load. Too large and you can exceed the database server\'s own max connections limit, or waste memory on connections that mostly sit idle.',
    'A leaked connection, one checked out and never returned because of a missing close() somewhere, permanently shrinks the usable pool by one until the application restarts, which is why most pools also detect and log suspiciously long held connections.'
  ],

  diagrams: [
    {
      mermaid:
        'flowchart LR\n' +
        '  subgraph Pool["Connection Pool (e.g. 10 connections)"]\n' +
        '    C1["Connection 1 (idle)"]\n' +
        '    C2["Connection 2 (in use)"]\n' +
        '    C3["Connection 3 (idle)"]\n' +
        '  end\n' +
        '  Req1["Request A"] -->|"borrow"| C2\n' +
        '  Req2["Request B"] -->|"borrow"| C1\n' +
        '  C2 -->|"return on close()"| Pool',
      caption: 'close() does not destroy the connection, it just returns it to the pool for the next request.'
    }
  ],

  inTheWild: [
    'A service that suddenly starts throwing "connection timeout, pool exhausted" errors only under real production load, even though it worked fine in every manual test, because manual testing never opens enough concurrent connections to hit the pool limit.',
    'A slow downstream call inside a transaction holding a connection checked out far longer than it needs to be, starving every other request of an available connection even though the pool itself is configured generously.',
    'Interview question: "Why is opening a new database connection per request considered expensive, specifically?" The concrete answer is TCP handshake plus authentication plus the database allocating session state, all of which a pool pays for once instead of on every single request.'
  ],

  showMe: {
    caption: 'Manually opening a connection per call versus configuring a pooled DataSource once.',
    bad: {
      language: 'java',
      code:
        'public List<Order> findOrders(long customerId) throws SQLException {\n' +
        '    Connection conn = DriverManager.getConnection(url, user, password); // new TCP + auth, every call\n' +
        '    // ... run query ...\n' +
        '    conn.close(); // connection is fully torn down, all that setup cost is wasted\n' +
        '    return orders;\n' +
        '}',
      explanation:
        'Every single call to this method pays the full cost of opening and tearing down a real database session, even if the exact same method is called a thousand times a second.'
    },
    good: {
      language: 'java',
      code:
        '// Configured once, at application startup:\n' +
        'HikariConfig config = new HikariConfig();\n' +
        'config.setJdbcUrl(url);\n' +
        'config.setMaximumPoolSize(10);\n' +
        'DataSource pool = new HikariDataSource(config);\n\n' +
        'public List<Order> findOrders(long customerId) throws SQLException {\n' +
        '    try (Connection conn = pool.getConnection()) { // reused, already open connection\n' +
        '        // ... run query ...\n' +
        '        return orders;\n' +
        '    } // close() returns it to the pool, does not tear it down\n' +
        '}',
      explanation:
        'The expensive setup happens once, at startup, for a small batch of connections. Every request just borrows and returns one, which is nearly free by comparison.'
    }
  },

  impact: {
    before: 'Every request pays 20 to 50 milliseconds or more just to open a connection before any real work happens.',
    after: 'Requests borrow an already open connection in well under a millisecond.',
    metric: 'Adding a connection pool to a service that previously opened raw connections per request commonly removes the single largest fixed latency cost on every database backed endpoint.'
  },

  alternatives: [
    {
      name: 'HikariCP',
      whenToUse: 'The default, modern choice for almost every JVM application. It is what Spring Boot uses out of the box.',
      whenNotToUse: 'Rare cases needing a specific feature only another pool implementation provides.'
    },
    {
      name: 'Apache Commons DBCP / Tomcat JDBC pool',
      whenToUse: 'Legacy applications already built around one of these, or environments with existing operational tooling around them.',
      whenNotToUse: 'New projects. HikariCP is generally faster and simpler to reason about.'
    },
    {
      name: 'No pooling, raw DriverManager connections',
      whenToUse: 'A short lived script or a one off migration tool that opens a handful of connections total.',
      whenNotToUse: 'Any long running service handling concurrent requests.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Setting the pool\'s maximum size far higher than the database server\'s own max connections limit, assuming bigger is always safer.',
      why:
        'A single application instance with an oversized pool can, under load, consume most or all of the database\'s connection limit, starving every OTHER service or replica connecting to the same database, causing a cluster wide outage instead of just a slow single service.',
      fix: 'Size the pool based on the database\'s actual connection limit divided across every service instance and replica that connects to it, not just based on one service\'s own expected concurrency.'
    }
  ],

  proveIt: {
    question: 'When your code calls connection.close() on a pooled connection, what actually happens to the underlying TCP connection to the database?',
    answer:
      'Nothing happens to it. The pool intercepts close() and returns the connection to its idle set so another request can reuse the same already open TCP connection. The real connection is only actually closed when the pool itself shuts down or decides to recycle it.'
  },

  oneLiner: 'A connection pool turns the expensive part of talking to a database, opening the connection, into a one time cost instead of a per request cost.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jdbc',
      title: 'JDBC',
      note: 'A connection pool sits directly on top of JDBC, it is still handing out real JDBC Connection objects, just reused ones.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'hikaricp-tuning',
      title: 'HikariCP Tuning',
      note: 'This concept covers pooling conceptually. HikariCP Tuning covers the concrete numbers, pool size, timeouts, that make a pool actually safe in production.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'transactions',
      title: 'Transactions',
      note: 'A transaction holds its connection checked out from the pool for its entire duration, which is exactly why long running transactions are a common cause of pool exhaustion.'
    }
  ]
};
