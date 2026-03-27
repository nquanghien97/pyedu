import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../withAsyncErrorHandling';
import { logger } from '../../lib/logger';
import { lifecycle } from '../../execution/lifecycle/lifecycle';
import { prisma } from '../database/prisma';

export const livezRequestHandler: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    try {
      if (lifecycle.isOpen()) {
        const queryResult = await prisma.$queryRaw<Array<{ 1: number }> | { rows: unknown[] }>`SELECT 1`;
        if (Array.isArray(queryResult) ? queryResult.length : queryResult.rows.length) {
          res.status(200).json({ ok: true });
          return;
        }
      }
    } catch (error) {
      logger.error('Failed to check live', {
        action: 'LIVEZ_REQUEST_HANDLER',
        error,
      });
    }
    res.sendStatus(500);
  }
);
