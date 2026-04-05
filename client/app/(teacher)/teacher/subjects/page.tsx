'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubjectEntity, TopicEntity } from '@/entity/subject';
import { classService, ClassEntity } from '@/services/class';
import { getSubjects, createSubject, updateSubject, deleteSubject, createTopic, updateTopic, deleteTopic } from '@/services/subject';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, BookOpenIcon, FolderIcon, XIcon, CheckIcon, LayersIcon, GraduationCap } from 'lucide-react';

// ---------- Zod Schemas ----------
const nameSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(255, 'Tên tối đa 255 ký tự'),
});

type NameFormValues = z.infer<typeof nameSchema>;

// ---------- Editing State ----------
interface EditingState {
  type: 'subject' | 'topic';
  mode: 'create' | 'edit';
  grade?: number;      // Used when creating a subject under a specific grade
  parentId?: string;   // Used when creating a topic under a subject
  id?: string;         // Used when editing
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
  const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<EditingState | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [subjRes, clsRes] = await Promise.all([
        getSubjects(),
        classService.getClasses()
      ]);
      setSubjects(subjRes.data);
      setClasses(clsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive unique active grades from classes and subjects
  const groupedData = useMemo(() => {
    const gradesSet = new Set<number>();
    classes.forEach(c => c.grade && gradesSet.add(c.grade));
    subjects.forEach(s => s.grade && gradesSet.add(s.grade));
    
    const gradesArray = Array.from(gradesSet).sort((a, b) => a - b);
    
    // Group subjects by grade
    const map = new Map<number, SubjectEntity[]>();
    gradesArray.forEach(g => map.set(g, []));
    
    subjects.forEach(s => {
      if (s.grade && map.has(s.grade)) {
        map.get(s.grade)?.push(s);
      }
    });

    return { activeGrades: gradesArray, groups: map };
  }, [classes, subjects]);

  const toggleGradeExpand = (grade: number) => {
    setExpandedGrades(prev => {
      const next = new Set(prev);
      if (next.has(grade)) next.delete(grade);
      else next.add(grade);
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
      if (editing.type === 'subject') {
        if (editing.mode === 'create' && editing.grade) {
          await createSubject({ name: values.name, grade: editing.grade, parentSubjectId: null });
        } else if (editing.id) {
          await updateSubject(editing.id, { name: values.name });
        }
      } else if (editing.type === 'topic') {
        if (editing.mode === 'create' && editing.parentId) {
          await createTopic({ subjectId: editing.parentId, name: values.name });
        } else if (editing.id) {
          await updateTopic(editing.id, { name: values.name });
        }
      }
      setEditing(null);
      await fetchData();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async (type: 'subject' | 'topic', id: string) => {
    const typeLabel = type === 'subject' ? 'môn học' : 'chủ đề';
    if (!confirm(`Bạn có chắc muốn xóa ${typeLabel} này?`)) return;
    try {
      if (type === 'subject') await deleteSubject(id);
      else await deleteTopic(id);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Cấu trúc Chương trình Đào tạo</h1>
            <p className="text-sm text-gray-500">Quản lý môn học và chủ đề theo các khối lớp đang hoạt động.</p>
          </div>
        </div>

        {/* Grade List */}
        <div className="space-y-4">
          {groupedData.activeGrades.length === 0 && !editing && (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50 text-blue-500" />
              <p>Chưa có Khối nào hoạt động. Hãy tạo Lớp học trước để kích hoạt Khối.</p>
            </div>
          )}

          {groupedData.activeGrades.map(grade => {
             const gradeSubjects = groupedData.groups.get(grade) || [];
             
             return (
              <div key={grade} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                {/* Grade Header */}
                <div 
                  className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 cursor-pointer group"
                  onClick={() => toggleGradeExpand(grade)}
                >
                  <button className="w-8 h-8 flex justify-center items-center hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                    {expandedGrades.has(grade) ? <ChevronDownIcon size={20} /> : <ChevronRightIcon size={20} />}
                  </button>
                  
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex justify-center items-center font-bold">
                    {grade}
                  </div>
                  <span className="font-extrabold text-gray-900 flex-1 text-lg">Khối {grade}</span>
                  
                  <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {gradeSubjects.length} môn học
                  </span>
                  
                  <div className="hidden group-hover:flex items-center mx-2">
                    <button
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                      title="Thêm môn học"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing({ type: 'subject', mode: 'create', grade });
                        setExpandedGrades(prev => new Set(prev).add(grade));
                      }}
                    >
                      <PlusIcon size={16} /> Thêm môn
                    </button>
                  </div>
                </div>

                {/* Subjects and Topics */}
                {expandedGrades.has(grade) && (
                  <div className="p-4 bg-white">
                    {/* Create Subject Inline Form */}
                    {editing?.type === 'subject' && editing.mode === 'create' && editing.grade === grade && (
                      <div className="mb-4 ml-12 p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-sm">
                        <InlineNameForm
                          defaultName=""
                          icon={<BookOpenIcon className="w-5 h-5 text-blue-600" />}
                          placeholder="Tên môn học mới (VD: Toán nâng cao)..."
                          inputClassName="font-semibold"
                          onSubmit={handleSave}
                          onCancel={() => setEditing(null)}
                        />
                      </div>
                    )}

                    {/* Subject List */}
                    {gradeSubjects.length === 0 && !editing && (
                      <p className="text-sm text-gray-400 font-medium ml-12 py-4">Chưa có môn học nào thuộc Khối {grade}.</p>
                    )}
                    
                    <div className="space-y-4 ml-4">
                      {gradeSubjects.map(subject => (
                        <div key={subject.id} className="ml-8 bg-white rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                          {/* Subject Header */}
                          <div className="flex items-center gap-2 p-3 hover:bg-gray-50 group border-b border-gray-50 rounded-t-xl transition-colors">
                            <button onClick={() => toggleSubjectExpand(subject.id)} className="w-8 h-8 flex justify-center items-center hover:bg-gray-200 rounded-lg text-gray-500">
                              {expandedSubjects.has(subject.id) ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
                            </button>

                            {editing?.type === 'subject' && editing.mode === 'edit' && editing.id === subject.id ? (
                              <InlineNameForm
                                defaultName={subject.name}
                                icon={<BookOpenIcon className="w-5 h-5 text-blue-500" />}
                                placeholder="Tên môn học..."
                                inputClassName="h-9 font-bold"
                                onSubmit={handleSave}
                                onCancel={() => setEditing(null)}
                              />
                            ) : (
                              <>
                                <BookOpenIcon className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-gray-800 flex-1">{subject.name}</span>
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                  {subject.topics?.length || 0} chủ đề
                                </span>
                                <div className="hidden group-hover:flex items-center gap-1 mx-2">
                                  <button
                                    className="w-8 h-8 flex justify-center items-center hover:bg-green-100 rounded-lg text-gray-400 hover:text-green-600 transition-colors"
                                    title="Thêm chủ đề"
                                    onClick={() => {
                                      setEditing({ type: 'topic', mode: 'create', parentId: subject.id });
                                      setExpandedSubjects(prev => new Set(prev).add(subject.id));
                                    }}
                                  >
                                    <PlusIcon size={18} />
                                  </button>
                                  <button
                                    className="w-8 h-8 flex justify-center items-center hover:bg-orange-100 rounded-lg text-gray-400 hover:text-orange-600 transition-colors"
                                    title="Sửa môn học"
                                    onClick={() => setEditing({ type: 'subject', mode: 'edit', id: subject.id })}
                                  >
                                    <PencilIcon size={16} />
                                  </button>
                                  <button
                                    className="w-8 h-8 flex justify-center items-center hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                    title="Xóa môn học"
                                    onClick={() => handleDelete('subject', subject.id)}
                                  >
                                    <TrashIcon size={16} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Topics */}
                          {expandedSubjects.has(subject.id) && (
                            <div className="bg-gray-50 px-4 pt-2 pb-4 rounded-b-xl">
                              {/* Create Topic Inline Form */}
                              {editing?.type === 'topic' && editing.mode === 'create' && editing.parentId === subject.id && (
                                <div className="mt-2 ml-8 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                                  <InlineNameForm
                                    defaultName=""
                                    icon={<FolderIcon className="w-4 h-4 text-green-500" />}
                                    placeholder="Tên chủ đề mới..."
                                    inputClassName="h-8 font-medium text-sm"
                                    onSubmit={handleSave}
                                    onCancel={() => setEditing(null)}
                                  />
                                </div>
                              )}

                              {/* Topic List */}
                              {subject.topics && subject.topics.length > 0 ? (
                                <div className="mt-2 ml-8 space-y-1.5">
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
                                  <p className="text-xs font-medium text-gray-400 mt-3 ml-10 mb-1">Chưa có chủ đề nào.</p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 group transition-all">
      {isEditing ? (
        <InlineNameForm
          defaultName={topic.name}
          icon={<FolderIcon className="w-4 h-4 text-green-500" />}
          placeholder="Tên chủ đề..."
          inputClassName="h-8 text-sm font-medium"
          onSubmit={onSave}
          onCancel={onCancel}
        />
      ) : (
        <>
          <FolderIcon className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-gray-700 flex-1">{topic.name}</span>
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              className="w-7 h-7 flex justify-center items-center hover:bg-orange-50 rounded-md text-gray-400 hover:text-orange-600 transition-colors"
              onClick={onStartEdit}
              title="Sửa chủ đề"
            >
              <PencilIcon size={14} />
            </button>
            <button
              className="w-7 h-7 flex justify-center items-center hover:bg-red-50 rounded-md text-gray-400 hover:text-red-500 transition-colors"
              onClick={onDelete}
              title="Xóa chủ đề"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
