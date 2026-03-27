import { z } from 'zod';

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'] as const;
export const QUESTION_TYPES = ['multiple_choice', 'multiple_select', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'] as const;
export const EXERCISE_STATUSES = ['draft', 'reviewed', 'approved', 'archived'] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type ExerciseStatus = (typeof EXERCISE_STATUSES)[number];

const questionInputSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(QUESTION_TYPES),
  orderIndex: z.number().int().optional(),
  points: z.number().min(0).optional(),
  content: z.any().optional(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  autoGrade: z.boolean().optional(),
  aiGradingEnabled: z.boolean().optional(),
});

export const createExerciseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255),
  gradeId: z.string().length(36).optional(),
  subjectId: z.string().length(36).optional(),
  topicId: z.string().length(36).optional(),
  exerciseType: z.string().max(50).optional(),
  difficultyLevel: z.enum([DIFFICULTY_LEVELS[0], DIFFICULTY_LEVELS[1], ...DIFFICULTY_LEVELS.slice(2)]).optional(),
  totalPoints: z.number().min(0).optional(),
  timeLimitMinutes: z.number().int().min(0).optional(),
  questions: z.array(questionInputSchema).optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const updateExerciseStatusSchema = z.object({
  status: z.enum([EXERCISE_STATUSES[0], EXERCISE_STATUSES[1], ...EXERCISE_STATUSES.slice(2)]),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;

export interface ExerciseFilters {
  gradeId?: string;
  subjectId?: string;
  topicId?: string;
  difficultyLevel?: string;
  exerciseType?: string;
  status?: string;
  search?: string;
  isAiGenerated?: boolean;
  createdBy?: number;
}

export interface Pagination {
  page: number;
  limit: number;
}
