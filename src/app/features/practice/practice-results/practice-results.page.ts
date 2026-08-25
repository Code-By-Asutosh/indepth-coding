import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentDifficulty } from '../models/assessment.model';
import { PracticeStateService } from '../services/practice-state.service';

@Component({
  selector: 'app-practice-results',
  templateUrl: './practice-results.page.html',
  styleUrl: './practice-results.page.scss'
})
export class PracticeResultsPage {
  protected readonly state = inject(PracticeStateService);
  private readonly router = inject(Router);

  protected readonly regenerating = this.state.generating;

  protected readonly scorePercent = computed(() => {
    const result = this.state.result();
    if (!result || result.maxScore === 0) return 0;
    return Math.round((result.totalScore / result.maxScore) * 100);
  });

  constructor() {
    if (!this.state.result()) {
      this.router.navigate(['/practice']);
    }
  }

  protected evaluationFor(questionId: string) {
    return this.state.result()?.perQuestion.find((q) => q.questionId === questionId) ?? null;
  }

  protected answerTextFor(questionId: string): string {
    const answer = this.state.answers()[questionId];
    if (!answer) return '(no answer)';
    return 'text' in answer ? answer.text : '';
  }

  protected async generateAnother(): Promise<void> {
    const assessment = this.state.assessment();
    if (!assessment) return;
    try {
      await this.state.generate(assessment.topic, assessment.difficulty as AssessmentDifficulty, null);
      this.router.navigate(['/practice/assessment']);
    } catch {
      // errorMessage already set, stays on this page
    }
  }

  protected startNewTopic(): void {
    this.state.reset();
    this.router.navigate(['/practice']);
  }
}
