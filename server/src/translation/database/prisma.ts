import { PrismaPg } from '@prisma/adapter-pg';
import { lifecycle } from '../../execution/lifecycle/lifecycle';
import { PrismaClient } from '../../generated/prisma/client';
import { logger } from '../../lib/logger';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter });

lifecycle.on('closed', async () => {
  if (process.env.TEST_SKIP_SERVER !== 'true') {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
});