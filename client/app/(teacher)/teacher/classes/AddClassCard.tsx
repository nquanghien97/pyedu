import { Plus } from "lucide-react";
import { P } from "@/components/ui/typography";

export default function AddClassCard() {
    return (
      <div style={{
        background: "#FAFAFA",
        borderRadius: 18,
        border: "2px dashed #D1D5DB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        gap: 12,
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "#3B82F6";
          e.currentTarget.style.background = "#EFF6FF";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "#D1D5DB";
          e.currentTarget.style.background = "#FAFAFA";
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Plus size={22} color="#9CA3AF" />
        </div>
        <div style={{ textAlign: "center" }}>
          <P style={{ fontWeight: 700, fontSize: 15, color: "#374151", marginBottom: 6 }}>Thêm lớp học mới</P>
          <P style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>
            Bắt đầu quản lý một lớp<br />học hoặc môn học mới
          </P>
        </div>
      </div>
    );
  }