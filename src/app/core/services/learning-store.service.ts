import { Injectable, signal } from '@angular/core';
import { CATEGORIES, flattenCategoryConcepts } from '../data/categories.data';
import { Importance } from '../models/content.model';
import {
  ActivityItem,
  CategoryProgress,
  ConceptRecord,
  LearningStateV2,
  LevelInfo,
  StreakInfo
} from '../models/learning.model';
import { levelForXp } from '../utils/level';

export const STORAGE_KEY = 'indepth_coding_progress_v2';
export const LEGACY_STORAGE_KEY = 'indepth_coding_progress';

/** XP awarded per completed concept, by its declared importance. */
const XP_BY_IMPORTANCE: Record<Importance, number> = { core: 100, important: 60, optional: 30 };

interface ConceptMeta {
  title: string;
  categoryId: string;
  topicId: string;
  conceptId: string;
  importance: Importance;
}

/**
 * Static index over the category tree, built once per app lifetime:
 * composite key -> concept metadata. Lets the store resolve XP weights,
 * activity titles and next-up targets from stored keys in O(1).
 */
const CONCEPT_INDEX = new Map<string, ConceptMeta>(
  CATEGORIES.flatMap((category) =>
    category.topics.flatMap((topic) =>
      topic.concepts.map((concept) => [
        `${category.id}/${topic.id}/${concept.id}`,
        {
          title: concept.title,
          categoryId: category.id,
          topicId: topic.id,
          conceptId: concept.id,
          importance: concept.importance
        } satisfies ConceptMeta
      ])
    )
  )
);

/** LOCAL-timezone `YYYY-MM-DD` key for a timestamp. Never use toISOString() here — it's UTC and would shift the day boundary for the IST-based owner. */
function localDateKey(ms: number): string {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Steps a timestamp by whole calendar days (DST-safe — uses setDate, not ms arithmetic). */
function addDays(ms: number, days: number): number {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Reactive learning-progress store: completion records in localStorage,
 * everything else derived. Replaces the old boolean-only ProgressService
 * (schema v1) with timestamps so streaks, activity feeds and XP are possible.
 *
 * Zoneless note: every mutation is a synchronous signal write followed by a
 * guarded localStorage persist - no awaits anywhere.
 */
@Injectable({ providedIn: 'root' })
export class LearningStore {
  private readonly state = signal<LearningStateV2>(this.load());

  // ---- writes -------------------------------------------------------------

  isComplete(categoryId: string, topicId: string, conceptId: string): boolean {
    return !!this.state().concepts[`${categoryId}/${topicId}/${conceptId}`];
  }

  setComplete(categoryId: string, topicId: string, conceptId: string, complete: boolean): void {
    const key = `${categoryId}/${topicId}/${conceptId}`;
    const concepts = { ...this.state().concepts };
    if (complete) {
      concepts[key] = { c: Date.now() };
    } else {
      delete concepts[key];
    }
    this.persist({ version: 2, concepts });
  }

  toggleComplete(categoryId: string, topicId: string, conceptId: string): void {
    this.setComplete(categoryId, topicId, conceptId, !this.isComplete(categoryId, topicId, conceptId));
  }

  // ---- derived selectors ----------------------------------------------------
  // All read this.state(), so templates calling them stay reactive.

  /** Completion snapshot across an entire category. */
  categoryProgress(categoryId: string): CategoryProgress {
    return this.progressFor(flattenCategoryConcepts(categoryId).map(({ topicId, concept }) => `${categoryId}/${topicId}/${concept.id}`));
  }

  /** Completion snapshot for one topic within a category. */
  topicProgress(categoryId: string, topicId: string): CategoryProgress {
    const concepts = CATEGORIES.find((c) => c.id === categoryId)?.topics.find((t) => t.id === topicId)?.concepts ?? [];
    return this.progressFor(concepts.map((concept) => `${categoryId}/${topicId}/${concept.id}`));
  }

  /** Site-wide completion across every category. */
  overallProgress(): CategoryProgress {
    const keys: string[] = [];
    for (const category of CATEGORIES) {
      for (const { topicId, concept } of flattenCategoryConcepts(category.id)) {
        keys.push(`${category.id}/${topicId}/${concept.id}`);
      }
    }
    return this.progressFor(keys);
  }

  /** Total XP earned: importance-weighted sum over completed concepts. Derived, never persisted. */
  xp(): number {
    let total = 0;
    for (const key of Object.keys(this.state().concepts)) {
      const meta = CONCEPT_INDEX.get(key);
      if (meta) total += XP_BY_IMPORTANCE[meta.importance];
    }
    return total;
  }

  level(): LevelInfo {
    return levelForXp(this.xp());
  }

  /**
   * Day-streak info. "Current" counts consecutive active days ending today;
   * if today has no activity yet, the chain ending yesterday still counts
   * (the day isn't over — same grace model Wordle uses).
   */
  streak(): StreakInfo {
    const dates = this.activeDates();
    const now = Date.now();
    const todayKey = localDateKey(now);
    const yesterdayKey = localDateKey(addDays(now, -1));

    let cursor = dates.has(todayKey) ? startOfDay(now) : addDays(startOfDay(now), -1);
    let current = 0;
    while (dates.has(localDateKey(cursor))) {
      current++;
      cursor = addDays(cursor, -1);
    }

    return { current, longest: this.longestStreak(dates), activeToday: dates.has(todayKey) };
  }

  /** Active-day -> completion count map (LOCAL date keys), bounded to the last year. Powers the dashboard calendar. */
  activeDates(): Map<string, number> {
    const cutoff = addDays(Date.now(), -366);
    const dates = new Map<string, number>();
    for (const record of Object.values(this.state().concepts)) {
      if (record.c < cutoff) continue;
      const key = localDateKey(record.c);
      dates.set(key, (dates.get(key) ?? 0) + 1);
    }
    return dates;
  }

  /** Most recent completions, newest first, resolved to titles + router links. */
  recentActivity(limit = 12): ActivityItem[] {
    return Object.entries(this.state().concepts)
      .sort(([, a], [, b]) => b.c - a.c)
      .slice(0, limit)
      .flatMap(([key, record]) => {
        const meta = CONCEPT_INDEX.get(key);
        if (!meta) return [];
        return [
          {
            key,
            title: meta.title,
            link: ['/learn', meta.categoryId, meta.topicId, meta.conceptId],
            importance: meta.importance,
            completedAt: record.c
          } satisfies ActivityItem
        ];
      });
  }

  /**
   * The next thing to learn: first uncompleted concept in curriculum order
   * (interview-prep leads the tree). null when everything is done.
   */
  nextUp(): ActivityItem | null {
    for (const category of CATEGORIES) {
      for (const topic of category.topics) {
        for (const concept of topic.concepts) {
          const key = `${category.id}/${topic.id}/${concept.id}`;
          if (!this.state().concepts[key]) {
            return {
              key,
              title: concept.title,
              link: ['/learn', category.id, topic.id, concept.id],
              importance: concept.importance,
              completedAt: 0
            };
          }
        }
      }
    }
    return null;
  }

  // ---- internals ----------------------------------------------------------

  private progressFor(keys: string[]): CategoryProgress {
    const concepts = this.state().concepts;
    const completed = keys.reduce((sum, key) => sum + (concepts[key] ? 1 : 0), 0);
    const total = keys.length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }

  private longestStreak(dates: Map<string, number>): number {
    const sorted = [...dates.keys()].sort();
    let longest = 0;
    let run = 0;
    let prev: number | null = null;
    for (const key of sorted) {
      const [y, m, d] = key.split('-').map(Number);
      const time = new Date(y, m - 1, d).getTime();
      run = prev !== null && addDays(prev, 1) === time ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = time;
    }
    return longest;
  }

  private load(): LearningStateV2 {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LearningStateV2;
        if (parsed?.version === 2 && typeof parsed.concepts === 'object') {
          return parsed;
        }
      }
    } catch {
      return { version: 2, concepts: {} };
    }

    // One-time v1 -> v2 migration: legacy store held plain booleans with no
    // timestamps, so migrated completions are stamped at migration instant
    // (activity feeds will show them as "today" once - accepted tradeoff).
    // The legacy key is intentionally LEFT in place as a natural backup.
    const migrated: LearningStateV2 = { version: 2, concepts: {} };
    try {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as Record<string, Record<string, Record<string, boolean>>>;
        const stamp = Date.now();
        for (const [categoryId, topics] of Object.entries(legacy)) {
          for (const [topicId, conceptMap] of Object.entries(topics)) {
            for (const [conceptId, done] of Object.entries(conceptMap)) {
              if (done) migrated.concepts[`${categoryId}/${topicId}/${conceptId}`] = { c: stamp };
            }
          }
        }
      }
    } catch {
      /* unreadable legacy data -> start clean */
    }
    this.writeStorage(migrated);
    return migrated;
  }

  private persist(next: LearningStateV2): void {
    this.state.set(next);
    this.writeStorage(next);
  }

  private writeStorage(state: LearningStateV2): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (e.g. private browsing) - progress just won't persist */
    }
  }
}
