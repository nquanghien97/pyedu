'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { H1, H2, P } from "@/components/ui/typography";
import { getTestById, updateTest } from "@/services/test";
import { getSubjects } from "@/services/subject";
import { classService } from "@/services/class";
import { getTeacherStudents, DropdownClass, DropdownStudent } from "@/services/meta";
import { QuestionEditor, getContentForType } from '@/components/question-editor';
import { QuestionType } from '@/entity/exercise';
import { notification } from "@/components/notification";
import {
  ArrowLeftIcon, ArrowRightIcon, PlusIcon, CheckCircle2,
  Settings2, FileText, Users, User as UserIcon, Globe, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

// ---------- Zod Schema ----------

const questionSchema = z.object({
  questionText: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  questionType: z.string().min(1),
  points: z.coerce.number().min(0),
  content: z.any().default({}),
  explanation: z.string().default(''),
  hints: z.array(z.string()).default([]),
  aiGradingEnabled: z.boolean().default(false),
});

const testFormSchema = z.object({
  title: z.string().min(1, 'Tên bài kiểm tra không được để trống'),
  subjectId: z.string().optional(),
  testType: z.string().min(1),
  timeLimitMinutes: z.coerce.number().min(1, 'Thời gian phải >= 1 phút'),
  passingScore: z.coerce.number().min(0).max(100),
  maxAttempts: z.coerce.number().min(1).default(1),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResult: z.string().default('immediately'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  questions: z.array(questionSchema).default([]),
  assignedToType: z.string().default('all'),
  assignedToId: z.string().default('all'),
});

type TestFormValues = z.infer<typeof testFormSchema>;

// ---------- Steps ----------

const STEPS = [
  { label: 'Cấu hình', icon: Settings2 },
  { label: 'Câu hỏi', icon: FileText },
  { label: 'Giao bài', icon: Users },
];

export default function EditTestPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<DropdownClass[]>([]);
  const [students, setStudents] = useState<DropdownStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(testFormSchema) as any,
    defaultValues: {
      title: '',
      subjectId: '',
      testType: 'chapter_test',
      timeLimitMinutes: 45,
      passingScore: 50,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResult: 'immediately',
      startTime: '',
      endTime: '',
      questions: [],
      assignedToType: 'all',
      assignedToId: 'all',
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedAssignType = watch('assignedToType');

  useEffect(() => {
    Promise.all([
      getSubjects(),
      classService.getClasses(),
      getTeacherStudents(),
      getTestById(id),
    ]).then(([subRes, clsRes, stdRes, testRes]) => {
      if (subRes.data) setSubjects(subRes.data);
      setClasses(clsRes.data || []);
      setStudents(stdRes);

      if (testRes.data) {
        const test = testRes.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultQuestions = test.exercise?.questions?.map((q: any) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          content: q.content || getContentForType(q.questionType as QuestionType),
          explanation: q.explanation || '',
          hints: q.hints || [],
          aiGradingEnabled: q.aiGradingEnabled || false,
        })) || [];

        // Format date to local datetime-local string
        const formatDateTime = (isoDate?: string | Date | null) => {
          if (!isoDate) return '';
          return format(new Date(isoDate), "yyyy-MM-dd'T'HH:mm");
        };

        reset({
          title: test.exercise?.title || '',
          subjectId: test.subjectId || '',
          testType: test.testType || 'chapter_test',
          timeLimitMinutes: test.timeLimitMinutes || 45,
          passingScore: test.passingScore || 50,
          maxAttempts: test.maxAttempts || 1,
          shuffleQuestions: test.shuffleQuestions || false,
          shuffleOptions: test.shuffleOptions || false,
          showResult: test.showResult || 'immediately',
          startTime: formatDateTime(test.startTime),
          endTime: formatDateTime(test.endTime),
          questions: defaultQuestions,
          assignedToType: 'all', // We don't have this in test entity directly returned, will default to all
          assignedToId: 'all',
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      notification.error("Lỗi khi tải dữ liệu bài kiểm tra");
      router.push("/teacher/assignments/tests");
    });
  }, [id, reset, router]);

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
    const current = fields[index];
    update(index, {
      ...current,
      questionType: type,
      content: getContentForType(type),
    });
  };

  const onSubmit = async (data: TestFormValues) => {
    if (data.questions.length === 0) {
      notification.warning('Bạn cần thêm ít nhất 1 câu hỏi');
      setStep(1);
      return;
    }

    try {
      const res = await updateTest(id, {
        title: data.title,
        subjectId: data.subjectId || undefined,
        testType: data.testType,
        timeLimitMinutes: data.timeLimitMinutes,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
        showResult: data.showResult,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        assignedToType: data.assignedToType,
        assignedToId: data.assignedToType === 'all' ? 'all' : data.assignedToId,
        questions: data.questions.map((q, i) => {
          const contentObj = (q.content as Record<string, unknown>) || {};
          const isAiEnabled = (contentObj.aiGradingEnabled as boolean) || false;
          return {
            questionText: q.questionText,
            questionType: q.questionType,
            orderIndex: i + 1,
            points: q.points,
            content: q.content,
            explanation: q.explanation || undefined,
            hints: q.hints.length > 0 ? q.hints : undefined,
            aiGradingEnabled: isAiEnabled || q.aiGradingEnabled,
          };
        }),
      });
      if (res.data || res.message) {
        notification.success('Đã cập nhật bài kiểm tra thành công!');
        router.push(`/teacher/assignments/tests/${id}`);
      }
    } catch (error) {
      console.error(error);
      notification.error("Lỗi khi cập nhật bài kiểm tra");
    }
  };

  const nextStep = () => {
    if (step === 0) {
      const title = watch('title');
      if (!title) {
        notification.warning('Vui lòng nhập tên bài kiểm tra');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}
            className="rounded-xl bg-white border-slate-200 text-slate-600 hover:bg-slate-100">
            <ArrowLeftIcon size={18} />
          </Button>
          <H1 className="text-2xl">Chỉnh sửa Bài Kiểm Tra</H1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-amber-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Cảnh báo quan trọng!</p>
            <p>Nếu bài kiểm tra này đã có học sinh làm, việc lưu chỉnh sửa sẽ <strong>xóa toàn bộ lịch sử và kết quả bài làm cũ</strong> của học sinh. Học sinh sẽ phải làm lại từ đầu. Vui lòng cân nhắc kỹ trước khi Lưu.</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isDone = step > i;
            return (
              <div key={i} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all w-full justify-center
                    ${isActive ? 'bg-blue-600 text-white shadow-md' : isDone ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-400'}`}
                >
                  {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Step 1: Config */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <H2 className="flex items-center gap-2"><Settings2 size={20} className="text-blue-600" /> Cấu hình bài kiểm tra</H2>

              <div>
                <label className="block text-sm font-medium mb-2">Tên bài kiểm tra *</label>
                <Input {...register('title')} placeholder="VD: Kiểm tra giữa kỳ I" />
                {errors.title && <P className="text-xs text-red-500 mt-1">{errors.title.message}</P>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Môn học</label>
                  <Select value={watch('subjectId')} onValueChange={v => setValue('subjectId', v)}>
                    <SelectTrigger><SelectValue placeholder="Chọn môn học" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Loại bài</label>
                  <Select value={watch('testType')} onValueChange={v => setValue('testType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topic_test">Kiểm tra 15 phút</SelectItem>
                      <SelectItem value="chapter_test">Kiểm tra 1 tiết</SelectItem>
                      <SelectItem value="final_test">Kiểm tra học kỳ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Thời gian (phút) *</label>
                  <Input type="number" {...register('timeLimitMinutes')} min={1} />
                  {errors.timeLimitMinutes && <P className="text-xs text-red-500 mt-1">{errors.timeLimitMinutes.message}</P>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Điểm đạt (%)</label>
                  <Input type="number" {...register('passingScore')} min={0} max={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số lần làm lại</label>
                  <Input type="number" {...register('maxAttempts')} min={1} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Thời gian bắt đầu</label>
                  <Input type="datetime-local" {...register('startTime')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thời gian kết thúc</label>
                  <Input type="datetime-local" {...register('endTime')} />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register('shuffleQuestions')} className="w-4 h-4 rounded border-slate-300" />
                  Trộn câu hỏi
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register('shuffleOptions')} className="w-4 h-4 rounded border-slate-300" />
                  Trộn đáp án
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <H2 className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Câu hỏi ({fields.length})
                </H2>
                <Button type="button" onClick={addQuestion} variant="outline" className="gap-2">
                  <PlusIcon className="w-4 h-4" /> Thêm câu hỏi
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                  <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                  <P className="text-sm">Chưa có câu hỏi. Nhấn &quot;Thêm câu hỏi&quot; để bắt đầu.</P>
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
            </div>
          )}

          {/* Step 3: Assign */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <H2 className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Giao bài kiểm tra
              </H2>

              <P className="text-sm text-slate-500">Chọn đối tượng nhận bài kiểm tra này.</P>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'all', label: 'Tất cả học sinh', desc: 'Giao cho toàn trường', icon: Globe },
                  { value: 'class', label: 'Theo lớp học', desc: 'Giao cho 1 lớp cụ thể', icon: Users },
                  { value: 'student', label: 'Cá nhân', desc: 'Giao cho 1 học sinh', icon: UserIcon },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSelected = watchedAssignType === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setValue('assignedToType', opt.value);
                        setValue('assignedToId', opt.value === 'all' ? 'all' : '');
                      }}
                      className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center text-center gap-2 transition-all
                        ${isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon size={22} />
                      </div>
                      <P className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{opt.label}</P>
                      <P className="text-xs text-slate-500">{opt.desc}</P>
                    </div>
                  );
                })}
              </div>

              {watchedAssignType === 'class' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn lớp học</label>
                  <Select value={watch('assignedToId')} onValueChange={v => setValue('assignedToId', v)}>
                    <SelectTrigger><SelectValue placeholder="-- Chọn lớp --" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {watchedAssignType === 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn học sinh</label>
                  <Select value={watch('assignedToId')} onValueChange={v => setValue('assignedToId', v)}>
                    <SelectTrigger><SelectValue placeholder="-- Chọn học sinh --" /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={step === 0 ? () => router.back() : prevStep}>
              <ArrowLeftIcon size={16} className="mr-1" />
              {step === 0 ? 'Hủy' : 'Quay lại'}
            </Button>

            {step < 2 ? (
              <Button type="button" onClick={nextStep}>
                Tiếp tục <ArrowRightIcon size={16} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
