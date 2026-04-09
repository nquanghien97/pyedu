export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'fill_blank' | 'essay' | 'matching' | 'ordering';
export type ExerciseStatus = 'draft' | 'reviewed' | 'approved' | 'archived';

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  gradeId?: string;
  subjectId?: string;
  topicId?: string | null;
  exerciseType?: string | null;
  difficultyLevel?: DifficultyLevel | null;
  totalPoints?: number | null;
  timeLimitMinutes?: number | null;
  isAiGenerated?: boolean;
  status?: ExerciseStatus;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseEntity {
  id: string;
  title: string | null;
  subjectId: string | null;
  topicId: string | null;
  grade: number | null;
  exerciseType: string | null;
  difficultyLevel: DifficultyLevel | null;
  totalPoints: number | null;
  timeLimitMinutes: number | null;
  isAiGenerated: boolean;
  status: ExerciseStatus | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  creator?: { id: string; name: string } | null;
  questions?: ExerciseQuestionEntity[];
  attachments?: ExerciseAttachmentEntity[];
  _count?: { questions: number };
}

export interface ExerciseQuestionEntity {
  id: string;
  exerciseId: string;
  questionText: string | null;
  questionType: QuestionType | null;
  orderIndex: number | null;
  points: number | null;
  content: unknown;
  explanation: string | null;
  hints: string[] | null;
  autoGrade: boolean;
  aiGradingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: ExerciseAttachmentEntity[];
}

export interface ExerciseAttachmentEntity {
  id: string;
  exerciseId: string;
  questionId: string | null;
  fileName: string;
  fileUrl: string;
  publicId: string | null;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
  expert: 'Rất khó',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Trắc nghiệm',
  multiple_select: 'Chọn nhiều',
  true_false: 'Đúng/Sai',
  fill_blank: 'Điền khuyết',
  essay: 'Tự luận',
  matching: 'Nối cột',
  ordering: 'Sắp xếp',
};

export const STATUS_LABELS: Record<ExerciseStatus, string> = {
  draft: 'Nháp',
  reviewed: 'Đã xem',
  approved: 'Đã duyệt',
  archived: 'Lưu trữ',
};

export const STATUS_COLORS: Record<ExerciseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  reviewed: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
};
