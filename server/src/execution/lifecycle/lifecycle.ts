// Based on https://macklin.me/understanding-and-managing-the-node-js-application-lifecycle

import { logger } from '../../lib/logger';

type StatusType = 'running' | 'closing' | 'closed';

let status: StatusType = 'running';
const closingListeners: Array<() => Promise<unknown> | unknown> = [];
const closedListeners: Array<() => Promise<unknown> | unknown> = [];

export const EXIT_CODES = {
  SUCCESS: 0,
  FAILURE: 1,
} as const;
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export const lifecycle = {
  isOpen: () => status === 'running',
  isClosing: () => status === 'closing',

  on: (
    action: 'closing' | 'closed',
    listener: () => Promise<unknown> | unknown
  ) => {
    switch (action) {
      case 'closing':
        closingListeners.push(listener);
        break;
      case 'closed':
        closedListeners.push(listener);
        break;
    }
  },

  close: async (exitCode: ExitCode = EXIT_CODES.SUCCESS) => {
    if (status !== 'running') {
      return;
    }

    status = 'closing';

    if (exitCode === EXIT_CODES.SUCCESS) {
      logger.info('lifecycle is closing', {
        action: 'LIFECYCLE',
        exitCode,
      });
    }

    if (exitCode === EXIT_CODES.FAILURE) {
      logger.alert('lifecycle is closing due to a failure', {
        action: 'LIFECYCLE',
        exitCode,
      });
    }

    await Promise.allSettled(closingListeners.map((listener) => listener()));

    logger.info('all closing listeners settled', {
      action: 'LIFECYCLE',
      exitCode,
    });
    status = 'closed';
    await Promise.allSettled(closedListeners.map((listener) => listener()));

    logger.info(`process exit: ${exitCode}`, {
      action: 'LIFECYCLE',
      exitCode,
    });
    process.exitCode = exitCode;
  },

  _reopenAfterTest: (): void => {
    status = 'running';
  },
};
