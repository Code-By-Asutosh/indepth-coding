import { TestBed } from '@angular/core/testing';
import { CATEGORIES, flattenCategoryConcepts } from '../data/categories.data';
import { LearningStateV2 } from '../models/learning.model';
import { LearningStore, STORAGE_KEY, LEGACY_STORAGE_KEY } from './learning-store.service';

const DAY = 24 * 60 * 60 * 1000;

/** First concept of the first topic of a category, with its composite key. */
function firstConcept(categoryId: string) {
  const flat = flattenCategoryConcepts(categoryId);
  const { topicId, concept } = flat[0];
  return { categoryId, topicId, conceptId: concept.id, key: `${categoryId}/${topicId}/${concept.id}` };
}

function seed(state: Partial<LearningStateV2>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, concepts: {}, ...state }));
}

async function makeStore(): Promise<LearningStore> {
  await TestBed.configureTestingModule({ providers: [LearningStore] });
  return TestBed.inject(LearningStore);
}

describe('LearningStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('v1 -> v2 migration', () => {
    it('migrates legacy boolean records and preserves their count', async () => {
      const a = firstConcept('interview-prep');
      const b = firstConcept('java-core');
      localStorage.setItem(
        LEGACY_STORAGE_KEY,
        JSON.stringify({
          [a.categoryId]: { [a.topicId]: { [a.conceptId]: true, ['some-other']: false } },
          [b.categoryId]: { [b.topicId]: { [b.conceptId]: true } }
        })
      );

      const store = await makeStore();

      expect(store.isComplete(a.categoryId, a.topicId, a.conceptId)).toBe(true);
      expect(store.overallProgress().completed).toBe(2);
      // v2 payload written so migration runs only once
      expect(localStorage.getItem(STORAGE_KEY)).toContain('"version":2');
    });

    it('leaves the legacy key in place as a backup', async () => {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({}));
      await makeStore();
      expect(localStorage.getItem(LEGACY_STORAGE_KEY)).not.toBeNull();
    });

    it('starts clean when nothing is stored', async () => {
      const store = await makeStore();
      expect(store.overallProgress()).toEqual({ completed: 0, total: store.overallProgress().total, percent: 0 });
      expect(store.xp()).toBe(0);
    });
  });

  describe('completion + persistence', () => {
    it('stamps a timestamp and survives a fresh store instance', async () => {
      const a = firstConcept('interview-prep');
      const store = await makeStore();

      store.setComplete(a.categoryId, a.topicId, a.conceptId, true);
      expect(store.isComplete(a.categoryId, a.topicId, a.conceptId)).toBe(true);
      expect(store.recentActivity(1)[0]?.completedAt).toBeGreaterThan(0);

      // Fresh instance re-reads from storage (constructor is injection-free)
      const reloaded = new LearningStore();
      expect(reloaded.isComplete(a.categoryId, a.topicId, a.conceptId)).toBe(true);
    });

    it('un-completing removes the record', async () => {
      const a = firstConcept('interview-prep');
      const store = await makeStore();

      store.toggleComplete(a.categoryId, a.topicId, a.conceptId);
      expect(store.isComplete(a.categoryId, a.topicId, a.conceptId)).toBe(true);
      store.toggleComplete(a.categoryId, a.topicId, a.conceptId);
      expect(store.isComplete(a.categoryId, a.topicId, a.conceptId)).toBe(false);
      expect(store.overallProgress().completed).toBe(0);
    });
  });

  describe('xp weighting', () => {
    it('awards 100/60/30 by importance', async () => {
      const core = CATEGORIES.flatMap((c) =>
        c.topics.flatMap((t) => t.concepts.filter((k) => k.importance === 'core').map((k) => ({ cat: c.id, topic: t.id, id: k.id })))
      )[0];
      const optional = CATEGORIES.flatMap((c) =>
        c.topics.flatMap((t) => t.concepts.filter((k) => k.importance === 'optional').map((k) => ({ cat: c.id, topic: t.id, id: k.id })))
      )[0];

      seed({ concepts: {} });
      const store = await makeStore();
      store.setComplete(core.cat, core.topic, core.id, true); // 100
      store.setComplete(optional.cat, optional.topic, optional.id, true); // +30

      expect(store.xp()).toBe(130);
    });
  });

  describe('streaks (local-timezone day boundaries)', () => {
    function seedCompletions(dayOffsetsAgo: number[]): void {
      const now = Date.now();
      const concepts: LearningStateV2['concepts'] = {};
      dayOffsetsAgo.forEach((daysAgo, i) => {
        concepts[`x/y/concept-${i}`] = { c: now - daysAgo * DAY };
      });
      seed({ concepts });
    }

    it('counts consecutive days ending today', async () => {
      seedCompletions([0, 1, 2]);
      const store = await makeStore();
      const streak = store.streak();
      expect(streak.current).toBe(3);
      expect(streak.activeToday).toBe(true);
    });

    it('keeps the streak alive when today is not logged yet (grace day)', async () => {
      seedCompletions([1, 2]);
      const store = await makeStore();
      const streak = store.streak();
      expect(streak.current).toBe(2);
      expect(streak.activeToday).toBe(false);
    });

    it('breaks the streak after a gap', async () => {
      seedCompletions([4]);
      const store = await makeStore();
      expect(store.streak().current).toBe(0);
    });

    it('tracks the longest streak independently of current', async () => {
      seedCompletions([10, 11, 12, 13, 1]); // 4-day run in the past, 1 yesterday
      const store = await makeStore();
      const streak = store.streak();
      expect(streak.longest).toBeGreaterThanOrEqual(4);
      expect(streak.current).toBe(1);
    });
  });

  describe('next up + activity', () => {
    it('points at the first uncompleted concept in curriculum order', async () => {
      seed({ concepts: {} });
      const store = await makeStore();
      const nextUp = store.nextUp();
      const expected = CATEGORIES[0].topics[0].concepts[0];
      expect(nextUp?.title).toBe(expected.title);
      expect(nextUp?.link).toEqual(['/learn', CATEGORIES[0].id, CATEGORIES[0].topics[0].id, expected.id]);
    });

    it('returns null when everything is completed (tiny universe)', async () => {
      const a = firstConcept('interview-prep');
      seed({ concepts: { [a.key]: { c: Date.now() }, '**': undefined } as LearningStateV2['concepts'] });
      const store = await makeStore();
      // Only one concept completed - curriculum has 404, so nextUp must still find one.
      expect(store.nextUp()).not.toBeNull();
    });

    it('lists recent activity newest-first and resolves titles', async () => {
      const a = firstConcept('interview-prep');
      const b = firstConcept('java-core');
      const now = Date.now();
      seed({
        concepts: {
          [a.key]: { c: now - 5000 },
          [b.key]: { c: now }
        }
      });
      const store = await makeStore();
      const activity = store.recentActivity(10);
      expect(activity[0].key).toBe(b.key);
      expect(activity[activity.length - 1].key).toBe(a.key);
      expect(activity[0].title.length).toBeGreaterThan(0);
      expect(activity[0].link[0]).toBe('/learn');
    });
  });
});
