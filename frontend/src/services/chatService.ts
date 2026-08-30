import { ChatRequest, ChatResponse } from '../types/chat';
import { fetchApi, USE_MOCK_DATA } from './api';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let safetyLevel: "normal" | "caution" | "urgent" = "normal";
        let message = `Here is some general awareness information about your query regarding "${request.message}".`;
        
        const lowerMsg = request.message.toLowerCase();
        
        if (lowerMsg.includes('pain') || lowerMsg.includes('fever')) {
          safetyLevel = "caution";
          message = "You mentioned symptoms that might require attention. Please consult a healthcare professional for an accurate diagnosis.";
        }
        
        if (lowerMsg.includes('emergency') || lowerMsg.includes('heart') || lowerMsg.includes('bleeding')) {
          safetyLevel = "urgent";
          message = "If this is a medical emergency, please contact your local emergency services or visit the nearest hospital immediately.";
        }

        resolve({
          message,
          language: request.language,
          safetyLevel,
          sources: [
            { title: "Health Guidelines", url: "#" }
          ],
          suggestedActions: [
            { label: "Find nearby clinic", action: "find_resources" }
          ]
        });
      }, 1500); // Simulate network delay
    });
  }

  return fetchApi<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
