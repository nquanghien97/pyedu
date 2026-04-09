'use client';

import { useState, useRef, useEffect } from "react";
import {
  Search, Bell, HelpCircle, RotateCcw, MoreVertical,
  Mic, Video, Monitor, Phone, Camera, Send, Plus, Image,
  TrendingUp, ChevronRight
} from "lucide-react";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
  bullets?: string[];
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "ai",
    text: "Chào Minh Anh! Mình có thể giúp gì cho bài tập Toán hôm nay không? Mình vừa xem qua đề kiểm tra 15 phút của bạn hôm qua đấy.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "user",
    text: "Chào bạn, mình đang gặp khó khăn ở phần tích phân từng phần. Bạn có thể giải thích lại quy tắc đặt 'u' và 'dv' không?",
    time: "10:32 AM",
  },
  {
    id: 3,
    sender: "ai",
    text: "Tất nhiên rồi! Có một quy tắc rất dễ nhớ là \"Nhất lốc, nhì đa, tam lượng, tứ mũ\". Thứ tự ưu tiên để chọn u sẽ là:",
    time: "10:33 AM",
    bullets: [
      "1. Hàm Logarit (lnx, log)",
      "2. Hàm Đa thức (x, x²+1,...)",
      "3. Hàm Lượng giác (sin, cos)",
      "4. Hàm Mũ (eˣ, 2ˣ)",
    ],
  },
];

const tutors = [
  { id: 1, name: "Thầy Quang", subject: "Toán", bg: "#EFF6FF", color: "#2563EB", initials: "Q" },
  { id: 2, name: "Cô Minh Thư", subject: "Vật Lý", bg: "#FEF2F2", color: "#DC2626", initials: "T" },
  { id: 3, name: "Thầy Hùng", subject: "Hóa", bg: "#F0FDF4", color: "#16A34A", initials: "H" },
];

export default function OnlineTutorPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [selectedTutor, setSelectedTutor] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: input.trim(), time }]);
    setInput("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* Top navbar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #F1F5F9",
        padding: "0 28px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Gia sư trực tuyến</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, padding: "7px 14px" }}>
            <Search size={14} color="#9CA3AF" />
            <input placeholder="Tìm kiếm gia sư, tài liệu..." style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", width: 200 }} />
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell size={16} color="#6B7280" />
            <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <HelpCircle size={16} color="#6B7280" />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-5 p-4 max-w-7xl mx-auto">

        {/* ── LEFT: Chat ── */}
        <div className="col-span-2" style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "calc(100vh - 116px)" }}>

          {/* Chat header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
                <span style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, background: "#22C55E", borderRadius: "50%", border: "1.5px solid #fff" }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Gia sư A</p>
                <p style={{ fontSize: 11, color: "#22C55E", margin: "1px 0 0", fontWeight: 500 }}>Đang online</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}><RotateCcw size={16} /></button>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}><MoreVertical size={16} /></button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                {msg.sender === "ai" && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: "82%" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>
                    <div>
                      <div style={{ background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "4px 14px 14px 14px", padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{msg.text}</p>
                        {msg.bullets && (
                          <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 4 }}>
                            {msg.bullets.map((b, i) => (
                              <li key={i} style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <p style={{ fontSize: 10, color: "#9CA3AF", margin: "4px 0 0 4px" }}>{msg.time}</p>
                    </div>
                  </div>
                )}
                {msg.sender === "user" && (
                  <div style={{ maxWidth: "72%" }}>
                    <div style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", borderRadius: "14px 4px 14px 14px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(59,130,246,0.25)" }}>
                      <p style={{ fontSize: 13, color: "#fff", margin: 0, lineHeight: 1.6 }}>{msg.text}</p>
                    </div>
                    <p style={{ fontSize: 10, color: "#9CA3AF", margin: "4px 4px 0 0", textAlign: "right" }}>{msg.time}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Plus size={16} color="#6B7280" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Nhập câu hỏi của bạn tại đây..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent" }}
            />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
              <Image size={17} />
            </button>
            <button
              onClick={sendMessage}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: input.trim() ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "#E5E7EB",
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default", flexShrink: 0,
                transition: "background 0.2s", boxShadow: input.trim() ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
              }}
            >
              <Send size={15} color={input.trim() ? "#fff" : "#9CA3AF"} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="" style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 116px)", overflowY: "auto" }}>

          {/* Video call */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Video Call 1-1</span>
              <span style={{ fontSize: 10, fontWeight: 800, background: "#FEF2F2", color: "#DC2626", padding: "3px 10px", borderRadius: 999, letterSpacing: "0.05em" }}>TRỰC TIẾP</span>
            </div>

            {/* Video feed */}
            <div style={{ position: "relative", margin: "0 0 0 0", height: 170, background: "linear-gradient(135deg, #1E293B, #334155)", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 8px" }}>👩‍🏫</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>Video đang kết nối...</p>
                </div>
              </div>
              {/* Small self-view */}
              <div style={{
                position: "absolute", top: 10, right: 10,
                width: 56, height: 42, borderRadius: 8,
                background: "linear-gradient(135deg, #374151, #4B5563)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🙋</div>
              {/* Name tag */}
              <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Thầy Quang Đặng</span>
              </div>
            </div>

            {/* Video controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "12px 16px", gap: 8 }}>
              {[
                { icon: <Mic size={16} />, label: "Mic", color: "#6B7280", bg: "#F3F4F6" },
                { icon: <Video size={16} />, label: "Dừng", color: "#6B7280", bg: "#F3F4F6" },
                { icon: <Monitor size={16} />, label: "Chia sẻ", color: "#6B7280", bg: "#F3F4F6" },
                { icon: <Phone size={16} />, label: "Kết thúc", color: "#DC2626", bg: "#FEF2F2" },
              ].map((btn, i) => (
                <button key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  background: btn.bg, border: "none", borderRadius: 10,
                  padding: "8px 4px", cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ color: btn.color }}>{btn.icon}</span>
                  <span style={{ fontSize: 10, color: btn.color, fontWeight: 500 }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ask tutor */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Gửi câu hỏi cho Gia sư</span>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HelpCircle size={13} color="#3B82F6" />
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 14px", lineHeight: 1.5 }}>
              Bạn đang gặp bài khó? Chụp ảnh hoặc nhập câu hỏi để nhận lời giải chi tiết từ đội ngũ chuyên gia.
            </p>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", margin: "0 0 8px" }}>CHỌN GIA SƯ ĐỂ ĐẶT CÂU HỎI:</p>

            {/* Tutor selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", padding: 2 }}>
              {tutors.map((t, i) => (
                <button key={t.id} onClick={() => setSelectedTutor(i)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 12px", borderRadius: 10, border: "none",
                  background: selectedTutor === i ? "#EFF6FF" : "#F8FAFC",
                  outline: selectedTutor === i ? "2px solid #3B82F6" : "1.5px solid #E5E7EB",
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: t.color }}>
                    {t.initials}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{t.subject}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Photo upload */}
            <button style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#F8FAFC", border: "1.5px dashed #D1D5DB", borderRadius: 10,
              padding: "10px 14px", cursor: "pointer", marginBottom: 10,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.background = "#EFF6FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "#F8FAFC"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Camera size={15} color="#6B7280" />
                <span style={{ fontSize: 13, color: "#6B7280" }}>Chụp ảnh đề bài</span>
              </div>
              <ChevronRight size={14} color="#9CA3AF" />
            </button>

            {/* Text input */}
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Hoặc mô tả câu hỏi tại đây..."
              rows={3}
              style={{
                width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10,
                padding: "10px 12px", fontSize: 13, color: "#374151",
                background: "#fff", outline: "none", resize: "none",
                boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5,
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />

            <button style={{
              width: "100%", marginTop: 10, padding: "10px",
              background: questionText.trim() ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "#E5E7EB",
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              color: questionText.trim() ? "#fff" : "#9CA3AF",
              cursor: questionText.trim() ? "pointer" : "default",
              transition: "all 0.2s",
              boxShadow: questionText.trim() ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
            }}>
              Gửi yêu cầu hỗ trợ
            </button>
          </div>

          {/* Today's progress */}
          <div style={{
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            borderRadius: 16, padding: "16px 18px",
            boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", bottom: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={14} color="#fff" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em" }}>TIẾN ĐỘ HÔM NAY</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>3/5 bài tập hoàn thành</p>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 999, background: i <= 3 ? "#fff" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              Bạn đang hoàn thành tốt hơn 85% học sinh cùng khối.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}