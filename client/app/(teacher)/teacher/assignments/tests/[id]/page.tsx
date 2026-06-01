'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { H1, H2, P } from '@/components/ui/typography';
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon, CalendarIcon, FileTextIcon, ListIcon } from 'lucide-react';
import { getTestById } from '@/services/test';
import { TestEntity } from '@/entity/test';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/ui/math-text';

export default function TestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [test, setTest] = useState<TestEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await getTestById(id);
        if (res.data) {
          setTest(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết bài kiểm tra', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <P className="text-slate-500 mb-4">Không tìm thấy bài kiểm tra</P>
        <Button onClick={() => router.push('/teacher/assignments/tests')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/teacher/assignments/tests')}
              className="rounded-xl bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeftIcon size={18} />
            </Button>
            <H1 className="text-2xl text-slate-800">{test.exercise?.title}</H1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/teacher/assignments/tests/${test.id}/edit`)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Chỉnh sửa bài kiểm tra
            </Button>
            {test.assignmentId && (
              <Button
                onClick={() => router.push(`/teacher/assignments/${test.assignmentId}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Xem kết quả làm bài
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <H2 className="text-lg mb-4 flex items-center gap-2">
                <ListIcon size={20} className="text-blue-600" />
                Danh sách câu hỏi ({test.exercise?.questions?.length || 0})
              </H2>
              
              <div className="space-y-4">
                {test.exercise?.questions?.map((q, idx) => (
                  <div key={q.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-700">Câu {idx + 1}</span>
                      <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">
                        {q.points} điểm
                      </Badge>
                    </div>
                    <div className="text-slate-700">
                      <MathText text={q.questionText || ''} />
                    </div>
                  </div>
                ))}
                
                {(!test.exercise?.questions || test.exercise.questions.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    Chưa có câu hỏi nào trong bài kiểm tra này.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <H2 className="text-lg mb-4 flex items-center gap-2">
                <FileTextIcon size={20} className="text-blue-600" />
                Cấu hình bài thi
              </H2>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center gap-2">
                    <ClockIcon size={16} /> Thời gian làm bài
                  </span>
                  <span className="font-semibold text-slate-800">{test.timeLimitMinutes} phút</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center gap-2">
                    <CheckCircleIcon size={16} /> Điểm qua môn
                  </span>
                  <span className="font-semibold text-slate-800">{test.passingScore}%</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center gap-2">
                    <CalendarIcon size={16} /> Bắt đầu
                  </span>
                  <span className="font-medium text-slate-800 text-sm">
                    {test.startTime ? new Date(test.startTime).toLocaleString('vi-VN') : 'Không giới hạn'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center gap-2">
                    <CalendarIcon size={16} /> Kết thúc
                  </span>
                  <span className="font-medium text-slate-800 text-sm">
                    {test.endTime ? new Date(test.endTime).toLocaleString('vi-VN') : 'Không giới hạn'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Số lần làm tối đa</span>
                  <span className="font-semibold text-slate-800">{test.maxAttempts} lần</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
