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

/** One code sample shown in the "Show Me" stage. */
export interface ConceptCodeSample {
  language: string;
  code: string;
  caption?: string;
}

/** One competing approach shown in the "Alternatives" stage. */
export interface ConceptAlternative {
  name: string;
  whenToUse: string;
}

/** The fixed 10-stage flow every concept page follows, no exceptions. */
export interface ConceptContent {
  categoryId: string;
  topicId: string;
  conceptId: string;
  title: string;

  /** 1. The Hook */
  hook: string;
  /** 2. The Problem */
  problem: string;
  /** 3. The Aha (Core Idea) */
  aha: { statement: string; analogy: string };
  /** 4. Under the Hood */
  underTheHood: string[];
  /** 5. In the Wild */
  inTheWild: string[];
  /** 6. Show Me */
  showMe: ConceptCodeSample;
  /** 7. The Impact */
  impact: { before: string; after: string; metric?: string };
  /** 8. The Alternatives */
  alternatives: ConceptAlternative[];
  /** 9. The Trap */
  trap: string;
  /** 10. Prove It */
  proveIt: { question: string; answer?: string };

  /** Optional closer */
  oneLiner?: string;
  goDeeper?: string[];
}
