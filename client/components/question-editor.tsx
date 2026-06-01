'use client';

import { Controller, useForm } from 'react-hook-form';
import { QuestionType, QUESTION_TYPE_LABELS } from '@/entity/exercise';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { P } from '@/components/ui/typography';
import { MathText } from '@/components/ui/math-text';
import { GripVerticalIcon, TrashIcon } from 'lucide-react';

// ---------- Default content per question type ----------

export function getContentForType(type: QuestionType): Record<string, unknown> {
  switch (type) {
    case 'multiple_choice': return { options: ['', '', '', ''], correctAnswer: 0 };
    case 'multiple_select': return { options: ['', '', '', ''], correctAnswers: [] };
    case 'true_false': return { correctAnswer: true };
    case 'fill_blank': return { blanks: [''] };
    case 'essay': return { maxWords: 500 };
    case 'matching': return { pairs: [{ left: '', right: '' }] };
    case 'ordering': return { items: [''] };
    default: return {};
  }
}

// ---------- Shared form value type for questions ----------

export interface QuestionFormValues {
  questions: {
    questionText: string;
    questionType: string;
    points: number;
    content: Record<string, unknown>;
    explanation: string;
    hints: string[];
    aiGradingEnabled: boolean;
  }[];
}

// ---------- Question Editor ----------

interface QuestionEditorProps {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: ReturnType<typeof useForm<any>>['control'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: ReturnType<typeof useForm<any>>['register'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: ReturnType<typeof useForm<any>>['formState']['errors'];
  questionType: QuestionType;
  questionContent: Record<string, unknown>;
  onRemove: () => void;
  onTypeChange: (type: QuestionType) => void;
  onContentChange: (content: Record<string, unknown>) => void;
}

export function QuestionEditor({
  index,
  control,
  register,
  errors,
  questionType,
  questionContent,
  onRemove,
  onTypeChange,
  onContentChange,
}: QuestionEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionErrors = (errors as any).questions?.[index];

  return (
    <div className="border rounded-lg p-4 bg-gray-50/50">
      <div className="flex items-center gap-3 mb-3">
        <GripVerticalIcon className="w-4 h-4 text-gray-300 cursor-grab" />
        <span className="text-sm font-semibold text-gray-500">Câu {index + 1}</span>

        <select
          className="text-sm border rounded px-2 py-1"
          value={questionType}
          onChange={e => onTypeChange(e.target.value as QuestionType)}
        >
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 ml-auto">
          <Input type="number" {...register(`questions.${index}.points`)} className="w-20 h-8" min={0}/>
          <span className="text-xs text-gray-400">điểm</span>
        </div>

        <Button type="button" size="sm" variant="ghost" onClick={onRemove} className="text-red-400 hover:text-red-600 ml-2">
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-3">
        <Controller
          control={control}
          name={`questions.${index}.questionText`}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px] resize-y"
                rows={2}
              />
              {field.value && field.value.includes('$') && (
                <div className="mt-1.5 p-2 bg-blue-50/70 rounded-md border border-blue-100">
                  <span className="text-xs text-blue-400 font-medium block mb-0.5">XEM TRƯỚC</span>
                  <MathText text={field.value} as="div" className="text-sm text-gray-800" />
                </div>
              )}
            </>
          )}
        />
        {questionErrors?.questionText && (
          <P className="text-xs text-red-500 mt-0.5">{questionErrors.questionText.message}</P>
        )}
      </div>

      {/* Question-type specific content */}
      <QuestionContentEditor
        type={questionType}
        content={questionContent}
        onChange={onContentChange}
      />

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-500 block mb-1">Giải thích (tùy chọn)</label>
        <Controller
          control={control}
          name={`questions.${index}.explanation`}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                placeholder="Giải thích đáp án..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[40px] resize-y"
                rows={1}
              />
              {field.value && field.value.includes('$') && (
                <div className="mt-1.5 p-2 bg-green-50/70 rounded-md border border-green-100">
                  <span className="text-xs text-green-400 font-medium block mb-0.5">XEM TRƯỚC</span>
                  <MathText text={field.value} as="div" className="text-sm text-green-800" />
                </div>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}

// ---------- Question Content Editor ----------

export function QuestionContentEditor({
  type,
  content,
  onChange,
}: {
  type: QuestionType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}) {
  switch (type) {
    case 'multiple_choice':
    case 'multiple_select': {
      const options = (content.options as string[]) || ['', '', '', ''];
      const correctAnswer = content.correctAnswer as number;
      const correctAnswers = (content.correctAnswers as number[]) || [];

      return (
        <div className="space-y-2">
          {options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              {type === 'multiple_choice' ? (
                <Input
                  type="radio"
                  name={`mc-correct-${type}`}
                  checked={correctAnswer === i}
                  onChange={() => onChange({ ...content, correctAnswer: i })}
                  className="w-4 h-4"
                />
              ) : (
                <Input
                  type="checkbox"
                  checked={correctAnswers.includes(i)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...correctAnswers, i]
                      : correctAnswers.filter((x: number) => x !== i);
                    onChange({ ...content, correctAnswers: next });
                  }}
                  className="w-4 h-4"
                />
              )}
              <Input
                value={opt}
                onChange={e => {
                  const next = [...options];
                  next[i] = e.target.value;
                  onChange({ ...content, options: next });
                }}
                placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                className="flex-1 h-8 text-sm"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => {
                    const next = options.filter((_: string, j: number) => j !== i);
                    onChange({ ...content, options: next });
                  }}
                >
                  <TrashIcon className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange({ ...content, options: [...options, ''] })}
            className="text-xs"
          >
            + Thêm đáp án
          </Button>
        </div>
      );
    }
    case 'true_false': {
      const correctAnswer = content.correctAnswer as boolean;
      return (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Input type="radio" checked={correctAnswer === true} onChange={() => onChange({ correctAnswer: true })} className="w-4 h-4" />
            Đúng
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Input type="radio" checked={correctAnswer === false} onChange={() => onChange({ correctAnswer: false })} className="w-4 h-4" />
            Sai
          </label>
        </div>
      );
    }
    case 'fill_blank': {
      const blanks = (content.blanks as string[]) || [''];
      return (
        <div className="space-y-2">
          <P className="text-xs text-gray-500">Nhập đáp án cho các chỗ trống (dùng ___ trong nội dung câu hỏi)</P>
          {blanks.map((blank: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{i + 1}.</span>
              <Input
                value={blank}
                onChange={e => {
                  const next = [...blanks];
                  next[i] = e.target.value;
                  onChange({ ...content, blanks: next });
                }}
                placeholder="Đáp án"
                className="flex-1 h-8 text-sm"
              />
            </div>
          ))}
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...content, blanks: [...blanks, ''] })} className="text-xs">
            + Thêm chỗ trống
          </Button>
        </div>
      );
    }
    case 'essay': {
      const maxWords = (content.maxWords as number) || 500;
      const sampleAnswer = (content.sampleAnswer as string) || '';
      const aiGradingEnabled = (content.aiGradingEnabled as boolean) ?? false;

      return (
        <div className="space-y-4 bg-gray-50 p-3 rounded border">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Giới hạn từ:</label>
              <Input
                type="number"
                value={maxWords}
                onChange={(e) => onChange({ ...content, maxWords: Number(e.target.value) })}
                className="w-20 h-8 text-sm bg-white"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Input
                type="checkbox"
                checked={aiGradingEnabled}
                onChange={(e) => onChange({ ...content, aiGradingEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-xs font-medium text-gray-600">Bật chấm điểm AI</span>
            </label>
          </div>
          {aiGradingEnabled && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Đáp án mẫu (Dùng để AI chấm điểm)</label>
              <textarea
                value={sampleAnswer}
                onChange={(e) => onChange({ ...content, sampleAnswer: e.target.value })}
                placeholder="Nhập đáp án mẫu để AI so sánh..."
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px] bg-white resize-y"
                rows={2}
              />
            </div>
          )}
        </div>
      );
    }
    default:
      return <P className="text-xs text-gray-400">Cấu hình nội dung cho loại câu hỏi này...</P>;
  }
}
