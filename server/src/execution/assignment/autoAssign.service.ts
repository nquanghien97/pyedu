import { autoAssignRepository } from '../../translation/database/autoAssign.repo';
import { assignmentRepository } from '../../translation/database/assignment.repo';
import { prisma } from '../../translation/database/prisma';

/**
 * Auto-assign exercises based on active configurations.
 * Called by cron job daily at 6:00 AM.
 */
export async function runAutoAssign(): Promise<{
  configsProcessed: number;
  assignmentsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let assignmentsCreated = 0;

  const configs = await autoAssignRepository.findActiveConfigs();

  // Filter by day of week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const activeConfigs = configs.filter((config) => {
    if (!config.daysOfWeek) return true; // no restriction
    const days = config.daysOfWeek as number[];
    return days.includes(dayOfWeek);
  });

  for (const config of activeConfigs) {
    try {
      // Find eligible exercises for auto-assignment
      const exercises = await prisma.exercise.findMany({
        where: {
          subjectId: config.subjectId,
          topicId: config.topicId ?? undefined,
          difficultyLevel: config.difficultyLevel ?? undefined,
          status: 'approved',
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 50, // pool to pick from
      });

      if (exercises.length === 0) {
        errors.push(
          `Config ${config.id}: No eligible exercises found for subject=${config.subjectId}`
        );
        continue;
      }

      // Get students to assign to
      let studentIds: string[] = [];

      if (config.classId && config.class) {
        // Assign to all students in the class
        studentIds = config.class.enrollments.map((e) => e.studentId);
      }

      if (studentIds.length === 0) {
        errors.push(`Config ${config.id}: No students found`);
        continue;
      }

      // Pick random exercises (up to exercisesPerDay)
      const shuffled = exercises.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, config.exercisesPerDay);

      const assignedBy = config.tutor.user.id;

      // Create assignments for each selected exercise
      for (const exercise of selected) {
        // Check if already assigned today
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const existing = await prisma.assignment.findFirst({
          where: {
            exerciseId: exercise.id,
            assignedToType: 'class',
            assignedToId: config.classId ?? '',
            dueDate: { gte: startOfDay },
          },
        });

        if (existing) continue; // Already assigned today

        // Set due date to end of day
        const dueDate = new Date(now);
        dueDate.setHours(23, 59, 59, 999);

        await assignmentRepository.create(
          {
            exerciseId: exercise.id,
            assignedToType: 'class',
            assignedToId: config.classId ?? '',
            dueDate: dueDate.toISOString(),
          },
          assignedBy
        );
        assignmentsCreated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Config ${config.id}: ${message}`);
    }
  }

  return {
    configsProcessed: activeConfigs.length,
    assignmentsCreated,
    errors,
  };
}
