import { NextRequest } from 'next/server';
import { ChatController } from '@/backend/controllers/chat.controller';

const chatController = new ChatController();

export async function POST(req: NextRequest) {
    return chatController.handleChatRequest(req);
}

export async function GET(req: NextRequest) {
    return chatController.handleGetModels(req);
}
