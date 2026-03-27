import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { subjectRepository } from '../../database/subject.repo';
import { createSubjectSchema, updateSubjectSchema } from '../../../entities/subject';

export const getSubjects: RequestHandler = withAsyncErrorHandling(async (_req, res) => {
  const subjects = await subjectRepository.findAll();
  res.json({ success: true, data: subjects });
});

export const getSubjectById: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const subject = await subjectRepository.findById(req.params.id);
  if (!subject) {
    res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    return;
  }
  res.json({ success: true, data: subject });
});

export const createSubject: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = createSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const subject = await subjectRepository.create(parsed.data);
  res.status(201).json({ success: true, data: subject });
});

export const updateSubject: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = updateSubjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const subject = await subjectRepository.update(req.params.id, parsed.data);
  res.json({ success: true, data: subject });
});

export const deleteSubject: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  await subjectRepository.delete(req.params.id);
  res.json({ success: true, data: null });
});
