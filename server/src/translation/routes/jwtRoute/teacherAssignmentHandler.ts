import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { assignmentRepository } from '../../database/assignment.repo';
import { createAssignmentSchema } from '../../../entities/assignment';

export const createTeacherAssignment: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: parsed.error.issues },
      });
      return;
    }

    const assignment = await assignmentRepository.create(parsed.data, userId);
    res.status(201).json({ success: true, data: assignment });
  }
);

export const getTeacherAssignments: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      assignedToType: req.query.assignedToType as string,
      status: req.query.status as string,
      exerciseId: req.query.exerciseId as string,
      search: req.query.search as string,
    };

    const result = await assignmentRepository.findByTeacher(userId, filters, {
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.assignments,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
);
