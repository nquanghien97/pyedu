'use client';

import { BarChart3, BookOpenIcon, BotMessageSquare, FileText } from "lucide-react";
import FeatureCard from "../FeatureCard";

export default function FeaturesSection({ bgColor }: { bgColor?: string }) {
  return (
    <section id="features" className={`scroll-mt-20 py-8 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mọi thứ bạn cần cho{" "}
            <span className="text-primary">việc học</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            PyEdu cung cấp bộ công cụ toàn diện giúp giáo viên và học sinh
            tối ưu hóa quá trình dạy và học.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<BookOpenIcon className="w-6 h-6" />}
            title="Quản lý lớp & môn học"
            description="Tạo lớp, thêm môn học, quản lý danh sách học sinh dễ dàng với giao diện trực quan."
            delay={0}
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Ngân hàng bài tập"
            description="Tạo, giao, và chấm bài tập tự động. Hỗ trợ bài kiểm tra trực tuyến."
            delay={100}
          />
          <FeatureCard
            icon={<BotMessageSquare className="w-6 h-6" />}
            title="AI Chatbot hỗ trợ"
            description="Học sinh hỏi đáp, giải bài tập với trợ lý AI thông minh, hỗ trợ 24/7."
            delay={200}
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Báo cáo & thống kê"
            description="Theo dõi tiến độ học tập, phân tích kết quả chi tiết với biểu đồ trực quan."
            delay={300}
          />
        </div>
      </div>
    </section>
  )
}
