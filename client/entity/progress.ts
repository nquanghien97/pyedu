export type MasteryLevel = 'beginner' | 'developing' | 'proficient' | 'mastered';

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
  topics?: TopicProgress[];
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  exercisesCompleted: number;
  averageScore: number;
  masteryLevel: MasteryLevel;
}

export interface RecentScore {
  date: string;
  score: number;
  exerciseTitle: string;
  subjectName: string;
}

export interface StudentProgressResponse {
  overview: ProgressOverview;
  bySubject: SubjectProgress[];
  recentScores: RecentScore[];
}

export interface TeacherStudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalExercises: number;
  overallAverageScore: number;
  bySubject: SubjectProgress[];
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  beginner: 'Mới bắt đầu',
  developing: 'Đang phát triển',
  proficient: 'Thành thạo',
  mastered: 'Xuất sắc',
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  beginner: 'bg-gray-100 text-gray-700',
  developing: 'bg-yellow-100 text-yellow-700',
  proficient: 'bg-blue-100 text-blue-700',
  mastered: 'bg-green-100 text-green-700',
};

export const MASTERY_ICONS: Record<MasteryLevel, string> = {
  beginner: '🌱',
  developing: '🌿',
  proficient: '🌳',
  mastered: '⭐',
};
