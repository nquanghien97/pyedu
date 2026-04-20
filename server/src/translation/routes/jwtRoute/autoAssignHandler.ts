import { Request, Response } from 'express';
import { z } from 'zod';
import { autoAssignRepository } from '../../database/autoAssign.repo';
import { runAutoAssign } from '../../../execution/assignment/autoAssign.service';

const createSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().min(1, 'Vui lòng chọn môn học'),
  topicId: z.string().optional(),
  difficultyLevel: z.string().optional(),
  exercisesPerDay: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
});

const updateSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  topicId: z.string().nullable().optional(),
  difficultyLevel: z.string().nullable().optional(),
  exercisesPerDay: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
});

/**
 * GET /api/v1/auto-assign — List auto-assign configs for current teacher
 */
export async function getAutoAssignConfigs(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as Record<string, unknown>).user as { id: number; role: string };
    const { prisma } = await import('../../database/prisma');
    let tutor = await prisma.tutor.findUnique({ where: { userId: user.id } });

    if (!tutor) {
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const { nanoid } = await import('nanoid');
        tutor = await prisma.tutor.create({
          data: {
            id: nanoid(36),
            userId: user.id,
            status: 'active',
          }
        });
      } else {
        res.status(403).json({ success: false, error: 'Chỉ giáo viên mới có quyền truy cập' });
        return;
      }
    }

    const configs = await autoAssignRepository.findByTutorId(tutor.id);
    res.json({ success: true, data: configs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi server';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * POST /api/v1/auto-assign — Create auto-assign config
 */
export async function createAutoAssignConfig(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as Record<string, unknown>).user as { id: number; role: string };
    const parsed = createSchema.parse(req.body);

    const { prisma } = await import('../../database/prisma');
    let tutor = await prisma.tutor.findUnique({ where: { userId: user.id } });

    if (!tutor) {
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const { nanoid } = await import('nanoid');
        tutor = await prisma.tutor.create({
          data: {
            id: nanoid(36),
            userId: user.id,
            status: 'active',
          }
        });
      } else {
        res.status(403).json({ success: false, error: 'Chỉ giáo viên mới có quyền truy cập' });
        return;
      }
    }

    const config = await autoAssignRepository.create({
      tutorId: tutor.id,
      ...parsed,
    });

    res.status(201).json({ success: true, data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues[0].message });
      return;
    }
    const message = error instanceof Error ? error.message : 'Lỗi server';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * PUT /api/v1/auto-assign/:id — Update auto-assign config
 */
export async function updateAutoAssignConfig(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as Record<string, unknown>).user as { id: number; role: string };
    const configId = req.params.id as string;
    const parsed = updateSchema.parse(req.body);

    // Check ownership
    const existing = await autoAssignRepository.findById(configId);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Không tìm thấy cấu hình' });
      return;
    }

    const { prisma } = await import('../../database/prisma');
    let tutor = await prisma.tutor.findUnique({ where: { userId: user.id } });

    if (!tutor) {
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const { nanoid } = await import('nanoid');
        tutor = await prisma.tutor.create({
          data: {
            id: nanoid(36),
            userId: user.id,
            status: 'active',
          }
        });
      } else {
        res.status(403).json({ success: false, error: 'Chỉ giáo viên mới có quyền truy cập' });
        return;
      }
    }

    if (existing.tutorId !== tutor.id) {
      res.status(403).json({ success: false, error: 'Không có quyền chỉnh sửa cấu hình này' });
      return;
    }

    const config = await autoAssignRepository.update(configId, parsed);
    res.json({ success: true, data: config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues[0].message });
      return;
    }
    const message = error instanceof Error ? error.message : 'Lỗi server';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/v1/auto-assign/:id — Delete auto-assign config
 */
export async function deleteAutoAssignConfig(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as Record<string, unknown>).user as { id: number; role: string };
    const configId = req.params.id as string;

    const existing = await autoAssignRepository.findById(configId);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Không tìm thấy cấu hình' });
      return;
    }

    const { prisma } = await import('../../database/prisma');
    let tutor = await prisma.tutor.findUnique({ where: { userId: user.id } });

    if (!tutor) {
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        const { nanoid } = await import('nanoid');
        tutor = await prisma.tutor.create({
          data: {
            id: nanoid(36),
            userId: user.id,
            status: 'active',
          }
        });
      } else {
        res.status(403).json({ success: false, error: 'Chỉ giáo viên mới có quyền truy cập' });
        return;
      }
    }

    if (existing.tutorId !== tutor.id) {
      res.status(403).json({ success: false, error: 'Không có quyền xóa cấu hình này' });
      return;
    }

    await autoAssignRepository.delete(configId);
    res.json({ success: true, data: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi server';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * POST /api/v1/auto-assign/run — Manually trigger auto-assign (admin/testing)
 */
export async function triggerAutoAssign(req: Request, res: Response): Promise<void> {
  try {
    const result = await runAutoAssign();
    res.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi server';
    res.status(500).json({ success: false, error: message });
  }
}
