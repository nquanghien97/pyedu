'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { H1, H2 } from "@/components/ui/typography";
import { createTest } from "@/services/test";
import { getSubjects } from "@/services/subject";

export default function CreateTestPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    testType: "chapter_test",
    timeLimitMinutes: 45,
    passingScore: 50,
    maxAttempts: 1,
    showResult: "immediately"
  });

  useEffect(() => {
    getSubjects().then((res: { data?: { id: string; name: string }[] }) => {
      if (res.data) setSubjects(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTest(formData);
      if (res.data) {
        router.push("/teacher/assignments/tests");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <H1 className="mb-6">Tạo Bài Kiểm Tra Mới</H1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium mb-2">Tên bài kiểm tra</label>
          <Input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            required 
            placeholder="VD: Kiểm tra giữa kỳ I" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Môn học</label>
          <Select 
            value={formData.subjectId} 
            onValueChange={v => setFormData({...formData, subjectId: v})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn môn học" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại bài</label>
            <Select 
              value={formData.testType} 
              onValueChange={v => setFormData({...formData, testType: v})}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="topic_test">Kiểm tra 15 phút</SelectItem>
                <SelectItem value="chapter_test">Kiểm tra 1 tiết</SelectItem>
                <SelectItem value="final_test">Kiểm tra học kỳ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
            <Input 
              type="number" 
              value={formData.timeLimitMinutes} 
              onChange={e => setFormData({...formData, timeLimitMinutes: Number(e.target.value)})} 
              min={5} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Điểm đạt (%)</label>
            <Input 
              type="number" 
              value={formData.passingScore} 
              onChange={e => setFormData({...formData, passingScore: Number(e.target.value)})} 
              min={0} max={100} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Số lần làm lại tối đa</label>
            <Input 
              type="number" 
              value={formData.maxAttempts} 
              onChange={e => setFormData({...formData, maxAttempts: Number(e.target.value)})} 
              min={1} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo bài kiểm tra"}
          </Button>
        </div>
      </form>
    </div>
  );
}
