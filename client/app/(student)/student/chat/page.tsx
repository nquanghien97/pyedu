import { Bot } from "lucide-react";

export default function ChatWelcomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">PyEdu Bot sẵn sàng hỗ trợ</h2>
      <p className="max-w-md mx-auto text-gray-500">
        Hãy bắt đầu một cuộc trò chuyện mới ở thanh bên trái để hỏi bài tập hoặc yêu cầu gợi ý giải.
      </p>
    </div>
  );
}