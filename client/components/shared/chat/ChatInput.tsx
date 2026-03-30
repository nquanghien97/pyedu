import { useState, useRef } from 'react';
import { ImageIcon, SendIcon, X, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, file?: File) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px"; // max 120px height
    setContent(el.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        alert("Chỉ hỗ trợ file hình ảnh trong phiên bản hiện tại");
        return;
      }
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = () => {
    if ((!content.trim() && !file) || isLoading) return;
    onSendMessage(content.trim(), file || undefined);
    setContent('');
    removeFile();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white/90 backdrop-blur-sm border-t border-gray-100">
      <div className="max-w-3xl mx-auto">
        {previewUrl && (
          <div className="mb-2 inline-block relative border border-gray-200 rounded-lg p-1 bg-gray-50">
            <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded object-contain" />
            <button 
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full p-0.5 hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-blue-600 transition-colors shrink-0 p-2 rounded-full hover:bg-blue-50"
            disabled={isLoading}
          >
            <ImageIcon className="w-5 h-5"/>
          </button>
          
          <textarea
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi hoặc bài toán cần giải..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none pt-2 pb-2 min-h-[40px] max-h-[120px]"
            disabled={isLoading}
          />
          
          <button 
            onClick={submit}
            disabled={(!content.trim() && !file) || isLoading}
            className="w-10 h-10 mb-0.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors shadow-sm shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5 -ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
