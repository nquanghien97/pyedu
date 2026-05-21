import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="PyEdu Logo"
                width={36}
                height={36}
              />
              <span className="text-lg font-bold text-white">
                Py<span className="text-primary">Edu</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng học tập và gia sư trực tuyến thông minh, kết nối giáo
              viên và học sinh với sức mạnh AI.
            </p>
          </div>

          {/* Links - Tính năng */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tính năng</h4>
            <ul className="space-y-2.5">
              {[
                "Quản lý lớp học",
                "Ngân hàng bài tập",
                "AI Chatbot",
                "Báo cáo thống kê",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="/#features"
                    className="text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Hỗ trợ */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2.5">
              {[
                "Hướng dẫn sử dụng",
                "Câu hỏi thường gặp",
                "Liên hệ",
                "Góp ý",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Pháp lý */}
          <div>
            <h4 className="text-white font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2.5">
              {[
                "Điều khoản sử dụng",
                "Chính sách bảo mật",
                "Quyền riêng tư",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} PyEdu. All rights reserved.
            </p>
            <p className="text-sm">
              Made with{" "}
              <span className="text-red-400">♥</span> for education
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}