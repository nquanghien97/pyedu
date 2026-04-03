import { BotMessageSquare, BrainCircuit, FileText, MessageCircle, Sparkles } from "lucide-react";

export default function AiPoweredSection({ bgColor }: { bgColor?: string }) {
  return (
    <section id="ai-powered" className={`scroll-mt-20 py-8 relative overflow-hidden ${bgColor}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59,130,246,0.3) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#3b82f6]/20 text-[#60a5fa] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <BrainCircuit className="w-4 h-4" />
              Tích hợp AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Sức mạnh trí tuệ nhân tạo{" "}
              <span className="text-[#60a5fa]">trong giáo dục</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              PyEdu tích hợp công nghệ AI tiên tiến (Gemini) giúp tự động hóa
              việc tạo bài tập, hỗ trợ học sinh giải bài, và cá nhân hóa trải
              nghiệm học tập.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Tạo bài tập bằng AI",
                  description:
                    "Tự động tạo bài tập từ chủ đề hoặc tài liệu PDF/ảnh với độ khó tùy chỉnh.",
                },
                {
                  icon: <MessageCircle className="w-5 h-5" />,
                  title: "Chatbot AI hỗ trợ 24/7",
                  description:
                    "Học sinh có thể hỏi đáp, giải bài tập với AI chatbot thông minh bất cứ lúc nào.",
                },
                {
                  icon: <FileText className="w-5 h-5" />,
                  title: "Hỗ trợ LaTeX cho bài toán",
                  description:
                    "Render công thức toán học đẹp mắt với KaTeX, giúp hiển thị bài tập chính xác.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center text-[#60a5fa] shrink-0 group-hover:bg-[#3b82f6] group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Mock UI */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#3b82f6]/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    PyEdu AI Assistant
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-gray-400">
                      Đang hoạt động
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#3b82f6] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    Giải giúp em phương trình bậc 2: x² - 5x + 6 = 0
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-gray-300 text-sm px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] space-y-2">
                    <p>
                      Để giải phương trình{" "}
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#60a5fa]">
                        x² - 5x + 6 = 0
                      </code>
                      , ta dùng công thức delta:
                    </p>
                    <p className="text-[#60a5fa] font-mono text-xs bg-white/5 px-3 py-2 rounded-lg">
                      Δ = b² - 4ac = 25 - 24 = 1 &gt; 0
                    </p>
                    <p>
                      ✅ Phương trình có 2 nghiệm:{" "}
                      <span className="text-emerald-400 font-semibold">
                        x₁ = 2
                      </span>{" "}
                      và{" "}
                      <span className="text-emerald-400 font-semibold">
                        x₂ = 3
                      </span>
                    </p>
                  </div>
                </div>
                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
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