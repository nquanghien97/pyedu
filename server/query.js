const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Submissions:', await prisma.exerciseSubmission.count());
  console.log('Assignments:', await prisma.assignment.count());
  
  const subs = await prisma.exerciseSubmission.findMany({
    include: {
      assignment: {
        include: {
          exercise: {
            select: { title: true }
          }
        }
      }
    }
  });
  
  console.log(JSON.stringify(subs.map(s => ({
    id: s.id,
    assignmentId: s.assignmentId,
    title: s.assignment.exercise.title,
    studentId: s.studentId
  })), null, 2));
}

main().finally(() => prisma.$disconnect());
