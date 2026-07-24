import { ConceptContent } from '../../models/content.model';

export const NETWORKING: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'java-core',
  conceptId: 'networking',
  title: 'Networking',

  hook:
    'Your service calls a downstream API. The network cable between the two servers is physically cut mid-request. Your ' +
    'code has to somehow notice this and recover - but nobody rings a bell that says "the cable is cut." What does your program actually observe?',

  problem:
    "Application code sees networking through a narrow, deceptively simple window: a Socket that you read from and write " +
    "to. Almost every hard-to-diagnose networking bug (a request that hangs forever, a connection that silently drops) " +
    "comes from that simple abstraction hiding real, physical unreliability underneath - and not knowing what could go wrong under the hood.",

  aha: {
    statement: "A network call has no built-in guarantee it will ever finish - every network operation needs an EXPLICIT timeout, because the alternative to \"it worked\" or \"it failed\" is often just... silence, forever.",
    analogy:
      "Making a network call without a timeout is like mailing a letter and waiting by the mailbox indefinitely for a " +
      "reply, with no way to know if the letter was lost, the recipient is just slow, or they already replied and the " +
      "reply itself got lost on the way back. A sensible person eventually decides \"I'll wait until Friday, then assume it failed and act accordingly\" - that deadline is exactly what a timeout is."
  },

  underTheHood: [
    'A `Socket` in Java represents one end of a TCP connection - `getInputStream()`/`getOutputStream()` give you the blocking read/write streams for that connection\'s data.',
    'Without an explicit `setSoTimeout()` (read timeout) or connection timeout, a socket read can block FOREVER if the other side never responds and the connection is never explicitly closed or reset - this is precisely how one slow downstream call can hang an entire request thread indefinitely.',
    'TCP itself guarantees ordered, reliable delivery of the bytes you send OVER AN ESTABLISHED CONNECTION, but it does NOT guarantee the connection will ever be established, or that a request will ever get a response - those failure modes are entirely your application\'s responsibility to detect and handle.',
    'DNS resolution (turning a hostname into an IP address) is itself a network call that can be slow or fail - and is frequently the invisible first step of a "network request" that developers forget even happens, let alone consider timing out.',
    'Connection pooling (reusing established TCP connections instead of opening a new one per request) avoids the real, non-trivial cost of TCP\'s handshake (and TLS\'s additional handshake, if HTTPS) for every single call - this is exactly why HTTP clients and database drivers universally use connection pools rather than raw sockets per request.',
    'Retrying a failed network call blindly can make things WORSE under real outages (a retry storm) - proper resilience needs backoff (waiting longer between retries) and circuit breakers (stopping retries entirely once a downstream is clearly down) rather than naive immediate retry loops.'
  ],

  inTheWild: [
    'A production incident where one slow, hung downstream call (no timeout set) exhausts an entire thread pool, causing a completely unrelated feature to also become unavailable - a classic cascading failure caused by a missing timeout.',
    'A mobile app on a flaky connection that needs to distinguish "the server is genuinely down" from "the network briefly dropped a packet" - retryable vs non-retryable network failures require genuinely different handling.',
    'Interview question: "What happens if you never set a timeout on a network call?" - the call can block the calling thread indefinitely if the remote side never responds, and this single gap has caused real, well-documented production outages.'
  ],

  showMe: {
    caption: 'A network call with no timeout (can hang forever) vs one with explicit timeouts set.',
    bad: {
      language: 'java',
      code:
        'Socket socket = new Socket("downstream-api.example.com", 443);\n' +
        '// No connect timeout, no read timeout set at all\n' +
        'InputStream in = socket.getInputStream();\n' +
        'int data = in.read(); // can block FOREVER if the other side never responds',
      explanation:
        'With no timeout configured, this read can hang indefinitely if the remote server hangs, the network silently ' +
        'drops the connection without a proper reset, or a firewall is silently swallowing packets - the calling thread never gets control back.'
    },
    good: {
      language: 'java',
      code:
        'Socket socket = new Socket();\n' +
        'socket.connect(new InetSocketAddress("downstream-api.example.com", 443), 3000); // 3s connect timeout\n' +
        'socket.setSoTimeout(5000); // 5s read timeout\n' +
        'InputStream in = socket.getInputStream();\n' +
        'int data = in.read(); // now guaranteed to fail with SocketTimeoutException within 5 seconds',
      explanation:
        'With explicit connect and read timeouts, the call is GUARANTEED to either succeed or fail within a bounded, ' +
        'known time - the calling thread can never be stuck waiting forever, and the failure can be handled deliberately.'
    }
  },

  impact: {
    before: 'A single hung downstream call can block a thread indefinitely, risking pool exhaustion and cascading failure.',
    after: 'Every network call is guaranteed to resolve (success or a specific failure) within a bounded, known time.',
    metric: 'Missing timeouts are a well-documented root cause of some of the most severe cascading production outages across the industry - setting explicit timeouts is one of the highest-leverage, lowest-effort reliability practices available.'
  },

  alternatives: [
    {
      name: 'Explicit connect + read timeouts on every network call',
      whenToUse: 'Every single network call, with no exceptions - this should be a non-negotiable default in any production system.',
      whenNotToUse: "Never skip this, even for calls you believe are to a 'reliable' internal service - internal services fail too."
    },
    {
      name: 'Circuit breaker (stop calling a downstream entirely once it is clearly failing)',
      whenToUse: 'Calls to a downstream service that is known to sometimes fail entirely (not just be slow) - prevents wasting resources on calls destined to fail or time out.',
      whenNotToUse: 'Very rarely called or non-critical downstream calls where the added complexity of a circuit breaker is not justified.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Making a network call (HTTP client, database driver, raw socket) using default settings, assuming a "reasonable" timeout is already configured.',
      why:
        'Many client libraries historically defaulted to NO timeout at all, or an extremely long one, specifically to ' +
        'avoid breaking legitimate slow-but-working use cases - but this means a genuinely hung downstream can silently ' +
        'exhaust your thread pool before anyone notices, often the root cause of a cascading production outage.',
      fix:
        'Always explicitly set connect and read/response timeouts for every network client you configure - never rely on library defaults without verifying what they actually are.'
    }
  ],

  proveIt: {
    question:
      'A service calls a downstream API with NO timeout configured. That downstream server accepts the TCP connection but ' +
      'then never sends a response. What happens to the calling thread, and for how long?',
    answer:
      'The calling thread blocks on the read call indefinitely - with no timeout set, there is no automatic point at ' +
      'which Java gives up and returns control; the thread stays blocked until the connection is somehow terminated externally (e.g. by an OS-level TCP keepalive eventually firing, which can take a very long time by default).'
  },

  oneLiner: "A network call has no built-in guarantee it will ever finish - an explicit timeout is what turns \"maybe forever\" into \"a known, bounded wait.\"",

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'java-core',
      conceptId: 'java-nio',
      title: 'Java NIO',
      note: 'NIO\'s Selector-based model is one architectural way to handle many network connections efficiently - this concept covers the underlying reliability concerns that apply regardless of which I/O model you use.'
    },
    {
      categoryId: 'middleware',
      topicId: 'microservices-architecture',
      conceptId: 'circuit-breaker',
      title: 'Circuit Breaker',
      note: "Circuit breakers are the architectural pattern built specifically on top of the timeout/failure-detection concepts introduced here, to stop calling a downstream that is clearly already failing."
    }
  ]
};
