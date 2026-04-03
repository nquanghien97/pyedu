import { School, TrendingUp, UserPlus } from "lucide-react";
import StepCard from "../StepCard";

export default function HowItWorksSection({ bgColor }: { bgColor?: string }) {
  return (
    <section id="how-it-works" className={`scroll-mt-20 py-8 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Bắt đầu chỉ với{" "}
            <span className="text-[#3b82f6]">3 bước đơn giản</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Từ đăng ký đến học tập hiệu quả — mọi thứ được thiết kế để đơn
            giản nhất có thể.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#3b82f6]/20 via-[#3b82f6]/40 to-[#3b82f6]/20" />

          <StepCard
            step={1}
            icon={<UserPlus className="w-8 h-8" />}
            title="Đăng ký tài khoản"
            description="Tạo tài khoản miễn phí với vai trò Giáo viên hoặc Học sinh chỉ trong vài giây."
            delay={0}
          />
          <StepCard
            step={2}
            icon={<School className="w-8 h-8" />}
            title="Tham gia lớp học"
            description="Giáo viên tạo lớp, học sinh tham gia. Kết nối nhanh chóng và tiện lợi."
            delay={200}
          />
          <StepCard
            step={3}
            icon={<TrendingUp className="w-8 h-8" />}
            title="Học tập & theo dõi"
            description="Làm bài tập, nhận phản hồi AI, xem báo cáo tiến độ học tập chi tiết."
            delay={400}
          />
        </div>
      </div>
    </section>
  )
}