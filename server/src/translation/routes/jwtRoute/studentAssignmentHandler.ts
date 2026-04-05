import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { assignmentRepository } from '../../database/assignment.repo';
import { prisma } from '../../database/prisma';

export const getStudentAssignments: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student profile not found' },
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      subjectId: req.query.subjectId as string,
      search: req.query.search as string,
    };

    const [result, stats] = await Promise.all([
      assignmentRepository.findStudentAssignments(student.id, filters, {
        page,
        limit,
      }),
      assignmentRepository.getStudentStats(student.id),
    ]);

    res.json({
      success: true,
      data: result.assignments,
      stats,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
);
