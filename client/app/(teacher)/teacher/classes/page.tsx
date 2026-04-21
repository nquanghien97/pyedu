'use client';

import { useState, useEffect } from "react";
import { PlusIcon, Users, Loader2, BookOpen, TrashIcon, UserPlus } from "lucide-react";
import { ClassEntity, ClassEnrollmentEntity, classService } from "@/services/class";
import { DropdownStudent, getTeacherStudents } from "@/services/meta";
import { notification } from "@/components/notification";

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Create Class Mode
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState<number>(10);
  const [creating, setCreating] = useState(false);

  // Modal Manage Students Mode
  const [manageClass, setManageClass] = useState<ClassEntity | null>(null);
  const [enrollments, setEnrollments] = useState<ClassEnrollmentEntity[]>([]);
  const [allStudents, setAllStudents] = useState<DropdownStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classService.getClasses();
      setClasses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async () => {
    if (!newClassName.trim()) return;
    setCreating(true);
    try {
      await classService.createClass({ name: newClassName, grade: newClassGrade });
      setIsCreateOpen(false);
      setNewClassName("");
      fetchClasses();
    } catch (e) {
      console.error(e);
      notification.error('Tạo lớp thất bại');
    } finally {
      setCreating(false);
    }
  };

  const openManageClass = async (cls: ClassEntity) => {
    setManageClass(cls);
    setLoadingStudents(true);
    try {
      const [enrollRes, studentsRes] = await Promise.all([
        classService.getClassStudents(cls.id),
        getTeacherStudents()
      ]);
      setEnrollments(enrollRes.data);
      setAllStudents(studentsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async () => {
    if (!manageClass || !selectedStudentId) return;
    try {
      await classService.enrollStudent(manageClass.id, selectedStudentId);
      const enrollRes = await classService.getClassStudents(manageClass.id);
      setEnrollments(enrollRes.data);
      setSelectedStudentId("");
      fetchClasses(); // Update count
    } catch (e) {
      console.error(e);
      notification.error('Không thể gán học sinh vào lớp. Có thể học sinh đã nằm trong lớp này.');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!manageClass) return;
    if (!confirm('Xóa học sinh này khỏi lớp?')) return;
    try {
      await classService.removeStudent(manageClass.id, studentId);
      const enrollRes = await classService.getClassStudents(manageClass.id);
      setEnrollments(enrollRes.data);
      fetchClasses(); // Update count
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Quản lý Lớp học</h1>
            <p className="text-sm text-gray-500">Tạo lớp học theo khối và kiểm soát thành viên dễ dàng.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-blue-500/30 shadow-lg"
          >
            <PlusIcon size={18} />
            Tạo lớp mới
          </button>
        </div>

        {isCreateOpen && (
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-700 block mb-2">Tên Lớp học</label>
              <input
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="VD: Lớp 10A1 Toán..."
                autoFocus
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-400 font-semibold text-sm"
              />
            </div>
            <div className="w-40">
              <label className="text-xs font-bold text-gray-700 block mb-2">Khối / Cấp</label>
              <select
                value={newClassGrade}
                onChange={e => setNewClassGrade(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-400 font-bold text-sm bg-gray-50"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>Khối {g}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreate} disabled={creating}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold h-[44px] hover:bg-black disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : 'Lưu lại'}
            </button>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold h-[44px] hover:bg-gray-200"
            >
              Hủy
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {classes.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                Chưa có lớp học nào. Nhấn "Tạo lớp mới" để bắt đầu.
              </div>
            ) : (
              classes.map(cls => (
                <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex justify-center items-center font-bold">
                      {cls.grade}
                    </div>
                    <div className="bg-gray-50 text-xs font-bold text-gray-500 px-2 py-1 rounded-md">
                      Khối {cls.grade}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900 truncate mb-1">{cls.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Users size={16} />
                    {cls._count?.enrollments || 0} học sinh
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-50 flex gap-2">
                    <button
                      onClick={() => openManageClass(cls)}
                      className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      <UserPlus size={16} /> Quản lý học sinh
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Manage Students */}
        {manageClass && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-[600px] flex flex-col h-[600px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Thành viên lớp {manageClass.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Gán học sinh vào để họ có thể nhận được bài tập giao cho lớp.</p>
                </div>
                <button onClick={() => setManageClass(null)} className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 font-bold">✕</button>
              </div>

              <div className="p-6 border-b border-gray-100 flex gap-3">
                <select
                  value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl font-medium text-sm outline-none focus:border-blue-400"
                >
                  <option value="" disabled>-- Chọn học sinh từ hệ thống --</option>
                  {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-blue-500/30 flex items-center gap-2"
                >
                  <PlusIcon size={16} /> Thêm
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {loadingStudents ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Lớp học này chưa có học sinh nào.</div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map(e => (
                      <div key={e.id} className="p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex justify-center items-center text-indigo-700 font-bold uppercase">
                            {(e.student?.user?.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{e.student?.user?.name}</p>
                            <p className="text-xs text-gray-500">{e.student?.user?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(e.studentId)}
                          className="w-8 h-8 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 flex justify-center items-center transition-colors"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}