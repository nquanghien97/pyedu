import { submissionRepository } from '../../translation/database/submission.repo';
import { progressRepository } from '../../translation/database/progress.repo';
import { classifyMastery } from '../../entities/progress';

/**
 * After a student submits an assignment, update their progress records
 * for the relevant subject and topic.
 */
export async function updateStudentProgress(
  studentId: string,
  subjectId: string | null,
  topicId: string | null
): Promise<void> {
  // Update subject-level progress
  if (subjectId) {
    const scores = await submissionRepository.getStudentScores(
      studentId,
      subjectId
    );

    const percentages = scores
      .filter((s) => s.percentage !== null)
      .map((s) => Number(s.percentage));

    const avgScore =
      percentages.length > 0
        ? Math.round(
            (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100
          ) / 100
        : 0;

    await progressRepository.upsert({
      studentId,
      subjectId,
      topicId: null,
      exercisesCompleted: percentages.length,
      averageScore: avgScore,
      masteryLevel: classifyMastery(avgScore),
    });
  }

  // Update topic-level progress
  if (topicId) {
    const scores = await submissionRepository.getStudentScores(
      studentId,
      undefined,
      topicId
    );

    const percentages = scores
      .filter((s) => s.percentage !== null)
      .map((s) => Number(s.percentage));

    const avgScore =
      percentages.length > 0
        ? Math.round(
            (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100
          ) / 100
        : 0;

    await progressRepository.upsert({
      studentId,
      subjectId: null,
      topicId,
      exercisesCompleted: percentages.length,
      averageScore: avgScore,
      masteryLevel: classifyMastery(avgScore),
    });
  }
}
