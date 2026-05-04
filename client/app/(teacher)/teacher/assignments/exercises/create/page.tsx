'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubjectEntity, TopicEntity } from '@/entity/subject';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS, QuestionType } from '@/entity/exercise';
import { getSubjects, getTopicsBySubject } from '@/services/subject';
import { createExercise } from '@/services/exercise';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, TrashIcon, ArrowLeftIcon, GripVerticalIcon } from 'lucide-react';

// Danh sách khối lớp cố định
const GRADES = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Khối ${i + 1}`,
}));
import { useAiStore } from '@/stores/ai.store';
import { MathText } from '@/components/ui/math-text';
import { notification } from '@/components/notification';

// ---------- Zod Schemas ----------

const DIFFICULTY_VALUES = ['easy', 'medium', 'hard', 'expert'] as const;
const QUESTION_TYPE_VALUES = ['multiple_choice', 'multiple_select', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'] as const;

const questionSchema = z.object({
  questionText: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  questionType: z.string().min(1),
  points: z.coerce.number().min(0, 'Điểm phải >= 0'),
  content: z.any().default({}),
  explanation: z.string().default(''),
  hints: z.array(z.string()).default([]),
  aiGradingEnabled: z.boolean().default(false),
});

const exerciseFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tiêu đề tối đa 255 ký tự'),
  grade: z.string().optional(),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  difficultyLevel: z.string().optional(),
  totalPoints: z.coerce.number().min(0).optional(),
  timeLimitMinutes: z.coerce.number().min(0).int().optional(),
  questions: z.array(questionSchema).default([]),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

// ---------- Default content per question type ----------

function getContentForType(type: QuestionType): Record<string, unknown> {
  switch (type) {
    case 'multiple_choice': return { options: ['', '', '', ''], correctAnswer: 0 };
    case 'multiple_select': return { options: ['', '', '', ''], correctAnswers: [] };
    case 'true_false': return { correctAnswer: true };
    case 'fill_blank': return { blanks: [''] };
    case 'essay': return { maxWords: 500 };
    case 'matching': return { pairs: [{ left: '', right: '' }] };
    case 'ordering': return { items: [''] };
    default: return {};
  }
}

// ---------- Main Page ----------

export default function CreateExercisePage() {
  const router = useRouter();
  const [allSubjects, setAllSubjects] = useState<SubjectEntity[]>([]);
  const [topics, setTopics] = useState<TopicEntity[]>([]);

  // Zustand Store
  const { aiDraft, clearAiDraft } = useAiStore();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(exerciseFormSchema) as any,
    defaultValues: {
      title: '',
      grade: '',
      subjectId: '',
      topicId: '',
      difficultyLevel: '',
      totalPoints: 0,
      timeLimitMinutes: 0,
      questions: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedGradeId = watch('grade');
  const watchedSubjectId = watch('subjectId');

  const subjects = allSubjects;

  useEffect(() => {
    getSubjects().then(res => setAllSubjects(res.data)).catch(() => { });

    // Check Zustand Store for AI draft
    if (aiDraft) {
      try {
        if (aiDraft.title) setValue('title', aiDraft.title);
        if (aiDraft.difficultyLevel) setValue('difficultyLevel', aiDraft.difficultyLevel);
        if (aiDraft.questions && Array.isArray(aiDraft.questions)) {
          // Normalize AI generated content to strict frontend expectations
          const sanitizedQuestions = aiDraft.questions.map((q: any) => {
            if (
              (q.questionType === 'multiple_choice' || q.questionType === 'multiple_select') &&
              q.content &&
              Array.isArray(q.content.options)
            ) {
              q.content.options = q.content.options.map((opt: any) => {
                if (typeof opt === 'string') return opt;
                if (typeof opt === 'object' && opt !== null) {
                  return opt.text || opt.content || opt.value || String(opt);
                }
                return String(opt);
              });
            }
            return q;
          });
          setValue('questions', sanitizedQuestions);
        }
        // Clear draft after populating
        setTimeout(() => clearAiDraft(), 100);
      } catch (e) {
        console.error('Failed to parse AI draft from Store', e);
      }
    }
  }, [setValue, aiDraft, clearAiDraft]);

  useEffect(() => {
    setValue('subjectId', '');
    setValue('topicId', '');
  }, [watchedGradeId, setValue]);

  useEffect(() => {
    if (watchedSubjectId) {
      getTopicsBySubject(watchedSubjectId).then(res => setTopics(res.data)).catch(() => { });
    } else {
      setTopics([]);
    }
    setValue('topicId', '');
  }, [watchedSubjectId, setValue]);

  const addQuestion = () => {
    append({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      content: { options: ['', '', '', ''], correctAnswer: 0 },
      explanation: '',
      hints: [],
      aiGradingEnabled: false,
    });
  };

  const handleTypeChange = (index: number, type: QuestionType) => {
    const currentQuestion = fields[index];
    update(index, {
      ...currentQuestion,
      questionType: type,
      content: getContentForType(type),
    });
  };

  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      await createExercise({
        title: data.title,
        grade: data.grade ? Number(data.grade) : undefined,
        subjectId: data.subjectId || undefined,
        topicId: data.topicId || undefined,
        difficultyLevel: data.difficultyLevel || undefined,
        totalPoints: data.totalPoints || undefined,
        timeLimitMinutes: data.timeLimitMinutes || undefined,
        questions: data.questions.map((q, index) => {
          // Trích xuất aiGradingEnabled từ content nếu có (do QuestionContentEditor lưu vào content)
          const contentObj = (q.content as Record<string, unknown>) || {};
          const isAiEnabled = (contentObj.aiGradingEnabled as boolean) || false;

          return {
            questionText: q.questionText,
            questionType: q.questionType,
            orderIndex: index + 1,
            points: q.points,
            content: q.content,
            explanation: q.explanation || undefined,
            hints: q.hints.length > 0 ? q.hints : undefined,
            aiGradingEnabled: isAiEnabled || q.aiGradingEnabled,
          };
        }),
      });
      router.push('/teacher/assignments/exercises');
    } catch (error) {
      console.error('Failed to create exercise:', error);
      notification.error('Tạo bài tập thất bại');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeftIcon className="w-4 h-4" />
        Quay lại
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo bài tập mới</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tiêu đề *</label>
              <Input
                {...register('title')}
                placeholder="Nhập tiêu đề bài tập..."
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Khối lớp (Tùy chọn)</label>
                <select
                  {...register('grade')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">-- Chọn Khối lớp --</option>
                  {GRADES.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Môn học (Tùy chọn)</label>
                <select
                  {...register('subjectId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                  disabled={false}
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Chủ đề (Tùy chọn)</label>
                <select
                  {...register('topicId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                  disabled={!watchedSubjectId}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Độ khó</label>
                <select {...register('difficultyLevel')} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Chọn mức độ</option>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tổng điểm</label>
                <Input type="number" {...register('totalPoints')} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Thời gian (phút)</label>
                <Input type="number" {...register('timeLimitMinutes')} placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Câu hỏi ({fields.length})</h2>
            <Button type="button" onClick={addQuestion} variant="outline" className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Thêm câu hỏi
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
              <p>Chưa có câu hỏi. Nhấn &quot;Thêm câu hỏi&quot; để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <QuestionEditor
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  questionType={watch(`questions.${index}.questionType`) as QuestionType}
                  questionContent={watch(`questions.${index}.content`)}
                  onRemove={() => remove(index)}
                  onTypeChange={(type) => handleTypeChange(index, type)}
                  onContentChange={(content) => setValue(`questions.${index}.content`, content)}
                />
              ))}
            </div>
          )}

          {errors.questions?.root && (
            <p className="text-xs text-red-500 mt-2">{errors.questions.root.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mb-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo bài tập'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ---------- Question Editor ----------

function QuestionEditor({
  index,
  control,
  register,
  errors,
  questionType,
  questionContent,
  onRemove,
  onTypeChange,
  onContentChange,
}: {
  index: number;
  control: ReturnType<typeof useForm<ExerciseFormValues>>['control'];
  register: ReturnType<typeof useForm<ExerciseFormValues>>['register'];
  errors: ReturnType<typeof useForm<ExerciseFormValues>>['formState']['errors'];
  questionType: QuestionType;
  questionContent: Record<string, unknown>;
  onRemove: () => void;
  onTypeChange: (type: QuestionType) => void;
  onContentChange: (content: Record<string, unknown>) => void;
}) {
  const questionErrors = errors.questions?.[index];

  return (
    <div className="border rounded-lg p-4 bg-gray-50/50">
      <div className="flex items-center gap-3 mb-3">
        <GripVerticalIcon className="w-4 h-4 text-gray-300 cursor-grab" />
        <span className="text-sm font-semibold text-gray-500">Câu {index + 1}</span>

        <select
          className="text-sm border rounded px-2 py-1"
          value={questionType}
          onChange={e => onTypeChange(e.target.value as QuestionType)}
        >
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 ml-auto">
          <Input
            type="number"
            {...register(`questions.${index}.points`)}
            className="w-20 h-8 text-sm"
            min={0}
          />
          <span className="text-xs text-gray-400">điểm</span>
        </div>

        <Button type="button" size="sm" variant="ghost" onClick={onRemove} className="text-red-400 hover:text-red-600 ml-2">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-3">
        <Controller
          control={control}
          name={`questions.${index}.questionText`}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px] resize-y"
                rows={2}
              />
              {field.value && field.value.includes('$') && (
                <div className="mt-1.5 p-2 bg-blue-50/70 rounded-md border border-blue-100">
                  <span className="text-[10px] text-blue-400 font-medium block mb-0.5">XEM TRƯỚC</span>
                  <MathText text={field.value} as="div" className="text-sm text-gray-800" />
                </div>
              )}
            </>
          )}
        />
        {questionErrors?.questionText && (
          <p className="text-xs text-red-500 mt-0.5">{questionErrors.questionText.message}</p>
        )}
      </div>

      {/* Question-type specific content */}
      <QuestionContentEditor
        type={questionType}
        content={questionContent}
        onChange={onContentChange}
      />

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-500 block mb-1">Giải thích (tùy chọn)</label>
        <Controller
          control={control}
          name={`questions.${index}.explanation`}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                placeholder="Giải thích đáp án..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[40px] resize-y"
                rows={1}
              />
              {field.value && field.value.includes('$') && (
                <div className="mt-1.5 p-2 bg-green-50/70 rounded-md border border-green-100">
                  <span className="text-[10px] text-green-400 font-medium block mb-0.5">XEM TRƯỚC</span>
                  <MathText text={field.value} as="div" className="text-sm text-green-800" />
                </div>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}

// ---------- Question Content Editor ----------

function QuestionContentEditor({
  type,
  content,
  onChange,
}: {
  type: QuestionType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  switch (type) {
    case 'multiple_choice':
    case 'multiple_select': {
      const options = (content.options as string[]) || ['', '', '', ''];
      const correctAnswer = content.correctAnswer as number;
      const correctAnswers = (content.correctAnswers as number[]) || [];

      return (
        <div className="space-y-2">
          {options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              {type === 'multiple_choice' ? (
                <input
                  type="radio"
                  name={`mc-correct-${type}`}
                  checked={correctAnswer === i}
                  onChange={() => onChange({ ...content, correctAnswer: i })}
                  className="w-4 h-4"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(i)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...correctAnswers, i]
                      : correctAnswers.filter((x: number) => x !== i);
                    onChange({ ...content, correctAnswers: next });
                  }}
                  className="w-4 h-4"
                />
              )}
              <Input
                value={opt}
                onChange={e => {
                  const next = [...options];
                  next[i] = e.target.value;
                  onChange({ ...content, options: next });
                }}
                placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                className="flex-1 h-8 text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => {
                    const next = options.filter((_: string, j: number) => j !== i);
                    onChange({ ...content, options: next });
                  }}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ ...content, options: [...options, ''] })}
            className="text-xs"
          >
            + Thêm đáp án
          </Button>
        </div>
      );
    }
    case 'true_false': {
      const correctAnswer = content.correctAnswer as boolean;
      return (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={correctAnswer === true} onChange={() => onChange({ correctAnswer: true })} className="w-4 h-4" />
            Đúng
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={correctAnswer === false} onChange={() => onChange({ correctAnswer: false })} className="w-4 h-4" />
            Sai
          </label>
        </div>
      );
    }
    case 'fill_blank': {
      const blanks = (content.blanks as string[]) || [''];
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Nhập đáp án cho các chỗ trống (dùng ___ trong nội dung câu hỏi)</p>
          {blanks.map((blank: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{i + 1}.</span>
              <Input
                value={blank}
                onChange={e => {
                  const next = [...blanks];
                  next[i] = e.target.value;
                  onChange({ ...content, blanks: next });
                }}
                placeholder="Đáp án"
                className="flex-1 h-8 text-sm"
              />
            </div>
          ))}
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...content, blanks: [...blanks, ''] })} className="text-xs">
            + Thêm chỗ trống
          </Button>
        </div>
      );
    }
    case 'essay': {
      const maxWords = (content.maxWords as number) || 500;
      const sampleAnswer = (content.sampleAnswer as string) || '';
      const aiGradingEnabled = (content.aiGradingEnabled as boolean) ?? false;

      return (
        <div className="space-y-4 bg-gray-50 p-3 rounded border">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Giới hạn từ:</label>
              <Input
                type="number"
                value={maxWords}
                onChange={(e) => onChange({ ...content, maxWords: Number(e.target.value) })}
                className="w-20 h-8 text-sm bg-white"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={aiGradingEnabled}
                onChange={(e) => onChange({ ...content, aiGradingEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-600">Bật chấm điểm AI</span>
            </label>
          </div>
          {aiGradingEnabled && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Đáp án mẫu (Dùng để AI chấm điểm)</label>
              <textarea
                value={sampleAnswer}
                onChange={(e) => onChange({ ...content, sampleAnswer: e.target.value })}
                placeholder="Nhập đáp án mẫu để AI so sánh..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px] bg-white resize-y"
                rows={2}
              />
            </div>
          )}
        </div>
      );
    }
    default:
      return <p className="text-xs text-gray-400">Cấu hình nội dung cho loại câu hỏi này...</p>;
  }
}
