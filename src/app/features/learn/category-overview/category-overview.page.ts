import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findCategory } from '../../../core/data/categories.data';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-category-overview-page',
  imports: [RouterLink],
  templateUrl: './category-overview.page.html',
  styleUrl: './category-overview.page.scss'
})
export class CategoryOverviewPage {
  private readonly progressService = inject(ProgressService);

  readonly categoryId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));
  protected readonly progress = computed(() => this.progressService.categoryProgress(this.categoryId()));

  protected topicProgress(topicId: string, conceptIds: string[]) {
    return this.progressService.topicProgress(this.categoryId(), topicId, conceptIds);
  }

  protected conceptIds(concepts: { id: string }[]): string[] {
    return concepts.map((concept) => concept.id);
  }

  protected coreCount(conceptIds: { importance: string }[]): number {
    return conceptIds.filter((concept) => concept.importance === 'core').length;
  }

  protected optionalCount(conceptIds: { importance: string }[]): number {
    return conceptIds.filter((concept) => concept.importance === 'optional').length;
  }

  protected highFrequencyCount(concepts: { frequency: string }[]): number {
    return concepts.filter((concept) => concept.frequency === 'high').length;
  }

  protected firstConceptId(concepts: { id: string }[]): string | null {
    return concepts.length > 0 ? concepts[0].id : null;
  }
}
