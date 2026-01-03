import { NextRequest, NextResponse } from 'next/server';
import { GroqService } from '../services/groq.service';
import { ChatRequest } from '../models/chat.types';

export class ChatController {
    private groqService: GroqService;

    constructor() {
        this.groqService = new GroqService();
    }

    async handleChatRequest(req: NextRequest) {
        try {
            const body: ChatRequest = await req.json();
            const { messages, model } = body;

            if (!messages || !Array.isArray(messages)) {
                return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
            }

            const selectedModel = model || 'llama-3.3-70b-versatile'; // Default
            const response = await this.groqService.generateCompletion(messages, selectedModel);

            return NextResponse.json(response);
        } catch (error: any) {
            return NextResponse.json(
                { error: error?.message || 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    async handleGetModels(req: NextRequest) {
        try {
            const models = await this.groqService.getAvailableModels();
            return NextResponse.json(models);
        } catch (error: any) {
            return NextResponse.json(
                { error: error?.message || 'Failed to fetch models' },
                { status: 500 }
            );
        }
    }
}
