import { EXIT_CODES, ExitCode, lifecycle } from './lifecycle';
import { PartialRecord } from '../../@types/Utility/PartialRecord';
import { logger } from '../../lib/logger';

const lifecycleClosingSignals: PartialRecord<NodeJS.Signals, ExitCode> = {
  SIGTERM: EXIT_CODES.SUCCESS,
  SIGINT: EXIT_CODES.SUCCESS,
  SIGQUIT: EXIT_CODES.SUCCESS,
  SIGABRT: EXIT_CODES.FAILURE,
} as const;

export const setupNodeProcess = (): void => {
  Object.entries(lifecycleClosingSignals).forEach(([signal, exitCode]) =>
    process.on(signal, async () => {
      logger.info(`${signal} called.`);
      await lifecycle.close(exitCode);
    })
  );

  process
    .on('uncaughtException', async (err) => {
      logger.error('Uncaught exception:', {
        error: err,
      });

      await lifecycle.close(EXIT_CODES.FAILURE);
    })
    .on('unhandledRejection', async (err) => {
      logger.error('Unhandled rejection:', {
        error: err,
      });

      await lifecycle.close(EXIT_CODES.FAILURE);
    });
};
