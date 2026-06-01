'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestById } from "@/services/test";
import { submitExercise } from "@/services/submission";
import { Button } from "@/components/ui/button";
import { H2, P } from "@/components/ui/typography";
import { Clock } from "lucide-react";
import { notification } from "@/components/notification";

import { TestEntity } from "@/entity/test";
import { SubmitAnswerInput } from "@/entity/submission";
import { ExerciseQuestionEntity } from "@/entity/exercise";

export default function TestTakerPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [test, setTest] = useState<TestEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [answers, setAnswers] = useState<SubmitAnswerInput[]>([]);

  useEffect(() => {
    getTestById(id as string).then(res => {
      if (res.data) {
        setTest(res.data);
        // Bắt đầu tính giờ. Lẽ ra lấy từ server startedAt.
        // Ở đây demo tính bằng timeLimitMinutes
        setTimeLeft(res.data.timeLimitMinutes * 60);
      }
      setLoading(false);
    });
  }, [id]);
  
  
  const submitTest = useCallback(async () => {
    if (!test || !test.assignmentId) {
      alert("Không tìm thấy thông tin Assignment của đề thi này!");
      return;
    }
    try {
      await submitExercise(test.assignmentId, {
        answers,
        // timeSpentSeconds: test.timeLimitMinutes * 60 - (timeLeft || 0)
      } as unknown as { answers: SubmitAnswerInput[] });
      router.push(`/student/assignments/${test.assignmentId}/result`);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi nộp bài");
    }
  }, [answers, router, test]);
  useEffect(() => {
    const handleAutoSubmit = async () => {
      notification.info("Hết giờ! Bài của bạn sẽ được tự động nộp.");
      await submitTest();
    };

    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && test) {
        handleAutoSubmit();
      }
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [submitTest, test, timeLeft]);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8">Đang tải đề thi...</div>;
  if (!test) return <div className="p-8">Không tìm thấy đề thi</div>;

  const isWarningTime = timeLeft !== null && timeLeft < 300; // Dưới 5 phút

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header / Timer */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div>
          <H2>{test.exercise?.title}</H2>
          <P className="text-sm text-slate-500">{test.subject?.name}</P>
        </div>
        
        <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-4 py-2 rounded-lg ${isWarningTime ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
          <Clock size={24} />
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
        
        <Button onClick={submitTest} className="bg-blue-600 hover:bg-blue-700">
          Nộp Bài Bây Giờ
        </Button>
      </div>

      {/* Questions */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {test.exercise?.questions?.map((q: ExerciseQuestionEntity, i: number) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <div className="flex gap-4 mb-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <P className="font-medium text-slate-800 text-lg">{q.questionText}</P>
                <div className="mt-4">
                  {/* Mock content editor, we should use proper components here */}
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500" 
                    rows={4} 
                    placeholder="Nhập câu trả lời của bạn..."
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      const idx = newAnswers.findIndex(a => a.questionId === q.id);
                      if (idx >= 0) newAnswers[idx].answerData = { type: q.questionType || 'text', text: e.target.value };
                      else newAnswers.push({ questionId: q.id, answerData: { type: q.questionType || 'text', text: e.target.value } });
                      setAnswers(newAnswers);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
