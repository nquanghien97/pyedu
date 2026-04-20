import { prisma } from './prisma';
import { nanoid } from 'nanoid';
import { MasteryLevel } from '../../entities/progress';

export const progressRepository = {
  /**
   * Upsert student progress for a specific subject/topic combination
   */
  async upsert(data: {
    studentId: string;
    subjectId: string | null;
    topicId: string | null;
    exercisesCompleted: number;
    averageScore: number;
    masteryLevel: MasteryLevel;
  }) {
    // Find existing progress record
    const existing = await prisma.studentProgress.findFirst({
      where: {
        studentId: data.studentId,
        subjectId: data.subjectId ?? undefined,
        topicId: data.topicId ?? undefined,
      },
    });

    if (existing) {
      return prisma.studentProgress.update({
        where: { id: existing.id },
        data: {
          exercisesCompleted: data.exercisesCompleted,
          averageScore: data.averageScore,
          masteryLevel: data.masteryLevel,
        },
      });
    }

    return prisma.studentProgress.create({
      data: {
        id: nanoid(36),
        studentId: data.studentId,
        subjectId: data.subjectId,
        topicId: data.topicId,
        exercisesCompleted: data.exercisesCompleted,
        averageScore: data.averageScore,
        masteryLevel: data.masteryLevel,
      },
    });
  },

  /**
   * Get progress overview for a student
   */
  async getStudentOverview(studentId: string) {
    return prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
      },
    });
  },

  /**
   * Get progress for a specific student + subject
   */
  async getBySubject(studentId: string, subjectId: string) {
    return prisma.studentProgress.findMany({
      where: { studentId, subjectId },
      include: {
        topic: { select: { id: true, name: true } },
      },
    });
  },

  /**
   * Get all students progress (teacher view) — optionally filter by class
   */
  async getAllStudentsProgress(classId?: string) {
    const studentFilter: Record<string, unknown> = {};

    if (classId) {
      studentFilter.enrollments = { some: { classId } };
    }

    const students = await prisma.student.findMany({
      where: studentFilter,
      include: {
        user: { select: { name: true, email: true } },
        progress: {
          include: {
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    return students.map((student) => {
      const progressRecords = student.progress;
      const totalExercises = progressRecords.reduce(
        (sum, p) => sum + (p.exercisesCompleted ?? 0),
        0
      );
      const scores = progressRecords
        .filter((p) => p.averageScore !== null)
        .map((p) => Number(p.averageScore));
      const overallAvg =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
          : 0;

      return {
        studentId: student.id,
        studentName: student.user.name,
        studentEmail: student.user.email,
        totalExercises,
        overallAverageScore: overallAvg,
        bySubject: progressRecords
          .filter((p) => p.subjectId && !p.topicId)
          .map((p) => ({
            subjectId: p.subjectId,
            subjectName: p.subject?.name ?? '',
            exercisesCompleted: p.exercisesCompleted ?? 0,
            averageScore: Number(p.averageScore ?? 0),
            masteryLevel: p.masteryLevel ?? 'beginner',
          })),
      };
    });
  },

  /**
   * Get detailed progress for a single student (teacher view)
   */
  async getStudentDetail(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true } },
        progress: {
          include: {
            subject: { select: { id: true, name: true } },
            topic: { select: { id: true, name: true } },
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            totalScore: true,
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
        },
      },
    });

    return student;
  },
};
