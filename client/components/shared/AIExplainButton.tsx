'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { explainQuestion } from "@/services/test";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIExplainResult } from "@/entity/test";

interface AIExplainButtonProps {
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
}

export function AIExplainButton({ questionText, studentAnswer, correctAnswer }: AIExplainButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<AIExplainResult['explanation'] | null>(null);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    if (explanation) return; // Already fetched
    
    setLoading(true);
    setError("");
    
    try {
      const res = await explainQuestion(questionText, studentAnswer, correctAnswer);
      if (res.data?.explanation) {
        setExplanation(res.data.explanation);
      } else {
        setError("Không thể lấy lời giải thích từ AI.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi gọi AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val && !explanation && !loading) {
        handleExplain();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <Bot size={16} />
          AI Giải thích
          <Sparkles size={12} className="text-amber-500" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <Bot size={20} />
            AI Gia sư giải thích chi tiết
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 mt-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
              <p>AI đang phân tích và giải bài...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}
          
          {explanation && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Các bước giải:</h4>
                <div className="space-y-4">
                  {explanation.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {step.stepNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.content}</p>
                        {step.formula && (
                          <div className="mt-2 bg-white px-3 py-1.5 rounded border border-slate-200 font-mono text-sm inline-block">
                            {step.formula}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-sm text-blue-800 mb-2 flex items-center gap-1">
                    <ChevronRight size={16} /> Kiến thức liên quan
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                    {explanation.relatedKnowledge?.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
                
                {explanation.tips && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <h4 className="font-semibold text-sm text-amber-800 mb-2 flex items-center gap-1">
                      <Sparkles size={16} /> Mẹo giải nhanh
                    </h4>
                    <p className="text-sm text-amber-700 leading-relaxed">{explanation.tips}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
