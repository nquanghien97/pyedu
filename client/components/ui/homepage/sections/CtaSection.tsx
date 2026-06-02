import Link from "next/link";
import { Button } from "../../button";
import { ArrowRight } from "lucide-react";

export default function CtaSection({ bgColor }: { bgColor?: string }) {
  return (
    <section className={`py-8 relative overflow-hidden ${bgColor}`}>
      <div className="absolute inset-0 bg-linear-to-r from-[#3b82f6] to-[#1d4ed8]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Sẵn sàng nâng tầm trải nghiệm học tập?
        </h2>
        <p className="text-blue-100 text-lg mb-8 mx-auto">
          Tham gia PyEdu ngay hôm nay để trải nghiệm nền tảng học tập thông
          minh, hiện đại, và hoàn toàn miễn phí.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-50 px-10 py-3 h-13 text-base font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Bắt đầu miễn phí
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}