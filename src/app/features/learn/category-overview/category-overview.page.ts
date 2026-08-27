import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findCategory } from '../../../core/data/categories.data';
import { LearningStore } from '../../../core/services/learning-store.service';
import { ConceptSummary } from '../../../core/models/content.model';

@Component({
  selector: 'app-category-overview-page',
  imports: [RouterLink],
  templateUrl: './category-overview.page.html',
  styleUrl: './category-overview.page.scss'
})
export class CategoryOverviewPage {
  private readonly store = inject(LearningStore);

  readonly categoryId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));
  protected readonly progress = computed(() => this.store.categoryProgress(this.categoryId()));

  protected readonly totalConcepts = computed(
    () => this.category()?.topics.reduce((acc, t) => acc + t.concepts.length, 0) ?? 0
  );

  protected readonly totalCoreCount = computed(
    () => this.category()?.topics.flatMap((t) => t.concepts).filter((c) => c.importance === 'core').length ?? 0
  );

  protected readonly totalHighFreqCount = computed(
    () => this.category()?.topics.flatMap((t) => t.concepts).filter((c) => c.frequency === 'high').length ?? 0
  );

  protected readonly ringOffset = computed(() => {
    const p = this.progress().percent;
    return Math.max(0, Math.min(110, 110 - (p / 100) * 110));
  });

  protected topicProgress(topicId: string) {
    return this.store.topicProgress(this.categoryId(), topicId);
  }

  protected coreCount(concepts: ConceptSummary[]): number {
    return concepts.filter((concept) => concept.importance === 'core').length;
  }

  protected optionalCount(concepts: ConceptSummary[]): number {
    return concepts.filter((concept) => concept.importance === 'optional').length;
  }

  protected highFrequencyCount(concepts: ConceptSummary[]): number {
    return concepts.filter((concept) => concept.frequency === 'high').length;
  }

  protected firstConceptId(concepts: ConceptSummary[]): string | null {
    return concepts.length > 0 ? concepts[0].id : null;
  }

  protected isComplete(topicId: string, conceptId: string): boolean {
    return this.store.isComplete(this.categoryId(), topicId, conceptId);
  }
}
