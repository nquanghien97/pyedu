import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { topicRepository } from '../../database/topic.repo';
import { createTopicSchema, updateTopicSchema } from '../../../entities/topic';

export const getTopicsBySubject: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const topics = await topicRepository.findBySubjectId(req.params.subjectId);
  res.json({ success: true, data: topics });
});

export const getTopicById: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const topic = await topicRepository.findById(req.params.id);
  if (!topic) {
    res.status(404).json({ success: false, error: { message: 'Topic not found' } });
    return;
  }
  res.json({ success: true, data: topic });
});

export const createTopic: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = createTopicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const topic = await topicRepository.create(parsed.data);
  res.status(201).json({ success: true, data: topic });
});

export const updateTopic: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = updateTopicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const topic = await topicRepository.update(req.params.id, parsed.data);
  res.json({ success: true, data: topic });
});

export const deleteTopic: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  await topicRepository.delete(req.params.id);
  res.json({ success: true, data: null });
});
