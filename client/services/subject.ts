import { api } from '@/lib/api';
import { SubjectEntity, TopicEntity } from '@/entity/subject';

export async function getSubjects() {
  return api<SubjectEntity[]>({ url: '/api/v1/subjects' });
}

export async function getSubjectById(id: string) {
  return api<SubjectEntity>({ url: `/api/v1/subjects/${id}` });
}

export async function createSubject(data: { name: string; gradeId?: string | null; parentSubjectId?: string | null }) {
  return api<SubjectEntity>({
    url: '/api/v1/subjects',
    options: { method: 'POST', body: JSON.stringify(data) },
  });
}

export async function updateSubject(id: string, data: { name?: string; gradeId?: string | null; parentSubjectId?: string | null }) {
  return api<SubjectEntity>({
    url: `/api/v1/subjects/${id}`,
    options: { method: 'PUT', body: JSON.stringify(data) },
  });
}

export async function deleteSubject(id: string) {
  return api({ url: `/api/v1/subjects/${id}`, options: { method: 'DELETE' } });
}

export async function getTopicsBySubject(subjectId: string) {
  return api<TopicEntity[]>({ url: `/api/v1/subjects/${subjectId}/topics` });
}

export async function createTopic(data: { subjectId: string; name: string; orderIndex?: number; parentTopicId?: string | null }) {
  return api<TopicEntity>({
    url: '/api/v1/topics',
    options: { method: 'POST', body: JSON.stringify(data) },
  });
}

export async function updateTopic(id: string, data: { name?: string; orderIndex?: number; parentTopicId?: string | null }) {
  return api<TopicEntity>({
    url: `/api/v1/topics/${id}`,
    options: { method: 'PUT', body: JSON.stringify(data) },
  });
}

export async function deleteTopic(id: string) {
  return api({ url: `/api/v1/topics/${id}`, options: { method: 'DELETE' } });
}
