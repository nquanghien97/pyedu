'use client';

import { useState, useEffect } from "react";
import {
  Calendar, Clock, Settings, Plus, BookOpen, Trash2, Edit2, Play, Users, CheckCircle, Loader2, AlertTriangle
} from "lucide-react";
import { getAutoAssignConfigs, createAutoAssignConfig, deleteAutoAssignConfig, updateAutoAssignConfig, AutoAssignConfig, triggerAutoAssign } from "@/services/autoAssign";
import { classService, ClassEntity } from "@/services/class";
import { getSubjects } from "@/services/subject";
import { SubjectEntity } from "@/entity/subject";

export default function AutoAssignPage() {
  const [configs, setConfigs] = useState<AutoAssignConfig[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [exercisesPerDay, setExercisesPerDay] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);

  const WEEKDAYS = [
    { value: 1, label: 'T2' },
    { value: 2, label: 'T3' },
    { value: 3, label: 'T4' },
    { value: 4, label: 'T5' },
    { value: 5, label: 'T6' },
    { value: 6, label: 'T7' },
    { value: 0, label: 'CN' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [confRes, classRes, subjRes] = await Promise.all([
        getAutoAssignConfigs(),
        classService.getClasses(),
        getSubjects()
      ]);
      setConfigs(confRes.data || []);
      setClasses(classRes.data || []);
      setSubjects(subjRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleCreate = async () => {
    if (!selectedClassId || !selectedSubjectId) return alert("Vui lòng chọn lớp học và môn học");
    if (daysOfWeek.length === 0) return alert("Vui lòng chọn ít nhất 1 ngày giao bài");

    setSubmitting(true);
    try {
      await createAutoAssignConfig({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        difficultyLevel: difficultyLevel || undefined,
        exercisesPerDay,
        isActive: true,
        daysOfWeek
      });
      alert("Tạo cấu hình giao bài tự động thành công!");
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (config: AutoAssignConfig) => {
    try {
      await updateAutoAssignConfig(config.id, { isActive: !config.isActive });
      loadData();
    } catch (err) {
      alert("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình này?")) return;
    try {
      await deleteAutoAssignConfig(id);
      loadData();
    } catch (err) {
      alert("Không thể xóa");
    }
  };

  const handleTriggerNow = async () => {
    if (!confirm("Hệ thống sẽ lập tức quét và giao bài theo các cấu hình đang BẬT. Tiếp tục?")) return;
    setSubmitting(true);
    try {
      const res = await triggerAutoAssign();
      alert(`Đã chạy tự động thành công!\nTạo ra ${res.data?.assignmentsCreated || 0} bài tập mới.`);
    } catch (err) {
      alert("Có lỗi xảy ra khi chạy tự động");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId("");
    setSelectedSubjectId("");
    setDifficultyLevel("");
    setExercisesPerDay(1);
    setDaysOfWeek([1, 2, 3, 4, 5]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Giao bài tự động (Auto-Assign)
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Thiết lập hệ thống tự động chọn và giao bài tập hàng ngày cho các lớp.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTriggerNow}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition-colors"
            >
              <Play size={16} /> Chạy quét ngay
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {showForm ? 'Đóng form' : <><Plus size={16} /> Tạo cấu hình mới</>}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={18} className="text-blue-500" />
              Thêm cấu hình mới
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Chọn Lớp học</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
                >
                  <option value="" disabled>-- Chọn lớp --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Chọn Môn học</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
                >
                  <option value="" disabled>-- Chọn môn --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Mức độ ưu tiên</label>
                <select
                  value={difficultyLevel}
                  onChange={e => setDifficultyLevel(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
                >
                  <option value="">Ngẫu nhiên</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Số bài mỗi ngày</label>
                <input
                  type="number"
                  min="1" max="10"
                  value={exercisesPerDay}
                  onChange={e => setExercisesPerDay(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Ngày giao bài trong tuần</label>
                <div className="flex gap-2">
                  {WEEKDAYS.map(day => {
                    const isSelected = daysOfWeek.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        onClick={() => handleToggleDay(day.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-slate-100 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreate} disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Lưu cấu hình'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
        ) : configs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">Chưa có cấu hình</h3>
            <p className="text-gray-500 mt-2">Bạn chưa thiết lập giao bài tự động cho lớp nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {configs.map(config => (
              <div key={config.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Users size={18} className="text-indigo-500" />
                      {config.class?.name || 'Lớp ẩn'}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-1 flex items-center gap-1.5">
                      <BookOpen size={14} /> {config.subject?.name || 'Môn ẩn'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={config.isActive} 
                      onChange={() => handleToggleActive(config)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="p-5 flex-1 bg-slate-50/50">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Mức độ ưu tiên</p>
                      <p className="font-semibold text-gray-800">
                        {config.difficultyLevel === 'easy' ? 'Dễ' :
                         config.difficultyLevel === 'medium' ? 'Trung bình' :
                         config.difficultyLevel === 'hard' ? 'Khó' : 'Ngẫu nhiên'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Số lượng/ngày</p>
                      <p className="font-semibold text-gray-800">{config.exercisesPerDay} bài</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Lịch giao bài (6:00 AM)</p>
                      <div className="flex gap-1.5 mt-2">
                        {WEEKDAYS.map(day => (
                          <div 
                            key={day.value}
                            className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${
                              (config.daysOfWeek || []).includes(day.value)
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-300'
                            }`}
                          >
                            {day.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-sm font-semibold">
                  <button 
                    onClick={() => handleDelete(config.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
