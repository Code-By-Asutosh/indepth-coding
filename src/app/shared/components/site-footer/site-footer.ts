import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VISIBLE_CATEGORIES } from '../../../core/data/categories.data';
import { findConceptContent } from '../../../core/data/concepts/index';
import { CategoryProgress } from '../../../core/models/learning.model';
import { LearningStore } from '../../../core/services/learning-store.service';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss'
})
export class SiteFooter {
  private readonly store = inject(LearningStore);

  protected readonly featuredCategories = VISIBLE_CATEGORIES.slice(0, 5);
  protected readonly totalCategories = VISIBLE_CATEGORIES.length;
  protected readonly totalTopics = VISIBLE_CATEGORIES.reduce((sum, c) => sum + c.topics.length, 0);
  protected readonly totalConcepts = VISIBLE_CATEGORIES.reduce(
    (sum, c) => sum + c.topics.reduce((t, topic) => t + topic.concepts.length, 0),
    0
  );
  /** Concepts that actually have written content behind them. */
  protected readonly writtenCount = VISIBLE_CATEGORIES.reduce((sum, category) => {
    return (
      sum +
      category.topics.reduce(
        (topicSum, topic) =>
          topicSum + topic.concepts.filter((concept) => !!findConceptContent(category.id, topic.id, concept.id)).length,
        0
      )
    );
  }, 0);

  protected readonly year = new Date().getFullYear();

  /** Site-wide completion across every category - shown in the status strip. */
  protected overall(): CategoryProgress {
    return this.store.overallProgress();
  }
}
