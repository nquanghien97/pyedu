'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function FileUploadZone({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 20,
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.doc', '.docx'];

  const validateFiles = (files: FileList | File[]): File[] => {
    setError(null);
    const validFiles: File[] = [];
    const currentFilesCount = selectedFiles.length;

    if (currentFilesCount + files.length > maxFiles) {
      setError(`Bạn chỉ được chọn tối đa ${maxFiles} file.`);
      return [];
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        setError(`Định dạng file không hợp lệ. Chỉ chấp nhận file ${allowedExtensions.join(', ')}.`);
        return [];
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} vượt quá dung lượng cho phép (${maxSizeMB}MB).`);
        return [];
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        const newFiles = [...selectedFiles, ...valid];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0) {
        const newFiles = [...selectedFiles, ...valid];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    setError(null);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/50'
        }`}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
          <UploadCloud size={24} />
        </div>

        <p className="text-sm font-semibold text-slate-700 mb-1">
          Kéo thả file vào đây hoặc <span className="text-blue-500 underline">chọn từ thiết bị</span>
        </p>
        <p className="text-xs text-slate-400">
          Chấp nhận định dạng PDF, Word (.doc, .docx) • Tối đa {maxFiles} file, mỗi file &le; {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3.5 mt-4 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-bold text-slate-400 tracking-wider">DANH SÁCH FILE ĐÃ CHỌN ({selectedFiles.length}/{maxFiles})</p>
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
