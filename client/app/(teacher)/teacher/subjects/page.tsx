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

  // We no longer group subjects by grade because subjects are 'Khối chung' (Global)
  // Classes are independent list if needed, but here we only manage subjects and topics.

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

        {/* Subjects List */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all p-4">
            <h2 className="font-extrabold text-gray-900 mb-4 text-xl flex items-center border-b pb-3">
              <BookOpenIcon className="w-6 h-6 text-indigo-600 mr-2" />
              Chương trình cốt lõi
            </h2>
            
            {subjects.length === 0 && !editing && (
              <p className="text-sm text-gray-400 font-medium py-4 text-center">Đang tải dữ liệu môn học...</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="bg-gray-50/50 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                  {/* Subject Header */}
                  <div className="flex items-center gap-2 p-3 hover:bg-gray-100 group border-b border-gray-100 rounded-t-xl transition-colors">
                    <button onClick={() => toggleSubjectExpand(subject.id)} className="w-8 h-8 flex justify-center items-center hover:bg-gray-200 rounded-lg text-gray-500">
                      {expandedSubjects.has(subject.id) ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
                    </button>

                    <BookOpenIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-gray-800 flex-1 truncate">{subject.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 bg-white border px-2 py-1 rounded-md">
                      {subject.topics?.length || 0} chủ đề
                    </span>
                    
                    <div className="hidden group-hover:flex items-center gap-1 mx-1">
                      <button
                        className="w-8 h-8 flex justify-center items-center bg-white hover:bg-green-100 rounded-lg text-gray-400 hover:text-green-600 transition-colors shadow-sm"
                        title="Thêm chủ đề"
                        onClick={() => {
                          setEditing({ type: 'topic', mode: 'create', parentId: subject.id });
                          setExpandedSubjects(prev => new Set(prev).add(subject.id));
                        }}
                      >
                        <PlusIcon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Topics */}
                  {expandedSubjects.has(subject.id) && (
                    <div className="bg-white px-2 pt-2 pb-3 rounded-b-xl min-h-[100px]">
                      {/* Create Topic Inline Form */}
                      {editing?.type === 'topic' && editing.mode === 'create' && editing.parentId === subject.id && (
                        <div className="mt-1 p-2 bg-green-50/50 rounded-md border border-green-200 shadow-sm mb-2">
                          <InlineNameForm
                            defaultName=""
                            icon={<FolderIcon className="w-4 h-4 text-green-500" />}
                            placeholder="Tên chủ đề mới..."
                            inputClassName="h-8 font-medium text-sm bg-white"
                            onSubmit={handleSave}
                            onCancel={() => setEditing(null)}
                          />
                        </div>
                      )}

                      {/* Topic List */}
                      {subject.topics && subject.topics.length > 0 ? (
                        <div className="space-y-1">
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
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <LayersIcon className="w-8 h-8 text-gray-300 mb-1" />
                            <p className="text-xs font-medium text-gray-400">Chưa có chủ đề nào.</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
