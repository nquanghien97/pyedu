export const MASTERY_LEVELS = ['beginner', 'developing', 'proficient', 'mastered'] as const;

export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export interface StudentProgressData {
  studentId: string;
  subjectId: string | null;
  topicId: string | null;
  exercisesCompleted: number;
  averageScore: number;
  masteryLevel: MasteryLevel;
}

export interface ProgressOverview {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  overallMasteryLevel: MasteryLevel;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  exercisesCompleted: number;
  averageScore: number;
  masteryLevel: MasteryLevel;
}

/**
 * Classify mastery level based on average score percentage
 */
export function classifyMastery(averageScorePercent: number): MasteryLevel {
  if (averageScorePercent >= 80) return 'mastered';
  if (averageScorePercent >= 60) return 'proficient';
  if (averageScorePercent >= 40) return 'developing';
  return 'beginner';
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  beginner: 'Mới bắt đầu',
  developing: 'Đang phát triển',
  proficient: 'Thành thạo',
  mastered: 'Xuất sắc',
};
