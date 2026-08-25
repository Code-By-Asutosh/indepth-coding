import { Injectable, computed, inject, signal } from '@angular/core';
import { AiAssistantError } from '../../../core/services/ai-assistant.service';
import { Assessment, AssessmentDifficulty, AssessmentResult, AnswerValue, QuestionEvaluation } from '../models/assessment.model';
import { AssessmentApiService, EvaluationItem } from './assessment-api.service';

/** Holds the in-progress assessment across the home -> assessment -> results pages. */
@Injectable({ providedIn: 'root' })
export class PracticeStateService {
  private readonly api = inject(AssessmentApiService);

  readonly assessment = signal<Assessment | null>(null);
  readonly answers = signal<Record<string, AnswerValue>>({});
  readonly currentIndex = signal(0);
  readonly result = signal<AssessmentResult | null>(null);

  readonly generating = signal(false);
  readonly evaluating = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly answeredCount = computed(() => Object.keys(this.answers()).length);
  readonly totalCount = computed(() => this.assessment()?.questions.length ?? 0);
  readonly currentQuestion = computed(() => this.assessment()?.questions[this.currentIndex()] ?? null);

  async generate(topic: string, difficulty: AssessmentDifficulty, questionCount: number | null): Promise<void> {
    this.generating.set(true);
    this.errorMessage.set(null);
    try {
      const assessment = await this.api.generate(topic, difficulty, questionCount);
      this.assessment.set(assessment);
      this.answers.set({});
      this.currentIndex.set(0);
      this.result.set(null);
    } catch (err) {
      this.errorMessage.set(err instanceof AiAssistantError ? err.message : 'Something went wrong generating that assessment. Try again.');
      throw err;
    } finally {
      this.generating.set(false);
    }
  }

  setAnswer(questionId: string, value: AnswerValue): void {
    this.answers.update((current) => ({ ...current, [questionId]: value }));
  }

  goTo(index: number): void {
    const total = this.totalCount();
    if (index >= 0 && index < total) this.currentIndex.set(index);
  }

  next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  previous(): void {
    this.goTo(this.currentIndex() - 1);
  }

  async submit(): Promise<void> {
    const assessment = this.assessment();
    if (!assessment) return;

    this.evaluating.set(true);
    this.errorMessage.set(null);
    try {
      const answers = this.answers();
      const perQuestion: QuestionEvaluation[] = [];
      const openItems: EvaluationItem[] = [];

      for (const question of assessment.questions) {
        const answer = answers[question.id];
        if (question.type === 'mcq') {
          const selected = answer && 'optionIndex' in answer ? answer.optionIndex : -1;
          const correct = selected === question.correctOptionIndex;
          perQuestion.push({
            questionId: question.id,
            result: selected === -1 ? 'incorrect' : correct ? 'correct' : 'incorrect',
            score: correct ? 10 : 0,
            summary: correct
              ? 'Correct.'
              : `The correct option was "${question.options?.[question.correctOptionIndex ?? -1] ?? 'unknown'}".`
          });
          continue;
        }

        const text = answer && 'text' in answer ? answer.text.trim() : '';
        if (!text) {
          perQuestion.push({ questionId: question.id, result: 'incorrect', score: 0, summary: 'No answer submitted.' });
          continue;
        }
        openItems.push({
          questionId: question.id,
          type: question.type,
          prompt: question.prompt,
          code: question.code,
          expectedConcepts: question.expectedConcepts,
          answer: text
        });
      }

      let overallStrongAreas: string[] = [];
      let overallWeakAreas: string[] = [];

      if (openItems.length > 0) {
        const evaluation = await this.api.evaluate(assessment.topic, assessment.difficulty, openItems);
        perQuestion.push(...evaluation.perQuestion);
        overallStrongAreas = evaluation.overallStrongAreas;
        overallWeakAreas = evaluation.overallWeakAreas;
      }

      const totalScore = perQuestion.reduce((sum, q) => sum + (q.score ?? 0), 0);
      const maxScore = perQuestion.length * 10;

      this.result.set({ perQuestion, overallStrongAreas, overallWeakAreas, totalScore, maxScore });
    } catch (err) {
      this.errorMessage.set(err instanceof AiAssistantError ? err.message : 'Something went wrong evaluating your answers. Try again.');
      throw err;
    } finally {
      this.evaluating.set(false);
    }
  }

  reset(): void {
    this.assessment.set(null);
    this.answers.set({});
    this.currentIndex.set(0);
    this.result.set(null);
    this.errorMessage.set(null);
  }
}
