'use client';

import { useState, useEffect, useCallback, MouseEvent } from "react";
import {
  ClipboardList, CheckCircle2, Star, Calendar, Clock, Sparkles, Plus, Trash
} from "lucide-react";
import StatCard from "./StatCard";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { getTests, deleteTest } from "@/services/test";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TestEntity } from "@/entity/test";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notification } from "@/components/notification";

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  ended: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  active: { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  scheduled: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
};

function StatusBadge({ test }: { test: TestEntity }) {
  const now = new Date();
  const startTime = test.startTime ? new Date(test.startTime) : null;
  const endTime = test.endTime ? new Date(test.endTime) : null;

  let status = "Chưa rõ";
  let type = "ended";

  if (startTime && startTime > now) {
    status = "Đã lên lịch";
    type = "scheduled";
  } else if (endTime && endTime < now) {
    status = "Đã kết thúc";
    type = "ended";
  } else {
    status = "Đang diễn ra";
    type = "active";
  }

  const s = statusStyles[type] || statusStyles.ended;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function ExamManagement() {
  const [page, setPage] = useState(1);
  const [tests, setTests] = useState<TestEntity[]>([]);
  const [testToDelete, setTestToDelete] = useState<TestEntity | null>(null);
  const router = useRouter();

  const fetchTests = useCallback(async () => {
    try {
      const res = await getTests();
      if (res.data) {
        setTests(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [])

  useEffect(() => {
    (async () => {
      await fetchTests()
    })()
  }, [fetchTests]);

  const confirmDelete = async (id: string) => {
    try {
      await deleteTest(id);
      notification.success("Bài kiểm tra đã được xoá.");
      fetchTests();
    } catch (err) {
      console.log(err);
      notification.error("Có lỗi xảy ra khi xoá bài kiểm tra.");
    } finally {
      setTestToDelete(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-7 relative">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-2 mb-5">
          <Calendar size={13} color="#3B82F6" />
          <span className="text-sm text-blue-500 font-medium">Học kỳ 1 - 2024</span>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <H1>Quản lý Bài kiểm tra</H1>
            <P className="text-sm text-muted-foreground mt-1.5">
              Theo dõi, tạo và phân tích kết quả các bài đánh giá định kỳ.
            </P>
          </div>
          <Button
            onClick={() => router.push("/teacher/assignments/tests/create")}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={16} /> Tạo bài mới
            <Sparkles size={14} style={{ marginLeft: 2 }} />
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <StatCard
            icon={ClipboardList} iconBg="#EFF6FF" iconColor="#3B82F6"
            label="Tổng số bài kiểm tra" value={tests.length.toString()}
            badge="+2 tháng này" badgeUp={true}
          />
          <StatCard
            icon={CheckCircle2} iconBg="#F5F3FF" iconColor="#8B5CF6"
            label="Tỉ lệ hoàn thành trung bình" value="--"
            badge="0%" badgeUp={true}
          />
          <StatCard
            icon={Star} iconBg="#FFFBEB" iconColor="#F59E0B"
            label="Điểm trung bình khối" value="--"
            badge="0%" badgeUp={false}
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900">Danh sách bài kiểm tra</span>
          </div>

          <div className="grid grid-cols-5 p-6 border-b border-gray-200 bg-gray-50">
            {["TÊN BÀI KIỂM TRA", "CHƯƠNG / CHỦ ĐỀ", "THỜI LƯỢNG", "TRẠNG THÁI", "THAO TÁC"].map(h => (
              <span key={h} className="text-xs font-bold text-muted-foreground tracking-wide">{h}</span>
            ))}
          </div>

          {tests.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Chưa có bài kiểm tra nào</div>
          )}

          {tests.map((test, i) => (
            <div
              key={test.id}
              onClick={() => router.push(`/teacher/assignments/tests/${test.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 2fr 1.2fr 1.5fr 1fr",
                padding: "16px 24px",
                alignItems: "center",
                borderBottom: i < tests.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <P className="text-sm font-bold text-gray-900 margin-0">{test.exercise?.title}</P>
                <P className="text-xs text-muted-foreground mt-1" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} /> {test.startTime ? format(new Date(test.startTime), "dd/MM HH:mm", { locale: vi }) : 'Chưa xếp lịch'}
                </P>
              </div>

              <span className="text-sm text-gray-500">{test.topic?.name || test.subject?.name || 'Chung'}</span>

              <span className="text-sm font-medium">{test.timeLimitMinutes} phút</span>

              <StatusBadge test={test} />

              <div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTestToDelete(test)
                  }}
                  className="bg-[#FEE2E2] hover:bg-red-200 text-[#EF4444] px-3 py-2 h-auto"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {testToDelete && (
        <Dialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">Xác nhận xoá</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Bạn có chắc chắn muốn xoá bài kiểm tra này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTestToDelete(null)}>
                Huỷ
              </Button>
              <Button onClick={() => confirmDelete(testToDelete.id)} className="bg-red-500 hover:bg-red-600 border-transparent">
                {testToDelete !== null ? "Xoá" : "Đang xoá..."}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}