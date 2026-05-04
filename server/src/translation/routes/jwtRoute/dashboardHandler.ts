import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { prisma } from '../../database/prisma';

// GET /api/v1/teacher/dashboard-stats
export const getTeacherDashboardStats: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const teacherId = req.user?.id;

    const [
      totalStudents,
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      pendingGrading,
      recentAssignments,
    ] = await Promise.all([
      // Tổng học sinh trong các lớp của teacher
      prisma.student.count(),

      // Tổng bài tập đã giao
      prisma.assignment.count({
        where: { assignedBy: teacherId },
      }),

      // Tổng bài nộp
      prisma.exerciseSubmission.count({
        where: {
          assignment: { assignedBy: teacherId },
        },
      }),

      // Bài đã chấm
      prisma.exerciseSubmission.count({
        where: {
          assignment: { assignedBy: teacherId },
          status: 'graded',
        },
      }),

      // Bài cần chấm (submitted nhưng chưa graded)
      prisma.exerciseSubmission.count({
        where: {
          assignment: { assignedBy: teacherId },
          status: 'submitted',
        },
      }),

      // 5 bài tập gần nhất
      prisma.assignment.findMany({
        where: { assignedBy: teacherId },
        include: {
          exercise: {
            select: { title: true },
          },
        },
        orderBy: { dueDate: 'desc' },
        take: 5,
      }),
    ]);

    const completionRate = totalSubmissions > 0
      ? Math.round((gradedSubmissions / totalSubmissions) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalAssignments,
        completionRate,
        pendingGrading,
        recentAssignments: recentAssignments.map((a) => ({
          id: a.id,
          name: a.exercise?.title || 'Chưa có tên',
          assignedToType: a.assignedToType,
          dueDate: a.dueDate,
          status: a.status,
        })),
      },
    });
  }
);

// GET /api/v1/student/dashboard-stats
export const getStudentDashboardStats: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    const userId = req.user?.id;

    // Tìm student record
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      res.status(200).json({
        success: true,
        data: {
          pendingAssignments: 0,
          averageScore: 0,
          completedAssignments: 0,
          totalAssignments: 0,
          recentSubmissions: [],
        },
      });
      return;
    }

    const [
      totalAssignments,
      allSubmissions,
      recentSubmissions,
    ] = await Promise.all([
      // Tổng bài tập được giao
      prisma.assignment.count({
        where: {
          OR: [
            { assignedToType: 'student', assignedToId: student.id },
            { assignedToType: 'class' },
          ],
        },
      }),

      // Tất cả submission của student (kèm assignmentId để group)
      prisma.exerciseSubmission.findMany({
        where: { studentId: student.id },
        select: {
          assignmentId: true,
          percentage: true,
          status: true,
        },
      }),

      // 5 submission gần nhất (lấy kèm attemptNumber từ DB)
      prisma.exerciseSubmission.findMany({
        where: { studentId: student.id },
        select: {
          id: true,
          assignmentId: true,
          percentage: true,
          status: true,
          submittedAt: true,
          attemptNumber: true,
          assignment: {
            include: {
              exercise: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Group submissions theo assignmentId → chỉ tính mỗi assignment 1 lần
    const assignmentMap = new Map<string, { bestPercentage: number | null; attemptCount: number; isCompleted: boolean }>();
    for (const sub of allSubmissions) {
      const existing = assignmentMap.get(sub.assignmentId);
      const percentage = sub.percentage ? Number(sub.percentage) : null;
      const isCompleted = sub.status === 'graded' || sub.status === 'submitted';

      if (!existing) {
        assignmentMap.set(sub.assignmentId, {
          bestPercentage: percentage,
          attemptCount: 1,
          isCompleted,
        });
      } else {
        existing.attemptCount += 1;
        if (isCompleted) existing.isCompleted = true;
        // Lấy điểm cao nhất trong các lần làm
        if (percentage !== null && (existing.bestPercentage === null || percentage > existing.bestPercentage)) {
          existing.bestPercentage = percentage;
        }
      }
    }

    // Đếm unique assignments đã hoàn thành
    const completedAssignments = Array.from(assignmentMap.values()).filter(
      (a) => a.isCompleted
    ).length;

    // Tính điểm TB dựa trên điểm cao nhất của mỗi assignment
    const scoredAssignments = Array.from(assignmentMap.values()).filter(
      (a) => a.bestPercentage !== null
    );
    const averageScore = scoredAssignments.length > 0
      ? Number(
          (
            scoredAssignments.reduce(
              (sum, a) => sum + (a.bestPercentage || 0),
              0
            ) / scoredAssignments.length / 10
          ).toFixed(1)
        )
      : 0;

    const pendingAssignments = totalAssignments - completedAssignments;

    res.status(200).json({
      success: true,
      data: {
        pendingAssignments: Math.max(0, pendingAssignments),
        averageScore,
        completedAssignments,
        totalAssignments,
        recentSubmissions: recentSubmissions.map((s) => ({
          id: s.id,
          exerciseName: s.assignment?.exercise?.title || 'Chưa có tên',
          score: s.percentage ? Number(s.percentage) : null,
          status: s.status,
          submittedAt: s.submittedAt,
          attemptNumber: s.attemptNumber ?? 1,
        })),
      },
    });
  }
);
