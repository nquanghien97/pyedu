import { api, apiFormData } from '@/lib/api';
import { SubmissionEntity, SubmitAnswerInput, SubmissionAttachmentEntity } from '@/entity/submission';

export interface SubmitExercisePayload {
  answers: SubmitAnswerInput[];
}

export async function submitExercise(
  assignmentId: string,
  payload: SubmitExercisePayload
): Promise<SubmissionEntity> {
  const response = await api<SubmissionEntity>({
    url: `/api/v1/student/assignments/${assignmentId}/submit`,
    options: {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  });
  return response.data;
}

export async function getSubmissionById(
  submissionId: string
): Promise<SubmissionEntity> {
  const response = await api<SubmissionEntity>({
    url: `/api/v1/submissions/${submissionId}`,
  });
  return response.data;
}

export async function getMySubmissions(
  assignmentId: string
): Promise<SubmissionEntity[]> {
  const response = await api<SubmissionEntity[]>({
    url: `/api/v1/student/assignments/${assignmentId}/submissions`,
  });
  return response.data;
}

export interface AssignmentSubmissionsResponse {
  assignment: unknown;
  submissions: Array<{
    id: string;
    studentId: string;
    attemptNumber: number | null;
    submittedAt: string | null;
    totalScore: number | null;
    percentage: number | null;
    status: string | null;
    isLate: boolean | null;
    student: {
      user: { name: string; email: string };
    };
    _count: { answers: number };
  }>;
}

export async function getAssignmentSubmissions(
  assignmentId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  data: AssignmentSubmissionsResponse;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const response = await api<AssignmentSubmissionsResponse>({
    url: `/api/v1/teacher/assignments/${assignmentId}/submissions?page=${page}&limit=${limit}`,
  });
  return {
    data: response.data,
    pagination: response.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export interface UpdateGradePayload {
  totalScore: number;
  percentage: number;
  feedback?: string | null;
  answerUpdates: Array<{
    id: string;
    isCorrect?: boolean | null;
    pointsEarned?: number | null;
    feedback?: string | null;
  }>;
}

export async function updateSubmissionGrade(
  submissionId: string,
  payload: UpdateGradePayload
): Promise<SubmissionEntity> {
  const response = await api<SubmissionEntity>({
    url: `/api/v1/submissions/${submissionId}/grade`,
    options: {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  });
  return response.data;
}

export async function uploadFileSubmission(
  assignmentId: string,
  files: File[],
  note?: string
): Promise<SubmissionEntity> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (note) {
    formData.append('note', note);
  }

  const response = await apiFormData<SubmissionEntity>({
    url: `/api/v1/student/assignments/${assignmentId}/upload`,
    options: {
      method: 'POST',
      body: formData,
    },
  });
  return response.data;
}

export async function getSubmissionAttachments(
  submissionId: string
): Promise<SubmissionAttachmentEntity[]> {
  const response = await api<SubmissionAttachmentEntity[]>({
    url: `/api/v1/student/submissions/${submissionId}/attachments`,
  });
  return response.data;
}

export async function deleteSubmissionAttachment(
  submissionId: string,
  attachmentId: string
): Promise<void> {
  await api<void>({
    url: `/api/v1/student/submissions/${submissionId}/attachments/${attachmentId}`,
    options: {
      method: 'DELETE',
    },
  });
}

