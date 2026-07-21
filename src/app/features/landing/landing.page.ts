import { Component, inject } from '@angular/core';
import { CATEGORIES } from '../../core/data/categories.data';
import { ProgressService } from '../../core/services/progress.service';
import { CategoryCard } from '../../shared/components/category-card/category-card';

@Component({
  selector: 'app-landing-page',
  imports: [CategoryCard],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss'
})
export class LandingPage {
  private readonly progressService = inject(ProgressService);

  protected readonly categories = CATEGORIES;

  protected progressFor(categoryId: string) {
    return this.progressService.categoryProgress(categoryId);
  }

  protected totalTopics(): number {
    return this.categories.reduce((sum, category) => sum + category.topics.length, 0);
  }

  protected totalConcepts(): number {
    return this.categories.reduce(
      (sum, category) => sum + category.topics.reduce((topicSum, topic) => topicSum + topic.concepts.length, 0),
      0
    );
  }
}
