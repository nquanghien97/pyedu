'use client';

import { useChatStore } from '@/stores/chatStore';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import ChatInput from '@/components/shared/chat/ChatInput';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { notification } from '@/components/notification';

function ChatSesstion({ sessionId }: { sessionId: string }) {
  const { messages, fetchMessages, updateLastMessageContent, addMessage } = useChatStore();
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(sessionId);
  }, [sessionId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      setIsSending(true);

      const formData = new FormData();
      if (content) formData.append('content', content);
      if (file) formData.append('file', file);

      addMessage({
        id: 'temp-' + Date.now(),
        chatSessionId: sessionId,
        role: 'user',
        content,
        attachments: file ? { url: URL.createObjectURL(file), type: file.type, name: file.name } : null,
        createdAt: new Date().toISOString()
      });

      addMessage({
        id: 'temp-bot-' + Date.now(),
        chatSessionId: sessionId,
        role: 'model',
        content: '',
        attachments: null,
        createdAt: new Date().toISOString()
      });

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '{}') continue;
              try {
                const dataObj = JSON.parse(dataStr);
                if (dataObj.text) {
                  updateLastMessageContent(dataObj.text);
                } else if (dataObj.error) {
                  console.error(dataObj.error);
                }
              } catch (e) { }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      notification.error('Đã có lỗi xảy ra khi gửi tin nhắn.');
    } finally {
      setIsSending(false);
      setTimeout(() => fetchMessages(sessionId), 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative h-full">
      <div className="flex-1 overflow-y-auto pt-4 pb-32">
        {messages.length === 0 && !isSending && (
          <div className="flex justify-center items-center h-full text-gray-500">
            Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}
        {isSending && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <div className="px-6 py-2 text-sm text-gray-500 flex gap-2 items-center">
            <Loader2 className="w-4 h-4 animate-spin" /> PyEdu Bot đang suy nghĩ...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
    </div>
  );
}

export default ChatSesstion