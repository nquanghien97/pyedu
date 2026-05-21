import { ArrowRight, BarChart3, BotMessageSquare, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../../button";

export default function HeroSection({ bgColor }: { bgColor?: string }) {
  return (
    <section className={`relative pt-24 pb-8 lg:pt-24 overflow-hidden ${bgColor}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/30 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Nền tảng học tập thông minh tích hợp AI
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Nâng tầm trải nghiệm
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] bg-clip-text text-transparent">
                học tập trực tuyến
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            PyEdu kết nối giáo viên và học sinh trên một nền tảng duy nhất.
            Quản lý lớp học, giao bài tập, và hỗ trợ học tập với AI — tất cả
            trong tầm tay bạn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-primary hover:bg-blue-600 text-white px-8 py-3 h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                Bắt đầu ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a
              href="/#features"
            >
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 h-12 text-base font-semibold rounded-xl border-gray-200 text-gray-700 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
              >
                Tìm hiểu thêm
                <ChevronDown className="w-5 h-5 ml-1" />
              </Button>
            </a>
          </div>

          {/* Hero Illustration */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-[#3b82f6]/5 to-[#1d4ed8]/5 rounded-2xl border border-primary/10 p-8 shadow-2xl shadow-primary/5">
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                {/* Mock Dashboard */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 h-7 bg-gray-50 rounded-lg flex items-center px-3">
                    <span className="text-xs text-gray-400">
                      pyedu.vn/dashboard
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    {
                      label: "Lớp học",
                      value: "12",
                      color: "from-[#3b82f6] to-[#1d4ed8]",
                    },
                    {
                      label: "Bài tập",
                      value: "48",
                      color: "from-emerald-500 to-emerald-600",
                    },
                    {
                      label: "Học sinh",
                      value: "256",
                      color: "from-purple-500 to-purple-600",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white`}
                    >
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs opacity-80">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-muted rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-primary/30" />
                  </div>
                  <div className="h-24 bg-muted rounded-xl flex items-center justify-center">
                    <BotMessageSquare className="w-10 h-10 text-primary/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}