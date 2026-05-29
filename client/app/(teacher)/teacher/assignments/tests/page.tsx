'use client';

import { useState, useEffect } from "react";
import {
  ClipboardList, CheckCircle2, Star, SlidersHorizontal,
  Download, MoreHorizontal, Calendar, Clock, Sparkles, Plus, Trash
} from "lucide-react";
import StatCard from "./StatCard";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { getTests, deleteTest } from "@/services/test";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TestEntity } from "@/entity/test";

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  ended:     { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  active:    { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
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
  const router = useRouter();

  const fetchTests = async () => {
    try {
      const res = await getTests();
      if (res.data) {
        setTests(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Xóa bài kiểm tra này?")) {
      await deleteTest(id);
      fetchTests();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "28px 28px", position: "relative" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Calendar size={13} color="#3B82F6" />
          <span style={{ fontSize: 13, color: "#3B82F6", fontWeight: 500 }}>Học kỳ 1 - 2024</span>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <H1>Quản lý Bài kiểm tra</H1>
            <P style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6, marginBottom: 0 }}>
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

        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
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

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Danh sách bài kiểm tra</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 2fr 1.2fr 1.5fr 1fr",
            padding: "10px 24px",
            borderBottom: "1px solid #F3F4F6",
            background: "#FAFAFA",
          }}>
            {["TÊN BÀI KIỂM TRA", "CHƯƠNG / CHỦ ĐỀ", "THỜI LƯỢNG", "TRẠNG THÁI", "THAO TÁC"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
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
                <P style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{test.exercise?.title}</P>
                <P style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} /> {test.startTime ? format(new Date(test.startTime), "dd/MM HH:mm", { locale: vi }) : 'Chưa xếp lịch'}
                </P>
              </div>
              
              <span style={{ fontSize: 13, color: "#6B7280" }}>{test.topic?.name || test.subject?.name || 'Chung'}</span>
              
              <span style={{ fontSize: 13, fontWeight: 500 }}>{test.timeLimitMinutes} phút</span>
              
              <StatusBadge test={test} />
              
              <div>
                <Button 
                  onClick={(e) => handleDelete(e, test.id)}
                  style={{ background: "#FEE2E2", color: "#EF4444", padding: "6px 10px", height: "auto" }}
                  className="hover:bg-red-200"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}