'use client';

import { ChatMessage } from '@/backend/models/chat.types';
import { User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={clsx(
        'group w-full border-b border-transparent',
        isUser ? 'bg-transparent' : 'bg-[rgb(var(--muted))/0.5]'
      )}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] p-4 flex lg:px-0 m-auto">
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className={`
            relative h-8 w-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden
            ${isUser ? 'bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))]' : 'bg-transparent'}
          `}>
            {isUser ? (
              <User className="h-5 w-5" />
            ) : (
              <div className="relative w-full h-full">
                  <Image 
                    src="/logo_small.png" 
                    alt="AI" 
                    fill 
                    className="object-cover"
                  />
              </div>
            )}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="font-bold text-sm mb-1 opacity-90 text-[rgb(var(--foreground))]">
            {isUser ? 'You' : 'Shivikai'}
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-7">
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
                  code: ({node, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !children?.toString().includes('\n');
                    
                    return isInline ? (
                      <code className="bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-[rgb(var(--primary))] font-medium" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="bg-transparent text-gray-100 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({node, ...props}) => <pre className="bg-slate-950 text-gray-100 p-4 rounded-xl overflow-x-auto mb-4 border border-slate-800 shadow-sm" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
