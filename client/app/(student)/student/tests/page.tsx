'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { getTests } from "@/services/test";
import { Clock, Play } from "lucide-react";
import { TestEntity } from "@/entity/test";

export default function StudentTestsPage() {
  const [tests, setTests] = useState<TestEntity[]>([]);
  const router = useRouter();

  useEffect(() => {
    getTests().then(res => {
      if (res.data) setTests(res.data);
    });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen">
      <H1 className="mb-2">Bài Kiểm Tra</H1>
      <P className="text-slate-500 mb-8">Danh sách các bài kiểm tra được giao cho bạn.</P>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            Hiện chưa có bài kiểm tra nào
          </div>
        )}

        {tests.map(test => (
          <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col transition hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                {test.subject?.name || 'Môn học chung'}
              </div>
              <div className="flex items-center text-slate-500 text-xs font-medium gap-1">
                <Clock size={14} />
                {test.timeLimitMinutes} phút
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight">
              {test.exercise?.title}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 grow">
              Điểm đạt yêu cầu: <span className="font-bold text-slate-700">{test.passingScore}%</span>
            </p>
            
            <Button 
              className="w-full font-semibold"
              onClick={() => router.push(`/student/tests/${test.id}`)}
            >
              <Play size={16} className="mr-2" />
              Làm bài ngay
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}