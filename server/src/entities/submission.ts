import { z } from 'zod';

export const SUBMISSION_STATUSES = ['submitted', 'graded', 'reviewed'] as const;
export const SUBMISSION_TYPES = ['online', 'file_upload'] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

const answerDataSchema = z.object({
  type: z.string(),
  selectedOption: z.string().optional(),
  selectedOptions: z.array(z.string()).optional(),
  text: z.string().optional(),
  blanks: z
    .array(
      z.object({
        id: z.number(),
        value: z.string(),
      })
    )
    .optional(),
  selectedValue: z.boolean().optional(),
});

const submissionAnswerSchema = z.object({
  questionId: z.string().length(36),
  answerData: answerDataSchema,
});

export const submitExerciseSchema = z.object({
  answers: z.array(submissionAnswerSchema).min(1, 'Cần ít nhất 1 câu trả lời'),
});

export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>;
export type AnswerData = z.infer<typeof answerDataSchema>;
