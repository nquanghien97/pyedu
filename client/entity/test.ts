import { ExerciseEntity } from './exercise';

export interface TestEntity {
  id: string;
  exerciseId: string;
  topicId?: string;
  subjectId?: string;
  testType: string;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: string;
  isPublished: boolean;
  startTime?: string | Date;
  endTime?: string | Date;

  // Relations (optional based on include in backend)
  exercise?: ExerciseEntity;
  topic?: { id: string; name: string };
  subject?: { id: string; name: string };
}

export interface CreateTestInput {
  title: string;
  subjectId?: string;
  topicId?: string;
  testType: string;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResult?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  questions?: Array<{
    questionText: string;
    questionType: string;
    orderIndex?: number;
    points?: number;
    content?: unknown;
    explanation?: string;
    hints?: string[];
    autoGrade?: boolean;
    aiGradingEnabled?: boolean;
  }>;
}

export interface AIExplainResult {
  explanation: {
    steps: {
      stepNumber: number;
      title: string;
      content: string;
      formula?: string;
    }[];
    relatedKnowledge: string[];
    tips?: string;
  };
}
