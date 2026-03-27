import { apiFormData } from '@/lib/api';
import { ExerciseAttachmentEntity } from '@/entity/exercise';

export async function uploadExerciseAttachment(
  file: File,
  exerciseId: string,
  questionId?: string
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('exerciseId', exerciseId);
  if (questionId) {
    formData.append('questionId', questionId);
  }

  return apiFormData<ExerciseAttachmentEntity>({
    url: '/api/v1/uploads/exercise-attachment',
    options: { method: 'POST', body: formData },
  });
}

export async function deleteAttachment(id: string) {
  return apiFormData({ url: `/api/v1/uploads/${id}`, options: { method: 'DELETE' } });
}
