import { api, apiFormData } from '@/lib/api';
import { DifficultyLevel, QuestionType, ExerciseEntity } from '@/entity/exercise';

export interface GenerateByTopicRequest {
  gradeName?: string;
  subjectName?: string;
  subjectId?: string;
  topicId?: string;
  topicName: string;
  difficultyLevel: DifficultyLevel;
  numberOfQuestions: number;
  questionType: QuestionType | 'mixed';
  additionalInstructions?: string;
}

export interface AiGenerateResponse {
  exercise: ExerciseEntity;
  rawAiData: Record<string, unknown>;
}

export const aiGenerateService = {
  generateByTopic: async (params: GenerateByTopicRequest) => {
    return api<AiGenerateResponse>({
      url: '/api/v1/ai/generate-exercise',
      options: {
        method: 'POST',
        body: JSON.stringify(params),
      },
    });
  },

  generateByFile: async (params: {
    file: File;
    gradeName?: string;
    subjectName?: string;
    subjectId?: string;
    topicId?: string;
    additionalInstructions?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.gradeName) formData.append('gradeName', params.gradeName);
    if (params.subjectName) formData.append('subjectName', params.subjectName);
    if (params.subjectId) formData.append('subjectId', params.subjectId);
    if (params.topicId) formData.append('topicId', params.topicId);
    if (params.additionalInstructions) {
      formData.append('additionalInstructions', params.additionalInstructions);
    }

    return apiFormData<AiGenerateResponse>({
      url: '/api/v1/ai/generate-exercise-by-file',
      options: {
        method: 'POST',
        body: formData,
      },
    });
  },

  getHistory: async (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return api<ExerciseEntity[]>({
      url: `/api/v1/teacher/ai-exercises/history${query ? `?${query}` : ''}`,
    });
  },
};
