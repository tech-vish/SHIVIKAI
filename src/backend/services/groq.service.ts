import axios from 'axios';
import { ChatMessage, GroqCompletionResponse, GroqModel } from '../models/chat.types';

export class GroqService {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.groq.com/openai/v1';

    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
        console.log('--- GroqService Debug ---');
        console.log('Env var exists:', 'GROQ_API_KEY' in process.env);
        console.log('API Key length:', this.apiKey.length);
        console.log('First 4 chars:', this.apiKey.substring(0, 4));
        console.log('-------------------------');

        if (!this.apiKey) {
            console.error('GROQ_API_KEY is not defined in environment variables');
        }
    }

    async generateCompletion(messages: ChatMessage[], model: string): Promise<GroqCompletionResponse> {
        try {
            // Log payload for debugging
            console.log('Sending request to Groq:', { model, messageCount: messages.length });

            const response = await axios.post<GroqCompletionResponse>(
                `${this.baseUrl}/chat/completions`,
                {
                    messages,
                    model,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('Error calling Groq API:', error.message);
            if (error.response) {
                console.error('Groq API Error Response:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }

    async getAvailableModels(): Promise<GroqModel[]> {
        try {
            const response = await axios.get<{ data: GroqModel[] }>(
                `${this.baseUrl}/models`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Filter out non-chat models (e.g., guardrails, whisper)
            return response.data.data.filter(model =>
                !model.id.includes('guard') &&
                !model.id.includes('whisper') &&
                !model.id.includes('vision') // implementation typically text-only for now
            );
        } catch (error) {
            console.error('Error fetching models:', error);
            // Fallback or rethrow
            return [];
        }
    }
}
