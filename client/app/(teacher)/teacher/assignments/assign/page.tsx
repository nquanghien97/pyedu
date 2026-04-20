'use client';

import { useState, useEffect } from "react";
import {
  BookOpen, Calendar, Clock, CheckCircle2, History,
  ChevronDown, Search, Loader2, Target, Users, User as UserIcon
} from "lucide-react";
import { getTeacherStudents, DropdownClass, DropdownStudent } from "@/services/meta";
import { classService } from "@/services/class";
import { getExercises } from "@/services/exercise";
import { getTeacherAssignments, createTeacherAssignment } from "@/services/assignment";
import { ExerciseEntity } from "@/entity/exercise";
import { AssignmentEntity } from "@/entity/assignment";

type AssignTarget = "class" | "student";
type Tab = "new" | "history";

export default function AssignPage() {
  const [activeTab, setActiveTab] = useState<Tab>("new");

  // Meta data
  const [classes, setClasses] = useState<DropdownClass[]>([]);
  const [students, setStudents] = useState<DropdownStudent[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntity[]>([]);
  const [history, setHistory] = useState<AssignmentEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [assignTarget, setAssignTarget] = useState<AssignTarget>("class");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clsRes, stdRes, excRes, histRes] = await Promise.all([
          classService.getClasses(),
          getTeacherStudents(),
          getExercises({ status: 'approved', limit: 100 }), // Load max 100 for library
          getTeacherAssignments()
        ]);
        setClasses(clsRes.data || []);
        setStudents(stdRes);
        setExercises((excRes as any).data || []); // Fix for api wrapping
        setHistory(histRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateAssignment = async () => {
    if (!selectedExerciseId) return alert("Vui lòng chọn bài tập");
    if (assignTarget === 'class' && !selectedClassId) return alert("Vui lòng chọn lớp học");
    if (assignTarget === 'student' && !selectedStudentId) return alert("Vui lòng chọn học sinh");
    if (!dueDate) return alert("Vui lòng chọn hạn nộp bài");

    setSubmitting(true);
    try {
      await createTeacherAssignment({
        exerciseId: selectedExerciseId,
        assignedToType: assignTarget,
        assignedToId: assignTarget === 'class' ? selectedClassId : selectedStudentId,
        dueDate: new Date(dueDate).toISOString(),
      });
      alert('Giao bài thành công!');

      // Reload history and switch tab
      const histRes = await getTeacherAssignments();
      setHistory(histRes.data || []);
      setActiveTab('history');

      // Reset form
      setSelectedExerciseId('');
      setDueDate('');
    } catch (e) {
      alert("Đã xảy ra lỗi khi giao bài");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Giao bài tập</h1>
          <p className="text-sm text-gray-400 mt-1">
            Giao bài tập cho lớp hoặc cá nhân học sinh và theo dõi tiến độ.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${activeTab === "new" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Giao bài mới
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${activeTab === "history" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Lịch sử đã giao
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            {activeTab === "new" && (
              <div className="grid grid-cols-[1fr_320px] gap-6">
                <div className="flex flex-col gap-6">

                  {/* Form card */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Target size={20} className="text-blue-600" />
                      </div>
                      <span className="font-bold text-gray-900 text-lg">Thông tin giao bài</span>
                    </div>

                    {/* Target Type */}
                    <div className="mb-6">
                      <label className="text-xs font-bold text-gray-700 block mb-3 uppercase tracking-wider">Đối tượng nhận bài</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setAssignTarget("class")}
                          className={`border-2 rounded-xl p-3.5 cursor-pointer flex items-center gap-3 transition-colors ${assignTarget === "class" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-blue-200"
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${assignTarget === "class" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                            <Users size={18} />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${assignTarget === "class" ? "text-blue-900" : "text-gray-700"}`}>Cả lớp học</p>
                            <p className="text-xs text-gray-500 mt-0.5">Giao cho tất cả học sinh trong lớp</p>
                          </div>
                        </div>

                        <div
                          onClick={() => setAssignTarget("student")}
                          className={`border-2 rounded-xl p-3.5 cursor-pointer flex items-center gap-3 transition-colors ${assignTarget === "student" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-blue-200"
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${assignTarget === "student" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                            <UserIcon size={18} />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${assignTarget === "student" ? "text-blue-900" : "text-gray-700"}`}>Cá nhân</p>
                            <p className="text-xs text-gray-500 mt-0.5">Giao cho một học sinh cụ thể</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 1: Target Dropdown + Deadline */}
                    <div className="grid grid-cols-2 gap-5 mb-6">
                      <div>
                        {assignTarget === "class" ? (
                          <>
                            <label className="text-xs font-bold text-gray-700 block mb-2">Chọn lớp học</label>
                            <div className="relative">
                              <select
                                value={selectedClassId}
                                onChange={e => setSelectedClassId(e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-700 bg-white appearance-none outline-none focus:border-blue-400 font-semibold"
                              >
                                <option value="" disabled>-- Chọn lớp --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <ChevronDown size={16} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="text-xs font-bold text-gray-700 block mb-2">Chọn học sinh</label>
                            <div className="relative">
                              <select
                                value={selectedStudentId}
                                onChange={e => setSelectedStudentId(e.target.value)}
                                className="w-full pl-3 pr-10 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-700 bg-white appearance-none outline-none focus:border-blue-400 font-semibold"
                              >
                                <option value="" disabled>-- Chọn học sinh --</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                              </select>
                              <ChevronDown size={16} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-2">Thời hạn nộp bài</label>
                        <input
                          type="datetime-local"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-700 bg-white outline-none focus:border-blue-400 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Assignment library */}
                    <div className="mb-6">
                      <label className="text-xs font-bold text-gray-700 block mb-3 uppercase tracking-wider">Chọn bài tập từ thư viện</label>
                      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 pb-2">
                        {exercises.length === 0 && (
                          <div className="col-span-2 p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Chưa có bài tập nào đã duyệt trong hệ thống.
                          </div>
                        )}
                        {exercises.map(ex => (
                          <div
                            key={ex.id}
                            onClick={() => setSelectedExerciseId(ex.id)}
                            className={`border-2 rounded-xl p-3 cursor-pointer flex items-start gap-3 transition-colors ${selectedExerciseId === ex.id ? "border-blue-500 bg-blue-50/30" : "border-gray-100 hover:border-blue-200"
                              }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedExerciseId === ex.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                              }`}>
                              <BookOpen size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{ex.title}</p>
                              <p className="text-[11px] text-gray-500 mt-1 truncate">
                                {ex.subject?.name} • {ex._count?.questions || 0} câu hỏi • {ex.timeLimitMinutes || '--'} phút
                              </p>
                            </div>
                            {selectedExerciseId === ex.id && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCreateAssignment}
                        disabled={submitting}
                        className="flex-1 py-3.5 rounded-xl border-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                      >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        {submitting ? 'Đang xử lý...' : 'Hoàn tất giao bài'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tips */}
                <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-6 h-fit">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">💡</span>
                    Mẹo giao bài
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      Học sinh sẽ nhận được thông báo ngay khi bạn giao bài thành công.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      Ngày hết hạn có thể thay đổi sau khi giao.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      Hỗ trợ giao cùng một bài tập cho nhiều đối tượng khác nhau ở các thời điểm khác nhau.
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      {['BÀI TẬP', 'ĐỐI TƯỢNG', 'LOẠI', 'HẠN NỘP', 'TIẾN ĐỘ'].map((h) => (
                        <th key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left px-6 py-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="text-center p-12 text-sm text-gray-500">Chưa có dữ liệu giao bài.</div>
                        </td>
                      </tr>
                    ) : (
                      history.map((a, i) => {
                        const targetName = a.assignedToType === 'class'
                          ? classes.find(c => c.id === a.assignedToId)?.name || 'Lớp ẩn'
                          : students.find(s => s.id === a.assignedToId)?.name || 'Học sinh ẩn';

                        return (
                          <tr key={a.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-sm text-gray-900">{a.exercise?.title}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{a.exercise?.subject?.name}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                              {targetName}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${a.assignedToType === 'class' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {a.assignedToType === 'class' ? 'LỚP HỌC' : 'CÁ NHÂN'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {a.dueDate ? new Date(a.dueDate).toLocaleString('vi-VN') : 'Không có hạn'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                              {(a as any)._count?.submissions || 0} bài nộp
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}