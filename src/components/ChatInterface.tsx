'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, RotateCcw, Menu, PanelLeft } from 'lucide-react'; 
import { ChatMessage } from '@/backend/models/chat.types';
import axios from 'axios';
import { MessageBubble } from './MessageBubble';
import { ModelSelector } from './ModelSelector';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeContext';
import Image from 'next/image';
import { Sidebar } from './Sidebar'; 

interface ChatSession {
  id: string;
  title: string;
  date: number;
  messages: ChatMessage[];
}

export function ChatInterface() {
  const { theme } = useTheme();
  
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('llama-3.3-70b-versatile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get current messages
  const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]); 

  // Load from LocalStorage on Mount
  useEffect(() => {
    const stored = localStorage.getItem('shivikai_logs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
            setCurrentSessionId(parsed[0].id);
        } else {
            createNewChat();
        }
      } catch (e) {
        console.error("Failed to parse chat history", e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('shivikai_logs', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      date: Date.now(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    if (window.innerWidth < 768) {
       setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('shivikai_logs', JSON.stringify(newSessions)); 
    
    if (currentSessionId === id) {
        if (newSessions.length > 0) {
            setCurrentSessionId(newSessions[0].id);
        } else {
            createNewChat(); 
        }
    }
  };

  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
      setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
              let title = session.title;
              if (session.messages.length === 0 && newMessages.length > 0) {
                  const firstMsg = newMessages[0];
                  if (firstMsg.role === 'user') {
                      title = firstMsg.content.slice(0, 30) + (firstMsg.content.length > 30 ? '...' : '');
                  }
              }
              return { ...session, title, messages: newMessages };
          }
          return session;
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...currentMessages, userMessage];
    
    updateCurrentSessionMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: updatedMessages,
        model: currentModel,
      });
      const assistantMessage = response.data.choices[0].message;
      updateCurrentSessionMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      updateCurrentSessionMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
      if (!currentSessionId) return;
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [] } : s));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--background))] transition-colors duration-300">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={createNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => { setCurrentSessionId(id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
        onDeleteSession={deleteSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full min-w-0">
          
          {/* Header */}
          <header className="flex-none px-4 border-b border-[rgb(var(--border))] glass sticky top-0 z-20">
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -ml-2 mr-1 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] md:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    {!isSidebarOpen && (
                        <button
                             onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 mr-1 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hidden md:block"
                            title="Open Sidebar"
                        >
                             <PanelLeft className="w-6 h-6" />
                        </button>
                    )}

                    <div className="relative h-22 w-48 ml-2">
                         <Image 
                          key={theme} 
                          src={theme === 'dark' ? "/logo.png" : "/logo_black.png"} 
                          alt="Shivikai" 
                          fill
                          className="object-contain object-left scale-150 origin-left" 
                          priority
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ModelSelector currentModel={currentModel} onModelChange={setCurrentModel} />
                    <div className="w-px h-6 bg-[rgb(var(--border))] mx-1"></div>
                    <ThemeToggle />
                </div>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {currentMessages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-[rgb(var(--muted-foreground))]">
                <div className="relative w-24 h-24 mb-6 animate-fade-in">
                    <Image 
                        src="/logo_small.png" 
                        alt="Shivikai Logo" 
                        fill
                        className="object-contain"
                    />
                </div>
                <h2 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-3 tracking-tight">Welcome to Shivikai</h2>
                <p className="max-w-md text-lg leading-relaxed opacity-80">
                    Experience next-generation AI powered by ShivikAI&apos;s LPU™ Inference Engine.
                </p>
              </div>
            ) : (
              <div className="flex flex-col pb-40 pt-6">
                {currentMessages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                  <div className="w-full py-8 flex items-center justify-center">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                      </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-none pb-8 pt-4 px-4 bg-gradient-to-t from-[rgb(var(--background))] via-[rgb(var(--background))] to-transparent">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative group">
                <div className={`
                    relative flex items-center 
                    bg-[rgb(var(--muted))] 
                    rounded-3xl border border-[rgb(var(--border))]
                    focus-within:border-[rgb(var(--primary))] 
                    focus-within:ring-2 focus-within:ring-[rgb(var(--primary))/0.1]
                    shadow-lg transition-all duration-300
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-[rgb(var(--foreground))/0.2]'}
                `}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-6 py-4 outline-none text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] disabled:cursor-not-allowed text-base"
                    />
                    <div className="pr-3 flex items-center gap-2">
                         {currentMessages.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-2 text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Clear Chat"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`
                                p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center
                                ${!input.trim() || isLoading 
                                    ? 'bg-[rgb(var(--muted-foreground))/0.2] text-[rgb(var(--muted-foreground))]' 
                                    : 'bg-[rgb(var(--primary))] text-white shadow-md hover:scale-105 active:scale-95'
                                }
                            `}
                        >
                            <SendHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
                    Powered by <span className="text-[rgb(var(--foreground))]">ShivikAI</span> • AI can make mistakes.
                </p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
