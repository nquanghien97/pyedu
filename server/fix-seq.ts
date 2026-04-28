import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/translation/database/prisma';

async function fixSequence() {
  try {
    console.log('Checking max ID in User table...');
    const result: any = await prisma.$queryRaw`SELECT MAX(id) FROM "User"`;
    const maxId = result[0].max || 0;
    
    console.log('Max ID is:', maxId);
    
    console.log('Resetting sequence...');
    await prisma.$queryRaw`SELECT setval('"User_id_seq"', ${maxId > 0 ? maxId : 1}, true)`;
    console.log('Sequence reset successfully!');
    
  } catch (err) {
    console.error('Error fixing sequence:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequence();
