import { ConceptContent } from '../../models/content.model';

export const JAVA_NIO: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'java-nio',
  title: 'Java NIO',

  hook:
    'A server needs to handle 10,000 simultaneous open connections. The classic "one thread per connection" model would ' +
    'need 10,000 threads, each burning real OS memory just to sit there mostly idle, waiting for data. How do real-world servers handle this without 10,000 threads?',

  problem:
    "Classic java.io is BLOCKING - reading from a socket or file pauses the calling thread entirely until data arrives, " +
    "which is exactly why traditional servers need one dedicated thread per connection. That model does not scale to " +
    "tens of thousands of mostly-idle connections, which is precisely the gap NIO (New I/O, then NIO.2) was built to close.",

  aha: {
    statement: 'NIO lets ONE thread monitor MANY channels (connections/files) at once, and only actually acts on the ones that are ready - instead of dedicating one whole thread to each connection, blocked and waiting.',
    analogy:
      "Classic blocking I/O is like a waiter who is assigned to ONE table and stands there frozen until that specific " +
      "table is ready to order, unable to help anyone else in the meantime. NIO's Selector is like one attentive host " +
      "watching the entire dining room at once, instantly noticing WHICH tables are ready to order right now, and " +
      "serving only those - one person efficiently covering what would otherwise need a dedicated waiter per table."
  },

  underTheHood: [
    'Channel: the NIO equivalent of a Stream, but bidirectional and (crucially) supports NON-blocking mode - reading from a non-blocking channel returns immediately, even if there is no data yet, instead of pausing the thread.',
    'Buffer: a fixed-size container (ByteBuffer, CharBuffer) that data is read into or written from - NIO always transfers data through a buffer rather than reading a stream directly byte by byte.',
    'Selector: the core of NIO\'s scalability story - a single Selector can monitor MANY registered channels simultaneously, and `selector.select()` blocks only until AT LEAST ONE of them is actually ready for I/O, then tells you exactly which ones.',
    'This lets a server handle thousands of connections with a small, fixed number of threads (often just one per CPU core), each running an event loop that asks the Selector "which channels are ready right now?" and only processes those - completely sidestepping the "one thread per connection" scaling wall.',
    'NIO.2 (java.nio.file, introduced in Java 7) modernized file I/O specifically: `Path`/`Files` provide a much richer, more consistent file API than the old `java.io.File`, including proper symbolic link handling, better error reporting, and `WatchService` for monitoring directory changes.',
    'Memory-mapped files (`FileChannel.map()`) let you treat a file\'s contents directly as an in-memory buffer, letting the OS handle paging data in/out as needed - useful for very large files accessed in a random-access pattern.'
  ],

  inTheWild: [
    'High-throughput network servers (the foundation underneath frameworks like Netty, and Spring WebFlux\'s underlying Reactor Netty) using Selector-based event loops to handle tens of thousands of concurrent connections with a small, fixed thread pool.',
    'A file-processing tool using `Files.walk()`, `Files.readAllLines()`, or memory-mapped files instead of the older, clunkier `java.io.File` API for cleaner, more robust file handling.',
    'Interview question: "How can a server handle 100,000 concurrent connections without 100,000 threads?" - the Selector-based non-blocking I/O model is the concrete, correct mechanism behind that answer (alongside newer alternatives like virtual threads for a different approach to the same problem).'
  ],

  showMe: {
    caption: 'Classic blocking I/O (one thread per connection) vs a conceptual NIO event-loop sketch monitoring many channels with one thread.',
    bad: {
      language: 'java',
      code:
        '// Classic blocking I/O - one dedicated thread PER connection\n' +
        'ServerSocket server = new ServerSocket(8080);\n' +
        'while (true) {\n' +
        '    Socket client = server.accept(); // blocks until a connection arrives\n' +
        '    new Thread(() -> handleClient(client)).start(); // one more thread, forever\n' +
        '}\n' +
        '// 10,000 concurrent connections = 10,000 OS threads, mostly idle, waiting',
      explanation:
        'Every connection permanently occupies its own OS thread for its entire lifetime, even while completely idle ' +
        'waiting for the next message - this does not scale past a few thousand connections due to per-thread memory/scheduling overhead.'
    },
    good: {
      language: 'java',
      code:
        '// NIO Selector - ONE thread monitors MANY channels\n' +
        'Selector selector = Selector.open();\n' +
        'serverChannel.configureBlocking(false);\n' +
        'serverChannel.register(selector, SelectionKey.OP_ACCEPT);\n\n' +
        'while (true) {\n' +
        '    selector.select(); // blocks only until SOMETHING is ready\n' +
        '    for (SelectionKey key : selector.selectedKeys()) {\n' +
        '        // handle ONLY the channels that are actually ready right now\n' +
        '    }\n' +
        '}',
      explanation:
        'A single thread (or a small handful) can monitor thousands of channels via the Selector, only doing real work ' +
        'for the ones that are actually ready - idle connections cost almost nothing while waiting.'
    }
  },

  impact: {
    before: 'Thousands of OS threads, most idle, each carrying real per-thread memory/scheduling overhead.',
    after: 'A small, fixed number of threads handling the same connection count via an event loop.',
    metric: 'This architectural shift is precisely what let servers move from handling low thousands of concurrent connections to tens or hundreds of thousands on the same hardware.'
  },

  alternatives: [
    {
      name: 'NIO Selector-based non-blocking I/O',
      whenToUse: 'Building or understanding high-throughput network servers/frameworks that need to scale connection count far beyond what one-thread-per-connection allows.',
      whenNotToUse: 'Simple, low-connection-count applications where classic blocking I/O is simpler to write and reason about, and scale is not a concern.'
    },
    {
      name: 'Classic blocking java.io',
      whenToUse: 'Simple file/stream processing, low-concurrency scenarios, or straightforward sequential I/O where NIO\'s added complexity is not worth it.',
      whenNotToUse: 'Anything needing to handle a very large number of concurrent, mostly-idle connections.'
    },
    {
      name: 'Virtual threads + blocking-style code',
      whenToUse: 'You want the simplicity of writing sequential, blocking-style code while still achieving high concurrency - virtual threads let the runtime handle the underlying scalability instead of you writing an explicit event loop.',
      whenNotToUse: "You need very fine-grained, explicit control over exactly how I/O readiness is monitored and dispatched - that still favors raw NIO/Selector."
    }
  ],

  commonMistakes: [
    {
      mistake: 'Mixing blocking calls inside a non-blocking NIO event-loop thread (e.g. calling a blocking database driver method from inside a Selector loop iteration).',
      why:
        "The entire point of the event-loop model is that its one (or few) threads must never block - a single blocking " +
        "call inside that loop stalls the processing of EVERY other channel being monitored by that same thread, silently destroying the scalability the whole architecture was built for.",
      fix:
        'Keep genuinely blocking operations off the event-loop thread entirely - dispatch them to a separate worker thread pool, or use a truly async/non-blocking client for that specific operation.'
    }
  ],

  proveIt: {
    question:
      'A single NIO event-loop thread is monitoring 5,000 channels via a Selector. One channel\'s handler makes a genuinely blocking, slow database call directly inside the loop. What happens to the OTHER 4,999 channels during that call?',
    answer:
      'They are effectively frozen - since the event loop uses one thread to check readiness and dispatch for ALL registered channels, a blocking call inside that same thread stalls processing for every other channel until the blocking call returns.'
  },

  oneLiner: 'NIO trades "one thread per connection" for "one thread watching many connections at once" - the same hardware, handling far more concurrency.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'multithreading',
      title: 'Multithreading',
      note: 'NIO\'s event-loop model is a deliberate alternative to the classic one-thread-per-task model covered in Multithreading, trading thread count for careful non-blocking discipline.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'virtual-threads',
      title: 'Virtual Threads',
      note: 'Virtual threads offer a different solution to the same underlying scaling problem NIO solves - letting you write simple blocking-style code that still scales, instead of hand-building an event loop.'
    },
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'networking',
      title: 'Networking',
      note: 'NIO is the low-level foundation that high-throughput network servers and clients are built on - Networking covers the broader concepts NIO\'s Channels/Selectors ultimately serve.'
    }
  ]
};
