import { Injectable, signal } from '@angular/core';
import { flattenCategoryConcepts } from '../data/categories.data';

const STORAGE_KEY = 'indepth_coding_progress';

/** categoryId -> topicId -> conceptId -> completed */
type ProgressStore = Record<string, Record<string, Record<string, boolean>>>;

export interface CategoryProgress {
  completed: number;
  total: number;
  percent: number;
}

/**
 * Tracks concept completion in the browser only (localStorage) — no backend.
 * Powers the "X completed / Y pending" numbers on each dashboard.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly store = signal<ProgressStore>(this.load());

  private load(): ProgressStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProgressStore) : {};
    } catch {
      return {};
    }
  }

  private persist(next: ProgressStore): void {
    this.store.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (e.g. private browsing) — progress just won't persist */
    }
  }

  isComplete(categoryId: string, topicId: string, conceptId: string): boolean {
    return !!this.store()[categoryId]?.[topicId]?.[conceptId];
  }

  setComplete(categoryId: string, topicId: string, conceptId: string, complete: boolean): void {
    const next: ProgressStore = structuredClone(this.store());
    next[categoryId] ??= {};
    next[categoryId][topicId] ??= {};
    if (complete) {
      next[categoryId][topicId][conceptId] = true;
    } else {
      delete next[categoryId][topicId][conceptId];
    }
    this.persist(next);
  }

  toggleComplete(categoryId: string, topicId: string, conceptId: string): void {
    this.setComplete(categoryId, topicId, conceptId, !this.isComplete(categoryId, topicId, conceptId));
  }

  /** Completion snapshot for an entire category, across all its topics. Reads the store signal, so it stays reactive when called from a template. */
  categoryProgress(categoryId: string): CategoryProgress {
    const all = flattenCategoryConcepts(categoryId);
    const completed = all.filter(({ topicId, concept }) => this.isComplete(categoryId, topicId, concept.id)).length;
    const total = all.length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }

  /** Completion snapshot for a single topic within a category. */
  topicProgress(categoryId: string, topicId: string, conceptIds: string[]): CategoryProgress {
    const completed = conceptIds.filter((id) => this.isComplete(categoryId, topicId, id)).length;
    const total = conceptIds.length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }
}
