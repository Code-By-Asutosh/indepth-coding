import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CodeBlock } from '../../../shared/components/code-block/code-block';
import { AnswerValue } from '../models/assessment.model';
import { PracticeStateService } from '../services/practice-state.service';

@Component({
  selector: 'app-practice-assessment',
  imports: [FormsModule, CodeBlock],
  templateUrl: './practice-assessment.page.html',
  styleUrl: './practice-assessment.page.scss'
})
export class PracticeAssessmentPage {
  protected readonly state = inject(PracticeStateService);
  private readonly router = inject(Router);

  protected readonly reviewMode = signal(false);
  protected readonly submitting = this.state.evaluating;
  protected readonly errorMessage = this.state.errorMessage;

  protected readonly isLastQuestion = computed(() => this.state.currentIndex() === this.state.totalCount() - 1);
  protected readonly unansweredCount = computed(() => this.state.totalCount() - this.state.answeredCount());

  constructor() {
    if (!this.state.assessment()) {
      this.router.navigate(['/practice']);
    }
    inject(DestroyRef);
  }

  protected currentAnswerText(): string {
    const q = this.state.currentQuestion();
    if (!q) return '';
    const answer = this.state.answers()[q.id];
    return answer && 'text' in answer ? answer.text : '';
  }

  protected currentAnswerOption(): number {
    const q = this.state.currentQuestion();
    if (!q) return -1;
    const answer = this.state.answers()[q.id];
    return answer && 'optionIndex' in answer ? answer.optionIndex : -1;
  }

  protected selectOption(optionIndex: number): void {
    const q = this.state.currentQuestion();
    if (!q) return;
    this.state.setAnswer(q.id, { optionIndex } as AnswerValue);
  }

  protected onTextChange(value: string): void {
    const q = this.state.currentQuestion();
    if (!q) return;
    this.state.setAnswer(q.id, { text: value });
  }

  protected isAnswered(index: number): boolean {
    const question = this.state.assessment()?.questions[index];
    return !!question && question.id in this.state.answers();
  }

  protected goToReview(): void {
    this.reviewMode.set(true);
  }

  protected async submit(): Promise<void> {
    try {
      await this.state.submit();
      this.router.navigate(['/practice/results']);
    } catch {
      // errorMessage already set
    }
  }
}
