import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AiAssistantError } from '../../../core/services/ai-assistant.service';
import { Assessment, AssessmentDifficulty, AssessmentQuestion, AssessmentResult, QuestionEvaluation } from '../models/assessment.model';

const VALID_TYPES = new Set(['mcq', 'output', 'debug', 'scenario', 'tradeoff', 'coding', 'cross-topic']);

/** Item shape sent to /assessment/evaluate for one open-ended (non-mcq) question. */
export interface EvaluationItem {
  questionId: string;
  type: string;
  prompt: string;
  code?: string;
  expectedConcepts?: string[];
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentApiService {
  async generate(topic: string, difficulty: AssessmentDifficulty, questionCount: number | null): Promise<Assessment> {
    const res = await this.postJson('/assessment/generate', { topic, difficulty, questionCount: questionCount ?? undefined });
    return validateAssessment(res);
  }

  async evaluate(topic: string, difficulty: string, items: EvaluationItem[]): Promise<Omit<AssessmentResult, 'totalScore' | 'maxScore' | 'perQuestion'> & { perQuestion: QuestionEvaluation[] }> {
    const res = await this.postJson('/assessment/evaluate', { topic, difficulty, items });
    return validateEvaluation(res);
  }

  private async postJson(path: string, payload: unknown): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${environment.aiProxyUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new AiAssistantError('Could not reach the AI service. Check your connection and try again.', 'network');
    }

    if (response.status === 429) {
      throw new AiAssistantError("You've hit the question limit for now - try again in a little while.", 'rate-limited');
    }
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new AiAssistantError(text || 'The AI service had a problem with that. Try again in a moment.', 'server');
    }
    return response.json();
  }
}

function validateAssessment(raw: unknown): Assessment {
  const obj = raw as Partial<Assessment> | null;
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new AiAssistantError('The AI returned an assessment in an unexpected shape. Please try generating again.', 'server');
  }

  const questions: AssessmentQuestion[] = obj.questions
    .filter((q): q is AssessmentQuestion => !!q && typeof q === 'object' && VALID_TYPES.has((q as AssessmentQuestion).type) && !!(q as AssessmentQuestion).prompt)
    .map((q, i) => ({ ...q, id: q.id || `q${i + 1}` }));

  if (questions.length === 0) {
    throw new AiAssistantError('The AI returned no usable questions. Please try generating again.', 'server');
  }

  return {
    topic: obj.topic ?? '',
    difficulty: obj.difficulty ?? 'intermediate',
    title: obj.title || 'Mock Assessment',
    description: obj.description ?? '',
    questions
  };
}

function validateEvaluation(raw: unknown): { perQuestion: QuestionEvaluation[]; overallStrongAreas: string[]; overallWeakAreas: string[] } {
  const obj = raw as { results?: unknown; overallStrongAreas?: unknown; overallWeakAreas?: unknown } | null;
  const results = Array.isArray(obj?.results) ? (obj!.results as QuestionEvaluation[]) : [];
  return {
    perQuestion: results.filter((r) => r && typeof r.questionId === 'string'),
    overallStrongAreas: Array.isArray(obj?.overallStrongAreas) ? (obj!.overallStrongAreas as string[]) : [],
    overallWeakAreas: Array.isArray(obj?.overallWeakAreas) ? (obj!.overallWeakAreas as string[]) : []
  };
}
