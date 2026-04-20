import { AnswerData } from '../../entities/submission';

interface QuestionData {
  id: string;
  questionType: string | null;
  points: number | null;
  content: unknown;
  autoGrade: boolean;
}

interface GradingResult {
  questionId: string;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  feedback: string | null;
}

/**
 * Auto-grade a single question answer based on its type
 */
function gradeQuestion(
  question: QuestionData,
  answerData: AnswerData
): GradingResult {
  const maxPoints = Number(question.points ?? 0);

  // If question doesn't support auto-grading, mark as pending review
  if (!question.autoGrade) {
    return {
      questionId: question.id,
      isCorrect: null,
      pointsEarned: null,
      feedback: 'Câu hỏi này cần giáo viên chấm điểm.',
    };
  }

  const content = question.content as Record<string, unknown>;
  if (!content) {
    return {
      questionId: question.id,
      isCorrect: null,
      pointsEarned: null,
      feedback: 'Không có dữ liệu đáp án để chấm.',
    };
  }

  // Normalize questionType: handle both 'multiple-choice' and 'multiple_choice'
  const normalizedType = (question.questionType ?? '').replace(/-/g, '_');

  switch (normalizedType) {
    case 'multiple_choice':
      return gradeMultipleChoice(question.id, content, answerData, maxPoints);

    case 'multiple_select':
      return gradeMultipleSelect(question.id, content, answerData, maxPoints);

    case 'true_false':
      return gradeTrueFalse(question.id, content, answerData, maxPoints);

    case 'fill_blank':
      return gradeFillBlank(question.id, content, answerData, maxPoints);

    default:
      return {
        questionId: question.id,
        isCorrect: null,
        pointsEarned: null,
        feedback: 'Loại câu hỏi chưa hỗ trợ tự chấm điểm.',
      };
  }
}

function gradeMultipleChoice(
  questionId: string,
  content: Record<string, unknown>,
  answerData: AnswerData,
  maxPoints: number
): GradingResult {
  const options = content.options as Array<Record<string, unknown>> | undefined;
  const selectedOption = answerData.selectedOption;

  if (!options) {
    return { questionId, isCorrect: null, pointsEarned: null, feedback: null };
  }

  // Handle both formats:
  // Format 1 (Phase 1): options[].isCorrect = true, option id in options[].id
  // Format 2 (AI-gen): content.correctAnswer = "B", option id in options[].value
  let correctId: string | undefined;

  if (content.correctAnswer !== undefined) {
    // AI-generated format: correctAnswer is a string like "B"
    correctId = String(content.correctAnswer);
  } else {
    // Phase 1 format: find the option with isCorrect = true
    const correctOpt = options.find((o) => o.isCorrect === true);
    correctId = (correctOpt?.id as string) ?? (correctOpt?.value as string);
  }

  // Normalize: option id could be in 'id' or 'value' field
  const isCorrect = correctId === selectedOption;

  return {
    questionId,
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
    feedback: isCorrect
      ? 'Chính xác!'
      : `Sai. Đáp án đúng là: ${correctId ?? '?'}`,
  };
}

function gradeMultipleSelect(
  questionId: string,
  content: Record<string, unknown>,
  answerData: AnswerData,
  maxPoints: number
): GradingResult {
  const options = content.options as Array<Record<string, unknown>> | undefined;
  if (!options) {
    return { questionId, isCorrect: null, pointsEarned: null, feedback: null };
  }

  // Handle both formats
  let correctIds: Set<string>;
  if (Array.isArray(content.correctAnswers)) {
    // AI format: correctAnswers is array like ["A", "C"]
    correctIds = new Set((content.correctAnswers as string[]).map(String));
  } else {
    // Phase 1 format: options[].isCorrect = true
    correctIds = new Set(
      options
        .filter((o) => o.isCorrect === true)
        .map((o) => ((o.id as string) ?? (o.value as string)))
    );
  }

  const selectedIds = new Set(answerData.selectedOptions ?? []);

  // Check if selected matches exactly
  const isCorrect =
    correctIds.size === selectedIds.size &&
    [...correctIds].every((id) => selectedIds.has(id));

  if (isCorrect) {
    return {
      questionId,
      isCorrect: true,
      pointsEarned: maxPoints,
      feedback: 'Chính xác!',
    };
  }

  // Partial scoring
  const correctSelected = [...selectedIds].filter((id) => correctIds.has(id)).length;
  const incorrectSelected = [...selectedIds].filter((id) => !correctIds.has(id)).length;

  const partialPoints = Math.max(
    0,
    Math.round(((correctSelected - incorrectSelected) / correctIds.size) * maxPoints * 100) / 100
  );

  return {
    questionId,
    isCorrect: false,
    pointsEarned: partialPoints,
    feedback: `Chưa hoàn toàn đúng. Đáp án đúng: ${[...correctIds].join(', ')}`,
  };
}

function gradeTrueFalse(
  questionId: string,
  content: Record<string, unknown>,
  answerData: AnswerData,
  maxPoints: number
): GradingResult {
  const correctAnswer = content.correctAnswer as boolean;
  const selectedValue = answerData.selectedValue;

  const isCorrect = correctAnswer === selectedValue;

  return {
    questionId,
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
    feedback: isCorrect
      ? 'Chính xác!'
      : `Sai. Đáp án đúng là: ${correctAnswer ? 'Đúng' : 'Sai'}`,
  };
}

function gradeFillBlank(
  questionId: string,
  content: Record<string, unknown>,
  answerData: AnswerData,
  maxPoints: number
): GradingResult {
  const blanks = content.blanks as Array<{
    id: number;
    acceptedAnswers: string[];
    caseSensitive?: boolean;
  }>;
  if (!blanks || !answerData.blanks) {
    return { questionId, isCorrect: null, pointsEarned: null, feedback: null };
  }

  let correctCount = 0;
  const feedbackParts: string[] = [];

  for (const blank of blanks) {
    const studentAnswer = answerData.blanks.find((b) => b.id === blank.id);
    if (!studentAnswer) {
      feedbackParts.push(`Ô ${blank.id}: Chưa trả lời`);
      continue;
    }

    const caseSensitive = blank.caseSensitive ?? false;
    const normalizeAnswer = (s: string) =>
      caseSensitive ? s.trim() : s.trim().toLowerCase();

    const isMatch = blank.acceptedAnswers.some(
      (accepted) => normalizeAnswer(accepted) === normalizeAnswer(studentAnswer.value)
    );

    if (isMatch) {
      correctCount++;
    } else {
      feedbackParts.push(
        `Ô ${blank.id}: Sai (đáp án: ${blank.acceptedAnswers[0]})`
      );
    }
  }

  const isAllCorrect = correctCount === blanks.length;
  const pointsEarned =
    blanks.length > 0
      ? Math.round((correctCount / blanks.length) * maxPoints * 100) / 100
      : 0;

  return {
    questionId,
    isCorrect: isAllCorrect,
    pointsEarned,
    feedback: isAllCorrect
      ? 'Chính xác!'
      : feedbackParts.join('; '),
  };
}

/**
 * Grade all answers for an exercise submission
 */
export function gradeSubmission(
  questions: QuestionData[],
  answers: { questionId: string; answerData: AnswerData }[]
): GradingResult[] {
  return answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) {
      return {
        questionId: answer.questionId,
        isCorrect: null,
        pointsEarned: null,
        feedback: 'Câu hỏi không tồn tại.',
      };
    }
    return gradeQuestion(question, answer.answerData);
  });
}
