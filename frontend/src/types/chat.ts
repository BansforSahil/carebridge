export interface Source {
  title: string;
  url?: string;
}

export interface SuggestedAction {
  label: string;
  action: string;
}

export interface ChatRequest {
  message: string;
  language: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  language: string;
  safetyLevel: "normal" | "caution" | "urgent";
  sources?: Source[];
  suggestedActions?: SuggestedAction[];
}

export interface ChatMessageData {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  safetyLevel?: "normal" | "caution" | "urgent";
  sources?: Source[];
  isError?: boolean;
}
