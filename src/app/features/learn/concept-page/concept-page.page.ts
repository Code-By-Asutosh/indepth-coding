import { Component, computed, inject, input, signal } from '@angular/core';
import { findCategory, findConcept, findTopic, flattenCategoryConcepts } from '../../../core/data/categories.data';
import { findConceptContent } from '../../../core/data/concepts';
import { ProgressService } from '../../../core/services/progress.service';
import { PrevNextNav, PrevNextTarget } from '../../../shared/components/prev-next-nav/prev-next-nav';

@Component({
  selector: 'app-concept-page',
  imports: [PrevNextNav],
  templateUrl: './concept-page.page.html',
  styleUrl: './concept-page.page.scss'
})
export class ConceptPagePage {
  private readonly progressService = inject(ProgressService);

  readonly categoryId = input.required<string>();
  readonly topicId = input.required<string>();
  readonly conceptId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));
  protected readonly topic = computed(() => findTopic(this.categoryId(), this.topicId()));
  protected readonly conceptSummary = computed(() => findConcept(this.categoryId(), this.topicId(), this.conceptId()));
  protected readonly content = computed(() => findConceptContent(this.categoryId(), this.topicId(), this.conceptId()));

  protected readonly isComplete = computed(() => this.progressService.isComplete(this.categoryId(), this.topicId(), this.conceptId()));

  protected readonly topicPosition = computed(() => {
    const concepts = this.topic()?.concepts ?? [];
    const index = concepts.findIndex((concept) => concept.id === this.conceptId());
    return { index: index + 1, total: concepts.length };
  });

  protected readonly copied = signal(false);

  private readonly orderedConcepts = computed(() => flattenCategoryConcepts(this.categoryId()));

  protected readonly prevTarget = computed<PrevNextTarget | null>(() => {
    const list = this.orderedConcepts();
    const index = list.findIndex(({ topicId, concept }) => topicId === this.topicId() && concept.id === this.conceptId());
    if (index <= 0) return null;
    const prev = list[index - 1];
    return { title: prev.concept.title, link: ['/learn', this.categoryId(), prev.topicId, prev.concept.id] };
  });

  protected readonly nextTarget = computed<PrevNextTarget | null>(() => {
    const list = this.orderedConcepts();
    const index = list.findIndex(({ topicId, concept }) => topicId === this.topicId() && concept.id === this.conceptId());
    if (index === -1 || index >= list.length - 1) return null;
    const next = list[index + 1];
    return { title: next.concept.title, link: ['/learn', this.categoryId(), next.topicId, next.concept.id] };
  });

  protected toggleComplete(): void {
    this.progressService.toggleComplete(this.categoryId(), this.topicId(), this.conceptId());
  }

  protected async copyCode(): Promise<void> {
    const code = this.content()?.showMe.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }
}
