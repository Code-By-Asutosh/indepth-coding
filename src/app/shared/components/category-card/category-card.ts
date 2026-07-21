import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/content.model';
import { CategoryProgress } from '../../../core/services/progress.service';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss'
})
export class CategoryCard {
  readonly category = input.required<Category>();
  readonly progress = input.required<CategoryProgress>();

  protected topicCount(): number {
    return this.category().topics.length;
  }

  protected conceptCount(): number {
    return this.category().topics.reduce((sum, topic) => sum + topic.concepts.length, 0);
  }
}
