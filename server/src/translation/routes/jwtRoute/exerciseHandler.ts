import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { exerciseRepository } from '../../database/exercise.repo';
import {
  createExerciseSchema,
  updateExerciseSchema,
  updateExerciseStatusSchema,
  ExerciseFilters,
} from '../../../entities/exercise';

export const getExercises: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filters: ExerciseFilters = {
    subjectId: req.query.subjectId as string,
    topicId: req.query.topicId as string,
    difficultyLevel: req.query.difficultyLevel as string,
    exerciseType: req.query.exerciseType as string,
    status: req.query.status as string,
    search: req.query.search as string,
  };

  const result = await exerciseRepository.findAll(filters, { page, limit });
  res.json({
    success: true,
    data: result.exercises,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

export const getExerciseById: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const exercise = await exerciseRepository.findById(req.params.id);
  if (!exercise) {
    res.status(404).json({ success: false, error: { message: 'Exercise not found' } });
    return;
  }
  res.json({ success: true, data: exercise });
});

export const createExercise: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = createExerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }

  const exercise = await exerciseRepository.create(parsed.data, userId);
  res.status(201).json({ success: true, data: exercise });
});

export const updateExercise: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = updateExerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const exercise = await exerciseRepository.update(req.params.id, parsed.data);
  res.json({ success: true, data: exercise });
});

export const updateExerciseStatus: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = updateExerciseStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }
  const exercise = await exerciseRepository.updateStatus(req.params.id, parsed.data.status);
  res.json({ success: true, data: exercise });
});

export const deleteExercise: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  await exerciseRepository.delete(req.params.id);
  res.json({ success: true, data: null });
});

export const addQuestion: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const question = await exerciseRepository.addQuestion(req.params.id, req.body);
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const question = await exerciseRepository.updateQuestion(req.params.questionId, req.body);
  res.json({ success: true, data: question });
});

export const deleteQuestion: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  await exerciseRepository.deleteQuestion(req.params.questionId);
  res.json({ success: true, data: null });
});
