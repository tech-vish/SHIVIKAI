'use client';

import React from 'react';
import { Plus, MessageSquare, Trash2, X, PanelLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from './ThemeContext';

interface ChatSession {
  id: string;
  title: string;
  date: number; // Timestamp
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  sessions,
  // ... props
  currentSessionId,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={clsx(
          "fixed md:relative inset-y-0 left-0 z-40 bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0",
          isOpen ? "translate-x-0 w-64 opacity-100" : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 w-64"
        )}
      >
        {/* Header / New Chat */}
        <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md group overflow-hidden"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform shrink-0" />
            <span className="font-medium whitespace-nowrap">New Chat</span>
          </button>
          
          <button 
            onClick={onClose}
            className="p-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
            title="Close Sidebar"
          >
            <PanelLeft className="w-5 h-5 hidden md:block" />
            <X className="w-5 h-5 md:hidden" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
           {sessions.length === 0 ? (
             <div className="text-center py-10 px-4">
               <p className="text-sm text-[rgb(var(--muted-foreground))]">No chat history yet.</p>
               <p className="text-xs text-[rgb(var(--muted-foreground))/0.7] mt-1">Start a new conversation!</p>
             </div>
           ) : (
             sessions.map((session) => (
               <div
                 key={session.id}
                 onClick={() => onSelectSession(session.id)}
                 className={clsx(
                   "group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                   currentSessionId === session.id
                     ? "bg-[rgb(var(--muted))] border-[rgb(var(--border))] shadow-sm"
                     : "hover:bg-[rgb(var(--muted))/0.5]"
                 )}
               >
                 <MessageSquare className={clsx(
                   "w-4 h-4 shrink-0",
                   currentSessionId === session.id ? "text-[rgb(var(--primary))]" : "text-[rgb(var(--muted-foreground))]"
                 )} />
                 
                 <div className="flex-1 min-w-0">
                   <h3 className={clsx(
                     "text-sm font-medium truncate pr-6",
                     currentSessionId === session.id ? "text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--foreground))]"
                   )}>
                     {session.title || 'Untitled Chat'}
                   </h3>
                   <p className="text-[10px] text-[rgb(var(--muted-foreground))/0.6]">
                     {new Date(session.date).toLocaleDateString()}
                   </p>
                 </div>

                 <button
                   onClick={(e) => onDeleteSession(session.id, e)}
                   className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-[rgb(var(--muted-foreground))] hover:text-red-500 rounded transition-all"
                   title="Delete Chat"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgb(var(--border))]">
           <div className="text-xs text-[rgb(var(--muted-foreground))] text-center">
             Saved to LocalStorage
           </div>
        </div>
      </div>
    </>
  );
}
