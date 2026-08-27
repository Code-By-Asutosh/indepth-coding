import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/content.model';
import { CategoryProgress } from '../../../core/models/learning.model';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss'
})
export class CategoryCard {
  readonly category = input.required<Category>();
  readonly progress = input.required<CategoryProgress>();
  /** Zero-padded catalog number rendered by the UI (N°01…), independent of data. */
  readonly index = input(0);

  protected readonly PREVIEW_COUNT = 3;

  protected readonly catalogNo = computed(() => String(this.index() + 1).padStart(2, '0'));

  /** First few topic names as peek-through chips - see inside the shelf before opening it. */
  protected readonly topicPreview = computed(() => this.category().topics.slice(0, this.PREVIEW_COUNT));

  protected readonly hiddenTopicCount = computed(() =>
    Math.max(0, this.category().topics.length - this.PREVIEW_COUNT)
  );

  /** Meta-as-CTA: the counts ARE the invitation ("14 topics · 62 concepts"). */
  protected readonly metaLine = computed(
    () => `${this.category().topics.length} topics · ${this.conceptCount()} concepts`
  );

  /** SVG donut ring geometry (r=11, circumference ≈ 69.1). */
  protected readonly ring = computed(() => {
    const circumference = 2 * Math.PI * 11;
    const dash = (this.progress().percent / 100) * circumference;
    return { circumference, dash };
  });

  protected conceptCount(): number {
    return this.category().topics.reduce((sum, topic) => sum + topic.concepts.length, 0);
  }

  protected started(): boolean {
    return this.progress().percent > 0;
  }
}
