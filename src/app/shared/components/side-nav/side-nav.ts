import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Category, Topic } from '../../../core/models/content.model';
import { CATEGORIES } from '../../../core/data/categories.data';
import { LearningStore } from '../../../core/services/learning-store.service';

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav {
  private readonly store = inject(LearningStore);

  readonly category = input.required<Category>();
  /** Topic id that should be (auto-)expanded, e.g. the one containing the active concept. */
  readonly activeTopicId = input<string | null>(null);

  /** Emitted when the user clicks the collapse button. */
  readonly collapse = output<void>();

  /** Topics the user has expanded. Manual toggles persist across navigation - never force-collapsed. */
  protected readonly expandedTopics = signal<Set<string>>(new Set());

  /** Category switcher dropdown visibility. */
  protected readonly categorySwitchOpen = signal(false);

  protected readonly allCategories = computed(() => CATEGORIES.filter((c) => !c.hidden));

  protected readonly ringOffset = computed(() => {
    const p = this.categoryProgress().percent;
    // Circumference for r=17.5 is 2 * PI * 17.5 = 110
    return Math.max(0, Math.min(110, 110 - (p / 100) * 110));
  });

  constructor() {
    effect(() => {
      const topicId = this.activeTopicId();
      if (!topicId) return;
      this.expandedTopics.update((current) => (current.has(topicId) ? current : new Set(current).add(topicId)));
    });
  }

  protected isExpanded(topicId: string): boolean {
    return this.expandedTopics().has(topicId);
  }

  protected toggleTopic(topicId: string): void {
    this.expandedTopics.update((current) => {
      const next = new Set(current);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  }

  protected toggleCategorySwitch(): void {
    this.categorySwitchOpen.update((v) => !v);
  }

  protected closeCategorySwitch(): void {
    this.categorySwitchOpen.set(false);
  }

  protected isComplete(topicId: string, conceptId: string): boolean {
    return this.store.isComplete(this.category().id, topicId, conceptId);
  }

  protected topicProgressLabel(topic: Topic): string {
    const { completed, total } = this.store.topicProgress(this.category().id, topic.id);
    return `${completed}/${total}`;
  }

  protected categoryProgress() {
    return this.store.categoryProgress(this.category().id);
  }
}
