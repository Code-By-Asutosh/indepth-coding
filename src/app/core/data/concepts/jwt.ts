import { ConceptContent } from '../../models/content.model';

export const JWT: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'jwt',
  title: 'JWT',

  hook:
    'A user logs in once, then makes fifty API calls over the next hour, hitting five different backend services, none ' +
    'of which share a session store with each other. Yet every single one of those services somehow knows exactly who ' +
    'the user is and what they are allowed to do. No shared database lookup happened for any of them.',

  problem:
    'Traditional server side sessions require the server to look up session state on every request, which works fine ' +
    'for one server but becomes a genuine bottleneck across many independent, horizontally scaled services that would ' +
    'otherwise all need to share one central session store.',

  aha: {
    statement: 'A JWT (JSON Web Token) packs the user\'s identity and claims directly INTO the token itself, cryptographically signed, so any service holding the public verification key can trust and read it instantly, with zero database lookup or shared session store required.',
    analogy:
      'It is like a wax sealed letter from a trusted notary. Anyone receiving it can verify the seal is genuine and unbroken just by looking at it, without ever needing to call the notary\'s office to confirm, because the proof of authenticity travels WITH the letter itself.'
  },

  underTheHood: [
    'A JWT has three base64url encoded, dot separated parts: a header (describing the signing algorithm), a payload (the actual claims, like userId, roles, and an expiration time), and a signature (a cryptographic proof that the header and payload have not been tampered with since they were signed).',
    'The payload of a JWT is NOT encrypted, it is only encoded, meaning ANYONE who intercepts the token can read its contents in plain text. The signature only proves it was not tampered with, it provides no confidentiality at all. Never put a genuine secret, like a password, inside a JWT payload.',
    'HS256 is a symmetric signing algorithm, the same secret key both signs and verifies the token, meaning every service that needs to verify a token must also be trusted with that same secret. RS256 is asymmetric, one private key signs, and a separate, safely shareable public key verifies, letting many services verify tokens without ever holding the ability to forge new ones.',
    'A JWT is stateless by design: since the token itself carries all the claims needed, and the signature proves it has not been altered, the server verifying it needs no database lookup or shared session store, just the public key (or shared secret) to check the signature.',
    'That statelessness has a real trade off: because the server does not track issued tokens, there is no simple built in way to revoke ONE specific token before it naturally expires. Common mitigations include keeping the token\'s lifetime very short and pairing it with a longer lived, separately revocable refresh token.',
    'The exp (expiration) claim must always be checked and enforced, and access tokens are typically kept deliberately short lived (minutes), specifically to limit how long a stolen token remains useful if it is ever compromised.'
  ],

  diagrams: [
    {
      mermaid:
        'sequenceDiagram\n' +
        '  participant Client\n' +
        '  participant Auth as Auth Server\n' +
        '  participant ServiceA\n' +
        '  participant ServiceB\n' +
        '  Client->>Auth: login\n' +
        '  Auth-->>Client: signed JWT\n' +
        '  Client->>ServiceA: request + JWT\n' +
        '  ServiceA->>ServiceA: verify signature locally, no DB lookup\n' +
        '  Client->>ServiceB: request + same JWT\n' +
        '  ServiceB->>ServiceB: verify signature locally, no DB lookup',
      caption: 'The same JWT is independently verified by multiple services, each only needing the verification key, never a shared session store.'
    }
  ],

  inTheWild: [
    'A microservices architecture where an auth service issues a JWT once at login, and every downstream service independently verifies that token\'s signature locally, with no shared session database anywhere.',
    'A production incident where a JWT was decoded (not decrypted, just base64 decoded, which anyone can do) revealing an internal user id and role directly in the payload, a reminder that JWTs are readable, not confidential, by design.',
    'Interview question: "How do you revoke a single JWT before it expires?" You genuinely cannot revoke it directly since the server holds no record of issued tokens, common approaches instead use very short expiration times combined with a maintained blocklist of specific revoked tokens or user sessions checked at verification time.'
  ],

  showMe: {
    caption: 'Storing a sensitive value directly in a JWT payload versus keeping the JWT to genuinely non sensitive claims only.',
    bad: {
      language: 'java',
      code:
        'String token = Jwts.builder()\n' +
        '    .setSubject(user.getUsername())\n' +
        '    .claim("creditCardNumber", user.getCreditCardNumber()) // visible to anyone who reads the token\n' +
        '    .signWith(secretKey)\n' +
        '    .compact();',
      explanation:
        'The JWT payload is only base64 encoded, not encrypted, so anyone intercepting this token, or the user themselves, can trivially decode and read the credit card number in plain text.'
    },
    good: {
      language: 'java',
      code:
        'String token = Jwts.builder()\n' +
        '    .setSubject(user.getUsername())\n' +
        '    .claim("roles", user.getRoles()) // non sensitive, needed for authorization checks\n' +
        '    .setExpiration(Date.from(Instant.now().plus(15, ChronoUnit.MINUTES)))\n' +
        '    .signWith(privateKey) // RS256, asymmetric\n' +
        '    .compact();',
      explanation:
        'Only genuinely non sensitive claims needed for authorization live in the token, with a short expiration limiting how long a stolen token would remain useful.'
    }
  },

  impact: {
    before: 'Every request across a distributed system requires a shared session lookup, creating a central bottleneck and single point of failure.',
    after: 'Any service holding the verification key can independently confirm a token\'s validity in microseconds, with zero shared state or database dependency.',
    metric: 'Removing a shared session lookup from the critical path of every single request is often the difference that lets an authentication scheme actually scale cleanly to dozens of independent microservices.'
  },

  alternatives: [
    {
      name: 'JWT (stateless tokens)',
      whenToUse: 'Distributed systems with many independent services needing to verify identity without a shared, centralized session store.',
      whenNotToUse: 'Systems needing instant, precise revocation of individual sessions, where JWT\'s stateless nature makes that awkward.'
    },
    {
      name: 'Server side session (session id + server side store)',
      whenToUse: 'Simpler, more centralized architectures where instant revocation and rich, easily updated session state matter more than stateless scalability.',
      whenNotToUse: 'A distributed system where a shared session store becomes a bottleneck or single point of failure across many services.'
    },
    {
      name: 'Opaque token + token introspection endpoint',
      whenToUse: 'Wanting stateless-feeling token distribution while still retaining central, immediate revocation ability, at the cost of an extra network call per verification.',
      whenNotToUse: 'High throughput scenarios where an extra network round trip per request for verification is not acceptable.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Storing genuinely sensitive data directly in a JWT payload, assuming the token being "signed" also means it is confidential.',
      why:
        'Signing proves the token has not been tampered with, it says nothing about whether the contents are readable. The payload is only base64 encoded, and anyone with the token (the client itself, a network intermediary, browser dev tools) can decode and read it in plain text with zero effort.',
      fix: 'Keep JWT payloads limited to non sensitive identity and authorization claims, and use proper encryption (or simply do not include it in the token at all) for anything genuinely sensitive.'
    }
  ],

  proveIt: {
    question: 'A JWT signed with HS256 is intercepted by an attacker who cannot forge a new valid token without the secret key. Can they still read the existing token\'s claims?',
    answer:
      'Yes. The payload is only base64 encoded, not encrypted, so the attacker can decode and read every claim in plain text, they just cannot modify the payload and re-sign it successfully without knowing the shared secret key.'
  },

  oneLiner: 'A JWT proves who sent it and that it was not tampered with, it does not hide what is inside it, those are two entirely different guarantees.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'oauth',
      title: 'OAuth',
      note: 'OAuth defines HOW a client obtains permission to act on a user\'s behalf. JWT is commonly the actual token FORMAT used to carry that granted access.'
    },
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'encryption',
      title: 'Encryption',
      note: 'A JWT signature relies on the same symmetric or asymmetric cryptography concepts, though signing and encrypting are different operations with different guarantees.'
    }
  ]
};
