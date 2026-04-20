import cron from 'node-cron';
import { runAutoAssign } from '../../execution/assignment/autoAssign.service';

/**
 * Schedule auto-assign job to run daily at 6:00 AM
 */
export function startAutoAssignScheduler(): void {
  // Cron expression: minute hour day-of-month month day-of-week
  // '0 6 * * *' = every day at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    const startTime = Date.now();

    try {
      const result = await runAutoAssign();
      const duration = Date.now() - startTime;

      if (result.assignmentsCreated > 0 || result.errors.length > 0) {
        // Only log when there's actual activity
        const status = result.errors.length > 0 ? 'with errors' : 'success';
        process.stdout.write(
          `[AutoAssign] ${status} | configs=${result.configsProcessed} | created=${result.assignmentsCreated} | errors=${result.errors.length} | ${duration}ms\n`
        );

        if (result.errors.length > 0) {
          result.errors.forEach((err) => {
            process.stderr.write(`[AutoAssign] Error: ${err}\n`);
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[AutoAssign] Fatal error: ${message}\n`);
    }
  });
}
