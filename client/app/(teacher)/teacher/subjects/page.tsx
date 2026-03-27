'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GradeEntity } from '@/entity/grade';
import { SubjectEntity, TopicEntity } from '@/entity/subject';
import { gradeService } from '@/services/grade';
import { createSubject, updateSubject, deleteSubject, createTopic, updateTopic, deleteTopic } from '@/services/subject';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, BookOpenIcon, FolderIcon, XIcon, CheckIcon, LayersIcon } from 'lucide-react';

// ---------- Zod Schemas ----------

const nameSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(255, 'Tên tối đa 255 ký tự'),
});

type NameFormValues = z.infer<typeof nameSchema>;

// ---------- Editing State ----------

interface EditingState {
  type: 'grade' | 'subject' | 'topic';
  mode: 'create' | 'edit';
  parentId?: string;
  id?: string;
}

// ---------- Inline Form Component ----------

function InlineNameForm({
  defaultName,
  icon,
  placeholder,
  inputClassName,
  onSubmit,
  onCancel,
}: {
  defaultName: string;
  icon: React.ReactNode;
  placeholder: string;
  inputClassName?: string;
  onSubmit: (values: NameFormValues) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: defaultName },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-2 flex-1"
      onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
    >
      {icon}
      <div className="flex-1">
        <Input
          {...register('name')}
          placeholder={placeholder}
          className={inputClassName}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        <CheckIcon className="w-4 h-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        <XIcon className="w-4 h-4" />
      </Button>
    </form>
  );
}

// ---------- Main Component ----------

export default function SubjectsPage() {
  const [grades, setGrades] = useState<GradeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<EditingState | null>(null);

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      const res = await gradeService.getGrades();
      setGrades(res.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const toggleGradeExpand = (gradeId: string) => {
    setExpandedGrades(prev => {
      const next = new Set(prev);
      if (next.has(gradeId)) next.delete(gradeId);
      else next.add(gradeId);
      return next;
    });
  };

  const toggleSubjectExpand = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const handleSave = async (values: NameFormValues) => {
    if (!editing) return;

    try {
      if (editing.type === 'grade') {
        if (editing.mode === 'create') {
          await gradeService.createGrade({ name: values.name });
        } else if (editing.id) {
          await gradeService.updateGrade(editing.id, { name: values.name });
        }
      } else if (editing.type === 'subject') {
        if (editing.mode === 'create' && editing.parentId) {
          await createSubject({ name: values.name, gradeId: editing.parentId, parentSubjectId: null });
        } else if (editing.id) {
          await updateSubject(editing.id, { name: values.name });
        }
      } else {
        if (editing.mode === 'create' && editing.parentId) {
          await createTopic({ subjectId: editing.parentId, name: values.name });
        } else if (editing.id) {
          await updateTopic(editing.id, { name: values.name });
        }
      }
      setEditing(null);
      await fetchGrades();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async (type: 'grade' | 'subject' | 'topic', id: string) => {
    const typeLabel = type === 'grade' ? 'khối' : type === 'subject' ? 'môn học' : 'chủ đề';
    if (!confirm(`Bạn có chắc muốn xóa ${typeLabel} này?`)) return;
    try {
      if (type === 'grade') await gradeService.deleteGrade(id);
      else if (type === 'subject') await deleteSubject(id);
      else await deleteTopic(id);
      await fetchGrades();
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Phân loại</h1>
          <p className="text-sm text-gray-500 mt-1">Cấu trúc: Khối → Môn học → Chủ đề</p>
        </div>
        <Button
          onClick={() => setEditing({ type: 'grade', mode: 'create' })}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm khối
        </Button>
      </div>

      {/* Create Grade Inline Form */}
      {editing?.type === 'grade' && editing.mode === 'create' && !editing.parentId && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-[#3b82f6]/30 shadow-sm">
          <InlineNameForm
            defaultName=""
            icon={<LayersIcon className="w-5 h-5 text-indigo-500" />}
            placeholder="Tên khối (VD: Khối 6)"
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Grade List */}
      <div className="space-y-4">
        {grades.length === 0 && !editing && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border">
            <LayersIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-indigo-500" />
            <p>Chưa có danh mục nào. Nhấn &quot;Thêm khối&quot; để bắt đầu.</p>
          </div>
        )}

        {grades.map(grade => (
          <div key={grade.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Grade Header */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-b hover:bg-gray-100 group">
              <button onClick={() => toggleGradeExpand(grade.id)} className="p-1 hover:bg-gray-200 rounded">
                {expandedGrades.has(grade.id)
                  ? <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  : <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                }
              </button>

              {editing?.type === 'grade' && editing.mode === 'edit' && editing.id === grade.id ? (
                <InlineNameForm
                  defaultName={grade.name}
                  icon={<LayersIcon className="w-5 h-5 text-indigo-500" />}
                  placeholder="Tên khối..."
                  onSubmit={handleSave}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <>
                  <LayersIcon className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-gray-900 flex-1">{grade.name}</span>
                  <span className="text-xs font-medium text-gray-500 mr-2 bg-gray-200 px-2 py-0.5 rounded-full">
                    {grade.subjects?.length || 0} môn học
                  </span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-[#3b82f6]"
                      title="Thêm môn học"
                      onClick={() => {
                        setEditing({ type: 'subject', mode: 'create', parentId: grade.id });
                        setExpandedGrades(prev => new Set(prev).add(grade.id));
                      }}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-yellow-600"
                      title="Sửa tên khối"
                      onClick={() => setEditing({ type: 'grade', mode: 'edit', id: grade.id })}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                      title="Xóa khối"
                      onClick={() => handleDelete('grade', grade.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Subjects and Topics */}
            {expandedGrades.has(grade.id) && (
              <div className="p-3 bg-white">
                {/* Create Subject Inline Form */}
                {editing?.type === 'subject' && editing.mode === 'create' && editing.parentId === grade.id && (
                  <div className="mb-3 ml-8 p-3 bg-gray-50 rounded-lg border border-[var(--primary)]/30 border-[#3b82f6]/30 shadow-sm">
                    <InlineNameForm
                      defaultName=""
                      icon={<BookOpenIcon className="w-5 h-5 text-[#3b82f6]" />}
                      placeholder="Tên môn học mới..."
                      onSubmit={handleSave}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                )}

                {/* Subject List */}
                {(!grade.subjects || grade.subjects.length === 0) && !editing ? (
                  <p className="text-sm text-gray-400 ml-8 py-2">Chưa có môn học nào thuộc khối này.</p>
                ) : (
                  <div className="space-y-3">
                    {grade.subjects?.map(subject => (
                      <div key={subject.id} className="ml-8 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                        {/* Subject Header */}
                        <div className="flex items-center gap-2 p-2.5 hover:bg-gray-100 group">
                          <button onClick={() => toggleSubjectExpand(subject.id)} className="p-1 hover:bg-gray-200 rounded">
                            {expandedSubjects.has(subject.id)
                              ? <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                              : <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            }
                          </button>

                          {editing?.type === 'subject' && editing.mode === 'edit' && editing.id === subject.id ? (
                            <InlineNameForm
                              defaultName={subject.name}
                              icon={<BookOpenIcon className="w-5 h-5 text-[#3b82f6]" />}
                              placeholder="Tên môn học..."
                              inputClassName="h-8"
                              onSubmit={handleSave}
                              onCancel={() => setEditing(null)}
                            />
                          ) : (
                            <>
                              <BookOpenIcon className="w-4.5 h-4.5 text-[#3b82f6]" />
                              <span className="font-medium text-gray-800 flex-1 text-sm">{subject.name}</span>
                              <span className="text-xs text-gray-400 mr-2">
                                {subject.topics?.length || 0} chủ đề
                              </span>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <button
                                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-green-600"
                                  title="Thêm chủ đề"
                                  onClick={() => {
                                    setEditing({ type: 'topic', mode: 'create', parentId: subject.id });
                                    setExpandedSubjects(prev => new Set(prev).add(subject.id));
                                  }}
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-yellow-600"
                                  title="Sửa môn học"
                                  onClick={() => setEditing({ type: 'subject', mode: 'edit', id: subject.id })}
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                                  title="Xóa môn học"
                                  onClick={() => handleDelete('subject', subject.id)}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Topics */}
                        {expandedSubjects.has(subject.id) && (
                          <div className="border-t border-gray-100 bg-white px-2 pt-1 pb-2 rounded-b-lg">
                            {/* Create Topic Inline Form */}
                            {editing?.type === 'topic' && editing.mode === 'create' && editing.parentId === subject.id && (
                              <div className="mt-1 ml-6 p-2 bg-gray-50 rounded border border-green-200">
                                <InlineNameForm
                                  defaultName=""
                                  icon={<FolderIcon className="w-4 h-4 text-green-500" />}
                                  placeholder="Tên chủ đề mới..."
                                  inputClassName="h-8"
                                  onSubmit={handleSave}
                                  onCancel={() => setEditing(null)}
                                />
                              </div>
                            )}

                            {/* Topic List */}
                            {subject.topics && subject.topics.length > 0 ? (
                              <div className="mt-1 ml-6 space-y-0.5">
                                {subject.topics.map(topic => (
                                  <TopicItem
                                    key={topic.id}
                                    topic={topic}
                                    isEditing={editing?.type === 'topic' && editing.mode === 'edit' && editing.id === topic.id}
                                    onStartEdit={() => setEditing({ type: 'topic', mode: 'edit', id: topic.id })}
                                    onSave={handleSave}
                                    onCancel={() => setEditing(null)}
                                    onDelete={() => handleDelete('topic', topic.id)}
                                  />
                                ))}
                              </div>
                            ) : (
                              !editing && (
                                <p className="text-xs text-gray-400 mt-2 ml-8 mb-1">Chưa có chủ đề nào</p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Topic Item ----------

function TopicItem({
  topic,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  topic: TopicEntity;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (values: NameFormValues) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 group transition-colors">
      {isEditing ? (
        <InlineNameForm
          defaultName={topic.name}
          icon={<FolderIcon className="w-4 h-4 text-green-500" />}
          placeholder="Tên chủ đề..."
          inputClassName="h-7 text-sm"
          onSubmit={onSave}
          onCancel={onCancel}
        />
      ) : (
        <>
          <FolderIcon className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-700 flex-1">{topic.name}</span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-yellow-600 transition-colors"
              onClick={onStartEdit}
              title="Sửa chủ đề"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors"
              onClick={onDelete}
              title="Xóa chủ đề"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
