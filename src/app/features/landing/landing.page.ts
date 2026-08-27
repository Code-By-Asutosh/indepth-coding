import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VISIBLE_CATEGORIES } from '../../core/data/categories.data';
import { LearningStore } from '../../core/services/learning-store.service';
import { CategoryCard } from '../../shared/components/category-card/category-card';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, CategoryCard],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss'
})
export class LandingPage {
  private readonly store = inject(LearningStore);

  protected readonly categories = VISIBLE_CATEGORIES;

  protected readonly totalTopics = VISIBLE_CATEGORIES.reduce((sum, category) => sum + category.topics.length, 0);
  protected readonly totalConcepts = VISIBLE_CATEGORIES.reduce(
    (sum, category) => sum + category.topics.reduce((topicSum, topic) => topicSum + topic.concepts.length, 0),
    0
  );

  /** Shown in the hero when the visitor already has momentum. */
  protected readonly streak = computed(() => this.store.streak());

  protected progressFor(categoryId: string) {
    return this.store.categoryProgress(categoryId);
  }
}
