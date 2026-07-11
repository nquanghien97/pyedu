'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, MessageSquare, Save, Loader2
} from 'lucide-react';
import { getSubmissionById, updateSubmissionGrade } from '@/services/submission';
import { notification } from '@/components/notification';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, H3, P } from "@/components/ui/typography";
import { SubmissionAttachments } from '@/components/shared/submission-attachments';

function normalizeOptions(
  rawOptions: unknown[]
): Array<{ id: string; text: string }> {
  if (!rawOptions || !Array.isArray(rawOptions)) return [];

  return rawOptions.map((opt: unknown, index: number) => {
    if (typeof opt === 'string') {
      return { id: String(index), text: opt };
    }
    const o = opt as Record<string, unknown>;
    const id = (o.id as string) ?? (o.value as string) ?? String(index);
    const text = (o.text as string) ?? (o.label as string) ?? '';
    return { id, text };
  });
}

function renderStudentAnswer(ans: any) {
  if (!ans.answerData) return '—';
  const type = ans.question?.questionType?.replace(/-/g, '_');
  const content = ans.question?.content as Record<string, unknown> | null;
  const options = normalizeOptions((content?.options as unknown[]) ?? []);

  try {
    switch (type) {
      case 'multiple_choice': {
        const selectedId = ans.answerData.selectedOption;
        const opt = options.find(o => o.id === selectedId);
        return opt ? opt.text : `[ID: ${selectedId}]`;
      }
      case 'multiple_select': {
        const selectedIds = ans.answerData.selectedOptions || [];
        const texts = selectedIds.map((id: string) => {
          const opt = options.find(o => o.id === id);
          return opt ? opt.text : `[ID: ${id}]`;
        });
        return texts.length > 0 ? texts.join('; ') : '—';
      }
      case 'true_false':
        if (ans.answerData.selectedValue === true) return 'Đúng';
        if (ans.answerData.selectedValue === false) return 'Sai';
        return '—';
      case 'fill_blank': {
        const blanks = ans.answerData.blanks || [];
        if (blanks.length === 0) return '—';
        return blanks.map((b: any) => `Ô ${b.id}: ${b.value}`).join(', ');
      }
      case 'essay':
        return ans.answerData.text || '—';
      default:
        return JSON.stringify(ans.answerData.value || ans.answerData);
    }
  } catch (e) {
    return JSON.stringify(ans.answerData);
  }
}

export default function TeacherSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  // State for manual grading edits
  const [gradeEdits, setGradeEdits] = useState<Record<string, { pointsEarned: number | null, feedback: string }>>({});
  const [fileScore, setFileScore] = useState<number | null>(null);
  const [fileFeedback, setFileFeedback] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const submission = await getSubmissionById(submissionId);
      setData(submission);

      // Initialize grade edits
      const initialEdits: Record<string, { pointsEarned: number | null, feedback: string }> = {};
      submission.answers.forEach((ans: any) => {
        initialEdits[ans.id] = {
          pointsEarned: ans.pointsEarned,
          feedback: ans.feedback || ''
        };
      });
      setGradeEdits(initialEdits);

      // Initialize file submission grading states
      setFileScore(submission.totalScore !== null ? Number(submission.totalScore) : null);
      setFileFeedback(submission.feedback || '');

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditChange = (answerId: string, field: 'pointsEarned' | 'feedback', value: any) => {
    setGradeEdits(prev => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      if (data.submissionType === 'file_upload') {
        const pointsAvailable = Number(data.assignment?.exercise?.totalPoints || 10);
        let score = fileScore !== null ? fileScore : 0;
        
        if (score > pointsAvailable) score = pointsAvailable;
        if (score < 0) score = 0;

        const percentage = pointsAvailable > 0 ? Math.round((score / pointsAvailable) * 10000) / 100 : 0;

        await updateSubmissionGrade(submissionId, {
          totalScore: score,
          percentage,
          feedback: fileFeedback,
          answerUpdates: []
        });
      } else {
        let newTotalScore = 0;
        let totalPossible = 0;

        const answerUpdates = data.answers.map((ans: any) => {
          const edit = gradeEdits[ans.id];
          const pointsAvailable = Number(ans.question.points || 0);
          totalPossible += pointsAvailable;

          let points = edit.pointsEarned !== null ? edit.pointsEarned : (ans.pointsEarned || 0);

          // Ensure points do not exceed max
          if (points > pointsAvailable) points = pointsAvailable;
          if (points < 0) points = 0;

          newTotalScore += points;

          // Is correct logic based on points
          const isCorrect = points > 0 && points >= pointsAvailable * 0.5;

          return {
            id: ans.id,
            pointsEarned: points,
            isCorrect,
            feedback: edit.feedback
          };
        });

        const percentage = totalPossible > 0 ? Math.round((newTotalScore / totalPossible) * 10000) / 100 : 0;

        await updateSubmissionGrade(submissionId, {
          totalScore: newTotalScore,
          percentage,
          answerUpdates
        });
      }
      notification.success('Đã cập nhật điểm thành công');
      fetchData();
    } catch (error: any) {
      notification.error('Lỗi: ' + (error.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const { student, assignment, answers } = data;
  const scoreColor = data.percentage >= 80 ? 'text-green-600' : data.percentage >= 50 ? 'text-blue-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-50"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </Button>
            <div>
              <H1 className="flex items-center gap-2">
                Bài làm: {student?.user?.name}
              </H1>
              <P className="text-sm font-medium text-gray-500 mt-1">
                {assignment?.exercise?.title}
              </P>
            </div>
          </div>
          <div className="flex items-center gap-5 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center px-4 border-r border-gray-100">
              <P className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Điểm số</P>
              <P className={`text-2xl font-extrabold ${scoreColor}`}>
                {data.totalScore} <span className="text-sm text-gray-400">/ {assignment?.exercise?.totalPoints}</span>
              </P>
            </div>
            <div className="text-center">
              <P className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phần trăm</P>
              <P className={`text-2xl font-extrabold ${scoreColor}`}>
                {data.percentage}%
              </P>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {data.submissionType === 'file_upload' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <H3 className="text-base font-bold text-gray-800 uppercase tracking-wider">File bài làm đã nộp</H3>
                <P className="text-xs text-gray-400 mt-1">Học sinh nộp bài viết tay dưới dạng Word hoặc PDF</P>
              </div>

              <div className="mb-6">
                <SubmissionAttachments attachments={data.attachments || []} />
              </div>

              {data.note && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                  <P className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Ghi chú của học sinh:</P>
                  <P className="text-sm text-slate-700 whitespace-pre-wrap">{data.note}</P>
                </div>
              )}

              {/* Grading section */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mt-6">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Points */}
                  <div className="w-full md:w-1/4">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                      Điểm (Max: {assignment?.exercise?.totalPoints || 10})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={assignment?.exercise?.totalPoints || 10}
                      step="0.5"
                      value={fileScore ?? ''}
                      onChange={(e) => setFileScore(e.target.value === '' ? null : parseFloat(e.target.value))}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 transition-colors font-bold text-gray-800"
                      placeholder="Nhập điểm..."
                    />
                  </div>

                  {/* Feedback */}
                  <div className="w-full md:w-3/4">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                      Nhận xét tổng quát của giáo viên
                    </label>
                    <textarea
                      rows={3}
                      value={fileFeedback}
                      onChange={(e) => setFileFeedback(e.target.value)}
                      placeholder="Thêm nhận xét tổng quan cho bài làm này..."
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 outline-hidden focus:border-blue-500 transition-colors text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            answers.map((ans: any, index: number) => {
              const isManualGrade = ans.question.questionType === 'essay';
              const edit = gradeEdits[ans.id] || {};
              const pointsPossible = Number(ans.question?.points || 0);

              return (
                <div key={ans.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <H3>Câu {index + 1}</H3>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                      {ans.question.questionType === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <P className="text-sm text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: ans.question.questionText || '' }} />
                    </div>

                    {/* Answer display based on type */}
                    <div className="bg-blue-50/50 rounded-xl p-4 mb-6 border border-blue-100">
                      <P className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Học sinh trả lời:</P>
                      {ans.question.questionType === 'essay' ? (
                        <P className="text-sm text-gray-700 whitespace-pre-wrap">{ans.answerData?.text || '—'}</P>
                      ) : (
                        <P className="text-sm text-gray-700 font-semibold whitespace-pre-wrap">{renderStudentAnswer(ans)}</P>
                      )}
                    </div>

                    {/* Grading section */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <div className="flex gap-4">
                        {/* Points */}
                        <div className="w-1/4">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Điểm (Max: {pointsPossible})</label>
                          <Input type="number" min="0" max={pointsPossible} step="0.5" value={edit.pointsEarned ?? ''} className="w-full border-2 border-gray-200 focus:border-blue-500 transition-colors font-bold text-gray-800" disabled={!isManualGrade} onChange={e => handleEditChange(ans.id, 'pointsEarned', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {/* Feedback */}
                        <div className="w-3/4">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Nhận xét của GV</label>
                          <textarea
                            rows={2}
                            value={edit.feedback || ''}
                            onChange={e => handleEditChange(ans.id, 'feedback', e.target.value)}
                            placeholder="Thêm nhận xét..."
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 outline-hidden focus:border-blue-500 transition-colors text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Save button sticky bottom */}
        <div className="mt-8 flex justify-end sticky bottom-6 z-10 transition-transform">
          <Button onClick={handleSaveGrades} disabled={saving} className="shadow-lg shadow-blue-200 hover:scale-105 font-extrabold px-8 py-3 rounded-2xl flex items-center gap-3 disabled:opacity-50">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Lưu Điểm & Nhận Xét
          </Button>
        </div>
      </div>
    </div>
  );
}
