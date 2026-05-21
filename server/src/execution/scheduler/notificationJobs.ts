import cron from 'node-cron';
import { prisma } from '../../translation/database/prisma';
import { notificationService } from '../notification/notification.service';

/**
 * Nhắc nhở hàng ngày (7:00 AM) — HS có bài tập chưa hoàn thành
 */
async function dailyReminderJob() {
  try {
    // Lấy tất cả assignment đang pending (chưa nộp) và chưa quá hạn
    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        status: { in: ['assigned', 'pending'] },
        dueDate: { gte: new Date() },
      },
      include: {
        exercise: { select: { title: true } },
      },
    });

    // Gộp theo student (assignedToId)
    const studentMap = new Map<string, { count: number; userId: number }>();

    for (const a of pendingAssignments) {
      if (!a.assignedToId || a.assignedToType !== 'student') continue;

      // Tìm userId của student
      const student = await prisma.student.findUnique({
        where: { id: a.assignedToId },
        select: { userId: true },
      });
      if (!student) continue;

      const existing = studentMap.get(a.assignedToId);
      if (existing) {
        existing.count++;
      } else {
        studentMap.set(a.assignedToId, { count: 1, userId: student.userId });
      }
    }

    // Tạo thông báo cho từng HS
    const notifications = Array.from(studentMap.values()).map((s) => ({
      userId: s.userId,
      title: '📚 Nhắc nhở làm bài!',
      message: `Bạn có ${s.count} bài tập chưa hoàn thành. Hãy cố gắng nhé!`,
      notificationType: 'daily_reminder',
      metadata: { pendingCount: s.count, link: '/student/assignments' },
    }));

    if (notifications.length > 0) {
      await notificationService.bulkCreate(notifications);
      process.stdout.write(`[DailyReminder] Sent to ${notifications.length} students\n`);
    }
  } catch (error) {
    process.stderr.write(`[DailyReminder] Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

/**
 * Nhắc bài sắp hết hạn trong 24h (8:00 AM)
 */
async function dueSoonJob() {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueSoonAssignments = await prisma.assignment.findMany({
      where: {
        status: { in: ['assigned', 'pending'] },
        dueDate: { gte: now, lte: in24h },
      },
      include: {
        exercise: { select: { title: true } },
      },
    });

    const notifications = [];
    for (const a of dueSoonAssignments) {
      if (!a.assignedToId || a.assignedToType !== 'student') continue;

      const student = await prisma.student.findUnique({
        where: { id: a.assignedToId },
        select: { userId: true },
      });
      if (!student) continue;

      const dueDateStr = a.dueDate
        ? a.dueDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

      notifications.push({
        userId: student.userId,
        title: '⏰ Sắp hết hạn!',
        message: `Bài tập "${a.exercise?.title}" sẽ hết hạn vào ${dueDateStr}`,
        notificationType: 'assignment_due_soon',
        metadata: { assignmentId: a.id, dueDate: a.dueDate?.toISOString(), link: `/student/assignments/${a.id}` },
      });
    }

    if (notifications.length > 0) {
      await notificationService.bulkCreate(notifications);
      process.stdout.write(`[DueSoon] Sent ${notifications.length} reminders\n`);
    }
  } catch (error) {
    process.stderr.write(`[DueSoon] Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

/**
 * Kiểm tra bài quá hạn (9:00 AM)
 */
async function overdueJob() {
  try {
    const now = new Date();

    const overdueAssignments = await prisma.assignment.findMany({
      where: {
        status: { in: ['assigned', 'pending'] },
        dueDate: { lt: now },
      },
      include: {
        exercise: { select: { title: true } },
      },
    });

    const notifications = [];
    for (const a of overdueAssignments) {
      if (!a.assignedToId || a.assignedToType !== 'student') continue;

      const student = await prisma.student.findUnique({
        where: { id: a.assignedToId },
        select: { userId: true },
      });
      if (!student) continue;

      notifications.push({
        userId: student.userId,
        title: '❌ Quá hạn nộp bài!',
        message: `Bài tập "${a.exercise?.title}" đã quá hạn. Liên hệ giáo viên nếu cần gia hạn.`,
        notificationType: 'assignment_overdue',
        metadata: { assignmentId: a.id, link: `/student/assignments/${a.id}` },
      });
    }

    // Cập nhật trạng thái assignment
    if (overdueAssignments.length > 0) {
      await prisma.assignment.updateMany({
        where: {
          id: { in: overdueAssignments.map((a) => a.id) },
        },
        data: { status: 'overdue' },
      });
    }

    if (notifications.length > 0) {
      await notificationService.bulkCreate(notifications);
      process.stdout.write(`[Overdue] Marked ${overdueAssignments.length} overdue, sent ${notifications.length} notifications\n`);
    }
  } catch (error) {
    process.stderr.write(`[Overdue] Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

/**
 * Start all notification cron jobs
 */
export function startNotificationScheduler(): void {
  // 7:00 AM — Daily reminder
  cron.schedule('0 7 * * *', dailyReminderJob);
  // 8:00 AM — Due soon
  cron.schedule('0 8 * * *', dueSoonJob);
  // 9:00 AM — Overdue check
  cron.schedule('0 9 * * *', overdueJob);
}
