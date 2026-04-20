import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { prisma } from '../../database/prisma';
import { progressRepository } from '../../database/progress.repo';
import { classifyMastery } from '../../../entities/progress';

/**
 * GET /api/v1/progress/me
 * Student: get their own progress overview
 */
export const getMyProgress: RequestHandler = withAsyncErrorHandling(
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

    const progressRecords = await progressRepository.getStudentOverview(student.id);

    // Calculate overall stats
    const subjectRecords = progressRecords.filter((p) => p.subjectId && !p.topicId);
    const totalExercises = subjectRecords.reduce(
      (sum, p) => sum + (p.exercisesCompleted ?? 0),
      0
    );
    const scores = subjectRecords
      .filter((p) => p.averageScore !== null)
      .map((p) => Number(p.averageScore));
    const overallAvg =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : 0;

    // Get recent submission scores
    const recentScores = await prisma.exerciseSubmission.findMany({
      where: { studentId: student.id, status: 'graded' },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        percentage: true,
        submittedAt: true,
        assignment: {
          select: {
            exercise: {
              select: {
                title: true,
                subject: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Build by-subject response
    const bySubject = subjectRecords.map((p) => {
      const topicRecords = progressRecords.filter(
        (t) => t.subjectId === p.subjectId && t.topicId
      );

      return {
        subjectId: p.subjectId,
        subjectName: p.subject?.name ?? '',
        exercisesCompleted: p.exercisesCompleted ?? 0,
        averageScore: Number(p.averageScore ?? 0),
        masteryLevel: p.masteryLevel ?? 'beginner',
        topics: topicRecords.map((t) => ({
          topicId: t.topicId,
          topicName: t.topic?.name ?? '',
          exercisesCompleted: t.exercisesCompleted ?? 0,
          averageScore: Number(t.averageScore ?? 0),
          masteryLevel: t.masteryLevel ?? 'beginner',
        })),
      };
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalExercises,
          completedExercises: totalExercises,
          averageScore: overallAvg,
          overallMasteryLevel: classifyMastery(overallAvg),
        },
        bySubject,
        recentScores: recentScores.map((s) => ({
          date: s.submittedAt?.toISOString() ?? '',
          score: Number(s.percentage ?? 0),
          exerciseTitle: s.assignment?.exercise?.title ?? '',
          subjectName: s.assignment?.exercise?.subject?.name ?? '',
        })),
      },
    });
  }
);

/**
 * GET /api/v1/progress/students
 * Teacher: list all students with their progress
 */
export const getStudentsProgress: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const classId = req.query.classId as string | undefined;
    const students = await progressRepository.getAllStudentsProgress(classId);

    res.json({ success: true, data: students });
  }
);

/**
 * GET /api/v1/progress/students/:studentId
 * Teacher: detailed progress for a single student
 */
export const getStudentProgressDetail: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const student = await progressRepository.getStudentDetail(req.params.studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        error: { message: 'Student not found' },
      });
      return;
    }

    // Separate subject vs topic progress
    const subjectRecords = student.progress.filter((p) => p.subjectId && !p.topicId);
    const scores = subjectRecords
      .filter((p) => p.averageScore !== null)
      .map((p) => Number(p.averageScore));
    const overallAvg =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : 0;

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
        },
        overview: {
          overallAverageScore: overallAvg,
          overallMasteryLevel: classifyMastery(overallAvg),
          totalExercises: subjectRecords.reduce(
            (s, p) => s + (p.exercisesCompleted ?? 0),
            0
          ),
        },
        bySubject: subjectRecords.map((p) => {
          const topicRecords = student.progress.filter(
            (t) => t.subjectId === p.subjectId && t.topicId
          );
          return {
            subjectId: p.subjectId,
            subjectName: p.subject?.name ?? '',
            exercisesCompleted: p.exercisesCompleted ?? 0,
            averageScore: Number(p.averageScore ?? 0),
            masteryLevel: p.masteryLevel ?? 'beginner',
            topics: topicRecords.map((t) => ({
              topicId: t.topicId,
              topicName: t.topic?.name ?? '',
              exercisesCompleted: t.exercisesCompleted ?? 0,
              averageScore: Number(t.averageScore ?? 0),
              masteryLevel: t.masteryLevel ?? 'beginner',
            })),
          };
        }),
        recentSubmissions: student.submissions.map((s) => ({
          id: s.id,
          totalScore: s.totalScore ? Number(s.totalScore) : null,
          percentage: s.percentage ? Number(s.percentage) : null,
          submittedAt: s.submittedAt?.toISOString() ?? '',
          exerciseTitle: s.assignment?.exercise?.title ?? '',
          subjectName: s.assignment?.exercise?.subject?.name ?? '',
        })),
      },
    });
  }
);
