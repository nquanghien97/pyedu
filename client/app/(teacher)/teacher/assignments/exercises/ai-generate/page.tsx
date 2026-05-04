'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiGenerateService } from '@/services/aiGenerate';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS, DifficultyLevel, QuestionType } from '@/entity/exercise';
import { SubjectEntity } from '@/entity/subject';
import { getSubjects } from '@/services/subject';

// Danh sách khối lớp cố định
const GRADES = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Khối ${i + 1}`,
}));
import { useAiStore } from '@/stores/ai.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, SparklesIcon, FileTextIcon, UploadCloudIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { notification } from '@/components/notification';

// ---------- Schemas ----------
const topicSchema = z.object({
  grade: z.string().optional(),
  subjectId: z.string().optional(),
  topicName: z.string().min(1, 'Chủ đề không được để trống'),
  difficultyLevel: z.string().min(1, 'Chọn mức độ khó'),
  numberOfQuestions: z.coerce.number().min(1, 'Tối thiểu 1 câu').max(50, 'Tối đa 50 câu'),
  questionType: z.string().min(1, 'Chọn loại câu hỏi'),
  additionalInstructions: z.string().optional(),
});
type TopicFormValues = z.infer<typeof topicSchema>;

export default function AIGeneratePage() {
  const router = useRouter();
  const { setAiDraft } = useAiStore();

  const [activeTab, setActiveTab] = useState<'topic' | 'file'>('topic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [allSubjects, setAllSubjects] = useState<SubjectEntity[]>([]);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileGrade, setFileGrade] = useState('');
  const [fileSubjectId, setFileSubjectId] = useState('');
  const [fileInstructions, setFileInstructions] = useState('');

  // Form for topic
  const {
    register: registerTopic,
    handleSubmit: handleSubmitTopic,
    watch: watchTopic,
    formState: { errors: topicErrors },
  } = useForm<TopicFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(topicSchema) as any,
    defaultValues: {
      grade: '',
      subjectId: '',
      topicName: '',
      difficultyLevel: 'medium',
      numberOfQuestions: 10,
      questionType: 'multiple_choice',
      additionalInstructions: '',
    },
  });

  const watchedGradeId = watchTopic('grade');
  const topicSubjects = allSubjects.filter(s => s.grade === Number(watchedGradeId));

  useEffect(() => {
    getSubjects().then(res => setAllSubjects(res.data)).catch(() => { });
  }, []);

  const handleTopicSubmit = async (data: TopicFormValues) => {
    setIsGenerating(true);
    try {
      const gName = GRADES.find(g => g.id === data.grade)?.name;
      const sName = topicSubjects.find(s => s.id === data.subjectId)?.name;

      const res = await aiGenerateService.generateByTopic({
        gradeName: gName,
        subjectName: sName,
        topicName: data.topicName,
        difficultyLevel: data.difficultyLevel as DifficultyLevel,
        numberOfQuestions: data.numberOfQuestions,
        questionType: data.questionType as QuestionType | 'mixed',
        additionalInstructions: data.additionalInstructions,
      });

      if (res.success && res.data) {
        setAiDraft({
          ...res.data,
          grade: data.grade,
          subjectId: data.subjectId,
        });
        router.push('/teacher/assignments/exercises/create');
      }
    } catch (error: any) {
      notification.error(error.message || 'Lỗi khi gọi AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return notification.warning('Vui lòng chọn một file đính kèm');

    setIsGenerating(true);
    try {
      const gName = GRADES.find(g => g.id === fileGrade)?.name;
      const sName = allSubjects.find(s => s.id === fileSubjectId)?.name;

      const res = await aiGenerateService.generateByFile({
        file: selectedFile,
        gradeName: gName,
        subjectName: sName,
        additionalInstructions: fileInstructions,
      });

      if (res.success && res.data) {
        setAiDraft({
          ...res.data,
          grade: fileGrade,
          subjectId: fileSubjectId,
        });
        router.push('/teacher/assignments/exercises/create');
      }
    } catch (error: any) {
      notification.error(error.message || 'Lỗi khi gọi AI phân tích file');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2Icon className="w-16 h-16 animate-spin text-[#3b82f6] mx-auto mb-6" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3b82f6] to-purple-500 bg-clip-text text-transparent">
          AI đang phân tích và khởi tạo...
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
          Quá trình này có thể mất từ 10 - 60 giây tùy thuộc vào độ phức tạp và kích thước dữ liệu tải lên. Vui lòng không đóng trang web.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link href="/teacher/exercises" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit mb-6">
        <ArrowLeftIcon className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-purple-500 flex items-center justify-center shadow-md">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Tạo Bài Tập</h1>
        </div>
        <p className="text-gray-500 text-sm">Bộ công cụ sinh đề tự động bằng trí tuệ nhân tạo Gemini</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 shadow-inner w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('topic')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'topic' ? 'bg-white text-[#3b82f6] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileTextIcon className="w-4 h-4" />
          Sáng tạo Chủ Đề
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'file' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <UploadCloudIcon className="w-4 h-4" />
          Nhân bản Đề Mẫu
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden shadow-[#3b82f6]/5">

        {/* TOPIC TAB */}
        {activeTab === 'topic' && (
          <form onSubmit={handleSubmitTopic(handleTopicSubmit)} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Chủ đề bài tập <span className="text-red-500">*</span></label>
                <Input
                  {...registerTopic('topicName')}
                  placeholder="Vd: Ôn tập phương trình lượng giác..."
                  className="bg-gray-50/50 border-gray-200 focus-visible:ring-[#3b82f6]"
                />
                {topicErrors.topicName && <p className="text-xs text-red-500 mt-1">{topicErrors.topicName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Khối ngữ cảnh</label>
                  <select {...registerTopic('grade')} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-shadow">
                    <option value="">-- Mặc định --</option>
                    {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Môn học</label>
                  <select {...registerTopic('subjectId')} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 transition-shadow">
                    <option value="">-- Mặc định --</option>
                    {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Mức độ <span className="text-red-500">*</span></label>
                  <select {...registerTopic('difficultyLevel')} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Loại câu <span className="text-red-500">*</span></label>
                  <select {...registerTopic('questionType')} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
                    <option value="mixed">Hỗn hợp</option>
                    {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Số lượng (1-50) <span className="text-red-500">*</span></label>
                  <Input type="number" {...registerTopic('numberOfQuestions')} className="bg-gray-50/50" />
                  {topicErrors.numberOfQuestions && <p className="text-xs text-red-500 mt-1">{topicErrors.numberOfQuestions.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Yêu cầu thêm cho AI</label>
                <textarea
                  {...registerTopic('additionalInstructions')}
                  placeholder="Vd: Đảm bảo có cả câu hỏi lý thuyết và thực hành, cho đáp án gây nhiễu dễ sai lầm."
                  className="w-full flex min-h-[100px] rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-600 hover:to-[#3b82f6] shadow-md shadow-blue-500/20 px-8 py-2 h-11 text-base">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Dựng Đề Ngay
              </Button>
            </div>
          </form>
        )}

        {/* FILE TAB */}
        {activeTab === 'file' && (
          <form onSubmit={handleFileSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-6">
              <p className="text-sm text-purple-800 flex gap-2"><SparklesIcon className="w-4 h-4" /> AI sẽ "đọc" format thiết kế, logic, độ khó và phong cách của đề thi bạn đính kèm để sinh ra 1 bộ đề hoàn toàn mới tương đương.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">File tài liệu đính kèm (PDF, DOCX, Ảnh) <span className="text-red-500">*</span></label>
                <div className="flex border-2 border-dashed border-gray-300 rounded-xl px-6 py-10 items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <div className="text-center">
                    <UploadCloudIcon className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    {selectedFile ? (
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">Kéo thả hoặc nhấp để tải file</p>
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ PDF, Ảnh. Tối đa 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Khối ngữ cảnh (tùy chọn)</label>
                  <select value={fileGrade} onChange={e => setFileGrade(e.target.value)} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">-- Để AI phán đoán --</option>
                    {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Môn học</label>
                  <select value={fileSubjectId} onChange={e => setFileSubjectId(e.target.value)} disabled={!fileGrade} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
                    <option value="">-- Để AI phán đoán --</option>
                    {allSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Chỉ thị tùy chỉnh cho AI (tùy chọn)</label>
                <textarea
                  value={fileInstructions}
                  onChange={e => setFileInstructions(e.target.value)}
                  placeholder="Vd: Chỉ tạo 10 câu trắc nghiệm lấy từ cấu trúc đề thi này, đổi số đi..."
                  className="w-full flex min-h-[100px] rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" disabled={!selectedFile} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-500 shadow-md shadow-purple-500/20 px-8 py-2 h-11 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Nhân Bản Ngay
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
