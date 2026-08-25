/**
 * Core content models for the Indepth Coding site.
 *
 * Structure: Category -> Topic -> Concept.
 * A `ConceptSummary` is just enough data to render nav/dashboards/progress
 * before the full 10-stage content for that concept has been written.
 * `ConceptContent` (added incrementally, keyed by id) holds the real page.
 */

export type Importance = 'core' | 'important' | 'optional';
export type Frequency = 'high' | 'medium' | 'low';

export interface ConceptSummary {
  /** Unique within its parent topic, e.g. "jvm-internals". */
  id: string;
  title: string;
  importance: Importance;
  frequency: Frequency;
}

export interface Topic {
  /** Unique within its parent category. */
  id: string;
  title: string;
  concepts: ConceptSummary[];
}

export interface Category {
  /** Unique across the whole site, used in routing: /learn/:categoryId. */
  id: string;
  title: string;
  tagline: string;
  /** Emoji icon shown on the landing page card + side nav. */
  icon: string;
  topics: Topic[];
}

/** A Mermaid diagram embedded inline where a visual genuinely clarifies faster than prose. */
export interface ConceptDiagram {
  /** Mermaid diagram definition text (flowchart, classDiagram, sequenceDiagram, ...). */
  mermaid: string;
  caption?: string;
}

/** A real, runnable code sample illustrating the concept. */
export interface ConceptCodeExample {
  language: string;
  code: string;
  /** What this snippet actually shows / why it looks this way. */
  explanation: string;
}

/**
 * A link to another concept in the tree - used for BOTH prerequisites (what
 * to learn first) and related concepts (what to explore next), so no
 * concept is ever an isolated page. `note` explains WHY they're linked.
 */
export interface ConceptLink {
  categoryId: string;
  topicId: string;
  conceptId: string;
  title: string;
  note?: string;
}

/**
 * Which of the 6 explanation shapes a topic uses - decided BEFORE writing,
 * because a Concept, a Framework, a Data Structure, an Algorithm, a Runtime
 * Internal, and a System/Architecture topic each need a different lens.
 */
export type TopicType = 'concept' | 'framework' | 'data-structure' | 'algorithm' | 'runtime-internals' | 'system-architecture';

/**
 * A guided interview war-game: a realistic situation a candidate is dropped
 * into, the question the interviewer actually asks about it, and a model
 * answer spoken the way a strong senior candidate would deliver it
 * (approach first, specifics second). Used by the interview-prep track.
 */
export interface ScenarioDrill {
  /** The concrete setup - project, constraint, what already went wrong. */
  situation: string;
  /** What the interviewer asks, verbatim style. */
  question: string;
  /** The strong answer - reasoning out loud, not a definition. */
  answer: string;
}

/** One-line definitional Q&A - armor for AI/bot screening rounds that fire rapid basic questions. */
export interface RapidFireItem {
  question: string;
  /** A crisp, speakable 1-3 sentence answer - short enough to memorize as a sentence, not a paragraph. */
  answer: string;
}

/**
 * The content of a concept page, following the Learning Framework v2
 * article template (10 fixed sections, always in this order) PLUS the
 * connected-knowledge-tree metadata (prerequisites, code, related
 * concepts) that turns isolated pages into a real knowledge graph. The
 * page itself never labels these as "stages" - it reads as natural
 * learning material - but the underlying data always has this exact shape.
 */
export interface ConceptContent {
  categoryId: string;
  topicId: string;
  conceptId: string;
  title: string;
  topicType: TopicType;

  /** Topics that should be understood BEFORE this one - the tree's edges going backward. */
  prerequisites?: ConceptLink[];

  /** 1. Simple intuition - explained like to someone brand new to it. */
  simpleIntuition: string;
  /** 2. Formal meaning - the proper, textbook definition. */
  formalMeaning: string;
  /** 3. Why it exists - the problem it solves. */
  whyItExists: string;
  /** 4. How it works internally - the actual mechanism, numbered steps. */
  howItWorksInternally: string[];
  /** Optional diagram(s) illustrating the internal mechanism. */
  diagrams?: ConceptDiagram[];
  /** Real, runnable code illustrating the mechanism - every concept should have this where applicable. */
  codeExamples?: ConceptCodeExample[];
  /** 5. Main components or rules - the topic broken into its key parts. */
  mainComponents: string[];
  /** 6. Real-world examples - where this actually shows up. */
  realWorldExamples: string[];
  /** 7. Complexity / tradeoffs - speed, memory, reliability, or cost. */
  complexityAndTradeoffs: string[];
  /** 8. Common mistakes - what people get wrong, and why it happens. */
  commonMistakes: string[];
  /** Interview war-room: realistic scenario questions with model answers (interview-prep track). */
  scenarioDrills?: ScenarioDrill[];
  /** Bot-round armor: rapid-fire definitional Q&As to recite aloud (interview-prep track). */
  rapidFire?: RapidFireItem[];
  /** 9. Interview perspective - how this is typically asked about / framed. */
  interviewPerspective: string;
  /** 10. Trigger sentence - one short line to recognize it again in future. */
  triggerSentence: string;

  /** Related concepts to explore next - the tree's edges going forward, keeps the site a connected web. */
  relatedConcepts?: ConceptLink[];
}

