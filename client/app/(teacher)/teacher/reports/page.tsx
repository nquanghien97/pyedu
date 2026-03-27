import { Search, Bell, Download, TrendingUp } from "lucide-react";
import { AlertCard, StatCard } from "./Card";
import { BarChart, DonutChart, LineChart } from "./Chart";

export default function ReportsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "28px 28px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Báo cáo &amp; Phân tích</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Search size={14} color="#9CA3AF" />
              <input placeholder="Tìm kiếm dữ liệu..." style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", width: 180 }} />
            </div>
            {/* Bell */}
            <button style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <Bell size={16} color="#6B7280" />
              <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "1.5px solid #fff" }} />
            </button>
            {/* Export */}
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              border: "none", borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
            }}>
              <Download size={14} /> Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <StatCard label="Tổng số học sinh" value="156"    delta="2.4%"  up={true} />
          <StatCard label="Tỷ lệ hoàn thành" value="88.5%" delta="1.5%"  up={false} />
          <StatCard label="Điểm trung bình"   value="7.8"   delta="0.4"   up={true} />
          <StatCard label="Tiến bộ học kỳ"    value="+12%"  delta="3.1%"  up={true} />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Bar chart */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>So sánh điểm số giữa các lớp</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>Điểm trung bình học kỳ 1 theo khối lớp</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A", fontSize: 12, fontWeight: 600 }}>
                  <TrendingUp size={13} /> 5.2% so với HK trước
                </div>
              </div>
            </div>
            <BarChart />
          </div>

          {/* Line chart */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Xu hướng hoàn thành bài tập</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>Tỷ lệ nộp bài đúng hạn trong 7 ngày qua</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>92%</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                  <TrendingUp size={12} /> +2.1% tuần này
                </span>
              </div>
            </div>
            <LineChart />
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>

          {/* Donut */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 18px" }}>Phân bổ học lực</p>
            <DonutChart />
          </div>

          {/* Alerts */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Cảnh báo &amp; Gợi ý</p>
              <button style={{ background: "none", border: "none", fontSize: 13, color: "#3B82F6", fontWeight: 500, cursor: "pointer" }}>Xem tất cả</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AlertCard
                type="warning"
                title="Giảm sút phong độ: Lớp 10B"
                tag="ƯU TIÊN CAO"
                tagColor="red"
                desc="Điểm trung bình bài kiểm tra 15 phút tuần này thấp hơn 12% so với kỳ vọng. Nên có bài ôn tập bổ sung."
              />
              <AlertCard
                type="success"
                title="Thành tích nổi bật: Lớp 11C"
                tag="TIN VUI"
                tagColor="green"
                desc="100% học sinh hoàn thành bài tập dự án sớm 2 ngày. Có thể nâng cao độ khó cho chương tiếp theo."
              />
              <AlertCard
                type="info"
                title="Cập nhật giáo trình mới"
                tag="XEM NGAY"
                tagColor="blue"
                desc="Hệ thống đã cập nhật bộ đề ôn tập thi THPT Quốc gia 2024. Hãy gửi cho học sinh khối 12."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}