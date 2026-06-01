'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubjectEntity, TopicEntity } from '@/entity/subject';
import { DIFFICULTY_LABELS, QuestionType } from '@/entity/exercise';
import { getSubjects, getTopicsBySubject } from '@/services/subject';
import { createExercise } from '@/services/exercise';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { QuestionEditor, getContentForType } from '@/components/question-editor';

// Danh sách khối lớp cố định
const GRADES = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Khối ${i + 1}`,
}));
import { useAiStore } from '@/stores/ai.store';
import { notification } from '@/components/notification';
import { H1, H2, P } from "@/components/ui/typography";

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
        if (typeof aiDraft.title === 'string') setValue('title', aiDraft.title);
        if (typeof aiDraft.difficultyLevel === 'string') setValue('difficultyLevel', aiDraft.difficultyLevel);
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
    <div className="max-w-6xl p-6 mx-auto">
      <Button onClick={() => router.back()}>
        <ArrowLeftIcon className="w-4 h-4" />
        Quay lại
      </Button>

      <H1 className="mb-6">Tạo bài tập mới</H1>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <H2 className="mb-4">Thông tin cơ bản</H2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tiêu đề *</label>
              <Input
                {...register('title')}
                placeholder="Nhập tiêu đề bài tập..."
              />
              {errors.title && <P className="text-xs text-red-500 mt-1">{errors.title.message}</P>}
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
            <H2>Câu hỏi ({fields.length})</H2>
            <Button type="button" onClick={addQuestion} variant="outline" className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Thêm câu hỏi
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
              <P>Chưa có câu hỏi. Nhấn &quot;Thêm câu hỏi&quot; để bắt đầu.</P>
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
            <P className="text-xs text-red-500 mt-2">{errors.questions.root.message}</P>
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

