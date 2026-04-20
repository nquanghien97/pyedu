import { ExerciseQuestionEntity } from './exercise';

export interface SubmissionAnswerEntity {
  id: string;
  submissionId: string;
  questionId: string;
  answerData: AnswerData;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  feedback: string | null;
  question?: {
    id: string;
    questionText: string | null;
    questionType: string | null;
    points: number | null;
    content: unknown;
    explanation: string | null;
    hints?: string[] | null;
  };
}

export interface SubmissionEntity {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number | null;
  submittedAt: string | null;
  totalScore: number | null;
  percentage: number | null;
  status: string | null;
  isLate: boolean | null;
  answers: SubmissionAnswerEntity[];
  assignment?: {
    exercise: {
      id: string;
      title: string | null;
      grade: number | null;
      subject?: { id: string; name: string } | null;
      topic?: { id: string; name: string } | null;
      totalPoints: number | null;
      timeLimitMinutes: number | null;
    };
  };
  student?: {
    user: { name: string; email: string };
  };
}

export interface AnswerData {
  type: string;
  selectedOption?: string;
  selectedOptions?: string[];
  text?: string;
  blanks?: { id: number; value: string }[];
  selectedValue?: boolean;
}

export interface SubmitAnswerInput {
  questionId: string;
  answerData: AnswerData;
}
