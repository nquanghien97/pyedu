import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { prisma } from '../../database/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const createClassSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  grade: z.number().int().min(1).max(12),
});

export const getClasses: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
  });

  res.json({ success: true, data: classes });
});

export const createClass: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: { message: 'Validation error', details: parsed.error.issues } });
    return;
  }

  const newClass = await prisma.class.create({
    data: {
      id: nanoid(36),
      name: parsed.data.name,
      grade: parsed.data.grade,
      status: 'active',
    },
  });

  res.status(201).json({ success: true, data: newClass });
});

export const getClassStudents: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const { id } = req.params;

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId: id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  res.json({ success: true, data: enrollments });
});

export const enrollStudent: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ success: false, error: { message: 'studentId required' } });

  // Prevent duplicates
  const existing = await prisma.classEnrollment.findFirst({
    where: { classId: id, studentId },
  });
  if (existing) {
    return res.status(400).json({ success: false, error: { message: 'Student already enrolled' } });
  }

  const enrollment = await prisma.classEnrollment.create({
    data: {
      id: nanoid(36),
      classId: id,
      studentId,
      status: 'active',
    },
    include: {
      student: {
        include: { user: { select: { name: true, email: true } } }
      }
    }
  });

  res.status(201).json({ success: true, data: enrollment });
});

export const removeStudent: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const { id, studentId } = req.params;

  await prisma.classEnrollment.deleteMany({
    where: { classId: id, studentId },
  });

  res.json({ success: true, data: null });
});
