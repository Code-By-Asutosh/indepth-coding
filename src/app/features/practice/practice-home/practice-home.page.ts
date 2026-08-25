import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AssessmentDifficulty } from '../models/assessment.model';
import { PracticeStateService } from '../services/practice-state.service';

const TOPIC_CHIPS = [
  'ArrayList',
  'HashMap',
  'Java Streams',
  'Spring @Transactional',
  'Spring Security',
  'REST API pagination',
  'Kafka consumer groups',
  'AWS S3',
  'MySQL indexes',
  'Microservices circuit breaker'
];

const LOADING_MESSAGES = [
  'Understanding the topic...',
  'Mapping the key sub-concepts...',
  'Designing real-world scenarios...',
  'Writing debugging and code challenges...',
  'Balancing question difficulty...',
  'Preparing your mock assessment...'
];

const DIFFICULTIES: AssessmentDifficulty[] = ['beginner', 'intermediate', 'advanced', 'interview-hard'];

@Component({
  selector: 'app-practice-home',
  imports: [FormsModule],
  templateUrl: './practice-home.page.html',
  styleUrl: './practice-home.page.scss'
})
export class PracticeHomePage {
  private readonly state = inject(PracticeStateService);
  private readonly router = inject(Router);

  protected readonly chips = TOPIC_CHIPS;
  protected readonly difficulties = DIFFICULTIES;
  protected readonly topic = signal('');
  protected readonly difficulty = signal<AssessmentDifficulty>('intermediate');
  protected readonly generating = this.state.generating;
  protected readonly errorMessage = this.state.errorMessage;
  protected readonly loadingMessage = signal(LOADING_MESSAGES[0]);

  private loadingTimer?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopLoadingRotation());
  }

  protected pickChip(chip: string): void {
    this.topic.set(chip);
  }

  protected async generate(): Promise<void> {
    const topic = this.topic().trim();
    if (!topic || this.generating()) return;

    this.startLoadingRotation();
    try {
      await this.state.generate(topic, this.difficulty(), null);
      this.router.navigate(['/practice/assessment']);
    } catch {
      // errorMessage signal already set by the state service
    } finally {
      this.stopLoadingRotation();
    }
  }

  private startLoadingRotation(): void {
    let i = 0;
    this.loadingMessage.set(LOADING_MESSAGES[0]);
    this.loadingTimer = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      this.loadingMessage.set(LOADING_MESSAGES[i]);
    }, 2600);
  }

  private stopLoadingRotation(): void {
    if (this.loadingTimer) clearInterval(this.loadingTimer);
    this.loadingTimer = undefined;
  }
}
