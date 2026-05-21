import { Bot } from "lucide-react";
import { H2, P } from "@/components/ui/typography";

export default function ChatWelcomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-10 h-10" />
      </div>
      <H2 className="mb-2">PyEdu Bot sẵn sàng hỗ trợ</H2>
      <P className="max-w-md mx-auto text-gray-500">
        Hãy bắt đầu một cuộc trò chuyện mới ở thanh bên trái để hỏi bài tập hoặc yêu cầu gợi ý giải.
      </P>
    </div>
  );
}