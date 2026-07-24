import { Component, computed, DestroyRef, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findCategory, findConcept, findTopic, flattenCategoryConcepts } from '../../../core/data/categories.data';
import { findConceptContent } from '../../../core/data/concepts';
import { ProgressService } from '../../../core/services/progress.service';
import { ActivePageContextService } from '../../../core/services/active-page-context.service';
import { PrevNextNav, PrevNextTarget } from '../../../shared/components/prev-next-nav/prev-next-nav';
import { CodeBlock } from '../../../shared/components/code-block/code-block';
import { Diagram } from '../../../shared/components/diagram/diagram';

@Component({
  selector: 'app-concept-page',
  imports: [PrevNextNav, RouterLink, CodeBlock, Diagram],
  templateUrl: './concept-page.page.html',
  styleUrl: './concept-page.page.scss'
})
export class ConceptPagePage {
  private readonly progressService = inject(ProgressService);
  private readonly activePageContext = inject(ActivePageContextService);

  readonly categoryId = input.required<string>();
  readonly topicId = input.required<string>();
  readonly conceptId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));
  protected readonly topic = computed(() => findTopic(this.categoryId(), this.topicId()));
  protected readonly conceptSummary = computed(() => findConcept(this.categoryId(), this.topicId(), this.conceptId()));
  protected readonly content = computed(() => findConceptContent(this.categoryId(), this.topicId(), this.conceptId()));

  constructor() {
    // Keep the global AI helper aware of whichever concept is currently open.
    effect(() => this.activePageContext.setActiveConcept(this.content() ?? null));
    inject(DestroyRef).onDestroy(() => this.activePageContext.clear());
  }

  protected readonly isComplete = computed(() => this.progressService.isComplete(this.categoryId(), this.topicId(), this.conceptId()));

  protected readonly topicPosition = computed(() => {
    const concepts = this.topic()?.concepts ?? [];
    const index = concepts.findIndex((concept) => concept.id === this.conceptId());
    return { index: index + 1, total: concepts.length };
  });

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
}
