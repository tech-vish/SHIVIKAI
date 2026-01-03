'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { GroqModel } from '@/backend/models/chat.types';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<GroqModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fallback models if API fails
  const fallbackModels = [
    { id: 'llama-3.3-70b-versatile', object: 'model' as const, created: 0, owned_by: 'groq' },
    { id: 'llama-3.1-8b-instant', object: 'model' as const, created: 0, owned_by: 'groq' },
    { id: 'mixtral-8x7b-32768', object: 'model' as const, created: 0, owned_by: 'groq' },
    { id: 'gemma2-9b-it', object: 'model' as const, created: 0, owned_by: 'groq' },
  ];

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/chat'); // GET request to list models
        if (response.data && Array.isArray(response.data)) {
           setModels(response.data);
        } else {
           setModels(fallbackModels);
        }
      } catch (error) {
        console.error("Failed to fetch models, using fallback", error);
        setModels(fallbackModels);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))] text-[rgb(var(--foreground))] transition-all border border-transparent hover:border-[rgb(var(--border))]"
      >
        <span>{models.find(m => m.id === currentModel)?.id || currentModel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl shadow-2xl bg-[rgb(var(--popover))] border border-[rgb(var(--border))] ring-1 ring-black/5 p-1 animate-in fade-in zoom-in-95 duration-100">
          {loading ? (
             <div className="p-4 text-sm text-center text-[rgb(var(--muted-foreground))]">Loading models...</div>
          ) : (
            models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors mb-0.5 ${
                  currentModel === model.id
                    ? 'bg-[rgb(var(--primary))/0.1] text-[rgb(var(--primary))] font-medium'
                    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))]'
                }`}
              >
                <div className="truncate">{model.id}</div>
                <div className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wider mt-0.5">{model.owned_by}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
