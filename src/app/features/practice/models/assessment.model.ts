export type QuestionType = 'mcq' | 'output' | 'debug' | 'scenario' | 'tradeoff' | 'coding' | 'cross-topic';
export type AssessmentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'interview-hard';
export type EvaluationResultKind = 'correct' | 'partially_correct' | 'incorrect';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  skill: string;
  difficulty: AssessmentDifficulty;
  prompt: string;
  code?: string;
  options?: string[];
  correctOptionIndex?: number;
  starterCode?: string;
  expectedConcepts?: string[];
}

export interface Assessment {
  topic: string;
  difficulty: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
}

/** Raw learner input per question - a selected option index (mcq) or free text (everything else). */
export type AnswerValue = { optionIndex: number } | { text: string };

export interface QuestionEvaluation {
  questionId: string;
  result: EvaluationResultKind;
  score: number;
  summary: string;
  strengths?: string[];
  gaps?: string[];
  idealReasoning?: string[];
  conceptsToReview?: string[];
}

export interface AssessmentResult {
  perQuestion: QuestionEvaluation[];
  overallStrongAreas: string[];
  overallWeakAreas: string[];
  totalScore: number;
  maxScore: number;
}
