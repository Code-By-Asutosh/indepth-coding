import { ConceptContent } from '../../models/content.model';

export const OAUTH: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'oauth',
  title: 'OAuth',

  hook:
    'A photo printing website asks to "access your Google Photos" and you click Allow. That website never sees your ' +
    'Google password, ever. It could not steal it if it wanted to. How is that possible if it clearly just gained access to your account?',

  problem:
    'Letting a third party application act on your behalf, without ever handing that application your actual username ' +
    'and password, requires a standardized, trusted protocol for delegated access, or every "login with X" integration ' +
    'would need to directly handle other services\' raw credentials, a serious security liability.',

  aha: {
    statement: 'OAuth is a protocol for delegated authorization, it lets a user grant a third party application LIMITED access to their resources on another service, without that application ever seeing the user\'s actual password.',
    analogy:
      'It is like a hotel giving a valet a specific valet key that can only start the car and drive it a short distance, instead of handing over your full house key ring. The valet can do exactly the one job they were authorized for, and nothing more, without ever touching your actual master key.'
  },

  underTheHood: [
    'OAuth involves four roles: the Resource Owner (the user), the Client (the third party application wanting access), the Authorization Server (issues tokens, typically the service the user has an account with, like Google), and the Resource Server (holds the actual protected data, like the Google Photos API).',
    'The Authorization Code flow (the most common, most secure flow for a typical web application) works roughly like this: the client redirects the user to the authorization server\'s login page, the user logs in and approves the requested scope, the authorization server redirects back with a short lived authorization code, and the client exchanges that code (server side, using a client secret) for an actual access token.',
    'Scopes define exactly what the granted access token allows, like "read your photos" but not "delete your account," letting a user grant narrow, specific permission rather than all or nothing access.',
    'The access token is what the client actually uses to call the resource server\'s API on the user\'s behalf. It is typically short lived, and a separate, longer lived refresh token lets the client obtain a new access token later without requiring the user to log in and approve again.',
    'A critical, common point of confusion: OAuth is fundamentally about AUTHORIZATION (what you are allowed to do), not AUTHENTICATION (proving who you are). OpenID Connect is a thin identity layer built ON TOP of OAuth specifically to standardize authentication, providing a signed ID token that actually asserts who the user is.',
    'PKCE (Proof Key for Code Exchange) is a security extension, now recommended even for confidential clients, that prevents an intercepted authorization code from being exchanged for a token by anyone other than the legitimate client that originally requested it.'
  ],

  diagrams: [
    {
      mermaid:
        'sequenceDiagram\n' +
        '  participant User\n' +
        '  participant Client as Third-Party App\n' +
        '  participant AuthServer as Authorization Server\n' +
        '  participant ResourceServer as Resource Server\n' +
        '  User->>Client: click "Connect Google Photos"\n' +
        '  Client->>AuthServer: redirect user to login + approve scope\n' +
        '  User->>AuthServer: log in, approve scope\n' +
        '  AuthServer-->>Client: authorization code\n' +
        '  Client->>AuthServer: exchange code for access token\n' +
        '  AuthServer-->>Client: access token\n' +
        '  Client->>ResourceServer: call API with access token\n' +
        '  ResourceServer-->>Client: user\'s photos',
      caption: 'The client never sees the user\'s actual password, only a scoped, short lived access token issued after explicit user approval.'
    }
  ],

  inTheWild: [
    '"Sign in with Google" buttons on countless websites, which under the hood are actually OpenID Connect (built on OAuth) proving identity, not just OAuth\'s original scoped resource access.',
    'A calendar scheduling tool requesting only "read your calendar availability" scope, not full account access, letting a user grant narrow, specific permission rather than an all or nothing login.',
    'Interview question: "What is the difference between OAuth and OpenID Connect?" OAuth is about delegated AUTHORIZATION, granting limited access to a resource. OpenID Connect adds a standardized identity layer on top of OAuth specifically for AUTHENTICATION, proving who the user actually is via a signed ID token.'
  ],

  showMe: {
    caption: 'A third party application asking users to directly enter their real credentials versus properly delegating via OAuth.',
    bad: {
      language: 'text',
      code:
        '// A third-party app asks the user to type their actual Google\n' +
        '// username and password directly into the third-party app\'s own login form,\n' +
        '// then that app stores and reuses those raw credentials to call Google\'s API.',
      explanation:
        'The third party application now holds the user\'s real password, a serious security liability if that application is ever compromised, and there is no way to grant limited scope or revoke access without changing the actual account password.'
    },
    good: {
      language: 'text',
      code:
        '// The third-party app redirects the user to Google\'s own login page.\n' +
        '// The user logs in directly with Google, never with the third-party app,\n' +
        '// approves a specific, limited scope, and Google redirects back with a\n' +
        '// short-lived authorization code the app exchanges for a scoped access token.',
      explanation:
        'The third party application never sees the user\'s actual Google password at any point, and the granted access is limited to a specific scope, individually revocable without changing the user\'s underlying account password.'
    }
  },

  impact: {
    before: 'Every third party integration would need to directly handle and store users\' raw passwords for other services, an enormous, systemic security liability.',
    after: 'Third party applications receive narrowly scoped, revocable, short lived access tokens, and never see the user\'s actual password at all.',
    metric: 'OAuth is the specific standard that made the entire "connect your account" ecosystem of modern app integrations possible without every single integration becoming its own individual password leak risk.'
  },

  alternatives: [
    {
      name: 'OAuth 2.0 (Authorization Code flow with PKCE)',
      whenToUse: 'The standard, recommended choice for essentially any modern application, web or mobile, needing delegated access to another service on a user\'s behalf.',
      whenNotToUse: 'Simple, single service applications with no need for a third party to ever access data on another system.'
    },
    {
      name: 'OpenID Connect (built on OAuth)',
      whenToUse: 'You specifically need to authenticate a user, prove who they are, not just authorize limited access to a resource.',
      whenNotToUse: 'Pure delegated resource access scenarios with no need to establish or verify the user\'s identity itself.'
    },
    {
      name: 'Direct credential sharing (anti-pattern)',
      whenToUse: 'Essentially never, in any real production system.',
      whenNotToUse: 'Any scenario involving real user credentials and a third party application, which is exactly the problem OAuth was designed to solve.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Treating OAuth as if it were an authentication protocol on its own, using a successfully obtained access token as proof of "who the user is."',
      why:
        'An access token proves the client was granted permission to access a specific resource, it makes no cryptographically verified claim about the user\'s actual identity. Relying on it for authentication opens the door to token confusion and impersonation issues that OpenID Connect\'s signed ID token was specifically designed to prevent.',
      fix: 'Use OpenID Connect\'s ID token, not a bare OAuth access token, whenever the actual goal is authenticating who the user is.'
    }
  ],

  proveIt: {
    question: 'A "Sign in with Google" button successfully completes an OAuth flow and the application receives an access token. Is that access token, by itself, sufficient proof of the user\'s identity?',
    answer:
      'Not reliably by design, OAuth access tokens are meant for authorizing resource access, not asserting identity. This is exactly why OpenID Connect exists as a layer on top of OAuth, providing a separate, signed ID token specifically meant to prove who the user is.'
  },

  oneLiner: 'OAuth answers "what is this app allowed to do," OpenID Connect answers "who is this user," and confusing the two is a real, common security mistake.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'jwt',
      title: 'JWT',
      note: 'OAuth access tokens and OpenID Connect ID tokens are very commonly implemented as JWTs, though OAuth itself does not strictly require that specific format.'
    },
    {
      categoryId: 'system-design',
      topicId: 'security-engineering',
      conceptId: 'oauth2',
      title: 'OAuth2',
      note: 'This concept covers OAuth from a practical, backend implementation angle. The system design security engineering view covers the same protocol at a broader, architectural level.'
    }
  ]
};
