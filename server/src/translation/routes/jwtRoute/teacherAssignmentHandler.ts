import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { assignmentRepository } from '../../database/assignment.repo';
import { createAssignmentSchema } from '../../../entities/assignment';
import { notificationService } from '../../../execution/notification/notification.service';
import { prisma } from '../../database/prisma';

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

    // Trigger notification cho học sinh
    try {
      if (parsed.data.assignedToType === 'student' && parsed.data.assignedToId) {
        const student = await prisma.student.findUnique({
          where: { id: parsed.data.assignedToId },
          select: { userId: true },
        });
        if (student) {
          const exerciseTitle = assignment.exercise?.title || 'Bài tập mới';
          const dueDate = assignment.dueDate
            ? new Date(assignment.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '';
          await notificationService.create({
            userId: student.userId,
            title: '📝 Bài tập mới!',
            message: `Giáo viên đã giao bài: "${exerciseTitle}".${dueDate ? ` Hạn nộp: ${dueDate}` : ''}`,
            notificationType: 'assignment_new',
            metadata: { assignmentId: assignment.id, link: `/student/assignments/${assignment.id}` },
          });
        }
      }
    } catch (triggerError) {
      // Log but don't fail the request
      process.stderr.write(`[Notification Trigger] Assignment notification failed: ${triggerError}\n`);
    }

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
