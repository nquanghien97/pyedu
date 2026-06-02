import { CheckSquare, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { P } from "@/components/ui/typography";

interface ClassProps {
  cls: {
    name: string;
    code: string;
    subject: string;
    gradient: string;
    students: number;
    completion: number;
  }
}

function SubjectIcon({ cls } : ClassProps) {
  if (cls.subject === "TOÁN HỌC") {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <text x="26" y="40" textAnchor="middle" fontSize="38" fontWeight="bold" fill="rgba(255,255,255,0.3)" fontFamily="serif">∑</text>
      </svg>
    );
  }
  if (cls.subject === "TIẾNG ANH") {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
        <ellipse cx="26" cy="26" rx="9" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="6" y1="26" x2="46" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="8" y1="16" x2="44" y2="16" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="8" y1="36" x2="44" y2="36" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      </svg>
    );
  }
  // Vật lý - flask
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8 L20 26 L10 42 L42 42 L32 26 L32 8 Z" fill="rgba(255,255,255,0.15)" />
      <line x1="17" y1="8" x2="35" y2="8"/>
      <circle cx="18" cy="35" r="2" fill="rgba(255,255,255,0.4)" stroke="none"/>
      <circle cx="28" cy="38" r="1.5" fill="rgba(255,255,255,0.4)" stroke="none"/>
      <circle cx="34" cy="33" r="1" fill="rgba(255,255,255,0.4)" stroke="none"/>
    </svg>
  );
}

export default function ClassCard({ cls } : ClassProps) {
  return (
    <div className="bg-white rounded-[18px] border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="h-32 flex items-center justify-center relative" style={{ background: cls.gradient }}>
        <span className="absolute top-3 right-3 bg-white/25 text-white text-[10px] font-bold tracking-[0.08em] px-[10px] py-[3px] rounded-[20px]">
          {cls.subject}
        </span>
        <SubjectIcon cls={cls} />
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title row */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-[16px] text-slate-900">{cls.name}</span>
          <Button className="bg-transparent text-slate-400 p-1 cursor-pointer">
            <MoreHorizontal size={18} />
          </Button>
        </div>
        <P className="text-[12px] text-slate-400 mb-4">Mã lớp: {cls.code}</P>

        {/* Stats */}
        <div className="flex gap-5 mb-4">
          <div className="flex items-center gap-1.5">
            <Users size={16} color="#3B82F6" />
            <div>
              <P className="text-[11px] text-slate-400 leading-[1.2]">Sĩ số</P>
              <P className="text-[14px] font-semibold text-slate-900">{cls.students} Học sinh</P>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckSquare size={16} color="#22C55E" />
            <div>
              <P className="text-[11px] text-slate-400 leading-[1.2]">Hoàn thành</P>
              <P className="text-[14px] font-semibold text-slate-900">{cls.completion}%</P>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-[12px] text-slate-500">Tiến độ bài tập</span>
            <span className="text-[12px] font-semibold text-blue-500">{cls.completion}%</span>
          </div>
          <div className="h-2 bg-sky-50 rounded-[99px] overflow-hidden">
            <div className="h-full rounded-[99px] bg-linear-to-r from-blue-500 to-sky-400 transition-[width]" style={{ width: `${cls.completion}%` }} />
          </div>
        </div>

        {/* Link */}
        <div className="border-t border-slate-200 pt-4 text-right">
          <Button className="bg-transparent text-blue-500 text-[13px] font-semibold cursor-pointer">
            Chi tiết lớp học
          </Button>
        </div>
      </div>
    </div>
  );
}
