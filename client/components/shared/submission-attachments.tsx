'use client';

import React from 'react';
import { FileText, Download, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { SubmissionAttachmentEntity } from '@/entity/submission';

interface SubmissionAttachmentsProps {
  attachments: SubmissionAttachmentEntity[];
  onDelete?: (attachmentId: string) => void;
  isDeleting?: boolean;
}

export function SubmissionAttachments({
  attachments,
  onDelete,
  isDeleting = false,
}: SubmissionAttachmentsProps) {
  const formatBytes = (bytes: number | null, decimals = 2) => {
    if (bytes === null || bytes === undefined) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getOcrBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Chờ quét OCR
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
            <Loader2 size={12} className="animate-spin" />
            Đang quét OCR...
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={12} />
            Đã quét OCR
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
            <AlertCircle size={12} />
            Lỗi quét OCR
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{att.fileName}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <span className="text-xs text-slate-400">{formatBytes(att.fileSize)}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-400">
                  {new Date(att.createdAt).toLocaleString('vi-VN')}
                </span>
                {att.ocrStatus && (
                  <>
                    <span className="text-xs text-slate-300">•</span>
                    {getOcrBadge(att.ocrStatus)}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={att.fileName}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors"
              title="Tải xuống file"
            >
              <Download size={16} />
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(att.id)}
                disabled={isDeleting}
                className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors disabled:opacity-50"
                title="Xóa file"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
