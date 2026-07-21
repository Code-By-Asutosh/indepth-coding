import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Category, Topic } from '../../../core/models/content.model';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav {
  private readonly progress = inject(ProgressService);

  readonly category = input.required<Category>();
  /** Topic id that should be (auto-)expanded, e.g. the one containing the active concept. */
  readonly activeTopicId = input<string | null>(null);

  /** Topics the user has expanded. Manual toggles persist across navigation — never force-collapsed. */
  protected readonly expandedTopics = signal<Set<string>>(new Set());

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

  protected isComplete(topicId: string, conceptId: string): boolean {
    return this.progress.isComplete(this.category().id, topicId, conceptId);
  }

  protected topicProgressLabel(topic: Topic): string {
    const conceptIds = topic.concepts.map((concept) => concept.id);
    const { completed, total } = this.progress.topicProgress(this.category().id, topic.id, conceptIds);
    return `${completed}/${total}`;
  }

  protected categoryProgress() {
    return this.progress.categoryProgress(this.category().id);
  }
}
