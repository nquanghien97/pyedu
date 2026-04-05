import { prisma } from './prisma';
import { Prisma } from '../../generated/prisma/client';
import { nanoid } from 'nanoid';
import { CreateAssignmentInput, TeacherAssignmentFilters } from '../../entities/assignment';

interface Pagination {
  page: number;
  limit: number;
}

export const assignmentRepository = {
  /**
   * Teacher creates an assignment (assign exercise to student or class)
   */
  async create(data: CreateAssignmentInput, assignedBy: number) {
    return prisma.assignment.create({
      data: {
        id: nanoid(36),
        exerciseId: data.exerciseId,
        assignedToType: data.assignedToType,
        assignedToId: data.assignedToId,
        assignedBy,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        maxAttempts: data.maxAttempts ?? null,
        status: 'active',
      },
      include: {
        exercise: {
          include: {
            subject: { select: { id: true, name: true } },
            _count: { select: { questions: true } },
          },
        },
        assigner: { select: { id: true, name: true } },
      },
    });
  },

  /**
   * Teacher: list assignments they created (with filters + pagination)
   */
  async findByTeacher(
    teacherUserId: number,
    filters: TeacherAssignmentFilters,
    pagination: Pagination
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    const where: Prisma.AssignmentWhereInput = {
      assignedBy: teacherUserId,
    };

    if (filters.assignedToType) {
      where.assignedToType = filters.assignedToType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.exerciseId) {
      where.exerciseId = filters.exerciseId;
    }
    if (filters.search) {
      where.exercise = {
        title: { contains: filters.search, mode: 'insensitive' },
      };
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          exercise: {
            include: {
              subject: { select: { id: true, name: true } },
              topic: { select: { id: true, name: true } },
              _count: { select: { questions: true } },
            },
          },
          assigner: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    return {
      assignments,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  },

  /**
   * Student: find assignments assigned to them
   * - directly (assignedToType='student', assignedToId=studentId)
   * - via class (assignedToType='class', assignedToId IN enrolledClassIds)
   */
  async findStudentAssignments(
    studentId: string,
    filters: { subjectId?: string; search?: string },
    pagination: Pagination
  ) {
    const skip = (pagination.page - 1) * pagination.limit;

    // Get all classIds the student is enrolled in
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId },
      select: { classId: true },
    });
    const enrolledClassIds = enrollments.map((e) => e.classId);

    // Build OR conditions: assigned directly OR via enrolled class
    const orConditions: Prisma.AssignmentWhereInput[] = [
      { assignedToType: 'student', assignedToId: studentId },
    ];
    if (enrolledClassIds.length > 0) {
      orConditions.push({
        assignedToType: 'class',
        assignedToId: { in: enrolledClassIds },
      });
    }

    const where: Prisma.AssignmentWhereInput = {
      OR: orConditions,
      status: 'active',
    };

    // Apply exercise-level filters
    const exerciseFilter: Prisma.ExerciseWhereInput = {};
    if (filters.subjectId) {
      exerciseFilter.subjectId = filters.subjectId;
    }
    if (filters.search) {
      exerciseFilter.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (Object.keys(exerciseFilter).length > 0) {
      where.exercise = exerciseFilter;
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          exercise: {
            include: {
              subject: { select: { id: true, name: true } },
              topic: { select: { id: true, name: true } },
              _count: { select: { questions: true } },
            },
          },
          submissions: {
            where: { studentId },
            orderBy: { submittedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              totalScore: true,
              percentage: true,
              status: true,
              submittedAt: true,
              attemptNumber: true,
              isLate: true,
            },
          },
          assigner: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: pagination.limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    return {
      assignments,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  },

  /**
   * Student stats: total assigned, completed, overdue
   */
  async getStudentStats(studentId: string) {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId },
      select: { classId: true },
    });
    const enrolledClassIds = enrollments.map((e) => e.classId);

    const orConditions: Prisma.AssignmentWhereInput[] = [
      { assignedToType: 'student', assignedToId: studentId },
    ];
    if (enrolledClassIds.length > 0) {
      orConditions.push({
        assignedToType: 'class',
        assignedToId: { in: enrolledClassIds },
      });
    }

    const baseWhere: Prisma.AssignmentWhereInput = {
      OR: orConditions,
      status: 'active',
    };

    const [total, allAssignments] = await Promise.all([
      prisma.assignment.count({ where: baseWhere }),
      prisma.assignment.findMany({
        where: baseWhere,
        select: {
          id: true,
          dueDate: true,
          submissions: {
            where: { studentId },
            select: { id: true, percentage: true },
          },
        },
      }),
    ]);

    let completed = 0;
    let overdue = 0;
    let totalScore = 0;
    let scoredCount = 0;

    const now = new Date();
    for (const a of allAssignments) {
      if (a.submissions.length > 0) {
        completed++;
        const pct = a.submissions[0].percentage;
        if (pct !== null) {
          totalScore += Number(pct);
          scoredCount++;
        }
      } else if (a.dueDate && a.dueDate < now) {
        overdue++;
      }
    }

    return {
      total,
      completed,
      pending: total - completed - overdue,
      overdue,
      averageScore: scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : null,
    };
  },
};
