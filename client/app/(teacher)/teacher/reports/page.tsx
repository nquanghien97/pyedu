import { Search, Bell, Download, TrendingUp } from "lucide-react";
import { AlertCard, StatCard } from "./Card";
import { BarChart, DonutChart, LineChart } from "./Chart";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-7">
      <div className="max-w-4xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-7">
          <H1>Báo cáo &amp; Phân tích</H1>
          <div className="flex items-center gap-2">
            {/* Search */}
            <InputGroup className="max-w-xs">
              <InputGroupInput
                type="text"
                placeholder="Tìm kiếm dữ liệu..."
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
            {/* Bell */}
            <Button variant="outline" className="relative p-2 rounded-lg">
              <Bell size={16} color="#6B7280" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
            </Button>
            {/* Export */}
            <Button>
              <Download size={14} /> Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-5">
          <StatCard label="Tổng số học sinh" value="156" delta="2.4%" up={true} />
          <StatCard label="Tỷ lệ hoàn thành" value="88.5%" delta="1.5%" up={false} />
          <StatCard label="Điểm trung bình" value="7.8" delta="0.4" up={true} />
          <StatCard label="Tiến bộ học kỳ" value="+12%" delta="3.1%" up={true} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <P className="font-bold text-gray-700">So sánh điểm số giữa các lớp</P>
                  <P className="text-xs text-muted-foreground mt-1">Điểm trung bình học kỳ 1 theo khối lớp</P>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                  <TrendingUp size={13} /> 5.2% so với HK trước
                </div>
              </div>
            </div>
            <BarChart />
          </div>

          {/* Line chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <P className="font-bold text-gray-700">Xu hướng hoàn thành bài tập</P>
                <P className="text-xs text-muted-foreground mt-1">Tỷ lệ nộp bài đúng hạn trong 7 ngày qua</P>
              </div>
              <div className="text-right">
                <P className="text-2xl font-bold">92%</P>
                <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                  <TrendingUp size={12} /> +2.1% tuần này
                </span>
              </div>
            </div>
            <LineChart />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">

          {/* Donut */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <P className="font-bold text-gray-700 mb-4">Phân bổ học lực</P>
            <DonutChart />
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <P className="font-bold text-gray-700">Cảnh báo & Gợi ý</P>
              <Button className="bg-transparent border-none text-blue-500 font-medium cursor-pointer">
                Xem tất cả
              </Button>
            </div>
            <div className="flex flex-col gap-3">
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