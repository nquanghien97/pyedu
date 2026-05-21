'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import {
  ExerciseQuestionEntity,
  DIFFICULTY_LABELS,
  DifficultyLevel,
} from '@/entity/exercise';
import { AnswerData, SubmitAnswerInput, SubmissionEntity } from '@/entity/submission';
import { api } from '@/lib/api';
import { submitExercise, getMySubmissions } from '@/services/submission';
import { notification } from '@/components/notification';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, H3, P } from "@/components/ui/typography";

interface AssignmentDetail {
  id: string;
  exerciseId: string;
  dueDate: string | null;
  maxAttempts: number | null;
  status: string | null;
  exercise: {
    id: string;
    title: string | null;
    grade: number | null;
    difficultyLevel: DifficultyLevel | null;
    totalPoints: number | null;
    timeLimitMinutes: number | null;
    subject?: { id: string; name: string } | null;
    topic?: { id: string; name: string } | null;
    questions?: ExerciseQuestionEntity[];
  };
  submissions?: { id: string; percentage: number | null; status: string | null }[];
}

export default function DoExercisePage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerData>>({});
  const [submissionResult, setSubmissionResult] = useState<SubmissionEntity | null>(null);
  const [previousSubmissions, setPreviousSubmissions] = useState<SubmissionEntity[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch assignment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get assignment with exercise + questions
        const res = await api<AssignmentDetail>({
          url: `/api/v1/student/assignments/${assignmentId}/submissions`,
        });

        // We need to also fetch the exercise details separately
        // since the student assignment endpoint doesn't include questions
      } catch {
        // fallback
      }
    };

    const loadAssignment = async () => {
      setLoading(true);
      try {
        // First, get the assignments list and find ours
        const assignmentsRes = await api<AssignmentDetail[]>({
          url: '/api/v1/student/assignments',
        });
        const found = assignmentsRes.data.find((a) => a.id === assignmentId);

        if (!found) {
          router.push('/student/assignments');
          return;
        }

        // Fetch full exercise with questions
        const exerciseRes = await api<AssignmentDetail['exercise']>({
          url: `/api/v1/exercises/${found.exerciseId}`,
        });

        found.exercise = exerciseRes.data;

        setAssignment(found);

        // Initialize timer
        if (exerciseRes.data.timeLimitMinutes) {
          setTimeLeft(exerciseRes.data.timeLimitMinutes * 60);
        }

        // Check previous submissions
        try {
          const subs = await getMySubmissions(assignmentId);
          setPreviousSubmissions(subs);
        } catch {
          // no previous submissions
        }
      } catch {
        router.push('/student/assignments');
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId, router]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0 && !showResult && !submitting) {
      handleSubmit();
    }
  }, [timeLeft, showResult, submitting]);

  const questions = assignment?.exercise?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const updateAnswer = (questionId: string, answerData: AnswerData) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerData }));
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const submitAnswers: SubmitAnswerInput[] = questions.map((q) => ({
        questionId: q.id,
        answerData: answers[q.id] ?? { type: q.questionType ?? 'essay' },
      }));

      const result = await submitExercise(assignmentId, {
        answers: submitAnswers,
      });

      setSubmissionResult(result);
      setShowResult(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      notification.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <P className="text-sm text-gray-500">Đang tải bài tập...</P>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  // Show result view
  if (showResult && submissionResult) {
    return (
      <div className="min-h-screen bg-slate-50 p-7">
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: (submissionResult.percentage ?? 0) >= 60
                    ? 'linear-gradient(135deg, #10B981, #059669)'
                    : 'linear-gradient(135deg, #F59E0B, #D97706)',
                }}
              >
                <Trophy size={36} className="text-white" />
              </div>
              <H1>
                Kết quả bài làm
              </H1>
              <P className="text-sm text-gray-500">
                {assignment.exercise.title}
              </P>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <P className="text-xs text-blue-600 font-medium mb-1">Điểm số</P>
                <P className="text-3xl font-extrabold text-blue-700">
                  {submissionResult.totalScore ?? 0}
                </P>
                <P className="text-xs text-blue-500">
                  / {assignment.exercise.totalPoints ?? 0}
                </P>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <P className="text-xs text-green-600 font-medium mb-1">Phần trăm</P>
                <P className="text-3xl font-extrabold text-green-700">
                  {submissionResult.percentage ?? 0}%
                </P>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <P className="text-xs text-purple-600 font-medium mb-1">Lần nộp</P>
                <P className="text-3xl font-extrabold text-purple-700">
                  {submissionResult.attemptNumber ?? 1}
                </P>
                {assignment.maxAttempts && (
                  <P className="text-xs text-purple-500">
                    / {assignment.maxAttempts}
                  </P>
                )}
              </div>
            </div>

            {submissionResult.isLate && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                <span className="text-sm text-orange-600 font-medium">
                  Bài nộp trễ hạn
                </span>
              </div>
            )}
          </div>

          {/* Detailed Answers */}
          <div className="space-y-4 mb-6">
            {submissionResult.answers.map((answer, idx) => {
              const question = answer.question;
              return (
                <div
                  key={answer.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-gray-400 font-medium uppercase">
                        {question?.questionType === 'multiple_choice'
                          ? 'Trắc nghiệm'
                          : question?.questionType === 'fill_blank'
                            ? 'Điền khuyết'
                            : question?.questionType === 'true_false'
                              ? 'Đúng/Sai'
                              : question?.questionType === 'essay'
                                ? 'Tự luận'
                                : question?.questionType ?? ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {answer.isCorrect === true && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                          ✓ Đúng
                        </span>
                      )}
                      {answer.isCorrect === false && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                          ✗ Sai
                        </span>
                      )}
                      {answer.isCorrect === null && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          Chờ chấm
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-500">
                        {answer.pointsEarned ?? '?'}/{question?.points ?? 0} điểm
                      </span>
                    </div>
                  </div>

                  <P className="text-sm text-gray-800 font-medium mb-3">
                    {question?.questionText}
                  </P>

                  {answer.feedback && (
                    <div className="bg-slate-50 rounded-xl p-3 mt-3">
                      <P className="text-xs text-gray-500 font-medium mb-1">
                        Nhận xét:
                      </P>
                      <P className="text-sm text-gray-700">{answer.feedback}</P>
                    </div>
                  )}

                  {question?.explanation && (
                    <div className="bg-blue-50 rounded-xl p-3 mt-3">
                      <P className="text-xs text-blue-600 font-medium mb-1">
                        Giải thích:
                      </P>
                      <P className="text-sm text-blue-800">
                        {question.explanation}
                      </P>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => router.push('/student/assignments')}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              ← Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Exercise doing view
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm px-6 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/student/assignments')}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer border-none"
            >
              <ArrowLeft size={16} className="text-gray-600" />
            </Button>
            <div>
              <H1>
                {assignment.exercise.title}
              </H1>
              <div className="flex items-center gap-3 mt-0.5">
                {assignment.exercise.subject && (
                  <span className="text-xs text-gray-500">
                    {assignment.exercise.subject.name}
                  </span>
                )}
                {assignment.exercise.difficultyLevel && (
                  <span className="text-xs text-gray-400">
                    {DIFFICULTY_LABELS[assignment.exercise.difficultyLevel]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            {timeLeft !== null && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold"
                style={{
                  background: timeLeft < 60 ? '#FEF2F2' : '#F0F9FF',
                  color: timeLeft < 60 ? '#DC2626' : '#0284C7',
                }}
              >
                <Clock size={14} />
                {formatTime(timeLeft)}
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={submitting || answeredCount === 0} className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Nộp bài
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full py-6 px-4 gap-6">
        {/* Question Navigator */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-20">
            <H3 className="text-xs uppercase tracking-wider mb-4">
              Câu hỏi ({totalQuestions})
            </H3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <Button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer border-none"
                    style={{
                      background: isCurrent
                        ? '#3B82F6'
                        : isAnswered
                          ? '#DBEAFE'
                          : '#F1F5F9',
                      color: isCurrent
                        ? 'white'
                        : isAnswered
                          ? '#2563EB'
                          : '#94A3B8',
                    }}
                  >
                    {idx + 1}
                  </Button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-blue-100" />
                Đã trả lời ({answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-slate-100" />
                Chưa trả lời ({totalQuestions - answeredCount})
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1">
          {currentQuestion && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-sm font-extrabold text-blue-600">
                    {currentQuestionIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs text-gray-400 font-medium uppercase">
                      {(() => {
                        const qType = normalizeQuestionType(currentQuestion.questionType);
                        const labels: Record<string, string> = {
                          multiple_choice: 'Trắc nghiệm',
                          multiple_select: 'Chọn nhiều đáp án',
                          fill_blank: 'Điền khuyết',
                          true_false: 'Đúng/Sai',
                          essay: 'Tự luận',
                          matching: 'Nối cột',
                          ordering: 'Sắp xếp',
                        };
                        return labels[qType] ?? currentQuestion.questionType ?? '';
                      })()}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400">
                  {currentQuestion.points ?? 0} điểm
                </span>
              </div>

              <P className="text-base text-gray-800 font-medium leading-relaxed mb-8">
                {currentQuestion.questionText}
              </P>

              {/* Render answer input based on type */}
              <QuestionAnswerInput
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswer={(data) => updateAnswer(currentQuestion.id, data)}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Câu trước
                </Button>
                <span className="text-xs text-gray-400">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </span>
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(totalQuestions - 1, prev + 1)
                    )
                  }
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Câu tiếp
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Normalize question type to handle both formats:
 * - DB may use hyphens: 'multiple-choice'
 * - Code uses underscores: 'multiple_choice'
 */
function normalizeQuestionType(type: string | null): string {
  if (!type) return '';
  return type.replace(/-/g, '_');
}

/**
 * Normalize options to handle ALL possible formats:
 * - Format 1 (AI-generated): plain strings: ["đáp án 1", "đáp án 2", ...]
 * - Format 2 (Phase 1 spec): objects: { id: "A", text: "...", isCorrect: true }
 * - Format 3 (variant): objects: { value: "A", label: "..." }
 */
function normalizeOptions(
  rawOptions: unknown[]
): Array<{ id: string; text: string }> {
  if (!rawOptions || !Array.isArray(rawOptions)) return [];

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return rawOptions.map((opt: unknown, index: number) => {
    // Format 1: plain string — AI-generated exercises store options as string arrays
    if (typeof opt === 'string') {
      return {
        id: String(index),
        text: opt,
      };
    }

    // Formats 2 & 3: object with various field names
    const o = opt as Record<string, unknown>;
    const id = (o.id as string) ?? (o.value as string) ?? String(index);
    const text = (o.text as string) ?? (o.label as string) ?? '';

    return { id, text };
  });
}

/**
 * Component to render the appropriate answer input based on question type
 */
function QuestionAnswerInput({
  question,
  answer,
  onAnswer,
}: {
  question: ExerciseQuestionEntity;
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
}) {
  const content = question.content as Record<string, unknown> | null;
  const qType = normalizeQuestionType(question.questionType);

  switch (qType) {
    case 'multiple_choice':
      return (
        <MultipleChoiceInput
          options={normalizeOptions((content?.options as unknown[]) ?? [])}
          selected={answer?.selectedOption}
          onSelect={(id) =>
            onAnswer({ type: 'multiple_choice', selectedOption: id })
          }
        />
      );

    case 'multiple_select':
      return (
        <MultipleSelectInput
          options={normalizeOptions((content?.options as unknown[]) ?? [])}
          selected={answer?.selectedOptions ?? []}
          onSelect={(ids) =>
            onAnswer({ type: 'multiple_select', selectedOptions: ids })
          }
        />
      );

    case 'true_false':
      return (
        <TrueFalseInput
          selected={answer?.selectedValue}
          onSelect={(val) =>
            onAnswer({ type: 'true_false', selectedValue: val })
          }
        />
      );

    case 'fill_blank': {
      const blanks = (content?.blanks as Array<{ id: number }>) ?? [];
      const template = content?.template as string | undefined;
      return (
        <FillBlankInput
          blanks={blanks}
          template={template}
          values={answer?.blanks ?? []}
          onChange={(vals) => onAnswer({ type: 'fill_blank', blanks: vals })}
        />
      );
    }

    case 'essay':
      return (
        <EssayInput
          value={answer?.text ?? ''}
          maxLength={(content?.maxLength as number) ?? 2000}
          onChange={(text) => onAnswer({ type: 'essay', text })}
        />
      );

    default:
      return (
        <div className="text-sm text-gray-500 italic">
          Loại câu hỏi chưa được hỗ trợ ({question.questionType})
        </div>
      );
  }
}

function MultipleChoiceInput({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ id: string; text: string }>;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="space-y-3">
      {options.map((opt, idx) => (
        <Button
          key={`${opt.id}-${idx}`}
          onClick={() => onSelect(opt.id)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left bg-white"
          style={{
            borderColor: selected === opt.id ? '#3B82F6' : '#E2E8F0',
            background: selected === opt.id ? '#EFF6FF' : 'white',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{
              background: selected === opt.id ? '#3B82F6' : '#F1F5F9',
              color: selected === opt.id ? 'white' : '#64748B',
            }}
          >
            {LABELS[idx] ?? idx + 1}
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: selected === opt.id ? '#1E40AF' : '#1E293B' }}
          >
            {opt.text}
          </span>
        </Button>
      ))}
    </div>
  );
}

function MultipleSelectInput({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ id: string; text: string }>;
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((s) => s !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="space-y-3">
      <P className="text-xs text-gray-400 font-medium mb-2">
        (Chọn nhiều đáp án)
      </P>
      {options.map((opt, idx) => {
        const isSelected = selected.includes(opt.id);
        return (
          <Button
            key={`${opt.id}-${idx}`}
            onClick={() => toggle(opt.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left bg-white"
            style={{
              borderColor: isSelected ? '#3B82F6' : '#E2E8F0',
              background: isSelected ? '#EFF6FF' : 'white',
            }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{
                background: isSelected ? '#3B82F6' : '#F1F5F9',
                color: isSelected ? 'white' : '#64748B',
              }}
            >
              {isSelected ? '✓' : (LABELS[idx] ?? idx + 1)}
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: isSelected ? '#1E40AF' : '#1E293B' }}
            >
              {opt.text}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

function TrueFalseInput({
  selected,
  onSelect,
}: {
  selected?: boolean;
  onSelect: (val: boolean) => void;
}) {
  return (
    <div className="flex gap-4">
      {[
        { value: true, label: 'Đúng', emoji: '✓' },
        { value: false, label: 'Sai', emoji: '✗' },
      ].map((opt) => (
        <Button
          key={String(opt.value)}
          onClick={() => onSelect(opt.value)}
          className="flex-1 flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer bg-white"
          style={{
            borderColor: selected === opt.value ? '#3B82F6' : '#E2E8F0',
            background: selected === opt.value ? '#EFF6FF' : 'white',
          }}
        >
          <span className="text-xl">{opt.emoji}</span>
          <span
            className="text-sm font-bold"
            style={{ color: selected === opt.value ? '#1E40AF' : '#64748B' }}
          >
            {opt.label}
          </span>
        </Button>
      ))}
    </div>
  );
}

function FillBlankInput({
  blanks,
  template,
  values,
  onChange,
}: {
  blanks: Array<{ id: number }>;
  template?: string;
  values: Array<{ id: number; value: string }>;
  onChange: (vals: Array<{ id: number; value: string }>) => void;
}) {
  const updateBlank = (blankId: number, value: string) => {
    const existing = values.filter((v) => v.id !== blankId);
    onChange([...existing, { id: blankId, value }]);
  };

  return (
    <div className="space-y-4">
      {template && (
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
          {template}
        </div>
      )}
      {blanks.map((blank) => {
        const currentValue = values.find((v) => v.id === blank.id)?.value ?? '';
        return (
          <div key={blank.id} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-500 w-16 text-right">
              Ô {blank.id}:
            </span>
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => updateBlank(blank.id, e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              placeholder="Nhập đáp án..."
            />
          </div>
        );
      })}
    </div>
  );
}

function EssayInput({
  value,
  maxLength,
  onChange,
}: {
  value: string;
  maxLength: number;
  onChange: (text: string) => void;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={8}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm text-gray-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none bg-white"
        placeholder="Viết câu trả lời của bạn..."
      />
      <div className="flex justify-end mt-2">
        <span className="text-xs text-gray-400">
          {value.length}/{maxLength} ký tự
        </span>
      </div>
    </div>
  );
}
