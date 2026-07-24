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

/** One code sample (language + snippet), used inside a bad/good comparison. */
export interface ConceptCode {
  language: string;
  code: string;
  /** Why this snippet is bad or good - shown right under the code. */
  explanation: string;
}

/** The "Show Me" stage is always a bad-approach vs good-approach pair, never a lone snippet. */
export interface ConceptCodeComparison {
  caption?: string;
  bad: ConceptCode;
  good: ConceptCode;
}

/** One competing approach shown in the "Alternatives" stage, rendered as a comparison table. */
export interface ConceptAlternative {
  name: string;
  whenToUse: string;
  whenNotToUse: string;
}

/** One structural entry in "The Trap" - a real mistake people make, not just a warning. */
export interface ConceptMistake {
  /** The mistake, told like a mini war story. */
  mistake: string;
  /** Why it happens / why it seems reasonable at the time. */
  why: string;
  /** The fix, in plain terms. */
  fix: string;
}

/**
 * A link to a related concept, used to weave the site into a connected web
 * instead of 398 isolated pages. `note` explains WHY they're connected (e.g.
 * "same race condition we saw in Wait vs Sleep vs Yield") so the reader gets
 * the payoff of recognizing a pattern, not just a "see also" link.
 */
export interface ConceptConnection {
  categoryId: string;
  topicId: string;
  conceptId: string;
  title: string;
  note: string;
}

/** A Mermaid diagram embedded inline where a visual genuinely clarifies faster than prose. */
export interface ConceptDiagram {
  /** Mermaid diagram definition text (flowchart, classDiagram, sequenceDiagram, ...). */
  mermaid: string;
  caption?: string;
}

/**
 * The content of a concept page. Every concept covers the same underlying
 * ground (a hook, the core idea, how it works, an example, trade-offs,
 * common mistakes, a self-check) but the PAGE ITSELF never labels these as
 * "stages" - it just reads as well-written, natural learning material.
 * Depth and exact length are expected to vary concept to concept.
 */
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
  /** 4. Under the Hood - numbered steps, can be as deep as needed to survive cross-questions. */
  underTheHood: string[];
  /** Optional diagram(s) shown alongside the mechanics explanation. */
  diagrams?: ConceptDiagram[];
  /** 5. In the Wild */
  inTheWild: string[];
  /** 6. Show Me - always bad approach vs good approach, each explained. */
  showMe: ConceptCodeComparison;
  /** 7. The Impact */
  impact: { before: string; after: string; metric?: string };
  /** 8. The Alternatives - comparison table: when to use / when not to. */
  alternatives: ConceptAlternative[];
  /** 9. The Trap - one or more real mistakes, each as mistake/why/fix. */
  commonMistakes: ConceptMistake[];
  /** 10. Prove It */
  proveIt: { question: string; answer?: string };

  /** Optional closer */
  oneLiner?: string;
  connections?: ConceptConnection[];
}
