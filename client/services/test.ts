import { api } from '@/lib/api';
import { TestEntity, CreateTestInput, AIExplainResult } from '@/entity/test';

export async function getTests() {
  return api<TestEntity[]>({ url: '/api/v1/tests' });
}

export async function getTestById(id: string) {
  return api<TestEntity>({ url: `/api/v1/tests/${id}` });
}

export async function createTest(data: CreateTestInput) {
  return api<TestEntity>({
    url: '/api/v1/tests',
    options: { method: 'POST', body: JSON.stringify(data) },
  });
}

export async function deleteTest(id: string) {
  return api<{ message: string }>({
    url: `/api/v1/tests/${id}`,
    options: { method: 'DELETE' },
  });
}

export async function explainQuestion(questionText: string, studentAnswer: string, correctAnswer?: string) {
  return api<AIExplainResult>({
    url: '/api/v1/ai/explain',
    options: { method: 'POST', body: JSON.stringify({ questionText, studentAnswer, correctAnswer }) },
  });
}
