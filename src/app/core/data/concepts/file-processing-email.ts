import { ConceptContent } from '../../models/content.model';

export const FILE_PROCESSING_EMAIL: ConceptContent = {
  categoryId: 'middleware',
  topicId: 'enterprise-java',
  conceptId: 'file-processing-email',
  title: 'File Processing: Email',

  hook:
    'A password reset email is supposed to arrive in seconds. It arrives ten minutes late, if it arrives at all, because ' +
    'the endpoint that triggers it is calling the mail server directly and synchronously, and that mail server is having a slow day.',

  problem:
    'Sending email involves talking to an external mail server (SMTP) that is genuinely outside your control, it can be ' +
    'slow, temporarily unavailable, or reject a message, and building that dependency directly, synchronously, into a ' +
    'user facing request makes your whole application only as reliable and fast as that external system.',

  aha: {
    statement: 'Email sending should be treated as an unreliable, potentially slow external dependency, composed with a templating engine for content and handled asynchronously so a slow or failing mail server never blocks or breaks the request that triggered it.',
    analogy:
      'It is like dropping a letter in a mailbox rather than personally waiting at the post office until it is confirmed delivered. You hand it off and get on with your day, trusting the postal system to eventually deliver it, and having a way to notice if it eventually bounces back.'
  },

  underTheHood: [
    'JavaMailSender (Spring\'s abstraction over the JavaMail API) handles the actual SMTP communication, connecting to a mail server, authenticating, and transmitting the message.',
    'A MimeMessage supports rich content, HTML bodies, attachments, and inline images, unlike a plain SimpleMailMessage which only supports basic plain text.',
    'Email content is almost always generated from a template (Thymeleaf is a common choice) with real data merged in, rather than string concatenation, giving a consistent, maintainable, designer friendly way to manage email layout separately from the sending logic.',
    'Because SMTP servers can be slow or temporarily unreachable, sending is typically wrapped in @Async (or pushed to a message queue) so a slow mail server never blocks the user facing request that triggered the email.',
    'A failed send needs an explicit retry strategy, since a transient SMTP failure (a temporary network blip, a rate limit) is common and often resolves itself on a second attempt shortly after, rather than being a permanent failure.',
    'Sending at real scale (marketing campaigns, mass notifications) is usually delegated to a dedicated transactional email service (SendGrid, SES, Mailgun) rather than a raw SMTP connection, since those services handle deliverability, bounce tracking, and rate limits far better than a hand rolled solution.'
  ],

  inTheWild: [
    'A signup flow sending a welcome email asynchronously after account creation, so a slow mail server never delays the actual signup confirmation the user is waiting to see.',
    'An email template built with Thymeleaf, letting a non developer tweak the visual layout of a password reset email without touching any Java code at all.',
    'Interview question: "Why should sending an email typically not happen synchronously inside a request handling thread?" Because the mail server is an external dependency outside your control, and its latency or downtime should not become YOUR application\'s latency or downtime for an operation the user is actively waiting on.'
  ],

  showMe: {
    caption: 'A signup endpoint blocked on a slow mail server versus one sending the welcome email asynchronously.',
    bad: {
      language: 'java',
      code:
        '@PostMapping("/signup")\n' +
        'public User signup(@RequestBody SignupRequest request) {\n' +
        '    User user = userService.create(request);\n' +
        '    mailSender.send(buildWelcomeEmail(user)); // blocks until the SMTP server responds\n' +
        '    return user;\n' +
        '}',
      explanation:
        'If the mail server is slow or briefly unavailable, the entire signup request hangs or fails, even though the account itself was already created successfully.'
    },
    good: {
      language: 'java',
      code:
        '@Service\n' +
        'public class WelcomeEmailService {\n' +
        '    @Async\n' +
        '    public void sendWelcomeEmail(User user) {\n' +
        '        mailSender.send(buildWelcomeEmail(user));\n' +
        '    }\n' +
        '}\n\n' +
        '@PostMapping("/signup")\n' +
        'public User signup(@RequestBody SignupRequest request) {\n' +
        '    User user = userService.create(request);\n' +
        '    welcomeEmailService.sendWelcomeEmail(user); // returns immediately\n' +
        '    return user;\n' +
        '}',
      explanation:
        'The signup response returns as soon as the account is created, entirely decoupled from however long the mail server takes to actually accept the message.'
    }
  },

  impact: {
    before: 'A user facing request is only as fast and as reliable as an external mail server that is completely outside your control.',
    after: 'The user facing request completes based purely on your own application\'s work, with email sending happening independently in the background.',
    metric: 'Decoupling email sending from the triggering request removes an entire class of "signup is slow" or "signup failed" incidents that are actually caused by an unrelated third party mail server having a bad day.'
  },

  alternatives: [
    {
      name: 'Async in process sending (JavaMailSender + @Async)',
      whenToUse: 'Moderate email volume where a dedicated queue infrastructure is not yet justified.',
      whenNotToUse: 'High volume transactional or marketing email needing deliverability tracking, bounce handling, and rate limit management at scale.'
    },
    {
      name: 'Message queue backed email sending',
      whenToUse: 'Higher reliability requirements, wanting retries and persistence to survive an application restart between "queued" and "actually sent."',
      whenNotToUse: 'Simple, low volume applications where the added queue infrastructure is unnecessary overhead.'
    },
    {
      name: 'Dedicated transactional email service (SendGrid, SES, Mailgun)',
      whenToUse: 'Production applications at any real scale, where deliverability, bounce tracking, and reputation management matter and are hard to replicate well by hand.',
      whenNotToUse: 'Small internal tools or prototypes where a direct SMTP connection is simple and sufficient.'
    }
  ],

  commonMistakes: [
    {
      mistake: 'Sending email synchronously, inline, inside the same request handling thread as the primary business operation that triggered it.',
      why:
        'The user facing request now depends entirely on the availability and latency of an external mail server that your application does not control, turning any mail server hiccup into a visible, user facing failure of an otherwise unrelated operation.',
      fix: 'Send email asynchronously (or via a queue), decoupling the reliability and latency of the primary operation from the reliability and latency of the email delivery.'
    }
  ],

  proveIt: {
    question: 'A signup endpoint sends a welcome email synchronously before returning its response, and the SMTP server used is temporarily down. What happens to the signup request?',
    answer:
      'It hangs (waiting for a timeout) or fails outright, even though the actual account creation already succeeded, because the request is blocked on an external dependency (the mail server) that has nothing to do with whether the account itself was created correctly.'
  },

  oneLiner: 'Email is an external dependency you do not control, so treat sending it that way, asynchronously, with retries, never as a blocking step in a critical request.',

  connections: [
    {
      categoryId: 'middleware',
      topicId: 'enterprise-java',
      conceptId: 'async-programming',
      title: 'Async Programming',
      note: 'Decoupling email sending from the triggering request is one of the most common, concrete real world uses of async programming.'
    },
    {
      categoryId: 'messaging',
      topicId: 'message-brokers',
      conceptId: 'retry',
      title: 'Retry',
      note: 'A failed email send benefits from the exact same retry thinking used for any unreliable external call in a distributed system.'
    }
  ]
};
