import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { prisma } from '../../database/prisma';
import { submissionRepository } from '../../database/submission.repo';
import { submitExerciseSchema } from '../../../entities/submission';
import { gradeSubmission } from '../../../execution/grading/grading.service';
import { updateStudentProgress } from '../../../execution/progress/progress.service';
import { notificationService } from '../../../execution/notification/notification.service';

/**
 * POST /api/v1/student/assignments/:id/submit
 * Student submits answers for an assignment
 */
export const submitAssignment: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const assignmentId = req.params.id;

    // Get student profile
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student profile not found' },
      });
      return;
    }

    // Validate input
    const parsed = submitExerciseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation error', details: parsed.error.issues },
      });
      return;
    }

    // Verify assignment exists and is active
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        exercise: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: { message: 'Assignment not found' },
      });
      return;
    }

    // Check max attempts
    if (assignment.maxAttempts) {
      const existingAttempts = await prisma.exerciseSubmission.count({
        where: { assignmentId, studentId: student.id },
      });
      if (existingAttempts >= assignment.maxAttempts) {
        res.status(400).json({
          success: false,
          error: { message: `Đã đạt số lần nộp tối đa (${assignment.maxAttempts})` },
        });
        return;
      }
    }

    // Auto-grade the answers (bao gồm cả AI chấm essay nếu aiGradingEnabled)
    const gradingResults = await gradeSubmission(
      assignment.exercise.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points ? Number(q.points) : null,
        content: q.content,
        autoGrade: q.autoGrade,
        aiGradingEnabled: q.aiGradingEnabled,
      })),
      parsed.data.answers.map((a) => ({
        questionId: a.questionId,
        answerData: a.answerData,
      }))
    );

    // Save submission
    const submission = await submissionRepository.create(
      assignmentId,
      student.id,
      parsed.data,
      gradingResults
    );

    // Update student progress in background (non-blocking)
    updateStudentProgress(
      student.id,
      assignment.exercise.subjectId,
      assignment.exercise.topicId
    ).catch(() => {
      // Silently handle progress update failures
    });

    // Trigger notification: bài đã được chấm
    try {
      const totalScore = submission.totalScore ? Number(submission.totalScore) : 0;
      const maxScore = assignment.exercise.totalPoints ? Number(assignment.exercise.totalPoints) : 0;
      await notificationService.create({
        userId,
        title: '✅ Bài đã được chấm!',
        message: `Bài "${assignment.exercise.title}" được ${totalScore}/${maxScore} điểm`,
        notificationType: 'submission_graded',
        metadata: {
          submissionId: submission.id,
          assignmentId,
          score: totalScore,
          maxScore,
          link: `/student/assignments/${assignmentId}`,
        },
      });
    } catch {
      // Non-blocking
    }

    res.status(201).json({ success: true, data: submission });
  }
);

/**
 * GET /api/v1/submissions/:id
 * Get submission details (student or teacher)
 */
export const getSubmissionById: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const submission = await submissionRepository.findById(req.params.id);
    if (!submission) {
      res.status(404).json({
        success: false,
        error: { message: 'Submission not found' },
      });
      return;
    }

    res.json({ success: true, data: submission });
  }
);

/**
 * GET /api/v1/teacher/assignments/:id/submissions
 * Teacher views all submissions for an assignment
 */
export const getAssignmentSubmissions: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const assignmentId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await submissionRepository.findByAssignment(assignmentId, {
      page,
      limit,
    });

    // Also get assignment info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            subject: { select: { id: true, name: true } },
            _count: { select: { questions: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        assignment,
        submissions: result.submissions,
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }
);

/**
 * GET /api/v1/student/assignments/:id/submissions
 * Student views their own submissions for an assignment
 */
export const getMySubmissions: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student profile not found' },
      });
      return;
    }

    const submissions = await submissionRepository.findByStudentAndAssignment(
      student.id,
      req.params.id
    );

    res.json({ success: true, data: submissions });
  }
);

/**
 * PUT /api/v1/submissions/:id/grade
 * Teacher manually updates grades (e.g. for essay questions)
 */
export const updateSubmissionGrade: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    // Must be a teacher (simplified check here, ideally use role from JWT)
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) {
      res.status(403).json({ success: false, error: { message: 'Access denied' } });
      return;
    }

    const submissionId = req.params.id;
    const { totalScore, percentage, answerUpdates } = req.body;

    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      res.status(404).json({ success: false, error: { message: 'Submission not found' } });
      return;
    }

    const result = await submissionRepository.updateGrade(submissionId, {
      totalScore,
      percentage,
      status: 'graded',
      answerUpdates,
    });

    // Also update student progress since their score changed
    updateStudentProgress(
      submission.studentId,
      submission.assignment.exercise.subject?.id || null,
      submission.assignment.exercise.topic?.id || null
    ).catch(() => {});

    res.json({ success: true, data: result });
  }
);
