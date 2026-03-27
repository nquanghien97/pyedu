import { logger } from '../lib/logger';

export const isNever = (x: never): never => {
  const value = typeof x === 'object' ? JSON.stringify(x) : x;
  throw new Error(`Received value for never: ${value}`);
};

export const isWeakNever = (x: never): void => {
  logger.info(`WeakNeverCheck: Received value for never: ${x}`);
};
