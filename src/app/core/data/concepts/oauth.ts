import { ConceptContent } from '../../models/content.model';

export const OAUTH: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "oauth",
  title: "OAuth",
  topicType: "framework",
  simpleIntuition: "A photo printing website asks to \"access your Google Photos\" and you click Allow. That website never sees your Google password, ever. It could not steal it if it wanted to. How is that possible if it clearly just gained access to your account?",
  formalMeaning: "OAuth is a protocol for delegated authorization, it lets a user grant a third party application LIMITED access to their resources on another service, without that application ever seeing the user's actual password.",
  whyItExists: "Letting a third party application act on your behalf, without ever handing that application your actual username and password, requires a standardized, trusted protocol for delegated access, or every \"login with X\" integration would need to directly handle other services' raw credentials, a serious security liability.",
  howItWorksInternally: [
    "OAuth involves four roles: the Resource Owner (the user), the Client (the third party application wanting access), the Authorization Server (issues tokens, typically the service the user has an account with, like Google), and the Resource Server (holds the actual protected data, like the Google Photos API).",
    "The Authorization Code flow (the most common, most secure flow for a typical web application) works roughly like this: the client redirects the user to the authorization server's login page, the user logs in and approves the requested scope, the authorization server redirects back with a short lived authorization code, and the client exchanges that code (server side, using a client secret) for an actual access token.",
    "Scopes define exactly what the granted access token allows, like \"read your photos\" but not \"delete your account,\" letting a user grant narrow, specific permission rather than all or nothing access.",
    "The access token is what the client actually uses to call the resource server's API on the user's behalf. It is typically short lived, and a separate, longer lived refresh token lets the client obtain a new access token later without requiring the user to log in and approve again.",
    "A critical, common point of confusion: OAuth is fundamentally about AUTHORIZATION (what you are allowed to do), not AUTHENTICATION (proving who you are). OpenID Connect is a thin identity layer built ON TOP of OAuth specifically to standardize authentication, providing a signed ID token that actually asserts who the user is.",
    "PKCE (Proof Key for Code Exchange) is a security extension, now recommended even for confidential clients, that prevents an intercepted authorization code from being exchanged for a token by anyone other than the legitimate client that originally requested it."
  ],
  diagrams: [
    {
      mermaid: "sequenceDiagram\n  participant User\n  participant Client as Third-Party App\n  participant AuthServer as Authorization Server\n  participant ResourceServer as Resource Server\n  User->>Client: click \"Connect Google Photos\"\n  Client->>AuthServer: redirect user to login + approve scope\n  User->>AuthServer: log in, approve scope\n  AuthServer-->>Client: authorization code\n  Client->>AuthServer: exchange code for access token\n  AuthServer-->>Client: access token\n  Client->>ResourceServer: call API with access token\n  ResourceServer-->>Client: user's photos",
      caption: "The client never sees the user's actual password, only a scoped, short lived access token issued after explicit user approval."
    }
  ],
  mainComponents: [
    "It is like a hotel giving a valet a specific valet key that can only start the car and drive it a short distance, instead of handing over your full house key ring. The valet can do exactly the one job they were authorized for, and nothing more, without ever touching your actual master key."
  ],
  realWorldExamples: [
    "\"Sign in with Google\" buttons on countless websites, which under the hood are actually OpenID Connect (built on OAuth) proving identity, not just OAuth's original scoped resource access.",
    "A calendar scheduling tool requesting only \"read your calendar availability\" scope, not full account access, letting a user grant narrow, specific permission rather than an all or nothing login.",
    "Interview question: \"What is the difference between OAuth and OpenID Connect?\" OAuth is about delegated AUTHORIZATION, granting limited access to a resource. OpenID Connect adds a standardized identity layer on top of OAuth specifically for AUTHENTICATION, proving who the user actually is via a signed ID token."
  ],
  complexityAndTradeoffs: [
    "Before: Every third party integration would need to directly handle and store users' raw passwords for other services, an enormous, systemic security liability.",
    "After: Third party applications receive narrowly scoped, revocable, short lived access tokens, and never see the user's actual password at all.",
    "OAuth is the specific standard that made the entire \"connect your account\" ecosystem of modern app integrations possible without every single integration becoming its own individual password leak risk.",
    "OAuth 2.0 (Authorization Code flow with PKCE): use it when the standard, recommended choice for essentially any modern application, web or mobile, needing delegated access to another service on a user's behalf. Avoid it when simple, single service applications with no need for a third party to ever access data on another system.",
    "OpenID Connect (built on OAuth): use it when you specifically need to authenticate a user, prove who they are, not just authorize limited access to a resource. Avoid it when pure delegated resource access scenarios with no need to establish or verify the user's identity itself.",
    "Direct credential sharing (anti-pattern): use it when essentially never, in any real production system. Avoid it when any scenario involving real user credentials and a third party application, which is exactly the problem OAuth was designed to solve."
  ],
  commonMistakes: [
    "Treating OAuth as if it were an authentication protocol on its own, using a successfully obtained access token as proof of \"who the user is.\" An access token proves the client was granted permission to access a specific resource, it makes no cryptographically verified claim about the user's actual identity. Relying on it for authentication opens the door to token confusion and impersonation issues that OpenID Connect's signed ID token was specifically designed to prevent. Fix: Use OpenID Connect's ID token, not a bare OAuth access token, whenever the actual goal is authenticating who the user is."
  ],
  interviewPerspective: "A common way this gets tested: \"A \"Sign in with Google\" button successfully completes an OAuth flow and the application receives an access token. Is that access token, by itself, sufficient proof of the user's identity?\" Not reliably by design, OAuth access tokens are meant for authorizing resource access, not asserting identity. This is exactly why OpenID Connect exists as a layer on top of OAuth, providing a separate, signed ID token specifically meant to prove who the user is.",
  triggerSentence: "OAuth answers \"what is this app allowed to do,\" OpenID Connect answers \"who is this user,\" and confusing the two is a real, common security mistake."
};
