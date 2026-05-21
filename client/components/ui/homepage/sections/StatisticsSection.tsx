import { FileText, MessageCircle, School, Users } from "lucide-react";
import AnimatedCounter from "../AnimatedCounter";

export default function StatisticsSection({ bgColor }: { bgColor?: string }) {
  return (
    <section className={`py-8 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Con số <span className="text-primary">ấn tượng</span>
          </h2>
          <p className="text-gray-500 text-lg">
            PyEdu đang phát triển mỗi ngày cùng cộng đồng giáo dục.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              value: 500,
              suffix: "+",
              label: "Người dùng",
              icon: <Users className="w-6 h-6" />,
            },
            {
              value: 1200,
              suffix: "+",
              label: "Bài tập",
              icon: <FileText className="w-6 h-6" />,
            },
            {
              value: 50,
              suffix: "+",
              label: "Lớp học",
              icon: <School className="w-6 h-6" />,
            },
            {
              value: 10000,
              suffix: "+",
              label: "Câu hỏi AI đã trả lời",
              icon: <MessageCircle className="w-6 h-6" />,
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="relative group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-500 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2000 + index * 300}
                />
              </div>
              <div className="text-gray-500 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}