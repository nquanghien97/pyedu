'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, MessageSquare, Save, Loader2 
} from 'lucide-react';
import { getSubmissionById, updateSubmissionGrade } from '@/services/submission';

export default function TeacherSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);

  // State for manual grading edits
  const [gradeEdits, setGradeEdits] = useState<Record<string, { pointsEarned: number | null, feedback: string }>>({});

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
      alert('Đã cập nhật điểm thành công');
      fetchData();
    } catch (error: any) {
      alert('Lỗi: ' + (error.message || 'Không thể lưu'));
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
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-50"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                Bài làm: {student?.user?.name}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {assignment?.exercise?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center px-4 border-r border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Điểm số</p>
              <p className={`text-2xl font-extrabold ${scoreColor}`}>
                {data.totalScore} <span className="text-sm text-gray-400">/ {assignment?.exercise?.totalPoints}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phần trăm</p>
              <p className={`text-2xl font-extrabold ${scoreColor}`}>
                {data.percentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {answers.map((ans: any, index: number) => {
            const isManualGrade = ans.question.questionType === 'essay';
            const edit = gradeEdits[ans.id] || {};
            const pointsPossible = Number(ans.question?.points || 0);

            return (
              <div key={ans.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Câu {index + 1}</h3>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                    {ans.question.questionType === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: ans.question.content }} />
                  </div>

                  {/* Answer display based on type */}
                  <div className="bg-blue-50/50 rounded-xl p-4 mb-6 border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Học sinh trả lời:</p>
                    {ans.question.questionType === 'essay' ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{ans.answerData?.text || '—'}</p>
                    ) : (
                      <p className="text-sm text-gray-700 font-semibold">{JSON.stringify(ans.answerData?.value || ans.answerData)}</p>
                    )}
                  </div>

                  {/* Grading section */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex gap-4">
                      {/* Points */}
                      <div className="w-1/4">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">Điểm (Max: {pointsPossible})</label>
                        <input 
                          type="number" 
                          min="0" max={pointsPossible} step="0.5"
                          value={edit.pointsEarned ?? ''}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors font-bold text-gray-800"
                          disabled={!isManualGrade}
                          onChange={e => handleEditChange(ans.id, 'pointsEarned', parseFloat(e.target.value) || 0)}
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
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Save button sticky bottom */}
        <div className="mt-8 flex justify-end sticky bottom-6 z-10 transition-transform">
          <button
            onClick={handleSaveGrades}
            disabled={saving}
            className="bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all text-white font-extrabold px-8 py-3 rounded-2xl flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Lưu Điểm & Nhận Xét
          </button>
        </div>
      </div>
    </div>
  );
}
