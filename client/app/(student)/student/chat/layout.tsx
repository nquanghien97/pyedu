"use client";

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, MessageCircle, Trash2 } from 'lucide-react';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string | undefined;

  const { sessions, fetchSessions, createSession, deleteSession } = useChatStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreate = async () => {
    const newId = await createSession();
    router.push(`/student/chat/${newId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bạn có chắc xoá phiên chat này?')) {
      await deleteSession(id);
      if (sessionId === id) router.push('/student/chat');
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden rounded-xl border shadow-sm">
      <div className="w-72 border-r bg-gray-50 flex flex-col h-full shrink-0">
        <div className="p-4 border-b">
          <Button onClick={handleCreate} className="w-full flex items-center justify-center gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            Đoạn chat mới
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <Link
              key={s.id}
              href={`/student/chat/${s.id}`}
              className={`group flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 transition-colors ${sessionId === s.id ? 'bg-gray-200' : ''}`}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <MessageCircle className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="truncate text-sm font-medium text-gray-700 block">{s.title || "Cuộc trò chuyện mới"}</span>
              </div>
              <button
                onClick={(e) => handleDelete(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Link>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-4">
              Không có cuộc trò chuyện nào
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </div>
    </div>
  );
}
