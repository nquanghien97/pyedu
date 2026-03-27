'use client';

import { ImageIcon, PaperclipIcon, SendIcon } from 'lucide-react';
import { useState } from 'react'

function InlineFormula({ children }: { children: React.ReactNode }) {
  return <span className="font-serif italic text-gray-800">{children}</span>;
}

function MathBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-2xl bg-gray-100 px-8 py-5 flex items-center justify-center">
      <span className="font-serif text-lg text-gray-700 tracking-wide">{children}</span>
    </div>
  );
}

function AssistantMessage() {
  return (
    <div className="flex gap-3 px-6 py-4">
      <div className="shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <span className="text-[#1a73e8] text-sm font-bold">Σ</span>
        </div>
      </div>
      <div className="flex-1 max-w-2xl">
        <div className="text-xs font-semibold text-[#1a73e8] mb-2 tracking-widest uppercase">PyChat Math-V2</div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 text-gray-700 text-sm leading-7">
          <p className="mb-3">
            Để giải bài toán này, chúng ta sẽ sử dụng phương pháp{" "}
            <strong className="text-gray-900">từng phần</strong> (Integration by Parts). Công thức tổng quát là:
          </p>

          <MathBlock>∫ u dv = uv - ∫ v du</MathBlock>

          <p className="mb-3 font-medium text-gray-800">Bước 1: Chọn các thành phần đặt:</p>
          <div className="border-l-4 border-[#1a73e8] pl-4 mb-4 space-y-2">
            <p>
              Đặt <InlineFormula>u = x ⇒ du = dx</InlineFormula>
            </p>
            <p>
              Đặt <InlineFormula>dv = e^x dx ⇒ v = e^x</InlineFormula>
            </p>
          </div>

          <p className="mb-3 font-medium text-gray-800">Bước 2: Áp dụng vào công thức:</p>

          <div className="my-4 rounded-2xl bg-gray-100 px-8 py-5 space-y-3">
            <div className="text-center font-serif text-lg text-gray-700">
              ∫ x e^x dx = x e^x - ∫ e^x dx
            </div>
            <div className="text-center text-gray-400 text-xl">↓</div>
            <div className="text-center font-serif text-xl font-bold text-violet-600">
              ∫ x e^x dx = x e^x - e^x + C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const [input, setInput] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 6 * 24) + "px"; // 6 dòng
    setInput(el.value);
  };
  return (
    <div className="flex w-full bg-gray-50 font-sans" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Main */}
      <div className="flex-1 h-[calc(100vh-68px)] flex flex-col min-w-0 relative">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto py-4 pb-32">
          {/* User message */}
          <div className="flex justify-end px-6 py-3">
            <div className="max-w-sm">
              <div className="bg-violet-100 text-violet-900 rounded-2xl rounded-tr-sm px-5 py-3 text-sm font-medium shadow-sm">
                Làm thế nào để giải nguyên hàm của x * e^x?
              </div>
              <div className="text-right text-[10px] text-gray-400 mt-1.5 pr-1">
                BẠN • VỪAXONG
              </div>
            </div>
          </div>

          {/* Assistant message */}
          <AssistantMessage />
        </div>

        {/* Input bar - fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <button className="text-gray-400 hover:text-violet-600 transition-colors shrink-0">
                <ImageIcon />
              </button>
              <button className="text-gray-400 hover:text-violet-600 transition-colors shrink-0">
                <PaperclipIcon />
              </button>
              <textarea
                value={input}
                onChange={handleInput}
                placeholder="Nhập câu hỏi toán học của bạn tại đây..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              <button className="w-8 h-8 bg-violet-700 hover:bg-violet-800 rounded-xl flex items-center justify-center text-white transition-colors shadow-md shrink-0">
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat