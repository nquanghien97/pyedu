import { api, apiFormData } from '@/lib/api';
import { DifficultyLevel, QuestionType } from '@/entity/exercise';

export interface GenerateByTopicRequest {
  gradeName?: string;
  subjectName?: string;
  topicName: string;
  difficultyLevel: DifficultyLevel;
  numberOfQuestions: number;
  questionType: QuestionType | 'mixed';
  additionalInstructions?: string;
}

export const aiGenerateService = {
  generateByTopic: async (params: GenerateByTopicRequest) => {
    return api<any>({
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
    additionalInstructions?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.gradeName) formData.append('gradeName', params.gradeName);
    if (params.subjectName) formData.append('subjectName', params.subjectName);
    if (params.additionalInstructions) {
      formData.append('additionalInstructions', params.additionalInstructions);
    }

    return apiFormData<any>({
      url: '/api/v1/ai/generate-exercise-by-file',
      options: {
        method: 'POST',
        body: formData,
      },
    });
  },
};
