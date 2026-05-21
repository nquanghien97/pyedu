import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Bot } from 'lucide-react';
import { ChatMessage } from '@/services/chat';
import { P } from "@/components/ui/typography";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 px-6 py-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot className="w-5 h-5" />
          </div>
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-5 py-3 text-sm shadow-sm ${
          isUser 
            ? 'bg-violet-100 text-violet-900 rounded-tr-sm max-w-sm inline-block' 
            : 'bg-white border border-gray-100 text-gray-800 leading-relaxed overflow-x-auto print-exact'
        }`}>
          {message.attachments && message.attachments.type?.startsWith('image/') && (
            <div className="mb-3">
              <img src={message.attachments.url} alt="Attached" className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200" />
            </div>
          )}
          
          {isUser ? (
            <P className="whitespace-pre-wrap">{message.content}</P>
          ) : (
            <div className="pyedu-markdown text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({node, ...props}) => <P className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto my-2 border text-sm" {...props} />,
                  code: ({node, ...props}) => <code className="bg-gray-100 text-rose-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {isUser && (
           <div className="text-right text-xs text-gray-400 mt-1.5 pr-1">BẠN</div>
        )}
      </div>
    </div>
  );
}
