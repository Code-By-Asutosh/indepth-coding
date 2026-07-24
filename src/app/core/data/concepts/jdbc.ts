import { ConceptContent } from '../../models/content.model';

export const JDBC: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'jdbc',
  title: 'JDBC',

  hook:
    'Your app talks to MySQL in production and PostgreSQL in a teammate\'s local setup, and not a single line of your ' +
    'business logic changes. Two completely different databases, same Java code. How is that even possible?',

  problem:
    'Every database vendor speaks its own wire protocol and has its own quirks. Without a common contract, switching ' +
    'databases, or even just writing code that talks to one, would mean learning and hand coding a vendor specific ' +
    'protocol every single time. JDBC is the layer that makes "talk to a relational database" a single, boring, ' +
    'well understood problem instead of a new problem per vendor.',

  aha: {
    statement:
      'JDBC is a standard set of Java interfaces (Connection, Statement, ResultSet) that every database vendor implements a driver for, so your code talks to the interface, never to the database directly.',
    analogy:
      'It is like a universal power adapter. Every country has different sockets, but your laptop charger only needs to know one shape, its own plug, because the adapter handles the messy translation underneath. JDBC is that adapter between your Java code and whichever database is actually plugged in.'
  },

  underTheHood: [
    'You load a vendor specific JDBC driver (a class implementing the java.sql.Driver interface), which registers itself so the DriverManager knows how to open connections for a given JDBC URL prefix, like jdbc:postgresql:// or jdbc:mysql://.',
    'DriverManager.getConnection(url, user, password) asks the registered driver to open a real TCP connection to the database and hands you back a Connection object, a live, stateful handle to that one session.',
    'From the Connection, you create a Statement (raw SQL, string concatenation risk) or a PreparedStatement (parameterized, precompiled, safe against SQL injection) to actually run queries.',
    'Running a SELECT returns a ResultSet, a cursor over the rows the database is streaming back to you. You call .next() to advance one row at a time and .getString()/.getInt() to read columns from the current row.',
    'Every one of these resources, Connection, Statement, ResultSet, wraps a real, limited resource on the database side (a session, a cursor). Not closing them leaks connections and cursors even though your Java objects get garbage collected, because the DATABASE side of the resource is not tied to Java\'s garbage collector at all.',
    'In real applications you almost never call DriverManager.getConnection() directly per request. A connection pool (see Connection Pooling) opens a batch of connections up front and hands them out and takes them back, because opening a brand new TCP connection plus authentication for every single query is far too slow to do per request.'
  ],

  diagrams: [
    {
      mermaid:
        'sequenceDiagram\n' +
        '  participant App as Your Code\n' +
        '  participant DM as DriverManager\n' +
        '  participant Conn as Connection\n' +
        '  participant DB as Database\n' +
        '  App->>DM: getConnection(url, user, pass)\n' +
        '  DM->>DB: open TCP session\n' +
        '  DB-->>DM: authenticated session\n' +
        '  DM-->>App: Connection\n' +
        '  App->>Conn: prepareStatement(sql)\n' +
        '  Conn->>DB: execute query\n' +
        '  DB-->>App: ResultSet (rows)\n' +
        '  App->>Conn: close()',
      caption: 'Every JDBC call is really a round trip through a driver to a real database session.'
    }
  ],

  inTheWild: [
    'A repository/DAO class opening a Connection, running a query, and forgetting to close it in a finally block or try with resources, slowly exhausting the database\'s max connection limit under load.',
    'A legacy service built directly on JDBC that a team later wraps with Spring Data or plain JPA, without changing the underlying database, because JDBC was already the vendor neutral boundary.',
    'Interview question: "What is the difference between Statement and PreparedStatement, and why does it matter for security?" PreparedStatement separates SQL structure from data, so user input can never be interpreted as SQL syntax, which is the actual defense against SQL injection.'
  ],

  showMe: {
    caption: 'String concatenated SQL versus a parameterized PreparedStatement.',
    bad: {
      language: 'java',
      code:
        'String sql = "SELECT * FROM users WHERE email = \'" + email + "\'";\n' +
        'Statement stmt = connection.createStatement();\n' +
        'ResultSet rs = stmt.executeQuery(sql);\n' +
        '// If email is: \' OR \'1\'=\'1\n' +
        '// the query becomes: SELECT * FROM users WHERE email = \'\' OR \'1\'=\'1\'\n' +
        '// returning every row in the table.',
      explanation:
        'Concatenating user input directly into SQL text lets an attacker change the MEANING of the query, not just the value being searched for. This is a textbook SQL injection vulnerability.'
    },
    good: {
      language: 'java',
      code:
        'String sql = "SELECT * FROM users WHERE email = ?";\n' +
        'try (PreparedStatement stmt = connection.prepareStatement(sql)) {\n' +
        '    stmt.setString(1, email);\n' +
        '    try (ResultSet rs = stmt.executeQuery()) {\n' +
        '        while (rs.next()) {\n' +
        '            System.out.println(rs.getString("email"));\n' +
        '        }\n' +
        '    }\n' +
        '}',
      explanation:
        'The ? placeholder is filled in as pure data, never as SQL syntax, and try with resources guarantees the Statement and ResultSet are closed even if something throws.'
    }
  },

  impact: {
    before: 'A single unclosed Connection per request slowly exhausts the database connection limit, and string built SQL is one crafted input away from a full data breach.',
    after: 'Resources are always released, and no user input can ever change what a query does, only what it searches for.',
    metric: 'SQL injection remains one of the most common serious vulnerabilities in real web applications, and it is entirely preventable with PreparedStatement alone.'
  },

  alternatives: [
    {
      name: 'Raw JDBC',
      whenToUse: 'You need maximum control over exact SQL and minimal abstraction overhead, or you are building a library that other abstractions sit on top of.',
      whenNotToUse: 'Most application code. Hand writing ResultSet to object mapping for every entity is repetitive and error prone.'
    },
    {
      name: 'JPA / Hibernate',
      whenToUse: 'You want to work with objects and let an ORM generate SQL and manage entity state for you.',
      whenNotToUse: 'You need very specific, hand tuned queries where an ORM\'s generated SQL would be a performance risk.'
    },
    {
      name: 'Spring JdbcTemplate / Spring Data',
      whenToUse: 'You want JDBC\'s directness without JDBC\'s boilerplate, using a thin wrapper that still lets you write real SQL.',
      whenNotToUse: 'You need the object relational mapping features (lazy loading, dirty checking) that only a full ORM provides.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Opening a Connection, Statement, or ResultSet and not closing it in a finally block or try with resources.',
      why:
        'The code compiles and works fine in local testing with a handful of requests. Under real, sustained traffic, each unclosed connection stays checked out from the database\'s connection limit, and the app eventually cannot open any new connections at all, failing every request with a connection timeout.',
      fix: 'Always use try with resources for Connection, Statement, and ResultSet, or rely on a framework (Spring JdbcTemplate, JPA) that manages this for you.'
    }
  ],

  proveIt: {
    question: 'Why does a PreparedStatement protect against SQL injection when a plain Statement built from concatenated strings does not, even if both eventually run "the same" SQL text?',
    answer:
      'A PreparedStatement sends the SQL structure and the parameter values as two separate things to the database. The database compiles the structure once, and parameter values are always treated as data, never re-parsed as SQL syntax. A concatenated Statement has no such separation, so attacker input can change the query\'s actual structure.'
  },

  oneLiner: 'JDBC is the one boring contract that lets your Java code stop caring which database is actually listening on the other end.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'connection-pooling',
      title: 'Connection Pooling',
      note: 'Opening a raw JDBC connection per request is far too slow for production, which is exactly the problem connection pooling solves.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jpa',
      title: 'JPA',
      note: 'JPA and Hibernate generate and run the exact same kind of JDBC calls shown here, just automatically, based on your entity mappings.'
    },
    {
      categoryId: 'system-design',
      topicId: 'security-engineering',
      conceptId: 'sql-injection',
      title: 'SQL Injection',
      note: 'The PreparedStatement fix shown here is the concrete, code level defense against the broader SQL injection vulnerability class.'
    }
  ]
};
