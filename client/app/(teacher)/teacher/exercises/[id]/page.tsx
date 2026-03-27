'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExerciseEntity,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  QUESTION_TYPE_LABELS,
  DifficultyLevel,
  ExerciseStatus,
  QuestionType,
} from '@/entity/exercise';
import { GradeEntity } from '@/entity/grade';
import { gradeService } from '@/services/grade';
import { getExerciseById, updateExercise, updateExerciseStatus, deleteExercise } from '@/services/exercise';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MathText } from '@/components/ui/math-text';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  SaveIcon,
  XIcon,
} from 'lucide-react';

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<GradeEntity[]>([]);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editGradeId, setEditGradeId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editTopicId, setEditTopicId] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('');
  const [editTotalPoints, setEditTotalPoints] = useState(0);
  const [editTimeLimit, setEditTimeLimit] = useState(0);

  const fetchExercise = useCallback(async () => {
    try {
      const res = await getExerciseById(id);
      setExercise(res.data);
    } catch (error) {
      console.error('Failed to fetch exercise:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExercise();
    gradeService.getGrades().then((res) => setGrades(res.data)).catch(() => { });
  }, [fetchExercise]);

  // Derived selectors
  const selectedGrade = grades.find((g) => g.id === editGradeId);
  const subjects = selectedGrade?.subjects || [];
  const selectedSubject = subjects.find((s) => s.id === editSubjectId);
  const topics = selectedSubject?.topics || [];

  const startEditing = () => {
    if (!exercise) return;
    setEditTitle(exercise.title || '');
    setEditGradeId(exercise.gradeId || '');
    setEditSubjectId(exercise.subjectId || '');
    setEditTopicId(exercise.topicId || '');
    setEditDifficulty(exercise.difficultyLevel || '');
    setEditTotalPoints(exercise.totalPoints || 0);
    setEditTimeLimit(exercise.timeLimitMinutes || 0);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateExercise(id, {
        title: editTitle,
        gradeId: editGradeId || undefined,
        subjectId: editSubjectId || undefined,
        topicId: editTopicId || undefined,
        difficultyLevel: editDifficulty || undefined,
        totalPoints: Number(editTotalPoints) || undefined,
        timeLimitMinutes: Number(editTimeLimit) || undefined,
      });
      await fetchExercise();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update exercise:', error);
      alert('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateExerciseStatus(id, status);
      await fetchExercise();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    try {
      await deleteExercise(id);
      router.push('/teacher/exercises');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy bài tập.</p>
        <Button variant="outline" onClick={() => router.push('/teacher/exercises')} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const selectClass =
    'flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-shadow';

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Quay lại
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
        {/* Title & Actions Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Tiêu đề bài tập"
                className="text-lg font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{exercise.title || 'Không có tiêu đề'}</h1>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1 bg-[#3b82f6] hover:bg-blue-600"
                >
                  <SaveIcon className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="gap-1 text-[#3b82f6] border-[#3b82f6] hover:bg-blue-50"
                >
                  <PencilIcon className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 gap-1">
                  <TrashIcon className="w-4 h-4" />
                  Xóa
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Editable Metadata */}
        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Khối lớp</label>
                <select
                  value={editGradeId}
                  onChange={(e) => {
                    setEditGradeId(e.target.value);
                    setEditSubjectId('');
                    setEditTopicId('');
                  }}
                  className={selectClass}
                >
                  <option value="">-- Chọn khối --</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Môn học</label>
                <select
                  value={editSubjectId}
                  disabled={!editGradeId}
                  onChange={(e) => {
                    setEditSubjectId(e.target.value);
                    setEditTopicId('');
                  }}
                  className={selectClass}
                >
                  <option value="">-- Chọn môn --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Chủ đề</label>
                <select
                  value={editTopicId}
                  disabled={!editSubjectId}
                  onChange={(e) => setEditTopicId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Độ khó</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className={selectClass}
                >
                  <option value="">-- Chọn mức độ --</option>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Tổng điểm</label>
                <Input
                  type="number"
                  value={editTotalPoints}
                  onChange={(e) => setEditTotalPoints(Number(e.target.value))}
                  min={0}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Thời gian (phút)</label>
                <Input
                  type="number"
                  value={editTimeLimit}
                  onChange={(e) => setEditTimeLimit(Number(e.target.value))}
                  min={0}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Read-only badges row */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
              {exercise.subject && <span>📚 {exercise.subject.name}</span>}
              {exercise.topic && <span>📁 {exercise.topic.name}</span>}
              {exercise.difficultyLevel && (
                <Badge className={DIFFICULTY_COLORS[exercise.difficultyLevel]} variant="secondary">
                  {DIFFICULTY_LABELS[exercise.difficultyLevel]}
                </Badge>
              )}
              {exercise.status && (
                <Badge className={STATUS_COLORS[exercise.status]} variant="secondary">
                  {STATUS_LABELS[exercise.status]}
                </Badge>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <FileTextIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{exercise.questions?.length || 0} câu hỏi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{exercise.totalPoints || 0} điểm</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{exercise.timeLimitMinutes || 0} phút</span>
              </div>
            </div>
          </>
        )}

        {/* Status Actions */}
        <div className="mt-4 pt-4 border-t flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Trạng thái:</span>
          {(['draft', 'reviewed', 'approved', 'archived'] as ExerciseStatus[]).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={exercise.status === status ? 'default' : 'outline'}
              onClick={() => handleStatusChange(status)}
              className={`text-xs ${exercise.status === status ? 'bg-[#3b82f6] hover:bg-blue-600' : ''}`}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Danh sách câu hỏi</h2>

        {exercise.questions && exercise.questions.length > 0 ? (
          <div className="space-y-4">
            {exercise.questions.map((q, index) => (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Câu {index + 1}</span>
                    {q.questionType && (
                      <Badge variant="secondary" className="text-xs">
                        {QUESTION_TYPE_LABELS[q.questionType as QuestionType] || q.questionType}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{q.points || 0} điểm</span>
                </div>
                <MathText
                  text={q.questionText || 'Chưa nhập nội dung'}
                  as="p"
                  className="text-sm text-gray-900 whitespace-pre-wrap"
                />

                {/* Show content details */}
                {q.content !== null && q.content !== undefined && typeof q.content === 'object' && (
                  <QuestionContentView
                    type={q.questionType as QuestionType}
                    content={q.content as Record<string, unknown>}
                  />
                )}

                {q.explanation && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700 flex items-start gap-1">
                    <span>💡</span>
                    <MathText text={q.explanation} className="inline" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Chưa có câu hỏi nào.</p>
        )}
      </div>
    </div>
  );
}

function QuestionContentView({
  type,
  content,
}: {
  type: QuestionType;
  content: Record<string, unknown>;
}) {
  switch (type) {
    case 'multiple_choice':
    case 'multiple_select': {
      const options = (content.options as string[]) || [];
      const correctAnswer = content.correctAnswer as number;
      const correctAnswers = (content.correctAnswers as number[]) || [];

      return (
        <div className="mt-2 space-y-1">
          {options.map((opt, i) => {
            const isCorrect =
              type === 'multiple_choice' ? correctAnswer === i : correctAnswers.includes(i);
            return (
              <div
                key={i}
                className={`flex items-center gap-2 p-2 rounded text-sm ${isCorrect ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}
              >
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <MathText text={opt || '(trống)'} />
                {isCorrect && <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />}
              </div>
            );
          })}
        </div>
      );
    }
    case 'true_false': {
      return (
        <div className="mt-2 text-sm">
          <span className="text-gray-500">Đáp án đúng: </span>
          <span className="font-medium">{content.correctAnswer ? 'Đúng' : 'Sai'}</span>
        </div>
      );
    }
    case 'fill_blank': {
      const blanks = (content.blanks as string[]) || [];
      return (
        <div className="mt-2 text-sm text-gray-600">
          {blanks.map((blank, i) => (
            <span key={i} className="inline-block mr-2 px-2 py-0.5 bg-blue-50 rounded text-blue-700">
              {i + 1}: {blank || '(trống)'}
            </span>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}
