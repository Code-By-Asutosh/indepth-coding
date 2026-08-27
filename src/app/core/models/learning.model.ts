import { Importance } from './content.model';

/**
 * Learning progress domain types.
 *
 * Persisted shape (localStorage key `indepth_coding_progress_v2`): one compact
 * record per completed concept. Everything else — XP, levels, streaks,
 * activity — is DERIVED on read so the stored payload stays tiny even with
 * 400+ concepts in play.
 */

/** One completed concept. `c` = completion timestamp (epoch ms). */
export interface ConceptRecord {
  c: number;
}

export interface LearningStateV2 {
  version: 2;
  /** Keyed by composite `${categoryId}/${topicId}/${conceptId}`. */
  concepts: Record<string, ConceptRecord>;
}

export interface CategoryProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  /** null at the top of the ladder — nothing left to climb. */
  xpForNext: number | null;
  /** 0..1 progress through the current tier. */
  progress01: number;
}

export interface StreakInfo {
  /** Consecutive active days ending today (or yesterday, if today isn't logged yet). */
  current: number;
  longest: number;
  activeToday: boolean;
}

export interface ActivityItem {
  /** Composite concept key, stable for track-by. */
  key: string;
  title: string;
  /** routerLink array, e.g. ['/learn', categoryId, topicId, conceptId]. */
  link: string[];
  importance: Importance;
  completedAt: number;
}
