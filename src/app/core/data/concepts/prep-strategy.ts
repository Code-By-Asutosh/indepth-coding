import { ConceptContent } from '../../models/content.model';

/**
 * Interview Prep -> Start Here -> Prep Strategy.
 * The orientation page for the whole war-room track: how rounds actually work,
 * how to study every lesson in this track, and the ShopSphere storyline that
 * connects all of them.
 */
export const PREP_STRATEGY: ConceptContent = {
  categoryId: 'interview-prep',
  topicId: 'strategy',
  conceptId: 'prep-strategy',
  title: 'Prep Strategy',
  topicType: 'concept',

  simpleIntuition:
    'Two engineers with the same 4 years of experience sit for the same interview. One lists everything they ever studied and answers in textbook fragments. The other tells one continuous story - a system they built, the decisions inside it, the failures they fixed - and maps every question back onto it. Same knowledge. Very different offers. The difference was never effort. It was the shape of the preparation.',

  formalMeaning:
    'Interview preparation is not syllabus completion - it is retrieval training under pressure. You prepare by (1) anchoring every topic to one continuous project story, (2) practicing spoken answers out loud before reading model ones, and (3) prioritizing by interview weight: the topics that decide offers get depth, the rest get clean one-line definitions.',

  whyItExists:
    'Most candidates prepare like students: read notes, highlight, feel ready, then freeze when a stranger asks "why did you choose ECS over Lambda?" Reading builds recognition. Interviews test recall and reasoning out loud - a different muscle entirely. Without a strategy you also spend equal hours on equal topics, so a rarely-asked item eats the week that HashMap internals deserved. And without project stories attached, knowledge stays theoretical: the interviewer hears definitions, not engineering judgment, and senior roles are decided on judgment.',

  howItWorksInternally: [
    'Know the funnel you are preparing for. Typical backend hiring at consulting and product companies runs in three filters: (1) a screening round - often an AI/bot interview asking definitional questions and small coding prompts, (2) one or two technical rounds going deep on Core Java, Collections, Concurrency, Spring, JPA and SQL, and (3) a system-design-plus-behavioral round where they check whether you can own a service and talk to clients.',
    'Anchor everything to ONE story. In this track that story is ShopSphere - an online store built by Asutosh and Riya that grows from a laptop app into microservices on AWS. Every lesson continues it, so every fact you learn attaches to a scene you can replay in the interview.',
    'Study every lesson in four passes. Pass 1: read the story and intuition normally. Pass 2: cover the screen and explain the internal mechanism OUT LOUD in your own words - speaking is the actual interview skill. Pass 3: attempt every Scenario Drill before opening the model answer. Pass 4: recite the Rapid Fire answers until each fits in one breath.',
    'Prioritize in three lanes. Lane 1 (mastery): Collections, Concurrency, Transactions/JPA, Microservices, System Design - wrong answers here kill offers. Lane 2 (fluency): AWS services you claim on your resume - be able to justify choices, not name them. Lane 3 (definitions only): everything rare - one clean sentence each and move on.',
    'Close loops weekly. Mark lessons complete as you finish them, and once a week re-attempt the Scenario Drills of older lessons cold. If you cannot answer a drill you previously passed, it goes back into the current week - spaced repetition, not rereading.'
  ],

  diagrams: [
    {
      mermaid: 'flowchart TD\n    A["Every candidate enters the funnel"] --> B{"Round 1: Bot / Screening"}\n    B -->|"Definitions + basic code"| C["Clean one-line answers"]\n    B -->|"Fumble the basics"| X["Out - regardless of seniority"]\n    C --> D{"Round 2: Technical deep-dive"}\n    D -->|"Collections, Concurrency, Spring, JPA, SQL"| E{"Depth + judgment shown?"}\n    D -->|"Textbook fragments only"| X\n    E -->|Yes| F{"Round 3: Design + behavioral"}\n    F -->|"Owns a story, handles unknowns"| G["Offer"]\n    F -->|"Knowledge with no judgment"| H["Borderline / rejected"]',
      caption: 'Three filters. Round 1 kills the unprepared, Round 2 tests depth, Round 3 tests judgment. Prepare differently for each.'
    }
  ],

  mainComponents: [
    'ANALOGY ANCHOR - the whole track hangs on ShopSphere: Asutosh and Riya build an online store for handmade goods. It starts as one Spring Boot app on a laptop, becomes a monolith in production, splits into microservices, and lands on AWS with Docker and ECS. Every collection, annotation, and cloud service you meet plays a role in that journey - when you recall the scene, the concept comes with it.',
    'THE THREE LANES - Lane 1 mastery: Collections, Concurrency, @Transactional/JPA, Microservices, System Design. Lane 2 fluency: the AWS services on your resume (IAM, VPC, EC2/ECS, ALB, RDS, S3, CloudFront, Secrets Manager, CloudWatch). Lane 3 definitions: Vector/Stack-level trivia - one line each, never more.',
    'RAPID FIRE sections - built for bot/screening rounds. Each is written to be SPOKEN in one breath. Practice by answering out loud before revealing.',
    'SCENARIO DRILLS sections - built for technical rounds. Each drops you into a production situation. Answer out loud first; the struggle is the workout. Then compare with the model answer - notice the shape: approach first, specifics second, trade-off last.',
    'PROGRESS MARKERS - mark each lesson complete only after pass 4 (rapid fire recited). A completed lesson you cannot re-answer cold next week was not complete.'
  ],

  realWorldExamples: [
    'Bot round reality: "What is the difference between ArrayList and LinkedList?" answered cleanly in 20 seconds buys credibility; a rambling 90-second answer that misses cache-locality plants doubt for everything that follows.',
    'Technical round reality: "You said your platform serves thousands of requests daily - walk me through what happens in memory when your service looks up a product by SKU." Candidates anchored to a story draw the bucket array; candidates armed with definitions say "it uses hashing" and stop.',
    'Design round reality: "Design a shipment tracking system." There is no right answer to grade - there is only the quality of your questions, boundaries, and trade-offs. That skill is trained, not memorized, and this track trains it in the Microservices Drill module.'
  ],

  complexityAndTradeoffs: [
    'Depth vs breadth: mastering 6 Lane-1 topics beats skimming 60. A shallow pass over everything produces the worst outcome - familiarity without recall, which feels like knowing and performs like not knowing.',
    'Speaking practice vs more reading: one hour of answering out loud is worth roughly three hours of additional reading past your first pass. Interviews are spoken exams wearing a technical costume.',
    'Story-first vs fact-first: facts fade in days, scenes survive weeks. Anchoring costs nothing extra - the same study hour simply attaches each fact to a ShopSphere moment.',
    'Use this track when: you have weeks, not months, and the target role is Java backend / microservices on AWS. Avoid relying on it alone when: the JD leans on areas outside it (heavy frontend, data engineering) - branch out from the Learn section instead.'
  ],

  commonMistakes: [
    'Passive rereading until the interview eve. Looks harmless - you recognize every page. Hurts because recognition collapses under pressure; only retrieval practice (answering before looking) survives adrenaline. Fix: every study session is 50% answering out loud, capped at 50% reading.',
    'Collecting resources instead of finishing one. Ten playlists, zero mock answers. Hurts because switching sources resets your mental model each time. Fix: this track is the spine; anything else is optional depth linked from it.',
    'Skipping the "easy" bot-round basics because you have 4 years of experience. Hurts because round 1 does not know your years - it knows only your answers, and seniors get eliminated on definitions embarrassingly often. Fix: recite Rapid Fire even on topics you "obviously" know.',
    'Preparing topics with no attachment to your real projects. Hurts because Rounds 2-3 ask follow-ups like "where did YOU hit this?" and fabricated examples unravel under one probing question. Fix: attach every concept to ShopSphere here, and to your real project stories - the Project War Stories lesson collects those.'
  ],

  scenarioDrills: [
    {
      situation:
        'Round 2 begins. The interviewer has your resume open, glances at it for five seconds, and pushes it aside.',
      question: '"Before we start - tell me about your current project and your role in it."',
      answer:
        'Deliver a 90-second version you have rehearsed until it sounds unrehearsed. Shape: (1) what the system does for the business in one sentence, (2) scale numbers - users, requests, data volume, (3) the stack as architecture, not a keyword dump - "Spring Boot services behind an ALB, MySQL on RDS, deployed as Docker containers on ECS", (4) YOUR slice - the modules or services you personally owned, (5) one hard problem you fixed, held back as bait for follow-up. Practice until it lands between 80 and 100 seconds; shorter sounds thin, longer sounds rehearsed.'
    },
    {
      situation:
        'Deep in a Collections discussion, the interviewer asks something you genuinely never studied - say, the exact resizing strategy of some Map implementation you never opened.',
      question: 'How do you handle a question you flat-out do not know?',
      answer:
        'Never fake API details - interviewers smell fabrication and it poisons your correct answers too. Say plainly: "I have not worked with that specific implementation, but based on what I know about the family, I would expect it to..." - then reason from the nearest thing you DO know (most Maps are hash-based with similar resize behavior; tree structures buy ordered operations at log-n cost). This displays exactly what Round 2 grades: engineering reasoning under uncertainty. Then stop talking and let them redirect. One honest unknown is normal; three confident fabrications is rejection.'
    }
  ],

  rapidFire: [
    {
      question: 'What is a microservice?',
      answer:
        'A small, independently deployable service that owns one business capability and its own data, communicating with other services over the network - typically REST or messaging - instead of sharing a database.'
    },
    {
      question: 'What is Spring Boot?',
      answer:
        'An opinionated layer over Spring Framework that removes boilerplate through auto-configuration, starter dependencies, and an embedded server - so a production-ready REST service needs configuration, not setup.'
    },
    {
      question: 'What is Amazon EC2?',
      answer:
        'A virtual server in the AWS cloud whose compute capacity (CPU, RAM, OS) I choose, manage, and pay for by the second - the "rent a machine" model of hosting applications.'
    },
    {
      question: 'What is Docker?',
      answer:
        'A tool that packages an application with its runtime and dependencies into an image, which runs identically everywhere as a container - eliminating "works on my machine" between dev, CI, and production.'
    }
  ],

  interviewPerspective:
    'Nobody asks "what is your prep strategy?" - but every round silently grades it. Round 1 grades your definitions (Rapid Fire), Round 2 grades your mechanisms and judgment (Scenario Drills, internals), Round 3 grades your ownership story (ShopSphere + your real projects). When any question lands, route it: is this asking for a definition, a mechanism, or a decision? Answer in that shape and you sound senior at every level.',

  relatedConcepts: [
    {
      categoryId: 'interview-prep',
      topicId: 'collections-mastery',
      conceptId: 'collections-big-picture',
      title: 'Collections Big Picture',
      note: 'First stop of Lane 1 - the module interviewers weight heaviest at your experience level.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'java-collections',
      title: 'Java Collections (full Learn page)',
      note: 'The complete textbook treatment - come here when a prep lesson leaves you wanting the whole picture.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'streams',
      title: 'Streams (full Learn page)',
      note: 'Depth backup for the Java 8+ essentials you will be rapid-fired on.'
    }
  ],

  triggerSentence:
    'Definitions win round one, mechanisms win round two, stories win round three - train all three, on purpose.'
};
